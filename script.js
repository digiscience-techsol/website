const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const serviceSelect = document.getElementById('service');
const formSelectionNote = document.getElementById('formSelectionNote');
const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
const appConfig = window.DIGISCIENCE_CONFIG || {};
const gaMeasurementId = String(appConfig.gaMeasurementId || '').trim();

const initializeAnalytics = () => {
  if (!/^G-[A-Z0-9]+$/i.test(gaMeasurementId)) return false;
  if (window.__DIGISCIENCE_GA_INITIALIZED__) return true;

  window.__DIGISCIENCE_GA_INITIALIZED__ = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[data-digiscience-ga="${gaMeasurementId}"]`)) {
    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    analyticsScript.dataset.digiscienceGa = gaMeasurementId;
    document.head.appendChild(analyticsScript);
  }

  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, {
    send_page_view: true,
    allow_google_signals: true,
    transport_type: 'beacon'
  });
  return true;
};

initializeAnalytics();

// --- Persistent First-Party Visitor Cookie (ds_vid) & Matomo 5 Open-Source Profile Stitching ---
const ensureVisitorCookie = () => {
  const fromCookie = (document.cookie.match(/(?:^|;\s*)ds_vid=([a-f0-9]{16})/i) || [])[1];
  let fromStore = '';
  try { fromStore = String(window.localStorage.getItem('ds_vid_ls') || ''); } catch { /* ignore */ }
  const existing = (fromCookie || fromStore || '').toLowerCase();
  if (/^[a-f0-9]{16}$/.test(existing)) {
    document.cookie = `ds_vid=${existing}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    try { window.localStorage.setItem('ds_vid_ls', existing); } catch { /* ignore */ }
    return existing;
  }
  const bytes = new Uint8Array(8);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let i = 0; i < 8; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  const vid = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  document.cookie = `ds_vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  try { window.localStorage.setItem('ds_vid_ls', vid); } catch { /* ignore */ }
  return vid;
};
const dsVisitorId = ensureVisitorCookie();

const stitchVisitorIdentity = ({ name = '', email = '', phone = '', company = '' } = {}) => {
  try {
    const prev = JSON.parse(window.localStorage.getItem('dsVisitorIdentity') || '{}');
    const merged = {
      vid: dsVisitorId,
      name: name || prev.name || '',
      email: email || prev.email || '',
      phone: phone || prev.phone || '',
      company: company || prev.company || ''
    };
    window.localStorage.setItem('dsVisitorIdentity', JSON.stringify(merged));
    window._paq = window._paq || [];
    const uid = merged.email || merged.phone;
    if (uid) window._paq.push(['setUserId', uid]);
    if (merged.name) window._paq.push(['setCustomDimension', 1, merged.name]);
    if (merged.email) window._paq.push(['setCustomDimension', 2, merged.email]);
    if (merged.phone) window._paq.push(['setCustomDimension', 3, merged.phone]);
    if (merged.company) window._paq.push(['setCustomDimension', 4, merged.company]);
    if (uid && typeof window.gtag === 'function' && /^G-[A-Z0-9]+$/i.test(gaMeasurementId)) {
      window.gtag('config', gaMeasurementId, { user_id: dsVisitorId, allow_google_signals: true });
    }
  } catch { /* ignore storage restrictions */ }
};

const initMatomoOpenSource = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
  const _paq = (window._paq = window._paq || []);
  _paq.push(['setVisitorId', dsVisitorId]);
  try {
    const saved = JSON.parse(window.localStorage.getItem('dsVisitorIdentity') || '{}');
    if (saved.email || saved.phone) _paq.push(['setUserId', saved.email || saved.phone]);
    if (saved.name) _paq.push(['setCustomDimension', 1, saved.name]);
    if (saved.email) _paq.push(['setCustomDimension', 2, saved.email]);
    if (saved.phone) _paq.push(['setCustomDimension', 3, saved.phone]);
    if (saved.company) _paq.push(['setCustomDimension', 4, saved.company]);
  } catch { /* ignore */ }
  _paq.push(['enableLinkTracking']);
  _paq.push(['trackPageView']);
  _paq.push(['setTrackerUrl', '/api/tracker']);
  _paq.push(['setSiteId', '1']);
  const g = document.createElement('script');
  g.async = true;
  g.src = '/api/tracker?js=1';
  document.head.appendChild(g);
};
initMatomoOpenSource();

// --- Form-less visitor identification (open-source fingerprint + edge geo + behavior) ---
(() => {
  if (window.__DS_VISITOR_ID_INIT__) return;
  window.__DS_VISITOR_ID_INIT__ = true;
  const started = Date.now();
  let scrollMax = 0;
  let clicks = 0;
  let pages = 1;
  try {
    pages = Number(sessionStorage.getItem('ds_pages_seen') || '0') + 1;
    sessionStorage.setItem('ds_pages_seen', String(pages));
  } catch { /* private browsing */ }

  const deviceClass = () => {
    const w = window.innerWidth || 0;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  };

  const canvasSignal = () => {
    try {
      const c = document.createElement('canvas');
      c.width = 240; c.height = 60;
      const ctx = c.getContext('2d');
      if (!ctx) return '';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 240, 60);
      ctx.fillStyle = '#069';
      ctx.fillText(`DS-fp-${navigator.language || ''}`, 2, 2);
      ctx.strokeStyle = '#ff0';
      ctx.beginPath(); ctx.arc(50, 30, 20, 0, Math.PI * 2); ctx.stroke();
      return c.toDataURL().slice(-96);
    } catch { return ''; }
  };

  const webglSignal = () => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return '';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return `${dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : ''}|${dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''}`;
    } catch { return ''; }
  };

  const sha256Hex = async (str) => {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (`00000000${(h >>> 0).toString(16)}`).slice(-8) + (`00000000${str.length.toString(16)}`).slice(-8);
    }
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  };

  const fingerprintRaw = () => {
    const nav = navigator || {};
    const scr = window.screen || {};
    return [
      nav.userAgent || '', nav.language || '', (nav.languages || []).join(','),
      nav.platform || '', nav.hardwareConcurrency || '', nav.deviceMemory || '', nav.maxTouchPoints || '',
      `${scr.width}x${scr.height}x${scr.colorDepth || ''}`,
      String(new Date().getTimezoneOffset()),
      (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
      canvasSignal(), webglSignal(), deviceClass()
    ].join('||');
  };

  const savedIdentity = () => {
    try { return JSON.parse(window.localStorage.getItem('dsVisitorIdentity') || '{}'); }
    catch { return {}; }
  };

  const beacon = async (extra = {}) => {
    const id = savedIdentity();
    const payload = {
      visitorId: dsVisitorId,
      fingerprint: window.__dsFingerprint || '',
      page: window.location.pathname,
      path: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer || '',
      deviceClass: deviceClass(),
      scrollMax,
      dwellMs: Math.max(0, Date.now() - started),
      pages,
      clicks,
      chatTurns: Number(sessionStorage.getItem('ds_chat_turns') || '0') || 0,
      name: id.name || '',
      email: id.email || '',
      phone: id.phone || '',
      company: id.company || '',
      contact_source: extra.contact_source || (id.email || id.phone || id.name ? 'progressive_chat' : 'browse_enrichment'),
      ...extra
    };
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'same-origin'
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.ok) {
        window.__dsIdentify = data;
        try {
          if (data.vid) {
            try { window.localStorage.setItem('ds_vid_ls', data.vid); } catch { /* ignore */ }
          }
          window.localStorage.setItem('dsVisitorEnrichment', JSON.stringify({
            at: new Date().toISOString(),
            vid: data.vid,
            fingerprint: data.fingerprint,
            geo: data.geo,
            enrichment: data.enrichment || null,
            identity: data.identity,
            limits: data.limits || null
          }));
        } catch { /* ignore */ }
        if (data.geo) {
          const cur = savedIdentity();
          const orgHint = data.geo.companyCandidate || '';
          if (!cur.company && orgHint) stitchVisitorIdentity({ company: orgHint });
        }
      }
      return data;
    } catch {
      return null;
    }
  };

  window.dsIdentifyBeacon = beacon;
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    scrollMax = Math.max(scrollMax, Math.round((window.scrollY / max) * 100));
  }, { passive: true });
  window.addEventListener('click', () => { clicks += 1; }, { passive: true });

  (async () => {
    window.__dsFingerprint = await sha256Hex(fingerprintRaw());
    try { window.localStorage.setItem('ds_fp_v1', window.__dsFingerprint); } catch { /* ignore */ }
    await beacon({ contact_source: 'browse_enrichment' });
    setTimeout(() => { beacon({ contact_source: 'browse_enrichment' }); }, 25000);
  })();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') beacon({ contact_source: 'browse_enrichment' });
  });
})();

const ATTRIBUTION_STORAGE_KEY = 'digiscience_first_touch_v1';
const pageLoadedAt = Date.now();
let humanInteracted = false;
['pointerdown', 'keydown', 'touchstart', 'focusin'].forEach((eventType) => {
  window.addEventListener(eventType, () => { humanInteracted = true; }, { once: true, passive: true });
});
const getClientProof = () => ({
  dwellMs: Math.max(0, Date.now() - pageLoadedAt),
  interacted: humanInteracted
});

const captureFirstTouchAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  const currentUtm = {
    utmSource: String(params.get('utm_source') || '').trim().slice(0, 120),
    utmMedium: String(params.get('utm_medium') || '').trim().slice(0, 120),
    utmCampaign: String(params.get('utm_campaign') || '').trim().slice(0, 160),
    utmTerm: String(params.get('utm_term') || '').trim().slice(0, 160),
    utmContent: String(params.get('utm_content') || '').trim().slice(0, 160),
    gclid: String(params.get('gclid') || '').trim().slice(0, 160),
    msclkid: String(params.get('msclkid') || '').trim().slice(0, 160),
    liFatId: String(params.get('li_fat_id') || '').trim().slice(0, 160)
  };
  const externalReferrer = (() => {
    try {
      if (!document.referrer) return '';
      const refUrl = new URL(document.referrer);
      if (refUrl.hostname === window.location.hostname) return '';
      return document.referrer.slice(0, 300);
    } catch {
      return '';
    }
  })();

  if (!currentUtm.utmSource && externalReferrer) {
    try {
      const refHost = new URL(externalReferrer).hostname.toLowerCase();
      if (refHost.includes('chatgpt.com') || refHost.includes('openai.com')) { currentUtm.utmSource = 'chatgpt'; currentUtm.utmMedium = currentUtm.utmMedium || 'ai_referral'; }
      else if (refHost.includes('perplexity.ai')) { currentUtm.utmSource = 'perplexity'; currentUtm.utmMedium = currentUtm.utmMedium || 'ai_referral'; }
      else if (refHost.includes('claude.ai') || refHost.includes('anthropic.com')) { currentUtm.utmSource = 'claude'; currentUtm.utmMedium = currentUtm.utmMedium || 'ai_referral'; }
      else if (refHost.includes('gemini.google.com')) { currentUtm.utmSource = 'gemini'; currentUtm.utmMedium = currentUtm.utmMedium || 'ai_referral'; }
      else if (refHost.includes('copilot.microsoft.com')) { currentUtm.utmSource = 'copilot'; currentUtm.utmMedium = currentUtm.utmMedium || 'ai_referral'; }
    } catch {
      // ignore referrer parse errors
    }
  }

  let stored = null;
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }

  const hasNewUtm = Boolean(
    currentUtm.utmSource || currentUtm.utmMedium || currentUtm.utmCampaign ||
    currentUtm.gclid || currentUtm.msclkid || currentUtm.liFatId
  );
  if (!stored || (hasNewUtm && !stored.utmSource && !stored.gclid && !stored.msclkid && !stored.liFatId)) {
    stored = {
      landingPage: (window.location.pathname + window.location.search).slice(0, 300),
      initialReferrer: (stored && stored.initialReferrer) || externalReferrer,
      ...currentUtm
    };
    try {
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // sessionStorage unavailable (private mode); keep in-memory fallback
    }
  }
  return {
    landingPage: (stored && stored.landingPage) || window.location.pathname.slice(0, 250),
    referrer: (stored && stored.initialReferrer) || externalReferrer,
    utmSource: (stored && stored.utmSource) || currentUtm.utmSource,
    utmMedium: (stored && stored.utmMedium) || currentUtm.utmMedium,
    utmCampaign: (stored && stored.utmCampaign) || currentUtm.utmCampaign,
    utmTerm: (stored && stored.utmTerm) || currentUtm.utmTerm,
    utmContent: (stored && stored.utmContent) || currentUtm.utmContent,
    gclid: (stored && stored.gclid) || currentUtm.gclid,
    msclkid: (stored && stored.msclkid) || currentUtm.msclkid,
    liFatId: (stored && stored.liFatId) || currentUtm.liFatId
  };
};

const visitorAttribution = captureFirstTouchAttribution();

const serviceQuery = new URLSearchParams(window.location.search).get('service');
const serviceOptions = {
  "solution-assessment": "DigiScience Solution Assessment",
  "manufacturing-enquiry-workflow": "DigiScience Solution Assessment",
  "ai-cloud-cost-control": "DigiScience Solution Assessment",
  "ai-pilot-production-readiness": "DigiScience Solution Assessment",
  "ai-strategy-readiness": "AI Strategy and Readiness",
  "secure-ai-cloud-platform": "Secure AI Cloud Platform",
  "cloud-modernization-ai-readiness": "Cloud Modernization",
  "industry-ai-transformation": "Industry AI Transformation",
  "responsible-ai-governance": "Responsible AI Governance",
  "ai-ready-devops": "AI-ready DevOps",
  "bfsi-compliance-intelligence": "Bfsi Compliance Intelligence",
  "healthcare-ai": "Healthcare Ai",
  "hr-recruitment-ai": "Hr Recruitment Ai",
  "legal-document-intelligence": "Legal Document Intelligence",
  "logistics-ai": "Logistics Ai",
  "manufacturing-ai": "Manufacturing Ai",
  "retail-ai": "Retail Ai"
};

if (serviceSelect && serviceOptions[serviceQuery]) {
  serviceSelect.value = serviceOptions[serviceQuery];
  if (formSelectionNote) {
    formSelectionNote.hidden = false;
    formSelectionNote.textContent = `You are enquiring about the ${serviceOptions[serviceQuery]}.`;
  }
}

const trackEvent = (eventName, params = {}) => {
  if (!eventName) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      page_path: window.location.pathname,
      ...params
    });
  }
};

const funnelViewEvents = {
  '/solution-assessment': 'solution_assessment_view',
  '/pricing': 'pricing_view',
  '/contact': 'contact_view',
  '/ai-readiness-intake': 'ai_readiness_intake_view',
  '/thank-you': 'lead_thank_you_view'
};

const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
if (funnelViewEvents[currentPath]) {
  trackEvent(funnelViewEvents[currentPath], {
    service: serviceOptions[serviceQuery] || '',
    page_title: document.title
  });
}

const ensurePremiumVisuals = () => {
  if (!document.querySelector('link[href*="premium.css"]')) {
    const premiumStyles = document.createElement('link');
    premiumStyles.rel = 'stylesheet';
    premiumStyles.href = '/premium.css?v=premium5';
    document.head.appendChild(premiumStyles);
  }

  const createImage = (src, alt, width, height, extraClass = '') => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.width = width;
    image.height = height;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = `card-visual ${extraClass}`.trim();
    return image;
  };

  const heroPanel = document.querySelector('.hero-panel');
  if (heroPanel && !heroPanel.querySelector('.hero-visual-shell')) {
    heroPanel.classList.add('visible');
    const shell = document.createElement('div');
    shell.className = 'hero-visual-shell';
    shell.innerHTML = [
      '<img src="/assets/ai-photos/hero-enterprise-ai.jpg" alt="Secure enterprise AI cloud architecture with governed data flows" width="700" height="393" decoding="async" fetchpriority="high" />',
      '<div class="visual-badge visual-badge-top">Governed AI</div>',
      '<div class="visual-badge visual-badge-bottom">Cloud + security foundation</div>'
    ].join('');
    heroPanel.insertBefore(shell, heroPanel.firstChild);
  }

  const serviceVisuals = {
    'AI Strategy, Readiness & Transformation Advisory': ['/assets/ai-visuals/ai-readiness-pilot.svg', 'AI strategy, readiness scorecard, target architecture, and transformation roadmap', 900, 560],
    'AI Industry Transformation Solutions': ['/assets/ai-photos/service-industry-transformation.jpg', 'Industry AI transformation across operations, documents, customers, and decision support', 900, 560],
    'Secure Enterprise AI Cloud Platform': ['/assets/ai-photos/service-secure-platform.jpg', 'Secure enterprise AI platform with private cloud, identity, observability, and governance controls', 900, 560],
    'Responsible AI Governance and Agent Control': ['/assets/ai-photos/service-governance-control.jpg', 'Responsible AI governance console with approval, audit, risk, and agent control', 900, 560],
    'AI-Ready DevOps and Platform Engineering': ['/assets/ai-photos/service-ai-devops.jpg', 'AI-ready DevOps and platform engineering pipeline for MLOps and LLMOps', 900, 560],
    'Cloud Modernization for AI Readiness': ['/assets/ai-photos/service-modernization.jpg', 'Cloud modernization roadmap for AI-ready data, security, platforms, and operations', 900, 560],
    'Industry AI Pilot in 45 Days': ['/assets/ai-photos/service-45-day-pilot.jpg', '45-day industry AI pilot plan from use case to measurable business outcome', 900, 560]
  };

  document.querySelectorAll('.card h3').forEach((heading) => {
    const title = heading.textContent.trim();
    const card = heading.closest('.card');
    if (!card || card.querySelector('.card-visual') || !serviceVisuals[title]) return;
    card.classList.add('visual-card');
    card.insertBefore(createImage(...serviceVisuals[title]), card.firstChild);
  });

  const industryMap = {
    'Manufacturing AI': ['/assets/ai-photos/industry-manufacturing.jpg', 'Manufacturing AI for predictive maintenance, visual inspection, and production intelligence'],
    'Healthcare AI Workflows': ['/assets/ai-photos/industry-healthcare.jpg', 'Healthcare AI workflows for documentation, scheduling, and patient operations'],
    'Legal Document Intelligence': ['/assets/ai-photos/industry-legal.jpg', 'Legal document intelligence for contracts, clause extraction, and obligation tracking'],
    'BFSI Compliance and Fraud Intelligence': ['/assets/ai-photos/industry-bfsi.jpg', 'BFSI AI for compliance, KYC, fraud intelligence, and audit readiness'],
    'Retail Demand and Customer Intelligence': ['/assets/ai-photos/industry-retail.jpg', 'Retail AI for demand forecasting, recommendations, and customer intelligence'],
    'Logistics AI Control Tower': ['/assets/ai-photos/industry-logistics.jpg', 'Logistics AI control tower for ETA, routing, exception, and warehouse intelligence'],
    'HR and Recruitment Intelligence': ['/assets/ai-photos/industry-hr.jpg', 'HR and recruitment AI for candidate matching, screening, and workforce analytics'],
    'Government / Public Sector AI': ['/assets/ai-photos/industry-public-sector.jpg', 'Government and public sector AI for secure citizen service and document workflows'],
    'Government and Public Sector AI': ['/assets/ai-photos/industry-public-sector.jpg', 'Government and public sector AI for secure citizen service and document workflows']
  };

  document.querySelectorAll('#industries .cards').forEach((grid) => grid.classList.add('industry-cards'));
  document.querySelectorAll('#industries .card h3').forEach((heading) => {
    const title = heading.textContent.trim();
    const card = heading.closest('.card');
    const config = industryMap[title];
    if (!card || !config || card.querySelector('.industry-visual')) return;
    card.classList.add('industry-card');
    const visual = document.createElement('div');
    card.insertBefore(createImage(config[0], config[1], 900, 560, 'industry-visual'), card.firstChild);
  });

  const proofCards = document.querySelectorAll('#proof .card');
  if (proofCards[0] && !proofCards[0].querySelector('.card-visual')) {
    proofCards[0].classList.add('visual-card');
    proofCards[0].insertBefore(createImage('/assets/ai-photos/service-45-day-pilot.jpg', 'AI readiness assessment scorecard and pilot roadmap visual', 650, 366), proofCards[0].firstChild);
  }
  if (proofCards[1] && !proofCards[1].querySelector('.card-visual')) {
    proofCards[1].classList.add('visual-card');
    proofCards[1].insertBefore(createImage('/assets/ai-photos/service-secure-platform.jpg', 'Secure AI landing zone and governance architecture visual', 650, 366), proofCards[1].firstChild);
  }
};

const productionStylePatch = document.createElement('style');
productionStylePatch.textContent = `
  .contact-grid > * { min-width: 0; }
  .contact-link a { overflow-wrap: anywhere; }
`;
document.head.appendChild(productionStylePatch);

document.querySelectorAll('h3').forEach((heading) => {
  if (heading.textContent.trim() === 'Government and Public Sector AI') {
    heading.textContent = 'Government / Public Sector AI';
  }
});

ensurePremiumVisuals();

const initLeadAssistant = () => {
  if (document.querySelector('.ai-assistant-panel')) return;

  const quickPrompts = [
    ['Solution assessment', 'How does the DigiScience Solution Assessment work?'],
    ['Pricing', 'How should we budget for enterprise AI work?'],
    ['45-day pilot', 'What is included in the 45-day AI pilot?'],
    ['AI readiness', 'What does the AI Readiness Assessment cover?'],
    ['Governance', 'How do you handle responsible AI governance?'],
    ['Industries', 'Which industries do you support?'],
    ['Contact', 'I want to talk to DigiScience']
  ];

  const industryAnswers = {
    manufacturing: 'Manufacturing AI can focus on predictive maintenance, visual inspection, anomaly detection, quality intelligence, and production decision support. A good first pilot usually starts with one plant workflow and one measurable metric.',
    healthcare: 'Healthcare AI work should stay workflow-led and governance-heavy: clinical documentation support, patient operations, scheduling intelligence, knowledge assistants, and secure document workflows with human review.',
    legal: 'Legal document intelligence usually starts with contract ingestion, clause extraction, obligation tracking, legal search, review workflow, and an audit trail for every recommendation.',
    bfsi: 'For banking, financial services, and insurance, the strongest starting points are fraud intelligence, compliance response, KYC support, audit readiness, model risk controls, and risk intelligence.',
    retail: 'Retail AI opportunities include demand forecasting, recommendation systems, churn prevention, campaign intelligence, customer support productivity, and inventory decision support.',
    logistics: 'Logistics AI can support ETA prediction, route intelligence, warehouse visibility, exception management, and control-tower decision support.',
    hr: 'HR and recruitment intelligence can improve candidate matching, screening productivity, skills intelligence, interview support, and workforce analytics with bias and audit controls.',
    government: 'Public sector AI should be secure and explainable: citizen-service productivity, document processing, knowledge access, audit intelligence, and governed workflow automation.'
  };

  const localAnswer = (question) => {
    const text = question.toLowerCase();
    const link = (label, href) => `<a href="${href}">${label}</a>`;
    const asksPricing = /price|pricing|budget|cost|quote|fee/.test(text);
    const asksPilot = /45|pilot|proof|poc|prototype/.test(text);

    if (asksPricing && asksPilot) {
      return `The 45-day pilot is scoped after readiness and discovery because data access, integrations, security, users, and governance materially change delivery effort. The ${link('pilot framework', '/45-day-ai-pilot')} explains what is delivered, and the ${link('engagement models page', '/pricing')} explains the commercial approach.`;
    }

    if (asksPricing) {
      return `The DigiScience Solution Assessment is INR 29,000 / USD 349 for the first five paid customers, then INR 49,000 / USD 599 standard. It covers one defined problem in seven business days after required inputs, with 50% to begin and 50% before the final package. The full paid fee is credited toward a DigiScience implementation signed within 60 days. See the ${link('assessment terms', '/solution-assessment')}.`;
    }

    if (asksPilot) {
      return `The 45-day pilot validates one AI workflow through scope, data feasibility, secure architecture, governance controls, a controlled working proof, user and quality measures, and a production scale decision. See ${link('45-Day AI Pilot', '/45-day-ai-pilot')}.`;
    }

    if (/solution assessment|defined problem|business problem|right path/.test(text)) {
      return `Bring one defined business or technology problem. DigiScience assesses workflow improvement, automation, AI, secure cloud, hybrid or on-premise deployment, platform modernization, or a combination, then delivers a recommendation and implementation brief. It is a bounded pre-implementation engagement, not full implementation or unlimited free consulting. See the ${link('Solution Assessment', '/solution-assessment')}.`;
    }

    if (/readiness|scorecard/.test(text)) {
      return `The AI Readiness Assessment identifies high-value use cases, data gaps, cloud/security gaps, governance requirements, and the right first pilot. It is the focused starting point when AI is already the likely path.`;
    }

    if (/govern|responsible|security|risk|hallucination|audit|approval|prompt|rbac|iam|private/.test(text)) {
      return `DigiScience positions governance as part of the build: responsible AI, prompt security, model governance, human approval, hallucination risk controls, audit trail, IAM/RBAC, private networking, monitoring, and cost governance.`;
    }

    if (/platform|cloud|azure|aws|gcp|bedrock|vertex|openai|foundry|sagemaker|kubernetes/.test(text)) {
      return `The platform approach can use Azure OpenAI, Azure AI Foundry, AWS Bedrock, SageMaker, Vertex AI, AKS/EKS/GKE, monitoring, security controls, and cost governance. Cloud is positioned as the secure foundation for measurable AI outcomes.`;
    }

    const matchedIndustry = Object.keys(industryAnswers).find((key) => text.includes(key));
    if (matchedIndustry) return `${industryAnswers[matchedIndustry]} Explore more on the ${link('industries page', '/industries')}.`;

    if (/industry|industries|sector|vertical/.test(text)) {
      return `DigiScience supports manufacturing, healthcare, legal, BFSI, retail, logistics, HR/recruitment, and government/public sector use cases. The site frames each as business problem -> AI outcome -> secure architecture -> governance controls -> measurable value.`;
    }

    if (/contact|call|email|talk|demo|meeting|lead|consult/.test(text)) {
      return 'Share your details below and DigiScience can follow up about the right assessment, pilot, or private quote.';
    }

    return `DigiScience Techsol helps business and technology leaders choose and deliver the right path for defined problems, including workflow improvement, automation, AI, secure cloud, hybrid deployment, and platform modernization. Ask me about the Solution Assessment, pricing, the 45-day pilot, AI readiness, governance, cloud platforms, or industries.`;
  };

  const toggle = document.createElement('button');
  toggle.className = 'ai-assistant-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span>AI</span><span>Ask DigiScience</span>';

  const panel = document.createElement('section');
  panel.className = 'ai-assistant-panel';
  panel.setAttribute('aria-label', 'DigiScience lead assistant');
  panel.innerHTML = `
    <div class="ai-assistant-header">
      <div>
        <strong>DigiScience AI assistant</strong>
        <span>Ask about services, pricing, pilots, governance, and industries.</span>
      </div>
      <button class="ai-assistant-close" type="button" aria-label="Close assistant">×</button>
    </div>
    <div class="ai-assistant-messages" aria-live="polite"></div>
    <div>
      <div class="ai-quick-actions"></div>
      <form class="ai-assistant-input">
        <input type="text" name="question" autocomplete="off" placeholder="Ask a question..." aria-label="Ask a question" />
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  document.body.append(toggle, panel);

  const messages = panel.querySelector('.ai-assistant-messages');
  const quickActions = panel.querySelector('.ai-quick-actions');
  const inputForm = panel.querySelector('.ai-assistant-input');
  const questionInput = inputForm.querySelector('input');
  const closeButton = panel.querySelector('.ai-assistant-close');
  const transcript = [];

  const scrollMessages = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  const addMessage = (content, type = 'bot', html = false) => {
    const message = document.createElement('div');
    message.className = `ai-msg ${type === 'user' ? 'ai-msg-user' : ''}`.trim();
    if (html) {
      message.innerHTML = content;
    } else {
      message.textContent = content;
    }
    messages.appendChild(message);
    scrollMessages();
    return message;
  };

  const addLeadForm = () => {
    if (panel.querySelector('.ai-lead-form')) return;
    const wrapper = addMessage('', 'bot');
    const form = document.createElement('form');
    form.className = 'ai-lead-form';
    form.innerHTML = `
      <input name="name" required placeholder="Name" autocomplete="name" />
      <input name="email" required type="email" placeholder="Work email" autocomplete="email" />
      <input name="company" placeholder="Company" autocomplete="organization" />
      <textarea name="message" rows="3" required placeholder="What outcome or use case should we discuss?"></textarea>
      <label class="checkbox-line compact"><input type="checkbox" name="consent" required /> <span>I agree to be contacted by DigiScience Techsol. <a href="/privacy">Privacy notice</a>.</span></label>
      <button type="submit">Send enquiry</button>
    `;
    wrapper.appendChild(form);
    scrollMessages();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        trackEvent('form_validation_error', {
          form_name: 'assistant_lead_form',
          failure_reason: 'required_fields'
        });
        return;
      }
      const leadEndpointUrl = appConfig.leadEndpointUrl || '/api/lead';
      const payload = {
        formType: 'assistant',
        sourcePage: window.location.pathname,
        fullName: form.name.value.trim(),
        businessEmail: form.email.value.trim(),
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        aiInterestArea: 'Website AI assistant',
        service: 'Website AI assistant',
        businessProblem: form.message.value.trim(),
        message: form.message.value.trim(),
        page: window.location.pathname,
        landingPage: visitorAttribution.landingPage,
        referrer: visitorAttribution.referrer,
        utmSource: visitorAttribution.utmSource,
        utmMedium: visitorAttribution.utmMedium,
        utmCampaign: visitorAttribution.utmCampaign,
        utmTerm: visitorAttribution.utmTerm,
        utmContent: visitorAttribution.utmContent,
        gclid: visitorAttribution.gclid,
        msclkid: visitorAttribution.msclkid,
        liFatId: visitorAttribution.liFatId,
        clientProof: getClientProof(),
        consent: Boolean(form.consent && form.consent.checked),
        transcript: transcript.join(' | '),
        submittedAt: new Date().toISOString()
      };

      try {
        form.querySelector('button').disabled = true;
        trackEvent('lead_submit_attempt', {
          form_name: 'assistant_lead_form',
          service: 'Website AI assistant'
        });
        const response = await fetch(leadEndpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok || result.delivery?.accepted !== true) {
          trackEvent('lead_submit_error', {
            form_name: 'assistant_lead_form',
            failure_stage: 'request',
            http_status: response.status
          });
          addMessage('I could not submit this right now. Please use the main contact form or try again shortly.');
          return;
        }
        addMessage('Thanks. Your enquiry has been captured. DigiScience will review the requirement and follow up.');
        form.reset();
        trackEvent('lead_submit_success', {
          form_name: 'assistant_lead_form',
          service: 'Website AI assistant'
        });
        trackEvent('generate_lead', {
          form_name: 'assistant_lead_form',
          service: 'Website AI assistant'
        });
      } catch (error) {
        console.error(error);
        trackEvent('lead_submit_error', {
          form_name: 'assistant_lead_form',
          failure_stage: 'network'
        });
        addMessage('I could not submit this right now. Please use the main contact form or try again shortly.');
      } finally {
        form.querySelector('button').disabled = false;
      }
    });
  };

  const history = [];
  let userTurns = 0;
  const EMAIL_STORAGE_KEY = 'dsChatEmailCaptured';
  const EMAIL_DONE_KEY = 'dsEmailCaptureDone';
  const PROFILE_KEY = 'dsChatProfileV1';
  const enrichHint = () => {
    try {
      const e = JSON.parse(window.localStorage.getItem('dsVisitorEnrichment') || '{}');
      const company = (e.geo && e.geo.companyCandidate) || '';
      const domain = (e.geo && e.geo.domainGuess) || (e.enrichment && e.enrichment.domainGuess) || '';
      return { company, domain };
    } catch { return { company: '', domain: '' }; }
  };
  const NAME_ASK = 'Happy to help — what name should DigiScience use when we follow up?';
  const CONTACT_ASK = (() => {
    const { company, domain } = enrichHint();
    if (company && domain) {
      return `If you are with ${company}, WhatsApp or your work email (often @${domain}) is enough for a one-page next-step note — sharing it here consents to follow-up under our Privacy Notice.`;
    }
    if (company) {
      return `If this visit is from ${company}, reply with WhatsApp or work email for a one-page next-step note (consent under our Privacy Notice).`;
    }
    return 'I can send a one-page next-step note. WhatsApp is usually fastest in India — reply with your WhatsApp number or work email (sharing it here consents to follow-up under our Privacy Notice).';
  })();
  const EMAIL_ASK = 'Want a concise 1-page architecture or governance view? Reply with your name and WhatsApp or work email (consent under our Privacy Notice), or book 30 mins at https://cal.com/digiscience/30-min-free-cloud-assessment';
  const EMAIL_REMIND = 'If useful, drop your WhatsApp or work email here and DigiScience will send a short next-step note — or book directly on Cal.com.';
  const extractChatEmail = (value) => {
    const match = String(value || '').match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    return match ? match[0].replace(/[.,;:!?)]+$/, '').trim() : '';
  };
  const extractChatPhone = (value) => {
    const m = String(value || '').match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{5,10}/);
    const digits = m ? m[0].replace(/\D/g, '') : '';
    return digits.length >= 10 && digits.length <= 15 ? m[0].trim() : '';
  };
  const extractChatName = (value) => {
    const raw = String(value || '').trim();
    if (!raw || extractChatEmail(raw) || extractChatPhone(raw)) return '';
    if (/^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|sure)\b/i.test(raw)) return '';
    const m = raw.match(/^(?:i(?:'m| am)|my name is|this is)\s+([A-Za-z][A-Za-z .'-]{1,60})$/i)
      || raw.match(/^([A-Za-z][A-Za-z .'-]{1,40})$/);
    if (!m) return '';
    const name = m[1].trim().replace(/\s+/g, ' ');
    if (name.split(' ').length > 4 || name.length < 2) return '';
    return name.slice(0, 80);
  };
  let emailAsked = false;
  let emailCaptured = false;
  let emailReminded = false;
  let nameAsked = false;
  let contactAsked = false;
  let profile = { name: '', email: '', phone: '' };
  try {
    emailCaptured = Boolean(window.localStorage.getItem(EMAIL_STORAGE_KEY) || window.localStorage.getItem(EMAIL_DONE_KEY) === '1');
    emailAsked = emailCaptured;
    emailReminded = emailCaptured;
    profile = { ...profile, ...JSON.parse(window.localStorage.getItem(PROFILE_KEY) || '{}') };
    if (profile.name) nameAsked = true;
    if (profile.email || profile.phone) { emailCaptured = true; contactAsked = true; }
  } catch { /* private browsing */ }

  const persistChatProfile = async (rawQuestion, { name = '', email = '', phone = '' } = {}) => {
    profile = {
      name: name || profile.name || '',
      email: email || profile.email || '',
      phone: phone || profile.phone || ''
    };
    stitchVisitorIdentity({ name: profile.name, email: profile.email, phone: profile.phone });
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      if (profile.email || profile.phone) {
        window.localStorage.setItem(EMAIL_STORAGE_KEY, profile.email || profile.phone);
        window.localStorage.setItem(EMAIL_DONE_KEY, '1');
      }
      sessionStorage.setItem('ds_chat_turns', String(userTurns));
    } catch { /* ignore */ }
    if (typeof window.dsIdentifyBeacon === 'function') {
      window.dsIdentifyBeacon({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        contact_source: 'progressive_chat',
        chatTurns: userTurns
      });
    }
    if (!(profile.email || profile.phone)) return true;
    emailCaptured = true;
    const localHandle = profile.name || (profile.email ? profile.email.split('@')[0] : '') || 'Website visitor';
    const leadEndpointUrl = appConfig.leadEndpointUrl || '/api/lead';
    const payload = {
      formType: 'assistant_email',
      sourcePage: window.location.pathname,
      fullName: localHandle.slice(0, 80),
      businessEmail: profile.email,
      phone: profile.phone,
      visitorId: dsVisitorId,
      name: localHandle.slice(0, 80),
      email: profile.email,
      aiInterestArea: 'Website AI assistant',
      service: 'Website AI assistant',
      businessProblem: `Chat progressive profile: ${rawQuestion.slice(0, 300)}`,
      message: `Chat progressive profile on ${window.location.pathname}`,
      consent: true,
      landingPage: visitorAttribution.landingPage,
      referrer: visitorAttribution.referrer,
      utmSource: visitorAttribution.utmSource,
      utmMedium: visitorAttribution.utmMedium,
      utmCampaign: visitorAttribution.utmCampaign,
      utmTerm: visitorAttribution.utmTerm,
      utmContent: visitorAttribution.utmContent,
      gclid: visitorAttribution.gclid,
      msclkid: visitorAttribution.msclkid,
      liFatId: visitorAttribution.liFatId,
      clientProof: { interacted: true, dwellMs: Math.max(2500, Date.now() - pageLoadedAt) },
      transcript: transcript.slice(-6).join(' | ') || `Visitor shared contact in chat`,
      submittedAt: new Date().toISOString()
    };
    trackEvent('lead_submit_attempt', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
    try {
      const response = await fetch(leadEndpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok && result.delivery?.accepted === true) {
        trackEvent('lead_submit_success', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
        trackEvent('generate_lead', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
        return true;
      }
      trackEvent('lead_submit_error', { form_name: 'assistant_email_capture', failure_stage: 'request', http_status: response.status });
    } catch {
      trackEvent('lead_submit_error', { form_name: 'assistant_email_capture', failure_stage: 'network' });
    }
    return false;
  };

  const answerQuestion = async (question) => {
    userTurns += 1;
    try { sessionStorage.setItem('ds_chat_turns', String(userTurns)); } catch { /* ignore */ }
    transcript.push(`Visitor: ${question}`);
    addMessage(question, 'user');

    const detectedEmail = extractChatEmail(question);
    const detectedPhone = extractChatPhone(question);
    const detectedName = extractChatName(question);
    if (detectedName && !profile.name) {
      await persistChatProfile(question, { name: detectedName });
      nameAsked = true;
      if (!(detectedEmail || detectedPhone) && !emailCaptured) {
        contactAsked = true;
        emailAsked = true;
        const ask = `Thanks, ${detectedName}. ${CONTACT_ASK}`;
        transcript.push(`Assistant: ${ask}`);
        addMessage(ask, 'bot');
        return;
      }
    }
    if ((detectedEmail || detectedPhone) && !emailCaptured) {
      emailAsked = true;
      contactAsked = true;
      const savedOk = await persistChatProfile(question, {
        name: detectedName || profile.name,
        email: detectedEmail,
        phone: detectedPhone
      });
      const confirmMsg = savedOk
        ? 'Thanks — your contact details are recorded and DigiScience will follow up within one business day. You can also pick a 30-minute time at cal.com/digiscience/30-min-free-cloud-assessment.'
        : 'Thanks — please also confirm via the short enquiry form below or email subscription@digisciencetechsol.com so nothing is missed.';
      transcript.push(`Assistant: ${confirmMsg}`);
      addMessage(confirmMsg, 'bot');
      if (!savedOk) addLeadForm();
      const remainder = question.replace(detectedEmail || '', '').replace(detectedPhone || '', '').trim();
      if (remainder.length < 6) return;
    }

    if (/contact|call|email|talk|demo|meeting|lead|consult/.test(question.toLowerCase()) && !detectedEmail && !detectedPhone) {
      const reply = localAnswer(question);
      transcript.push(`Assistant: ${reply}`);
      addMessage(reply, 'bot', true);
      if (!profile.name && !nameAsked) {
        nameAsked = true;
        addMessage(NAME_ASK, 'bot');
      } else if (!emailCaptured) {
        addLeadForm();
      }
      return;
    }

    const appendEmailPrompt = (baseText) => {
      if (!nameAsked && !profile.name && !emailCaptured && userTurns === 1) {
        nameAsked = true;
        emailAsked = true;
        trackEvent('form_start', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
        return `${baseText}\n\n${NAME_ASK}`;
      }
      if (profile.name && !emailCaptured && !contactAsked && userTurns >= 2) {
        contactAsked = true;
        emailAsked = true;
        return `${baseText}\n\n${CONTACT_ASK}`;
      }
      if (!emailAsked && !emailCaptured && userTurns === 1) {
        emailAsked = true;
        trackEvent('form_start', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
        return `${baseText}\n\n${EMAIL_ASK}`;
      }
      if (emailAsked && !emailCaptured && !emailReminded && userTurns >= 3) {
        emailReminded = true;
        return `${baseText}\n\n${EMAIL_REMIND}`;
      }
      return baseText;
    };

    if (appConfig.assistantEndpointUrl) {
      try {
        const thinking = addMessage('Thinking through the DigiScience knowledge base...');
        const response = await fetch(appConfig.assistantEndpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            page: window.location.pathname,
            transcript: transcript.slice(-8),
            source: 'website-assistant'
          })
        });
        thinking.remove();
        if (response.ok) {
          const data = await response.json();
          const answer = appendEmailPrompt(data.answer || localAnswer(question));
          transcript.push(`Assistant: ${answer}`);
          addMessage(answer);
          if (data.captureLead && !emailCaptured) addLeadForm();
          return;
        }
      } catch (error) {
        console.warn('Assistant endpoint unavailable, using website knowledge base.', error);
      }
    }

    const answer = localAnswer(question);
    transcript.push(`Assistant: ${answer.replace(/<[^>]+>/g, '')}`);
    addMessage(answer, 'bot', true);
    if (!emailAsked && !emailCaptured && userTurns === 1) {
      emailAsked = true;
      trackEvent('form_start', { form_name: 'assistant_email_capture', service: 'Website AI assistant' });
      addMessage(EMAIL_ASK, 'bot');
    } else if (emailAsked && !emailCaptured && !emailReminded && userTurns >= 3) {
      emailReminded = true;
      addMessage(EMAIL_REMIND, 'bot');
    }
  };

  quickPrompts.forEach(([label, prompt]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => answerQuestion(prompt));
    quickActions.appendChild(button);
  });

  inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;
    questionInput.value = '';
    answerQuestion(question);
  });

  const setOpen = (open, source = 'launcher') => {
    panel.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      trackEvent('chat_open', { source, page_path: window.location.pathname });
      window.setTimeout(() => questionInput.focus(), 120);
    }
  };

  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open'), 'launcher'));
  closeButton.addEventListener('click', () => setOpen(false, 'close'));

  // Behavioral progressive capture: open chat after dwell or deep scroll (once/session).
  const CHAT_BEHAVIOR_KEY = 'dsChatBehaviorOpened';
  const chatBehaviorDone = () => {
    try { return sessionStorage.getItem(CHAT_BEHAVIOR_KEY) === '1'; } catch { return false; }
  };
  const markChatBehavior = () => {
    try { sessionStorage.setItem(CHAT_BEHAVIOR_KEY, '1'); } catch { /* ignore */ }
  };
  const tryBehaviorOpen = (reason) => {
    if (chatBehaviorDone() || panel.classList.contains('open')) return;
    if (document.querySelector('.ds-email-capture.is-open')) return;
    try {
      if (window.localStorage.getItem('dsEmailCaptureDone') === '1') return;
      if (window.localStorage.getItem(EMAIL_STORAGE_KEY)) return;
    } catch { /* ignore */ }
    markChatBehavior();
    setOpen(true, reason);
    if (!emailCaptured && !nameAsked) {
      nameAsked = true;
      emailAsked = true;
      addMessage(NAME_ASK, 'bot');
    }
  };
  window.setTimeout(() => tryBehaviorOpen('dwell_40s'), 40000);
  window.addEventListener('scroll', () => {
    if (chatBehaviorDone()) return;
    const doc = document.documentElement;
    const ratio = (window.scrollY || doc.scrollTop || 0) / Math.max(doc.scrollHeight - window.innerHeight, 1);
    if (ratio >= 0.5) tryBehaviorOpen('scroll_50');
  }, { passive: true });
  document.addEventListener('mouseout', (ev) => {
    if (chatBehaviorDone()) return;
    if (Date.now() - pageLoadedAt < 35000) return;
    if (ev.clientY > 12 || ev.relatedTarget) return;
    tryBehaviorOpen('exit_intent_chat');
  });

  addMessage('Hello. I can help with the DigiScience Solution Assessment, services, pricing guidance, AI readiness, governance, industry use cases, and the 45-day pilot. WhatsApp or work email works best if you want a follow-up note.', 'bot');
};

if (window.matchMedia('(max-width: 820px)').matches) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initLeadAssistant(), { timeout: 2400 });
  } else {
    window.setTimeout(initLeadAssistant, 1200);
  }
} else {
  initLeadAssistant();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
) : null;

document.querySelectorAll('.reveal').forEach((element) => observer?.observe(element));

document.querySelectorAll('.faq-item').forEach((item) => {
  const button = item.querySelector('.faq-question');
  const indicator = button ? button.querySelector('span') : null;
  if (!button) return;

  const syncFaqState = () => {
    const open = item.classList.contains('open');
    button.setAttribute('aria-expanded', String(open));
    if (indicator) indicator.textContent = open ? '−' : '+';
  };

  syncFaqState();

  button.addEventListener('click', () => {
    item.classList.toggle('open');
    syncFaqState();
  });
});

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const service = link.getAttribute('data-service');
    if (serviceSelect && service) {
      serviceSelect.value = service;
    }
  });
});

if (contactForm && formNote) {
  const formType = window.location.pathname.includes('ai-readiness-intake') ? 'ai_readiness_intake' : 'contact';
  const formName = formType === 'ai_readiness_intake' ? 'ai_readiness_intake_form' : 'contact_form';
  let formStarted = false;
  let submissionInFlight = false;
  contactForm.addEventListener('invalid', () => trackEvent('form_validation_error', {form_name: formName, failure_reason: 'native_validation'}), true);

  contactForm.addEventListener('focusin', () => {
    if (formStarted) return;
    formStarted = true;
    trackEvent('form_start', {
      form_name: formName,
      service: serviceSelect ? serviceSelect.value : ''
    });
  });

  const showFormNote = (message, kind = 'info') => {
    formNote.textContent = message;
    formNote.classList.remove('is-success', 'is-info');
    formNote.classList.add(kind === 'success' ? 'is-success' : 'is-info', 'show');
  };

  const setSubmitting = (submitting) => {
    if (!submitButton) return;
    submitButton.disabled = submitting;
    submitButton.textContent = submitting ? 'Submitting...' : (submitButton.dataset.defaultText || 'Submit Enquiry');
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submissionInFlight) return;

    if (!contactForm.reportValidity()) {
      trackEvent('form_validation_error', { form_name: formName, failure_reason: 'required_fields' });
      showFormNote('Please complete the required fields and then submit your enquiry again.');
      return;
    }

    const getField = (name) => contactForm.elements[name] ? String(contactForm.elements[name].value || '').trim() : '';
    if (submitButton && !submitButton.dataset.defaultText) {
      submitButton.dataset.defaultText = submitButton.textContent;
    }

    const composedMessage = [
      getField('message'),
      getField('businessProblem') ? `Business problem: ${getField('businessProblem')}` : '',
      getField('desiredOutcome') ? `Desired outcome: ${getField('desiredOutcome')}` : '',
      getField('businessContext') ? `Business context: ${getField('businessContext')}` : '',
      getField('workflowPain') ? `Workflow pain: ${getField('workflowPain')}` : '',
      getField('useCaseCandidate') ? `AI use case candidate: ${getField('useCaseCandidate')}` : '',
      getField('dataAvailability') ? `Data availability: ${getField('dataAvailability')}` : '',
      getField('successMetrics') ? `Success metrics: ${getField('successMetrics')}` : ''
    ].filter(Boolean).join('\n\n');

    const payload = {
      sourcePage: window.location.pathname,
      serviceId: Object.hasOwn(serviceOptions, serviceQuery) ? serviceQuery : '',
      formType,
      fullName: getField('name'),
      businessEmail: getField('email'),
      phone: getField('phone'),
      company: getField('company'),
      websiteOrLinkedIn: getField('profileUrl'),
      role: getField('role') || getField('industryRole'),
      industry: getField('industry'),
      cloudPlatform: getField('cloud'),
      aiInterestArea: getField('service') || (formType === 'ai_readiness_intake' ? 'AI Readiness Intake' : ''),
      businessProblem: getField('businessProblem') || composedMessage,
      desiredOutcome: getField('desiredOutcome'),
      timeline: getField('timeline'),
      budgetRange: getField('budget'),
      consent: Boolean(contactForm.elements.consent && contactForm.elements.consent.checked),
      businessContext: getField('businessContext'),
      workflowPain: getField('workflowPain'),
      useCaseCandidate: getField('useCaseCandidate'),
      dataAvailability: getField('dataAvailability'),
      currentSystems: getField('currentSystems'),
      governanceRequirements: getField('governanceRequirements'),
      complianceConstraints: getField('complianceConstraints'),
      successMetrics: getField('successMetrics'),
      stakeholders: getField('stakeholders'),
      website: getField('website'),
      'cf-turnstile-response': getField('cf-turnstile-response'),
      name: getField('name'),
      email: getField('email'),
      service: getField('service') || (formType === 'ai_readiness_intake' ? 'AI Readiness Intake' : ''),
      message: composedMessage,
      page: window.location.pathname,
      landingPage: visitorAttribution.landingPage,
      referrer: visitorAttribution.referrer,
      utmSource: visitorAttribution.utmSource,
      utmMedium: visitorAttribution.utmMedium,
      utmCampaign: visitorAttribution.utmCampaign,
      utmTerm: visitorAttribution.utmTerm,
      utmContent: visitorAttribution.utmContent,
      gclid: visitorAttribution.gclid,
      msclkid: visitorAttribution.msclkid,
      liFatId: visitorAttribution.liFatId,
      clientProof: getClientProof(),
      submittedAt: new Date().toISOString()
    };

    if (!payload.fullName || !payload.businessEmail || !payload.businessProblem) {
      trackEvent('form_validation_error', { form_name: formName, failure_reason: 'missing_identity_or_problem' });
      showFormNote('Please complete your name, email, and requirement before submitting.');
      return;
    }

    if (!isValidEmail(payload.businessEmail)) {
      trackEvent('form_validation_error', { form_name: formName, failure_reason: 'invalid_email' });
      showFormNote('Please enter a valid email address and submit your enquiry again.');
      contactForm.elements.email.focus();
      return;
    }

    if (!payload.consent) {
      trackEvent('form_validation_error', { form_name: formName, failure_reason: 'missing_consent' });
      showFormNote('Please confirm consent before submitting your enquiry.');
      return;
    }

    const leadEndpointUrl = appConfig.leadEndpointUrl || '/api/lead';

    // Resilient fallback: preserve buyer text and offer immediate direct email or calendar booking if API is unreachable.
    const showFallback = (detail = 'The enquiry service is temporarily unavailable.') => {
      if (!formNote) return;
      const subject = encodeURIComponent(`DigiScience Enquiry: ${payload.aiInterestArea || 'Solution Assessment'}`);
      const body = encodeURIComponent(`Name: ${payload.fullName}\nCompany: ${payload.company || ''}\n\nRequirement:\n${payload.businessProblem}`);
      formNote.textContent = `${detail} Your details remain in this form. You can retry now, `;
      const mailLink = document.createElement('a');
      mailLink.href = `mailto:subscription@digisciencetechsol.com?subject=${subject}&body=${body}`;
      mailLink.dataset.fallbackContact = 'email';
      mailLink.textContent = 'email subscription@digisciencetechsol.com directly';
      const sep = document.createTextNode(', or ');
      const calLink = document.createElement('a');
      calLink.href = 'https://cal.com/digiscience/30-min-free-cloud-assessment';
      calLink.target = '_blank';
      calLink.rel = 'noopener';
      calLink.dataset.fallbackContact = 'calendar';
      calLink.textContent = 'book a 30-min call';
      formNote.append(mailLink, sep, calLink, document.createTextNode('.'));
      formNote.classList.remove('is-success', 'is-info');
      formNote.classList.add('is-info', 'show');
    };

    try {
      submissionInFlight = true;
      setSubmitting(true);
      showFormNote('Submitting your enquiry securely. Please wait...');
      trackEvent('lead_submit_attempt', {
        form_name: formName,
        service: payload.aiInterestArea || 'Website enquiry'
      });

      const response = await fetch(leadEndpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || result.delivery?.accepted !== true) {
        trackEvent('lead_submit_error', {
          form_name: formName,
          failure_stage: 'request',
          http_status: response.status
        });
        showFallback(result.error || 'The enquiry service could not accept this submission.');
        return;
      }

      trackEvent('lead_submit_success', {
        form_name: formName,
        service: payload.aiInterestArea || 'Website enquiry'
      });
      trackEvent('generate_lead', {
        form_name: formName,
        service: payload.aiInterestArea || 'Website enquiry'
      });

      contactForm.reset();
      showFormNote('Your enquiry has been submitted successfully. Redirecting...', 'success');
      const redirectType = formType === 'ai_readiness_intake' ? 'intake' : 'contact';
      window.setTimeout(() => {
        window.location.href = `/thank-you?type=${redirectType}`;
      }, 700);
    } catch (error) {
      console.error(error);
      trackEvent('lead_submit_error', { form_name: formName, failure_stage: 'network' });
      showFallback('We could not submit your enquiry right now.');
    } finally {
      submissionInFlight = false;
      setSubmitting(false);
      if (window.turnstile && typeof window.turnstile.reset === 'function') { try { window.turnstile.reset(); } catch (error) { /* widget not on this page */ } }
    }
  });
}

// One-line "tell us what you need" box: a lighter way to raise a hand than the full enquiry form.
document.querySelectorAll('[data-quick-form]').forEach((quickForm) => {
  const note = quickForm.querySelector('.form-note');
  const button = quickForm.querySelector('button[type="submit"]');
  const say = (message, kind = 'info') => {
    note.textContent = message;
    note.classList.remove('is-success', 'is-info');
    note.classList.add(kind === 'success' ? 'is-success' : 'is-info', 'show');
  };
  quickForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const field = (name) => quickForm.elements[name] ? String(quickForm.elements[name].value || '').trim() : '';
    const need = field('need');
    const email = field('email');
    if (!need || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      say('Please add what you need and a valid email so we can reply.');
      return;
    }
    if (!(quickForm.elements.consent && quickForm.elements.consent.checked)) {
      say('Please tick the box so we may reply to you.');
      return;
    }
    const payload = {
      formType: 'quick_need',
      sourcePage: window.location.pathname,
      fullName: field('name') || 'Website visitor',
      businessEmail: email,
      phone: field('phone'),
      visitorId: dsVisitorId,
      aiInterestArea: 'One-line question',
      businessProblem: need,
      consent: true,
      website: field('website'),
      'cf-turnstile-response': field('cf-turnstile-response'),
      landingPage: visitorAttribution.landingPage,
      referrer: visitorAttribution.referrer,
      utmSource: visitorAttribution.utmSource,
      utmMedium: visitorAttribution.utmMedium,
      utmCampaign: visitorAttribution.utmCampaign,
      utmTerm: visitorAttribution.utmTerm,
      utmContent: visitorAttribution.utmContent,
      gclid: visitorAttribution.gclid,
      msclkid: visitorAttribution.msclkid,
      liFatId: visitorAttribution.liFatId,
      clientProof: getClientProof(),
      submittedAt: new Date().toISOString()
    };
    try {
      button.disabled = true;
      say('Sending...');
      trackEvent('lead_submit_attempt', { form_name: 'quick_need', service: 'One-line question' });
      const response = await fetch(appConfig.leadEndpointUrl || '/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || result.delivery?.accepted !== true) {
        trackEvent('lead_submit_error', { form_name: 'quick_need', failure_stage: 'request', http_status: response.status });
        note.textContent = `${result.error || 'We could not send this right now.'} Your text is still here; retry or `;
        const fallbackMail = document.createElement('a');
        fallbackMail.href = `mailto:subscription@digisciencetechsol.com?subject=${encodeURIComponent('DigiScience Question')}&body=${encodeURIComponent(need)}`;
        fallbackMail.dataset.fallbackContact = 'email';
        fallbackMail.textContent = 'email subscription@digisciencetechsol.com';
        note.append(fallbackMail, document.createTextNode('.'));
        note.classList.remove('is-success', 'is-info');
        note.classList.add('is-info', 'show');
        if (window.turnstile && typeof window.turnstile.reset === 'function') { try { window.turnstile.reset(); } catch (error) { /* no widget */ } }
        return;
      }
      trackEvent('lead_submit_success', { form_name: 'quick_need', service: 'One-line question' });
      stitchVisitorIdentity({ name: field('name'), email, phone: field('phone') });
      trackEvent('generate_lead', { form_name: 'quick_need', service: 'One-line question' });
      quickForm.reset();
      say('Thank you. We have your message and will reply by email.', 'success');
    } catch (error) {
      console.error(error);
      trackEvent('lead_submit_error', { form_name: 'quick_need', failure_stage: 'network' });
      say('We could not send this right now. Your text is still here; please try again.');
    } finally {
      button.disabled = false;
    }
  });
});

document.querySelectorAll('a[href^="mailto:"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_mailto', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href^="tel:"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_phone', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('[data-track]').forEach((element) => {
  element.addEventListener('click', () => trackEvent(element.getAttribute('data-track'), {
    event_label: element.textContent.trim() || element.getAttribute('href') || 'tracked click'
  }));
});

document.querySelectorAll('a[href*="ai-readiness"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_ai_readiness', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="solution-assessment"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_solution_assessment', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="45-day-ai-pilot"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_45_day_pilot', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="proof-assets"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_proof_asset', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="pricing"]:not([data-track]), [data-pricing-package]:not([data-track])').forEach((element) => {
  element.addEventListener('click', () => trackEvent('click_pricing_package', {
    event_label: element.textContent.trim() || element.getAttribute('href') || 'pricing'
  }));
});

document.querySelectorAll('a[href*="wa.me"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => (window._paq && window._paq.push(['trackEvent', 'Contact', 'WhatsAppClick', window.location.pathname]), trackEvent('click_whatsapp', { event_label: link.getAttribute('href') })));
});

document.querySelectorAll('a[href^="/contact"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_contact', {
    event_label: link.textContent.trim() || link.getAttribute('href') || 'contact'
  }));
});

document.querySelectorAll('a[href*="cal.com/digiscience"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_book_call', { event_label: link.getAttribute('href') }));
});


// --- GA4 Scroll-Depth (25/50/75/100%) & Dwell-Time (30/60/120/180s) Engagement Telemetry ---
const initEngagementTracking = () => {
  const marks = { 25: false, 50: false, 75: false, 100: false };
  let dwellSeconds = 0;
  const scrollRatio = () => {
    const doc = document.documentElement;
    const top = window.scrollY || doc.scrollTop || 0;
    const height = Math.max(doc.scrollHeight - window.innerHeight, 1);
    return top / height;
  };
  const onScroll = () => {
    const ratio = scrollRatio();
    [25, 50, 75, 100].forEach((mark) => {
      if (!marks[mark] && ratio * 100 >= mark) {
        marks[mark] = true;
        trackEvent('scroll_depth', { percent_scrolled: mark, page_path: window.location.pathname });
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const dwellTimer = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    dwellSeconds += 15;
    if (dwellSeconds === 30 || dwellSeconds === 60 || dwellSeconds === 120 || dwellSeconds % 180 === 0) {
      trackEvent('dwell_tick', { engagement_seconds: dwellSeconds, page_path: window.location.pathname });
    }
  }, 15000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dwellSeconds > 0) {
      trackEvent('dwell_tick', { engagement_seconds: dwellSeconds, trigger: 'visibility_hide', page_path: window.location.pathname });
    }
  });
  window.addEventListener('beforeunload', () => window.clearInterval(dwellTimer));
};
initEngagementTracking();

// --- Geo-Aware INR / USD Pricing Display & Interactive Currency Toggle ---
const initGeoCurrency = () => {
  const COOKIE_NAME = 'ds_currency';
  const readQueryCurrency = () => {
    try {
      const p = new URLSearchParams(window.location.search);
      const cur = (p.get('currency') || '').toUpperCase();
      if (cur === 'INR' || cur === 'USD') return cur;
      const geo = (p.get('geo') || '').toUpperCase();
      if (geo === 'IN') return 'INR';
      if (geo && geo.length === 2) return 'USD';
    } catch { /* ignore */ }
    return '';
  };
  const readCookieCurrency = () => {
    const m = document.cookie.match(/(?:^|;\s*)ds_currency=(INR|USD)/);
    return m ? m[1] : '';
  };
  const writeCookieCurrency = (cur) => {
    document.cookie = `${COOKIE_NAME}=${cur}; Path=/; Max-Age=86400; SameSite=Lax`;
  };
  const detectInitialCurrency = () => {
    const q = readQueryCurrency();
    if (q) { writeCookieCurrency(q); return q; }
    const c = readCookieCurrency();
    if (c) return c;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const langs = (navigator.languages || [navigator.language || '']).join(',');
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' || /-IN\b/i.test(langs)) return 'INR';
    } catch { /* ignore */ }
    return 'USD';
  };

  let activeCurrency = detectInitialCurrency();
  const applyCurrency = (cur) => {
    activeCurrency = cur;
    writeCookieCurrency(cur);
    document.documentElement.setAttribute('data-ds-currency', cur);
    document.querySelectorAll('[data-ds-inr][data-ds-usd]').forEach((el) => {
      el.textContent = cur === 'INR' ? el.getAttribute('data-ds-inr') : el.getAttribute('data-ds-usd');
    });
    document.querySelectorAll('[data-ds-currency-btn]').forEach((btn) => {
      const isSelected = btn.getAttribute('data-ds-currency-btn') === cur;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  };

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (['/pricing', '/solution-assessment', '/45-day-ai-pilot'].includes(path)) {
    const targetHero = document.querySelector('.pricing-hero .container, .page-hero .container');
    if (targetHero && !targetHero.querySelector('.ds-currency-bar')) {
      const bar = document.createElement('div');
      bar.className = 'ds-currency-bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Display fee band currency');
      bar.innerHTML = `
        <span class="ds-currency-note">7-Day Solution Assessment Founding Offer: <strong data-ds-inr="INR 29,000 (Standard INR 49,000)" data-ds-usd="USD 349 (Standard USD 599)"></strong></span>
        <span class="ds-currency-toggle">
          <button type="button" data-ds-currency-btn="INR">INR ₹</button>
          <button type="button" data-ds-currency-btn="USD">USD $</button>
        </span>
      `;
      bar.querySelectorAll('[data-ds-currency-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.getAttribute('data-ds-currency-btn');
          applyCurrency(next);
          trackEvent('currency_toggle', { currency: next, page_path: path });
        });
      });
      targetHero.appendChild(bar);
    }
  }
  applyCurrency(activeCurrency);
};
initGeoCurrency();

// --- WhatsApp click-to-chat attribution (visitorId + page + UTMs in prefilled text) ---
const buildDsWhatsAppHref = (intent = 'Hi DigiScience, I want a next-step note') => {
  const parts = [String(intent || '').trim() || 'Hi DigiScience, I want a next-step note'];
  parts.push(`vid:${String(dsVisitorId || '').slice(0, 16)}`);
  parts.push(`p:${(window.location.pathname || '/').slice(0, 80)}`);
  if (visitorAttribution.utmSource) parts.push(`src:${String(visitorAttribution.utmSource).slice(0, 40)}`);
  if (visitorAttribution.utmCampaign) parts.push(`cmp:${String(visitorAttribution.utmCampaign).slice(0, 40)}`);
  if (visitorAttribution.gclid) parts.push('gclid:1');
  return `https://wa.me/918448160510?text=${encodeURIComponent(parts.join(' | '))}`;
};
const decorateDsWhatsAppLinks = () => {
  document.querySelectorAll('a[href*="wa.me/918448160510"]').forEach((link) => {
    if (link.dataset.dsWaDecorated === '1') return;
    const current = link.getAttribute('href') || '';
    let intent = 'Hi DigiScience, I want a next-step note';
    try {
      const u = new URL(current, window.location.origin);
      const existing = u.searchParams.get('text');
      if (existing) intent = existing.split(' | vid:')[0].split(' | p:')[0].trim() || intent;
    } catch { /* ignore */ }
    link.setAttribute('href', buildDsWhatsAppHref(intent));
    link.dataset.dsWaDecorated = '1';
  });
};
decorateDsWhatsAppLinks();
document.addEventListener('click', (ev) => {
  const link = ev.target && ev.target.closest && ev.target.closest('a[href*="wa.me/918448160510"]');
  if (!link) return;
  const intent = (() => {
    try {
      const u = new URL(link.getAttribute('href') || '', window.location.origin);
      const t = u.searchParams.get('text') || '';
      return t.split(' | vid:')[0].split(' | p:')[0].trim() || 'Hi DigiScience, I want a next-step note';
    } catch {
      return 'Hi DigiScience, I want a next-step note';
    }
  })();
  link.setAttribute('href', buildDsWhatsAppHref(intent));
  if (typeof window.dsIdentifyBeacon === 'function') {
    window.dsIdentifyBeacon({ contact_source: 'whatsapp_click', chatTurns: 0 });
  }
  trackEvent('click_whatsapp', { source: 'attributed_wa', page_path: window.location.pathname });
}, true);

// --- Sticky Scroll Quick-Action Bar on Content & Offer Pages ---
const initStickyConversionBar = () => {
  const p = window.location.pathname.replace(/\/+$/, '') || '/';
  if (['/contact', '/ai-readiness-intake', '/thank-you', '/success', '/privacy', '/terms', '/lead-dashboard'].includes(p)) return;
  if (document.querySelector('.ds-sticky-cta')) return;

  const bar = document.createElement('aside');
  bar.className = 'ds-sticky-cta';
  bar.setAttribute('aria-label', 'Quick booking and WhatsApp contact');
  bar.hidden = true;
  bar.innerHTML = `
    <span class="ds-sticky-label">Discuss one AI or cloud problem:</span>
    <a class="ds-sticky-btn ds-sticky-primary" href="https://cal.com/digiscience/30-min-free-cloud-assessment">Book 30-min free call</a>
    <a class="ds-sticky-btn ds-sticky-secondary" href="https://wa.me/918448160510">WhatsApp</a>
  `;
  document.body.appendChild(bar);

  bar.querySelector('a[href*="cal.com"]').addEventListener('click', () => {
    trackEvent('click_book_call', { event_label: 'sticky_bar_calcom' });
    trackEvent('click_booking', { event_label: 'sticky_bar_calcom' });
  });
  bar.querySelector('a[href*="wa.me"]').addEventListener('click', () => {
    trackEvent('click_whatsapp', { event_label: 'sticky_bar_whatsapp' });
  });

  const toggleSticky = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const ratio = (window.scrollY || doc.scrollTop || 0) / maxScroll;
    const shouldShow = ratio >= 0.35 && maxScroll > 320;
    bar.hidden = !shouldShow;
    bar.classList.toggle('is-visible', shouldShow);
  };
  window.addEventListener('scroll', toggleSticky, { passive: true });
  toggleSticky();
};
initStickyConversionBar();

// --- Sitewide Exit-Intent (45s + top mouseout), 60% Scroll, or 50s Timed Email Capture Modal ---
const initExitIntentCapture = () => {
  if (window.__DS_EMAIL_CAPTURE__) return;
  window.__DS_EMAIL_CAPTURE__ = true;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (['/contact', '/ai-readiness-intake', '/thank-you', '/success', '/privacy', '/terms', '/lead-dashboard'].includes(path)) return;

  const STORAGE_DONE = 'dsEmailCaptureDone';
  const STORAGE_DISMISS_UNTIL = 'dsEmailCaptureDismissUntil';
  const SESSION_DISMISS = 'dsEmailCaptureSessionDismissed';
  const SCROLL_TRIGGER_RATIO = 0.6;
  const TIME_ON_PAGE_MS = 50000;
  const EXIT_MIN_MS = 45000;
  const DISMISS_DAYS = 7;

  const isSuppressed = () => {
    try {
      if (window.localStorage.getItem(STORAGE_DONE) === '1') return true;
      const until = Number(window.localStorage.getItem(STORAGE_DISMISS_UNTIL) || '0');
      if (until && Date.now() < until) return true;
      if (window.sessionStorage.getItem(SESSION_DISMISS) === '1') return true;
    } catch { /* ignore */ }
    return false;
  };
  if (isSuppressed()) return;

  let isOpen = false;
  let shownOnce = false;
  let triggerReason = 'time';
  let timeTimer = null;

  const modal = document.createElement('div');
  modal.className = 'ds-email-capture';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="ds-email-capture-backdrop" data-ds-capture-dismiss tabindex="-1" aria-hidden="true"></div>
    <div class="ds-email-capture-panel" role="dialog" aria-modal="true" aria-labelledby="ds-capture-title">
      <button type="button" class="ds-email-capture-close" data-ds-capture-dismiss aria-label="Close">×</button>
      <p class="eyebrow">Practical Enterprise AI Notes</p>
      <h2 id="ds-capture-title">Get AI Governance &amp; Architecture Checklists</h2>
      <p class="ds-email-capture-lead">Fastest in India: WhatsApp us first. Or leave WhatsApp / work email for practical notes on RAG permission boundaries, 45-day AI pilot criteria, and cloud cost controls. Opt-in only.</p>
      <form class="ds-email-capture-form" novalidate>
        <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true" class="hidden-field" />
        <div class="ds-email-capture-grid">
          <input name="name" type="text" maxlength="80" autocomplete="given-name" placeholder="First name (optional)" aria-label="First name (optional)" />
          <input name="phone" type="tel" maxlength="32" autocomplete="tel" inputmode="tel" placeholder="WhatsApp number (preferred)" aria-label="WhatsApp number (preferred)" />
          <input name="email" type="email" maxlength="180" autocomplete="email" inputmode="email" required placeholder="Work email *" aria-label="Work email" />
        </div>
        <input name="need" type="text" maxlength="240" placeholder="Optional: workflow or question on your mind" aria-label="Optional workflow or question" />
        <label class="checkbox-line compact">
          <input type="checkbox" name="consent" value="yes" required />
          <span>I agree to receive this resource and follow-up under the <a href="/privacy">Privacy notice</a>.</span>
        </label>
        <div class="ds-email-capture-actions">
          <a class="btn btn-primary" href="https://wa.me/918448160510?text=Hi%20DigiScience%2C%20I%20want%20AI%20governance%20%2F%20architecture%20notes" data-ds-wa-primary>Chat on WhatsApp</a>
          <button type="submit" class="btn btn-secondary">Send checklist &amp; notes</button>
          <a class="btn btn-secondary" href="https://cal.com/digiscience/30-min-free-cloud-assessment">Or book 30-min call</a>
        </div>
        <p class="ds-email-capture-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
  if (window.matchMedia('(max-width: 720px)').matches) {
    modal.classList.add('is-mobile-sheet');
  }
  document.body.appendChild(modal);

  const form = modal.querySelector('.ds-email-capture-form');
  const emailInput = form.elements.email;
  const nameInput = form.elements.name;
  const needInput = form.elements.need;
  const statusEl = modal.querySelector('.ds-email-capture-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const waPrimary = modal.querySelector('[data-ds-wa-primary]');
  if (waPrimary) {
    waPrimary.addEventListener('click', () => {
      trackEvent('click_whatsapp', { source: 'email_capture_primary', trigger: triggerReason, page_path: path });
      try { window.localStorage.setItem(STORAGE_DONE, '1'); } catch { /* ignore */ }
    });
  }
  // WhatsApp-first: email required attribute softens when phone is present
  emailInput.removeAttribute('required');

  const showModal = (reason) => {
    // Allow programmatic reopen from value-first tools (worksheet / triage).
    const force = reason === 'cost_worksheet' || reason === 'cloud_waste_triage';
    if (isOpen || isSuppressed()) return;
    if (!force && shownOnce) return;
    if (document.querySelector('.ai-assistant-panel.open')) return;
    triggerReason = reason || 'time';
    isOpen = true;
    shownOnce = true;
    modal.hidden = false;
    modal.classList.add('is-open');
    trackEvent('email_capture_open', { trigger: triggerReason, page_path: path });
    window.setTimeout(() => {
      try { emailInput.focus({ preventScroll: true }); } catch { emailInput.focus(); }
    }, 50);
  };
  window.addEventListener('ds-open-email-capture', (ev) => {
    const reason = (ev && ev.detail && ev.detail.trigger) || 'manual';
    showModal(reason);
  });
  window.dsOpenEmailCapture = showModal;

  const dismissModal = (via = 'button') => {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove('is-open');
    modal.hidden = true;
    try {
      window.sessionStorage.setItem(SESSION_DISMISS, '1');
      window.localStorage.setItem(STORAGE_DISMISS_UNTIL, String(Date.now() + DISMISS_DAYS * 86400000));
    } catch { /* ignore */ }
    trackEvent('email_capture_dismiss', { trigger: triggerReason, via, page_path: path });
  };

  modal.querySelectorAll('[data-ds-capture-dismiss]').forEach((el) => {
    el.addEventListener('click', () => dismissModal('close_click'));
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && isOpen) dismissModal('escape');
  });

  const onScrollCheck = () => {
    if (isOpen || shownOnce || isSuppressed()) return;
    const doc = document.documentElement;
    const ratio = (window.scrollY || doc.scrollTop || 0) / Math.max(doc.scrollHeight - window.innerHeight, 1);
    if (ratio >= SCROLL_TRIGGER_RATIO) showModal('scroll_60');
  };
  window.addEventListener('scroll', onScrollCheck, { passive: true });

  document.addEventListener('mouseout', (ev) => {
    if (isOpen || shownOnce || isSuppressed()) return;
    if (Date.now() - pageLoadedAt < EXIT_MIN_MS) return;
    if (ev.clientY > 12 || ev.relatedTarget) return;
    showModal('exit_intent');
  });

  timeTimer = window.setTimeout(() => {
    timeTimer = null;
    showModal('time_50s');
  }, TIME_ON_PAGE_MS);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = String(emailInput.value || '').trim();
    const phone = String((form.elements.phone && form.elements.phone.value) || '').trim();
    const givenName = String(nameInput.value || '').trim();
    const noteText = String(needInput.value || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 15;
    if (!emailOk && !phoneOk) {
      statusEl.textContent = 'Enter WhatsApp number or work email (WhatsApp preferred).';
      (form.elements.phone || emailInput).focus();
      return;
    }
    if (email && !emailOk) {
      statusEl.textContent = 'Please enter a valid work email, or leave email blank and use WhatsApp.';
      emailInput.focus();
      return;
    }
    if (!form.elements.consent.checked) {
      statusEl.textContent = 'Please tick the privacy consent box.';
      return;
    }
    submitBtn.disabled = true;
    statusEl.textContent = 'Sending...';
    trackEvent('lead_submit_attempt', { form_name: 'exit_email_capture', trigger: triggerReason });

    const handle = givenName || (emailOk ? email.split('@')[0].slice(0, 80) : phone.slice(0, 24)) || 'Website visitor';
    const payload = {
      formType: 'email_capture',
      sourcePage: window.location.pathname,
      fullName: handle,
      businessEmail: emailOk ? email : '',
      phone,
      visitorId: dsVisitorId,
      name: handle,
      email: emailOk ? email : '',
      aiInterestArea: 'Governance & Architecture Notes Opt-In',
      businessProblem: noteText ? `${noteText} (via ${triggerReason} capture on ${path})` : `Email capture opt-in (${triggerReason}) on ${path}`,
      consent: true,
      website: String(form.elements.website.value || '').trim(),
      landingPage: visitorAttribution.landingPage,
      referrer: visitorAttribution.referrer,
      utmSource: visitorAttribution.utmSource,
      utmMedium: visitorAttribution.utmMedium,
      utmCampaign: visitorAttribution.utmCampaign,
      utmTerm: visitorAttribution.utmTerm,
      utmContent: visitorAttribution.utmContent,
      gclid: visitorAttribution.gclid,
      msclkid: visitorAttribution.msclkid,
      liFatId: visitorAttribution.liFatId,
      clientProof: { interacted: true, dwellMs: Math.max(2500, Date.now() - pageLoadedAt) },
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(appConfig.leadEndpointUrl || '/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || result.delivery?.accepted !== true) {
        trackEvent('lead_submit_error', { form_name: 'exit_email_capture', failure_stage: 'request', http_status: response.status });
        statusEl.textContent = result.error || 'Could not confirm right now — please try the 30-min call button.';
        submitBtn.disabled = false;
        return;
      }
      stitchVisitorIdentity({ name: givenName, email, phone });
      try { window.localStorage.setItem(STORAGE_DONE, '1'); } catch { /* ignore */ }
      if (timeTimer) window.clearTimeout(timeTimer);
      trackEvent('lead_submit_success', { form_name: 'exit_email_capture', trigger: triggerReason });
      trackEvent('generate_lead', { form_name: 'exit_email_capture', trigger: triggerReason });
      statusEl.textContent = 'Thanks — you are on the list and we will share the checklist notes shortly.';
      window.setTimeout(() => {
        isOpen = false;
        modal.classList.remove('is-open');
        modal.hidden = true;
      }, 1100);
    } catch {
      trackEvent('lead_submit_error', { form_name: 'exit_email_capture', failure_stage: 'network' });
      statusEl.textContent = 'Connection error — please retry or book a 30-min call directly.';
    } finally {
      submitBtn.disabled = false;
    }
  });
};
initExitIntentCapture();
