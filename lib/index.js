"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _WordFilter = require("../standalone/WordFilter");

var _Styles = _interopRequireDefault(require("../standalone/Styles"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var StylesTool = (0, _Styles["default"])();
/*
    create a mock editor object, expected by plugin;
    must include style de/serializers
*/

var editor = {
  settings: {},
  dom: {
    parseStyle: StylesTool.parse,
    serializeStyle: StylesTool.serialize
  },
  getParam: function getParam(_key, defaultValue) {
    return defaultValue;
  }
};

function cleanWordHTML(content) {
  if (!(0, _WordFilter.isWordContent)(content)) {
    return content;
  }

  return (0, _WordFilter.preProcess)(editor, content);
}

var _default = cleanWordHTML;
exports["default"] = _default;