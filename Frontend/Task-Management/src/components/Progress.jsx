import React from 'react'

const Progress = ({progress, status}) => {
    const getColor = () => {
        switch (status) {
            case "In Progress":
                return 'bg-sky-500';

            case "Completed":
                return 'bg-emerald-500'

            default: 
                return 'bg-amber-500'
        }
    };

    return (
        <div className="w-full rounded-full h-2" style={{ background: "rgba(148, 163, 184, 0.2)" }}>
            <div className={`${getColor()} h-2 rounded-full text-center text-xs font-medium`} style={{width: `${progress}%`}}>
            </div>
        </div>
    )
}

export default Progress
