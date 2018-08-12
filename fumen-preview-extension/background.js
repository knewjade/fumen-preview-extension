chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.action === 'test' && request.url) {
        fetch(request.url)
            .then((response) => {
                const result = { code: 200, redirected: response.redirected };

                if (response.redirected) {
                    return callback({ ...result, url: response.url })
                }

                response.text()
                    .then(body => {
                        const match = body.match(/<title>(.+?)<\/title>/);
                        console.log(body);

                        if (match && match[1]) {
                            return callback({ ...result, title: match[1] })
                        }

                        return callback({ code: 500, message: 'Failed to get title' });
                    })
                    .catch(error => {
                        console.error(error);
                        return callback({ code: 500, message: 'Failed to get body text' });
                    });
            })
            .catch(error => {
                console.error(error);
                return callback({ code: 500, message: 'Failed to fetch' });
            });
    } else {
        console.log('Unexpected request: %j', request);
        callback({ code: 400, message: 'Unexpected request' });
    }
    return true;
});

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: 'reload' });
});