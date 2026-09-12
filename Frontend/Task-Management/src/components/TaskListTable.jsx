import React from 'react'
import moment from 'moment';

const TaskListTable = ({ tableData }) => {
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
            case 'Pending': return 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
            case 'In Progress': return 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100/80 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
            case 'Medium': return 'bg-orange-100/80 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
            case 'Low': return 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700';
        }
    };

    return (
        <div className="table-shell mt-4">
            <table className="min-w-full">
                <thead className="border-b soft-divider">
                    <tr className="text-left">
                        <th className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold text-[12px] uppercase tracking-[0.18em]">Name</th>
                        <th className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold text-[12px] uppercase tracking-[0.18em]">Status</th>
                        <th className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold text-[12px] uppercase tracking-[0.18em]">Priority</th>
                        <th className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold text-[12px] uppercase tracking-[0.18em] hidden md:table-cell">Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-8 px-4 text-center text-sm text-slate-400">
                                No tasks to display.
                            </td>
                        </tr>
                    ) : (
                        tableData.map((task) => (
                            <tr key={task._id} className="border-t" style={{ borderColor: "var(--border-soft)" }}>
                                <td className="py-3.5 px-3 sm:px-4 text-slate-700 dark:text-slate-200 text-[13px] font-medium">
                                    <span className="line-clamp-1 block max-w-[130px] sm:max-w-xs md:max-w-none" title={task.title}>
                                        {task.title}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 sm:px-4">
                                    <span className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-full inline-block font-semibold ${getStatusBadgeColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 sm:px-4">
                                    <span className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-full inline-block font-semibold ${getPriorityBadgeColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="py-3.5 px-3 sm:px-4 text-slate-700 dark:text-slate-300 text-[13px] text-nowrap hidden md:table-cell">
                                    {task.createdAt ? moment(task.createdAt).format('DD MMM YYYY') : 'N/A'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TaskListTable
