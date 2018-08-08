import tippyJs from 'tippy.js';

declare const Error: any;

const tipElement = (id: string, innerHTML: string) => {
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    div.innerHTML = innerHTML;
    return div;
};

const fieldTd = (x: number, y: number) => {
    const td: HTMLTableDataCellElement = document.createElement('td');
    td.id = `fld${x}-${y}`;
    td.setAttribute('width', '16');
    td.setAttribute('height', '16');
    td.style.backgroundColor = '#000';
    return td;
};

const fieldTr = (y: number) => {
    const tr = document.createElement('tr');
    for (let x = 0; x < 10; x += 1) tr.appendChild(fieldTd(x, y));
    return tr;
};

const field = (maxY: number = 24) => {
    const table = document.createElement('table');
    table.setAttribute('border', '0');
    table.setAttribute('cellspacing', '1');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('bgcolor', '#333');
    const tBody = document.createElement('tBody');
    for (let y = 0; y < maxY; y += 1) {
        tBody.appendChild(fieldTr(y));
    }
    table.appendChild(tBody);
    return table;
};

// Create HTML element for tip
const tipId = 'tip-template';
const initialText = 'Loading a new image...';
const templateElement = tipElement(tipId, initialText);
document.body.appendChild(templateElement);

// Create tip
const elements = document.querySelectorAll('a');
const tip = tippyJs(elements, {
    arrow: true,
    placement: 'right',
    html: `#${tipId}`,
    onShow() {
        // `this` inside callbacks refers to the popper element
        const content = this.querySelector('.tippy-content');

        console.log(tip);
        if (!content) {
            throw new Error('null');
        }
        if (tip.loading || content.innerHTML !== initialText) return;

        tip.loading = true;

        setTimeout(() => {
            console.log('ok');
            content.appendChild(field());
            // content.innerHTML = '<div>test</div>';
            // console.log(field().innerHTML);
            console.log(content.innerHTML);
            tip.loading = false;
        }, 1000);

        // fetch('https://unsplash.it/200/?random').then(resp => resp.blob()).then(blob => {
        //     const url = URL.createObjectURL(blob);
        //     content.innerHTML = `<div>hello world</div>`;
        //     tip.loading = false;
        // }).catch(e => {
        //     content.innerHTML = 'Loading failed';
        //     tip.loading = false;
        // });
    },
    onHidden() {
        const content = this.querySelector('.tippy-content');
        if (!content) throw new Error('Not found tippy content element');
        content.innerHTML = initialText;
    },
    // prevent tooltip from displaying over button
    popperOptions: {
        modifiers: {
            preventOverflow: {
                enabled: false,
            },
            hide: {
                enabled: false,
            },
        },
    },
});
