import { readFile } from 'node:fs/promises'
import path from 'node:path'

const placeholderPattern = /\{\$[a-zA-Z0-9_]+\}/g
const inputPaths = process.argv.slice(2)

if (inputPaths.length === 0) {
  console.error('Usage: node ./.github/skills/release-note/scripts/check-release-note-placeholders.mjs <file> [more files...]')
  process.exit(1)
}

let hasUnresolvedPlaceholders = false

for (const inputPath of inputPaths) {
  const absolutePath = path.resolve(process.cwd(), inputPath)
  const content = await readFile(absolutePath, 'utf8')
  const matches = [...new Set(content.match(placeholderPattern) ?? [])]

  if (matches.length === 0) {
    console.log(`OK ${inputPath}`)
    continue
  }

  hasUnresolvedPlaceholders = true
  console.log(`NG ${inputPath}`)
  for (const match of matches) {
    console.log(`  ${match}`)
  }
}

process.exit(hasUnresolvedPlaceholders ? 2 : 0)
