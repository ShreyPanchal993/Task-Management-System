import React from 'react'

const UserCard = ({ userInfo }) => {
    return (
        <div className="user-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={userInfo?.profilePicture}
                    alt={`Avatar`}
                    className="w-14 h-14 rounded-full border-4 border-white/80 shadow-md object-cover" 
                />

                    <div>
                        <p className="text-sm font-semibold text-slate-900">{userInfo?.name}</p>
                        <p className="text-xs text-slate-500">{userInfo?.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-3 mt-5">
                <StatCard 
                    label="Pending"
                    count={userInfo?.pendingTasks || 0}
                    status="Pending"
                />
                <StatCard 
                    label="In Progress"
                    count={userInfo?.inProgressTasks || 0}
                    status="In Progress"
                />
                <StatCard 
                    label="Completed"
                    count={userInfo?.completedTasks || 0}
                    status="Completed"
                />
            </div>
        </div>
    )
}

export default UserCard;

const StatCard = ({ label, count, status }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return "text-sky-700 bg-sky-100/70";

            case "Completed":
                return "text-emerald-700 bg-emerald-100/70";

            default:
                return "text-amber-700 bg-amber-100/70";
        }
    };

    return (
        <div className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-2 rounded-2xl text-center`}>
            <span className="text-[15px] font-semibold">{count}</span> <br /> {label}
        </div>
    )
}
