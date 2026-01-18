# decomment

**decomment** is a CLI tool to safely remove comments from JavaScript, TypeScript, JSX, TSX, and Vue files.  
It supports AST-level comment removal, preserving specified comment prefixes, glob patterns, config files, dry-run mode, and statistics.

---

## Features

- Remove single-line (`//`) and block (`/* */`) comments safely via AST
- Preserve comments with specified prefixes (e.g., `eslint-`, `@license`)
- Supports JS, MJS, JSX, TSX, and Vue files
- Glob support for batch file processing
- Configurable via `decomment.config.js`
- Dry-run mode for previewing changes
- Statistics mode to show removed/kept comments
- Automatic `.bak` backup of original files
- Cross-platform CLI (Windows / macOS / Linux)

---

## Installation

### Locally

```bash
git clone <repo>
cd decomment
yarn install  # or npm install
```

### Globally via npm

```bash
npm install -g decomment
```

---

## Usage

```bash
decomment [options] <files/globs>
```

### Options

| Option       | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `--dry-run`  | Preview changes without writing files                                    |
| `--keep`     | Comma-separated prefixes to keep (default: `eslint-,@license,@preserve`) |
| `--stats`    | Show number of comments removed/kept                                     |
| `-h, --help` | Show help message                                                        |

---

### Examples

**Preview changes for all JS, MJS, JSX, TSX, Vue files (multi-type):**

```bash
node ./bin/decomment.mjs "src/**/*.{js,mjs,jsx,tsx,vue}" --dry-run --stats
```

**Preview changes for all JS files only (single type):**

```bash
node ./bin/decomment.mjs "src/**/*.js" --dry-run --stats
```

**Actually remove comments from JS and TS files, keeping eslint/license:**

```bash
node ./bin/decomment.mjs "src/**/*.{js,ts}" --keep eslint-,@license --stats
```

**Use `decomment.config.js` if no files specified:**

```bash
node ./bin/decomment.mjs
```

---

## Configuration (`decomment.config.js`)

Optional configuration file to define default files and keep prefixes.

```js
export default {
  include: ['src/**/*.{js,mjs,jsx,tsx,vue}', 'test/**/*.{js,mjs,jsx,tsx,vue}'],
  keep: ['eslint-', '@license', '@preserve']
}
```

- `include` → Array of glob patterns to process by default
- `keep` → Array of comment prefixes to preserve

---

## Backup

By default, the tool generates a `.bak` file for every processed file.  
If a `.bak` file already exists, a timestamp is added to avoid overwriting.

---

## Limitations

- Only removes comments recognized by the AST parser; unusual comment formats may be ignored
- Cannot remove comments from minified or obfuscated code safely
- Single-file regex replacements are not recommended; always use AST mode
- Vue `<template>` section comments are ignored unless you enable the `vue` plugin (already enabled in default config)

---

## License

MIT License

