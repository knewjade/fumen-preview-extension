import tippyJs, { Instance, Tip } from 'tippy.js';
import { ViewError } from './errors';
import { decode, extract, Move } from './fumen/fumen';
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

const fieldGenerator = (fieldObj: Field, comment?: { text: string, update: boolean }, height: number = 23) => {
    const isFilled = (field: Field, y: number) => {
        for (let x = 0; x < 10; x += 1) {
            if (field.get(x, y) === Piece.Empty) return false;
        }
        return true;
    };

    const color = (piece: Piece, y: number, isHighlight: boolean) => {
        if (piece !== Piece.Empty) {
            return isHighlight ? getHighlightColor(piece) : getNormalColor(piece);
        }
        return y < 20 ? '#000' : '#333';
    };

    const fieldTd = (x: number, y: number, isHighlight: boolean) => {
        const td: HTMLTableDataCellElement = document.createElement('td');
        td.className = 'preview-field';
        td.id = `fld${x}-${y}`;
        td.setAttribute('width', '16');
        td.setAttribute('height', y < 22 ? '16' : '8');
        td.setAttribute('x', x + '');

        const piece = fieldObj.get(x, y);
        td.style.backgroundColor = color(piece, y, isHighlight);

        return td;
    };

    const fieldTr = (y: number) => {
        const tr = document.createElement('tr');
        for (let x = 0; x < 10; x += 1) {
            const highlight = isFilled(fieldObj, y);
            tr.appendChild(fieldTd(x, y, highlight));
        }
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

    const div = document.createElement('div');
    const table = fieldTable(height);
    div.appendChild(table);

    if (comment) {
        const input = document.createElement('text');
        input.setAttribute('type', 'text');
        input.style.color = comment.update ? '#080' : '#fff';
        input.setAttribute('width', '100%');
        input.style.textAlign = 'center';
        input.innerText = comment.text;
        div.appendChild(input);
    }

    return div;
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

            const fields: { field: Field, comment: string }[] = [];
            let isComment = false;
            let maxHeight = 1;
            const callback = (field: Field, move: Move | undefined, comment: string) => {
                if (move !== undefined) field.put(move);
                fields.push({ field, comment });

                isComment = isComment || comment !== '';

                const pieces = field.toPlayFieldPieces();
                const index = pieces.reverse().findIndex(piece => piece !== Piece.Empty);
                const height = 0 <= index ? 23 - Math.floor(index / 10) : 1;
                if (maxHeight < height) maxHeight = height;
            };

            decode(fumen, callback)
                .then(() => {
                    if (updateTime === latestTimeOnShow) {
                        let index = 0;

                        const back = () => {
                            if (0 < index) {
                                tip.loading = true;
                                index -= 1;
                                const { field, comment } = fields[index];
                                const nextComment = fields[index + 1].comment;
                                show(field, isComment ? { text: comment, update: comment !== nextComment } : undefined);
                                tip.loading = false;
                            }
                        };

                        const preview = () => {
                            if (index < fields.length - 1) {
                                tip.loading = true;
                                index += 1;
                                const prevComment = fields[index - 1].comment;
                                const { field, comment } = fields[index];
                                show(field, isComment ? { text: comment, update: comment !== prevComment } : undefined);
                                tip.loading = false;
                            }
                        };

                        const show = (field: Field, comment?: { text: string, update: boolean }) => {
                            const generator = fieldGenerator(field, comment, maxHeight);
                            content.innerHTML = generator.innerHTML;

                            const elements = document.querySelectorAll('.preview-field');
                            elements.forEach((element) => {
                                element.addEventListener('mousedown', (evt) => {
                                    const target = evt.target as Element;
                                    const x = Number(target.getAttribute('x'));
                                    if (x < 5) {
                                        back();
                                    } else {
                                        preview();
                                    }
                                });
                            });
                        };

                        {
                            const { field, comment } = fields[index];
                            show(field, isComment ? { text: comment, update: true } : undefined);
                            tip.loading = false;
                        }
                    }
                })
                .catch((error) => {
                    if (updateTime === latestTimeOnShow) {
                        content.innerHTML = `<div>${error.message}</div>`;
                        tip.loading = false;
                    }
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
    interactive: true,
});
