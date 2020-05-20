import { StyleMap } from './Styles'
export interface Editor {
  settings: Object,
  dom: {
      parseStyle: (css: string) => Record<string, string>;
      serializeStyle: (styles: StyleMap, elementName?: string) => string;
  };
  getParam: (_key: string, defaultValue: boolean) => boolean;
}
declare function isWordContent(content: string): boolean;
declare const preProcess: (editor: Editor, content: any) => any;
export { preProcess, isWordContent };
