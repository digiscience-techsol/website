# DigiBot Browser Operations

Date: 2026-05-25

## Official Operating Path

Chosen path: Option B - manual Chromium + CDP + noVNC.

OpenClaw managed browser automation is installed, but it is not currently attached to the visual noVNC browser session. For login/auth workflows, DigiBot will use a manually launched Chromium browser running inside Xvfb, controlled through Chrome DevTools Protocol and shared visually through noVNC.

## Runtime Details

- Start script: `/data/.openclaw/workspace/scripts/start-visual-browser-novnc.sh`
- Display: `:99`
- Browser: `/usr/bin/chromium`
- Browser profile path: `/data/.openclaw/browser/openclaw/user-data`
- CDP endpoint: `http://127.0.0.1:18800`
- VNC port: `127.0.0.1:5900`
- noVNC port: `127.0.0.1:6080`
- Tunnel method: temporary Cloudflare quick tunnel created with `cloudflared tunnel --protocol http2 --url http://127.0.0.1:6080 --no-autoupdate`

## Start Safely

Run:

```bash
/data/.openclaw/workspace/scripts/start-visual-browser-novnc.sh
```

For sensitive login work, ensure VNC password authentication is enabled before exposing noVNC through any tunnel. The password file must remain local under `/data/.openclaw/secrets/` and must not be posted in Telegram, committed to Git, or copied into logs.

## Close After Auth

After login/auth/cache-purge work is complete, close the public tunnel and stop shared noVNC exposure:

```bash
pkill -f 'cloudflared tunnel --url http://127.0.0.1:6080' || true
pkill -f 'websockify.*6080' || true
pkill -f 'x11vnc.*5900' || true
```

Leave Chromium running only if an active workflow needs the same session. Otherwise close any sensitive tabs and stop Chromium:

```bash
pkill -f 'chromium.*--remote-debugging-port=18800' || true
```

## Security Rules

- Treat the Cloudflare quick tunnel as temporary only.
- Do not leave LinkedIn, GitHub, Cloudflare, email, or customer systems open unattended.
- Do not print cookies, tokens, passwords, OTPs, session IDs, private URLs, or screenshots containing secrets.
- Use noVNC only for active login/auth windows.
- Prefer Cloudflare Access, a named tunnel, firewall allowlist, VPN, or another authenticated private access path before regular browser operations.
- Do not ask Raj for passwords or tokens in Telegram.

## Current Acceptance

This is an operational workaround, not a fully integrated OpenClaw managed-browser setup. It is acceptable for temporary authenticated browser work only when explicitly requested and actively supervised.
