(() => {
  const root = document.querySelector("[data-gated-download]");
  if (!root) return;
  const cfg = JSON.parse(root.getAttribute("data-gated-download") || "{}");
  const form = root.querySelector("form");
  const status = root.querySelector("[data-gate-status]");
  const unlock = root.querySelector("[data-gate-unlock]");
  const pdfLink = root.querySelector("[data-gate-pdf]");
  const key = `ds_gated_${cfg.id || "onepager"}`;

  const reveal = () => {
    if (unlock) unlock.hidden = false;
    if (form) form.hidden = true;
    if (pdfLink && cfg.pdf) pdfLink.setAttribute("href", cfg.pdf);
  };

  try {
    if (sessionStorage.getItem(key) === "1") reveal();
  } catch (_) {}

  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get("website")) return;
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const consent = fd.get("consent") === "yes";
    if (!consent) {
      if (status) status.textContent = "Please confirm privacy consent.";
      return;
    }
    if (!email && !phone) {
      if (status) status.textContent = "Enter WhatsApp or work email.";
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (status) status.textContent = "Enter a valid work email, or WhatsApp only.";
      return;
    }
    if (status) status.textContent = "Unlocking…";
    try {
      if (typeof window.dsIdentifyBeacon === "function") {
        await window.dsIdentifyBeacon({
          name,
          email,
          phone,
          contact_source: cfg.source || "gated_onepager",
          interest: cfg.id || "",
        });
      }
      if (typeof window.submitLeadPayload === "function") {
        await window.submitLeadPayload({
          formType: "gated_onepager",
          name: name || "One-pager visitor",
          email,
          phone,
          need: cfg.id || "gated_onepager",
          privacy_consent: "yes",
        });
      } else {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            formType: "gated_onepager",
            name: name || "One-pager visitor",
            email,
            phone,
            need: cfg.id || "gated_onepager",
            privacyConsent: "yes",
            page: location.pathname,
          }),
        });
      }
    } catch (_) {}
    try {
      sessionStorage.setItem(key, "1");
    } catch (_) {}
    reveal();
    if (status) status.textContent = "Unlocked — download below. WhatsApp us anytime.";
  });
})();
