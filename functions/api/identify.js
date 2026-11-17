/**
 * Form-less visitor identification (DigiScience).
 * Open-source / free stack only:
 * - First-party ds_vid cookie
 * - Device fingerprint hash from client (canvas/webgl/audio signals)
 * - Cloudflare edge geo + ASN org (no paid GeoIP license)
 * - Reverse DNS PTR via Cloudflare DNS-over-HTTPS (open resolver)
 * - Behavioral signals from client beacon
 * - Isolated VPS visitor-profile store (no Cloudflare KV writes)
 *
 * Honest limit: personal name / email / phone are NOT available from
 * anonymous browsing alone; those arrive via progressive chat disclosure.
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
    asnOrg: clean(cf.asOrganization, 160),
    colo: clean(cf.colo, 16)
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

async function forwardMatomo(vid, geo, body, request, waitUntil) {
  const params = new URLSearchParams();
  params.set('idsite', '1');
  params.set('rec', '1');
  params.set('_id', vid);
  params.set('action_name', clean(body.page || 'identify', 180) || 'identify');
  params.set('url', clean(body.url || request.headers.get('referer') || 'https://digisciencetechsol.com/', 500));
  params.set('ua', clean(request.headers.get('user-agent'), 300));
  params.set('lang', clean(request.headers.get('accept-language'), 80));
  // Visit-scope custom variables (no Matomo admin config required)
  const cvar = {
    1: ['fingerprint', clean(body.fingerprint, 64)],
    2: ['asn_org', geo.asnOrg],
    3: ['city_region', [geo.city, geo.region, geo.country].filter(Boolean).join(', ')],
    4: ['ptr_host', clean(body._ptr || '', 160)],
    5: ['device_class', clean(body.deviceClass, 40)]
  };
  params.set('_cvar', JSON.stringify(cvar));
  if (body.name) params.set('dimension1', clean(body.name, 120));
  if (body.email) params.set('dimension2', clean(body.email, 160));
  if (body.phone) params.set('dimension3', clean(body.phone, 40));
  if (body.company || geo.asnOrg) params.set('dimension4', clean(body.company || geo.asnOrg, 160));

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
  const vid = readVid(request.headers.get('cookie')) || randomHex16();
  const body = request.method === 'POST' ? await parseBody(request) : {};
  const ptr = geo.ip ? await reverseDns(geo.ip) : '';
  body._ptr = ptr;

  const profile = {
    company_slug: 'site-digisciencetechsol-com',
    vid,
    fingerprint: clean(body.fingerprint, 64),
    name: clean(body.name, 120),
    email: clean(body.email, 160),
    phone: clean(body.phone, 40),
    company: clean(body.company || '', 160),
    page: clean(body.page || '', 200),
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
    geo: { ...geo, ptrHost: ptr },
    ua: clean(request.headers.get('user-agent'), 300),
    lang: clean(request.headers.get('accept-language'), 80),
    captured_at: new Date().toISOString(),
    contact_source: clean(body.contact_source || (body.email || body.phone || body.name ? 'progressive_chat' : 'browse_enrichment'), 40),
    // Explicit honesty flag for dashboards
    pii_from_browse: false,
    pii_available: Boolean(body.name || body.email || body.phone)
  };

  await forwardMatomo(vid, geo, body, request, waitUntil);
  await wakeProfileStore(profile, waitUntil);

  return new Response(JSON.stringify({
    ok: true,
    vid,
    geo: {
      city: geo.city,
      region: geo.region,
      country: geo.country,
      timezone: geo.timezone,
      asnOrg: geo.asnOrg,
      ptrHost: ptr
    },
    fingerprint: profile.fingerprint || null,
    identity: {
      name: profile.name || null,
      email: profile.email || null,
      phone: profile.phone || null,
      company: profile.company || geo.asnOrg || null
    },
    limits: {
      anonymous_browse_yields: ['visitor_id', 'fingerprint', 'city', 'region', 'country', 'asn_org', 'ptr_host', 'behavior'],
      requires_visitor_disclosure: ['personal_name', 'email', 'phone']
    }
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${COOKIE}=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    }
  });
}
