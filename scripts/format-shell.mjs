import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format } from 'prettier';

// Enumerate explicitly: glob walkers can skip Windows cloud-file reparse points.
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(path);
  }
  return files;
}
const files = [...await walk('src/shell'), ...await walk('src/app/(game)')];
let changed = 0;
for (const path of files) {
  const source = await readFile(path, 'utf8');
  const formatted = await format(source, { filepath: path, singleQuote: true, endOfLine: 'lf' });
  if (source !== formatted) {
    changed++;
    if (process.argv.includes('--write')) await writeFile(path, formatted);
    else console.error(`Formatting needed: ${path}`);
  }
}
console.log(`${files.length} shell files checked; ${changed} ${process.argv.includes('--write') ? 'formatted' : 'need formatting'}.`);
if (changed && !process.argv.includes('--write')) process.exitCode = 1;
