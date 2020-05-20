'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var noop = function () {
};
var constant = function (value) {
  return function () {
    return value;
  };
};
var never = constant(false);
var always = constant(true);

var none = function () {
  return NONE;
};
var NONE = function () {
  var eq = function (o) {
    return o.isNone();
  };
  var call = function (thunk) {
    return thunk();
  };
  var id = function (n) {
    return n;
  };
  var me = {
    fold: function (n, _s) {
      return n();
    },
    is: never,
    isSome: never,
    isNone: always,
    getOr: id,
    getOrThunk: call,
    getOrDie: function (msg) {
      throw new Error(msg || 'error: getOrDie called on none.');
    },
    getOrNull: constant(null),
    getOrUndefined: constant(undefined),
    or: id,
    orThunk: call,
    map: none,
    each: noop,
    bind: none,
    exists: never,
    forall: always,
    filter: none,
    equals: eq,
    equals_: eq,
    toArray: function () {
      return [];
    },
    toString: constant('none()')
  };
  return me;
}();
var some = function (a) {
  var constant_a = constant(a);
  var self = function () {
    return me;
  };
  var bind = function (f) {
    return f(a);
  };
  var me = {
    fold: function (n, s) {
      return s(a);
    },
    is: function (v) {
      return a === v;
    },
    isSome: always,
    isNone: never,
    getOr: constant_a,
    getOrThunk: constant_a,
    getOrDie: constant_a,
    getOrNull: constant_a,
    getOrUndefined: constant_a,
    or: self,
    orThunk: self,
    map: function (f) {
      return some(f(a));
    },
    each: function (f) {
      f(a);
    },
    bind: bind,
    exists: bind,
    forall: bind,
    filter: function (f) {
      return f(a) ? me : NONE;
    },
    toArray: function () {
      return [a];
    },
    toString: function () {
      return 'some(' + a + ')';
    },
    equals: function (o) {
      return o.is(a);
    },
    equals_: function (o, elementEq) {
      return o.fold(never, function (b) {
        return elementEq(a, b);
      });
    }
  };
  return me;
};
var from = function (value) {
  return value === null || value === undefined ? NONE : some(value);
};
var Option = {
  some: some,
  none: none,
  from: from
};

var each = function (xs, f) {
  for (var i = 0, len = xs.length; i < len; i++) {
    var x = xs[i];
    f(x, i);
  }
};
var findUntil = function (xs, pred, until) {
  for (var i = 0, len = xs.length; i < len; i++) {
    var x = xs[i];
    if (pred(x, i)) {
      return Option.some(x);
    } else if (until(x, i)) {
      break;
    }
  }
  return Option.none();
};
var find = function (xs, pred) {
  return findUntil(xs, pred, never);
};

var zeroWidth = '\uFEFF';
var nbsp = '\xA0';

var keys = Object.keys;
var hasOwnProperty = Object.hasOwnProperty;
var each$1 = function (obj, f) {
  var props = keys(obj);
  for (var k = 0, len = props.length; k < len; k++) {
    var i = props[k];
    var x = obj[i];
    f(x, i);
  }
};
var get = function (obj, key) {
  return has(obj, key) ? Option.from(obj[key]) : Option.none();
};
var has = function (obj, key) {
  return hasOwnProperty.call(obj, key);
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
        each$1(styles, function (value, name) {
          if (value && (!invalidStyles || isValid(name, elementName))) {
            css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
          }
        });
      }
      return css;
    }
  };
};

var Blob$1 = window['Blob'];
var URL$1 = window['URL'];
var document$1 = window['document'];
var navigator$1 = window['navigator'];
var window$1 = window['window'];
var setTimeout$1 = window['setTimeout'];
var setImmediate$1 = window['setImmediate'];
var console$1 = window['console'];
var atob$1 = window['atob'];

var cached = function (f) {
  var called = false;
  var r;
  return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};

var firstMatch = function (regexes, s) {
  for (var i = 0; i < regexes.length; i++) {
    var x = regexes[i];
    if (x.test(s)) {
      return x;
    }
  }
  return undefined;
};
var find$1 = function (regexes, agent) {
  var r = firstMatch(regexes, agent);
  if (!r) {
    return {
      major: 0,
      minor: 0
    };
  }
  var group = function (i) {
    return Number(agent.replace(r, '$' + i));
  };
  return nu(group(1), group(2));
};
var detect = function (versionRegexes, agent) {
  var cleanedAgent = String(agent).toLowerCase();
  if (versionRegexes.length === 0) {
    return unknown();
  }
  return find$1(versionRegexes, cleanedAgent);
};
var unknown = function () {
  return nu(0, 0);
};
var nu = function (major, minor) {
  return {
    major: major,
    minor: minor
  };
};
var Version = {
  nu: nu,
  detect: detect,
  unknown: unknown
};

var edge = 'Edge';
var chrome = 'Chrome';
var ie = 'IE';
var opera = 'Opera';
var firefox = 'Firefox';
var safari = 'Safari';
var unknown$1 = function () {
  return nu$1({
    current: undefined,
    version: Version.unknown()
  });
};
var nu$1 = function (info) {
  var current = info.current;
  var version = info.version;
  var isBrowser = function (name) {
    return function () {
      return current === name;
    };
  };
  return {
    current: current,
    version: version,
    isEdge: isBrowser(edge),
    isChrome: isBrowser(chrome),
    isIE: isBrowser(ie),
    isOpera: isBrowser(opera),
    isFirefox: isBrowser(firefox),
    isSafari: isBrowser(safari)
  };
};
var Browser = {
  unknown: unknown$1,
  nu: nu$1,
  edge: constant(edge),
  chrome: constant(chrome),
  ie: constant(ie),
  opera: constant(opera),
  firefox: constant(firefox),
  safari: constant(safari)
};

var windows = 'Windows';
var ios = 'iOS';
var android = 'Android';
var linux = 'Linux';
var osx = 'OSX';
var solaris = 'Solaris';
var freebsd = 'FreeBSD';
var chromeos = 'ChromeOS';
var unknown$2 = function () {
  return nu$2({
    current: undefined,
    version: Version.unknown()
  });
};
var nu$2 = function (info) {
  var current = info.current;
  var version = info.version;
  var isOS = function (name) {
    return function () {
      return current === name;
    };
  };
  return {
    current: current,
    version: version,
    isWindows: isOS(windows),
    isiOS: isOS(ios),
    isAndroid: isOS(android),
    isOSX: isOS(osx),
    isLinux: isOS(linux),
    isSolaris: isOS(solaris),
    isFreeBSD: isOS(freebsd),
    isChromeOS: isOS(chromeos)
  };
};
var OperatingSystem = {
  unknown: unknown$2,
  nu: nu$2,
  windows: constant(windows),
  ios: constant(ios),
  android: constant(android),
  linux: constant(linux),
  osx: constant(osx),
  solaris: constant(solaris),
  freebsd: constant(freebsd),
  chromeos: constant(chromeos)
};

var DeviceType = function (os, browser, userAgent, mediaMatch) {
  var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
  var isiPhone = os.isiOS() && !isiPad;
  var isMobile = os.isiOS() || os.isAndroid();
  var isTouch = isMobile || mediaMatch('(pointer:coarse)');
  var isTablet = isiPad || !isiPhone && isMobile && mediaMatch('(min-device-width:768px)');
  var isPhone = isiPhone || isMobile && !isTablet;
  var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
  var isDesktop = !isPhone && !isTablet && !iOSwebview;
  return {
    isiPad: constant(isiPad),
    isiPhone: constant(isiPhone),
    isTablet: constant(isTablet),
    isPhone: constant(isPhone),
    isTouch: constant(isTouch),
    isAndroid: os.isAndroid,
    isiOS: os.isiOS,
    isWebView: constant(iOSwebview),
    isDesktop: constant(isDesktop)
  };
};

var detect$1 = function (candidates, userAgent) {
  var agent = String(userAgent).toLowerCase();
  return find(candidates, function (candidate) {
    return candidate.search(agent);
  });
};
var detectBrowser = function (browsers, userAgent) {
  return detect$1(browsers, userAgent).map(function (browser) {
    var version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version: version
    };
  });
};
var detectOs = function (oses, userAgent) {
  return detect$1(oses, userAgent).map(function (os) {
    var version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version: version
    };
  });
};
var UaString = {
  detectBrowser: detectBrowser,
  detectOs: detectOs
};

var checkRange = function (str, substr, start) {
  return substr === '' || str.length >= substr.length && str.substr(start, start + substr.length) === substr;
};
var contains = function (str, substr) {
  return str.indexOf(substr) !== -1;
};
var startsWith = function (str, prefix) {
  return checkRange(str, prefix, 0);
};

var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
var checkContains = function (target) {
  return function (uastring) {
    return contains(uastring, target);
  };
};
var browsers = [
  {
    name: 'Edge',
    versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
    search: function (uastring) {
      return contains(uastring, 'edge/') && contains(uastring, 'chrome') && contains(uastring, 'safari') && contains(uastring, 'applewebkit');
    }
  },
  {
    name: 'Chrome',
    versionRegexes: [
      /.*?chrome\/([0-9]+)\.([0-9]+).*/,
      normalVersionRegex
    ],
    search: function (uastring) {
      return contains(uastring, 'chrome') && !contains(uastring, 'chromeframe');
    }
  },
  {
    name: 'IE',
    versionRegexes: [
      /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
      /.*?rv:([0-9]+)\.([0-9]+).*/
    ],
    search: function (uastring) {
      return contains(uastring, 'msie') || contains(uastring, 'trident');
    }
  },
  {
    name: 'Opera',
    versionRegexes: [
      normalVersionRegex,
      /.*?opera\/([0-9]+)\.([0-9]+).*/
    ],
    search: checkContains('opera')
  },
  {
    name: 'Firefox',
    versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
    search: checkContains('firefox')
  },
  {
    name: 'Safari',
    versionRegexes: [
      normalVersionRegex,
      /.*?cpu os ([0-9]+)_([0-9]+).*/
    ],
    search: function (uastring) {
      return (contains(uastring, 'safari') || contains(uastring, 'mobile/')) && contains(uastring, 'applewebkit');
    }
  }
];
var oses = [
  {
    name: 'Windows',
    search: checkContains('win'),
    versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
  },
  {
    name: 'iOS',
    search: function (uastring) {
      return contains(uastring, 'iphone') || contains(uastring, 'ipad');
    },
    versionRegexes: [
      /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
      /.*cpu os ([0-9]+)_([0-9]+).*/,
      /.*cpu iphone os ([0-9]+)_([0-9]+).*/
    ]
  },
  {
    name: 'Android',
    search: checkContains('android'),
    versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
  },
  {
    name: 'OSX',
    search: checkContains('mac os x'),
    versionRegexes: [/.*?mac\ os\ x\ ?([0-9]+)_([0-9]+).*/]
  },
  {
    name: 'Linux',
    search: checkContains('linux'),
    versionRegexes: []
  },
  {
    name: 'Solaris',
    search: checkContains('sunos'),
    versionRegexes: []
  },
  {
    name: 'FreeBSD',
    search: checkContains('freebsd'),
    versionRegexes: []
  },
  {
    name: 'ChromeOS',
    search: checkContains('cros'),
    versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/]
  }
];
var PlatformInfo = {
  browsers: constant(browsers),
  oses: constant(oses)
};

var detect$2 = function (userAgent, mediaMatch) {
  var browsers = PlatformInfo.browsers();
  var oses = PlatformInfo.oses();
  var browser = UaString.detectBrowser(browsers, userAgent).fold(Browser.unknown, Browser.nu);
  var os = UaString.detectOs(oses, userAgent).fold(OperatingSystem.unknown, OperatingSystem.nu);
  var deviceType = DeviceType(os, browser, userAgent, mediaMatch);
  return {
    browser: browser,
    os: os,
    deviceType: deviceType
  };
};
var PlatformDetection = { detect: detect$2 };

var mediaMatch = function (query) {
  return window$1.matchMedia(query).matches;
};
var platform = cached(function () {
  return PlatformDetection.detect(navigator$1.userAgent, mediaMatch);
});
var detect$3 = function () {
  return platform();
};

var userAgent = navigator$1.userAgent;
var platform$1 = detect$3();
var browser = platform$1.browser;
var os = platform$1.os;
var deviceType = platform$1.deviceType;
var webkit = /WebKit/.test(userAgent) && !browser.isEdge();
var fileApi = 'FormData' in window$1 && 'FileReader' in window$1 && 'URL' in window$1 && !!URL$1.createObjectURL;
var windowsPhone = userAgent.indexOf('Windows Phone') !== -1;
var Env = {
  opera: browser.isOpera(),
  webkit: webkit,
  ie: browser.isIE() || browser.isEdge() ? browser.version.major : false,
  gecko: browser.isFirefox(),
  mac: os.isOSX() || os.isiOS(),
  iOS: deviceType.isiPad() || deviceType.isiPhone(),
  android: os.isAndroid(),
  contentEditable: true,
  transparentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  caretAfter: true,
  range: window$1.getSelection && 'Range' in window$1,
  documentMode: browser.isIE() ? document$1.documentMode || 7 : 10,
  fileApi: fileApi,
  ceFalse: true,
  cacheSuffix: null,
  container: null,
  experimentalShadowDom: false,
  canHaveCSP: !browser.isIE(),
  desktop: deviceType.isDesktop(),
  windowsPhone: windowsPhone,
  browser: {
    current: browser.current,
    version: browser.version,
    isChrome: browser.isChrome,
    isEdge: browser.isEdge,
    isFirefox: browser.isFirefox,
    isIE: browser.isIE,
    isOpera: browser.isOpera,
    isSafari: browser.isSafari
  },
  os: {
    current: os.current,
    version: os.version,
    isAndroid: os.isAndroid,
    isChromeOS: os.isChromeOS,
    isFreeBSD: os.isFreeBSD,
    isiOS: os.isiOS,
    isLinux: os.isLinux,
    isOSX: os.isOSX,
    isSolaris: os.isSolaris,
    isWindows: os.isWindows
  },
  deviceType: {
    isDesktop: deviceType.isDesktop,
    isiPad: deviceType.isiPad,
    isiPhone: deviceType.isiPhone,
    isPhone: deviceType.isPhone,
    isTablet: deviceType.isTablet,
    isTouch: deviceType.isTouch,
    isWebView: deviceType.isWebView
  }
};

var isArray = Array.isArray;
var toArray = function (obj) {
  var array = obj, i, l;
  if (!isArray(obj)) {
    array = [];
    for (i = 0, l = obj.length; i < l; i++) {
      array[i] = obj[i];
    }
  }
  return array;
};
var each$2 = function (o, cb, s) {
  var n, l;
  if (!o) {
    return 0;
  }
  s = s || o;
  if (o.length !== undefined) {
    for (n = 0, l = o.length; n < l; n++) {
      if (cb.call(s, o[n], n, o) === false) {
        return 0;
      }
    }
  } else {
    for (n in o) {
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false) {
          return 0;
        }
      }
    }
  }
  return 1;
};
var map = function (array, callback) {
  var out = [];
  each$2(array, function (item, index) {
    out.push(callback(item, index, array));
  });
  return out;
};
var filter = function (a, f) {
  var o = [];
  each$2(a, function (v, index) {
    if (!f || f(v, index, a)) {
      o.push(v);
    }
  });
  return o;
};
var indexOf = function (a, v) {
  var i, l;
  if (a) {
    for (i = 0, l = a.length; i < l; i++) {
      if (a[i] === v) {
        return i;
      }
    }
  }
  return -1;
};

var whiteSpaceRegExp = /^\s*|\s*$/g;
var trim = function (str) {
  return str === null || str === undefined ? '' : ('' + str).replace(whiteSpaceRegExp, '');
};
var is = function (obj, type) {
  if (!type) {
    return obj !== undefined;
  }
  if (type === 'array' && isArray(obj)) {
    return true;
  }
  return typeof obj === type;
};
var makeMap = function (items, delim, map) {
  var i;
  items = items || [];
  delim = delim || ',';
  if (typeof items === 'string') {
    items = items.split(delim);
  }
  map = map || {};
  i = items.length;
  while (i--) {
    map[items[i]] = {};
  }
  return map;
};
var hasOwnProperty$1 = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
var create = function (s, p, root) {
  var self = this;
  var sp, ns, cn, scn, c, de = 0;
  s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
  cn = s[3].match(/(^|\.)(\w+)$/i)[2];
  ns = self.createNS(s[3].replace(/\.\w+$/, ''), root);
  if (ns[cn]) {
    return;
  }
  if (s[2] === 'static') {
    ns[cn] = p;
    if (this.onCreate) {
      this.onCreate(s[2], s[3], ns[cn]);
    }
    return;
  }
  if (!p[cn]) {
    p[cn] = function () {
    };
    de = 1;
  }
  ns[cn] = p[cn];
  self.extend(ns[cn].prototype, p);
  if (s[5]) {
    sp = self.resolve(s[5]).prototype;
    scn = s[5].match(/\.(\w+)$/i)[1];
    c = ns[cn];
    if (de) {
      ns[cn] = function () {
        return sp[scn].apply(this, arguments);
      };
    } else {
      ns[cn] = function () {
        this.parent = sp[scn];
        return c.apply(this, arguments);
      };
    }
    ns[cn].prototype[cn] = ns[cn];
    self.each(sp, function (f, n) {
      ns[cn].prototype[n] = sp[n];
    });
    self.each(p, function (f, n) {
      if (sp[n]) {
        ns[cn].prototype[n] = function () {
          this.parent = sp[n];
          return f.apply(this, arguments);
        };
      } else {
        if (n !== cn) {
          ns[cn].prototype[n] = f;
        }
      }
    });
  }
  self.each(p.static, function (f, n) {
    ns[cn][n] = f;
  });
};
var extend = function (obj) {
  var exts = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    exts[_i - 1] = arguments[_i];
  }
  for (var i = 0; i < exts.length; i++) {
    var ext = exts[i];
    for (var name_1 in ext) {
      if (ext.hasOwnProperty(name_1)) {
        var value = ext[name_1];
        if (value !== undefined) {
          obj[name_1] = value;
        }
      }
    }
  }
  return obj;
};
var walk = function (o, f, n, s) {
  s = s || this;
  if (o) {
    if (n) {
      o = o[n];
    }
    each$2(o, function (o, i) {
      if (f.call(s, o, i, n) === false) {
        return false;
      }
      walk(o, f, n, s);
    });
  }
};
var createNS = function (n, o) {
  var i, v;
  o = o || window$1;
  n = n.split('.');
  for (i = 0; i < n.length; i++) {
    v = n[i];
    if (!o[v]) {
      o[v] = {};
    }
    o = o[v];
  }
  return o;
};
var resolve = function (n, o) {
  var i, l;
  o = o || window$1;
  n = n.split('.');
  for (i = 0, l = n.length; i < l; i++) {
    o = o[n[i]];
    if (!o) {
      break;
    }
  }
  return o;
};
var explode = function (s, d) {
  if (!s || is(s, 'array')) {
    return s;
  }
  return map(s.split(d || ','), trim);
};
var _addCacheSuffix = function (url) {
  return url;
};
var Tools = {
  trim: trim,
  isArray: isArray,
  is: is,
  toArray: toArray,
  makeMap: makeMap,
  each: each$2,
  map: map,
  grep: filter,
  inArray: indexOf,
  hasOwn: hasOwnProperty$1,
  extend: extend,
  create: create,
  walk: walk,
  createNS: createNS,
  resolve: resolve,
  explode: explode,
  _addCacheSuffix: _addCacheSuffix
};

var removeAttrs = function (node, names) {
  each(names, function (name) {
    node.attr(name, null);
  });
};
var addFontToSpansFilter = function (domParser, styles, fontSizes) {
  domParser.addNodeFilter('font', function (nodes) {
    each(nodes, function (node) {
      var props = styles.parse(node.attr('style'));
      var color = node.attr('color');
      var face = node.attr('face');
      var size = node.attr('size');
      if (color) {
        props.color = color;
      }
      if (face) {
        props['font-family'] = face;
      }
      if (size) {
        props['font-size'] = fontSizes[parseInt(node.attr('size'), 10) - 1];
      }
      node.name = 'span';
      node.attr('style', styles.serialize(props));
      removeAttrs(node, [
        'color',
        'face',
        'size'
      ]);
    });
  });
};
var addStrikeToSpanFilter = function (domParser, styles) {
  domParser.addNodeFilter('strike', function (nodes) {
    each(nodes, function (node) {
      var props = styles.parse(node.attr('style'));
      props['text-decoration'] = 'line-through';
      node.name = 'span';
      node.attr('style', styles.serialize(props));
    });
  });
};
var addFilters = function (domParser, settings) {
  var styles = Styles();
  if (settings.convert_fonts_to_spans) {
    addFontToSpansFilter(domParser, styles, Tools.explode(settings.font_size_legacy_values));
  }
  addStrikeToSpanFilter(domParser, styles);
};
var register = function (domParser, settings) {
  if (settings.inline_styles) {
    addFilters(domParser, settings);
  }
};

var whiteSpaceRegExp$1 = /^[ \t\r\n]*$/;
var typeLookup = {
  '#text': 3,
  '#comment': 8,
  '#cdata': 4,
  '#pi': 7,
  '#doctype': 10,
  '#document-fragment': 11
};
var walk$1 = function (node, root, prev) {
  var startName = prev ? 'lastChild' : 'firstChild';
  var siblingName = prev ? 'prev' : 'next';
  if (node[startName]) {
    return node[startName];
  }
  if (node !== root) {
    var sibling = node[siblingName];
    if (sibling) {
      return sibling;
    }
    for (var parent_1 = node.parent; parent_1 && parent_1 !== root; parent_1 = parent_1.parent) {
      sibling = parent_1[siblingName];
      if (sibling) {
        return sibling;
      }
    }
  }
};
var isEmptyTextNode = function (node) {
  if (!whiteSpaceRegExp$1.test(node.value)) {
    return false;
  }
  var parentNode = node.parent;
  if (parentNode && (parentNode.name !== 'span' || parentNode.attr('style')) && /^[ ]+$/.test(node.value)) {
    return false;
  }
  return true;
};
var isNonEmptyElement = function (node) {
  var isNamedAnchor = node.name === 'a' && !node.attr('href') && node.attr('id');
  return node.attr('name') || node.attr('id') && !node.firstChild || node.attr('data-mce-bookmark') || isNamedAnchor;
};
var Node = function () {
  function Node(name, type) {
    this.name = name;
    this.type = type;
    if (type === 1) {
      this.attributes = [];
      this.attributes.map = {};
    }
  }
  Node.create = function (name, attrs) {
    var node = new Node(name, typeLookup[name] || 1);
    if (attrs) {
      each$1(attrs, function (value, attrName) {
        node.attr(attrName, value);
      });
    }
    return node;
  };
  Node.prototype.replace = function (node) {
    var self = this;
    if (node.parent) {
      node.remove();
    }
    self.insert(node, self);
    self.remove();
    return self;
  };
  Node.prototype.attr = function (name, value) {
    var self = this;
    var attrs;
    if (typeof name !== 'string') {
      if (name !== undefined && name !== null) {
        each$1(name, function (value, key) {
          self.attr(key, value);
        });
      }
      return self;
    }
    if (attrs = self.attributes) {
      if (value !== undefined) {
        if (value === null) {
          if (name in attrs.map) {
            delete attrs.map[name];
            var i = attrs.length;
            while (i--) {
              if (attrs[i].name === name) {
                attrs.splice(i, 1);
                return self;
              }
            }
          }
          return self;
        }
        if (name in attrs.map) {
          var i = attrs.length;
          while (i--) {
            if (attrs[i].name === name) {
              attrs[i].value = value;
              break;
            }
          }
        } else {
          attrs.push({
            name: name,
            value: value
          });
        }
        attrs.map[name] = value;
        return self;
      }
      return attrs.map[name];
    }
  };
  Node.prototype.clone = function () {
    var self = this;
    var clone = new Node(self.name, self.type);
    var selfAttrs;
    if (selfAttrs = self.attributes) {
      var cloneAttrs = [];
      cloneAttrs.map = {};
      for (var i = 0, l = selfAttrs.length; i < l; i++) {
        var selfAttr = selfAttrs[i];
        if (selfAttr.name !== 'id') {
          cloneAttrs[cloneAttrs.length] = {
            name: selfAttr.name,
            value: selfAttr.value
          };
          cloneAttrs.map[selfAttr.name] = selfAttr.value;
        }
      }
      clone.attributes = cloneAttrs;
    }
    clone.value = self.value;
    clone.shortEnded = self.shortEnded;
    return clone;
  };
  Node.prototype.wrap = function (wrapper) {
    var self = this;
    self.parent.insert(wrapper, self);
    wrapper.append(self);
    return self;
  };
  Node.prototype.unwrap = function () {
    var self = this;
    for (var node = self.firstChild; node;) {
      var next = node.next;
      self.insert(node, self, true);
      node = next;
    }
    self.remove();
  };
  Node.prototype.remove = function () {
    var self = this, parent = self.parent, next = self.next, prev = self.prev;
    if (parent) {
      if (parent.firstChild === self) {
        parent.firstChild = next;
        if (next) {
          next.prev = null;
        }
      } else {
        prev.next = next;
      }
      if (parent.lastChild === self) {
        parent.lastChild = prev;
        if (prev) {
          prev.next = null;
        }
      } else {
        next.prev = prev;
      }
      self.parent = self.next = self.prev = null;
    }
    return self;
  };
  Node.prototype.append = function (node) {
    var self = this;
    if (node.parent) {
      node.remove();
    }
    var last = self.lastChild;
    if (last) {
      last.next = node;
      node.prev = last;
      self.lastChild = node;
    } else {
      self.lastChild = self.firstChild = node;
    }
    node.parent = self;
    return node;
  };
  Node.prototype.insert = function (node, refNode, before) {
    if (node.parent) {
      node.remove();
    }
    var parent = refNode.parent || this;
    if (before) {
      if (refNode === parent.firstChild) {
        parent.firstChild = node;
      } else {
        refNode.prev.next = node;
      }
      node.prev = refNode.prev;
      node.next = refNode;
      refNode.prev = node;
    } else {
      if (refNode === parent.lastChild) {
        parent.lastChild = node;
      } else {
        refNode.next.prev = node;
      }
      node.next = refNode.next;
      node.prev = refNode;
      refNode.next = node;
    }
    node.parent = parent;
    return node;
  };
  Node.prototype.getAll = function (name) {
    var self = this;
    var collection = [];
    for (var node = self.firstChild; node; node = walk$1(node, self)) {
      if (node.name === name) {
        collection.push(node);
      }
    }
    return collection;
  };
  Node.prototype.empty = function () {
    var self = this;
    if (self.firstChild) {
      var nodes = [];
      for (var node = self.firstChild; node; node = walk$1(node, self)) {
        nodes.push(node);
      }
      var i = nodes.length;
      while (i--) {
        var node = nodes[i];
        node.parent = node.firstChild = node.lastChild = node.next = node.prev = null;
      }
    }
    self.firstChild = self.lastChild = null;
    return self;
  };
  Node.prototype.isEmpty = function (elements, whitespace, predicate) {
    if (whitespace === void 0) {
      whitespace = {};
    }
    var self = this;
    var node = self.firstChild;
    if (isNonEmptyElement(self)) {
      return false;
    }
    if (node) {
      do {
        if (node.type === 1) {
          if (node.attr('data-mce-bogus')) {
            continue;
          }
          if (elements[node.name]) {
            return false;
          }
          if (isNonEmptyElement(node)) {
            return false;
          }
        }
        if (node.type === 8) {
          return false;
        }
        if (node.type === 3 && !isEmptyTextNode(node)) {
          return false;
        }
        if (node.type === 3 && node.parent && whitespace[node.parent.name] && whiteSpaceRegExp$1.test(node.value)) {
          return false;
        }
        if (predicate && predicate(node)) {
          return false;
        }
      } while (node = walk$1(node, self));
    }
    return true;
  };
  Node.prototype.walk = function (prev) {
    return walk$1(this, null, prev);
  };
  return Node;
}();

var promise = function () {
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }
  var isArray = Array.isArray || function (value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };
  var Promise = function (fn) {
    if (typeof this !== 'object') {
      throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('not a function');
    }
    this._state = null;
    this._value = null;
    this._deferreds = [];
    doResolve(fn, bind(resolve, this), bind(reject, this));
  };
  var asap = Promise.immediateFn || typeof setImmediate$1 === 'function' && setImmediate$1 || function (fn) {
    setTimeout$1(fn, 1);
  };
  function handle(deferred) {
    var me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return;
    }
    asap(function () {
      var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      var ret;
      try {
        ret = cb(me._value);
      } catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }
  function resolve(newValue) {
    try {
      if (newValue === this) {
        throw new TypeError('A promise cannot be resolved with itself.');
      }
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) {
      reject.call(this, e);
    }
  }
  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }
  function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }
  function Handler(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) {
          return;
        }
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) {
          return;
        }
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) {
        return;
      }
      done = true;
      onRejected(ex);
    }
  }
  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };
  Promise.prototype.then = function (onFulfilled, onRejected) {
    var me = this;
    return new Promise(function (resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
  };
  Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
    return new Promise(function (resolve, reject) {
      if (args.length === 0) {
        return resolve([]);
      }
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };
  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }
    return new Promise(function (resolve) {
      resolve(value);
    });
  };
  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };
  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };
  return Promise;
};
var promiseObj = window.Promise ? window.Promise : promise();

var buildBlob = function (type, data) {
  var str;
  try {
    str = atob$1(data);
  } catch (e) {
    return Option.none();
  }
  var arr = new Uint8Array(str.length);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return Option.some(new Blob$1([arr], { type: type }));
};

var count = 0;
var uniqueId = function (prefix) {
  return (prefix || 'blobid') + count++;
};

var unique = 0;
var generate = function (prefix) {
  var date = new Date();
  var time = date.getTime();
  var random = Math.floor(Math.random() * 1000000000);
  unique++;
  return prefix + '_' + random + unique + String(time);
};

var extractBase64DataUris = function (html) {
  var dataImageUri = /data:[^;]+;base64,([a-z0-9\+\/=]+)/gi;
  var chunks = [];
  var uris = {};
  var prefix = generate('img');
  var matches;
  var index = 0;
  var count = 0;
  while (matches = dataImageUri.exec(html)) {
    var uri = matches[0];
    var imageId = prefix + '_' + count++;
    uris[imageId] = uri;
    if (index < matches.index) {
      chunks.push(html.substr(index, matches.index - index));
    }
    chunks.push(imageId);
    index = matches.index + uri.length;
  }
  if (index === 0) {
    return {
      prefix: prefix,
      uris: uris,
      html: html
    };
  } else {
    if (index < html.length) {
      chunks.push(html.substr(index));
    }
    return {
      prefix: prefix,
      uris: uris,
      html: chunks.join('')
    };
  }
};
var restoreDataUris = function (html, result) {
  return html.replace(new RegExp(result.prefix + '_[0-9]+', 'g'), function (imageId) {
    return get(result.uris, imageId).getOr(imageId);
  });
};
var parseDataUri = function (uri) {
  var matches = /data:([^;]+);base64,([a-z0-9\+\/=]+)/i.exec(uri);
  if (matches) {
    return Option.some({
      type: matches[1],
      data: decodeURIComponent(matches[2])
    });
  } else {
    return Option.none();
  }
};

var paddEmptyNode = function (settings, args, blockElements, node) {
  var brPreferred = settings.padd_empty_with_br || args.insert;
  if (brPreferred && blockElements[node.name]) {
    node.empty().append(new Node('br', 1)).shortEnded = true;
  } else {
    node.empty().append(new Node('#text', 3)).value = nbsp;
  }
};
var isPaddedWithNbsp = function (node) {
  return hasOnlyChild(node, '#text') && node.firstChild.value === nbsp;
};
var hasOnlyChild = function (node, name) {
  return node && node.firstChild && node.firstChild === node.lastChild && node.firstChild.name === name;
};
var isPadded = function (schema, node) {
  var rule = schema.getElementRule(node.name);
  return rule && rule.paddEmpty;
};
var isEmpty = function (schema, nonEmptyElements, whitespaceElements, node) {
  return node.isEmpty(nonEmptyElements, whitespaceElements, function (node) {
    return isPadded(schema, node);
  });
};
var isLineBreakNode = function (node, blockElements) {
  return node && (blockElements[node.name] || node.name === 'br');
};

var isInternalImageSource = function (src) {
  return src === Env.transparentSrc;
};
var registerBase64ImageFilter = function (parser, settings) {
  var blobCache = settings.blob_cache;
  var processImage = function (img) {
    var inputSrc = img.attr('src');
    if (isInternalImageSource(inputSrc)) {
      return;
    }
    parseDataUri(inputSrc).bind(function (_a) {
      var type = _a.type, data = _a.data;
      return Option.from(blobCache.getByData(data, type)).orThunk(function () {
        return buildBlob(type, data).map(function (blob) {
          var blobInfo = blobCache.create(uniqueId(), blob, data);
          blobCache.add(blobInfo);
          return blobInfo;
        });
      });
    }).each(function (blobInfo) {
      img.attr('src', blobInfo.blobUri());
    });
  };
  if (blobCache) {
    parser.addAttributeFilter('src', function (nodes) {
      return each(nodes, processImage);
    });
  }
};
var register$1 = function (parser, settings) {
  var schema = parser.schema;
  if (settings.remove_trailing_brs) {
    parser.addNodeFilter('br', function (nodes, _, args) {
      var i;
      var l = nodes.length;
      var node;
      var blockElements = Tools.extend({}, schema.getBlockElements());
      var nonEmptyElements = schema.getNonEmptyElements();
      var parent, lastParent, prev, prevName;
      var whiteSpaceElements = schema.getNonEmptyElements();
      var elementRule, textNode;
      blockElements.body = 1;
      for (i = 0; i < l; i++) {
        node = nodes[i];
        parent = node.parent;
        if (blockElements[node.parent.name] && node === parent.lastChild) {
          prev = node.prev;
          while (prev) {
            prevName = prev.name;
            if (prevName !== 'span' || prev.attr('data-mce-type') !== 'bookmark') {
              if (prevName !== 'br') {
                break;
              }
              if (prevName === 'br') {
                node = null;
                break;
              }
            }
            prev = prev.prev;
          }
          if (node) {
            node.remove();
            if (isEmpty(schema, nonEmptyElements, whiteSpaceElements, parent)) {
              elementRule = schema.getElementRule(parent.name);
              if (elementRule) {
                if (elementRule.removeEmpty) {
                  parent.remove();
                } else if (elementRule.paddEmpty) {
                  paddEmptyNode(settings, args, blockElements, parent);
                }
              }
            }
          }
        } else {
          lastParent = node;
          while (parent && parent.firstChild === lastParent && parent.lastChild === lastParent) {
            lastParent = parent;
            if (blockElements[parent.name]) {
              break;
            }
            parent = parent.parent;
          }
          if (lastParent === parent && settings.padd_empty_with_br !== true) {
            textNode = new Node('#text', 3);
            textNode.value = nbsp;
            node.replace(textNode);
          }
        }
      }
    });
  }
  parser.addAttributeFilter('href', function (nodes) {
    var i = nodes.length;
    var appendRel = function (rel) {
      var parts = rel.split(' ').filter(function (p) {
        return p.length > 0;
      });
      return parts.concat(['noopener']).sort().join(' ');
    };
    var addNoOpener = function (rel) {
      var newRel = rel ? Tools.trim(rel) : '';
      if (!/\b(noopener)\b/g.test(newRel)) {
        return appendRel(newRel);
      } else {
        return newRel;
      }
    };
    if (!settings.allow_unsafe_link_target) {
      while (i--) {
        var node = nodes[i];
        if (node.name === 'a' && node.attr('target') === '_blank') {
          node.attr('rel', addNoOpener(node.attr('rel')));
        }
      }
    }
  });
  if (!settings.allow_html_in_named_anchor) {
    parser.addAttributeFilter('id,name', function (nodes) {
      var i = nodes.length, sibling, prevSibling, parent, node;
      while (i--) {
        node = nodes[i];
        if (node.name === 'a' && node.firstChild && !node.attr('href')) {
          parent = node.parent;
          sibling = node.lastChild;
          do {
            prevSibling = sibling.prev;
            parent.insert(sibling, node);
            sibling = prevSibling;
          } while (sibling);
        }
      }
    });
  }
  if (settings.fix_list_elements) {
    parser.addNodeFilter('ul,ol', function (nodes) {
      var i = nodes.length, node, parentNode;
      while (i--) {
        node = nodes[i];
        parentNode = node.parent;
        if (parentNode.name === 'ul' || parentNode.name === 'ol') {
          if (node.prev && node.prev.name === 'li') {
            node.prev.append(node);
          } else {
            var li = new Node('li', 1);
            li.attr('style', 'list-style-type: none');
            node.wrap(li);
          }
        }
      }
    });
  }
  if (settings.validate && schema.getValidClasses()) {
    parser.addAttributeFilter('class', function (nodes) {
      var i = nodes.length, node, classList, ci, className, classValue;
      var validClasses = schema.getValidClasses();
      var validClassesMap, valid;
      while (i--) {
        node = nodes[i];
        classList = node.attr('class').split(' ');
        classValue = '';
        for (ci = 0; ci < classList.length; ci++) {
          className = classList[ci];
          valid = false;
          validClassesMap = validClasses['*'];
          if (validClassesMap && validClassesMap[className]) {
            valid = true;
          }
          validClassesMap = validClasses[node.name];
          if (!valid && validClassesMap && validClassesMap[className]) {
            valid = true;
          }
          if (valid) {
            if (classValue) {
              classValue += ' ';
            }
            classValue += className;
          }
        }
        if (!classValue.length) {
          classValue = null;
        }
        node.attr('class', classValue);
      }
    });
  }
  registerBase64ImageFilter(parser, settings);
};

var fromHtml = function (html, scope) {
  var doc = scope || document$1;
  var div = doc.createElement('div');
  div.innerHTML = html;
  if (!div.hasChildNodes() || div.childNodes.length > 1) {
    console$1.error('HTML does not have a single root node', html);
    throw new Error('HTML must have a single root node');
  }
  return fromDom(div.childNodes[0]);
};
var fromTag = function (tag, scope) {
  var doc = scope || document$1;
  var node = doc.createElement(tag);
  return fromDom(node);
};
var fromText = function (text, scope) {
  var doc = scope || document$1;
  var node = doc.createTextNode(text);
  return fromDom(node);
};
var fromDom = function (node) {
  if (node === null || node === undefined) {
    throw new Error('Node cannot be null or undefined');
  }
  return { dom: constant(node) };
};
var fromPoint = function (docElm, x, y) {
  var doc = docElm.dom();
  return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
};
var Element = {
  fromHtml: fromHtml,
  fromTag: fromTag,
  fromText: fromText,
  fromDom: fromDom,
  fromPoint: fromPoint
};

var makeMap$1 = Tools.makeMap;
var namedEntities, baseEntities, reverseEntities;
var attrsCharsRegExp = /[&<>\"\u0060\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var rawCharsRegExp = /[<>&\"\']/g;
var entityRegExp = /&#([a-z0-9]+);?|&([a-z0-9]+);/gi;
var asciiMap = {
  128: '\u20AC',
  130: '\u201A',
  131: '\u0192',
  132: '\u201E',
  133: '\u2026',
  134: '\u2020',
  135: '\u2021',
  136: '\u02c6',
  137: '\u2030',
  138: '\u0160',
  139: '\u2039',
  140: '\u0152',
  142: '\u017d',
  145: '\u2018',
  146: '\u2019',
  147: '\u201C',
  148: '\u201D',
  149: '\u2022',
  150: '\u2013',
  151: '\u2014',
  152: '\u02DC',
  153: '\u2122',
  154: '\u0161',
  155: '\u203A',
  156: '\u0153',
  158: '\u017e',
  159: '\u0178'
};
baseEntities = {
  '"': '&quot;',
  '\'': '&#39;',
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '`': '&#96;'
};
reverseEntities = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': '\''
};
var nativeDecode = function (text) {
  var elm;
  elm = Element.fromTag('div').dom();
  elm.innerHTML = text;
  return elm.textContent || elm.innerText || text;
};
var buildEntitiesLookup = function (items, radix) {
  var i, chr, entity;
  var lookup = {};
  if (items) {
    items = items.split(',');
    radix = radix || 10;
    for (i = 0; i < items.length; i += 2) {
      chr = String.fromCharCode(parseInt(items[i], radix));
      if (!baseEntities[chr]) {
        entity = '&' + items[i + 1] + ';';
        lookup[chr] = entity;
        lookup[entity] = chr;
      }
    }
    return lookup;
  }
};
namedEntities = buildEntitiesLookup('50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' + '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' + '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' + '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' + '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' + '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' + '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' + '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' + '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' + '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' + 'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' + 'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' + 't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' + 'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' + 'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' + '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' + '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' + '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' + '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' + '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' + 'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' + 'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' + 'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' + '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' + '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);
var encodeRaw = function (text, attr) {
  return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
    return baseEntities[chr] || chr;
  });
};
var encodeAllRaw = function (text) {
  return ('' + text).replace(rawCharsRegExp, function (chr) {
    return baseEntities[chr] || chr;
  });
};
var encodeNumeric = function (text, attr) {
  return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
    if (chr.length > 1) {
      return '&#' + ((chr.charCodeAt(0) - 55296) * 1024 + (chr.charCodeAt(1) - 56320) + 65536) + ';';
    }
    return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
  });
};
var encodeNamed = function (text, attr, entities) {
  entities = entities || namedEntities;
  return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
    return baseEntities[chr] || entities[chr] || chr;
  });
};
var getEncodeFunc = function (name, entities) {
  var entitiesMap = buildEntitiesLookup(entities) || namedEntities;
  var encodeNamedAndNumeric = function (text, attr) {
    return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
      if (baseEntities[chr] !== undefined) {
        return baseEntities[chr];
      }
      if (entitiesMap[chr] !== undefined) {
        return entitiesMap[chr];
      }
      if (chr.length > 1) {
        return '&#' + ((chr.charCodeAt(0) - 55296) * 1024 + (chr.charCodeAt(1) - 56320) + 65536) + ';';
      }
      return '&#' + chr.charCodeAt(0) + ';';
    });
  };
  var encodeCustomNamed = function (text, attr) {
    return encodeNamed(text, attr, entitiesMap);
  };
  var nameMap = makeMap$1(name.replace(/\+/g, ','));
  if (nameMap.named && nameMap.numeric) {
    return encodeNamedAndNumeric;
  }
  if (nameMap.named) {
    if (entities) {
      return encodeCustomNamed;
    }
    return encodeNamed;
  }
  if (nameMap.numeric) {
    return encodeNumeric;
  }
  return encodeRaw;
};
var decode = function (text) {
  return text.replace(entityRegExp, function (all, numeric) {
    if (numeric) {
      if (numeric.charAt(0).toLowerCase() === 'x') {
        numeric = parseInt(numeric.substr(1), 16);
      } else {
        numeric = parseInt(numeric, 10);
      }
      if (numeric > 65535) {
        numeric -= 65536;
        return String.fromCharCode(55296 + (numeric >> 10), 56320 + (numeric & 1023));
      }
      return asciiMap[numeric] || String.fromCharCode(numeric);
    }
    return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
  });
};
var Entities = {
  encodeRaw: encodeRaw,
  encodeAllRaw: encodeAllRaw,
  encodeNumeric: encodeNumeric,
  encodeNamed: encodeNamed,
  getEncodeFunc: getEncodeFunc,
  decode: decode
};

var mapCache = {}, dummyObj = {};
var makeMap$2 = Tools.makeMap, each$3 = Tools.each, extend$1 = Tools.extend, explode$1 = Tools.explode, inArray = Tools.inArray;
var split = function (items, delim) {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};
var compileSchema = function (type) {
  var schema = {};
  var globalAttributes, blockContent;
  var phrasingContent, flowContent, html4BlockContent, html4PhrasingContent;
  var add = function (name, attributes, children) {
    var ni, attributesOrder, element;
    var arrayToMap = function (array, obj) {
      var map = {};
      var i, l;
      for (i = 0, l = array.length; i < l; i++) {
        map[array[i]] = obj || {};
      }
      return map;
    };
    children = children || [];
    attributes = attributes || '';
    if (typeof children === 'string') {
      children = split(children);
    }
    name = split(name);
    ni = name.length;
    while (ni--) {
      attributesOrder = split([
        globalAttributes,
        attributes
      ].join(' '));
      element = {
        attributes: arrayToMap(attributesOrder),
        attributesOrder: attributesOrder,
        children: arrayToMap(children, dummyObj)
      };
      schema[name[ni]] = element;
    }
  };
  var addAttrs = function (name, attributes) {
    var ni, schemaItem, i, l;
    name = split(name);
    ni = name.length;
    attributes = split(attributes);
    while (ni--) {
      schemaItem = schema[name[ni]];
      for (i = 0, l = attributes.length; i < l; i++) {
        schemaItem.attributes[attributes[i]] = {};
        schemaItem.attributesOrder.push(attributes[i]);
      }
    }
  };
  if (mapCache[type]) {
    return mapCache[type];
  }
  globalAttributes = 'id accesskey class dir lang style tabindex title role';
  blockContent = 'address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul';
  phrasingContent = 'a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd ' + 'label map noscript object q s samp script select small span strong sub sup ' + 'textarea u var #text #comment';
  if (type !== 'html4') {
    globalAttributes += ' contenteditable contextmenu draggable dropzone ' + 'hidden spellcheck translate';
    blockContent += ' article aside details dialog figure main header footer hgroup section nav';
    phrasingContent += ' audio canvas command datalist mark meter output picture ' + 'progress time wbr video ruby bdi keygen';
  }
  if (type !== 'html5-strict') {
    globalAttributes += ' xml:lang';
    html4PhrasingContent = 'acronym applet basefont big font strike tt';
    phrasingContent = [
      phrasingContent,
      html4PhrasingContent
    ].join(' ');
    each$3(split(html4PhrasingContent), function (name) {
      add(name, '', phrasingContent);
    });
    html4BlockContent = 'center dir isindex noframes';
    blockContent = [
      blockContent,
      html4BlockContent
    ].join(' ');
    flowContent = [
      blockContent,
      phrasingContent
    ].join(' ');
    each$3(split(html4BlockContent), function (name) {
      add(name, '', flowContent);
    });
  }
  flowContent = flowContent || [
    blockContent,
    phrasingContent
  ].join(' ');
  add('html', 'manifest', 'head body');
  add('head', '', 'base command link meta noscript script style title');
  add('title hr noscript br');
  add('base', 'href target');
  add('link', 'href rel media hreflang type sizes hreflang');
  add('meta', 'name http-equiv content charset');
  add('style', 'media type scoped');
  add('script', 'src async defer type charset');
  add('body', 'onafterprint onbeforeprint onbeforeunload onblur onerror onfocus ' + 'onhashchange onload onmessage onoffline ononline onpagehide onpageshow ' + 'onpopstate onresize onscroll onstorage onunload', flowContent);
  add('address dt dd div caption', '', flowContent);
  add('h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn', '', phrasingContent);
  add('blockquote', 'cite', flowContent);
  add('ol', 'reversed start type', 'li');
  add('ul', '', 'li');
  add('li', 'value', flowContent);
  add('dl', '', 'dt dd');
  add('a', 'href target rel media hreflang type', phrasingContent);
  add('q', 'cite', phrasingContent);
  add('ins del', 'cite datetime', flowContent);
  add('img', 'src sizes srcset alt usemap ismap width height');
  add('iframe', 'src name width height', flowContent);
  add('embed', 'src type width height');
  add('object', 'data type typemustmatch name usemap form width height', [
    flowContent,
    'param'
  ].join(' '));
  add('param', 'name value');
  add('map', 'name', [
    flowContent,
    'area'
  ].join(' '));
  add('area', 'alt coords shape href target rel media hreflang type');
  add('table', 'border', 'caption colgroup thead tfoot tbody tr' + (type === 'html4' ? ' col' : ''));
  add('colgroup', 'span', 'col');
  add('col', 'span');
  add('tbody thead tfoot', '', 'tr');
  add('tr', '', 'td th');
  add('td', 'colspan rowspan headers', flowContent);
  add('th', 'colspan rowspan headers scope abbr', flowContent);
  add('form', 'accept-charset action autocomplete enctype method name novalidate target', flowContent);
  add('fieldset', 'disabled form name', [
    flowContent,
    'legend'
  ].join(' '));
  add('label', 'form for', phrasingContent);
  add('input', 'accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate ' + 'formtarget height list max maxlength min multiple name pattern readonly required size src step type value width');
  add('button', 'disabled form formaction formenctype formmethod formnovalidate formtarget name type value', type === 'html4' ? flowContent : phrasingContent);
  add('select', 'disabled form multiple name required size', 'option optgroup');
  add('optgroup', 'disabled label', 'option');
  add('option', 'disabled label selected value');
  add('textarea', 'cols dirname disabled form maxlength name readonly required rows wrap');
  add('menu', 'type label', [
    flowContent,
    'li'
  ].join(' '));
  add('noscript', '', flowContent);
  if (type !== 'html4') {
    add('wbr');
    add('ruby', '', [
      phrasingContent,
      'rt rp'
    ].join(' '));
    add('figcaption', '', flowContent);
    add('mark rt rp summary bdi', '', phrasingContent);
    add('canvas', 'width height', flowContent);
    add('video', 'src crossorigin poster preload autoplay mediagroup loop ' + 'muted controls width height buffered', [
      flowContent,
      'track source'
    ].join(' '));
    add('audio', 'src crossorigin preload autoplay mediagroup loop muted controls ' + 'buffered volume', [
      flowContent,
      'track source'
    ].join(' '));
    add('picture', '', 'img source');
    add('source', 'src srcset type media sizes');
    add('track', 'kind src srclang label default');
    add('datalist', '', [
      phrasingContent,
      'option'
    ].join(' '));
    add('article section nav aside main header footer', '', flowContent);
    add('hgroup', '', 'h1 h2 h3 h4 h5 h6');
    add('figure', '', [
      flowContent,
      'figcaption'
    ].join(' '));
    add('time', 'datetime', phrasingContent);
    add('dialog', 'open', flowContent);
    add('command', 'type label icon disabled checked radiogroup command');
    add('output', 'for form name', phrasingContent);
    add('progress', 'value max', phrasingContent);
    add('meter', 'value min max low high optimum', phrasingContent);
    add('details', 'open', [
      flowContent,
      'summary'
    ].join(' '));
    add('keygen', 'autofocus challenge disabled form keytype name');
  }
  if (type !== 'html5-strict') {
    addAttrs('script', 'language xml:space');
    addAttrs('style', 'xml:space');
    addAttrs('object', 'declare classid code codebase codetype archive standby align border hspace vspace');
    addAttrs('embed', 'align name hspace vspace');
    addAttrs('param', 'valuetype type');
    addAttrs('a', 'charset name rev shape coords');
    addAttrs('br', 'clear');
    addAttrs('applet', 'codebase archive code object alt name width height align hspace vspace');
    addAttrs('img', 'name longdesc align border hspace vspace');
    addAttrs('iframe', 'longdesc frameborder marginwidth marginheight scrolling align');
    addAttrs('font basefont', 'size color face');
    addAttrs('input', 'usemap align');
    addAttrs('select');
    addAttrs('textarea');
    addAttrs('h1 h2 h3 h4 h5 h6 div p legend caption', 'align');
    addAttrs('ul', 'type compact');
    addAttrs('li', 'type');
    addAttrs('ol dl menu dir', 'compact');
    addAttrs('pre', 'width xml:space');
    addAttrs('hr', 'align noshade size width');
    addAttrs('isindex', 'prompt');
    addAttrs('table', 'summary width frame rules cellspacing cellpadding align bgcolor');
    addAttrs('col', 'width align char charoff valign');
    addAttrs('colgroup', 'width align char charoff valign');
    addAttrs('thead', 'align char charoff valign');
    addAttrs('tr', 'align char charoff valign bgcolor');
    addAttrs('th', 'axis align char charoff valign nowrap bgcolor width height');
    addAttrs('form', 'accept');
    addAttrs('td', 'abbr axis scope align char charoff valign nowrap bgcolor width height');
    addAttrs('tfoot', 'align char charoff valign');
    addAttrs('tbody', 'align char charoff valign');
    addAttrs('area', 'nohref');
    addAttrs('body', 'background bgcolor text link vlink alink');
  }
  if (type !== 'html4') {
    addAttrs('input button select textarea', 'autofocus');
    addAttrs('input textarea', 'placeholder');
    addAttrs('a', 'download');
    addAttrs('link script img', 'crossorigin');
    addAttrs('img', 'loading');
    addAttrs('iframe', 'sandbox seamless allowfullscreen loading');
  }
  each$3(split('a form meter progress dfn'), function (name) {
    if (schema[name]) {
      delete schema[name].children[name];
    }
  });
  delete schema.caption.children.table;
  delete schema.script;
  mapCache[type] = schema;
  return schema;
};
var compileElementMap = function (value, mode) {
  var styles;
  if (value) {
    styles = {};
    if (typeof value === 'string') {
      value = { '*': value };
    }
    each$3(value, function (value, key) {
      styles[key] = styles[key.toUpperCase()] = mode === 'map' ? makeMap$2(value, /[, ]/) : explode$1(value, /[, ]/);
    });
  }
  return styles;
};
function Schema(settings) {
  var elements = {};
  var children = {};
  var patternElements = [];
  var validStyles;
  var invalidStyles;
  var schemaItems;
  var whiteSpaceElementsMap, selfClosingElementsMap, shortEndedElementsMap, boolAttrMap, validClasses;
  var blockElementsMap, nonEmptyElementsMap, moveCaretBeforeOnEnterElementsMap, textBlockElementsMap, textInlineElementsMap;
  var customElementsMap = {}, specialElements = {};
  var createLookupTable = function (option, defaultValue, extendWith) {
    var value = settings[option];
    if (!value) {
      value = mapCache[option];
      if (!value) {
        value = makeMap$2(defaultValue, ' ', makeMap$2(defaultValue.toUpperCase(), ' '));
        value = extend$1(value, extendWith);
        mapCache[option] = value;
      }
    } else {
      value = makeMap$2(value, /[, ]/, makeMap$2(value.toUpperCase(), /[, ]/));
    }
    return value;
  };
  settings = settings || {};
  schemaItems = compileSchema(settings.schema);
  if (settings.verify_html === false) {
    settings.valid_elements = '*[*]';
  }
  validStyles = compileElementMap(settings.valid_styles);
  invalidStyles = compileElementMap(settings.invalid_styles, 'map');
  validClasses = compileElementMap(settings.valid_classes, 'map');
  whiteSpaceElementsMap = createLookupTable('whitespace_elements', 'pre script noscript style textarea video audio iframe object code');
  selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
  shortEndedElementsMap = createLookupTable('short_ended_elements', 'area base basefont br col frame hr img input isindex link ' + 'meta param embed source wbr track');
  boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' + 'noshade nowrap readonly selected autoplay loop controls');
  nonEmptyElementsMap = createLookupTable('non_empty_elements', 'td th iframe video audio object ' + 'script pre code', shortEndedElementsMap);
  moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', 'table', nonEmptyElementsMap);
  textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' + 'blockquote center dir fieldset header footer article section hgroup aside main nav figure');
  blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' + 'th tr td li ol ul caption dl dt dd noscript menu isindex option ' + 'datalist select optgroup figcaption details summary', textBlockElementsMap);
  textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font strike u var cite ' + 'dfn code mark q sup sub samp');
  each$3((settings.special || 'script noscript noframes noembed title style textarea xmp').split(' '), function (name) {
    specialElements[name] = new RegExp('</' + name + '[^>]*>', 'gi');
  });
  var patternToRegExp = function (str) {
    return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
  };
  var addValidElements = function (validElements) {
    var ei, el, ai, al, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder, prefix, outputName, globalAttributes, globalAttributesOrder, value;
    var elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/, attrRuleRegExp = /^([!\-])?(\w+[\\:]:\w+|[^=:<]+)?(?:([=:<])(.*))?$/, hasPatternsRegExp = /[*?+]/;
    if (validElements) {
      validElements = split(validElements, ',');
      if (elements['@']) {
        globalAttributes = elements['@'].attributes;
        globalAttributesOrder = elements['@'].attributesOrder;
      }
      for (ei = 0, el = validElements.length; ei < el; ei++) {
        matches = elementRuleRegExp.exec(validElements[ei]);
        if (matches) {
          prefix = matches[1];
          elementName = matches[2];
          outputName = matches[3];
          attrData = matches[5];
          attributes = {};
          attributesOrder = [];
          element = {
            attributes: attributes,
            attributesOrder: attributesOrder
          };
          if (prefix === '#') {
            element.paddEmpty = true;
          }
          if (prefix === '-') {
            element.removeEmpty = true;
          }
          if (matches[4] === '!') {
            element.removeEmptyAttrs = true;
          }
          if (globalAttributes) {
            each$1(globalAttributes, function (value, key) {
              attributes[key] = value;
            });
            attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
          }
          if (attrData) {
            attrData = split(attrData, '|');
            for (ai = 0, al = attrData.length; ai < al; ai++) {
              matches = attrRuleRegExp.exec(attrData[ai]);
              if (matches) {
                attr = {};
                attrType = matches[1];
                attrName = matches[2].replace(/[\\:]:/g, ':');
                prefix = matches[3];
                value = matches[4];
                if (attrType === '!') {
                  element.attributesRequired = element.attributesRequired || [];
                  element.attributesRequired.push(attrName);
                  attr.required = true;
                }
                if (attrType === '-') {
                  delete attributes[attrName];
                  attributesOrder.splice(inArray(attributesOrder, attrName), 1);
                  continue;
                }
                if (prefix) {
                  if (prefix === '=') {
                    element.attributesDefault = element.attributesDefault || [];
                    element.attributesDefault.push({
                      name: attrName,
                      value: value
                    });
                    attr.defaultValue = value;
                  }
                  if (prefix === ':') {
                    element.attributesForced = element.attributesForced || [];
                    element.attributesForced.push({
                      name: attrName,
                      value: value
                    });
                    attr.forcedValue = value;
                  }
                  if (prefix === '<') {
                    attr.validValues = makeMap$2(value, '?');
                  }
                }
                if (hasPatternsRegExp.test(attrName)) {
                  element.attributePatterns = element.attributePatterns || [];
                  attr.pattern = patternToRegExp(attrName);
                  element.attributePatterns.push(attr);
                } else {
                  if (!attributes[attrName]) {
                    attributesOrder.push(attrName);
                  }
                  attributes[attrName] = attr;
                }
              }
            }
          }
          if (!globalAttributes && elementName === '@') {
            globalAttributes = attributes;
            globalAttributesOrder = attributesOrder;
          }
          if (outputName) {
            element.outputName = elementName;
            elements[outputName] = element;
          }
          if (hasPatternsRegExp.test(elementName)) {
            element.pattern = patternToRegExp(elementName);
            patternElements.push(element);
          } else {
            elements[elementName] = element;
          }
        }
      }
    }
  };
  var setValidElements = function (validElements) {
    elements = {};
    patternElements = [];
    addValidElements(validElements);
    each$3(schemaItems, function (element, name) {
      children[name] = element.children;
    });
  };
  var addCustomElements = function (customElements) {
    var customElementRegExp = /^(~)?(.+)$/;
    if (customElements) {
      mapCache.text_block_elements = mapCache.block_elements = null;
      each$3(split(customElements, ','), function (rule) {
        var matches = customElementRegExp.exec(rule), inline = matches[1] === '~', cloneName = inline ? 'span' : 'div', name = matches[2];
        children[name] = children[cloneName];
        customElementsMap[name] = cloneName;
        if (!inline) {
          blockElementsMap[name.toUpperCase()] = {};
          blockElementsMap[name] = {};
        }
        if (!elements[name]) {
          var customRule = elements[cloneName];
          customRule = extend$1({}, customRule);
          delete customRule.removeEmptyAttrs;
          delete customRule.removeEmpty;
          elements[name] = customRule;
        }
        each$3(children, function (element, elmName) {
          if (element[cloneName]) {
            children[elmName] = element = extend$1({}, children[elmName]);
            element[name] = element[cloneName];
          }
        });
      });
    }
  };
  var addValidChildren = function (validChildren) {
    var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;
    mapCache[settings.schema] = null;
    if (validChildren) {
      each$3(split(validChildren, ','), function (rule) {
        var matches = childRuleRegExp.exec(rule);
        var parent, prefix;
        if (matches) {
          prefix = matches[1];
          if (prefix) {
            parent = children[matches[2]];
          } else {
            parent = children[matches[2]] = { '#comment': {} };
          }
          parent = children[matches[2]];
          each$3(split(matches[3], '|'), function (child) {
            if (prefix === '-') {
              delete parent[child];
            } else {
              parent[child] = {};
            }
          });
        }
      });
    }
  };
  var getElementRule = function (name) {
    var element = elements[name], i;
    if (element) {
      return element;
    }
    i = patternElements.length;
    while (i--) {
      element = patternElements[i];
      if (element.pattern.test(name)) {
        return element;
      }
    }
  };
  if (!settings.valid_elements) {
    each$3(schemaItems, function (element, name) {
      elements[name] = {
        attributes: element.attributes,
        attributesOrder: element.attributesOrder
      };
      children[name] = element.children;
    });
    if (settings.schema !== 'html5') {
      each$3(split('strong/b em/i'), function (item) {
        item = split(item, '/');
        elements[item[1]].outputName = item[0];
      });
    }
    each$3(split('ol ul sub sup blockquote span font a table tbody tr strong em b i'), function (name) {
      if (elements[name]) {
        elements[name].removeEmpty = true;
      }
    });
    each$3(split('p h1 h2 h3 h4 h5 h6 th td pre div address caption li'), function (name) {
      elements[name].paddEmpty = true;
    });
    each$3(split('span'), function (name) {
      elements[name].removeEmptyAttrs = true;
    });
  } else {
    setValidElements(settings.valid_elements);
  }
  addCustomElements(settings.custom_elements);
  addValidChildren(settings.valid_children);
  addValidElements(settings.extended_valid_elements);
  addValidChildren('+ol[ul|ol],+ul[ul|ol]');
  each$3({
    dd: 'dl',
    dt: 'dl',
    li: 'ul ol',
    td: 'tr',
    th: 'tr',
    tr: 'tbody thead tfoot',
    tbody: 'table',
    thead: 'table',
    tfoot: 'table',
    legend: 'fieldset',
    area: 'map',
    param: 'video audio object'
  }, function (parents, item) {
    if (elements[item]) {
      elements[item].parentsRequired = split(parents);
    }
  });
  if (settings.invalid_elements) {
    each$3(explode$1(settings.invalid_elements), function (item) {
      if (elements[item]) {
        delete elements[item];
      }
    });
  }
  if (!getElementRule('span')) {
    addValidElements('span[!data-mce-type|*]');
  }
  var getValidStyles = function () {
    return validStyles;
  };
  var getInvalidStyles = function () {
    return invalidStyles;
  };
  var getValidClasses = function () {
    return validClasses;
  };
  var getBoolAttrs = function () {
    return boolAttrMap;
  };
  var getBlockElements = function () {
    return blockElementsMap;
  };
  var getTextBlockElements = function () {
    return textBlockElementsMap;
  };
  var getTextInlineElements = function () {
    return textInlineElementsMap;
  };
  var getShortEndedElements = function () {
    return shortEndedElementsMap;
  };
  var getSelfClosingElements = function () {
    return selfClosingElementsMap;
  };
  var getNonEmptyElements = function () {
    return nonEmptyElementsMap;
  };
  var getMoveCaretBeforeOnEnterElements = function () {
    return moveCaretBeforeOnEnterElementsMap;
  };
  var getWhiteSpaceElements = function () {
    return whiteSpaceElementsMap;
  };
  var getSpecialElements = function () {
    return specialElements;
  };
  var isValidChild = function (name, child) {
    var parent = children[name.toLowerCase()];
    return !!(parent && parent[child.toLowerCase()]);
  };
  var isValid = function (name, attr) {
    var attrPatterns, i;
    var rule = getElementRule(name);
    if (rule) {
      if (attr) {
        if (rule.attributes[attr]) {
          return true;
        }
        attrPatterns = rule.attributePatterns;
        if (attrPatterns) {
          i = attrPatterns.length;
          while (i--) {
            if (attrPatterns[i].pattern.test(name)) {
              return true;
            }
          }
        }
      } else {
        return true;
      }
    }
    return false;
  };
  var getCustomElements = function () {
    return customElementsMap;
  };
  return {
    children: children,
    elements: elements,
    getValidStyles: getValidStyles,
    getValidClasses: getValidClasses,
    getBlockElements: getBlockElements,
    getInvalidStyles: getInvalidStyles,
    getShortEndedElements: getShortEndedElements,
    getTextBlockElements: getTextBlockElements,
    getTextInlineElements: getTextInlineElements,
    getBoolAttrs: getBoolAttrs,
    getElementRule: getElementRule,
    getSelfClosingElements: getSelfClosingElements,
    getNonEmptyElements: getNonEmptyElements,
    getMoveCaretBeforeOnEnterElements: getMoveCaretBeforeOnEnterElements,
    getWhiteSpaceElements: getWhiteSpaceElements,
    getSpecialElements: getSpecialElements,
    isValidChild: isValidChild,
    isValid: isValid,
    getCustomElements: getCustomElements,
    addValidElements: addValidElements,
    setValidElements: setValidElements,
    addCustomElements: addCustomElements,
    addValidChildren: addValidChildren
  };
}

var isValidPrefixAttrName = function (name) {
  return name.indexOf('data-') === 0 || name.indexOf('aria-') === 0;
};
var isInvalidUri = function (settings, uri) {
  if (settings.allow_html_data_urls) {
    return false;
  } else if (/^data:image\//i.test(uri)) {
    return settings.allow_svg_data_urls === false && /^data:image\/svg\+xml/i.test(uri);
  } else {
    return /^data:/i.test(uri);
  }
};
var findEndTagIndex = function (schema, html, startIndex) {
  var count = 1, index, matches, tokenRegExp, shortEndedElements;
  shortEndedElements = schema.getShortEndedElements();
  tokenRegExp = /<([!?\/])?([A-Za-z0-9\-_\:\.]+)((?:\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\/|\s+)>/g;
  tokenRegExp.lastIndex = index = startIndex;
  while (matches = tokenRegExp.exec(html)) {
    index = tokenRegExp.lastIndex;
    if (matches[1] === '/') {
      count--;
    } else if (!matches[1]) {
      if (matches[2] in shortEndedElements) {
        continue;
      }
      count++;
    }
    if (count === 0) {
      break;
    }
  }
  return index;
};
var isConditionalComment = function (html, startIndex) {
  return /^\s*\[if [\w\W]+\]>.*<!\[endif\](--!?)?>/.test(html.substr(startIndex));
};
var findCommentEndIndex = function (html, isBogus, startIndex) {
  if (startIndex === void 0) {
    startIndex = 0;
  }
  var lcHtml = html.toLowerCase();
  if (lcHtml.indexOf('[if ', startIndex) !== -1 && isConditionalComment(lcHtml, startIndex)) {
    var endIfIndex = lcHtml.indexOf('[endif]', startIndex);
    return lcHtml.indexOf('>', endIfIndex);
  } else {
    if (isBogus) {
      var endIndex = lcHtml.indexOf('>', startIndex);
      return endIndex !== -1 ? endIndex : lcHtml.length;
    } else {
      var endCommentRegexp = /--!?>/;
      endCommentRegexp.lastIndex = startIndex;
      var match = endCommentRegexp.exec(html);
      return match ? match.index + match[0].length : lcHtml.length;
    }
  }
};
var checkBogusAttribute = function (regExp, attrString) {
  var matches = regExp.exec(attrString);
  if (matches) {
    var name_1 = matches[1];
    var value = matches[2];
    return typeof name_1 === 'string' && name_1.toLowerCase() === 'data-mce-bogus' ? value : null;
  } else {
    return null;
  }
};
function SaxParser(settings, schema) {
  if (schema === void 0) {
    schema = Schema();
  }
  var noop = function () {
  };
  settings = settings || {};
  if (settings.fix_self_closing !== false) {
    settings.fix_self_closing = true;
  }
  var comment = settings.comment ? settings.comment : noop;
  var cdata = settings.cdata ? settings.cdata : noop;
  var text = settings.text ? settings.text : noop;
  var start = settings.start ? settings.start : noop;
  var end = settings.end ? settings.end : noop;
  var pi = settings.pi ? settings.pi : noop;
  var doctype = settings.doctype ? settings.doctype : noop;
  var parseInternal = function (base64Extract, format) {
    if (format === void 0) {
      format = 'html';
    }
    var html = base64Extract.html;
    var matches, index = 0, value, endRegExp;
    var stack = [];
    var attrList, i, textData, name;
    var isInternalElement, removeInternalElements, shortEndedElements, fillAttrsMap, isShortEnded;
    var validate, elementRule, isValidElement, attr, attribsValue, validAttributesMap, validAttributePatterns;
    var attributesRequired, attributesDefault, attributesForced, processHtml;
    var anyAttributesRequired, selfClosing, tokenRegExp, attrRegExp, specialElements, attrValue, idCount = 0;
    var decode = Entities.decode;
    var fixSelfClosing;
    var filteredUrlAttrs = Tools.makeMap('src,href,data,background,formaction,poster,xlink:href');
    var scriptUriRegExp = /((java|vb)script|mhtml):/i;
    var parsingMode = format === 'html' ? 0 : 1;
    var processEndTag = function (name) {
      var pos, i;
      pos = stack.length;
      while (pos--) {
        if (stack[pos].name === name) {
          break;
        }
      }
      if (pos >= 0) {
        for (i = stack.length - 1; i >= pos; i--) {
          name = stack[i];
          if (name.valid) {
            end(name.name);
          }
        }
        stack.length = pos;
      }
    };
    var processText = function (value, raw) {
      return text(restoreDataUris(value, base64Extract), raw);
    };
    var processComment = function (value) {
      if (value === '') {
        return;
      }
      if (value.charAt(0) === '>') {
        value = ' ' + value;
      }
      if (!settings.allow_conditional_comments && value.substr(0, 3).toLowerCase() === '[if') {
        value = ' ' + value;
      }
      comment(restoreDataUris(value, base64Extract));
    };
    var processAttr = function (value) {
      return get(base64Extract.uris, value).getOr(value);
    };
    var processMalformedComment = function (value, startIndex) {
      var startTag = value || '';
      var isBogus = !startsWith(startTag, '--');
      var endIndex = findCommentEndIndex(html, isBogus, startIndex);
      value = html.substr(startIndex, endIndex - startIndex);
      processComment(isBogus ? startTag + value : value);
      return endIndex + 1;
    };
    var parseAttribute = function (match, name, value, val2, val3) {
      var attrRule, i;
      var trimRegExp = /[\s\u0000-\u001F]+/g;
      name = name.toLowerCase();
      value = processAttr(name in fillAttrsMap ? name : decode(value || val2 || val3 || ''));
      if (validate && !isInternalElement && isValidPrefixAttrName(name) === false) {
        attrRule = validAttributesMap[name];
        if (!attrRule && validAttributePatterns) {
          i = validAttributePatterns.length;
          while (i--) {
            attrRule = validAttributePatterns[i];
            if (attrRule.pattern.test(name)) {
              break;
            }
          }
          if (i === -1) {
            attrRule = null;
          }
        }
        if (!attrRule) {
          return;
        }
        if (attrRule.validValues && !(value in attrRule.validValues)) {
          return;
        }
      }
      if (filteredUrlAttrs[name] && !settings.allow_script_urls) {
        var uri = value.replace(trimRegExp, '');
        try {
          uri = decodeURIComponent(uri);
        } catch (ex) {
          uri = unescape(uri);
        }
        if (scriptUriRegExp.test(uri)) {
          return;
        }
        if (isInvalidUri(settings, uri)) {
          return;
        }
      }
      if (isInternalElement && (name in filteredUrlAttrs || name.indexOf('on') === 0)) {
        return;
      }
      attrList.map[name] = value;
      attrList.push({
        name: name,
        value: value
      });
    };
    tokenRegExp = new RegExp('<(?:' + '(?:!--([\\w\\W]*?)--!?>)|' + '(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + '(?:![Dd][Oo][Cc][Tt][Yy][Pp][Ee]([\\w\\W]*?)>)|' + '(?:!(--)?)|' + '(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + '(?:\\/([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)>)|' + '(?:([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)((?:\\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\\/|\\s+)>)' + ')', 'g');
    attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g;
    shortEndedElements = schema.getShortEndedElements();
    selfClosing = settings.self_closing_elements || schema.getSelfClosingElements();
    fillAttrsMap = schema.getBoolAttrs();
    validate = settings.validate;
    removeInternalElements = settings.remove_internals;
    fixSelfClosing = settings.fix_self_closing;
    specialElements = schema.getSpecialElements();
    processHtml = html + '>';
    while (matches = tokenRegExp.exec(processHtml)) {
      var matchText = matches[0];
      if (index < matches.index) {
        processText(decode(html.substr(index, matches.index - index)));
      }
      if (value = matches[7]) {
        value = value.toLowerCase();
        if (value.charAt(0) === ':') {
          value = value.substr(1);
        }
        processEndTag(value);
      } else if (value = matches[8]) {
        if (matches.index + matchText.length > html.length) {
          processText(decode(html.substr(matches.index)));
          index = matches.index + matchText.length;
          continue;
        }
        value = value.toLowerCase();
        if (value.charAt(0) === ':') {
          value = value.substr(1);
        }
        isShortEnded = value in shortEndedElements;
        if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value) {
          processEndTag(value);
        }
        var bogusValue = checkBogusAttribute(attrRegExp, matches[9]);
        if (bogusValue !== null) {
          if (bogusValue === 'all') {
            index = findEndTagIndex(schema, html, tokenRegExp.lastIndex);
            tokenRegExp.lastIndex = index;
            continue;
          }
          isValidElement = false;
        }
        if (!validate || (elementRule = schema.getElementRule(value))) {
          isValidElement = true;
          if (validate) {
            validAttributesMap = elementRule.attributes;
            validAttributePatterns = elementRule.attributePatterns;
          }
          if (attribsValue = matches[9]) {
            isInternalElement = attribsValue.indexOf('data-mce-type') !== -1;
            if (isInternalElement && removeInternalElements) {
              isValidElement = false;
            }
            attrList = [];
            attrList.map = {};
            attribsValue.replace(attrRegExp, parseAttribute);
          } else {
            attrList = [];
            attrList.map = {};
          }
          if (validate && !isInternalElement) {
            attributesRequired = elementRule.attributesRequired;
            attributesDefault = elementRule.attributesDefault;
            attributesForced = elementRule.attributesForced;
            anyAttributesRequired = elementRule.removeEmptyAttrs;
            if (anyAttributesRequired && !attrList.length) {
              isValidElement = false;
            }
            if (attributesForced) {
              i = attributesForced.length;
              while (i--) {
                attr = attributesForced[i];
                name = attr.name;
                attrValue = attr.value;
                if (attrValue === '{$uid}') {
                  attrValue = 'mce_' + idCount++;
                }
                attrList.map[name] = attrValue;
                attrList.push({
                  name: name,
                  value: attrValue
                });
              }
            }
            if (attributesDefault) {
              i = attributesDefault.length;
              while (i--) {
                attr = attributesDefault[i];
                name = attr.name;
                if (!(name in attrList.map)) {
                  attrValue = attr.value;
                  if (attrValue === '{$uid}') {
                    attrValue = 'mce_' + idCount++;
                  }
                  attrList.map[name] = attrValue;
                  attrList.push({
                    name: name,
                    value: attrValue
                  });
                }
              }
            }
            if (attributesRequired) {
              i = attributesRequired.length;
              while (i--) {
                if (attributesRequired[i] in attrList.map) {
                  break;
                }
              }
              if (i === -1) {
                isValidElement = false;
              }
            }
            if (attr = attrList.map['data-mce-bogus']) {
              if (attr === 'all') {
                index = findEndTagIndex(schema, html, tokenRegExp.lastIndex);
                tokenRegExp.lastIndex = index;
                continue;
              }
              isValidElement = false;
            }
          }
          if (isValidElement) {
            start(value, attrList, isShortEnded);
          }
        } else {
          isValidElement = false;
        }
        if (endRegExp = specialElements[value]) {
          endRegExp.lastIndex = index = matches.index + matchText.length;
          if (matches = endRegExp.exec(html)) {
            if (isValidElement) {
              textData = html.substr(index, matches.index - index);
            }
            index = matches.index + matches[0].length;
          } else {
            textData = html.substr(index);
            index = html.length;
          }
          if (isValidElement) {
            if (textData.length > 0) {
              processText(textData, true);
            }
            end(value);
          }
          tokenRegExp.lastIndex = index;
          continue;
        }
        if (!isShortEnded) {
          if (!attribsValue || attribsValue.indexOf('/') !== attribsValue.length - 1) {
            stack.push({
              name: value,
              valid: isValidElement
            });
          } else if (isValidElement) {
            end(value);
          }
        }
      } else if (value = matches[1]) {
        processComment(value);
      } else if (value = matches[2]) {
        var isValidCdataSection = parsingMode === 1 || settings.preserve_cdata || stack.length > 0 && schema.isValidChild(stack[stack.length - 1].name, '#cdata');
        if (isValidCdataSection) {
          cdata(value);
        } else {
          index = processMalformedComment('', matches.index + 2);
          tokenRegExp.lastIndex = index;
          continue;
        }
      } else if (value = matches[3]) {
        doctype(value);
      } else if ((value = matches[4]) || matchText === '<!') {
        index = processMalformedComment(value, matches.index + matchText.length);
        tokenRegExp.lastIndex = index;
        continue;
      } else if (value = matches[5]) {
        if (parsingMode === 1) {
          pi(value, matches[6]);
        } else {
          index = processMalformedComment('?', matches.index + 2);
          tokenRegExp.lastIndex = index;
          continue;
        }
      }
      index = matches.index + matchText.length;
    }
    if (index < html.length) {
      processText(decode(html.substr(index)));
    }
    for (i = stack.length - 1; i >= 0; i--) {
      value = stack[i];
      if (value.valid) {
        end(value.name);
      }
    }
  };
  var parse = function (html, format) {
    if (format === void 0) {
      format = 'html';
    }
    parseInternal(extractBase64DataUris(html), format);
  };
  return { parse: parse };
}
(function (SaxParser) {
  SaxParser.findEndTag = findEndTagIndex;
}(SaxParser || (SaxParser = {})));
var SaxParser$1 = SaxParser;

var makeMap$3 = Tools.makeMap, each$4 = Tools.each, explode$2 = Tools.explode, extend$2 = Tools.extend;
var DomParser = function (settings, schema) {
  if (schema === void 0) {
    schema = Schema();
  }
  var nodeFilters = {};
  var attributeFilters = [];
  var matchedNodes = {};
  var matchedAttributes = {};
  settings = settings || {};
  settings.validate = 'validate' in settings ? settings.validate : true;
  settings.root_name = settings.root_name || 'body';
  var fixInvalidChildren = function (nodes) {
    var ni, node, parent, parents, newParent, currentNode, tempNode, childNode, i;
    var nonEmptyElements, whitespaceElements, nonSplitableElements, textBlockElements, specialElements, sibling, nextNode;
    nonSplitableElements = makeMap$3('tr,td,th,tbody,thead,tfoot,table');
    nonEmptyElements = schema.getNonEmptyElements();
    whitespaceElements = schema.getWhiteSpaceElements();
    textBlockElements = schema.getTextBlockElements();
    specialElements = schema.getSpecialElements();
    for (ni = 0; ni < nodes.length; ni++) {
      node = nodes[ni];
      if (!node.parent || node.fixed) {
        continue;
      }
      if (textBlockElements[node.name] && node.parent.name === 'li') {
        sibling = node.next;
        while (sibling) {
          if (textBlockElements[sibling.name]) {
            sibling.name = 'li';
            sibling.fixed = true;
            node.parent.insert(sibling, node.parent);
          } else {
            break;
          }
          sibling = sibling.next;
        }
        node.unwrap(node);
        continue;
      }
      parents = [node];
      for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) && !nonSplitableElements[parent.name]; parent = parent.parent) {
        parents.push(parent);
      }
      if (parent && parents.length > 1) {
        parents.reverse();
        newParent = currentNode = filterNode(parents[0].clone());
        for (i = 0; i < parents.length - 1; i++) {
          if (schema.isValidChild(currentNode.name, parents[i].name)) {
            tempNode = filterNode(parents[i].clone());
            currentNode.append(tempNode);
          } else {
            tempNode = currentNode;
          }
          for (childNode = parents[i].firstChild; childNode && childNode !== parents[i + 1];) {
            nextNode = childNode.next;
            tempNode.append(childNode);
            childNode = nextNode;
          }
          currentNode = tempNode;
        }
        if (!isEmpty(schema, nonEmptyElements, whitespaceElements, newParent)) {
          parent.insert(newParent, parents[0], true);
          parent.insert(node, newParent);
        } else {
          parent.insert(node, parents[0], true);
        }
        parent = parents[0];
        if (isEmpty(schema, nonEmptyElements, whitespaceElements, parent) || hasOnlyChild(parent, 'br')) {
          parent.empty().remove();
        }
      } else if (node.parent) {
        if (node.name === 'li') {
          sibling = node.prev;
          if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
            sibling.append(node);
            continue;
          }
          sibling = node.next;
          if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
            sibling.insert(node, sibling.firstChild, true);
            continue;
          }
          node.wrap(filterNode(new Node('ul', 1)));
          continue;
        }
        if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
          node.wrap(filterNode(new Node('div', 1)));
        } else {
          if (specialElements[node.name]) {
            node.empty().remove();
          } else {
            node.unwrap();
          }
        }
      }
    }
  };
  var filterNode = function (node) {
    var i, name, list;
    name = node.name;
    if (name in nodeFilters) {
      list = matchedNodes[name];
      if (list) {
        list.push(node);
      } else {
        matchedNodes[name] = [node];
      }
    }
    i = attributeFilters.length;
    while (i--) {
      name = attributeFilters[i].name;
      if (name in node.attributes.map) {
        list = matchedAttributes[name];
        if (list) {
          list.push(node);
        } else {
          matchedAttributes[name] = [node];
        }
      }
    }
    return node;
  };
  var addNodeFilter = function (name, callback) {
    each$4(explode$2(name), function (name) {
      var list = nodeFilters[name];
      if (!list) {
        nodeFilters[name] = list = [];
      }
      list.push(callback);
    });
  };
  var getNodeFilters = function () {
    var out = [];
    for (var name_1 in nodeFilters) {
      if (nodeFilters.hasOwnProperty(name_1)) {
        out.push({
          name: name_1,
          callbacks: nodeFilters[name_1]
        });
      }
    }
    return out;
  };
  var addAttributeFilter = function (name, callback) {
    each$4(explode$2(name), function (name) {
      var i;
      for (i = 0; i < attributeFilters.length; i++) {
        if (attributeFilters[i].name === name) {
          attributeFilters[i].callbacks.push(callback);
          return;
        }
      }
      attributeFilters.push({
        name: name,
        callbacks: [callback]
      });
    });
  };
  var getAttributeFilters = function () {
    return [].concat(attributeFilters);
  };
  var parse = function (html, args) {
    var parser, nodes, i, l, fi, fl, list, name;
    var blockElements;
    var invalidChildren = [];
    var isInWhiteSpacePreservedElement;
    var node;
    var getRootBlockName = function (name) {
      if (name === false) {
        return '';
      } else if (name === true) {
        return 'p';
      } else {
        return name;
      }
    };
    args = args || {};
    matchedNodes = {};
    matchedAttributes = {};
    blockElements = extend$2(makeMap$3('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
    var nonEmptyElements = schema.getNonEmptyElements();
    var children = schema.children;
    var validate = settings.validate;
    var forcedRootBlockName = 'forced_root_block' in args ? args.forced_root_block : settings.forced_root_block;
    var rootBlockName = getRootBlockName(forcedRootBlockName);
    var whiteSpaceElements = schema.getWhiteSpaceElements();
    var startWhiteSpaceRegExp = /^[ \t\r\n]+/;
    var endWhiteSpaceRegExp = /[ \t\r\n]+$/;
    var allWhiteSpaceRegExp = /[ \t\r\n]+/g;
    var isAllWhiteSpaceRegExp = /^[ \t\r\n]+$/;
    isInWhiteSpacePreservedElement = whiteSpaceElements.hasOwnProperty(args.context) || whiteSpaceElements.hasOwnProperty(settings.root_name);
    var addRootBlocks = function () {
      var node = rootNode.firstChild, next, rootBlockNode;
      var trim = function (rootBlockNode) {
        if (rootBlockNode) {
          node = rootBlockNode.firstChild;
          if (node && node.type === 3) {
            node.value = node.value.replace(startWhiteSpaceRegExp, '');
          }
          node = rootBlockNode.lastChild;
          if (node && node.type === 3) {
            node.value = node.value.replace(endWhiteSpaceRegExp, '');
          }
        }
      };
      if (!schema.isValidChild(rootNode.name, rootBlockName.toLowerCase())) {
        return;
      }
      while (node) {
        next = node.next;
        if (node.type === 3 || node.type === 1 && node.name !== 'p' && !blockElements[node.name] && !node.attr('data-mce-type')) {
          if (!rootBlockNode) {
            rootBlockNode = createNode(rootBlockName, 1);
            rootBlockNode.attr(settings.forced_root_block_attrs);
            rootNode.insert(rootBlockNode, node);
            rootBlockNode.append(node);
          } else {
            rootBlockNode.append(node);
          }
        } else {
          trim(rootBlockNode);
          rootBlockNode = null;
        }
        node = next;
      }
      trim(rootBlockNode);
    };
    var createNode = function (name, type) {
      var node = new Node(name, type);
      var list;
      if (name in nodeFilters) {
        list = matchedNodes[name];
        if (list) {
          list.push(node);
        } else {
          matchedNodes[name] = [node];
        }
      }
      return node;
    };
    var removeWhitespaceBefore = function (node) {
      var textNode, textNodeNext, textVal, sibling;
      var blockElements = schema.getBlockElements();
      for (textNode = node.prev; textNode && textNode.type === 3;) {
        textVal = textNode.value.replace(endWhiteSpaceRegExp, '');
        if (textVal.length > 0) {
          textNode.value = textVal;
          return;
        }
        textNodeNext = textNode.next;
        if (textNodeNext) {
          if (textNodeNext.type === 3 && textNodeNext.value.length) {
            textNode = textNode.prev;
            continue;
          }
          if (!blockElements[textNodeNext.name] && textNodeNext.name !== 'script' && textNodeNext.name !== 'style') {
            textNode = textNode.prev;
            continue;
          }
        }
        sibling = textNode.prev;
        textNode.remove();
        textNode = sibling;
      }
    };
    var cloneAndExcludeBlocks = function (input) {
      var name;
      var output = {};
      for (name in input) {
        if (name !== 'li' && name !== 'p') {
          output[name] = input[name];
        }
      }
      return output;
    };
    parser = SaxParser$1({
      validate: validate,
      allow_script_urls: settings.allow_script_urls,
      allow_conditional_comments: settings.allow_conditional_comments,
      preserve_cdata: settings.preserve_cdata,
      self_closing_elements: cloneAndExcludeBlocks(schema.getSelfClosingElements()),
      cdata: function (text) {
        node.append(createNode('#cdata', 4)).value = text;
      },
      text: function (text, raw) {
        var textNode;
        if (!isInWhiteSpacePreservedElement) {
          text = text.replace(allWhiteSpaceRegExp, ' ');
          if (isLineBreakNode(node.lastChild, blockElements)) {
            text = text.replace(startWhiteSpaceRegExp, '');
          }
        }
        if (text.length !== 0) {
          textNode = createNode('#text', 3);
          textNode.raw = !!raw;
          node.append(textNode).value = text;
        }
      },
      comment: function (text) {
        node.append(createNode('#comment', 8)).value = text;
      },
      pi: function (name, text) {
        node.append(createNode(name, 7)).value = text;
        removeWhitespaceBefore(node);
      },
      doctype: function (text) {
        var newNode;
        newNode = node.append(createNode('#doctype', 10));
        newNode.value = text;
        removeWhitespaceBefore(node);
      },
      start: function (name, attrs, empty) {
        var newNode, attrFiltersLen, elementRule, attrName, parent;
        elementRule = validate ? schema.getElementRule(name) : {};
        if (elementRule) {
          newNode = createNode(elementRule.outputName || name, 1);
          newNode.attributes = attrs;
          newNode.shortEnded = empty;
          node.append(newNode);
          parent = children[node.name];
          if (parent && children[newNode.name] && !parent[newNode.name]) {
            invalidChildren.push(newNode);
          }
          attrFiltersLen = attributeFilters.length;
          while (attrFiltersLen--) {
            attrName = attributeFilters[attrFiltersLen].name;
            if (attrName in attrs.map) {
              list = matchedAttributes[attrName];
              if (list) {
                list.push(newNode);
              } else {
                matchedAttributes[attrName] = [newNode];
              }
            }
          }
          if (blockElements[name]) {
            removeWhitespaceBefore(newNode);
          }
          if (!empty) {
            node = newNode;
          }
          if (!isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
            isInWhiteSpacePreservedElement = true;
          }
        }
      },
      end: function (name) {
        var textNode, elementRule, text, sibling, tempNode;
        elementRule = validate ? schema.getElementRule(name) : {};
        if (elementRule) {
          if (blockElements[name]) {
            if (!isInWhiteSpacePreservedElement) {
              textNode = node.firstChild;
              if (textNode && textNode.type === 3) {
                text = textNode.value.replace(startWhiteSpaceRegExp, '');
                if (text.length > 0) {
                  textNode.value = text;
                  textNode = textNode.next;
                } else {
                  sibling = textNode.next;
                  textNode.remove();
                  textNode = sibling;
                  while (textNode && textNode.type === 3) {
                    text = textNode.value;
                    sibling = textNode.next;
                    if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
                      textNode.remove();
                      textNode = sibling;
                    }
                    textNode = sibling;
                  }
                }
              }
              textNode = node.lastChild;
              if (textNode && textNode.type === 3) {
                text = textNode.value.replace(endWhiteSpaceRegExp, '');
                if (text.length > 0) {
                  textNode.value = text;
                  textNode = textNode.prev;
                } else {
                  sibling = textNode.prev;
                  textNode.remove();
                  textNode = sibling;
                  while (textNode && textNode.type === 3) {
                    text = textNode.value;
                    sibling = textNode.prev;
                    if (text.length === 0 || isAllWhiteSpaceRegExp.test(text)) {
                      textNode.remove();
                      textNode = sibling;
                    }
                    textNode = sibling;
                  }
                }
              }
            }
          }
          if (isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
            isInWhiteSpacePreservedElement = false;
          }
          if (elementRule.removeEmpty && isEmpty(schema, nonEmptyElements, whiteSpaceElements, node)) {
            tempNode = node.parent;
            if (blockElements[node.name]) {
              node.empty().remove();
            } else {
              node.unwrap();
            }
            node = tempNode;
            return;
          }
          if (elementRule.paddEmpty && (isPaddedWithNbsp(node) || isEmpty(schema, nonEmptyElements, whiteSpaceElements, node))) {
            paddEmptyNode(settings, args, blockElements, node);
          }
          node = node.parent;
        }
      }
    }, schema);
    var rootNode = node = new Node(args.context || settings.root_name, 11);
    parser.parse(html, args.format);
    if (validate && invalidChildren.length) {
      if (!args.context) {
        fixInvalidChildren(invalidChildren);
      } else {
        args.invalid = true;
      }
    }
    if (rootBlockName && (rootNode.name === 'body' || args.isRootContent)) {
      addRootBlocks();
    }
    if (!args.invalid) {
      for (name in matchedNodes) {
        if (!matchedNodes.hasOwnProperty(name)) {
          continue;
        }
        list = nodeFilters[name];
        nodes = matchedNodes[name];
        fi = nodes.length;
        while (fi--) {
          if (!nodes[fi].parent) {
            nodes.splice(fi, 1);
          }
        }
        for (i = 0, l = list.length; i < l; i++) {
          list[i](nodes, name, args);
        }
      }
      for (i = 0, l = attributeFilters.length; i < l; i++) {
        list = attributeFilters[i];
        if (list.name in matchedAttributes) {
          nodes = matchedAttributes[list.name];
          fi = nodes.length;
          while (fi--) {
            if (!nodes[fi].parent) {
              nodes.splice(fi, 1);
            }
          }
          for (fi = 0, fl = list.callbacks.length; fi < fl; fi++) {
            list.callbacks[fi](nodes, list.name, args);
          }
        }
      }
    }
    return rootNode;
  };
  var exports = {
    schema: schema,
    addAttributeFilter: addAttributeFilter,
    getAttributeFilters: getAttributeFilters,
    addNodeFilter: addNodeFilter,
    getNodeFilters: getNodeFilters,
    filterNode: filterNode,
    parse: parse
  };
  register$1(exports, settings);
  register(exports, settings);
  return exports;
};

var makeMap$4 = Tools.makeMap;
var Writer = function (settings) {
  var html = [];
  var indent, indentBefore, indentAfter, encode, htmlOutput;
  settings = settings || {};
  indent = settings.indent;
  indentBefore = makeMap$4(settings.indent_before || '');
  indentAfter = makeMap$4(settings.indent_after || '');
  encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
  htmlOutput = settings.element_format === 'html';
  return {
    start: function (name, attrs, empty) {
      var i, l, attr, value;
      if (indent && indentBefore[name] && html.length > 0) {
        value = html[html.length - 1];
        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
      html.push('<', name);
      if (attrs) {
        for (i = 0, l = attrs.length; i < l; i++) {
          attr = attrs[i];
          html.push(' ', attr.name, '="', encode(attr.value, true), '"');
        }
      }
      if (!empty || htmlOutput) {
        html[html.length] = '>';
      } else {
        html[html.length] = ' />';
      }
      if (empty && indent && indentAfter[name] && html.length > 0) {
        value = html[html.length - 1];
        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
    },
    end: function (name) {
      var value;
      html.push('</', name, '>');
      if (indent && indentAfter[name] && html.length > 0) {
        value = html[html.length - 1];
        if (value.length > 0 && value !== '\n') {
          html.push('\n');
        }
      }
    },
    text: function (text, raw) {
      if (text.length > 0) {
        html[html.length] = raw ? text : encode(text);
      }
    },
    cdata: function (text) {
      html.push('<![CDATA[', text, ']]>');
    },
    comment: function (text) {
      html.push('<!--', text, '-->');
    },
    pi: function (name, text) {
      if (text) {
        html.push('<?', name, ' ', encode(text), '?>');
      } else {
        html.push('<?', name, '?>');
      }
      if (indent) {
        html.push('\n');
      }
    },
    doctype: function (text) {
      html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
    },
    reset: function () {
      html.length = 0;
    },
    getContent: function () {
      return html.join('').replace(/\n$/, '');
    }
  };
};

var Serializer = function (settings, schema) {
  if (schema === void 0) {
    schema = Schema();
  }
  var writer = Writer(settings);
  settings = settings || {};
  settings.validate = 'validate' in settings ? settings.validate : true;
  var serialize = function (node) {
    var handlers, validate;
    validate = settings.validate;
    handlers = {
      3: function (node) {
        writer.text(node.value, node.raw);
      },
      8: function (node) {
        writer.comment(node.value);
      },
      7: function (node) {
        writer.pi(node.name, node.value);
      },
      10: function (node) {
        writer.doctype(node.value);
      },
      4: function (node) {
        writer.cdata(node.value);
      },
      11: function (node) {
        if (node = node.firstChild) {
          do {
            walk(node);
          } while (node = node.next);
        }
      }
    };
    writer.reset();
    var walk = function (node) {
      var handler = handlers[node.type];
      var name, isEmpty, attrs, attrName, attrValue, sortedAttrs, i, l, elementRule;
      if (!handler) {
        name = node.name;
        isEmpty = node.shortEnded;
        attrs = node.attributes;
        if (validate && attrs && attrs.length > 1) {
          sortedAttrs = [];
          sortedAttrs.map = {};
          elementRule = schema.getElementRule(node.name);
          if (elementRule) {
            for (i = 0, l = elementRule.attributesOrder.length; i < l; i++) {
              attrName = elementRule.attributesOrder[i];
              if (attrName in attrs.map) {
                attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({
                  name: attrName,
                  value: attrValue
                });
              }
            }
            for (i = 0, l = attrs.length; i < l; i++) {
              attrName = attrs[i].name;
              if (!(attrName in sortedAttrs.map)) {
                attrValue = attrs.map[attrName];
                sortedAttrs.map[attrName] = attrValue;
                sortedAttrs.push({
                  name: attrName,
                  value: attrValue
                });
              }
            }
            attrs = sortedAttrs;
          }
        }
        writer.start(node.name, attrs, isEmpty);
        if (!isEmpty) {
          if (node = node.firstChild) {
            do {
              walk(node);
            } while (node = node.next);
          }
          writer.end(name);
        }
      } else {
        handler(node);
      }
    };
    if (node.type === 1 && !settings.inner) {
      walk(node);
    } else {
      handlers[11](node);
    }
    return writer.getContent();
  };
  return { serialize: serialize };
};

var getRetainStyleProps = function (editor) {
  return editor.getParam('paste_retain_style_properties');
};
var getWordValidElements = function (editor) {
  var defaultValidElements = '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,' + '-p/div,-a[href|name],sub,sup,strike,br,del,table[width],tr,' + 'td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody';
  return editor.getParam('paste_word_valid_elements', defaultValidElements);
};
var shouldConvertWordFakeLists = function (editor) {
  return editor.getParam('paste_convert_word_fake_lists', true);
};
var shouldUseDefaultFilters = function (editor) {
  return editor.getParam('paste_enable_default_filters', true);
};

function filter$1(content, items) {
  Tools.each(items, function (v) {
    if (v.constructor === RegExp) {
      content = content.replace(v, '');
    } else {
      content = content.replace(v[0], v[1]);
    }
  });
  return content;
}

function isWordContent(content) {
  return /<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i.test(content) || /class="OutlineElement/.test(content) || /id="?docs\-internal\-guid\-/.test(content);
}
function isNumericList(text) {
  var found, patterns;
  patterns = [
    /^[IVXLMCD]{1,2}\.[ \u00a0]/,
    /^[ivxlmcd]{1,2}\.[ \u00a0]/,
    /^[a-z]{1,2}[\.\)][ \u00a0]/,
    /^[A-Z]{1,2}[\.\)][ \u00a0]/,
    /^[0-9]+\.[ \u00a0]/,
    /^[\u3007\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d]+\.[ \u00a0]/,
    /^[\u58f1\u5f10\u53c2\u56db\u4f0d\u516d\u4e03\u516b\u4e5d\u62fe]+\.[ \u00a0]/
  ];
  text = text.replace(/^[\u00a0 ]+/, '');
  Tools.each(patterns, function (pattern) {
    if (pattern.test(text)) {
      found = true;
      return false;
    }
  });
  return found;
}
function isBulletList(text) {
  return /^[\s\u00a0]*[\u2022\u00b7\u00a7\u25CF]\s*/.test(text);
}
function convertFakeListsToProperLists(node) {
  var currentListNode, prevListNode, lastLevel = 1;
  function getText(node) {
    var txt = '';
    if (node.type === 3) {
      return node.value;
    }
    if (node = node.firstChild) {
      do {
        txt += getText(node);
      } while (node = node.next);
    }
    return txt;
  }
  function trimListStart(node, regExp) {
    if (node.type === 3) {
      if (regExp.test(node.value)) {
        node.value = node.value.replace(regExp, '');
        return false;
      }
    }
    if (node = node.firstChild) {
      do {
        if (!trimListStart(node, regExp)) {
          return false;
        }
      } while (node = node.next);
    }
    return true;
  }
  function removeIgnoredNodes(node) {
    if (node._listIgnore) {
      node.remove();
      return;
    }
    if (node = node.firstChild) {
      do {
        removeIgnoredNodes(node);
      } while (node = node.next);
    }
  }
  function convertParagraphToLi(paragraphNode, listName, start) {
    var level = paragraphNode._listLevel || lastLevel;
    if (level !== lastLevel) {
      if (level < lastLevel) {
        if (currentListNode) {
          currentListNode = currentListNode.parent.parent;
        }
      } else {
        prevListNode = currentListNode;
        currentListNode = null;
      }
    }
    if (!currentListNode || currentListNode.name !== listName) {
      prevListNode = prevListNode || currentListNode;
      currentListNode = new Node(listName, 1);
      if (start > 1) {
        currentListNode.attr('start', '' + start);
      }
      paragraphNode.wrap(currentListNode);
    } else {
      currentListNode.append(paragraphNode);
    }
    paragraphNode.name = 'li';
    if (level > lastLevel && prevListNode) {
      prevListNode.lastChild.append(currentListNode);
    }
    lastLevel = level;
    removeIgnoredNodes(paragraphNode);
    trimListStart(paragraphNode, /^\u00a0+/);
    trimListStart(paragraphNode, /^\s*([\u2022\u00b7\u00a7\u25CF]|\w+\.)/);
    trimListStart(paragraphNode, /^\u00a0+/);
  }
  var elements = [];
  var child = node.firstChild;
  while (typeof child !== 'undefined' && child !== null) {
    elements.push(child);
    child = child.walk();
    if (child !== null) {
      while (typeof child !== 'undefined' && child.parent !== node) {
        child = child.walk();
      }
    }
  }
  for (var i = 0; i < elements.length; i++) {
    node = elements[i];
    if (node.name === 'p' && node.firstChild) {
      var nodeText = getText(node);
      if (isBulletList(nodeText)) {
        convertParagraphToLi(node, 'ul');
        continue;
      }
      if (isNumericList(nodeText)) {
        var matches = /([0-9]+)\./.exec(nodeText);
        var start = 1;
        if (matches) {
          start = parseInt(matches[1], 10);
        }
        convertParagraphToLi(node, 'ol', start);
        continue;
      }
      if (node._listLevel) {
        convertParagraphToLi(node, 'ul', 1);
        continue;
      }
      currentListNode = null;
    } else {
      prevListNode = currentListNode;
      currentListNode = null;
    }
  }
}
function filterStyles(editor, validStyles, node, styleValue) {
  var outputStyles = {}, matches;
  var styles = editor.dom.parseStyle(styleValue);
  Tools.each(styles, function (value, name) {
    switch (name) {
    case 'mso-list':
      matches = /\w+ \w+([0-9]+)/i.exec(styleValue);
      if (matches) {
        node._listLevel = parseInt(matches[1], 10);
      }
      if (/Ignore/i.test(value) && node.firstChild) {
        node._listIgnore = true;
        node.firstChild._listIgnore = true;
      }
      break;
    case 'horiz-align':
      name = 'text-align';
      break;
    case 'vert-align':
      name = 'vertical-align';
      break;
    case 'font-color':
    case 'mso-foreground':
      name = 'color';
      break;
    case 'mso-background':
    case 'mso-highlight':
      name = 'background';
      break;
    case 'font-weight':
    case 'font-style':
      if (value !== 'normal') {
        outputStyles[name] = value;
      }
      return;
    case 'mso-element':
      if (/^(comment|comment-list)$/i.test(value)) {
        node.remove();
        return;
      }
      break;
    }
    if (name.indexOf('mso-comment') === 0) {
      node.remove();
      return;
    }
    if (name.indexOf('mso-') === 0) {
      return;
    }
    if (getRetainStyleProps(editor) === 'all' || validStyles && validStyles[name]) {
      outputStyles[name] = value;
    }
  });
  if (/(bold)/i.test(outputStyles['font-weight'])) {
    delete outputStyles['font-weight'];
    node.wrap(new Node('b', 1));
  }
  if (/(italic)/i.test(outputStyles['font-style'])) {
    delete outputStyles['font-style'];
    node.wrap(new Node('i', 1));
  }
  outputStyles = editor.dom.serializeStyle(outputStyles, node.name);
  if (outputStyles) {
    return outputStyles;
  }
  return null;
}
var filterWordContent = function (editor, content) {
  var retainStyleProperties, validStyles;
  retainStyleProperties = getRetainStyleProps(editor);
  if (retainStyleProperties) {
    validStyles = Tools.makeMap(retainStyleProperties.split(/[, ]/));
  }
  content = filter$1(content, [
    /<br class="?Apple-interchange-newline"?>/gi,
    /<b[^>]+id="?docs-internal-[^>]*>/gi,
    /<!--[\s\S]+?-->/gi,
    /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,
    [
      /<(\/?)s>/gi,
      '<$1strike>'
    ],
    [
      /&nbsp;/gi,
      nbsp
    ],
    [
      /<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
      function (str, spaces) {
        return spaces.length > 0 ? spaces.replace(/./, ' ').slice(Math.floor(spaces.length / 2)).split('').join(nbsp) : '';
      }
    ]
  ]);
  var validElements = getWordValidElements(editor);
  var schema = Schema({
    valid_elements: validElements,
    valid_children: '-li[p]'
  });
  Tools.each(schema.elements, function (rule) {
    if (!rule.attributes.class) {
      rule.attributes.class = {};
      rule.attributesOrder.push('class');
    }
    if (!rule.attributes.style) {
      rule.attributes.style = {};
      rule.attributesOrder.push('style');
    }
  });
  var domParser = DomParser({}, schema);
  domParser.addAttributeFilter('style', function (nodes) {
    var i = nodes.length, node;
    while (i--) {
      node = nodes[i];
      node.attr('style', filterStyles(editor, validStyles, node, node.attr('style')));
      if (node.name === 'span' && node.parent && !node.attributes.length) {
        node.unwrap();
      }
    }
  });
  domParser.addAttributeFilter('class', function (nodes) {
    var i = nodes.length, node, className;
    while (i--) {
      node = nodes[i];
      className = node.attr('class');
      if (/^(MsoCommentReference|MsoCommentText|msoDel)$/i.test(className)) {
        node.remove();
      }
      node.attr('class', null);
    }
  });
  domParser.addNodeFilter('del', function (nodes) {
    var i = nodes.length;
    while (i--) {
      nodes[i].remove();
    }
  });
  domParser.addNodeFilter('a', function (nodes) {
    var i = nodes.length, node, href, name;
    while (i--) {
      node = nodes[i];
      href = node.attr('href');
      name = node.attr('name');
      if (href && href.indexOf('#_msocom_') !== -1) {
        node.remove();
        continue;
      }
      if (href && href.indexOf('file://') === 0) {
        href = href.split('#')[1];
        if (href) {
          href = '#' + href;
        }
      }
      if (!href && !name) {
        node.unwrap();
      } else {
        if (name && !/^_?(?:toc|edn|ftn)/i.test(name)) {
          node.unwrap();
          continue;
        }
        node.attr({
          href: href,
          name: name
        });
      }
    }
  });
  var rootNode = domParser.parse(content);
  if (shouldConvertWordFakeLists(editor)) {
    convertFakeListsToProperLists(rootNode);
  }
  content = Serializer({ validate: editor.settings.validate }, schema).serialize(rootNode);
  return content;
};
var preProcess = function (editor, content) {
  return shouldUseDefaultFilters(editor) ? filterWordContent(editor, content) : content;
};

exports.isWordContent = isWordContent;
exports.preProcess = preProcess;
