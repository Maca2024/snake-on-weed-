import { mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await mkdir(output, { recursive: true });
await copyFile(new URL('index.html', root), new URL('index.html', output));
for (const directory of ['src', 'assets']) {
  await cp(new URL(directory, root), new URL(directory, output), { recursive: true });
}
await writeFile(new URL('.nojekyll', output), '');
console.log('Static site built in dist/');
