import {parse} from "@babel/parser";
import traverse from "@babel/traverse";
import {readFileSync} from "fs";
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

console.log(depRelation)