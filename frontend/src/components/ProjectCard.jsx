import { useState } from 'react'
import { FolderGit2, Clock, Cpu, ChevronDown, ChevronUp, Copy, Check, Star } from 'lucide-react'

const difficultyColor = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function ProjectItem({ proj }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyDesc = () => {
    navigator.clipboard.writeText(proj.resume_description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900/60 border border-white/5 rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white text-sm">{proj.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor[proj.difficulty] || difficultyColor.intermediate}`}>
                {proj.difficulty}
              </span>
            </div>
            <p className="text-gray-400 text-xs">{proj.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {proj.tech_stack?.map(t => (
                <span key={t} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {proj.build_time_estimate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {proj.build_time_estimate}
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
          {/* Resume Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase">Resume Description</p>
              <button onClick={copyDesc} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="bg-gray-950 border border-white/5 rounded-lg p-3 text-gray-300 text-sm leading-relaxed">
              {proj.resume_description}
            </div>
          </div>

          {/* Why this company loves it */}
          {proj.why_this_company_loves_it && (
            <div>
              <p className="text-xs font-semibold text-amber-400/70 uppercase mb-1">Why This Company Loves It</p>
              <p className="text-gray-300 text-sm">{proj.why_this_company_loves_it}</p>
            </div>
          )}

          {/* Key Features */}
          {proj.core_features?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Key Features to Build</p>
              <ul className="space-y-1">
                {proj.core_features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATS Keywords */}
          {proj.ats_keywords_covered?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-400/70 uppercase mb-2">ATS Keywords Covered</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.ats_keywords_covered.map(k => (
                  <span key={k} className="bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* GitHub README tip */}
          {proj.github_readme_highlights && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-400 mb-1">GitHub README Tip</p>
              <p className="text-gray-400 text-xs">{proj.github_readme_highlights}</p>
            </div>
          )}

          {/* Stretch features */}
          {proj.stretch_features?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-400/70 uppercase mb-2">Stretch Features (Bonus)</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.stretch_features.map((f, i) => (
                  <span key={i} className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ExistingProjectEval({ ev }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyImproved = () => {
    navigator.clipboard.writeText(ev.improved_resume_description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900/60 border border-amber-500/10 rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white text-sm">{ev.project_name}</h4>
            <p className="text-amber-400 text-xs mt-0.5">Score: {ev.current_score}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
          {ev.weaknesses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400/70 uppercase mb-2">Current Weaknesses</p>
              <ul className="space-y-1">
                {ev.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-red-300/80 flex gap-2">
                    <span className="flex-shrink-0">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ev.improved_resume_description && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-green-400/70 uppercase">Improved Description</p>
                <button onClick={copyImproved} className="flex items-center gap-1 text-xs text-brand-400">
                  {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-gray-950 border border-green-500/10 rounded-lg p-3 text-gray-300 text-sm leading-relaxed">
                {ev.improved_resume_description}
              </div>
            </div>
          )}

          {ev.code_additions_suggested?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-blue-400/70 uppercase mb-2">Add to Strengthen It</p>
              <ul className="space-y-1">
                {ev.code_additions_suggested.map((a, i) => (
                  <li key={i} className="text-sm text-blue-300 flex gap-2">
                    <Star className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({ data }) {
  const { recommended_projects = [], existing_projects_evaluation = [] } = data
  const [tab, setTab] = useState('new')

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold text-green-400 bg-green-500/10 border-green-500/20">
          <FolderGit2 className="w-3.5 h-3.5" />
          Projects Section
        </div>
        {existing_projects_evaluation.length > 0 && (
          <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
            <button
              onClick={() => setTab('new')}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${tab === 'new' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              New Projects
            </button>
            <button
              onClick={() => setTab('existing')}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${tab === 'existing' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Your Projects ({existing_projects_evaluation.length})
            </button>
          </div>
        )}
      </div>

      {tab === 'new' && (
        <div className="space-y-3">
          {recommended_projects.map((proj, i) => (
            <ProjectItem key={i} proj={proj} />
          ))}
        </div>
      )}

      {tab === 'existing' && (
        <div className="space-y-3">
          {existing_projects_evaluation.map((ev, i) => (
            <ExistingProjectEval key={i} ev={ev} />
          ))}
        </div>
      )}
    </div>
  )
}