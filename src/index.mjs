import fs from 'fs'
import { globSync } from 'glob'
import path from 'path'

import { loadConfig } from './config.mjs'

import { readManifest, writeManifest } from './manifest.mjs'
import { transformCode } from './transform.mjs'

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
    } else files.push(a)
  }

  return { opts, files, command }
}

function resolvePatterns(files, config) {
  if (files.length) return files
  if (config?.include?.length) return config.include
  return [defaultGlob]
}

function findTargets(patterns, cwd) {
  return patterns.flatMap((p) =>
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

  // ===== RESTORE =====
  if (command === 'restore') {
    const manifest = readManifest(cwd)
    if (!manifest) {
      console.warn('⚠️ No manifest found')
      return
    }

    for (const { file, backup } of manifest.files) {
      if (!fs.existsSync(backup)) continue

      if (opts.dryRun) {
        console.log(`↩️ [dry-run] restore ${file}`)
        continue
      }

      fs.writeFileSync(file, fs.readFileSync(backup, 'utf8'), 'utf8')
      console.log(`↩️ restored ${file}`)
    }

    return
  }

  // ===== CLEAN =====
  if (command === 'clean') {
    const manifest = readManifest(cwd)
    if (!manifest) {
      console.warn('⚠️ No manifest found')
      return
    }

    for (const { backup } of manifest.files) {
      if (!fs.existsSync(backup)) continue

      if (opts.dryRun) {
        console.log(`🧹 [dry-run] remove ${backup}`)
        continue
      }

      fs.unlinkSync(backup)
      console.log(`🧹 removed ${backup}`)
    }

    return
  }

  // ===== STRIP COMMENTS =====

  const patterns = resolvePatterns(files, config)

  const keep = opts.keep.length
    ? opts.keep
    : (config?.keep ?? ['eslint-', '@license', '@preserve'])

  const targets = findTargets(patterns, cwd)

  if (!targets.length) {
    console.warn('⚠️ No matched files')
    return
  }

  const totalStats = { removed: 0, kept: 0 }
  const records = []

  for (const abs of targets) {
    const code = fs.readFileSync(abs, 'utf8')
    const { code: next, stats } = transformCode(code, keep, {
      removed: 0,
      kept: 0
    })

    totalStats.removed += stats.removed
    totalStats.kept += stats.kept

    const rel = path.relative(cwd, abs)
    const bak = `${abs}.decomment.bak`

    if (opts.dryRun) {
      console.log(`🟡 [dry-run] ${rel}`)
      continue
    }

    fs.writeFileSync(bak, code, 'utf8')
    fs.writeFileSync(abs, next, 'utf8')

    records.push({
      file: rel,
      backup: bak
    })

    console.log(`✅ ${rel} (backup created)`)
  }

  if (!opts.dryRun && records.length) {
    writeManifest({
      cwd,
      command: `decomment ${patterns.join(' ')}`,
      records
    })
  }

  if (opts.stats) {
    console.log(`\n📊 Removed: ${totalStats.removed}, Kept: ${totalStats.kept}`)
  }
}
