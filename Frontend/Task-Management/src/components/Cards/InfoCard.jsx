import React from 'react'

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="rounded-[20px] sm:rounded-[22px] border p-3 sm:p-4 min-w-0" style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)" }}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`w-2 sm:w-2.5 h-9 sm:h-10 ${color} rounded-full shrink-0`} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-wider text-slate-400 font-medium truncate" title={label}>{label}</p>
          <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default InfoCard
