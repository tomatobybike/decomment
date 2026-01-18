import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import { transformCode } from './transform.mjs'
import { loadConfig } from './config.mjs'

const defaultFileTypes = ['js', 'mjs', 'jsx', 'tsx', 'vue']

function generateGlobExample() {
  if (process.platform === 'win32') {
    return defaultFileTypes.map(ext => `"src/**/*.${ext}"`).join(' ')
  } else {
    return `"src/**/*.{${defaultFileTypes.join(',')}}"` 
  }
}

function printHelp() {
  const multiGlob = generateGlobExample()
  console.log(`
decomment - Remove comments from JS/JSX/TS/Vue files safely

Usage:
  decomment [options] <files/globs>

Options:
  --dry-run           Preview changes without writing files
  --keep <prefixes>   Comma-separated comment prefixes to keep (default: eslint-,@license,@preserve)
  --stats             Show number of comments removed/kept
  -h, --help          Show this help message

Examples:
  # Preview changes for all JS, MJS, JSX, TSX, Vue files
  decomment ${multiGlob} --dry-run --stats

  # Preview changes for all JS files only (single type)
  decomment "src/**/*.js" --dry-run --stats

  # Actually remove comments from JS and TS files, keeping eslint/license
  decomment "src/**/*.{js,ts}" --keep eslint-,@license --stats

  # Use decomment.config.js if no files specified
  decomment
  `)
}

function parseArgs(args) {
  const opts = { keep: [], dryRun: false, stats: false }
  const files = []

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--dry-run') opts.dryRun = true
    else if (a === '--keep') opts.keep = args[++i].split(',')
    else if (a === '--stats') opts.stats = true
    else if (a === '-h' || a === '--help') {
      printHelp()
      process.exit(0)
    }
    else files.push(a)
  }

  return { opts, files }
}

export async function run(argv) {
  const cwd = process.cwd()
  const { opts, files } = parseArgs(argv)
  const config = await loadConfig(cwd)

  const keep = opts.keep.length ? opts.keep : config.keep ?? ['eslint-', '@license', '@preserve']
  const patterns = files.length ? files : config.include ?? []
  if (!patterns.length) {
    console.error('❌ No input files or config include')
    printHelp()
    process.exit(1)
  }

  const targets = patterns.flatMap(p => globSync(p, { cwd, absolute: true }))
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

    // 备份
    let backupPath = abs + '.bak'
    if (fs.existsSync(backupPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      backupPath = `${abs}.${ts}.bak`
    }
    fs.writeFileSync(backupPath, code, 'utf8')

    // 写回
    fs.writeFileSync(abs, next, 'utf8')
    console.log(`✅ ${path.relative(cwd, abs)} (backup: ${path.basename(backupPath)})`)
  }

  if (opts.stats) {
    console.log(`\n📊 Stats: Removed ${totalStats.removed} comments, Kept ${totalStats.kept} comments`)
  }
}
