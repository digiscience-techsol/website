#!/usr/bin/env bash
set -euo pipefail

DISPLAY_ID="${DISPLAY_ID:-99}"
DISPLAY=":${DISPLAY_ID}"
VNC_PORT="${VNC_PORT:-5900}"
NOVNC_PORT="${NOVNC_PORT:-6080}"
CDP_PORT="${CDP_PORT:-18800}"

stop_matching() {
  local pattern="$1"
  ps -eo pid=,ppid=,cmd= | awk -v pat="${pattern}" -v self="$$" -v parent="${PPID}" '$1 != self && $1 != parent && $0 ~ pat {print $1}' | while read -r pid; do
    kill "${pid}" 2>/dev/null || true
  done
}

stop_matching "cloudflared tunnel.*127.0.0.1:${NOVNC_PORT}"
stop_matching "websockify.*${NOVNC_PORT}"
stop_matching "x11vnc.*${VNC_PORT}"
stop_matching "chromium.*--remote-debugging-port=${CDP_PORT}"
stop_matching "^ *[0-9]+ +[0-9]+ +openbox"
stop_matching "Xvfb ${DISPLAY}"

printf 'Visual browser/noVNC stopped\n'
