chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.action === 'test' && request.url) {
        fetch(request.url)
            .then((response) => {
                const result = { code: 200, redirected: response.redirected };

                if (response.redirected) {
                    return callback({ ...result, url: response.url })
                }

                if (response.url.startsWith('http://t.co/') || response.url.startsWith('https://t.co/')) {
                    // console.log(response);
                    response.text()
                        .then(body => {
                            const match = body.match(/<title>(.+?)<\/title>/);
                            // console.log(body);

                            if (match && match[1]) {
                                return callback({ ...result, title: match[1] })
                            }

                            return callback({ code: 500, message: 'Failed to get title' });
                        })
                        .catch(error => {
                            console.error(error);
                            return callback({ code: 500, message: 'Failed to get body text' });
                        });
                } else {
                    return callback({ ...result, url: response.url });
                }
            })
            .catch(error => {
                console.error(error);
                return callback({ code: 500, message: 'Failed to fetch' });
            });
    } else if (request.action === 'storage' && request.key) {
        callback({ code: 200, value: localStorage[request.key] });
        return true;
    } else {
        console.log('Unexpected request: %j', request);
        callback({ code: 400, message: 'Unexpected request' });
    }
    return true;
});

const contextMenus = (() => {
    const items = {};
    chrome.contextMenus.onClicked.addListener((info, tab) => items[info.menuItemId].onclick(info, tab));

    return {
        register: (properties) => {
            const onclick = properties.onclick;
            properties.onclick = null;
            items[properties.id] = { onclick, properties: properties };

        },
        create: () => {
            Object.keys(items).forEach(key => chrome.contextMenus.create(items[key].properties));
        },
    };
})();

contextMenus.register({
    title: "Reload this page",
    id: 'reload',
    contexts: ["all"],
    type: "normal",
    onclick: (info, tab) => chrome.tabs.sendMessage(tab.id, { action: 'reload' }),
});

chrome.runtime.onInstalled.addListener(contextMenus.create);
