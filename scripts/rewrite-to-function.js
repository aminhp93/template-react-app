/**
 * This script use `jscodeshift` to rewrite function based component
 * in the form of `const Name = (props) => { ... }` to `function Name() { ... }`
 * for better debuggability.
 *
 * Usage:
 * npx jscodeshift -t scripts/rewrite-to-function.js src/components/messaging/*.tsx
 *
 * Ref: https://github.com/facebook/jscodeshift
 */

const componentLikeName = name => name[0] == name[0].toUpperCase()


module.exports = function(file, api) {
  const js = api.jscodeshift
  const source = js(file.source)

  source
    .find(js.VariableDeclaration, {
      kind: 'const',
      declarations: [{
        type: 'VariableDeclarator',
        init: {
          type: 'ArrowFunctionExpression'
        }
      }]
    })
    .filter(node => componentLikeName(
      node.value.declarations[0].id.name
    ))
    .replaceWith(node => {
      const declaration = node.value.declarations[0]
      const name = declaration.id.name
      const params = declaration.init.params
      const body = declaration.init.body.body || js.returnStatement(
        declaration.init.body
      )

      return js.template.statement`
        function ${name}(${params}) {
          ${body}
        }
      `
    })

  return source.toSource()
}

module.exports.parser = 'tsx'
