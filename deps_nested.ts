import {parse} from "@babel/parser";
import traverse from "@babel/traverse";
import {readFileSync} from "fs";
import {resolve, relative, dirname} from "path";

type DepRelation = {
  [key: string]: {
    deps: string[],
    code: string
  }
}

const projectRoot = resolve(__dirname, './deps_nested')

const depRelation: DepRelation = {}

const collectDepsAndCode = (filepath: string) => {
  const key = getRelativePath(filepath)
  const code = readFileSync(filepath).toString()
  const ast = parse(code, {sourceType: 'module'})

  depRelation[key] = {
    deps: [],
    code
  }

  traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        const absolutePath = resolve(dirname(filepath), item.node.source.value)
        const relativePath = getRelativePath(absolutePath)
        depRelation[key].deps.push(relativePath)
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