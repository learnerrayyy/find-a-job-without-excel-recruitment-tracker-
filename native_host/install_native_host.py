#!/usr/bin/env python3
from __future__ import annotations

import json
import stat
import sys
from pathlib import Path


HOST_NAME = "com.job_tracker.launcher"


def chrome_native_host_dir() -> Path:
    if sys.platform == "darwin":
        return Path.home() / "Library/Application Support/Google/Chrome/NativeMessagingHosts"
    if sys.platform.startswith("linux"):
        return Path.home() / ".config/google-chrome/NativeMessagingHosts"
    if sys.platform.startswith("win"):
        raise SystemExit("Windows needs a registry entry for Native Messaging hosts; this installer currently supports macOS/Linux.")
    raise SystemExit(f"Unsupported platform: {sys.platform}")


def main() -> None:
    extension_id = sys.argv[1].strip() if len(sys.argv) > 1 else "__EXTENSION_ID__"
    root = Path(__file__).resolve().parents[1]
    host_script = root / "native_host" / "job_tracker_launcher.py"
    if not host_script.exists():
        raise SystemExit(f"Missing host script: {host_script}")

    current_mode = host_script.stat().st_mode
    host_script.chmod(current_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    install_dir = chrome_native_host_dir()
    install_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = install_dir / f"{HOST_NAME}.json"

    manifest = {
        "name": HOST_NAME,
        "description": "Launch the local Job Tracker server for the Chrome extension.",
        "path": str(host_script),
        "type": "stdio",
        "allowed_origins": [
            f"chrome-extension://{extension_id}/"
        ],
    }

    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Installed native host manifest: {manifest_path}")
    if extension_id == "__EXTENSION_ID__":
        print("")
        print("IMPORTANT:")
        print("1. Open chrome://extensions")
        print("2. Copy the extension ID for Job Tracker Capture")
        print(f"3. Re-run: python3 native_host/install_native_host.py <EXTENSION_ID>")
        print("4. Reload the Chrome extension")
    else:
        print(f"Allowed extension: chrome-extension://{extension_id}/")
        print("Reload the Chrome extension before using Try start.")


if __name__ == "__main__":
    main()
