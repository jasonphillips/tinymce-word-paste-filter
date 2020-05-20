import { preProcess, isWordContent } from '../standalone/WordFilter';
import Styles from '../standalone/Styles';
var StylesTool = Styles();
/*
    create a mock editor object, expected by plugin;
    must include style de/serializers
*/
var editor = {
    settings: {},
    dom: {
        parseStyle: StylesTool.parse,
        serializeStyle: StylesTool.serialize,
    },
    getParam: function (_key, defaultValue) { return defaultValue; }
};
function cleanWordHTML(content) {
    if (!isWordContent(content)) {
        return content;
    }
    return preProcess(editor, content);
}
export default cleanWordHTML;
//# sourceMappingURL=index.js.map