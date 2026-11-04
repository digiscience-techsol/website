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
    stakeholders: record.lead?.stakeholders
  }
});

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

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
  const listed = await env.LEADS_KV.list({ limit });
  const records = await Promise.all((listed.keys || []).map(async (item) => {
    const value = await env.LEADS_KV.get(item.name, 'json');
    return value ? sanitizeRecord(value) : null;
  }));

  records.sort((a, b) => String(b?.lead?.submittedAt || '').localeCompare(String(a?.lead?.submittedAt || '')));

  return jsonResponse({
    ok: true,
    count: records.filter(Boolean).length,
    cursor: listed.cursor || '',
    leads: records.filter(Boolean)
  });
}
