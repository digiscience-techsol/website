/**
 * Cloud waste triage quiz — value first, then optional contact gate.
 * Pure client-side; open-source friendly; no paid widgets.
 */
(() => {
  if (window.__CLOUD_WASTE_TRIAGE__) return;
  window.__CLOUD_WASTE_TRIAGE__ = true;

  const mount = document.querySelector("[data-cloud-waste-triage]");
  if (!mount) return;

  const cfg = Object.assign(
    {
      brand: "AICloudStrategist",
      wa: "918796302608",
      waText: "Hi AICloudStrategist, I completed the cloud waste triage and want the action checklist",
      identify: typeof window.aicsIdentifyBeacon === "function" ? "aics" : "ds",
      privacy: "/privacy",
      book: "/request-fit-review/",
    },
    (() => {
      try {
        return JSON.parse(mount.getAttribute("data-config") || "{}");
      } catch (_) {
        return {};
      }
    })()
  );

  const questions = [
    {
      id: "cloud",
      q: "Where is most of the spend you care about?",
      options: [
        { v: "aws", l: "AWS" },
        { v: "azure", l: "Azure" },
        { v: "gcp", l: "GCP / Google Cloud" },
        { v: "k8s", l: "Kubernetes (any cloud)" },
        { v: "multi", l: "Multi-cloud / unclear" },
      ],
    },
    {
      id: "pain",
      q: "What hurts most right now?",
      options: [
        { v: "idle", l: "Idle / oversized compute or GPU" },
        { v: "owners", l: "Nobody owns shared platform cost" },
        { v: "bill", l: "Bill shock / unexplained spikes" },
        { v: "alloc", l: "Can't allocate cost to products/teams" },
        { v: "commit", l: "Commitments / Savings Plans unclear" },
      ],
    },
    {
      id: "maturity",
      q: "How clear is ownership today?",
      options: [
        { v: "none", l: "Mostly unclear" },
        { v: "partial", l: "Some tags / some owners" },
        { v: "good", l: "Most spend has an owner" },
      ],
    },
    {
      id: "spend",
      q: "Rough monthly cloud/AI spend in scope?",
      options: [
        { v: "lt25", l: "Under $25k / ₹20L" },
        { v: "25_100", l: "$25k–$100k / ₹20L–₹80L" },
        { v: "gt100", l: "Over $100k / ₹80L" },
        { v: "unknown", l: "Not sure yet" },
      ],
    },
  ];

  const answers = {};
  let step = 0;

  const scoreResult = () => {
    let urgency = 1;
    if (answers.pain === "bill" || answers.pain === "idle") urgency += 2;
    if (answers.pain === "owners" || answers.pain === "alloc") urgency += 2;
    if (answers.maturity === "none") urgency += 2;
    if (answers.maturity === "partial") urgency += 1;
    if (answers.spend === "gt100") urgency += 2;
    if (answers.spend === "25_100") urgency += 1;
    const band = urgency >= 6 ? "high" : urgency >= 4 ? "medium" : "low";
    const titles = {
      high: "High priority: ownership gaps are blocking safe cuts",
      medium: "Medium priority: clarify owners before rightsizing",
      low: "Lower urgency: tighten measurement, then optimize",
    };
    const actions = {
      idle: "Inventory idle/oversized estates; hold cuts until an owner confirms blast radius.",
      owners: "Build an owned vs shared vs unallocated map before any savings campaign.",
      bill: "Isolate spike drivers with a dated baseline; don't average anomalies into 'savings'.",
      alloc: "Fix allocation rules for shared platforms and Kubernetes namespaces first.",
      commit: "Review commitment coverage against durable demand — not last month's peak alone.",
    };
    const cloudHint = {
      aws: "Focus first on EC2/EKS/RDS and untagged accounts.",
      azure: "Focus first on subscriptions, AKS, and Cost Management exports.",
      gcp: "Focus first on projects, GKE, and BigQuery/Vertex where material.",
      k8s: "Focus first on namespace/node-pool ownership and idle capacity.",
      multi: "Pick one estate boundary before multi-cloud tooling.",
    };
    return {
      band,
      title: titles[band],
      action: actions[answers.pain] || actions.owners,
      cloud: cloudHint[answers.cloud] || cloudHint.multi,
      urgency,
    };
  };

  const el = (html) => {
    const d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstElementChild;
  };

  const render = () => {
    mount.innerHTML = "";
    if (step < questions.length) {
      const item = questions[step];
      const card = el(`<div class="cwt-card" role="group" aria-labelledby="cwt-q">
        <p class="cwt-progress">Step ${step + 1} of ${questions.length}</p>
        <h3 id="cwt-q">${item.q}</h3>
        <div class="cwt-options"></div>
      </div>`);
      const opts = card.querySelector(".cwt-options");
      item.options.forEach((o) => {
        const b = el(`<button type="button" class="cwt-option">${o.l}</button>`);
        b.addEventListener("click", () => {
          answers[item.id] = o.v;
          step += 1;
          render();
        });
        opts.appendChild(b);
      });
      mount.appendChild(card);
      return;
    }

    const result = scoreResult();
    const summary = el(`<div class="cwt-card cwt-result" id="cwt-result">
      <p class="cwt-eyebrow">Your triage result · shown before any contact ask</p>
      <h3>${result.title}</h3>
      <p><strong>Priority:</strong> ${result.band.toUpperCase()} (score ${result.urgency}/8)</p>
      <ul>
        <li>${result.action}</li>
        <li>${result.cloud}</li>
        <li>Next: act / investigate / hold — only where evidence allows.</li>
      </ul>
      <p class="cwt-note">This is a decision aid, not a savings guarantee. No cloud credentials required.</p>
      <div class="cwt-gate" id="cwt-gate">
        <h4>Get the 1-page action checklist</h4>
        <p>WhatsApp is fastest in India. Or leave WhatsApp / work email and we'll send the checklist for your answers (opt-in under our Privacy Policy).</p>
        <form class="cwt-form" novalidate>
          <input type="text" name="website" class="cwt-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input name="name" type="text" maxlength="80" placeholder="First name (optional)" autocomplete="given-name">
          <input name="phone" type="tel" maxlength="40" placeholder="WhatsApp number (preferred)" autocomplete="tel" inputmode="tel">
          <input name="email" type="email" maxlength="180" placeholder="Work email" autocomplete="email" inputmode="email">
          <label class="cwt-consent"><input type="checkbox" name="consent" value="yes" required> I agree to the <a href="${cfg.privacy}">Privacy Policy</a> for this follow-up.</label>
          <div class="cwt-actions">
            <a class="button button-primary cwt-wa" href="https://wa.me/${cfg.wa}?text=${encodeURIComponent(cfg.waText + ' | cloud:' + (answers.cloud || '') + ' | pain:' + (answers.pain || '') + ' | band:' + result.band)}">WhatsApp the checklist</a>
            <button type="submit" class="button button-secondary">Email / send details</button>
            <a class="button button-secondary" href="${cfg.book}">Book a free review</a>
          </div>
          <p class="cwt-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>`);
    mount.appendChild(summary);

    const form = summary.querySelector(".cwt-form");
    const status = summary.querySelector(".cwt-status");
    const wa = summary.querySelector(".cwt-wa");
    wa.addEventListener("click", () => {
      beacon({ name: "", email: "", phone: "", contact_source: "cloud_waste_triage_whatsapp" });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.website.value) return;
      if (!form.consent.checked) {
        status.textContent = "Please confirm privacy consent.";
        return;
      }
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      if (!email && !phone) {
        status.textContent = "Enter WhatsApp or work email.";
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Enter a valid work email, or use WhatsApp only.";
        return;
      }
      status.textContent = "Sending…";
      await beacon({
        name,
        email,
        phone,
        contact_source: "cloud_waste_triage",
        company: "",
        chatTurns: 1,
      });
      // Also hit contact/lead endpoints when available
      try {
        if (cfg.identify === "aics") {
          await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              name: name || "Triage visitor",
              email,
              phone,
              contact: email || phone,
              privacy_consent: "yes",
              service: "Cloud waste triage checklist",
              stage: "Calculator post-result gate",
              need: `cloud=${answers.cloud};pain=${answers.pain};maturity=${answers.maturity};spend=${answers.spend};band=${result.band}`,
              message: "Requested 1-page action checklist after cloud waste triage.",
              landing_page: location.href,
              visitor_id: window.aicsVisitorId || "",
            }),
          });
        } else if (typeof window.submitLeadPayload === "function") {
          await window.submitLeadPayload({
            formType: "cloud_waste_triage",
            name: name || "Triage visitor",
            email,
            phone,
            need: `cloud=${answers.cloud};pain=${answers.pain};band=${result.band}`,
            privacy_consent: "yes",
          });
        } else {
          await fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              formType: "cloud_waste_triage",
              name: name || "Triage visitor",
              email,
              phone,
              need: `cloud=${answers.cloud};pain=${answers.pain};band=${result.band}`,
              privacyConsent: "yes",
              page: location.pathname,
            }),
          });
        }
      } catch (_) {}
      status.textContent = "Thanks — checklist follow-up is queued. You can also WhatsApp us anytime.";
      form.querySelector("button[type=submit]").disabled = true;
    });
  };

  function beacon(extra) {
    try {
      if (cfg.identify === "aics" && typeof window.aicsIdentifyBeacon === "function") {
        return window.aicsIdentifyBeacon(extra);
      }
      if (typeof window.dsIdentifyBeacon === "function") {
        return window.dsIdentifyBeacon(extra);
      }
    } catch (_) {}
    return Promise.resolve();
  }

  // Styles (scoped)
  if (!document.getElementById("cwt-styles")) {
    const s = document.createElement("style");
    s.id = "cwt-styles";
    s.textContent = `
      [data-cloud-waste-triage]{margin:1.5rem 0}
      .cwt-card{border:1px solid rgba(0,0,0,.12);padding:1.25rem 1.35rem;border-radius:12px;background:rgba(255,255,255,.72);max-width:40rem}
      .cwt-progress,.cwt-eyebrow{font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;opacity:.7;margin:0 0 .5rem}
      .cwt-options{display:grid;gap:.55rem;margin-top:1rem}
      .cwt-option,.cwt-actions .button, .cwt-actions a.button{display:inline-flex;align-items:center;justify-content:center;padding:.7rem 1rem;border-radius:8px;border:1px solid rgba(0,0,0,.18);background:#fff;cursor:pointer;text-decoration:none;color:inherit;font:inherit}
      .cwt-option:hover{border-color:#0b6e4f}
      .cwt-form{display:grid;gap:.55rem;margin-top:.75rem}
      .cwt-form input[type=text],.cwt-form input[type=email],.cwt-form input[type=tel]{padding:.65rem .75rem;border:1px solid rgba(0,0,0,.2);border-radius:8px;font:inherit}
      .cwt-honeypot{position:absolute;left:-9999px;opacity:0;height:0;width:0}
      .cwt-consent{font-size:.9rem;display:flex;gap:.45rem;align-items:flex-start}
      .cwt-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.35rem}
      .cwt-actions .button-primary, a.button-primary{background:#0b6e4f;color:#fff;border-color:#0b6e4f}
      .cwt-note,.cwt-status{font-size:.92rem;opacity:.85}
      .cwt-gate{margin-top:1.25rem;padding-top:1rem;border-top:1px dashed rgba(0,0,0,.15)}
    `;
    document.head.appendChild(s);
  }

  render();
})();
