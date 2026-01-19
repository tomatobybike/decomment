import { parse } from '@babel/parser'
import { traverseFn, generateFn } from './babel.mjs'

function filterComments(comments, keep, stats) {
  if (!Array.isArray(comments)) return comments
  const kept = []
  for (const comment of comments) {
    const text = comment.value.trim()
    if (keep.some(k => text.startsWith(k))) {
      kept.push(comment)
      // eslint-disable-next-line no-param-reassign
      stats.kept++
    } else {
      // eslint-disable-next-line no-param-reassign
      stats.removed++
    }
  }
  return kept
}

export function transformCode(code, keep, stats = { removed: 0, kept: 0 }) {
  const ast = parse(code, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript', 'vue']
  })

  traverseFn(ast, {
    enter(path) {
      const {node} = path
      if (node.leadingComments) node.leadingComments = filterComments(node.leadingComments, keep, stats)
      if (node.trailingComments) node.trailingComments = filterComments(node.trailingComments, keep, stats)
      if (node.innerComments) node.innerComments = filterComments(node.innerComments, keep, stats)
    }
  })

  const codeOut = generateFn(ast, { comments: true }).code
  return { code: codeOut, stats }
}
