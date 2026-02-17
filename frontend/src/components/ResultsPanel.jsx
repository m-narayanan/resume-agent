import { useState } from 'react'
import {
  Building2, Target, Zap, FolderGit2, Star, Lightbulb,
  CheckCircle2, AlertTriangle, ArrowRight, Copy, Check
} from 'lucide-react'
import SkillsCard from './SkillsCard'
import ProjectCard from './ProjectCard'

function Section({ icon: Icon, title, color = 'brand', children }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  }
  return (
    <div className="glass rounded-2xl p-6">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 ${colors[color]}`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      {children}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
    </button>
  )
}

export default function ResultsPanel({ data }) {
  if (data?.raw_response) {
    return (
      <div className="glass rounded-2xl p-6">
        <p className="text-amber-400 font-semibold mb-3">Raw AI Response (JSON parsing failed)</p>
        <pre className="text-gray-300 text-xs whitespace-pre-wrap overflow-auto max-h-[600px]">{data.raw_response}</pre>
      </div>
    )
  }

  const { company_insights, ats_keywords, skills_section, projects_section,
          cover_letter_hooks, quick_wins, resume_summary } = data

  return (
    <div className="space-y-6">
      {/* Summary */}
      {resume_summary && (
        <div className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Resume Summary — Ready to Copy</p>
              <p className="text-gray-200 leading-relaxed">{resume_summary}</p>
            </div>
            <CopyButton text={resume_summary} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Insights */}
        {company_insights && (
          <Section icon={Building2} title="Company Intelligence" color="cyan">
            <div className="space-y-4">
              {company_insights.culture && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Culture & Values</p>
                  <p className="text-gray-300 text-sm">{company_insights.culture}</p>
                </div>
              )}
              {company_insights.tech_focus && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Technical Focus</p>
                  <p className="text-gray-300 text-sm">{company_insights.tech_focus}</p>
                </div>
              )}
              {company_insights.interview_style && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Interview Style</p>
                  <p className="text-gray-300 text-sm">{company_insights.interview_style}</p>
                </div>
              )}
              {company_insights.insider_tips?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Insider Tips</p>
                  <ul className="space-y-1.5">
                    {company_insights.insider_tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {company_insights.red_flags_to_address?.length > 0 && (
                <div>
                  <p className="text-xs text-red-400/70 font-semibold uppercase mb-2">Address These Concerns</p>
                  <ul className="space-y-1.5">
                    {company_insights.red_flags_to_address.map((flag, i) => (
                      <li key={i} className="flex gap-2 text-sm text-red-300/80">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ATS Keywords */}
        {ats_keywords && (
          <Section icon={Target} title="ATS Keywords" color="amber">
            <div className="space-y-4">
              {ats_keywords.critical?.length > 0 && (
                <div>
                  <p className="text-xs text-red-400/70 font-semibold uppercase mb-2">Critical — Must Have</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats_keywords.critical.map(k => (
                      <span key={k} className="bg-red-500/10 border border-red-500/20 text-red-300 px-2.5 py-1 rounded-lg text-xs">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {ats_keywords.important?.length > 0 && (
                <div>
                  <p className="text-xs text-amber-400/70 font-semibold uppercase mb-2">Important</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats_keywords.important.map(k => (
                      <span key={k} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg text-xs">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {ats_keywords.hidden?.length > 0 && (
                <div>
                  <p className="text-xs text-blue-400/70 font-semibold uppercase mb-2">Hidden Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats_keywords.hidden.map(k => (
                      <span key={k} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg text-xs">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {ats_keywords.action_verbs?.length > 0 && (
                <div>
                  <p className="text-xs text-green-400/70 font-semibold uppercase mb-2">Power Verbs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats_keywords.action_verbs.map(v => (
                      <span key={v} className="bg-green-500/10 border border-green-500/20 text-green-300 px-2.5 py-1 rounded-lg text-xs font-medium">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* Skills Section */}
      {skills_section && <SkillsCard data={skills_section} />}

      {/* Projects Section */}
      {projects_section && <ProjectCard data={projects_section} />}

      {/* Quick Wins + Cover Letter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quick_wins?.length > 0 && (
          <Section icon={Zap} title="Quick Wins" color="green">
            <ul className="space-y-3">
              {quick_wins.map((win, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {cover_letter_hooks?.length > 0 && (
          <Section icon={Lightbulb} title="Cover Letter Hooks" color="purple">
            <ul className="space-y-3">
              {cover_letter_hooks.map((hook, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {hook}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  )
}