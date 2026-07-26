#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
const htmlFiles = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'ops' || entry.name === 'output' || entry.name === 'tmp') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
walk(root);

const resolvePublicPath = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean === '/') return path.join(root, 'index.html');
  const relative = clean.replace(/^\//, '');
  const candidates = [
    path.join(root, relative),
    path.join(root, `${relative}.html`),
    path.join(root, relative, 'index.html'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
};

for (const file of htmlFiles) {
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${relative}: missing title`);
  if (!/name="robots" content="noindex/.test(html) && !/name="description" content="[^"]+"/.test(html)) failures.push(`${relative}: missing meta description`);
  if (/<nav class="nav-links" id="navLinks"><\/nav>/.test(html)) failures.push(`${relative}: empty navigation`);
  if (/<div class="footer-links"><\/div>/.test(html)) failures.push(`${relative}: empty footer links`);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (!target || /^(?:https?:|mailto:|tel:|data:|javascript:)/.test(target)) continue;
    if (target.startsWith('#')) {
      const id = target.slice(1);
      if (id && !ids.has(id)) failures.push(`${relative}: missing local anchor ${target}`);
      continue;
    }
    const absolute = target.startsWith('/') ? target : `/${path.posix.join(path.posix.dirname(`/${relative}`), target)}`;
    if (!resolvePublicPath(absolute)) failures.push(`${relative}: missing local target ${target}`);
  }
}

const services = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
const expectedServices = [
  'AI Strategy, Readiness &amp; Transformation Advisory',
  'AI Industry Transformation Solutions',
  'Industry AI Pilot in 45 Days',
  'Secure Enterprise AI Cloud Platform',
  'Responsible AI Governance and Agent Control',
  'AI-Ready DevOps and Platform Engineering',
  'Cloud Modernization for AI Readiness',
];
for (const service of expectedServices) {
  if (!services.includes(service)) failures.push(`services.html: missing service ${service}`);
}

const solutionAssessment = fs.readFileSync(path.join(root, 'solution-assessment.html'), 'utf8');
const requiredAssessmentCopy = [
  'business owners and leaders',
  'functional leaders',
  'technical leaders',
  'specialized expertise',
  'workflow improvement',
  'automation',
  'AI',
  'secure cloud',
  'hybrid or on-premise',
  'platform modernization',
  'INR 29,000',
  'USD 349',
  'INR 49,000',
  'USD 599',
  'seven-business-day',
  '50% to begin',
  '50% before',
  'signed within 60 days',
  'bounded pre-implementation engagement',
  'not full delivery',
];
for (const phrase of requiredAssessmentCopy) {
  if (!solutionAssessment.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`solution-assessment.html: missing required offer language "${phrase}"`);
  }
}

const publicText = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const phrase of ['non-technical', 'nontechnical', 'do not need a technical specification']) {
  if (publicText.toLowerCase().includes(phrase)) {
    failures.push(`public HTML contains reductive audience framing: "${phrase}"`);
  }
}

for (const phrase of ['PDF generation is pending', 'INR 75K', 'INR 1.5L', 'INR 3L']) {
  if (publicText.includes(phrase)) failures.push(`public HTML still contains retired phrase: ${phrase}`);
}

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} public HTML files, shared navigation, seven services, local links, assets, and retired pricing language.`);
