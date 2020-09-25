/**
 * This script use `jscodeshift` to instrument components with
 * `Sentry.withProfiler`.
 *
 * Usage: npm run instrument src/components/PageTitle.ts
 *
 * Ref: https://github.com/facebook/jscodeshift
 */

const namedLikeClass = node => {
  const name = node.value.id.name
  return name[0] == name[0].toUpperCase()
}

module.exports = function(file, api) {
  const js = api.jscodeshift
  const source = js(file.source)

  const sentry = source.find(js.ImportDeclaration, {
    source: {
      value: '@sentry/react'
    }
  })

  if (!sentry.length) {
    source.find(js.ImportDeclaration).at(0).insertBefore(
      js.template.statement`
        import * as Sentry from '@sentry/react';
      `
    )
  }

  // class component
  let components = source.find(js.ClassDeclaration, {
    superClass: {
      object: {
        type: 'Identifier',
        name: 'React'
      }
    }
  })

  // function component
  if (!components.length) {
    components = source
      .find(js.FunctionDeclaration)
      .filter(namedLikeClass)
  }

  // export const Component = () => { ... }
  if (!components.length) {
    components = source
      .find(js.ExportNamedDeclaration, {
        declaration: {
          kind: 'const',
        }
      })
      .map(node => node.get('declaration', 'declarations', 0))
      .filter(namedLikeClass)
  }

  if (components.length) {
    const name = components.at(-1).get().value.id.name

    const defaultExport = source.find(js.ExportDefaultDeclaration)
    if (!defaultExport.length) {
      source.find(js.Program).get('body').get().push(
        js.template.statement`
          export default Sentry.withProfiler(${name}, { name: '${name}' });
        `
      )
    } else {
      const exportExpression = defaultExport.at(0)
      const withProfilerExpression = exportExpression.find(js.MemberExpression, {
        object: {
          type: 'Identifier',
          name: 'Sentry'
        },
        property: {
          type: 'Identifier',
          name: 'withProfiler',
        }
      })

      if (!withProfilerExpression.length) {
        exportExpression
          .find(js.Identifier, { name })
          .replaceWith(_ => js.template.expression`
            Sentry.withProfiler(${name}, {name: ${js.literal(name) }})
          `)
      }
    }
  }

  return source.toSource()
}

module.exports.parser = 'tsx'
