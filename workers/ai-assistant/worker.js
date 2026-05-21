const ALLOWED_ORIGINS = new Set([
  'https://digisciencetechsol.com',
  'https://www.digisciencetechsol.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

const KNOWLEDGE_BASE = `
DigiScience Techsol positioning:
- AI-first cloud transformation partner helping enterprises build secure, governed, industry-specific AI solutions on Azure, AWS, and GCP.
- Lead with measurable business outcomes enabled by AI. Cloud, DevOps, platform engineering, security, governance, and automation are foundations.

Primary offers:
- AI Readiness Assessment: USD 4K-12K / INR 3.5L-10L planning band.
- 45-Day Industry AI Pilot: USD 18K-55K / INR 15L-45L planning band.
- Secure AI Cloud Platform: USD 28K-85K / INR 24L-70L planning band.
- Responsible AI Governance Framework: USD 15K-50K / INR 12L-40L planning band.
- Enterprise AI Knowledge Assistant / Agent Factory: USD 25K-90K+ / INR 20L-75L+ planning band.
- AI Observability and Governance Retainer: USD 4K-15K/month / INR 3.5L-12L/month planning band.
- All pricing is private quote after discovery.

Service portfolio:
1. AI Industry Transformation Solutions
2. Secure Enterprise AI Cloud Platform
3. Responsible AI Governance and Agent Control
4. AI-Ready DevOps and Platform Engineering
5. Cloud Modernization for AI Readiness
6. Industry AI Pilot in 45 Days

Target industries:
- Manufacturing: predictive maintenance, visual inspection, anomaly detection, quality intelligence, production decision support.
- Healthcare: patient workflows, clinical documentation, scheduling intelligence, healthcare knowledge assistants, secure workflow support.
- Legal: contract review, clause extraction, obligation tracking, legal knowledge assistant, audit-ready document workflows.
- BFSI: fraud intelligence, compliance response, KYC, audit readiness, model risk controls.
- Retail: demand forecasting, recommendation systems, churn prevention, campaign intelligence, customer support productivity.
- Logistics: ETA prediction, route intelligence, warehouse visibility, exception management, control tower decision support.
- HR and recruitment: candidate matching, screening productivity, skills intelligence, interview support, workforce analytics.
- Government/public sector: citizen service productivity, secure document processing, knowledge access, audit intelligence.

Cloud and AI platforms:
- Azure OpenAI, Azure AI Foundry, Azure AI Search, Azure AI Document Intelligence, Azure Machine Learning, Microsoft Fabric, AKS, Azure Monitor, Microsoft Sentinel, Defender for Cloud.
- AWS Bedrock, Amazon SageMaker, Amazon Q, AWS Lambda, Amazon EKS, Amazon CloudWatch, AWS GuardDuty, AWS Security Hub.
- Google Vertex AI, GKE, BigQuery, Looker, Cloud Monitoring.

Governance priorities:
- Responsible AI, secure AI landing zones, data privacy, IAM/RBAC, private networking, prompt security, model governance, model risk management, hallucination risk management, human approval, audit trail, logging and monitoring, compliance mapping, cost governance, AI agent governance, data classification, AI observability.

Lead capture:
- Strong lead moments: pricing, quote request, pilot discussion, assessment request, meeting request, implementation timeline, use-case feasibility, security/governance review.
- Contact email: rajiv.gupta@digisciencetechsol.com.

Important claims policy:
- Do not invent customers, case studies, logos, delivered results, certifications, partnerships, or guaranteed ROI.
- The 45-day pilot is a proof-of-value framework, not a customer case study or guaranteed business outcome.
- Use practical, enterprise-ready, business-first, technically credible language.
`;

const json = (body, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      ...corsHeaders(origin)
    }
  });

const corsHeaders = (origin) => ({
  'access-control-allow-origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.digisciencetechsol.com',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
  vary: 'Origin'
});

const clamp = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

const extractOutputText = (payload) => {
  if (payload.output_text) return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n');
};

const fallbackAnswer = (question) => {
  const text = question.toLowerCase();
  if (/price|pricing|cost|quote|budget/.test(text)) {
    return {
      answer: 'DigiScience uses private quotes with public planning bands. AI readiness typically starts around USD 4K-12K, focused 45-day pilots around USD 18K-55K, and larger secure AI platform or governance work is scoped after discovery.',
      captureLead: true
    };
  }
  if (/pilot|45|poc|prototype/.test(text)) {
    return {
      answer: 'The 45-day pilot validates one enterprise AI use case through scope, data feasibility, secure architecture, governance controls, a controlled proof, and a scale decision package. It is a framework, not a guaranteed outcome claim.',
      captureLead: true
    };
  }
  return {
    answer: 'DigiScience Techsol helps enterprises design, build, secure, and operate governed AI solutions on Azure, AWS, and GCP. A good next step is an AI Readiness Assessment to identify the best use case, data gaps, governance controls, and pilot path.',
    captureLead: /contact|meeting|call|demo|consult|proposal/.test(text)
  };
};

const shouldCaptureLead = (question) =>
  /price|pricing|cost|quote|budget|pilot|45|poc|prototype|meeting|call|demo|consult|proposal|timeline|implementation|assessment|readiness/i.test(question);

const parseAssistantJson = (outputText, question) => {
  const text = String(outputText || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(text);
  const answer = clamp(parsed.answer, 1400);
  return {
    answer: answer || fallbackAnswer(question).answer,
    captureLead: Boolean(parsed.captureLead) || shouldCaptureLead(question)
  };
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, origin);
    }

    const question = clamp(body.question, 700);
    const page = clamp(body.page, 120);
    const transcript = Array.isArray(body.transcript)
      ? body.transcript.slice(-8).map((item) => clamp(item, 400)).join('\n')
      : '';

    if (!question) {
      return json({ error: 'Question is required' }, 400, origin);
    }

    const instructions = `
You are the DigiScience Techsol website AI assistant.
Answer visitor questions using only the company knowledge below.
Be concise: 2-5 sentences unless the user asks for detail.
Be practical, enterprise-ready, business-first, technically credible, and not hype-heavy.
Never invent customers, case studies, delivered results, certifications, partnerships, or guaranteed ROI.
When the visitor asks about pricing, quote the planning bands and say final pricing is private quote after discovery.
When the visitor shows buying intent, asks for a quote, asks for a meeting, or has a concrete use case, set captureLead to true.
Return strict JSON only:
{"answer":"...", "captureLead":true|false}

${KNOWLEDGE_BASE}
`;

    try {
      if (env.AI) {
        const aiResponse = await env.AI.run(env.CF_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: instructions },
            { role: 'user', content: `Current page: ${page || '/'}\nRecent transcript:\n${transcript || '(none)'}\nVisitor question: ${question}` }
          ],
          max_tokens: 500
        });
        const outputText = aiResponse.response || aiResponse.result || '';
        return json(parseAssistantJson(outputText, question), 200, origin);
      }

      if (!env.OPENAI_API_KEY) {
        return json(fallbackAnswer(question), 200, origin);
      }

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-5-mini',
          instructions,
          input: [
            {
              role: 'user',
              content: `Current page: ${page || '/'}\nRecent transcript:\n${transcript || '(none)'}\nVisitor question: ${question}`
            }
          ],
          max_output_tokens: 500,
          store: false
        })
      });

      if (!response.ok) {
        console.error('OpenAI error', response.status, await response.text());
        return json(fallbackAnswer(question), 200, origin);
      }

      const payload = await response.json();
      const outputText = extractOutputText(payload);
      return json(parseAssistantJson(outputText, question), 200, origin);
    } catch (error) {
      console.error(error);
      return json(fallbackAnswer(question), 200, origin);
    }
  }
};
