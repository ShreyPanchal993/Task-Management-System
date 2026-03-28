import React from 'react'
import Avatar from '../Avatar';

const UserCard = ({ userInfo, canManageRoles = false, isUpdatingRole = false, onRoleChange }) => {
    const roleBadgeClassName = userInfo?.role === "admin"
        ? "bg-blue-100/80 text-blue-700"
        : "bg-slate-100/80 text-slate-600";

    return (
        <div className="user-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={userInfo?.profilePicture}
                        name={userInfo?.name}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full border-4 border-white/80 shadow-md object-cover"
                        fallbackClassName="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/80 bg-slate-200 text-sm font-semibold text-slate-600 shadow-md"
                    />

                    <div>
                        <p className="text-sm font-semibold text-slate-900">{userInfo?.name}</p>
                        <p className="text-xs text-slate-500">{userInfo?.email}</p>
                    </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${roleBadgeClassName}`}>
                    {userInfo?.role?.replace("_", " ") || "member"}
                </span>
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

            {canManageRoles && (
                <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Access</p>
                            <p className="mt-1 text-sm text-slate-600">Promote or demote this user without exposing public admin signup.</p>
                        </div>

                        <select
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            value={userInfo?.role || "member"}
                            onChange={(e) => onRoleChange?.(userInfo?._id, e.target.value)}
                            disabled={isUpdatingRole}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            )}
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
