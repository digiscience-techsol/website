import json
import os
import re
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from faster_whisper import WhisperModel

ROOT = Path(os.environ.get("RECORDINGS_ROOT", "/var/lib/vexa/recordings"))
TG_URL = os.environ["TELEGRAM_ALERT_URL"]
TG_SECRET = os.environ["TELEGRAM_ALERT_SECRET"]
STATE_DIR = Path("/state")
STATE_DIR.mkdir(parents=True, exist_ok=True)
TRANSCRIPT_DIR = STATE_DIR / "transcripts"
TRANSCRIPT_DIR.mkdir(exist_ok=True)
EXPORT_DIR = STATE_DIR / "recordings"
EXPORT_DIR.mkdir(exist_ok=True)
STATE_FILE = STATE_DIR / "state.json"
POLL = int(os.environ.get("POLL_SECONDS", "8"))
QUESTION_RE = re.compile(r"\b(what|why|how|when|where|who|which|can|could|should|would|timeline|cost|price|budget|proposal|requirement|security|hosting|maintenance)\b", re.I)
SILENCE_RE = re.compile(r"^(you|thank you|thanks|okay|ok|uh|um|hmm|yes|no|hello|hi)[\s.,!?-]*$", re.I)


def utcnow():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"files": {}, "exported": {}}


state = load_state()
state.setdefault("files", {})
state.setdefault("exported", {})


def save_state():
    tmp = STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True))
    tmp.replace(STATE_FILE)


def send_telegram(text):
    try:
        requests.post(TG_URL, headers={"x-alert-secret": TG_SECRET, "content-type": "application/json"}, json={"text": text[:3900]}, timeout=12)
    except Exception as exc:
        print("telegram_error", repr(exc), flush=True)


def all_audio_files():
    return sorted((ROOT / "recordings").glob("*/*/*/audio/*.webm"))


def rec_key(path):
    parts = path.parts
    try:
        i = parts.index("recordings")
        return f"user-{parts[i+1]}-rec-{parts[i+2]}-session-{parts[i+3]}"
    except Exception:
        return path.parent.parent.name


def is_stable(path):
    try:
        stat = path.stat()
    except FileNotFoundError:
        return False
    return stat.st_size > 2500 and time.time() - stat.st_mtime > 4


def transcribe_file(model, path):
    segments, _ = model.transcribe(str(path), language="en", vad_filter=True, beam_size=1)
    text = " ".join(s.text.strip() for s in segments if s.text and s.text.strip()).strip()
    return re.sub(r"\s+", " ", text)


def append_transcript(key, chunk, text):
    with (TRANSCRIPT_DIR / f"{key}.txt").open("a") as handle:
        handle.write(f"[{utcnow()}] {chunk}: {text}\n")


def export_recording(key, files):
    if key in state["exported"] or not files:
        return
    latest = max(path.stat().st_mtime for path in files)
    if time.time() - latest < 75:
        return
    output = EXPORT_DIR / f"{key}.webm"
    list_file = None
    try:
        with tempfile.NamedTemporaryFile("w", delete=False) as handle:
            list_file = handle.name
            for path in files:
                handle.write("file '" + str(path).replace("'", "'\\''") + "'\n")
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-vn", "-c:a", "libopus", str(output)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
        if output.exists() and output.stat().st_size > 0:
            state["exported"][key] = str(output)
            send_telegram(f"Recording exported: {key}. Transcript: /state/transcripts/{key}.txt")
    except Exception as exc:
        print("export_error", key, repr(exc), flush=True)
    finally:
        if list_file:
            try:
                os.unlink(list_file)
            except OSError:
                pass


def main():
    print("Loading Whisper", flush=True)
    model = WhisperModel(os.environ.get("WHISPER_MODEL_SIZE", "tiny"), device="cpu", compute_type="int8", download_root="/state/whisper")
    send_telegram("Direct audio watcher is online: local Whisper will transcribe new Vexa recording chunks and send Telegram alerts.")
    while True:
        try:
            groups = {}
            for path in all_audio_files():
                key = rec_key(path)
                groups.setdefault(key, []).append(path)
                file_key = str(path)
                if file_key in state["files"] or not is_stable(path):
                    continue
                text = transcribe_file(model, path)
                state["files"][file_key] = {"recording": key, "text": text, "bytes": path.stat().st_size, "at": utcnow()}
                if text and len(text) >= 5 and not SILENCE_RE.match(text):
                    append_transcript(key, path.name, text)
                    send_telegram(f"Live transcript [{key}]: {text}")
                    if "?" in text or QUESTION_RE.search(text):
                        send_telegram("Copilot prompt: acknowledge this point, answer only what is known, and ask for exact scope, timeline, integrations, and success criteria.")
            for key, files in groups.items():
                export_recording(key, files)
            save_state()
        except Exception as exc:
            print("loop_error", repr(exc), flush=True)
        time.sleep(POLL)


if __name__ == "__main__":
    main()
