export interface StyleMap {
    [s: string]: string | number;
}
interface Styles {
    toHex(color: string): string;
    parse(css: string): Record<string, string>;
    serialize(styles: StyleMap, elementName?: string): string;
}
declare const Styles: (settings?: any) => Styles;
export default Styles;