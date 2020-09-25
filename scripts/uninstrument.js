/**
 * This script use `jscodeshift` to un-instrument components with
 * `Sentry.withProfiler`.
 *
 * Usage: npm run uninstrument src/components/PageTitle.ts
 *
 * Ref: https://github.com/facebook/jscodeshift
 */

module.exports = function(file, api) {
  const js = api.jscodeshift
  const source = js(file.source)

  source.find(js.ImportDeclaration, {
    source: {
      value: '@sentry/react'
    }
  }).remove()

  source.find(js.CallExpression, {
    callee: {
      object: {
        name: 'Sentry'
      },
      property: {
        name: 'withProfiler',
      }
    }
  }).replaceWith(node => node.value.arguments[0])

  return source.toSource()
}

module.exports.parser = 'tsx'
