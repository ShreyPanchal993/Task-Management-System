import React from 'react'
import moment from 'moment';

const TaskListTable = ({ tableData }) => {
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed' : return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200';
            case 'Pending' : return 'bg-amber-100/80 text-amber-700 border border-amber-200';
            case 'In Progress' : return 'bg-sky-100/80 text-sky-700 border border-sky-200';
            default : return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'High' : return 'bg-red-100/80 text-red-700 border border-red-200';
            case 'Medium' : return 'bg-orange-100/80 text-orange-700 border border-orange-200';
            case 'Low' : return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200';
            default : return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };
    
    return (
        <div className="table-shell mt-4">
            <table className="min-w-full">
                <thead className="border-b soft-divider">
                    <tr className="text-left">
                        <th className="py-4 px-4 text-slate-700 font-semibold text-[12px] uppercase tracking-[0.18em]">Name</th>
                        <th className="py-4 px-4 text-slate-700 font-semibold text-[12px] uppercase tracking-[0.18em]">Status</th>
                        <th className="py-4 px-4 text-slate-700 font-semibold text-[12px] uppercase tracking-[0.18em]">Priority</th>
                        <th className="py-4 px-4 text-slate-700 font-semibold text-[12px] uppercase tracking-[0.18em] hidden md:table-cell">Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((task) => (
                        <tr key={task._id} className="border-t" style={{ borderColor: "rgba(148, 163, 184, 0.14)" }}>
                            <td className="py-4 px-4 text-slate-700 text-[13px] font-medium line-clamp-1 overflow-hidden">{task.title}</td>
                            <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 text-xs rounded-full inline-block font-semibold ${getStatusBadgeColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 text-xs rounded-full inline-block font-semibold ${getPriorityBadgeColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-slate-700 text-[13px] text-nowrap hidden md:table-cell">
                                {task.createdAt ? moment(task.createdAt).format('DD MMM YYYY') : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) 
}

export default TaskListTable
