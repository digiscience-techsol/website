# DigiBot Browser Operations

## Official Path

Use Option B: manual Chromium plus CDP plus noVNC.

OpenClaw managed browser is not the accepted operating path for founder-assisted authentication because it is not proven attached to the visual noVNC session. The controlled path is the shared Xvfb display running Chromium, exposed to DigiBot through CDP and to the founder through noVNC.

## Start

Script:

```bash
START_TUNNEL=1 bash scripts/start-visual-browser-novnc.sh
```

Defaults:

- Display: `:99`
- CDP port: `18800`
- VNC port: `5900`
- noVNC port: `6080`
- Browser profile: `/data/.openclaw/browser/openclaw/user-data`
- Logs: `/data/.openclaw/logs/`
- Temporary tunnel log: `/data/.openclaw/run/cloudflared-visual-browser.log`

The script prints the temporary Cloudflare URL when `START_TUNNEL=1` is used.

Use `START_TUNNEL=1` only for a founder-assisted authentication window. For DigiBot-only browsing, keep noVNC local and use CDP without a public tunnel.

## Verify

```bash
ps -eo pid,ppid,etime,cmd | grep -Ei 'Xvfb|openbox|chromium|x11vnc|websockify|cloudflared' | grep -v grep
curl -sS http://127.0.0.1:18800/json/version
curl -sS -I http://127.0.0.1:6080/vnc.html
grep -Eo 'https://[-a-zA-Z0-9.]+trycloudflare.com' /data/.openclaw/run/cloudflared-visual-browser.log | tail -1
```

Expected:

- Xvfb, openbox, Chromium, x11vnc, websockify, and cloudflared are running during an active auth window.
- CDP returns a Chrome version and websocket debugger URL.
- noVNC returns HTTP 200 for `/vnc.html`.
- Founder can open the temporary Cloudflare URL and see the same browser.

## Shutdown

After authentication or any sensitive browser work:

```bash
bash scripts/stop-visual-browser-novnc.sh
```

Verify shutdown:

```bash
ps -eo pid,cmd | grep -Ei 'x11vnc|websockify|cloudflared|Xvfb|openbox|chromium' | grep -v grep || true
```

If only the public tunnel needs to be closed while keeping the browser available locally, stop the `cloudflared tunnel --url http://127.0.0.1:6080` process and re-check that the public noVNC URL no longer responds.

## Operating Policy

- Open a public noVNC tunnel only when the founder needs to enter authentication manually or verify the shared browser.
- Keep the public tunnel open only while the founder is actively using it.
- Close the public tunnel immediately after authentication, verification, or inactivity.
- Do not use the public noVNC tunnel for unattended work.
- Use CDP at `http://127.0.0.1:18800` for DigiBot browser control.
- Never claim founder access is verified until the founder confirms they can see Chromium through noVNC.
- Controlled monitoring may resume only after founder access is confirmed and the public tunnel is closed or explicitly still needed for an active auth window.

## 2026-05-25 Cloudflare Auth Window

- Founder access confirmed: yes.
- Cloudflare dashboard authentication completed: yes.
- Cache purge completed: yes, through authenticated Cloudflare dashboard Custom Purge.
- Purged URLs:
  - `https://digisciencetechsol.com/assets/templates/digiscience-first-50-prospect-list.csv`
  - `https://digisciencetechsol.com/assets/templates/digiscience-week-01-sales-metrics.csv`
  - `https://digisciencetechsol.com/assets/templates/digiscience-prospect-tracker.csv`
  - `https://digisciencetechsol.com/sitemap.xml`
  - `https://digisciencetechsol.com/robots.txt`
- Verification result: public CSV URLs return `HTTP/2 410` with `x-robots-tag: noindex, nofollow, noarchive`; sitemap internal grep is clean except buyer-facing `45-day-ai-pilot` matches.
- Shutdown completed: yes. Public noVNC tunnel, VNC, noVNC, CDP, Chromium, openbox, and Xvfb were stopped after the auth window.
- Security note: no passwordless public tunnel should remain open after auth work. Do not leave Cloudflare, GitHub, LinkedIn, email, or payment tabs open unattended.

## Security Rules

- Treat Cloudflare quick tunnel noVNC as temporary only.
- Do not leave GitHub, Cloudflare, LinkedIn, email, or payment sessions open unattended.
- Do not print cookies, tokens, passwords, session IDs, or screenshots containing secrets.
- Keep noVNC bound to localhost unless a temporary tunnel is explicitly needed.
- Close the tunnel immediately after founder-assisted authentication.
- For regular use, replace quick tunnel with Cloudflare Access or a named tunnel.
