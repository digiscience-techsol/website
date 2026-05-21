const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const serviceSelect = document.getElementById('service');
const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
const appConfig = window.DIGISCIENCE_CONFIG || {};

const ensurePremiumVisuals = () => {
  if (!document.querySelector('link[href^="premium.css"]')) {
    const premiumStyles = document.createElement('link');
    premiumStyles.rel = 'stylesheet';
    premiumStyles.href = 'premium.css?v=premium3';
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
      '<img src="assets/ai-photos/hero-enterprise-ai.jpg" alt="Secure enterprise AI cloud architecture with governed data flows" width="700" height="393" decoding="async" fetchpriority="high" />',
      '<div class="visual-badge visual-badge-top">Governed AI</div>',
      '<div class="visual-badge visual-badge-bottom">Cloud + security foundation</div>'
    ].join('');
    heroPanel.insertBefore(shell, heroPanel.firstChild);
  }

  const serviceVisuals = {
    'AI Industry Transformation Solutions': ['assets/ai-photos/service-industry-transformation.jpg', 'Industry AI transformation across operations, documents, customers, and decision support', 900, 560],
    'Secure Enterprise AI Cloud Platform': ['assets/ai-photos/service-secure-platform.jpg', 'Secure enterprise AI platform with private cloud, identity, observability, and governance controls', 900, 560],
    'Responsible AI Governance and Agent Control': ['assets/ai-photos/service-governance-control.jpg', 'Responsible AI governance console with approval, audit, risk, and agent control', 900, 560],
    'AI-Ready DevOps and Platform Engineering': ['assets/ai-photos/service-ai-devops.jpg', 'AI-ready DevOps and platform engineering pipeline for MLOps and LLMOps', 900, 560],
    'Cloud Modernization for AI Readiness': ['assets/ai-photos/service-modernization.jpg', 'Cloud modernization roadmap for AI-ready data, security, platforms, and operations', 900, 560],
    'Industry AI Pilot in 45 Days': ['assets/ai-photos/service-45-day-pilot.jpg', '45-day industry AI pilot plan from use case to measurable business outcome', 900, 560]
  };

  document.querySelectorAll('.card h3').forEach((heading) => {
    const title = heading.textContent.trim();
    const card = heading.closest('.card');
    if (!card || card.querySelector('.card-visual') || !serviceVisuals[title]) return;
    card.classList.add('visual-card');
    card.insertBefore(createImage(...serviceVisuals[title]), card.firstChild);
  });

  const industryMap = {
    'Manufacturing AI': ['assets/ai-photos/industry-manufacturing.jpg', 'Manufacturing AI for predictive maintenance, visual inspection, and production intelligence'],
    'Healthcare AI Workflows': ['assets/ai-photos/industry-healthcare.jpg', 'Healthcare AI workflows for documentation, scheduling, and patient operations'],
    'Legal Document Intelligence': ['assets/ai-photos/industry-legal.jpg', 'Legal document intelligence for contracts, clause extraction, and obligation tracking'],
    'BFSI Compliance and Fraud Intelligence': ['assets/ai-photos/industry-bfsi.jpg', 'BFSI AI for compliance, KYC, fraud intelligence, and audit readiness'],
    'Retail Demand and Customer Intelligence': ['assets/ai-photos/industry-retail.jpg', 'Retail AI for demand forecasting, recommendations, and customer intelligence'],
    'Logistics AI Control Tower': ['assets/ai-photos/industry-logistics.jpg', 'Logistics AI control tower for ETA, routing, exception, and warehouse intelligence'],
    'HR and Recruitment Intelligence': ['assets/ai-photos/industry-hr.jpg', 'HR and recruitment AI for candidate matching, screening, and workforce analytics'],
    'Government / Public Sector AI': ['assets/ai-photos/industry-public-sector.jpg', 'Government and public sector AI for secure citizen service and document workflows'],
    'Government and Public Sector AI': ['assets/ai-photos/industry-public-sector.jpg', 'Government and public sector AI for secure citizen service and document workflows']
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
    proofCards[0].insertBefore(createImage('assets/ai-photos/service-45-day-pilot.jpg', 'AI readiness assessment scorecard and pilot roadmap visual', 650, 366), proofCards[0].firstChild);
  }
  if (proofCards[1] && !proofCards[1].querySelector('.card-visual')) {
    proofCards[1].classList.add('visual-card');
    proofCards[1].insertBefore(createImage('assets/ai-photos/service-secure-platform.jpg', 'Secure AI landing zone and governance architecture visual', 650, 366), proofCards[1].firstChild);
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

    const payload = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      company: contactForm.company.value.trim(),
      service: contactForm.service.value,
      message: contactForm.message.value.trim(),
      website: contactForm.website.value.trim(),
      source: window.location.hostname || 'website',
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

    if (!leadEndpointUrl || leadEndpointUrl.includes('PASTE_YOUR')) {
      showFormNote('The enquiry service is temporarily unavailable. Please try again shortly or email <a href="mailto:rajiv.gupta@digisciencetechsol.com">rajiv.gupta@digisciencetechsol.com</a> directly.');
      return;
    }

    if (leadEndpointUrl.includes('/macros/library/')) {
      showFormNote('The enquiry service is temporarily unavailable. Please try again shortly or email <a href="mailto:rajiv.gupta@digisciencetechsol.com">rajiv.gupta@digisciencetechsol.com</a> directly.');
      return;
    }

    const isGoogleScriptEndpoint = /script\.google\.com\/macros\/s\/.+\/exec/.test(leadEndpointUrl);
    const isDigiscienceLeadEndpoint = /n8n\.digisciencetechsol\.com\/webhook\/digiscience-lead-/.test(leadEndpointUrl);
    if (!isGoogleScriptEndpoint && !isDigiscienceLeadEndpoint) {
      showFormNote('The enquiry service is temporarily unavailable. Please try again shortly or email <a href="mailto:rajiv.gupta@digisciencetechsol.com">rajiv.gupta@digisciencetechsol.com</a> directly.');
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

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: payload.service || 'Website enquiry'
        });
      }

      contactForm.reset();
      showFormNote('Your enquiry has been submitted successfully. Redirecting...', 'success');
      window.setTimeout(() => {
        window.location.href = 'success.html';
      }, 700);
    } catch (error) {
      console.error(error);
      showFormNote('We could not submit your enquiry right now. Please try again, or email <a href="mailto:rajiv.gupta@digisciencetechsol.com">rajiv.gupta@digisciencetechsol.com</a> directly.');
    } finally {
      setSubmitting(false);
    }
  });
}
