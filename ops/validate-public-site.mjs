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
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
};

for (const file of htmlFiles) {
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const isIndexable = !/name="robots" content="noindex/.test(html);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${relative}: missing title`);
  if (isIndexable && !/name="description" content="[^"]+"/.test(html)) failures.push(`${relative}: missing meta description`);
  if (/<nav class="nav-links" id="navLinks"><\/nav>/.test(html)) failures.push(`${relative}: empty navigation`);
  if (/<div class="footer-links"><\/div>/.test(html)) failures.push(`${relative}: empty footer links`);
  if (isIndexable && !html.includes('config.js?v=lead2')) failures.push(`${relative}: missing current analytics configuration`);
  if (isIndexable && !html.includes('script.js?v=lead4')) failures.push(`${relative}: missing current shared funnel measurement`);
  if (/googletagmanager\.com\/gtag\/js/.test(html)) failures.push(`${relative}: contains a duplicate page-level Google tag loader`);

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

const configSource = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
if (!/gaMeasurementId:\s*'G-[A-Z0-9]+'/.test(configSource)) {
  failures.push('config.js: missing a valid GA4 measurement ID');
}

const scriptSource = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const requiredMeasurementEvents = [
  'solution_assessment_view',
  'pricing_view',
  'contact_view',
  'ai_readiness_intake_view',
  'form_start',
  'form_validation_error',
  'lead_submit_attempt',
  'lead_submit_error',
  'lead_submit_success',
  'generate_lead',
  'click_contact',
];
for (const eventName of requiredMeasurementEvents) {
  if (!scriptSource.includes(`'${eventName}'`)) {
    failures.push(`script.js: missing funnel measurement event ${eventName}`);
  }
}
for (const sensitiveParameter of ['lead_id', 'lead_score']) {
  if (scriptSource.includes(sensitiveParameter)) {
    failures.push(`script.js: sends internal lead data to analytics: ${sensitiveParameter}`);
  }
}

const sitemapSource = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemapSource.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap.xml: contains duplicate URLs');
for (const sitemapUrl of sitemapUrls) {
  const parsed = new URL(sitemapUrl);
  const file = resolvePublicPath(parsed.pathname);
  if (!file) {
    failures.push(`sitemap.xml: URL has no public HTML target ${sitemapUrl}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (/name="robots" content="noindex/.test(html)) failures.push(`sitemap.xml: includes noindex page ${sitemapUrl}`);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== sitemapUrl) failures.push(`sitemap.xml: canonical mismatch for ${sitemapUrl}`);
}
if (sitemapUrls.includes('https://digisciencetechsol.com/thank-you')) {
  failures.push('sitemap.xml: includes the enquiry receipt page');
}

const thankYouSource = fs.readFileSync(path.join(root, 'thank-you.html'), 'utf8');
if (!/name="robots" content="noindex/.test(thankYouSource)) {
  failures.push('thank-you.html: enquiry receipt page must be noindex');
}
const notFoundSource = fs.readFileSync(path.join(root, '404.html'), 'utf8');
if (!/name="robots" content="noindex, nofollow"/.test(notFoundSource)) {
  failures.push('404.html: custom not-found page must be noindex, nofollow');
}

const redirectsSource = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
const requiredLegacyRedirects = [
  '/index.php / 301',
  '/career.php /about 301',
  '/target-industry.php /industries 301',
  '/service-digital-transformation-1.php /services 301',
  '/service-data-center-management-2.php /solutions/secure-ai-cloud-platform 301',
  '/service-it-infrastructure-management-3.php /solutions/cloud-modernization-ai-readiness 301',
  '/service-technology-consulting-services-4.php /solution-assessment 301',
  '/service-cyber-security-5.php /solutions/responsible-ai-governance 301',
];
for (const redirect of requiredLegacyRedirects) {
  if (!redirectsSource.includes(redirect)) failures.push(`_redirects: missing legacy mapping ${redirect}`);
}

const routesConfig = JSON.parse(fs.readFileSync(path.join(root, '_routes.json'), 'utf8'));
const requiredPrivateRoutes = [
  '/api/*',
  '/assets/templates/*',
  '/ops/*',
  '/gtm/*',
  '/proof-assets-source/*',
  '/scripts/*',
  '/workers/*',
  '/functions/*',
  '/cpanel_v7.zip',
  '/google-apps-script.gs',
  '/README.txt',
  '/wrangler.toml',
];
for (const route of requiredPrivateRoutes) {
  if (!routesConfig.include?.includes(route)) failures.push(`_routes.json: missing protected route ${route}`);
}
const privateRouteHandler = fs.readFileSync(path.join(root, 'functions', '[[path]].js'), 'utf8');
if (!/status:\s*404/.test(privateRouteHandler) || !/x-robots-tag/.test(privateRouteHandler)) {
  failures.push('functions/[[path]].js: blocked operational paths must return a noindex 404');
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

const sampleAssessment = fs.readFileSync(path.join(root, 'proof-assets', 'sample-solution-assessment.html'), 'utf8');
const requiredSampleDisclosures = [
  'Representative sample',
  'synthetic scenario',
  'fictional',
  'not customer work',
  'not a testimonial',
  'not a claim of achieved results',
  'workflow redesign',
  'conventional automation',
  'AI-assisted exceptions',
  'platform modernization',
  'This sample demonstrates the format—not a promised result',
];
for (const phrase of requiredSampleDisclosures) {
  if (!sampleAssessment.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`proof-assets/sample-solution-assessment.html: missing disclosure or sample content "${phrase}"`);
  }
}

const aboutSource = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
if (!aboutSource.includes('more than 22 years of enterprise technology experience')) {
  failures.push('about.html: missing the approved anonymous enterprise leadership experience statement');
}

const publicText = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const phrase of ['non-technical', 'nontechnical', 'do not need a technical specification']) {
  if (publicText.toLowerCase().includes(phrase)) {
    failures.push(`public HTML contains reductive audience framing: "${phrase}"`);
  }
}

for (const retiredNavigationPhrase of ['Book an AI Strategy Call', '>Resources<']) {
  if (publicText.includes(retiredNavigationPhrase)) {
    failures.push(`public HTML contains retired navigation wording: "${retiredNavigationPhrase}"`);
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

console.log(`Validated ${htmlFiles.length} public HTML files, shared navigation, seven services, local links, assets, analytics coverage, and retired pricing language.`);
