const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const getBearerToken = (request) => {
  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
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
  if (!env.LEAD_DASHBOARD_TOKEN) return jsonResponse({ ok: false, error: 'Dashboard token is not configured' }, 503);
  if (getBearerToken(request) !== env.LEAD_DASHBOARD_TOKEN) return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);

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
