import fs from 'fs'
import path from 'path'

export function backupFile(file) {
  const bak = file + '.bak'
  fs.copyFileSync(file, bak)
}

export function restoreBackup() {
  const files = findBakFiles()
  for (const bak of files) {
    const original = bak.replace(/\.bak$/, '')
    fs.copyFileSync(bak, original)
    console.log('[restore]', original)
  }
}

export function cleanBackups() {
  const files = findBakFiles()
  for (const bak of files) {
    fs.unlinkSync(bak)
    console.log('[clean]', bak)
  }
}

function findBakFiles(dir = process.cwd(), result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) findBakFiles(full, result)
    else if (entry.name.endsWith('.bak')) result.push(full)
  }
  return result
}
