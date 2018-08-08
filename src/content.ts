import tippyJs, { Instance, Tip } from 'tippy.js';
import { ViewError } from './errors';
import { decode, extract } from './fumen/fumen';
import { Field } from './fumen/field';
import { Piece } from './enums';
import { getHighlightColor, getNormalColor } from './colors';

const tipElement = (id: string, innerHTML: string) => {
    const div = document.createElement('div');
    div.id = id;
    div.style.display = 'none';
    div.innerHTML = innerHTML;
    return div;
};

const fieldGenerator = (fieldObj: Field) => {
    const fieldTd = (x: number, y: number, isHighlight: boolean) => {
        const td: HTMLTableDataCellElement = document.createElement('td');
        td.id = `fld${x}-${y}`;
        td.setAttribute('width', '16');
        td.setAttribute('height', y < 22 ? '16' : '8');

        const piece = fieldObj.get(x, y);
        if (piece !== Piece.Empty) {
            td.style.backgroundColor = isHighlight ? getHighlightColor(piece) : getNormalColor(piece);
        } else {
            td.style.backgroundColor = y < 20 ? '#000' : '#333';
        }

        return td;
    };

    const fieldTr = (y: number) => {
        const tr = document.createElement('tr');

        const isFilled = (() => {
            for (let x = 0; x < 10; x += 1) {
                if (fieldObj.get(x, y) === Piece.Empty) return false;
            }
            return true;
        })();

        for (let x = 0; x < 10; x += 1) tr.appendChild(fieldTd(x, y, isFilled));
        return tr;
    };

    const fieldTable = (maxY: number = 23) => {
        const table = document.createElement('table');
        table.setAttribute('border', '0');
        table.setAttribute('cellspacing', '1');
        table.setAttribute('cellpadding', '0');
        table.setAttribute('bgcolor', '#333');
        table.setAttribute('bordercolor', '#333');
        table.style.backgroundColor = '#333';

        const tBody = document.createElement('tBody');
        for (let y = maxY - 1; 0 <= y; y -= 1) {
            tBody.appendChild(fieldTr(y));
        }
        table.appendChild(tBody);
        return table;
    };

    const field = (maxY: number = 23) => {
        const div = document.createElement('div');
        const table = fieldTable(maxY);
        div.appendChild(table);
        return div;
    };

    return field;
};


// Create HTML element for tip
const tipId = 'tip-template';
const initialText = 'Loading a new image...';
const templateElement = tipElement(tipId, initialText);
document.body.appendChild(templateElement);

function isHTMLAnchorElement(element: Element): element is HTMLAnchorElement {
    const cast = element as HTMLAnchorElement;
    return cast.href !== undefined;
}

// Create callback object
const callbacks = (() => {
    let latestTimeOnShow: number = 0;

    return {
        onShow: (tip: Tip, content: Element, url?: string) => {
            const updateTime = Date.now();
            latestTimeOnShow = updateTime;

            tip.loading = true;

            if (url === undefined) {
                content.innerHTML = `<div>Not found url</div>`;
                tip.loading = false;
                return;
            }

            const fumen = extract(decodeURIComponent(url));
            console.log(fumen);

            decode(fumen)
                .then((value) => {
                    if (updateTime === latestTimeOnShow) {
                        const element = value[0];
                        const fieldObj = element.field.obj;
                        if (!fieldObj) throw new ViewError('Not found field object');
                        const generator = fieldGenerator(fieldObj);
                        console.log(value);
                        // console.log('ok');
                        // content.innerHTML = 'OK';
                        // content.appendChild(field());
                        content.innerHTML = generator().innerHTML;
                        // console.log(field().innerHTML);
                        tip.loading = false;
                    }
                })
                .catch((error) => {
                    if (updateTime === latestTimeOnShow) {
                        content.innerHTML = `<div>${error.message}</div>`;
                        tip.loading = false;
                    }
                });

            setImmediate(() => {

            });
        },
        onHidden: (tip: Tip, content: Element) => {
            if (latestTimeOnShow <= Date.now()) content.innerHTML = initialText;
        },
    };
})();

// Create tip
const aElements: HTMLAnchorElement[] = [];
document.querySelectorAll('a').forEach(value => aElements.push(value));

const isFumen = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith('http://fumen.zui.jp/');
};

const elements = aElements.filter(element => isFumen(element.href));

const tip: Tip = tippyJs(elements, {
    arrow: true,
    placement: 'right',
    html: `#${tipId}`,
    onShow(instances: Instance) {
        // `this` inside callbacks refers to the popper element
        const content = this.querySelector('.tippy-content');
        if (!content) throw new ViewError('Cannot get tippy content');

        const reference = instances.reference;
        if (!isHTMLAnchorElement(reference)) throw new ViewError('Unexpected element');

        callbacks.onShow(tip, content, reference.href);
    },
    onHidden() {
        // `this` inside callbacks refers to the popper element
        const content = this.querySelector('.tippy-content');
        if (!content) throw new ViewError('Cannot get tippy content');

        callbacks.onHidden(tip, content);
    },
    // prevent tooltip from displaying over button
    // popperOptions: {
    //     modifiers: {
    //         preventOverflow: {
    //             enabled: false,
    //         },
    //         hide: {
    //             enabled: false,
    //         },
    //     },
    // },
});
