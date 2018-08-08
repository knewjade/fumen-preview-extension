declare module 'tippy.js' {
    interface Tip {
        loading: boolean;
    }

    interface Option {
        arrow: boolean;
        placement: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end';
        html: false | string | Element;
        onShow: (this: HTMLElement, instance: any) => void;
        onHidden: (this: HTMLElement, instance: any) => void;
        popperOptions: object;
    }

    const tippy: (selector: string | Element | NodeList, option?: Option) => Tip;
    export default tippy;
}
