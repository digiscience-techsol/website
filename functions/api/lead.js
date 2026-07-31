const ALLOWED_ORIGINS = new Set([
  'https://digisciencetechsol.com',
  'https://www.digisciencetechsol.com'
]);
const PREVIEW_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.digisciencetechsol-org-website\.pages\.dev$/i;
const INTERNAL_TEST_EMAIL_PATTERN = /@digisciencetechsol\.invalid$/i;

const isAllowedOrigin = (origin) => ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN_PATTERN.test(origin);

const TARGET_INDUSTRIES = new Set([
  'Manufacturing',
  'Healthcare',
  'Legal',
  'BFSI / Financial Services',
  'Insurance',
  'Retail',
  'Logistics',
  'Education',
  'HR and Recruitment',
  'Real Estate',
  'Government / Public Sector'
]);

const BUYER_ROLE_PATTERN = /\b(founder|ceo|cto|cio|coo|cfo|ciso|vp|head|director|partner|owner|chief|lead|manager|sponsor)\b/i;
const GOVERNANCE_PATTERN = /\b(governance|compliance|audit|risk|security|rbac|iam|privacy|approval|hallucination|prompt|model risk|data residency|dpdp|hipaa|soc2|iso)\b/i;

const jsonResponse = (body, status = 200, origin = '') => {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  };

  if (origin && isAllowedOrigin(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers.vary = 'Origin';
  }

  return new Response(JSON.stringify(body), { status, headers });
};

const normalizeText = (value) => String(value || '').trim();

const getFirst = (payload, names) => {
  for (const name of names) {
    const value = normalizeText(payload[name]);
    if (value) return value;
  }
  return '';
};

const parseRequestPayload = async (request) => {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }
  return request.json();
};

const validatePayloadSize = (payload) => {
  const serialized = JSON.stringify(payload || {});
  if (serialized.length > 50000) return 'Submission is too large.';

  for (const [key, value] of Object.entries(payload || {})) {
    if (typeof value === 'string' && value.length > 5000) {
      return `${key} is too long.`;
    }
  }

  return '';
};

const calculateLeadScore = (lead) => {
  let score = 0;
  if (lead.businessEmail) score += 10;
  if (lead.company) score += 10;
  if (BUYER_ROLE_PATTERN.test(lead.role)) score += 15;
  if (TARGET_INDUSTRIES.has(lead.industry)) score += 10;
  if (lead.aiInterestArea) score += 10;
  if (lead.businessProblem.length > 80) score += 15;
  if (lead.desiredOutcome.length > 50) score += 15;
  if (['Immediate', '30 days'].includes(lead.timeline)) score += 15;
  if (['₹5L-₹15L', '₹15L+'].includes(lead.budgetRange)) score += 15;

  const governanceText = [
    lead.businessProblem,
    lead.desiredOutcome,
    lead.governanceRequirements,
    lead.complianceConstraints,
    lead.currentSystems
  ].join(' ');
  if (GOVERNANCE_PATTERN.test(governanceText)) score += 10;

  const category = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Nurture';
  return { score, category };
};

const getRecommendedAction = (lead, scoreCategory) => {
  if (scoreCategory === 'Hot' && /pilot/i.test(lead.aiInterestArea)) return 'Schedule 45-day pilot scoping call.';
  if (scoreCategory === 'Hot') return 'Schedule founder-led discovery call within 1 business day.';
  if (scoreCategory === 'Warm') return 'Send AI readiness intake follow-up and qualify budget/timeline.';
  return 'Add to nurture list and share AI readiness assessment content.';
};

const toLead = (payload, request) => {
  const sourcePage = getFirst(payload, ['sourcePage', 'page']) || '/contact';
  const formType = getFirst(payload, ['formType']) || (sourcePage.includes('ai-readiness-intake') ? 'ai_readiness_intake' : 'contact');
  const fullName = getFirst(payload, ['fullName', 'name']);
  const businessEmail = getFirst(payload, ['businessEmail', 'email']);
  const company = getFirst(payload, ['company', 'companyName']);
  const consentValue = payload.consent === true || payload.consent === 'true' || payload.consent === 'yes' || payload.consent === 'on';
  const internalTestRequested = payload.internalTest === true || payload.internalTest === 'true';
  const isInternalTest = internalTestRequested
    && INTERNAL_TEST_EMAIL_PATTERN.test(businessEmail)
    && /^DigiScience Internal Test\b/i.test(company);

  return {
    sourcePage,
    formType,
    submittedAt: getFirst(payload, ['submittedAt']) || new Date().toISOString(),
    fullName,
    businessEmail,
    phone: getFirst(payload, ['phone']),
    company,
    websiteOrLinkedIn: getFirst(payload, ['websiteOrLinkedIn', 'profileUrl', 'linkedinUrl']),
    role: getFirst(payload, ['role', 'designation', 'industryRole']),
    industry: getFirst(payload, ['industry']),
    cloudPlatform: getFirst(payload, ['cloudPlatform', 'cloud']),
    aiInterestArea: getFirst(payload, ['aiInterestArea', 'service']),
    businessProblem: getFirst(payload, ['businessProblem', 'message']),
    desiredOutcome: getFirst(payload, ['desiredOutcome']),
    timeline: getFirst(payload, ['timeline']),
    budgetRange: getFirst(payload, ['budgetRange', 'budget']),
    consent: consentValue,
    isInternalTest,
    businessContext: getFirst(payload, ['businessContext']),
    workflowPain: getFirst(payload, ['workflowPain']),
    useCaseCandidate: getFirst(payload, ['useCaseCandidate']),
    dataAvailability: getFirst(payload, ['dataAvailability']),
    currentSystems: getFirst(payload, ['currentSystems']),
    governanceRequirements: getFirst(payload, ['governanceRequirements']),
    complianceConstraints: getFirst(payload, ['complianceConstraints']),
    successMetrics: getFirst(payload, ['successMetrics']),
    stakeholders: getFirst(payload, ['stakeholders']),
    userAgent: normalizeText(request.headers.get('user-agent')).slice(0, 500),
    referrer: normalizeText(request.headers.get('referer')).slice(0, 500)
  };
};

const validateLead = (lead, payload) => {
  if (normalizeText(payload.website)) return 'Spam protection rejected this submission.';
  if (!lead.fullName) return 'Full name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.businessEmail)) return 'A valid business email is required.';
  if (lead.formType === 'contact' && !lead.company) return 'Company name is required.';
  if (!lead.consent) return 'Consent is required.';
  if (!lead.businessProblem && !lead.workflowPain && !lead.businessContext) return 'Business problem or workflow context is required.';
  return '';
};

const buildEmailText = (lead, leadId, score, category, recommendedAction) => [
  lead.isInternalTest ? 'INTERNAL TEST — DO NOT TREAT AS A CUSTOMER ENQUIRY' : 'CUSTOMER ENQUIRY',
  '',
  `Lead ID: ${leadId}`,
  `Score: ${score} (${category})`,
  `Recommended next action: ${recommendedAction}`,
  '',
  `Full name: ${lead.fullName}`,
  `Email: ${lead.businessEmail}`,
  `Phone: ${lead.phone}`,
  `Company: ${lead.company}`,
  `Role: ${lead.role}`,
  `Industry: ${lead.industry}`,
  `Cloud platform: ${lead.cloudPlatform}`,
  `AI interest area: ${lead.aiInterestArea}`,
  `Timeline: ${lead.timeline}`,
  `Budget: ${lead.budgetRange}`,
  `Source page: ${lead.sourcePage}`,
  '',
  `Business problem: ${lead.businessProblem}`,
  `Desired outcome: ${lead.desiredOutcome}`,
  `Business context: ${lead.businessContext}`,
  `Workflow pain: ${lead.workflowPain}`,
  `Use case candidate: ${lead.useCaseCandidate}`,
  `Data availability: ${lead.dataAvailability}`,
  `Current systems: ${lead.currentSystems}`,
  `Governance requirements: ${lead.governanceRequirements}`,
  `Compliance constraints: ${lead.complianceConstraints}`,
  `Success metrics: ${lead.successMetrics}`,
  `Stakeholders: ${lead.stakeholders}`
].join('\n');

const notifyByResend = async (env, lead, leadId, score, category, recommendedAction) => {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFICATION_FROM || !env.LEAD_NOTIFICATION_TO) return { configured: false, sent: false };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.LEAD_NOTIFICATION_FROM,
      to: env.LEAD_NOTIFICATION_TO,
      subject: `${lead.isInternalTest ? '[INTERNAL TEST — DO NOT TREAT AS CUSTOMER] ' : ''}New DigiScience AI Lead - ${lead.company || 'Unknown Company'} - ${lead.aiInterestArea || 'AI Enquiry'}`,
      text: buildEmailText(lead, leadId, score, category, recommendedAction)
    })
  });

  return { configured: true, sent: response.ok, status: response.status };
};

const forwardToWebhook = async (env, record) => {
  if (!env.LEAD_WEBHOOK_URL) return { configured: false, sent: false };

  const response = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(record)
  });

  return { configured: true, sent: response.ok, status: response.status };
};

const storeInKv = async (env, leadId, record) => {
  if (!env.LEADS_KV || typeof env.LEADS_KV.put !== 'function') return { configured: false, stored: false };
  await env.LEADS_KV.put(leadId, JSON.stringify(record), {
    metadata: {
      submittedAt: record.lead.submittedAt,
      company: record.lead.company,
      email: record.lead.businessEmail,
      status: record.status
    }
  });
  return { configured: true, stored: true };
};

const attemptDelivery = async (name, operation, unavailableResult) => {
  try {
    return await operation();
  } catch (error) {
    console.error('lead_delivery_channel_failed', {
      channel: name,
      error: error instanceof Error ? error.message : 'Unknown delivery error'
    });
    return unavailableResult;
  }
};

export async function onRequest({ request, env }) {
  const origin = request.headers.get('origin') || '';

  if (request.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin)) return jsonResponse({ ok: false, error: 'Origin not allowed' }, 403, origin);
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': origin && isAllowedOrigin(origin) ? origin : 'https://digisciencetechsol.com',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '86400',
        vary: 'Origin'
      }
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405, origin);
  }

  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ ok: false, error: 'Origin not allowed' }, 403, origin);
  }

  try {
    const payload = await parseRequestPayload(request);
    const sizeError = validatePayloadSize(payload);
    if (sizeError) return jsonResponse({ ok: false, error: sizeError }, 413, origin);

    const lead = toLead(payload, request);
    const validationError = validateLead(lead, payload);
    if (validationError) return jsonResponse({ ok: false, error: validationError }, 400, origin);

    const leadId = `DST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { score, category } = calculateLeadScore(lead);
    const recommendedAction = getRecommendedAction(lead, category);
    const record = {
      leadId,
      status: lead.isInternalTest ? 'Internal Test' : 'New',
      owner: 'DigiScience lead operations',
      nextFollowUpDate: '',
      leadScore: score,
      leadCategory: category,
      recommendedAction,
      lead
    };

    const [storage, webhook, email] = await Promise.all([
      attemptDelivery('storage', () => storeInKv(env, leadId, record), { configured: Boolean(env.LEADS_KV), stored: false }),
      attemptDelivery('webhook', () => forwardToWebhook(env, record), { configured: Boolean(env.LEAD_WEBHOOK_URL), sent: false }),
      attemptDelivery('email', () => notifyByResend(env, lead, leadId, score, category, recommendedAction), {
        configured: Boolean(env.RESEND_API_KEY && env.LEAD_NOTIFICATION_FROM && env.LEAD_NOTIFICATION_TO),
        sent: false
      })
    ]);
    const channels = {
      storage: Boolean(storage.stored),
      webhook: Boolean(webhook.sent),
      email: Boolean(email.sent)
    };
    const accepted = Object.values(channels).some(Boolean);

    if (!accepted) {
      console.error('lead_delivery_rejected', { leadId, channels, internalTest: lead.isInternalTest });
      return jsonResponse({
        ok: false,
        error: 'The enquiry could not be recorded. No confirmation was created; please try again shortly.',
        delivery: {
          accepted: false,
          channels
        }
      }, 503, origin);
    }

    if (Object.values(channels).some((delivered) => !delivered)) {
      console.warn('lead_delivery_partial', { leadId, channels, internalTest: lead.isInternalTest });
    }

    return jsonResponse({
      ok: true,
      leadId,
      message: 'Enquiry recorded',
      testSubmission: lead.isInternalTest,
      delivery: {
        accepted: true,
        channels
      }
    }, 200, origin);
  } catch (error) {
    console.error('lead_submission_failed', {
      error: error instanceof Error ? error.message : 'Unknown lead submission error'
    });
    return jsonResponse({
      ok: false,
      error: 'The enquiry could not be recorded. No confirmation was created; please try again shortly.',
      delivery: {
        accepted: false,
        channels: { storage: false, webhook: false, email: false }
      }
    }, 500, origin);
  }
}
