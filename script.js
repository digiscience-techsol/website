const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const serviceSelect = document.getElementById('service');
const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
const appConfig = window.DIGISCIENCE_CONFIG || {};

const trackEvent = (eventName, params = {}) => {
  if (!eventName) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      ...params
    });
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
};

const buildMailtoUrl = (payload) => {
  const subject = encodeURIComponent(`${payload.service || 'Website enquiry'} - ${payload.company || payload.name || 'Prospect'}`);
  const body = encodeURIComponent([
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company}`,
    `Service: ${payload.service}`,
    `Page: ${payload.page}`,
    '',
    payload.message,
    '',
    `Intake details: ${payload.intakeDetails || '{}'}`
  ].join('\n'));
  return `mailto:rajiv.gupta@digisciencetechsol.com?subject=${subject}&body=${body}`;
};

const ensurePremiumVisuals = () => {
  if (!document.querySelector('link[href*="premium.css"]')) {
    const premiumStyles = document.createElement('link');
    premiumStyles.rel = 'stylesheet';
    premiumStyles.href = '/premium.css?v=premium4';
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
      return `The 45-day pilot is packaged to start small. AI Pilot Starter is INR 75K/month / USD 899/month plus setup from INR 2.5L / USD 3K. AI Pilot Growth is INR 1.5L/month / USD 1,799/month plus setup from INR 5L / USD 6K. Final scope depends on use case, data access, integrations, and governance needs. Start with the ${link('pilot framework', '/45-day-ai-pilot')} and ${link('pricing page', '/pricing')}.`;
    }

    if (asksPricing) {
      return `DigiScience uses package-style pricing: AI Readiness is INR 49K / USD 599 one-time, AI Pilot Starter is INR 75K/month / USD 899/month plus setup, AI Pilot Growth is INR 1.5L/month / USD 1,799/month plus setup, and Governed AI Platform starts at INR 3L/month / USD 3,499/month plus setup. See the ${link('pricing page', '/pricing')} for deliverables.`;
    }

    if (asksPilot) {
      return `The 45-day pilot is a framework, not a customer claim. It validates one AI workflow through scope, data feasibility, secure architecture, governance controls, a controlled proof, and a scale decision package. See ${link('45-Day AI Pilot', '/45-day-ai-pilot')}.`;
    }

    if (/readiness|assessment|scorecard|start/.test(text)) {
      return `The AI Readiness Assessment identifies high-value use cases, data gaps, cloud/security gaps, governance requirements, and the right first pilot. It is the cleanest starting point before committing to a build.`;
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

    return `DigiScience Techsol is an AI-first cloud transformation partner helping enterprises build secure, governed, industry-specific AI solutions on Azure, AWS, and GCP. Ask me about pricing, the 45-day pilot, AI readiness, governance, cloud platform, or industries.`;
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
      <button type="submit">Send enquiry</button>
    `;
    wrapper.appendChild(form);
    scrollMessages();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const leadEndpointUrl = appConfig.leadEndpointUrl || appConfig.googleScriptUrl || '';
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        service: 'Website AI assistant',
        message: form.message.value.trim(),
        source: 'lead-assistant',
        page: window.location.pathname,
        transcript: transcript.join(' | '),
        submittedAt: new Date().toISOString()
      };

      if (!leadEndpointUrl || leadEndpointUrl.includes('PASTE_YOUR')) {
        addMessage('The enquiry service is temporarily unavailable. Please email rajiv.gupta@digisciencetechsol.com directly.');
        return;
      }

      try {
        form.querySelector('button').disabled = true;
        await fetch(leadEndpointUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams(payload).toString()
        });
        addMessage('Thanks. Your enquiry has been captured. DigiScience will review the requirement and follow up.');
        form.reset();
      trackEvent('generate_lead', { event_label: 'Website AI assistant' });
      } catch (error) {
        console.error(error);
        addMessage('I could not submit this right now. Please email rajiv.gupta@digisciencetechsol.com directly.');
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

  addMessage('Hello. I can help with DigiScience services, pricing guidance, AI readiness, governance, industry use cases, and the 45-day pilot.', 'bot');
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
  const showFormNote = (message, kind = 'info') => {
    formNote.innerHTML = message;
    formNote.classList.remove('is-success', 'is-info');
    formNote.classList.add(kind === 'success' ? 'is-success' : 'is-info', 'show');
  };

  const setSubmitting = (submitting) => {
    if (!submitButton) return;
    submitButton.disabled = submitting;
    submitButton.textContent = submitting ? 'Submitting...' : 'Submit Enquiry';
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      showFormNote('Please complete the required fields and then submit your enquiry again.');
      return;
    }

    const extraFields = {};
    new FormData(contactForm).forEach((value, key) => {
      if (!['name', 'email', 'company', 'service', 'message', 'website'].includes(key) && String(value).trim()) {
        extraFields[key] = String(value).trim();
      }
    });

    const getField = (name) => contactForm.elements[name] ? String(contactForm.elements[name].value || '').trim() : '';
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
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      company: contactForm.company.value.trim(),
      service: contactForm.service.value,
      message: composedMessage,
      website: contactForm.website.value.trim(),
      source: window.location.hostname || 'website',
      page: window.location.pathname,
      intakeDetails: JSON.stringify(extraFields),
      submittedAt: new Date().toISOString()
    };

    if (!payload.name || !payload.email || !payload.message) {
      showFormNote('Please complete your name, email, and requirement before submitting.');
      return;
    }

    if (!isValidEmail(payload.email)) {
      showFormNote('Please enter a valid email address and submit your enquiry again.');
      contactForm.email.focus();
      return;
    }

    const leadEndpointUrl = appConfig.leadEndpointUrl || appConfig.googleScriptUrl || '';

    // Static-safe fallback: if the backend endpoint is unavailable, the enquiry can still be sent by email without exposing secrets.
    if (!leadEndpointUrl || leadEndpointUrl.includes('PASTE_YOUR')) {
      const mailtoUrl = buildMailtoUrl(payload);
      showFormNote(`The enquiry service is temporarily unavailable. Please use this fallback email link: <a href="${mailtoUrl}">Email enquiry details</a>.`);
      trackEvent('click_mailto', { event_label: 'lead form fallback' });
      return;
    }

    if (leadEndpointUrl.includes('/macros/library/')) {
      const mailtoUrl = buildMailtoUrl(payload);
      showFormNote(`The enquiry service is temporarily unavailable. Please use this fallback email link: <a href="${mailtoUrl}">Email enquiry details</a>.`);
      trackEvent('click_mailto', { event_label: 'lead form fallback' });
      return;
    }

    const isGoogleScriptEndpoint = /script\.google\.com\/macros\/s\/.+\/exec/.test(leadEndpointUrl);
    const isDigiscienceLeadEndpoint = /n8n\.digisciencetechsol\.com\/webhook\/digiscience-lead-/.test(leadEndpointUrl);
    if (!isGoogleScriptEndpoint && !isDigiscienceLeadEndpoint) {
      const mailtoUrl = buildMailtoUrl(payload);
      showFormNote(`The enquiry service is temporarily unavailable. Please use this fallback email link: <a href="${mailtoUrl}">Email enquiry details</a>.`);
      trackEvent('click_mailto', { event_label: 'lead form fallback' });
      return;
    }

    try {
      setSubmitting(true);
      showFormNote('Submitting your enquiry securely. Please wait...');

      const body = new URLSearchParams(payload);
      await fetch(leadEndpointUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString()
      });

      trackEvent('submit_contact_form', { event_label: payload.service || 'Website enquiry' });
      trackEvent('generate_lead', { event_label: payload.service || 'Website enquiry' });

      contactForm.reset();
      showFormNote('Your enquiry has been submitted successfully. Redirecting...', 'success');
      window.setTimeout(() => {
        window.location.href = '/thank-you';
      }, 700);
    } catch (error) {
      console.error(error);
      showFormNote('We could not submit your enquiry right now. Please try again, or email <a href="mailto:rajiv.gupta@digisciencetechsol.com">rajiv.gupta@digisciencetechsol.com</a> directly.');
    } finally {
      setSubmitting(false);
    }
  });
}

document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_mailto', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('[data-track]').forEach((element) => {
  element.addEventListener('click', () => trackEvent(element.getAttribute('data-track'), {
    event_label: element.textContent.trim() || element.getAttribute('href') || 'tracked click'
  }));
});

document.querySelectorAll('a[href*="ai-readiness"]').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_ai_readiness', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="45-day-ai-pilot"]').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_45_day_pilot', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="proof-assets"]').forEach((link) => {
  link.addEventListener('click', () => trackEvent('click_proof_asset', { event_label: link.getAttribute('href') }));
});

document.querySelectorAll('a[href*="pricing"], [data-pricing-package]').forEach((element) => {
  element.addEventListener('click', () => trackEvent('click_pricing_package', {
    event_label: element.textContent.trim() || element.getAttribute('href') || 'pricing'
  }));
});
