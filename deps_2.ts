import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { readFileSync } from "fs";
import path, { dirname, resolve } from "path";

type DepRelation = {
  [key: string]: {
    deps: string[],
    code: string
  }
}

const projectRoot = resolve(__dirname, './deps_2')

const depRelation: DepRelation = {}

const collectDepsAndCode = (filepath: string) => {
  const key = path.parse(filepath).base
  const code = readFileSync(filepath).toString()
  const ast = parse(code, { sourceType: 'module' })

  depRelation[key] = {
    deps: [],
    code
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