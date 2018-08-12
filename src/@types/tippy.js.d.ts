declare module 'tippy.js' {
    export interface Tip {
        loading: boolean;
        tooltips: Tooltip[];
    }

    export interface Tooltip {
        show: () => void;
    }

    export interface Option {
        arrow?: boolean;
        placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end';
        html?: false | string | Element;
        onShow?: (this: HTMLElement, instance: Instance) => void;
        onHide?: (this: HTMLElement, instance: Instance) => void;
        onHidden?: (this: HTMLElement, instance: Instance) => void;
        popperOptions?: object;
        interactive?: boolean;
    }

    export interface Instance {
        reference: Element;
    }

    const tippy: (selector: string | Element | NodeList | Node[], option?: Option) => Tip;
    export default tippy;
}
