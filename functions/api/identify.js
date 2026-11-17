/**
 * Form-less visitor identification (DigiScience).
 * Open-source / free stack only:
 * - First-party ds_vid cookie (+ client visitorId when cookies blocked)
 * - Device fingerprint + behavior from client
 * - Cloudflare edge geo + ASN org
 * - Reverse DNS PTR via Cloudflare DNS-over-HTTPS
 * - Team Cymru origin ASN via DoH (free)
 * - RDAP network registry lookup (free IETF)
 * - PeeringDB ASN enrichment (free public API)
 * - Corporate vs ISP classification + domain guess + email-pattern TEMPLATES
 * - Isolated VPS visitor-profile store
 *
 * Honest limit: personal name / email / phone are NOT available from
 * anonymous browsing alone; email_patterns are templates only (not inboxes).
 */

const MATOMO_BASE = 'https://app.aicloudstrategist.cloud/matomo-ds';
const PROFILE_WAKE = 'https://app.aicloudstrategist.cloud/visitor-profile/site-digisciencetechsol-com';
const COOKIE = 'ds_vid';

const clean = (v, max = 200) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, '').trim().slice(0, max);

const readVid = (cookieHeader) => {
  const m = String(cookieHeader || '').match(/(?:^|;\s*)ds_vid=([a-f0-9]{16})/i);
  return m ? m[1].toLowerCase() : '';
};

const randomHex16 = () => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const ipv4PtrName = (ip) => {
  const parts = String(ip || '').split('.');
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p))) return '';
  return `${parts[3]}.${parts[2]}.${parts[1]}.${parts[0]}.in-addr.arpa`;
};

const ISP_HOSTING_RE =
  /\b(isp|telecom|mobile|broadband|communications?|cable|dsl|wireless|cellular|comcast|verizon|at&?t|jio|airtel|bsnl|vodafone|idea|reliance jio|hostinger|amazon\.com|google llc|microsoft corporation|digitalocean|hetzner|ovh|cloudflare|akamai|fastly|linode|vultr|contabo|godaddy|aws|azure|gcp|oracle cloud|alibaba|tencent|softlayer|leaseweb|choopa|quadranet|cogent|level3|lumen|centurylink|charter|spectrum|cox communications|t-mobile|sprint|bt public|orange s\.?a|telefonica|deutsche telekom|singtel|telstra|ntt communications|pccw|china telecom|china unicom|china mobile)\b/i;

const PDB_ISP_TYPES = /cable\/dsl\/isp|nsp|content|route server|network services|enterprise|educational\/research|non-profit|route collector|government/i;
const PDB_CORP_HINT = /enterprise|business|corporation|limited|ltd|pvt|inc\.|gmbh|llc/i;

async function reverseDns(ip) {
  const name = ipv4PtrName(ip);
  if (!name) return '';
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=PTR`, {
      headers: { Accept: 'application/dns-json' }
    });
    if (!res.ok) return '';
    const data = await res.json();
    const ans = Array.isArray(data.Answer) ? data.Answer.find((a) => a.type === 12 && a.data) : null;
    return clean(ans && ans.data ? String(ans.data).replace(/\.$/, '') : '', 180);
  } catch {
    return '';
  }
}

/** Team Cymru IP→ASN via DNS (free, no key). */
async function teamCymru(ip) {
  const parts = String(ip || '').split('.');
  if (parts.length !== 4) return { asn: '', prefix: '', registry: '', allocated: '' };
  try {
    const name = `${parts.join('.')}.origin.asn.cymru.com`;
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`, {
      headers: { Accept: 'application/dns-json' }
    });
    if (!res.ok) return { asn: '', prefix: '', registry: '', allocated: '' };
    const data = await res.json();
    const raw = Array.isArray(data.Answer) && data.Answer[0] && data.Answer[0].data
      ? String(data.Answer[0].data).replace(/^"|"$/g, '')
      : '';
    // "13335 | 1.1.1.0/24 | AU | apnic | 2011-08-11"
    const bits = raw.split('|').map((s) => s.trim());
    return {
      asn: clean(bits[0], 12),
      prefix: clean(bits[1], 40),
      registry: clean(bits[3], 20),
      allocated: clean(bits[4], 20)
    };
  } catch {
    return { asn: '', prefix: '', registry: '', allocated: '' };
  }
}

/** RDAP network registry (free IETF). */
async function rdapLookup(ip) {
  if (!ip) return { name: '', handle: '', country: '', org: '', abuseEmail: '' };
  try {
    const res = await fetch(`https://rdap.org/ip/${encodeURIComponent(ip)}`, {
      headers: { Accept: 'application/rdap+json, application/json' }
    });
    if (!res.ok) return { name: '', handle: '', country: '', org: '', abuseEmail: '' };
    const data = await res.json();
    let org = '';
    let abuseEmail = '';
    for (const ent of data.entities || []) {
      const roles = (ent.roles || []).map((r) => String(r).toLowerCase());
      const vcard = ent.vcardArray && Array.isArray(ent.vcardArray[1]) ? ent.vcardArray[1] : [];
      for (const row of vcard) {
        if (!Array.isArray(row)) continue;
        if (row[0] === 'fn' && roles.includes('registrant') && !org) org = clean(row[3], 160);
        if (row[0] === 'email' && roles.includes('abuse') && !abuseEmail) abuseEmail = clean(row[3], 160);
      }
      if (!org && roles.includes('registrant') && ent.handle) org = clean(ent.handle, 160);
    }
    return {
      name: clean(data.name, 160),
      handle: clean(data.handle, 80),
      country: clean(data.country, 2).toUpperCase(),
      org,
      abuseEmail
    };
  } catch {
    return { name: '', handle: '', country: '', org: '', abuseEmail: '' };
  }
}

/** PeeringDB ASN enrichment (free public API). */
async function peeringDb(asn) {
  const n = String(asn || '').replace(/^AS/i, '');
  if (!/^\d+$/.test(n)) {
    return { name: '', aka: '', website: '', infoType: '', infoTraffic: '', infoScope: '', orgId: '' };
  }
  try {
    const res = await fetch(`https://www.peeringdb.com/api/net?asn=${encodeURIComponent(n)}`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return { name: '', aka: '', website: '', infoType: '', infoTraffic: '', infoScope: '', orgId: '' };
    const data = await res.json();
    const net = Array.isArray(data.data) && data.data[0] ? data.data[0] : null;
    if (!net) return { name: '', aka: '', website: '', infoType: '', infoTraffic: '', infoScope: '', orgId: '' };
    return {
      name: clean(net.name, 160),
      aka: clean(net.aka || net.name_long, 160),
      website: clean(net.website, 200),
      infoType: clean(net.info_type, 80),
      infoTraffic: clean(net.info_traffic, 40),
      infoScope: clean(net.info_scope, 40),
      orgId: clean(net.org_id, 20)
    };
  } catch {
    return { name: '', aka: '', website: '', infoType: '', infoTraffic: '', infoScope: '', orgId: '' };
  }
}

function domainFromUrlOrHost(value) {
  const raw = clean(value, 200).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (!raw) return '';
  const host = raw.split('/')[0].split(':')[0];
  if (!host || !host.includes('.')) return '';
  // Drop common ISP/CDN PTR suffixes noise labels
  const labels = host.split('.').filter(Boolean);
  if (labels.length < 2) return '';
  const multi = new Set(['co.uk', 'com.au', 'co.in', 'com.br', 'co.jp']);
  const last2 = labels.slice(-2).join('.');
  const last3 = labels.slice(-3).join('.');
  if (multi.has(last2) && labels.length >= 3) return last3;
  return last2;
}

function emailPatternTemplates(domain) {
  if (!domain || ISP_HOSTING_RE.test(domain)) return [];
  // Templates only — not real mailboxes. Useful after name disclosure.
  return [
    `{first}.{last}@${domain}`,
    `{first}@${domain}`,
    `{f}{last}@${domain}`,
    `{first}{last}@${domain}`
  ];
}

function classifyNetwork({ asnOrg, pdb, rdap, ptrHost }) {
  const org = clean(asnOrg || pdb.name || rdap.org || '', 160);
  const infoType = clean(pdb.infoType, 80);
  const ptr = clean(ptrHost, 180);

  if (!org && !infoType) {
    return { asnOrg: org, companyCandidate: '', networkType: 'unknown', confidence: 0 };
  }

  // PeeringDB Cable/DSL/ISP / NSP → residential/hosting, not a sales company
  if (/cable\/dsl\/isp|nsp|content|route server|route collector/i.test(infoType)) {
    return { asnOrg: org || asnOrg, companyCandidate: '', networkType: 'isp_or_hosting', confidence: 0.9 };
  }
  if (ISP_HOSTING_RE.test(org) || ISP_HOSTING_RE.test(ptr)) {
    return { asnOrg: org || asnOrg, companyCandidate: '', networkType: 'isp_or_hosting', confidence: 0.85 };
  }
  // Enterprise / Not Disclosed with corporate-looking name
  if (/enterprise/i.test(infoType) || PDB_CORP_HINT.test(org) || PDB_CORP_HINT.test(pdb.aka || '')) {
    return {
      asnOrg: org || asnOrg,
      companyCandidate: clean(pdb.aka || org, 160),
      networkType: 'possible_business',
      confidence: 0.7
    };
  }
  if (org && !ISP_HOSTING_RE.test(org)) {
    return { asnOrg: org, companyCandidate: org, networkType: 'possible_business', confidence: 0.55 };
  }
  return { asnOrg: org || asnOrg, companyCandidate: '', networkType: 'isp_or_hosting', confidence: 0.5 };
}

function geoFromRequest(request) {
  const cf = request.cf || {};
  return {
    ip: clean(request.headers.get('cf-connecting-ip'), 64),
    country: clean(cf.country || request.headers.get('cf-ipcountry'), 2).toUpperCase(),
    region: clean(cf.region, 80),
    city: clean(cf.city, 80),
    postalCode: clean(cf.postalCode, 20),
    timezone: clean(cf.timezone, 64),
    latitude: typeof cf.latitude === 'string' || typeof cf.latitude === 'number' ? String(cf.latitude).slice(0, 16) : '',
    longitude: typeof cf.longitude === 'string' || typeof cf.longitude === 'number' ? String(cf.longitude).slice(0, 16) : '',
    asnOrg: clean(cf.asOrganization || '', 160),
    colo: clean(cf.colo, 16),
    asn: cf.asn != null ? String(cf.asn) : ''
  };
}

async function enrichIp(ip, cfAsnOrg, cfAsn) {
  const [ptr, cymru, rdap] = await Promise.all([reverseDns(ip), teamCymru(ip), rdapLookup(ip)]);
  const asn = clean(cymru.asn || cfAsn, 12);
  const pdb = await peeringDb(asn);
  const classified = classifyNetwork({ asnOrg: cfAsnOrg || pdb.name, pdb, rdap, ptrHost: ptr });
  const domain =
    domainFromUrlOrHost(pdb.website) ||
    domainFromUrlOrHost(ptr) ||
    '';
  // Prefer corporate domain only when not ISP
  const corporateDomain = classified.networkType === 'possible_business' ? domain : '';
  const patterns = corporateDomain ? emailPatternTemplates(corporateDomain) : [];

  return {
    ptrHost: ptr,
    cymru,
    rdap,
    peeringdb: pdb,
    asn: asn ? `AS${asn}` : '',
    networkType: classified.networkType,
    companyCandidate: classified.companyCandidate || null,
    confidence: classified.confidence,
    domainGuess: corporateDomain || null,
    emailPatterns: patterns,
    sources: ['cloudflare_edge', 'team_cymru_doh', 'rdap', 'peeringdb', 'ptr_doh'].filter(Boolean)
  };
}

async function parseBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {};
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function forwardMatomo(vid, geo, body, request, waitUntil, enrich) {
  const params = new URLSearchParams();
  params.set('idsite', '1');
  params.set('rec', '1');
  params.set('_id', vid);
  params.set('action_name', clean(body.page || 'identify', 180) || 'identify');
  params.set('url', clean(body.url || request.headers.get('referer') || 'https://digisciencetechsol.com/', 500));
  params.set('ua', clean(request.headers.get('user-agent'), 300));
  params.set('lang', clean(request.headers.get('accept-language'), 80));
  const cvar = {
    1: ['fingerprint', clean(body.fingerprint, 64)],
    2: ['asn_org', geo.asnOrg],
    3: ['city_region', [geo.city, geo.region, geo.country].filter(Boolean).join(', ')],
    4: ['ptr_host', clean(enrich.ptrHost || '', 160)],
    5: ['device_class', clean(body.deviceClass, 40)]
  };
  params.set('_cvar', JSON.stringify(cvar));
  if (body.name) params.set('dimension1', clean(body.name, 120));
  if (body.email) params.set('dimension2', clean(body.email, 160));
  if (body.phone) params.set('dimension3', clean(body.phone, 40));
  if (body.company || enrich.companyCandidate || geo.asnOrg) {
    params.set('dimension4', clean(body.company || enrich.companyCandidate || geo.asnOrg, 160));
  }

  const headers = {
    'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    'Accept-Language': request.headers.get('accept-language') || 'en'
  };
  if (geo.ip) headers['X-Real-Visitor-IP'] = geo.ip;

  const p = fetch(`${MATOMO_BASE}/matomo.php?${params.toString()}`, { method: 'GET', headers }).catch(() => null);
  if (typeof waitUntil === 'function') waitUntil(p);
  else await p;
}

async function wakeProfileStore(profile, waitUntil) {
  const p = fetch(PROFILE_WAKE, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'DigiScienceIdentify/1.0' },
    body: JSON.stringify(profile)
  }).catch(() => null);
  if (typeof waitUntil === 'function') waitUntil(p);
  else await p;
}

export async function onRequest({ request, waitUntil }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'cache-control': 'no-store'
      }
    });
  }

  const geo = geoFromRequest(request);
  const body = request.method === 'POST' ? await parseBody(request) : {};
  const bodyVid = clean(body.visitorId || body.vid, 36).toLowerCase();
  const cookieVid = readVid(request.headers.get('cookie'));
  const vid = cookieVid || (/^[a-f0-9]{16}$/.test(bodyVid) ? bodyVid : '') || randomHex16();

  const enrich = geo.ip
    ? await enrichIp(geo.ip, geo.asnOrg, geo.asn)
    : {
        ptrHost: '',
        cymru: {},
        rdap: {},
        peeringdb: {},
        asn: '',
        networkType: 'unknown',
        companyCandidate: null,
        confidence: 0,
        domainGuess: null,
        emailPatterns: [],
        sources: []
      };

  const profile = {
    company_slug: 'site-digisciencetechsol-com',
    vid,
    fingerprint: clean(body.fingerprint, 64),
    name: clean(body.name, 120),
    email: clean(body.email, 160),
    phone: clean(body.phone, 40),
    company: clean(body.company || '', 160),
    page: clean(body.page || body.path || '', 200),
    url: clean(body.url || '', 500),
    referrer: clean(body.referrer || request.headers.get('referer') || '', 400),
    deviceClass: clean(body.deviceClass, 40),
    behavior: {
      scrollMax: Number(body.scrollMax) || 0,
      dwellMs: Number(body.dwellMs) || 0,
      pages: Number(body.pages) || 1,
      clicks: Number(body.clicks) || 0,
      chatTurns: Number(body.chatTurns) || 0
    },
    geo: {
      ...geo,
      ptrHost: enrich.ptrHost,
      networkType: enrich.networkType,
      companyCandidate: enrich.companyCandidate,
      asn: enrich.asn,
      domainGuess: enrich.domainGuess,
      emailPatterns: enrich.emailPatterns,
      confidence: enrich.confidence,
      rdapName: enrich.rdap && enrich.rdap.name,
      peeringdbName: enrich.peeringdb && enrich.peeringdb.name,
      peeringdbType: enrich.peeringdb && enrich.peeringdb.infoType,
      cymruPrefix: enrich.cymru && enrich.cymru.prefix
    },
    enrichment: {
      sources: enrich.sources,
      emailPatterns: enrich.emailPatterns,
      domainGuess: enrich.domainGuess,
      confidence: enrich.confidence
    },
    ua: clean(request.headers.get('user-agent'), 300),
    lang: clean(request.headers.get('accept-language'), 80),
    captured_at: new Date().toISOString(),
    contact_source: clean(
      body.contact_source || (body.email || body.phone || body.name ? 'progressive_chat' : 'browse_enrichment'),
      40
    ),
    pii_from_browse: false,
    pii_available: Boolean(body.name || body.email || body.phone)
  };

  await forwardMatomo(vid, geo, body, request, waitUntil, enrich);
  await wakeProfileStore(profile, waitUntil);

  return new Response(
    JSON.stringify({
      ok: true,
      vid,
      geo: {
        city: geo.city,
        region: geo.region,
        country: geo.country,
        timezone: geo.timezone,
        asnOrg: geo.asnOrg,
        asn: enrich.asn || null,
        ptrHost: enrich.ptrHost || null,
        networkType: enrich.networkType,
        companyCandidate: enrich.companyCandidate,
        domainGuess: enrich.domainGuess,
        confidence: enrich.confidence,
        peeringdbType: (enrich.peeringdb && enrich.peeringdb.infoType) || null,
        rdapName: (enrich.rdap && enrich.rdap.name) || null
      },
      enrichment: {
        emailPatterns: enrich.emailPatterns,
        sources: enrich.sources,
        note: 'emailPatterns are templates only; not real addresses'
      },
      fingerprint: profile.fingerprint || null,
      identity: {
        name: profile.name || null,
        email: profile.email || null,
        phone: profile.phone || null,
        company: profile.company || enrich.companyCandidate || null
      },
      limits: {
        anonymous_browse_yields: [
          'visitor_id',
          'fingerprint',
          'city',
          'region',
          'country',
          'asn',
          'asn_org',
          'ptr_host',
          'rdap_network',
          'peeringdb_type',
          'behavior',
          'possible_business_org',
          'domain_guess',
          'email_pattern_templates'
        ],
        requires_visitor_disclosure: ['personal_name', 'personal_email', 'phone'],
        person_level_from_ip: false,
        email_patterns_are_templates_only: true
      }
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'set-cookie': `${COOKIE}=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      }
    }
  );
}
