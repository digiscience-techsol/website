#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = [];
const skipDirectories = new Set(['.git', 'ops', 'output', 'tmp']);

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skipDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
};
walk(root);

const stripTags = (value) => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const hasMeta = (html, attribute, value) => new RegExp(`<meta\\s+${attribute}="${value}"\\s+content="`, 'i').test(html);
const insertBeforeHeadClose = (html, markup) => html.replace('</head>', `${markup}\n</head>`);

const urlPathForFile = (file) => {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}`;
  return `/${relative.slice(0, -'.html'.length)}`;
};

const breadcrumb = (name, url) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    {'@type': 'ListItem', position: 1, name: 'Home', item: 'https://digisciencetechsol.com/'},
    {'@type': 'ListItem', position: 2, name, item: url},
  ],
});

let updatedCount = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  if (/name="robots" content="noindex/i.test(html)) continue;

  const title = stripTags(html.match(/<title>(.*?)<\/title>/is)?.[1] || '');
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
  if (!title || !description || !canonical) continue;

  const metadata = [];
  if (!hasMeta(html, 'property', 'og:locale')) metadata.push('  <meta property="og:locale" content="en_IN" />');
  if (!hasMeta(html, 'property', 'og:site_name')) metadata.push('  <meta property="og:site_name" content="DigiScience Techsol" />');
  if (!hasMeta(html, 'property', 'og:title')) metadata.push(`  <meta property="og:title" content="${title}" />`);
  if (!hasMeta(html, 'property', 'og:description')) metadata.push(`  <meta property="og:description" content="${description}" />`);
  if (!hasMeta(html, 'property', 'og:type')) metadata.push('  <meta property="og:type" content="website" />');
  if (!hasMeta(html, 'property', 'og:url')) metadata.push(`  <meta property="og:url" content="${canonical}" />`);
  if (!hasMeta(html, 'property', 'og:image')) metadata.push('  <meta property="og:image" content="https://digisciencetechsol.com/assets/social-share.svg" />');
  if (!hasMeta(html, 'name', 'twitter:card')) metadata.push('  <meta name="twitter:card" content="summary_large_image" />');
  if (!hasMeta(html, 'name', 'twitter:title')) metadata.push(`  <meta name="twitter:title" content="${title}" />`);
  if (!hasMeta(html, 'name', 'twitter:description')) metadata.push(`  <meta name="twitter:description" content="${description}" />`);
  if (!hasMeta(html, 'name', 'twitter:image')) metadata.push('  <meta name="twitter:image" content="https://digisciencetechsol.com/assets/social-share.svg" />');
  if (metadata.length) html = insertBeforeHeadClose(html, metadata.join('\n'));

  const relative = path.relative(root, file).replaceAll('\\', '/');
  const needsSchema = !/application\/ld\+json/i.test(html);
  let schema;

  if (needsSchema && /^industries\/[^/]+\/index\.html$/.test(relative)) {
    const name = stripTags(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || title);
    schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          name,
          description,
          url: canonical,
          serviceType: 'Industry workflow assessment and AI transformation consulting',
          provider: {
            '@type': 'Organization',
            '@id': 'https://digisciencetechsol.com/#organization',
            name: 'DigiScience Techsol',
            url: 'https://digisciencetechsol.com/',
          },
          areaServed: 'Global',
        },
        breadcrumb(name, canonical),
      ],
    };
  } else if (needsSchema && /^proof-assets\/[^/]+\.html$/.test(relative)) {
    const name = stripTags(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || title);
    schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CreativeWork',
          name,
          description,
          url: canonical,
          isAccessibleForFree: true,
          creator: {
            '@type': 'Organization',
            '@id': 'https://digisciencetechsol.com/#organization',
            name: 'DigiScience Techsol',
          },
        },
        breadcrumb(name, canonical),
      ],
    };
  } else if (needsSchema && relative === 'industries.html') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonical,
      isPartOf: {'@type': 'WebSite', url: 'https://digisciencetechsol.com/'},
    };
  } else if (needsSchema && relative === 'proof-assets/index.html') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonical,
      about: ['Solution assessment', 'Enterprise AI architecture', 'Responsible AI governance', 'AI readiness'],
      isPartOf: {'@type': 'WebSite', url: 'https://digisciencetechsol.com/'},
    };
  }

  if (schema) {
    const schemaMarkup = `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2).split('\n').map((line) => `  ${line}`).join('\n')}\n  </script>`;
    html = insertBeforeHeadClose(html, schemaMarkup);
  }

  const original = fs.readFileSync(file, 'utf8');
  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    updatedCount += 1;
  }
}

console.log(`Enriched metadata and structured data in ${updatedCount} public HTML files.`);
