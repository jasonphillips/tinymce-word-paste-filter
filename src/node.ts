// node entrypoint, to avoid error if included without browser globals
const noop = (content: string) => content
let main = noop

if (typeof(navigator)==='object') {
  main = require('./index').default
}

export default main

