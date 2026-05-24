from __future__ import annotations

import json
import sys
import tempfile
import threading
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import server


def request(base: str, method: str, path: str, payload: dict | None = None) -> dict:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{base}{path}",
        data=body,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        server.ROOT = root
        server.DATA_DIR = root / "data"
        server.JOBS_DIR = server.DATA_DIR / "jobs"
        server.RESUMES_DIR = server.DATA_DIR / "resumes"
        server.DB_PATH = server.DATA_DIR / "tracker.db"
        server.init_db()

        httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{httpd.server_port}"
        try:
            job = request(base, "POST", "/api/jobs", {
                "company_name": "Smoke Co",
                "position_name": "Product Analyst",
                "current_stage": "SAVED",
                "status": "SAVED",
                "next_action": "DECIDE",
            })
            assert job["next_action"] == "DECIDE"

            updated = request(base, "PATCH", f"/api/jobs/{job['id']}", {"status": "OA"})
            assert updated["current_stage"] == "ASSESSMENT"
            assert updated["next_action"] == "PREPARE"

            updated = request(base, "PATCH", f"/api/jobs/{job['id']}", {"next_action": "ARCHIVE"})
            assert updated["next_action"] == "ARCHIVE"

            profile = request(base, "PATCH", "/api/user-profile", {
                "review_note_2026-05-24": "Daily note",
                "week_note_2026_21": "Weekly note",
            })
            assert profile["review_note_2026-05-24"] == "Daily note"
            assert profile["week_note_2026_21"] == "Weekly note"

            day = request(base, "GET", "/api/calendar-day?date=2026-05-24")
            assert "timeline_events" in day
        finally:
            httpd.shutdown()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
