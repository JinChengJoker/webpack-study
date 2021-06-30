import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { readFileSync } from "fs";
import path, { dirname, resolve } from "path";
import * as babel from '@babel/core'

type DepRelation = {
  [key: string]: {
    deps: string[],
    code: string | null | undefined
  }
}

const projectRoot = resolve(__dirname, './bundle')

const depRelation: DepRelation = {}

const collectDepsAndCode = (filepath: string) => {
  const key = path.parse(filepath).base

  if (Object.keys(depRelation).includes(key)) return

  const code = readFileSync(filepath).toString()
  const ast = parse(code, { sourceType: 'module' })
  const result = babel.transformSync(code, {
    presets: ['@babel/preset-env']
  })

  depRelation[key] = {
    deps: [],
    code: result?.code
  }

  traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        depRelation[key].deps.push(item.node.source.value)
        collectDepsAndCode(resolve(dirname(filepath), item.node.source.value))
      }
    }
  })
}

collectDepsAndCode(resolve(projectRoot, 'index.js'))

console.log(depRelation)