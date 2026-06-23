import React from 'react'

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="rounded-[22px] border p-4" style={{ background: "rgba(255, 255, 255, 0.62)", borderColor: "var(--border-soft)" }}>
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-10 ${color} rounded-full`} />
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default InfoCard
