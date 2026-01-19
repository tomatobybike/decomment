import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import { transformCode } from './transform.mjs'
import { loadConfig } from './config.mjs'

const defaultFileTypes = ['js', 'mjs', 'jsx', 'tsx', 'vue']

const defaultGlob = `**/*.{${defaultFileTypes.join(',')}}`

const ignoreDirs = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**'
]

function printHelp() {
  console.log(`
decomment - Remove comments from JS/TS/Vue files safely

Usage:
  decomment [options] [files/globs]
  decomment restore
  decomment clean

Options:
  --dry-run           Preview changes without writing files
  --keep <prefixes>   Comma-separated comment prefixes to keep
  --stats             Show removed/kept counts
  -h, --help          Show help

Examples:
  decomment
  decomment "src/**/*.ts"
  decomment restore
  decomment clean
`)
}

function parseArgs(args) {
  const opts = { keep: [], dryRun: false, stats: false }
  const files = []
  let command = null

  for (let i = 0; i < args.length; i++) {
    const a = args[i]

    if (a === 'restore' || a === 'clean') command = a
    else if (a === '--dry-run') opts.dryRun = true
    else if (a === '--keep') opts.keep = args[++i].split(',')
    else if (a === '--stats') opts.stats = true
    else if (a === '-h' || a === '--help') {
      printHelp()
      process.exit(0)
    }
    else files.push(a)
  }

  return { opts, files, command }
}

function resolvePatterns(files, config) {
  if (files.length) return files
  if (config?.include?.length) return config.include
  return [defaultGlob]
}

function findTargets(patterns, cwd) {
  return patterns.flatMap(p =>
    globSync(p, {
      cwd,
      absolute: true,
      ignore: ignoreDirs
    })
  )
}

export async function run(argv) {
  const cwd = process.cwd()
  const { opts, files, command } = parseArgs(argv)
  const config = await loadConfig(cwd)

  const patterns = resolvePatterns(files, config)

  // ===== RESTORE =====
  if (command === 'restore') {
    const targets = findTargets(patterns, cwd)

    for (const abs of targets) {
      const bak = abs + '.decomment.bak'
      if (!fs.existsSync(bak)) continue

      if (opts.dryRun) {
        console.log(`↩️ [dry-run] restore ${path.relative(cwd, abs)}`)
        continue
      }

      fs.writeFileSync(abs, fs.readFileSync(bak, 'utf8'), 'utf8')
      console.log(`↩️ restored ${path.relative(cwd, abs)}`)
    }
    return
  }

  // ===== CLEAN =====
  if (command === 'clean') {
    const targets = findTargets(patterns, cwd)

    for (const abs of targets) {
      const bak = abs + '.decomment.bak'
      if (!fs.existsSync(bak)) continue

      if (opts.dryRun) {
        console.log(`🧹 [dry-run] remove ${path.relative(cwd, bak)}`)
        continue
      }

      fs.unlinkSync(bak)
      console.log(`🧹 removed ${path.relative(cwd, bak)}`)
    }
    return
  }

  // ===== STRIP COMMENTS =====

  const keep =
    opts.keep.length
      ? opts.keep
      : config?.keep ?? ['eslint-', '@license', '@preserve']

  const targets = findTargets(patterns, cwd)

  if (!targets.length) {
    console.warn('⚠️ No matched files')
    return
  }

  let totalStats = { removed: 0, kept: 0 }

  for (const abs of targets) {
    const code = fs.readFileSync(abs, 'utf8')
    const { code: next, stats } = transformCode(code, keep, { removed: 0, kept: 0 })

    totalStats.removed += stats.removed
    totalStats.kept += stats.kept

    if (opts.dryRun) {
      console.log(`🟡 [dry-run] ${path.relative(cwd, abs)}`)
      continue
    }

    const bak = abs + '.decomment.bak'
    fs.writeFileSync(bak, code, 'utf8')
    fs.writeFileSync(abs, next, 'utf8')

    console.log(`✅ ${path.relative(cwd, abs)} (backup created)`)
  }

  if (opts.stats) {
    console.log(`\n📊 Removed: ${totalStats.removed}, Kept: ${totalStats.kept}`)
  }
}
