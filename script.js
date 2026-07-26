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
    transport_type: 'beacon'
  });
  return true;
};

initializeAnalytics();

const serviceQuery = new URLSearchParams(window.location.search).get('service');
const serviceOptions = {
  'solution-assessment': 'DigiScience Solution Assessment'
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
      <label class="checkbox-line compact"><input type="checkbox" name="consent" required /> <span>I agree to be contacted by DigiScience Techsol.</span></label>
      <button type="submit">Send enquiry</button>
    `;
    wrapper.appendChild(form);
    scrollMessages();
    trackEvent('form_view', { form_name: 'assistant_lead_form' });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        trackEvent('form_validation_error', { form_name: 'assistant_lead_form' });
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
        consent: Boolean(form.consent && form.consent.checked),
        transcript: transcript.join(' | '),
        submittedAt: new Date().toISOString()
      };

      try {
        form.querySelector('button').disabled = true;
        trackEvent('lead_submit_attempt', { form_name: 'assistant_lead_form' });
        const response = await fetch(leadEndpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok || !result.delivery?.accepted) {
          trackEvent('lead_submit_error', {
            form_name: 'assistant_lead_form',
            failure_stage: result.delivery?.accepted === false ? 'delivery' : 'request'
          });
          addMessage('I could not submit this right now. Please use the main contact form or try again shortly.');
          return;
        }
        addMessage(`Thanks. Your enquiry has been recorded securely. Reference: ${result.leadId}. DigiScience will review the requirement and follow up.`);
        form.reset();
        trackEvent('lead_submit_success', { form_name: 'assistant_lead_form', service: 'Website AI assistant' });
        trackEvent('generate_lead', { form_name: 'assistant_lead_form', service: 'Website AI assistant' });
      } catch (error) {
        console.error(error);
        trackEvent('lead_submit_error', { form_name: 'assistant_lead_form', failure_stage: 'network' });
        addMessage('I could not submit this right now. Please use the main contact form or try again shortly.');
      } finally {
        form.querySelector('button').disabled = false;
      }
    });
  };

  const answerQuestion = async (question) => {
    transcript.push(`Visitor: ${question}`);
    addMessage(question, 'user');

    if (/contact|call|email|talk|demo|meeting|lead|consult/.test(question.toLowerCase())) {
      addMessage(localAnswer(question), 'bot', true);
      addLeadForm();
      return;
    }

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
          const answer = data.answer || localAnswer(question);
          transcript.push(`Assistant: ${answer}`);
          addMessage(answer);
          if (data.captureLead) addLeadForm();
          return;
        }
      } catch (error) {
        console.warn('Assistant endpoint unavailable, using website knowledge base.', error);
      }
    }

    const answer = localAnswer(question);
    transcript.push(`Assistant: ${answer.replace(/<[^>]+>/g, '')}`);
    addMessage(answer, 'bot', true);
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

  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) window.setTimeout(() => questionInput.focus(), 120);
  };

  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeButton.addEventListener('click', () => setOpen(false));

  addMessage('Hello. I can help with the DigiScience Solution Assessment, services, pricing guidance, AI readiness, governance, industry use cases, and the 45-day pilot.', 'bot');
};

initLeadAssistant();

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

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

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

  contactForm.addEventListener('focusin', () => {
    if (formStarted) return;
    formStarted = true;
    trackEvent('form_start', {
      form_name: formName,
      service: serviceSelect ? serviceSelect.value : ''
    });
  });

  const showFormNote = (message, kind = 'info') => {
    formNote.innerHTML = message;
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
      name: getField('name'),
      email: getField('email'),
      service: getField('service') || (formType === 'ai_readiness_intake' ? 'AI Readiness Intake' : ''),
      message: composedMessage,
      page: window.location.pathname,
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

    // Privacy-safe fallback: keep personal contact details out of public client code.
    const showFallback = (detail = 'The enquiry service is temporarily unavailable.') => {
      showFormNote(`${detail} No enquiry was sent. Please try again shortly.`);
    };

    try {
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
      if (!response.ok || !result.ok || !result.delivery?.accepted) {
        trackEvent('lead_submit_error', {
          form_name: formName,
          failure_stage: result.delivery?.accepted === false ? 'delivery' : 'request',
          http_status: response.status
        });
        showFallback(result.error || 'The enquiry service could not accept this submission.');
        return;
      }

      const submitEvent = formType === 'ai_readiness_intake' ? 'submit_ai_readiness_intake' : 'submit_contact_form';
      const acceptedChannels = Object.entries(result.delivery.channels || {})
        .filter(([, accepted]) => accepted)
        .map(([channel]) => channel)
        .join(',');
      trackEvent(submitEvent, { form_name: formName, service: payload.aiInterestArea || 'Website enquiry' });
      trackEvent('lead_submit_success', {
        form_name: formName,
        service: payload.aiInterestArea || 'Website enquiry',
        delivery_channels: acceptedChannels
      });
      trackEvent('generate_lead', {
        form_name: formName,
        service: payload.aiInterestArea || 'Website enquiry'
      });

      contactForm.reset();
      showFormNote(`Your enquiry has been securely recorded. Reference: ${result.leadId}. Redirecting...`, 'success');
      const redirectType = formType === 'ai_readiness_intake' ? 'intake' : 'contact';
      window.setTimeout(() => {
        window.location.href = `/thank-you?type=${redirectType}`;
      }, 700);
    } catch (error) {
      console.error(error);
      trackEvent('lead_submit_error', { form_name: formName, failure_stage: 'network' });
      showFallback('We could not submit your enquiry right now.');
    } finally {
      setSubmitting(false);
    }
  });
}

document.querySelectorAll('a[href^="mailto:"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_mailto', { event_label: link.getAttribute('href') }));
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

document.querySelectorAll('a[href^="/contact"]:not([data-track])').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_contact', {
    event_label: link.textContent.trim() || link.getAttribute('href') || 'contact'
  }));
});
