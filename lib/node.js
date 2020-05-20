// node entrypoint, to avoid error if included without browser globals
var noop = function (content) { return content; };
var main = noop;
if (typeof (navigator) === 'object') {
    main = require('./index').default;
}
export default main;
//# sourceMappingURL=node.js.map