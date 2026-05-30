#!/usr/bin/env python3
from __future__ import annotations

import json
import struct
import subprocess
import sys
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "server.py"
LOG = ROOT / "data" / "native_host.log"
PORT_URL = "http://127.0.0.1:8765/api/jobs"


def read_message() -> dict:
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        raise EOFError
    message_length = struct.unpack("@I", raw_length)[0]
    return json.loads(sys.stdin.buffer.read(message_length).decode("utf-8"))


def send_message(message: dict) -> None:
    encoded = json.dumps(message).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("@I", len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def server_is_ready() -> bool:
    try:
        with urllib.request.urlopen(PORT_URL, timeout=0.5) as response:
            return 200 <= response.status < 500
    except Exception:
        return False


def start_server() -> dict:
    if server_is_ready():
        return {"ok": True, "already_running": True}

    if not SERVER.exists():
        return {"ok": False, "error": f"server.py not found at {SERVER}"}

    LOG.parent.mkdir(exist_ok=True)
    log_file = LOG.open("ab")
    subprocess.Popen(
        [sys.executable, str(SERVER)],
        cwd=str(ROOT),
        stdout=log_file,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    return {"ok": True, "already_running": False}


def main() -> None:
    try:
        message = read_message()
    except EOFError:
        return

    action = message.get("action")
    if action == "start_server":
        send_message(start_server())
    else:
        send_message({"ok": False, "error": f"Unknown action: {action}"})


if __name__ == "__main__":
    main()
