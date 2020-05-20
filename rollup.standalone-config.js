const swag = require('@ephox/swag')

export default [
// WordFilter
  {
    input: 'tinymce/modules/tinymce/lib/plugins/paste/main/ts/core/WordFilter',
    output: {
      file:  'standalone/WordFilter.js',
      format: 'cjs'
    },
    plugins: [
      swag.nodeResolve({
        basedir: __dirname,
        prefixes: {
          'tinymce/core': 'tinymce/modules/tinymce/lib/core/main/ts',
        }
      }),
      swag.remapImports()
    ],
    treeshake: {
      moduleSideEffects: true
    }
  },
// Styles
  {
    input: 'tinymce/modules/tinymce/lib/core/main/ts/api/html/Styles',
    output: {
      file:  'standalone/Styles.js',
      format: 'cjs'
    },
    plugins: [
      swag.nodeResolve({
        basedir: __dirname,
        prefixes: {
          'tinymce/core': 'tinymce/modules/tinymce/lib/core/main/ts',
        }
      }),
      swag.remapImports()
    ],
    treeshake: {
      moduleSideEffects: true
    }
  }
]