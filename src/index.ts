import { preProcess, isWordContent } from '../standalone/WordFilter'
import Styles from '../standalone/Styles'

const StylesTool = Styles();

/*
    create a mock editor object, expected by plugin;
    must include style de/serializers
*/
const editor = {
    settings: {},
    dom: {
        parseStyle: StylesTool.parse,
        serializeStyle: StylesTool.serialize,
    },
    getParam: (_key: string, defaultValue: boolean) => defaultValue
};

function cleanWordHTML (content: string): string {
    if (!isWordContent(content)) {
        return content;
    }

    return preProcess(editor, content);
}

export default cleanWordHTML