import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const publicDirectory = resolve(root, 'public');

async function copyWebAssets(directory, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const output = resolve(destination, entry.name);
    if (entry.isDirectory()) await copyWebAssets(path, output);
    else if (!entry.name.toLowerCase().endsWith('.mp4')) await copyFile(path, output);
  }
}

await copyWebAssets(publicDirectory, dist);
console.log('Prepared GitHub Pages assets. MP4 videos are hosted as GitHub Release assets.');
