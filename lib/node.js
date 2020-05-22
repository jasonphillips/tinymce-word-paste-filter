"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// node entrypoint, to avoid error if included without browser globals
var noop = function noop(content) {
  return content;
};

var main = noop;

if ((typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) === 'object') {
  main = require('./index')["default"];
}

var _default = main;
exports["default"] = _default;