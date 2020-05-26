// node entrypoint, to avoid error if included without browser globals
const noop = (content: string) => content
let main = noop

if (typeof(navigator)==='object' && typeof(window)==='object') {

  // include this mock if missing in env
  if (typeof(window.matchMedia)==='undefined') {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {}
      })
    })
  }

  main = require('./index').default
}

export default main
