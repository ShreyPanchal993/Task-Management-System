import React, { useContext, useState } from 'react'
import Progress from '../Progress';
import AvatarGroup from '../AvatarGroup';
import { LuPaperclip, LuAlarmClock } from 'react-icons/lu';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import { STATUS_DATA } from '../../utils/data.js';

const TaskCard = ({
    _id,
    title,
    description,
    priority,
    status: initialStatus,
    progress: initialProgress,
    createdAt,
    dueDate,
    assignedTo,
    attachmentCount,
    completedTodoCount,
    todoChecklist,
    onClick,
}) => {
    const { user } = useContext(UserContext);
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    const [status, setStatus] = useState(initialStatus);
    const [progress, setProgress] = useState(initialProgress);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const isOverdue =
        dueDate &&
        status !== "Completed" &&
        moment(dueDate).isBefore(moment(), "day");

    const getStatusTagColor = (s) => {
        switch (s) {
            case "In Progress": return "text-sky-700 bg-sky-100/70 border border-sky-200";
            case "Completed":   return "text-emerald-700 bg-emerald-100/70 border border-emerald-200";
            default:            return "text-amber-700 bg-amber-100/70 border border-amber-200";
        }
    };

    const getPriorityTagColor = () => {
        switch (priority) {
            case "Low":    return "text-emerald-700 bg-emerald-100/70 border border-emerald-200";
            case "Medium": return "text-amber-700 bg-amber-100/70 border border-amber-200";
            case "High":   return "text-rose-700 bg-rose-100/70 border border-rose-200";
        }
    };

    const handleStatusChange = async (e) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        if (newStatus === status || !_id) return;

        setUpdatingStatus(true);
        const prevStatus = status;
        const prevProgress = progress;

        // Optimistic update
        setStatus(newStatus);
        if (newStatus === "Completed") setProgress(100);

        try {
            await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(_id), { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            // Revert on failure
            setStatus(prevStatus);
            setProgress(prevProgress);
            toast.error(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <div
            className="rounded-[26px] py-4 border cursor-pointer hover:-translate-y-1 transition-transform"
            style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 253, 248, 0.82) 100%)",
                borderColor: isOverdue ? "rgba(239,68,68,0.35)" : "var(--border-soft)",
                boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
            }}
            onClick={onClick}
        >
            <div className="flex items-center gap-2 px-4 flex-wrap">
                {/* Admin: inline status selector; Member: static badge */}
                {isAdmin && _id ? (
                    <select
                        className={`text-[11px] font-semibold ${getStatusTagColor(status)} px-3 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none`}
                        value={status}
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()}
                        disabled={updatingStatus}
                        title="Change status"
                    >
                        {STATUS_DATA.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                ) : (
                    <div className={`text-[11px] font-semibold ${getStatusTagColor(status)} px-4 py-1 rounded-full`}>
                        {status}
                    </div>
                )}

                <div className={`text-[11px] font-semibold ${getPriorityTagColor()} px-4 py-1 rounded-full`}>
                    {priority} Priority
                </div>

                {isOverdue && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                        <LuAlarmClock className="text-xs" /> Overdue
                    </div>
                )}
            </div>

            <div className={`px-4 border-l-[3px] ${
                status === "In Progress"
                    ? "border-sky-500"
                    : status === "Completed"
                    ? "border-emerald-500"
                    : "border-violet-500"
            }`}>
                <p className="text-sm font-semibold text-slate-900 mt-4 line-clamp-2">{title}</p>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-[18px]">{description}</p>
                <p className="text-[13px] text-slate-600 font-medium mt-3 mb-2 leading-[18px]">
                    Task Done:{" "}
                    <span className="font-semibold text-slate-900">
                        {completedTodoCount} / {todoChecklist?.length || 0}
                    </span>
                </p>
                <Progress progress={progress} status={status} />
            </div>

            <div className="px-4">
                <div className="flex items-center justify-between my-1">
                    <div>
                        <label className="text-xs text-slate-500">Start Date</label>
                        <p className="text-[13px] font-semibold text-slate-900">
                            {moment(createdAt).format("DD MMM YYYY")}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Due Date</label>
                        <p className={`text-[13px] font-semibold ${isOverdue ? "text-red-600" : "text-slate-900"}`}>
                            {moment(dueDate).format("DD MMM YYYY")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <AvatarGroup avatars={assignedTo || []} maxVisible={3} />

                    {attachmentCount > 0 && (
                        <div
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border"
                            style={{ background: "rgba(40, 80, 217, 0.08)", borderColor: "rgba(40, 80, 217, 0.12)" }}
                        >
                            <LuPaperclip className="text-primary" />
                            <span className="text-xs text-slate-900 font-medium">{attachmentCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
