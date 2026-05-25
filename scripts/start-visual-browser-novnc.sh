#!/usr/bin/env bash
set -euo pipefail

DISPLAY_ID="${DISPLAY_ID:-99}"
DISPLAY=":${DISPLAY_ID}"
GEOMETRY="${GEOMETRY:-1366x768x24}"
VNC_PORT="${VNC_PORT:-5900}"
NOVNC_PORT="${NOVNC_PORT:-6080}"
CDP_PORT="${CDP_PORT:-18800}"
STATE_DIR="${OPENCLAW_STATE_DIR:-/data/.openclaw}"
PROFILE_DIR="${BROWSER_PROFILE_DIR:-${STATE_DIR}/browser/openclaw/user-data}"
LOG_DIR="${STATE_DIR}/logs"
RUN_DIR="${STATE_DIR}/run"
NOVNC_BIND="${NOVNC_BIND:-127.0.0.1}"
START_TUNNEL="${START_TUNNEL:-0}"
TUNNEL_LOG="${RUN_DIR}/cloudflared-visual-browser.log"

mkdir -p "${LOG_DIR}" "${PROFILE_DIR}" "${RUN_DIR}"

stop_matching() {
  local pattern="$1"
  ps -eo pid=,ppid=,cmd= | awk -v pat="${pattern}" -v self="$$" -v parent="${PPID}" '$1 != self && $1 != parent && $0 ~ pat {print $1}' | while read -r pid; do
    kill "${pid}" 2>/dev/null || true
  done
}

stop_matching "chromium.*--remote-debugging-port=${CDP_PORT}"
stop_matching "Xvfb ${DISPLAY}"
stop_matching "x11vnc.*${VNC_PORT}"
stop_matching "websockify.*${NOVNC_PORT}"
stop_matching "^ *[0-9]+ +[0-9]+ +openbox"
stop_matching "cloudflared tunnel.*127.0.0.1:${NOVNC_PORT}"

setsid Xvfb "${DISPLAY}" -screen 0 "${GEOMETRY}" -ac -nolisten tcp >"${LOG_DIR}/xvfb-visual-browser.log" 2>&1 < /dev/null &
sleep 1

DISPLAY="${DISPLAY}" setsid openbox >"${LOG_DIR}/openbox-visual-browser.log" 2>&1 < /dev/null &

DISPLAY="${DISPLAY}" setsid chromium \
  --show-component-extension-options \
  --enable-gpu-rasterization \
  --no-default-browser-check \
  --disable-pings \
  --media-router=0 \
  --disable-dev-shm-usage \
  --enable-remote-extensions \
  --load-extension= \
  "--remote-debugging-port=${CDP_PORT}" \
  "--user-data-dir=${PROFILE_DIR}" \
  --no-first-run \
  --no-default-browser-check \
  --disable-sync \
  --disable-background-networking \
  --disable-component-update \
  --disable-features=Translate,MediaRouter \
  --disable-session-crashed-bubble \
  --hide-crash-restore-bubble \
  --password-store=basic \
  --no-sandbox \
  --disable-dev-shm-usage \
  --no-proxy-server \
  https://digisciencetechsol.com/ >"${LOG_DIR}/chromium-visual-browser.log" 2>&1 < /dev/null &

sleep 2

setsid x11vnc -display "${DISPLAY}" -rfbport "${VNC_PORT}" -localhost -forever -shared -nopw \
  >"${LOG_DIR}/x11vnc-visual-browser.log" 2>&1 < /dev/null &

setsid websockify --web=/usr/share/novnc/ "${NOVNC_BIND}:${NOVNC_PORT}" "127.0.0.1:${VNC_PORT}" \
  >"${LOG_DIR}/novnc-visual-browser.log" 2>&1 < /dev/null &

sleep 1

if [[ "${START_TUNNEL}" == "1" ]]; then
  : >"${TUNNEL_LOG}"
  setsid cloudflared tunnel --protocol http2 --url "http://127.0.0.1:${NOVNC_PORT}" --no-autoupdate \
    >"${TUNNEL_LOG}" 2>&1 < /dev/null &
  sleep 8
fi

printf 'Visual browser started\n'
printf 'DISPLAY=%s\n' "${DISPLAY}"
printf 'CDP=http://127.0.0.1:%s\n' "${CDP_PORT}"
printf 'noVNC=http://%s:%s/vnc.html?autoconnect=1&resize=scale\n' "${NOVNC_BIND}" "${NOVNC_PORT}"
if [[ "${START_TUNNEL}" == "1" ]]; then
  printf 'temporary tunnel='
  grep -Eo 'https://[-a-zA-Z0-9.]+trycloudflare.com' "${TUNNEL_LOG}" | tail -1 || true
fi
