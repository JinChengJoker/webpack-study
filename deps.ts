import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { readFileSync } from "fs";
import { resolve } from "path";

type DepRelation = {
  deps: string[],
  code: string
}

const projectRoot = resolve(__dirname, './deps')

const depRelation: DepRelation = {
  deps: [],
  code: '',
}

const collectDepsAndCode = (filepath: string) => {
  const code = readFileSync(filepath).toString()
  const ast = parse(code, { sourceType: 'module' })

  depRelation.code = code

  traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        depRelation.deps.push(item.node.source.value)
      }
    }
  })
}

collectDepsAndCode(resolve(projectRoot, 'index.js'))

console.log(depRelation)