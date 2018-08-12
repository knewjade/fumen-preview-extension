const load = () => {
    {
        const element = document.querySelector('#fumen-server-domains');
        const domains = localStorage['fumen-server-domains'];
        if (domains !== undefined) {
            element.value = domains.split(';').map(line => line.trim()).join('\n');
        } else {
            const domains = [
                'fumen.zui.jp',
                'harddrop.com/fumen',
                'punsyuko.com/fumen',
                '104.236.152.73/fumen',
            ];
            element.value = domains.join('\n');
        }
        M.textareaAutoResize(element);
    }

    {
        const element = document.querySelector('#url-shortener-domains');
        const domains = localStorage['url-shortener-domains'];
        if (domains !== undefined) {
            element.value = domains.split(';').map(line => line.trim()).join('\n');
        } else {
            const domains = [
                'tinyurl.com',
                't.co',
                'bit.ly',
                'goo.gl',
            ];
            element.value = domains.join('\n');
        }
        M.textareaAutoResize(element);
    }

    {
        const element = document.querySelector('#shortener');
        const shortener = localStorage['shortener'];
        if (shortener !== undefined) {
            element.checked = shortener.toLowerCase() === 'true';
        } else {
            element.checked = true;
        }
    }

    M.updateTextFields();
};

{
    const element = document.querySelector('#cancel');
    if (element !== undefined) element.addEventListener("click", () => load());
}

{
    const element = document.querySelector('#save');
    if (element !== undefined) element.addEventListener("click", () => {
        {
            const element = document.querySelector('#fumen-server-domains');
            localStorage['fumen-server-domains'] = element.value.split('\n').map(line => line.trim()).join(';');
        }

        {
            const element = document.querySelector('#url-shortener-domains');
            localStorage['url-shortener-domains'] = element.value.split('\n').map(line => line.trim()).join(';');
        }

        {
            const element = document.querySelector('#shortener');
            localStorage['shortener'] = element.checked;
        }
    });
}

load();