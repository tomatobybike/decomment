// import fs from 'fs'
// import path from 'path'

// export const loadConfig = async (cwd) => {
//   const js = path.join(cwd, 'decomment.config.js')
//   const json = path.join(cwd, 'decomment.config.json')

//   if (fs.existsSync(js)) {
//     return (await import(js)).default
//   }

//   if (fs.existsSync(json)) {
//     return JSON.parse(fs.readFileSync(json, 'utf8'))
//   }

//   return {}
// }

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export async function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'decomment.config.js')

  if (!fs.existsSync(configPath)) {
    return {
      extensions: ['.js', '.mjs', '.jsx', '.tsx', '.vue']
    }
  }

  const url = pathToFileURL(configPath).href
  const mod = await import(url)

  return {
    extensions: mod.default?.extensions ?? ['.js', '.mjs', '.jsx', '.tsx', '.vue']
  }
}

