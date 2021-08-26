import {parse} from "@babel/parser";
import traverse from "@babel/traverse";
import {readFileSync, writeFileSync} from "fs";
import {resolve, relative, dirname} from "path";
import * as babel from '@babel/core'

type DepRelation = {
  key: string,
  deps: string[],
  code: string | undefined | null
}

const projectRoot = resolve(__dirname, './bundler')

const depRelation: DepRelation[] = []

const collectDepsAndCode = (filepath: string) => {
  const key = getRelativePath(filepath)

  if (depRelation.find(i => i.key === key)) return

  const code = readFileSync(filepath).toString()
  const ast = parse(code, {sourceType: 'module'})
  const result = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
  const dr: DepRelation = {
    key,
    deps: [],
    code: result?.code
  }

  depRelation.push(dr)

  traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        const absolutePath = resolve(dirname(filepath), item.node.source.value)
        const relativePath = getRelativePath(absolutePath)
        dr.deps.push(relativePath)
        collectDepsAndCode(absolutePath)
      }
    }
  })
}

const getRelativePath = (path: string) => {
  return relative(projectRoot, path).replace(/\\/g, '/')
}

collectDepsAndCode(resolve(projectRoot, 'index.js'))

let code = ''

code += `var depRelation = [
  ${depRelation.map(dr => `{
    key: ${JSON.stringify(dr.key)},
    deps: ${JSON.stringify(dr.deps)},
    code: function(require, module, exports) {
      ${dr.code}
    },
  }`).join(',')}
]

var modules = {}

function pathToKey(dirname, path) {
  return (dirname + path).replace(/\\.\\//g, '').replace(/\\/\\//, '/')
}

function execute(key) {
  if (modules[key]) { return modules[key] }
  var dr
  for (var i = 0; i<depRelation.length; i++) {
    if(depRelation[i].key === key) {
      dr = depRelation[i]
      break
    }
  }
  var require = function (path) {
    var dirname = key.substring(0, key.lastIndexOf('/') + 1)
    return execute(pathToKey(dirname, path))
  }
  var exports = {__esModule: true}
  var module = {exports: exports}
  modules[key] = exports
  dr.code(require, module, modules[key])
  return modules[key]
}

execute(depRelation[0].key)
`

writeFileSync(resolve(projectRoot, './dist.js'), code)