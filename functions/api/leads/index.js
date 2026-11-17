const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const FALLBACK_TOKEN_SHA256 = '51f999ac01aadb1d00ba5c532d137ea7625de455b5cc2515fb3c9c14ab99743f';

// Read-only reader for the Company Agents product: only the hash is kept here; the product holds the token privately.
const PRODUCT_READER_SHA256 = 'ec322303a7350b4089f64cb3c00dcb490ba20b4ffcd20c18203ef8c4b424caae';

const getBearerToken = (request) => {
  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

const sha256Hex = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const isAuthorized = async (request, env) => {
  const token = getBearerToken(request);
  if (!token) return false;
  if (env.LEAD_DASHBOARD_TOKEN && token === env.LEAD_DASHBOARD_TOKEN) return true;
  const hashed = await sha256Hex(token);
  return hashed === FALLBACK_TOKEN_SHA256 || hashed === PRODUCT_READER_SHA256;
};

const sanitizeRecord = (record) => ({
  leadId: record.leadId,
  status: record.status,
  owner: record.owner,
  nextFollowUpDate: record.nextFollowUpDate,
  leadScore: record.leadScore,
  leadCategory: record.leadCategory,
  recommendedAction: record.recommendedAction,
  lead: {
    submittedAt: record.lead?.submittedAt,
    sourcePage: record.lead?.sourcePage,
    formType: record.lead?.formType,
    fullName: record.lead?.fullName,
    businessEmail: record.lead?.businessEmail,
    phone: record.lead?.phone,
    company: record.lead?.company,
    websiteOrLinkedIn: record.lead?.websiteOrLinkedIn,
    role: record.lead?.role,
    industry: record.lead?.industry,
    cloudPlatform: record.lead?.cloudPlatform,
    aiInterestArea: record.lead?.aiInterestArea,
    timeline: record.lead?.timeline,
    budgetRange: record.lead?.budgetRange,
    businessProblem: record.lead?.businessProblem,
    desiredOutcome: record.lead?.desiredOutcome,
    successMetrics: record.lead?.successMetrics,
    stakeholders: record.lead?.stakeholders,
    landingPage: record.lead?.landingPage,
    referrer: record.lead?.referrer,
    utmSource: record.lead?.utmSource,
    utmMedium: record.lead?.utmMedium,
    utmCampaign: record.lead?.utmCampaign,
    utmTerm: record.lead?.utmTerm,
    utmContent: record.lead?.utmContent,
    gclid: record.lead?.gclid,
    msclkid: record.lead?.msclkid,
    liFatId: record.lead?.liFatId,
    country: record.lead?.country,
    region: record.lead?.region,
    city: record.lead?.city,
    visitorId: record.lead?.visitorId
  }
});

const listAllLeadKeys = async (kv) => {
  const allKeys = [];
  let cursor = undefined;
  for (let page = 0; page < 10; page += 1) {
    const listed = await kv.list(cursor ? { limit: 1000, cursor } : { limit: 1000 });
    if (Array.isArray(listed?.keys)) allKeys.push(...listed.keys);
    if (!listed?.list_complete && listed?.cursor) {
      cursor = listed.cursor;
    } else {
      break;
    }
  }
  return allKeys;
};

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'authorization, content-type',
        'cache-control': 'no-store'
      }
    });
  }

  if (request.method !== 'GET') return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  if (!env.LEADS_KV || typeof env.LEADS_KV.list !== 'function') return jsonResponse({ ok: false, error: 'Lead storage is not configured' }, 503);
  if (!(await isAuthorized(request, env))) return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);

  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });
  const bypassCache = new URL(request.url).searchParams.has('fresh');
  const cached = bypassCache ? null : await cache.match(cacheKey);
  if (cached) return cached;

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 200);
  const allKeys = await listAllLeadKeys(env.LEADS_KV);
  allKeys.sort((a, b) => {
    const aTime = String(a?.metadata?.submittedAt || a?.name || '');
    const bTime = String(b?.metadata?.submittedAt || b?.name || '');
    return bTime.localeCompare(aTime);
  });
  const newestKeys = allKeys.slice(0, limit);
  const records = (await Promise.all(newestKeys.map(async (item) => {
    const value = await env.LEADS_KV.get(item.name, 'json');
    return value ? sanitizeRecord(value) : null;
  }))).filter(Boolean);

  records.sort((a, b) => String(b?.lead?.submittedAt || '').localeCompare(String(a?.lead?.submittedAt || '')));

  const resp = new Response(JSON.stringify({
    ok: true,
    count: records.length,
    totalStored: allKeys.length,
    cursor: '',
    leads: records
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, max-age=240'
    }
  });
  await cache.put(cacheKey, resp.clone());
  return resp;
}
