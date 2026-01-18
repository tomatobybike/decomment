import fs from 'fs'
import path from 'path'

export const loadConfig = async (cwd) => {
  const js = path.join(cwd, 'decomment.config.js')
  const json = path.join(cwd, 'decomment.config.json')

  if (fs.existsSync(js)) {
    return (await import(js)).default
  }

  if (fs.existsSync(json)) {
    return JSON.parse(fs.readFileSync(json, 'utf8'))
  }

  return {}
}
