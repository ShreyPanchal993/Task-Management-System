import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet, LuSearch, LuSquarePlus, LuX } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import toast from 'react-hot-toast';

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const params = filterStatus === "All" ? {} : { status: filterStatus };

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, { params });

      const data = response.data?.data || {};
      setAllTasks(data.tasks || []);

      const statusSummary = data.statusSummary || {};
      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 }
      ];
      setTabs(statusArray);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks.");
    }
  };

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_detail.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download task report. Please try again.");
    }
  };

  // Client-side search filter
  const filteredTasks = allTasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    );
  });

  const totalTaskCount = tabs[0]?.count || 0;

  useEffect(() => {
    getAllTasks();
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5 animate-slide-down">
        <div className="page-header">
          <div className="flex items-center justify-between gap-3 w-full">
            <div>
              <p className="soft-label">Task Library</p>
              <h2 className="page-title mt-2">Manage Tasks</h2>
            </div>

            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search bar */}
            <div
              className="flex items-center gap-2 border rounded-full px-3 py-2 text-sm flex-1 min-w-[180px] max-w-xs"
              style={{ background: "rgba(255,255,255,0.65)", borderColor: "var(--border-soft)" }}
            >
              <LuSearch className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <LuX className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {totalTaskCount > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}

            <button className="hidden lg:flex download-btn" onClick={handleDownloadReport}>
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>
        </div>

        {/* Zero tasks at all — show CTA */}
        {totalTaskCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(40, 80, 217, 0.08)" }}
            >
              <LuSquarePlus className="text-2xl text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No tasks yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">Create your first task to get the team moving.</p>
            <button
              className="btn-primary w-auto px-6"
              onClick={() => navigate("/admin/create-task")}
            >
              Create First Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Tasks exist but search/filter returned nothing */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(40, 80, 217, 0.08)" }}
            >
              <LuSearch className="text-2xl text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No matching tasks</h3>
            <p className="text-sm text-slate-400 mt-1">Try a different search term or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {filteredTasks.map((item, index) => (
              <div
                key={item._id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TaskCard
                  _id={item._id}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  status={item.status}
                  progress={item.progress}
                  createdAt={item.createdAt}
                  dueDate={item.dueDate}
                  assignedTo={item.assignedTo?.map((u) => u.profilePicture)}
                  attachmentCount={item.attachments?.length || 0}
                  completedTodoCount={item.completedTodoCount || 0}
                  todoChecklist={item.todoChecklist || []}
                  onClick={() => handleClick(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
