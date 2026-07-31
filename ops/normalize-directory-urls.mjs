#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const directoryRoutes = [
  '/proof-assets',
  ...fs.readdirSync(path.join(root, 'industries'), {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'industries', entry.name, 'index.html')))
    .map((entry) => `/industries/${entry.name}`),
  ...fs.readdirSync(path.join(root, 'solutions'), {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'solutions', entry.name, 'index.html')))
    .map((entry) => `/solutions/${entry.name}`),
].sort((left, right) => right.length - left.length);

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (entry.isDirectory() && ['.git', 'ops', 'output', 'tmp'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(?:html|xml|txt|pl|mjs)$/.test(entry.name) || entry.name === '_redirects') files.push(fullPath);
  }
};
walk(root);
files.push(path.join(root, 'ops', 'update-shared-navigation.pl'));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let updatedCount = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  for (const route of directoryRoutes) {
    updated = updated.replace(new RegExp(`${escapeRegExp(route)}(?![A-Za-z0-9_/-])`, 'g'), `${route}/`);
  }
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    updatedCount += 1;
  }
}

console.log(`Normalized Cloudflare directory URLs in ${updatedCount} files.`);
