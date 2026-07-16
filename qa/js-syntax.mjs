#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', '.playwright-cli', 'node_modules', 'output'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.(?:js|mjs)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const files = await walk(rootDir);
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push({
      file: path.relative(rootDir, file),
      output: (result.stderr || result.stdout).trim()
    });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL  [javascript syntax] ${failure.file}\n${failure.output}`);
  }
  process.exit(1);
}

console.log(`PASS  JavaScript syntax valid in ${files.length} file(s).`);
