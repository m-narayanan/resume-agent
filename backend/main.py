"""
Resume Agent Backend - FastAPI + Groq (llama-3.3-70b-versatile) + web search
"""

import os, json, re, io
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import pdfplumber
import docx

load_dotenv()

app = FastAPI(title="Resume Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:3000",
        "http://127.0.0.1:5173", "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PRIVATE_ACCESS_TOKEN = os.getenv("PRIVATE_ACCESS_TOKEN", "change-me-before-use")
client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


# ── Auth ──────────────────────────────────────────────────────────────────────
def verify_token(x_access_token: str = Header(...)):
    if x_access_token != PRIVATE_ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ── Models ────────────────────────────────────────────────────────────────────
class ExistingProject(BaseModel):
    name: str
    description: str
    tech_stack: Optional[List[str]] = []
    impact: Optional[str] = ""

class AnalyzeRequest(BaseModel):
    job_description: str
    company_name: str
    company_url: Optional[str] = ""
    role_title: Optional[str] = ""
    existing_skills: Optional[List[str]] = []
    existing_projects: Optional[List[ExistingProject]] = []
    experience_level: Optional[str] = "fresher"


# ── System Prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an elite resume optimization agent for fresher job seekers.
You have deep expertise in ATS optimization, tech hiring, company research, and helping freshers
craft resumes that genuinely demonstrate competence.

CORE PRINCIPLES:
1. Only suggest REAL, LEARNABLE skills — no inflation, no lies
2. Projects must be genuinely buildable by a fresher in 1-4 weeks
3. ATS keywords appear naturally, not stuffed
4. Be company-specific — generic advice is useless
5. Think like a senior engineer reviewing the resume

You MUST return ONLY a valid JSON object — no markdown, no explanation, no text before or after the JSON.

Return this EXACT structure:
{
  "company_insights": {
    "culture": "what they value culturally",
    "tech_focus": "their current technical priorities and stack",
    "interview_style": "how they interview freshers",
    "differentiators": ["unique things about this company"],
    "insider_tips": ["actionable tips"],
    "red_flags_to_address": ["concerns about fresher candidates to counter"]
  },
  "ats_keywords": {
    "critical": ["must-have keywords from JD"],
    "important": ["nice-to-have keywords"],
    "hidden": ["implied skills not stated but needed"],
    "action_verbs": ["strong verbs to use"]
  },
  "skills_section": {
    "recommended_skills": [
      {
        "category": "e.g. Programming Languages",
        "skills": ["skill1", "skill2"],
        "priority": "high",
        "why": "reason this matters for this role"
      }
    ],
    "existing_skills_evaluation": [
      {
        "skill": "skill name",
        "verdict": "keep",
        "suggestion": "advice",
        "replacement": ""
      }
    ],
    "skills_to_avoid_listing": ["skills that hurt more than help"]
  },
  "projects_section": {
    "recommended_projects": [
      {
        "title": "project name",
        "tagline": "one-line pitch",
        "resume_description": "2-3 sentence resume-ready description with action verbs and metrics",
        "tech_stack": ["tech1", "tech2"],
        "core_features": ["feature showing skill X"],
        "ats_keywords_covered": ["keywords this demonstrates"],
        "build_time_estimate": "2 weeks",
        "difficulty": "intermediate",
        "why_this_company_loves_it": "specific reason",
        "github_readme_highlights": "what to highlight",
        "stretch_features": ["bonus feature"]
      }
    ],
    "existing_projects_evaluation": [
      {
        "project_name": "name",
        "current_score": "6/10",
        "weaknesses": ["what is weak"],
        "improved_resume_description": "rewritten stronger version",
        "code_additions_suggested": ["features to add"],
        "ats_keywords_to_embed": ["keywords to add"]
      }
    ]
  },
  "cover_letter_hooks": ["specific talking point from research"],
  "quick_wins": ["immediate action to take"],
  "resume_summary": "2-3 sentence professional summary for this role"
}"""


# ── Helpers ───────────────────────────────────────────────────────────────────
def parse_json_response(text: str) -> dict:
    # Strip markdown code fences
    text = re.sub(r'```(?:json)?', '', text).replace('```', '').strip()
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Find outermost braces
    try:
        start, end = text.find('{'), text.rfind('}') + 1
        if start != -1 and end > start:
            return json.loads(text[start:end])
    except json.JSONDecodeError:
        pass
    return {"raw_response": text, "parse_error": True}


def chat(system: str, user: str, max_tokens: int = 6000) -> str:
    """Simple wrapper around Groq chat completion."""
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=0.7,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
    )
    return response.choices[0].message.content or ""


# ── Agent: Research + Analyze ─────────────────────────────────────────────────
def run_agent(request: AnalyzeRequest) -> dict:
    """
    Two-step agent:
    Step 1 — Research the company (separate call so it has full token budget)
    Step 2 — Generate resume optimization using research + JD
    """

    # ── Step 1: Company Research ──
    research_prompt = f"""Research the company "{request.company_name}" for a fresher job seeker applying as "{request.role_title or 'Software Engineer'}".

Based on your knowledge, provide detailed insights about:
1. Company culture, values, and work environment
2. Their technology stack and engineering practices
3. How they interview freshers — typical rounds, question types, difficulty
4. What they look for in entry-level candidates
5. Recent focus areas, products, or strategic direction
6. Any known insider tips from interview/employee experiences
7. Salary range and growth opportunities for freshers

Be specific and detailed. This is for resume tailoring."""

    research = chat(
        system="You are a company research expert with deep knowledge of tech companies, their hiring practices, and culture. Provide detailed, specific, accurate information.",
        user=research_prompt,
        max_tokens=2000
    )

    # ── Step 2: Full Resume Analysis ──
    existing_skills_text = ""
    if request.existing_skills:
        existing_skills_text = f"\n\nCANDIDATE'S CURRENT SKILLS: {', '.join(request.existing_skills)}"

    existing_projects_text = ""
    if request.existing_projects:
        proj_list = "\n".join([
            f"  • {p.name}: {p.description} | Stack: {', '.join(p.tech_stack)} | Impact: {p.impact or 'not mentioned'}"
            for p in request.existing_projects
        ])
        existing_projects_text = f"\n\nCANDIDATE'S CURRENT PROJECTS:\n{proj_list}"

    analysis_prompt = f"""COMPANY: {request.company_name}
ROLE: {request.role_title or 'Software Engineer'}
CANDIDATE LEVEL: {request.experience_level}

COMPANY RESEARCH (use this to personalize recommendations):
{research}

JOB DESCRIPTION:
---
{request.job_description}
---
{existing_skills_text}
{existing_projects_text}

Now generate the complete resume optimization JSON. Be specific to {request.company_name} — not generic.
For recommended projects, make them impressive yet genuinely buildable by a fresher.
Include realistic resume descriptions with action verbs and plausible metrics.

Return ONLY the JSON object, nothing else."""

    result_text = chat(SYSTEM_PROMPT, analysis_prompt, max_tokens=6000)
    return parse_json_response(result_text)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest, authenticated: bool = Depends(verify_token)):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    if len(request.job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")
    if not request.company_name.strip():
        raise HTTPException(status_code=400, detail="Company name required")
    try:
        result = run_agent(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/parse-resume")
async def parse_resume(
    file: UploadFile = File(...),
    authenticated: bool = Depends(verify_token)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    ext = file.filename.lower().split(".")[-1]
    if ext not in ["pdf", "docx", "doc"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")

    content = await file.read()
    raw_text = ""

    try:
        if ext == "pdf":
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                raw_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        else:
            doc = docx.Document(io.BytesIO(content))
            raw_text = "\n".join(para.text for para in doc.paragraphs)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Try copy-pasting instead.")

    result_text = chat(
        system="You are a resume parser. Extract structured data and return ONLY valid JSON, no other text.",
        user=f"""Parse this resume and return ONLY this JSON structure:
{{
  "name": "full name or empty string",
  "email": "email or empty string",
  "education": "degree, college, year",
  "experience": "internships or work experience summary",
  "skills": ["every", "technical", "skill", "mentioned"],
  "projects": [
    {{
      "name": "project name",
      "description": "what it does",
      "tech_stack": ["tech1", "tech2"],
      "impact": "metrics or results if any"
    }}
  ]
}}

RESUME:
{raw_text[:5000]}""",
        max_tokens=2000
    )

    parsed = parse_json_response(result_text)
    return {"success": True, "data": parsed}


@app.post("/api/improve-description")
async def improve_description(payload: dict, authenticated: bool = Depends(verify_token)):
    desc = payload.get("description", "")
    role = payload.get("role_context", "software engineering")
    company = payload.get("company", "the company")
    if not desc:
        raise HTTPException(status_code=400, detail="Description required")

    improved = chat(
        system="You are a resume writing expert. Return ONLY the rewritten description, no explanation.",
        user=f"""Rewrite this fresher project description for a {role} role at {company}.

Original: {desc}

Rules:
- Start with a strong action verb (Built, Developed, Engineered, Designed)
- Add realistic metrics (e.g. 40% faster, 500 users, 99.9% uptime)
- Embed relevant keywords naturally
- 2-3 sentences max
- Show real technical depth""",
        max_tokens=400
    )
    return {"improved_description": improved.strip()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)