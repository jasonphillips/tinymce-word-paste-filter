'use strict';

var zeroWidth = '\uFEFF';

var keys = Object.keys;
var each = function (obj, f) {
  var props = keys(obj);
  for (var k = 0, len = props.length; k < len; k++) {
    var i = props[k];
    var x = obj[i];
    f(x, i);
  }
};

var toHex = function (match, r, g, b) {
  var hex = function (val) {
    val = parseInt(val, 10).toString(16);
    return val.length > 1 ? val : '0' + val;
  };
  return '#' + hex(r) + hex(g) + hex(b);
};
var Styles = function (settings, schema) {
  var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi;
  var urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi;
  var styleRegExp = /\s*([^:]+):\s*([^;]+);?/g;
  var trimRightRegExp = /\s+$/;
  var i;
  var encodingLookup = {};
  var encodingItems;
  var validStyles;
  var invalidStyles;
  var invisibleChar = zeroWidth;
  settings = settings || {};
  if (schema) {
    validStyles = schema.getValidStyles();
    invalidStyles = schema.getInvalidStyles();
  }
  encodingItems = ('\\" \\\' \\; \\: ; : ' + invisibleChar).split(' ');
  for (i = 0; i < encodingItems.length; i++) {
    encodingLookup[encodingItems[i]] = invisibleChar + i;
    encodingLookup[invisibleChar + i] = encodingItems[i];
  }
  return {
    toHex: function (color) {
      return color.replace(rgbRegExp, toHex);
    },
    parse: function (css) {
      var styles = {};
      var matches, name, value, isEncoded;
      var urlConverter = settings.url_converter;
      var urlConverterScope = settings.url_converter_scope || this;
      var compress = function (prefix, suffix, noJoin) {
        var top, right, bottom, left;
        top = styles[prefix + '-top' + suffix];
        if (!top) {
          return;
        }
        right = styles[prefix + '-right' + suffix];
        if (!right) {
          return;
        }
        bottom = styles[prefix + '-bottom' + suffix];
        if (!bottom) {
          return;
        }
        left = styles[prefix + '-left' + suffix];
        if (!left) {
          return;
        }
        var box = [
          top,
          right,
          bottom,
          left
        ];
        i = box.length - 1;
        while (i--) {
          if (box[i] !== box[i + 1]) {
            break;
          }
        }
        if (i > -1 && noJoin) {
          return;
        }
        styles[prefix + suffix] = i === -1 ? box[0] : box.join(' ');
        delete styles[prefix + '-top' + suffix];
        delete styles[prefix + '-right' + suffix];
        delete styles[prefix + '-bottom' + suffix];
        delete styles[prefix + '-left' + suffix];
      };
      var canCompress = function (key) {
        var value = styles[key], i;
        if (!value) {
          return;
        }
        value = value.split(' ');
        i = value.length;
        while (i--) {
          if (value[i] !== value[0]) {
            return false;
          }
        }
        styles[key] = value[0];
        return true;
      };
      var compress2 = function (target, a, b, c) {
        if (!canCompress(a)) {
          return;
        }
        if (!canCompress(b)) {
          return;
        }
        if (!canCompress(c)) {
          return;
        }
        styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
        delete styles[a];
        delete styles[b];
        delete styles[c];
      };
      var encode = function (str) {
        isEncoded = true;
        return encodingLookup[str];
      };
      var decode = function (str, keepSlashes) {
        if (isEncoded) {
          str = str.replace(/\uFEFF[0-9]/g, function (str) {
            return encodingLookup[str];
          });
        }
        if (!keepSlashes) {
          str = str.replace(/\\([\'\";:])/g, '$1');
        }
        return str;
      };
      var decodeSingleHexSequence = function (escSeq) {
        return String.fromCharCode(parseInt(escSeq.slice(1), 16));
      };
      var decodeHexSequences = function (value) {
        return value.replace(/\\[0-9a-f]+/gi, decodeSingleHexSequence);
      };
      var processUrl = function (match, url, url2, url3, str, str2) {
        str = str || str2;
        if (str) {
          str = decode(str);
          return '\'' + str.replace(/\'/g, '\\\'') + '\'';
        }
        url = decode(url || url2 || url3);
        if (!settings.allow_script_urls) {
          var scriptUrl = url.replace(/[\s\r\n]+/g, '');
          if (/(java|vb)script:/i.test(scriptUrl)) {
            return '';
          }
          if (!settings.allow_svg_data_urls && /^data:image\/svg/i.test(scriptUrl)) {
            return '';
          }
        }
        if (urlConverter) {
          url = urlConverter.call(urlConverterScope, url, 'style');
        }
        return 'url(\'' + url.replace(/\'/g, '\\\'') + '\')';
      };
      if (css) {
        css = css.replace(/[\u0000-\u001F]/g, '');
        css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function (str) {
          return str.replace(/[;:]/g, encode);
        });
        while (matches = styleRegExp.exec(css)) {
          styleRegExp.lastIndex = matches.index + matches[0].length;
          name = matches[1].replace(trimRightRegExp, '').toLowerCase();
          value = matches[2].replace(trimRightRegExp, '');
          if (name && value) {
            name = decodeHexSequences(name);
            value = decodeHexSequences(value);
            if (name.indexOf(invisibleChar) !== -1 || name.indexOf('"') !== -1) {
              continue;
            }
            if (!settings.allow_script_urls && (name === 'behavior' || /expression\s*\(|\/\*|\*\//.test(value))) {
              continue;
            }
            if (name === 'font-weight' && value === '700') {
              value = 'bold';
            } else if (name === 'color' || name === 'background-color') {
              value = value.toLowerCase();
            }
            value = value.replace(rgbRegExp, toHex);
            value = value.replace(urlOrStrRegExp, processUrl);
            styles[name] = isEncoded ? decode(value, true) : value;
          }
        }
        compress('border', '', true);
        compress('border', '-width');
        compress('border', '-color');
        compress('border', '-style');
        compress('padding', '');
        compress('margin', '');
        compress2('border', 'border-width', 'border-style', 'border-color');
        if (styles.border === 'medium none') {
          delete styles.border;
        }
        if (styles['border-image'] === 'none') {
          delete styles['border-image'];
        }
      }
      return styles;
    },
    serialize: function (styles, elementName) {
      var css = '';
      var serializeStyles = function (name) {
        var styleList, i, l, value;
        styleList = validStyles[name];
        if (styleList) {
          for (i = 0, l = styleList.length; i < l; i++) {
            name = styleList[i];
            value = styles[name];
            if (value) {
              css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
            }
          }
        }
      };
      var isValid = function (name, elementName) {
        var styleMap = invalidStyles['*'];
        if (styleMap && styleMap[name]) {
          return false;
        }
        styleMap = invalidStyles[elementName];
        return !(styleMap && styleMap[name]);
      };
      if (elementName && validStyles) {
        serializeStyles('*');
        serializeStyles(elementName);
      } else {
        each(styles, function (value, name) {
          if (value && (!invalidStyles || isValid(name, elementName))) {
            css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
          }
        });
      }
      return css;
    }
  };
};

module.exports = Styles;
