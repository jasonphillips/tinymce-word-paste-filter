const assert = require('assert');
const {JSDOM} = require('jsdom');

const wordInput = require('./fixtures/wordInput');
const cleanedOutput = require('./fixtures/cleanedOutput');
const complexInput = require('./fixtures/complexInput');
const complexCleanedOutput = require('./fixtures/complexCleanedOutput');

const dom = new JSDOM();
const {document, navigator, URL} = dom.window;
global.document = document;
global.navigator = navigator;
global.URL = URL;
global.window = dom.window;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // deprecated
        removeListener: () => {}, // deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      };
    },
  });

const filterWord = require('../').default;

describe('fitlers MS Word content', function () {
    it('transforms lists; cleans up styles', function () {
        const result = filterWord(wordInput);
        assert.equal(result, cleanedOutput);
    });

    it('leaves non-Word content untouched', function () {
        const content = `<p style="font-weight:bold">hello world</p>`;
        const result = filterWord(content);
        assert.equal(result, content);
    });

    it('handles a complex case', function () {
        const result = filterWord(complexInput);
        assert.equal(result, complexCleanedOutput);
    });
});
