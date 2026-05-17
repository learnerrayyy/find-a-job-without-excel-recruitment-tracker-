from __future__ import annotations

import json
import mimetypes
import re
import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
JOBS_DIR = DATA_DIR / "jobs"
DB_PATH = DATA_DIR / "tracker.db"
WEB_DIR = ROOT / "web"

STATUSES = {
    "DISCOVERED",
    "SAVED",
    "APPLIED",
    "OA",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "GHOSTED",
    "WITHDRAWN",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "job"


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS job_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                position_name TEXT NOT NULL,
                source_url TEXT,
                apply_url TEXT,
                jd_local_path TEXT,
                html_local_path TEXT,
                screenshot_local_path TEXT,
                apply_time TEXT,
                current_stage TEXT NOT NULL DEFAULT 'SAVED',
                status TEXT NOT NULL DEFAULT 'SAVED',
                latest_email_id INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS timeline_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_application_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                event_title TEXT NOT NULL,
                event_time TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'manual',
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (job_application_id)
                    REFERENCES job_applications(id)
                    ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS email_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_application_id INTEGER,
                provider TEXT,
                provider_message_id TEXT,
                sender TEXT,
                subject TEXT,
                received_at TEXT,
                email_type TEXT,
                raw_content TEXT,
                is_read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (job_application_id)
                    REFERENCES job_applications(id)
                    ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS idx_jobs_status
                ON job_applications(status);
            CREATE INDEX IF NOT EXISTS idx_timeline_job
                ON timeline_events(job_application_id);
            """
        )


def row_to_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}


def markdown_for_job(payload: dict) -> str:
    company = payload.get("company_name", "").strip()
    position = payload.get("position_name", "").strip()
    status = payload.get("status", "SAVED").strip() or "SAVED"
    source_url = payload.get("source_url", "").strip()
    apply_url = payload.get("apply_url", "").strip()
    jd_content = payload.get("jd_content", "").strip()

    return "\n".join(
        [
            "---",
            f"company: {company}",
            f"position: {position}",
            f"status: {status}",
            f"source_url: {source_url}",
            f"apply_url: {apply_url}",
            "---",
            "",
            f"# {company} - {position}",
            "",
            "## Links",
            "",
            f"- Source: {source_url or 'N/A'}",
            f"- Apply: {apply_url or 'N/A'}",
            "",
            "## Job Description",
            "",
            jd_content or "_No JD content saved yet._",
            "",
        ]
    )


def save_job_files(payload: dict) -> tuple[str, str]:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_name = "_".join(
        [
            slugify(payload.get("company_name", "")),
            slugify(payload.get("position_name", "")),
            timestamp,
        ]
    )
    job_dir = JOBS_DIR / folder_name
    job_dir.mkdir(parents=True, exist_ok=True)

    md_path = job_dir / "jd.md"
    html_path = job_dir / "jd.html"
    md_path.write_text(markdown_for_job(payload), encoding="utf-8")
    html_path.write_text(
        payload.get("html_content") or "<!doctype html><title>JD backup</title>",
        encoding="utf-8",
    )
    return str(md_path.relative_to(ROOT)), str(html_path.relative_to(ROOT))


def job_matches_search(job: dict, search: str) -> bool:
    if not search:
        return True
    haystack = " ".join(
        str(job.get(key) or "")
        for key in ("company_name", "position_name", "source_url", "apply_url")
    ).lower()
    needle = search.lower()
    if needle in haystack:
        return True
    jd_path = job.get("jd_local_path")
    if not jd_path:
        return False
    target = (ROOT / jd_path).resolve()
    if not str(target).startswith(str(JOBS_DIR.resolve())) or not target.exists():
        return False
    return needle in target.read_text(encoding="utf-8", errors="ignore").lower()


class Handler(BaseHTTPRequestHandler):
    server_version = "JobTrackerMVP/0.1"

    def log_message(self, fmt: str, *args: object) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message: str, status: int = 400) -> None:
        self.send_json({"error": message}, status)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == "/api/jobs":
            self.list_jobs(parse_qs(parsed.query))
            return
        if path.startswith("/api/jobs/"):
            parts = path.strip("/").split("/")
            if len(parts) == 3 and parts[2].isdigit():
                self.get_job(int(parts[2]))
                return
            if len(parts) == 4 and parts[2].isdigit() and parts[3] == "timeline":
                self.list_timeline(int(parts[2]))
                return
            if len(parts) == 4 and parts[2].isdigit() and parts[3] == "jd":
                self.serve_jd(int(parts[2]))
                return

        self.serve_static(path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        if path == "/api/jobs":
            self.create_job()
            return
        if path.startswith("/api/jobs/"):
            parts = path.strip("/").split("/")
            if len(parts) == 4 and parts[2].isdigit() and parts[3] == "timeline":
                self.create_timeline(int(parts[2]))
                return
        self.send_error_json("Not found", HTTPStatus.NOT_FOUND)

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        parts = path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "jobs" and parts[2].isdigit():
            self.update_job(int(parts[2]))
            return
        self.send_error_json("Not found", HTTPStatus.NOT_FOUND)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        parts = unquote(parsed.path).strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "jobs" and parts[2].isdigit():
            job_id = int(parts[2])
            with db() as conn:
                row = conn.execute(
                    "SELECT jd_local_path FROM job_applications WHERE id = ?", (job_id,)
                ).fetchone()
                conn.execute("DELETE FROM job_applications WHERE id = ?", (job_id,))
            if row and row["jd_local_path"]:
                target = (ROOT / row["jd_local_path"]).resolve()
                if str(target).startswith(str(JOBS_DIR.resolve())) and target.exists():
                    shutil.rmtree(target.parent, ignore_errors=True)
            self.send_json({"ok": True})
            return
        self.send_error_json("Not found", HTTPStatus.NOT_FOUND)

    def serve_static(self, path: str) -> None:
        if path == "/":
            path = "/index.html"
        target = (WEB_DIR / path.lstrip("/")).resolve()
        if not str(target).startswith(str(WEB_DIR.resolve())) or not target.exists():
            self.send_response(HTTPStatus.NOT_FOUND)
            self.end_headers()
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        body = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def list_jobs(self, query: dict) -> None:
        search = (query.get("q", [""])[0] or "").strip()
        status = (query.get("status", [""])[0] or "").strip()
        sql = """
            SELECT j.*,
                   (
                     SELECT COUNT(*)
                     FROM timeline_events t
                     WHERE t.job_application_id = j.id
                   ) AS timeline_count
            FROM job_applications j
            WHERE 1 = 1
        """
        params: list[str] = []
        if status:
            sql += " AND j.status = ?"
            params.append(status)
        sql += " ORDER BY j.updated_at DESC"
        with db() as conn:
            rows = conn.execute(sql, params).fetchall()
        jobs = [row_to_dict(row) for row in rows]
        if search:
            jobs = [job for job in jobs if job_matches_search(job, search)]
        self.send_json(jobs)

    def get_job(self, job_id: int) -> None:
        with db() as conn:
            row = conn.execute("SELECT * FROM job_applications WHERE id = ?", (job_id,)).fetchone()
        if not row:
            self.send_error_json("Job not found", HTTPStatus.NOT_FOUND)
            return
        self.send_json(row_to_dict(row))

    def create_job(self) -> None:
        payload = self.read_json()
        company = payload.get("company_name", "").strip()
        position = payload.get("position_name", "").strip()
        if not company or not position:
            self.send_error_json("company_name and position_name are required")
            return
        status = payload.get("status", "SAVED").strip() or "SAVED"
        if status not in STATUSES:
            self.send_error_json(f"Invalid status: {status}")
            return

        md_path, html_path = save_job_files({**payload, "status": status})
        now = utc_now()
        with db() as conn:
            cur = conn.execute(
                """
                INSERT INTO job_applications (
                    company_name, position_name, source_url, apply_url,
                    jd_local_path, html_local_path, apply_time,
                    current_stage, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    company,
                    position,
                    payload.get("source_url", "").strip(),
                    payload.get("apply_url", "").strip(),
                    md_path,
                    html_path,
                    payload.get("apply_time", "").strip(),
                    status,
                    status,
                    now,
                    now,
                ),
            )
            job_id = cur.lastrowid
            conn.execute(
                """
                INSERT INTO timeline_events (
                    job_application_id, event_type, event_title,
                    event_time, source, notes, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (job_id, "SAVED", "岗位已保存", now, "manual", "", now),
            )
        self.get_job(job_id)

    def update_job(self, job_id: int) -> None:
        payload = self.read_json()
        allowed = {
            "company_name",
            "position_name",
            "source_url",
            "apply_url",
            "apply_time",
            "status",
        }
        updates = {key: payload[key] for key in allowed if key in payload}
        if "status" in updates and updates["status"] not in STATUSES:
            self.send_error_json(f"Invalid status: {updates['status']}")
            return
        if not updates:
            self.send_error_json("No supported fields to update")
            return
        updates["updated_at"] = utc_now()
        if "status" in updates:
            updates["current_stage"] = updates["status"]

        assignments = ", ".join([f"{key} = ?" for key in updates.keys()])
        params = list(updates.values()) + [job_id]
        with db() as conn:
            existing = conn.execute(
                "SELECT status FROM job_applications WHERE id = ?", (job_id,)
            ).fetchone()
            if not existing:
                self.send_error_json("Job not found", HTTPStatus.NOT_FOUND)
                return
            conn.execute(f"UPDATE job_applications SET {assignments} WHERE id = ?", params)
            if "status" in updates and updates["status"] != existing["status"]:
                now = utc_now()
                conn.execute(
                    """
                    INSERT INTO timeline_events (
                        job_application_id, event_type, event_title,
                        event_time, source, notes, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        job_id,
                        "STATUS_CHANGE",
                        f"状态更新为 {updates['status']}",
                        now,
                        "manual",
                        "",
                        now,
                    ),
                )
        self.get_job(job_id)

    def list_timeline(self, job_id: int) -> None:
        with db() as conn:
            rows = conn.execute(
                """
                SELECT *
                FROM timeline_events
                WHERE job_application_id = ?
                ORDER BY event_time DESC, id DESC
                """,
                (job_id,),
            ).fetchall()
        self.send_json([row_to_dict(row) for row in rows])

    def create_timeline(self, job_id: int) -> None:
        payload = self.read_json()
        event_title = payload.get("event_title", "").strip()
        if not event_title:
            self.send_error_json("event_title is required")
            return
        now = utc_now()
        with db() as conn:
            exists = conn.execute(
                "SELECT id FROM job_applications WHERE id = ?", (job_id,)
            ).fetchone()
            if not exists:
                self.send_error_json("Job not found", HTTPStatus.NOT_FOUND)
                return
            conn.execute(
                """
                INSERT INTO timeline_events (
                    job_application_id, event_type, event_title,
                    event_time, source, notes, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job_id,
                    payload.get("event_type", "NOTE").strip() or "NOTE",
                    event_title,
                    payload.get("event_time", "").strip() or now,
                    payload.get("source", "manual").strip() or "manual",
                    payload.get("notes", "").strip(),
                    now,
                ),
            )
            conn.execute(
                "UPDATE job_applications SET updated_at = ? WHERE id = ?",
                (now, job_id),
            )
        self.list_timeline(job_id)

    def serve_jd(self, job_id: int) -> None:
        with db() as conn:
            row = conn.execute(
                "SELECT jd_local_path FROM job_applications WHERE id = ?", (job_id,)
            ).fetchone()
        if not row or not row["jd_local_path"]:
            self.send_error_json("JD not found", HTTPStatus.NOT_FOUND)
            return
        target = (ROOT / row["jd_local_path"]).resolve()
        if not str(target).startswith(str(JOBS_DIR.resolve())) or not target.exists():
            self.send_error_json("JD file missing", HTTPStatus.NOT_FOUND)
            return
        body = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/markdown; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    init_db()
    port = 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Job Tracker MVP running at http://127.0.0.1:{port}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()
