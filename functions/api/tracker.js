const MATOMO_BASE = 'https://app.aicloudstrategist.cloud/matomo-ds';

const readVidCookie = (cookieHeader) => {
  const m = String(cookieHeader || '').match(/(?:^|;\s*)ds_vid=([a-f0-9]{16})/i);
  return m ? m[1].toLowerCase() : '';
};

const randomHex16 = () => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export async function onRequest({ request, waitUntil }) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }

  // Serve Matomo open-source tracker JS cached at Cloudflare edge for 1 hour
  if (request.method === 'GET' && url.searchParams.get('js') === '1') {
    const cache = caches.default;
    const cacheKey = new Request(url.origin + '/api/tracker?js=1', { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    const upstream = await fetch(`${MATOMO_BASE}/matomo.js`, { headers: { 'User-Agent': 'DigiScienceFirstPartyMatomo/1.0' } });
    if (!upstream.ok) return new Response('/* tracker unavailable */', { status: 200, headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' } });
    const body = await upstream.text();
    const resp = new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=3600'
      }
    });
    if (typeof waitUntil === 'function') waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  }

  // Forward first-party tracking beacon to isolated DigiScience Matomo 5 instance
  const cookieHeader = request.headers.get('cookie') || '';
  const vid = readVidCookie(cookieHeader) || randomHex16();
  const params = new URLSearchParams(url.search);
  if (request.method === 'POST') {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('text/plain')) {
      const bodyText = await request.text();
      for (const [k, v] of new URLSearchParams(bodyText).entries()) params.set(k, v);
    }
  }
  params.set('idsite', '1');
  params.set('rec', '1');
  if (!params.get('_id')) params.set('_id', vid);

  const clientIp = request.headers.get('cf-connecting-ip') || '';
  const forwardHeaders = {
    'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    'Accept-Language': request.headers.get('accept-language') || 'en',
  };
  if (clientIp) forwardHeaders['X-Real-Visitor-IP'] = clientIp;

  const forwardPromise = fetch(`${MATOMO_BASE}/matomo.php?${params.toString()}`, {
    method: 'GET',
    headers: forwardHeaders
  }).catch(() => null);

  if (typeof waitUntil === 'function') waitUntil(forwardPromise);
  else await forwardPromise;

  return new Response(null, {
    status: 204,
    headers: {
      'cache-control': 'no-store',
      'set-cookie': `ds_vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    }
  });
}
