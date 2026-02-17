import { Code2, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react'

const verdictConfig = {
  keep: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Keep' },
  upgrade: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Upgrade' },
  replace: { icon: ArrowRight, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Replace' },
  remove: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Remove' },
}

const priorityColor = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-600',
}

export default function SkillsCard({ data }) {
  const { recommended_skills = [], existing_skills_evaluation = [], skills_to_avoid_listing = [] } = data

  return (
    <div className="glass rounded-2xl p-6">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 text-brand-400 bg-brand-500/10 border-brand-500/20">
        <Code2 className="w-3.5 h-3.5" />
        Skills Section
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Skills */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Add to Your Resume</p>
          <div className="space-y-3">
            {recommended_skills.map((cat, i) => (
              <div key={i} className={`bg-gray-900/50 border-l-2 ${priorityColor[cat.priority] || 'border-l-gray-600'} rounded-r-xl p-3`}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-white">{cat.category}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    cat.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    cat.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>{cat.priority}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {cat.skills.map(s => (
                    <span key={s} className="bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded text-xs">{s}</span>
                  ))}
                </div>
                {cat.why && <p className="text-gray-500 text-xs">{cat.why}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Existing Skills Evaluation */}
        <div>
          {existing_skills_evaluation.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Your Skills Evaluated</p>
              <div className="space-y-2">
                {existing_skills_evaluation.map((ev, i) => {
                  const cfg = verdictConfig[ev.verdict] || verdictConfig.keep
                  const Icon = cfg.icon
                  return (
                    <div key={i} className={`border rounded-xl p-3 ${cfg.bg}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className="text-white text-sm font-medium">{ev.skill}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs pl-5">{ev.suggestion}</p>
                      {ev.replacement && (
                        <p className="text-blue-400 text-xs pl-5 mt-0.5">→ Use: {ev.replacement}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {skills_to_avoid_listing?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-red-400/70 font-semibold uppercase mb-2">Don't List These</p>
              <div className="flex flex-wrap gap-1.5">
                {skills_to_avoid_listing.map(s => (
                  <span key={s} className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs line-through">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}