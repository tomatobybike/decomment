import fs from 'fs'
import path from 'path'

const DIR = '.decomment'
const FILE = 'manifest.json'

export function ensureManifestDir(cwd) {
  const dir = path.join(cwd, DIR)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  return dir
}

export function writeManifest({ cwd, command, records }) {
  const dir = ensureManifestDir(cwd)
  const file = path.join(dir, FILE)

  const manifest = {
    id: new Date().toISOString(),
    cwd,
    command,
    files: records
  }

  fs.writeFileSync(file, JSON.stringify(manifest, null, 2))
  return file
}

export function readManifest(cwd) {
  const file = path.join(cwd, DIR, FILE)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
