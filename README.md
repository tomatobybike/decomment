# 📦 decomment

<p align="center">
  <a href="https://www.npmjs.com/package/@tomatobybike/decomment">
    <img src="https://img.shields.io/npm/v/%40tomatobybike%2Fdecomment.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@tomatobybike/decomment">
    <img src="https://img.shields.io/npm/dm/%40tomatobybike%2Fdecomment.svg" alt="downloads">
  </a>
  <a href="https://github.com/tomatobybike/decomment/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/tomatobybike/decomment.svg" alt="license">
  </a>
  <a href="https://github.com/tomatobybike/decomment">
    <img src="https://img.shields.io/github/stars/tomatobybike/decomment.svg?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/tomatobybike/decomment/issues">
    <img src="https://img.shields.io/github/issues/tomatobybike/decomment.svg" alt="issues">
  </a>
</p>


**decomment** is a CLI tool to safely remove comments from JavaScript, TypeScript, JSX, TSX, and Vue files.

It performs **AST-based comment removal** to ensure code behavior is never changed.
The tool is designed for production codebases, CI pipelines, and teams that care about safety, auditability, and reversibility.

> **Remove comments — and nothing else.**

---

## Features

- AST-based removal of single-line (`//`) and block (`/* */`) comments
- Preserves comments with specified prefixes (e.g. `eslint-`, `@license`)
- Supports JavaScript, MJS, JSX, TSX, and Vue (script section)
- Glob patterns for batch processing
- Optional configuration via `decomment.config.js`
- Dry-run mode to preview changes
- Statistics output (removed / kept comments)
- Automatic backup with full rollback support
- Cross-platform (Windows / macOS / Linux)

---

## Installation

### Global (recommended)

```bash
npm install -g @king-monkey/decomment
```

or

```bash
yarn global add @king-monkey/decomment
```

### Local development

```bash
yarn add @king-monkey/decomment
```

---

## Usage

```bash
decomment [options] [files/globs]
```

If no files or globs are provided, **decomment scans the current directory by default**.

---

## Options

| Option       | Description                                  |
| ------------ | -------------------------------------------- |
| `--dry-run`  | Preview changes without writing files        |
| `--keep`     | Comma-separated comment prefixes to preserve |
| `--stats`    | Show number of comments removed and kept     |
| `-h, --help` | Show help message                            |

Default preserved prefixes:

```graphql
eslint-, @license, @preserve
```

---

## Examples

### Remove comments from the current project (default behavior)

```bash
decomment
```

Equivalent to:

```bash
decomment "**/*.{js,mjs,jsx,tsx,vue}"
```

Automatically excludes:

- `node_modules`
- `dist`
- `build`
- `.git`

---

### Preview changes (dry-run)

```bash
decomment "src/**/*.js" --dry-run --stats
```

---

### Process multiple file types

```bash
decomment "src/**/*.{js,mjs,jsx,tsx,vue}" --stats
```

---

### Preserve specific comment prefixes

```bash
decomment "src/**/*.{js,ts}" --keep eslint-,@license --stats
```

---

## Configuration (`decomment.config.js`)

An optional configuration file can be placed at the project root.

```js
export default {
  include: ["src/**/*.{js,mjs,jsx,tsx,vue}", "test/**/*.{js,mjs,jsx,tsx,vue}"],
  keep: ["eslint-", "@license", "@preserve"],
};
```

### Config precedence

1.  CLI file/glob arguments
2.  `config.include`
3.  Default glob (`**/*.{js,mjs,jsx,tsx,vue}`)

---

## Backup & Safety

For each processed file, **decomment creates a single backup**:

```csharp
<file>.decomment.bak
```

- The backup is overwritten on subsequent runs
- Designed for intentional, one-shot operations
- Guarantees full reversibility

---

## Restore & Cleanup

### Restore files from backup

```bash
decomment restore
```

Restores files from their `.decomment.bak` backups.

---

### Remove all backup files

```bash
decomment clean
```

Deletes all `.decomment.bak` files in the matched scope.

---

## 🔍 Comparison with Other Tools

| Feature / Tool        | **decomment**                   | strip-comments | comment-strip  | Babel / esbuild / Terser |
| --------------------- | ------------------------------- | -------------- | -------------- | ------------------------ |
| AST-based (safe)      | ✅ Yes                          | ❌ Regex-based | ❌ Regex-based | ✅ Yes                   |
| Preserves semantics   | ✅ Guaranteed                   | ❌ Risky       | ❌ Risky       | ❌ Not guaranteed        |
| Removes only comments | ✅ Yes                          | ⚠️ Mostly      | ⚠️ Mostly      | ❌ No (build output)     |
| JSX / TSX support     | ✅ Yes                          | ⚠️ Partial     | ⚠️ Partial     | ✅ Yes                   |
| Vue SFC support       | ✅ Script section only          | ❌ No          | ❌ No          | ⚠️ Limited               |
| Preserve prefixes     | ✅ Yes (`--keep`)               | ❌ No          | ❌ No          | ⚠️ Limited               |
| Dry-run mode          | ✅ Yes                          | ❌ No          | ❌ No          | ❌ No                    |
| Statistics output     | ✅ Yes                          | ❌ No          | ❌ No          | ❌ No                    |
| Backup & rollback     | ✅ Yes                          | ❌ No          | ❌ No          | ❌ No                    |
| Glob batch processing | ✅ Yes                          | ⚠️ Limited     | ⚠️ Limited     | ⚠️ Build-specific        |
| Config file support   | ✅ Yes                          | ❌ No          | ❌ No          | ❌ No                    |
| CI / pre-commit ready | ✅ Designed for it              | ❌ No          | ❌ No          | ⚠️ Not intended          |
| Risk of breaking code | **Very Low**                    | Medium         | Medium         | High                     |
| Primary use case      | **Production codebase hygiene** | Small scripts  | Small scripts  | Build & minification     |

---

## 🧠 Why decomment Exists

- **Regex-based tools** do not understand syntax and can break code
- **Build tools** modify structure, formatting, and semantics
- **decomment** removes comments — **and nothing else**

If you care about safety, reviewability, and deterministic output, this tool is built for you.

---

## 🏆 When to Use decomment

- You want **zero behavior changes**
- You need **auditable CI output**
- You must **preserve ESLint and license comments**
- You work with **modern JS / TS / Vue codebases**
- You want **safe and reversible operations**

---

## 🚫 When NOT to Use decomment

- You just need quick text cleanup
- You already minify source code
- You do not care about accidental removals

---

## npm Scripts Integration (Recommended)

decomment is designed to work naturally with npm scripts for safe and repeatable workflows.

```json
{
  "scripts": {
    "decomment": "decomment",
    "decomment:check": "decomment --dry-run --stats",
    "decomment:fix": "decomment --stats",
    "decomment:restore": "decomment restore",
    "decomment:clean": "decomment clean"
  }
}
```

---

## Common workflows

```bash
# Preview comment removal (no file changes)
npm run decomment:check

# Remove comments and create backups
npm run decomment:fix

# Restore all files from backups
npm run decomment:restore

# Remove all .decomment.bak files
npm run decomment:clean


```

### 🪝 Pre-commit Hook (Husky)（Optional / Advanced）

## Pre-commit Hook (Husky) – Optional

You can integrate **decomment** into a pre-commit workflow to automatically remove comments before each commit.

> ⚠️ This is optional and recommended only for teams that already use Husky.

### Setup

```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit
```

## Example .husky/pre-commit

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧹 Running decomment..."

npx decomment "src/**/*.{js,mjs,jsx,tsx,vue}" \
  --keep eslint-,@license,@preserve \
  --stats

```

## License

MIT License
