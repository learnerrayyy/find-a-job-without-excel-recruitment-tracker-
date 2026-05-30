#!/usr/bin/env python3
from __future__ import annotations

import json
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "tracker.db"
RESUMES_DIR = DATA_DIR / "resumes"


def now_minus(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    RESUMES_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def dump(value: object) -> str:
    return json.dumps(value, ensure_ascii=False)


DEMO_COMPANIES = ["Northstar Analytics", "Harbor Fintech", "Luma Health", "Atlas Robotics"]


def clear_demo(conn: sqlite3.Connection) -> None:
    placeholders = ",".join("?" for _ in DEMO_COMPANIES)
    conn.execute(f"DELETE FROM job_applications WHERE company_name IN ({placeholders})", DEMO_COMPANIES)
    conn.execute("DELETE FROM question_bank WHERE tags LIKE '%demo%'")
    conn.execute("DELETE FROM interview_stories WHERE tags LIKE '%demo%'")
    conn.execute("DELETE FROM company_notes WHERE tags LIKE '%demo%'")
    conn.execute("DELETE FROM resume_profiles WHERE tags LIKE '%demo%'")


def seed_profiles(conn: sqlite3.Connection) -> None:
    profiles = [
        {
            "name": "Charlotte Yu - Data Analyst",
            "tags": ["demo", "data", "analytics", "graduate"],
            "file_name": "charlotte_data_analyst_demo.txt",
            "fields": {
                "email": "charlotte.demo@example.com",
                "linkedin": "https://linkedin.com/in/charlotte-demo",
                "github": "https://github.com/charlotte-demo",
                "portfolio": "https://charlotte-demo.dev",
                "my_skills": "Python, SQL, Tableau, Excel, Pandas, A/B testing",
            },
            "text": "Charlotte Yu\nData analyst profile focused on SQL, Python, dashboards, and product analytics.",
        },
        {
            "name": "Charlotte Yu - Product Operations",
            "tags": ["demo", "ops", "crm", "process"],
            "file_name": "charlotte_product_ops_demo.txt",
            "fields": {
                "email": "charlotte.ops@example.com",
                "linkedin": "https://linkedin.com/in/charlotte-ops-demo",
                "portfolio": "https://ops.charlotte-demo.dev",
                "my_skills": "SQL, stakeholder management, process design, CRM, automation, documentation",
            },
            "text": "Charlotte Yu\nProduct operations profile focused on process improvement, CRM, and automation.",
        },
    ]
    for profile in profiles:
        path = RESUMES_DIR / profile["file_name"]
        path.write_text(profile["text"], encoding="utf-8")
        now = now_minus(0)
        conn.execute(
            """
            INSERT INTO resume_profiles
                (name, tags, file_name, file_type, file_local_path, extracted_text, parsed_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                profile["name"],
                dump(profile["tags"]),
                profile["file_name"],
                ".txt",
                str(path),
                profile["text"],
                dump(profile["fields"]),
                now,
                now,
            ),
        )


def seed_user_profile(conn: sqlite3.Connection) -> None:
    now = now_minus(0)
    fields = {
        "full_name": "Charlotte Yu",
        "first_name": "Charlotte",
        "last_name": "Yu",
        "phone": "+44 7700 900000",
        "location": "London, UK",
        "address": "Demo Street, London",
        "city": "London",
        "postcode": "E1 6AN",
        "country": "United Kingdom",
        "visa_status": "Graduate visa",
        "needs_sponsorship": "No for current visa period",
        "right_to_work": "Eligible to work in the UK",
        "my_skills": "Python, SQL, React, SQLite, automation, product analytics",
        "week_note_2026_22": "Demo week: analytics roles generated the best response rate; next week focus on follow-ups and two company-specific stories.",
    }
    conn.execute(
        """
        INSERT INTO user_profile (id, fields_json, created_at, updated_at)
        VALUES (1, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            fields_json=excluded.fields_json,
            updated_at=excluded.updated_at
        """,
        (dump(fields), now, now),
    )


def seed_question_bank(conn: sqlite3.Connection) -> None:
    rows = [
        (
            "Do you require visa sponsorship now or in the future?",
            "application",
            ["demo", "sponsorship", "uk"],
            [
                {"label": "Current answer", "content": "I currently have the right to work in the UK under my Graduate visa and do not require immediate sponsorship."},
                {"label": "Future-safe version", "content": "I am authorised to work in the UK at present. I would be happy to discuss future sponsorship requirements transparently if the process reaches offer stage."},
            ],
        ),
        (
            "Tell me about a dashboard you built and how it changed a decision.",
            "analytics",
            ["demo", "dashboard", "impact"],
            [
                {"label": "STAR outline", "content": "I built a weekly funnel dashboard, identified a drop-off in assessment completion, and helped the team prioritise reminders that improved completion by 18%."},
            ],
        ),
        (
            "Why are you interested in this company?",
            "motivation",
            ["demo", "company-fit"],
            [
                {"label": "Reusable structure", "content": "I connect the company's product, the team mission, and one specific role requirement to my previous project experience."},
            ],
        ),
    ]
    for question, category, tags, answers in rows:
        now = now_minus(0)
        conn.execute(
            """
            INSERT INTO question_bank (question, category, tags, answers_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (question, category, dump(tags), dump(answers), now, now),
        )


def seed_stories(conn: sqlite3.Connection) -> None:
    rows = [
        {
            "title": "Reduced manual tracking with a lightweight CRM",
            "tags": ["demo", "ownership", "automation", "process"],
            "situation": "A small team was tracking applications and follow-ups across scattered spreadsheets.",
            "task": "Create a clearer workflow that reduced repeated manual updates.",
            "action": "I mapped the lifecycle, separated stages from next actions, and built a local tracker with timeline events.",
            "result": "The process became easier to audit and weekly review time dropped from an hour to around 15 minutes.",
            "notes": "Use for ownership, product thinking, and process improvement questions.",
        },
        {
            "title": "Prioritised follow-ups using funnel data",
            "tags": ["demo", "analytics", "prioritisation", "stakeholder"],
            "situation": "Several active opportunities had no clear owner or next step.",
            "task": "Identify which applications needed immediate follow-up.",
            "action": "I grouped roles by stage, stale days, and next action, then created a review list for the week.",
            "result": "The team focused on high-value assessment and interview follow-ups first and avoided duplicate outreach.",
            "notes": "Use for data-driven prioritisation.",
        },
    ]
    for row in rows:
        now = now_minus(0)
        conn.execute(
            """
            INSERT INTO interview_stories
                (title, situation, task, action, result, tags, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["title"],
                row["situation"],
                row["task"],
                row["action"],
                row["result"],
                dump(row["tags"]),
                row["notes"],
                now,
                now,
            ),
        )


def seed_company_notes(conn: sqlite3.Connection) -> None:
    rows = [
        ("Northstar Analytics", "B2B SaaS", "Analytics platform for revenue teams.", "Data-informed, customer-facing, fast iteration.", "Strong fit for dashboard and CRM automation experience.", "Prepare examples about funnel metrics and stakeholder communication.", ["demo", "analytics", "saas"]),
        ("Harbor Fintech", "Fintech", "Payments and reconciliation tools for SMEs.", "Regulated, detail-oriented, operational excellence.", "Good fit for process design and data quality stories.", "Review payments vocabulary, risk controls, and SQL examples.", ["demo", "fintech", "operations"]),
        ("Luma Health", "Healthtech", "Patient engagement and scheduling platform.", "Mission-driven, privacy-conscious, cross-functional.", "Useful for product operations and user empathy examples.", "Prepare story about simplifying complex workflows.", ["demo", "healthtech", "product"]),
    ]
    for company, industry, overview, culture, why, focus, tags in rows:
        now = now_minus(0)
        conn.execute(
            """
            INSERT INTO company_notes
                (company_name, industry, overview, culture, why_interested, interview_focus, notes, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (company, industry, overview, culture, why, focus, "Demo research note.", dump(tags), now, now),
        )


def seed_jobs(conn: sqlite3.Connection) -> None:
    rows = [
        ("Northstar Analytics", "Junior Product Analyst", "FULL_TIME", "APPLIED", "APPLIED_SUCCESS", "FOLLOW_UP", 14),
        ("Harbor Fintech", "Operations Data Analyst", "FULL_TIME", "ASSESSMENT", "OA", "COMPLETE_TASK", 9),
        ("Luma Health", "Product Operations Associate", "FULL_TIME", "INTERVIEW", "INTERVIEW_1", "PREPARE", 5),
        ("Atlas Robotics", "Business Intelligence Intern", "INTERNSHIP", "SAVED", "SAVED", "APPLY", 2),
    ]
    for company, position, job_type, stage, status, next_action, age in rows:
        created = now_minus(age)
        updated = now_minus(max(age - 2, 0))
        cursor = conn.execute(
            """
            INSERT INTO job_applications
                (company_name, position_name, job_type, source_url, apply_url, jd_local_path,
                 apply_time, current_stage, status, next_action, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                company,
                position,
                job_type,
                f"https://example.com/jobs/{company.lower().replace(' ', '-')}",
                f"https://example.com/apply/{company.lower().replace(' ', '-')}",
                "",
                now_minus(age)[:10] if stage != "SAVED" else "",
                stage,
                status,
                next_action,
                created,
                updated,
            ),
        )
        job_id = cursor.lastrowid
        conn.execute(
            """
            INSERT INTO timeline_events
                (job_application_id, event_type, event_title, event_time, source, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (job_id, "created", "Demo role added", created, "demo", "Seeded realistic demo role.", created),
        )
        if stage != "SAVED":
            conn.execute(
                """
                INSERT INTO timeline_events
                    (job_application_id, event_type, event_title, event_time, source, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (job_id, "status_change", f"Moved to {stage}", updated, "demo", f"Current demo status: {status}", updated),
            )


def main() -> None:
    sys.path.insert(0, str(ROOT))
    import server  # pylint: disable=import-outside-toplevel

    server.init_db()
    with connect() as conn:
        clear_demo(conn)
        seed_user_profile(conn)
        seed_profiles(conn)
        seed_question_bank(conn)
        seed_stories(conn)
        seed_company_notes(conn)
        seed_jobs(conn)
    print("Demo data seeded: profiles, questions, stories, company notes, jobs, and timeline events.")


if __name__ == "__main__":
    main()
