## TinyMCE Word Paste Filter (standalone)
Standalone filter for pasted MS Word HTML content; extracted from TinyMCE

[![npm version](https://badge.fury.io/js/tinymce-word-paste-filter.svg)](https://badge.fury.io/js/tinymce-word-paste-filter) [![Build Status](https://travis-ci.org/jasonphillips/tinymce-word-paste-filter.svg?branch=master) [![npm downloads](https://img.shields.io/npm/dm/tinymce-word-paste-filter.svg)](https://www.npmjs.com/package/tinymce-word-paste-filter)


### What?

This project provides a standalone version of the filter function used by TinyMCE to clean up pasted MS Word content. 

### Why?

TinyMCE has one of the best implementations of Word cleanup around; they have tackled pernicious problems like restoring list items to actual lists when these arrive as `<p>` tags with a lot of odd styles and bullet characters. However, TinyMCE is no tiny library, and does not export that capability by itself. 

This repo extracts just the Word cleanup capability from TinyMCE, export a sole filter function (and its internal dependencies) into a standalone library much smaller (contributes [~50k](https://bundlephobia.com/result?p=tinymce-word-paste-filter@0.7.0) if you minify your build) than the full TinyMCE (contribrutes at minimum [>400k](https://bundlephobia.com/result?p=tinymce@latest) to your project -- with the internal Word clean function not exposed), published on npm as `tinymce-word-paste-filter` for easy incorporation into other projects.

### How?

```js
import wordFilter from 'tinymce-word-paste-filter';

// if you have incoming pasted Word data in your program...
const awfulWordHTML = '...'; // content here

// clean it up in one step
const cleaned = wordFilter(awfulWordHTML); 
```

Typescript types are included.

Please note that this is intended to be bundled into browser applications; if running in a node environment for some reason, you'll need to have browser / dom globals (document, navigator, etc) available.

See the brief test under `./standalone/test/` and its fixtures.


### Building from source, testing

TinyMCE's build process is absolutely monstrous... with countless internal dependencies and remapped paths at every level. In order to pull out the minimal functionality here without all that bloat, the build first uses `rollup` to shake out the main components needed, then transpiles from there with `tsc`.

Make sure to update the submodule first.

```shell
git submodule update
yarn install
yarn run build
yarn run test
```
