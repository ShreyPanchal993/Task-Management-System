import React from 'react'

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-2.5 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">{payload[0].name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Count: <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{payload[0].value}</span>
                </p>
            </div>
        )
    }

    return null;
}

export default CustomTooltip