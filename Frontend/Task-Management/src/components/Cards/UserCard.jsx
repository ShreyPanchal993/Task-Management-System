import React from 'react';
import Avatar from '../Avatar';

const UserCard = ({ userInfo, canManageRoles = false, isUpdatingRole = false, onRoleChange, onStatClick }) => {
    const roleBadgeClassName = userInfo?.role === "admin"
        ? "bg-blue-100/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
        : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

    return (
        <div className="user-card">
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <Avatar
                        src={userInfo?.profilePicture}
                        name={userInfo?.name}
                        alt="Avatar"
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-white/80 dark:border-slate-800 shadow-md object-cover shrink-0"
                        fallbackClassName="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 sm:border-4 border-white/80 dark:border-slate-800 bg-slate-200 dark:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-md shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={userInfo?.name}>{userInfo?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={userInfo?.email}>{userInfo?.email}</p>
                    </div>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${roleBadgeClassName}`}>
                    {userInfo?.role?.replace("_", " ") || "member"}
                </span>
            </div>

            <div className="flex items-end gap-2 sm:gap-3 mt-4 sm:mt-5">
                <StatCard
                    label="Pending"
                    count={userInfo?.pendingTasks || 0}
                    status="Pending"
                    userName={userInfo?.name}
                    onClick={() => onStatClick?.(userInfo, "Pending")}
                />
                <StatCard
                    label="In Progress"
                    count={userInfo?.inProgressTasks || 0}
                    status="In Progress"
                    userName={userInfo?.name}
                    onClick={() => onStatClick?.(userInfo, "In Progress")}
                />
                <StatCard
                    label="Completed"
                    count={userInfo?.completedTasks || 0}
                    status="Completed"
                    userName={userInfo?.name}
                    onClick={() => onStatClick?.(userInfo, "Completed")}
                />
            </div>

            {canManageRoles && (
                <div className="mt-4 sm:mt-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/60 px-3.5 sm:px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Access</p>
                            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">Promote or demote this user.</p>
                        </div>

                        <select
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 w-fit self-start sm:self-auto cursor-pointer"
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
    );
};

export default UserCard;

const StatCard = ({ label, count, status, onClick, userName }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return "text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/60 hover:bg-sky-200/90 dark:hover:bg-sky-900/80 border border-sky-300/40 dark:border-sky-800/60 hover:border-sky-400/60";

            case "Completed":
                return "text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200/90 dark:hover:bg-emerald-900/80 border border-emerald-300/40 dark:border-emerald-800/60 hover:border-emerald-400/60";

            default:
                return "text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 hover:bg-amber-200/90 dark:hover:bg-amber-900/80 border border-amber-300/40 dark:border-amber-800/60 hover:border-amber-400/60";
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            title={`View ${count} ${label} tasks for ${userName || "user"}`}
            className={`group/stat flex-1 min-w-0 text-[10px] font-medium ${getStatusTagColor()} px-2 sm:px-3 py-2 rounded-2xl text-center leading-tight cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary`}
        >
            <span className="text-sm sm:text-[15px] font-semibold block transition-transform group-hover/stat:scale-110">{count}</span>
            <span className="truncate block mt-0.5 font-medium">{label}</span>
        </button>
    );
};
