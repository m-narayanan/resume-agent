import { useState, useRef } from 'react'
import { Plus, X, Briefcase, Building2, Code2, FolderGit2, ChevronDown, Sparkles, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react'

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN || 'your-strong-secret-token-here'

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    job_description: '',
    company_name: '',
    company_url: '',
    role_title: '',
    experience_level: 'fresher',
    existing_skills: [],
    existing_projects: [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [showProjects, setShowProjects] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', tech_stack: '', impact: '' })

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeParsed, setResumeParsed] = useState(null)
  const [resumeError, setResumeError] = useState(null)
  const fileInputRef = useRef(null)

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.existing_skills.includes(s)) {
      setForm(f => ({ ...f, existing_skills: [...f.existing_skills, s] }))
    }
    setSkillInput('')
  }

  const removeSkill = (skill) =>
    setForm(f => ({ ...f, existing_skills: f.existing_skills.filter(s => s !== skill) }))

  const addProject = () => {
    if (!newProject.name || !newProject.description) return
    const project = {
      ...newProject,
      tech_stack: newProject.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
    }
    setForm(f => ({ ...f, existing_projects: [...f.existing_projects, project] }))
    setNewProject({ name: '', description: '', tech_stack: '', impact: '' })
  }

  const removeProject = (idx) =>
    setForm(f => ({ ...f, existing_projects: f.existing_projects.filter((_, i) => i !== idx) }))

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setResumeUploading(true)
    setResumeError(null)
    setResumeParsed(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'X-Access-Token': ACCESS_TOKEN },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Upload failed')
      }

      const data = await res.json()
      const parsed = data.data

      setResumeParsed(parsed)

      // Auto-populate form fields
      if (parsed.skills?.length > 0) {
        setForm(f => ({
          ...f,
          existing_skills: [...new Set([...f.existing_skills, ...parsed.skills])]
        }))
      }
      if (parsed.projects?.length > 0) {
        setForm(f => ({
          ...f,
          existing_projects: [...f.existing_projects, ...parsed.projects]
        }))
        setShowProjects(true)
      }
    } catch (err) {
      setResumeError(err.message)
    } finally {
      setResumeUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.job_description.trim() || !form.company_name.trim()) return
    onSubmit(form)
  }

  const inputClass = "w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Resume Upload ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Upload Your Resume</h3>
          <span className="ml-auto text-xs text-gray-500">Auto-fills skills & projects</span>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          {resumeUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-blue-400 text-sm font-medium">Parsing your resume with AI...</p>
            </div>
          ) : resumeParsed ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <p className="text-green-400 text-sm font-medium">Resume parsed successfully!</p>
              <p className="text-gray-500 text-xs">
                Found {resumeParsed.skills?.length || 0} skills · {resumeParsed.projects?.length || 0} projects
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setResumeParsed(null); setForm(f => ({...f, existing_skills: [], existing_projects: []})) }}
                className="text-xs text-gray-500 hover:text-red-400 mt-1 transition-colors"
              >
                Clear and re-upload
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors" />
              <p className="text-gray-400 text-sm group-hover:text-white transition-colors">
                Click to upload your resume
              </p>
              <p className="text-gray-600 text-xs">PDF or DOCX · Max 5MB</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleResumeUpload}
          className="hidden"
        />

        {resumeError && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-xs">
            {resumeError}
          </div>
        )}

        {/* Parsed summary */}
        {resumeParsed && (
          <div className="mt-4 bg-gray-900/60 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
            {resumeParsed.name && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 flex-shrink-0">Name</span>
                <span className="text-white">{resumeParsed.name}</span>
              </div>
            )}
            {resumeParsed.education && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 flex-shrink-0">Education</span>
                <span className="text-gray-300">{resumeParsed.education}</span>
              </div>
            )}
            {resumeParsed.experience && (
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 flex-shrink-0">Experience</span>
                <span className="text-gray-300">{resumeParsed.experience}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Job Info ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Job Details</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name *</label>
            <input
              className={inputClass}
              placeholder="Google, Flipkart, Razorpay..."
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Role Title</label>
            <input
              className={inputClass}
              placeholder="Software Engineer, SDE-1..."
              value={form.role_title}
              onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company URL (optional)</label>
            <input
              className={inputClass}
              placeholder="https://company.com"
              value={form.company_url}
              onChange={e => setForm(f => ({ ...f, company_url: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Experience Level</label>
            <select
              className={inputClass}
              value={form.experience_level}
              onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))}
            >
              <option value="fresher">Fresher (0 exp)</option>
              <option value="intern">Intern / Part-time exp</option>
              <option value="junior">Junior (1 yr)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Job Description *</label>
          <textarea
            className={inputClass + " h-48 resize-y"}
            placeholder="Paste the full job description here — including responsibilities, requirements, and preferred qualifications..."
            value={form.job_description}
            onChange={e => setForm(f => ({ ...f, job_description: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold text-white text-sm">Current Skills</h3>
          <span className="ml-auto text-xs text-gray-500">
            {resumeParsed ? `${form.existing_skills.length} auto-filled from resume` : 'Agent will re-evaluate these'}
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            className={inputClass}
            placeholder="Type a skill and press Enter or Add..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-sm whitespace-nowrap"
          >
            Add
          </button>
        </div>

        {form.existing_skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.existing_skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Projects ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <button
          type="button"
          className="w-full flex items-center gap-2 text-left"
          onClick={() => setShowProjects(!showProjects)}
        >
          <FolderGit2 className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-white text-sm">Current Projects</h3>
          <span className="ml-auto text-xs text-gray-500 mr-2">
            {form.existing_projects.length > 0 ? `${form.existing_projects.length} added` : 'Agent will improve these'}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProjects ? 'rotate-180' : ''}`} />
        </button>

        {showProjects && (
          <div className="mt-4 space-y-4">
            {form.existing_projects.map((proj, idx) => (
              <div key={idx} className="bg-gray-900/60 border border-white/5 rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium text-white text-sm">{proj.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{proj.description?.substring(0, 80)}...</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {proj.tech_stack?.map(t => (
                      <span key={t} className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => removeProject(idx)} className="text-gray-600 hover:text-red-400 ml-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="bg-gray-900/40 border border-dashed border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs text-gray-500 font-medium">Add a project manually</p>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Project name" value={newProject.name}
                  onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                <input className={inputClass} placeholder="Tech stack (comma separated)" value={newProject.tech_stack}
                  onChange={e => setNewProject(p => ({ ...p, tech_stack: e.target.value }))} />
              </div>
              <textarea className={inputClass + " h-20 resize-none"} placeholder="Brief description..."
                value={newProject.description}
                onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
              <input className={inputClass} placeholder="Impact / metrics (optional)"
                value={newProject.impact}
                onChange={e => setNewProject(p => ({ ...p, impact: e.target.value }))} />
              <button type="button" onClick={addProject}
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading || !form.job_description || !form.company_name}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all text-base flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {loading ? 'Researching & Analyzing...' : 'Generate My Resume Edge'}
      </button>
    </form>
  )
}