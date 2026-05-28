# Quote-To-Cash Review Evidence Pack

Status: Internal evidence pack. Do not publish.
Created: 2026-05-28

## Repository Evidence

- Real repo path used: `/data/digiscience/website`
- GitHub repository: `digiscience-techsol/website`
- Git remote: `https://github.com/digiscience-techsol/website.git`
- GitHub branch: `main`
- Local branch: `main`
- Local shell state observed: `main...origin/main [ahead 11, behind 14]`

## Local / Remote State Note

Shell git and GitHub connector state differ.

- Local shell has commits that are ahead of local `origin/main`.
- Local shell is also behind remote because previous remote updates were pushed through the GitHub connector.
- Shell `git push` is not the source of truth for the latest remote state in this flow.
- Quote-to-cash files were pushed using the GitHub connector.
- Remote verification was performed through GitHub connector file fetches against `main`.

## Latest Quote-To-Cash Commit URLs

The GitHub connector created multiple commits, one per created/updated file.

Latest connector commit for the quote-to-cash batch:

- `1711a002023d3cdef782c76a47b8d97c820f6d8a`
- URL: `https://github.com/digiscience-techsol/website/commit/1711a002023d3cdef782c76a47b8d97c820f6d8a`
- File: `ops/internal-sales-playbook-index.md`

All quote-to-cash connector commit URLs:

- `3d2e12268c33d26e750ad9bedc75f73324d893b9` - `https://github.com/digiscience-techsol/website/commit/3d2e12268c33d26e750ad9bedc75f73324d893b9`
- `38bc9a6557269c3c7d6e1aff646bd1ea1dc1899f` - `https://github.com/digiscience-techsol/website/commit/38bc9a6557269c3c7d6e1aff646bd1ea1dc1899f`
- `28badcc6a0e55d45949e4bbbef37c251d882f1ea` - `https://github.com/digiscience-techsol/website/commit/28badcc6a0e55d45949e4bbbef37c251d882f1ea`
- `3922c15cbdbea28ebcc7101888e0dd339da05e57` - `https://github.com/digiscience-techsol/website/commit/3922c15cbdbea28ebcc7101888e0dd339da05e57`
- `f5161455b58e9ce16bb65b98510bbb341ad0694b` - `https://github.com/digiscience-techsol/website/commit/f5161455b58e9ce16bb65b98510bbb341ad0694b`
- `1711a002023d3cdef782c76a47b8d97c820f6d8a` - `https://github.com/digiscience-techsol/website/commit/1711a002023d3cdef782c76a47b8d97c820f6d8a`

Local shell commit for quote-to-cash batch:

- `63a7d2e`
- Local message: `Add quote-to-cash readiness pack`
- Note: local commit exists in local shell history, but remote push was performed through GitHub connector commits listed above.

## File Evidence Table

| File path | File URL | Exists locally | Exists on GitHub main | Remote API evidence | Purpose | Validation status | Local / remote mismatch | Push method | Real repo path | Sitemap exposure |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ops/quote-to-cash-readiness-pack.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/quote-to-cash-readiness-pack.md` | yes | yes | GitHub connector fetch returned SHA `9865413f64152b342cb469ca18516861bf785212` | Quote-to-cash readiness pack answering whether DigiScience can quote/propose/invoice/start. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector create | `/data/digiscience/website` | not exposed in sitemap grep |
| `ops/founder-commercial-decision-sheet.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/founder-commercial-decision-sheet.md` | yes | yes | GitHub connector fetch returned SHA `4f8f39bc2ef1a5e9a988a2eff2b31ac1b76acc58` | Founder decision sheet for pricing, proposal owner, billing owner, payment method, and signature method. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector create | `/data/digiscience/website` | not exposed in sitemap grep |
| `ops/ai-readiness-assessment-sow-template.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/ai-readiness-assessment-sow-template.md` | yes | yes | GitHub connector fetch returned SHA `c761bdc59b31016465e477eef560e3bda8c44b1e` | SOW template for AI Readiness Assessment. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector create | `/data/digiscience/website` | not exposed in sitemap grep |
| `ops/ai-readiness-assessment-invoice-info-checklist.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/ai-readiness-assessment-invoice-info-checklist.md` | yes | yes | GitHub connector fetch returned SHA `f7c0fe527f5ccd70da14a3c1a522c09714dafcba` | Invoice information checklist and no-secrets billing field list. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector create | `/data/digiscience/website` | not exposed in sitemap grep |
| `ops/ai-readiness-assessment-kickoff-checklist.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/ai-readiness-assessment-kickoff-checklist.md` | yes | yes | GitHub connector fetch returned SHA `4f3384417757a6d6a3dec9a509d21d379acab694` | Kickoff checklist for sponsor, workflow owner, reviewer, sample data, security, cadence, and go/no-go criteria. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector create | `/data/digiscience/website` | not exposed in sitemap grep |
| `ops/internal-sales-playbook-index.md` | `https://github.com/digiscience-techsol/website/blob/main/ops/internal-sales-playbook-index.md` | yes | yes | GitHub connector fetch returned SHA `171802a2d3e9a72737ed5e2215be66216923a33f` | Internal index linking quote-to-cash files. | validated | no content mismatch identified by connector fetch; shell branch is diverged. | GitHub connector update | `/data/digiscience/website` | not exposed in sitemap grep |

## Public Sitemap Exposure Evidence

Command run:

`curl -L https://digisciencetechsol.com/sitemap.xml | grep -Ei "quote-to-cash|commercial-decision|sow-template|invoice-info|kickoff-checklist" || true`

Observed result: no matching sitemap entries.

Interpretation: the quote-to-cash internal filenames were not exposed in the public sitemap at the time of validation.

## Public Site Availability Evidence

Commands run:

- `curl -I https://digisciencetechsol.com/`
- `curl -I https://digisciencetechsol.com/contact`

Observed result: both returned HTTP/2 200 during validation after the quote-to-cash pack was created and pushed.

## File Location Evidence

Command run:

`find . -maxdepth 3 -type f | grep -Ei "quote-to-cash|commercial-decision|sow-template|invoice-info|kickoff-checklist" | grep -v "^./ops/" || true`

Observed result: no matching non-`ops/` files.

Interpretation: quote-to-cash files were created only under `ops/`.

## Validation Status

- Files on real repo path `/data/digiscience/website`: yes.
- Files on GitHub `main`: yes, confirmed by GitHub connector file fetches.
- Public sitemap exposure: no matching entries observed.
- Public website availability: `/` and `/contact` returned HTTP/2 200.
- Local/remote mismatch: yes, shell branch is diverged; connector remote is the source used for pushed file evidence.

## No-Hallucination Confirmation

This evidence pack records file, commit, path, branch, push, and public-exposure evidence only. It does not claim outreach, LinkedIn use, account contact, form submission, prospect response, proposal sent, invoice sent, payment received, billing start, or customer acceptance.
