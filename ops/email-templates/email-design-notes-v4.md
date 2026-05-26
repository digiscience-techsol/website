# Email Design Notes v4

Purpose: production-like CAM prospect email body for Gmail HTML MIME render testing.

## Design choices

- 640px maximum centered email container.
- Inline CSS only.
- Table-based structure for Gmail and Outlook compatibility.
- Deep navy gradient hero with clear DigiScience Techsol branding.
- Business pain card, technology evaluation cards, safety/governance notice, and CTA button.
- No external CSS, JavaScript, tracking pixels, fake logo, fake customer claim, or screenshot dependency.

## Customer-facing boundaries

- No internal approval language.
- No top-account list.
- No no-send status.
- No fake claim such as "we helped similar firms."
- No request for confidential documents.
- Public link only: `https://digisciencetechsol.com/ai-readiness-assessment`.

## Verification requirement

Success requires the received Gmail body itself to render the designed HTML email, including card/button layout, not merely a source file screenshot or image attachment.