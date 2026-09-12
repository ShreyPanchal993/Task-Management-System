import React, { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuCheck, LuChevronDown, LuFileSpreadsheet, LuPlus, LuSearch, LuSquarePlus, LuUser, LuUsers, LuX } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId") || "";
  const userNameParam = searchParams.get("userName") || "";
  const statusParam = searchParams.get("status") || "All";

  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState(statusParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const memberDropdownRef = useRef(null);

  // Close member dropdown when clicking outside & reset search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setIsMemberDropdownOpen(false);
      }
    };
    if (isMemberDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setMemberSearchQuery("");
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMemberDropdownOpen]);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setAllUsers(response.data?.data || []);
    } catch {
      // non-blocking
    }
  };

  const getAllTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus && filterStatus !== "All") {
        params.status = filterStatus;
      }
      if (userIdParam) {
        params.assignedTo = userIdParam;
      }

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
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newStatus) => {
    setFilterStatus(newStatus);
    const newParams = new URLSearchParams(searchParams);
    if (newStatus === "All") {
      newParams.delete("status");
    } else {
      newParams.set("status", newStatus);
    }
    setSearchParams(newParams);
  };

  const handleAssigneeChange = (selectedId) => {
    const newParams = new URLSearchParams(searchParams);
    if (!selectedId) {
      newParams.delete("userId");
      newParams.delete("userName");
    } else {
      const targetUser = allUsers.find((u) => u._id === selectedId);
      newParams.set("userId", selectedId);
      newParams.set("userName", targetUser?.name || "Member");
    }
    setSearchParams(newParams);
  };

  const handleClearUserFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("userId");
    newParams.delete("userName");
    setSearchParams(newParams);
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
    } catch {
      toast.error("Failed to download task report. Please try again.");
    }
  };

  // Sync state if URL searchParams change
  useEffect(() => {
    const currentStatus = searchParams.get("status") || "All";
    setFilterStatus(currentStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    getAllTasks();
    return () => { };
  }, [filterStatus, userIdParam]);

  // Client-side search filter
  const filteredTasks = allTasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    );
  });

  const filteredMembers = allUsers.filter((u) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const totalTaskCount = tabs[0]?.count || 0;

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5 animate-slide-down">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="soft-label">Task Library</p>
            <h2 className="page-title mt-1.5 sm:mt-2">Manage Tasks</h2>
          </div>

          <button
            className="download-btn group"
            onClick={handleDownloadReport}
            title="Download tasks spreadsheet"
          >
            <LuFileSpreadsheet className="text-base text-teal-600 group-hover:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline">Download </span>Report
          </button>
        </div>

        {/* Toolbar: Status Filter Tabs on Left, Search & Member Dropdown on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar py-0.5">
            {totalTaskCount > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={handleTabChange}
              />
            )}
          </div>

          {/* Right Controls: Active User Pill + Search + Member Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Active User Filter Pill */}
            {userIdParam && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-xs animate-fade-in shrink-0">
                <LuUser className="text-sm shrink-0 text-sky-600 dark:text-sky-400" />
                <span className="truncate max-w-[120px]">{userNameParam || "Member"}</span>
                <button
                  type="button"
                  onClick={handleClearUserFilter}
                  className="p-0.5 rounded-full hover:bg-sky-200/60 dark:hover:bg-sky-800 text-sky-700 dark:text-sky-300 transition cursor-pointer"
                  title="Clear member filter"
                >
                  <LuX className="text-xs" />
                </button>
              </div>
            )}

            {/* Search bar */}
            <div
              className="flex items-center gap-2 border rounded-full px-3.5 py-2 text-xs sm:text-[13px] bg-white/80 dark:bg-slate-800/80 shadow-xs flex-1 sm:w-60 min-w-[170px] hover:border-slate-300 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <LuSearch className="text-slate-400 shrink-0 text-sm" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-[13px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Clear search"
                >
                  <LuX className="text-xs" />
                </button>
              )}
            </div>

            {/* Custom Rounded Member Dropdown */}
            {allUsers.length > 0 && (
              <div ref={memberDropdownRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMemberDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs sm:text-[13px] shadow-xs outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition select-none font-medium ${userIdParam
                      ? 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-300/80 dark:border-sky-700 text-sky-900 dark:text-sky-200 font-semibold'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                    }`}
                  style={!userIdParam ? { borderColor: "var(--border-soft)" } : {}}
                  title="Filter by assigned member"
                  aria-haspopup="listbox"
                  aria-expanded={isMemberDropdownOpen}
                >
                  {userIdParam && allUsers.find((u) => u._id === userIdParam) ? (
                    <Avatar
                      src={allUsers.find((u) => u._id === userIdParam)?.profilePicture}
                      name={allUsers.find((u) => u._id === userIdParam)?.name}
                      className="w-4 h-4 rounded-full object-cover shrink-0 border border-sky-300/60 dark:border-sky-600"
                      fallbackClassName="w-4 h-4 rounded-full bg-sky-200/70 dark:bg-sky-800 text-sky-800 dark:text-sky-200 text-[9px] font-bold flex items-center justify-center shrink-0"
                    />
                  ) : (
                    <LuUsers className={`text-sm shrink-0 ${userIdParam ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate max-w-[100px] sm:max-w-[125px]">
                    {userIdParam ? (allUsers.find((u) => u._id === userIdParam)?.name || userNameParam || "Member") : "All Members"}
                  </span>
                  <LuChevronDown
                    className={`text-xs text-slate-400 transition-transform duration-200 ${isMemberDropdownOpen ? 'rotate-180 text-primary' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu with Rounded Edges & Smooth Scroll */}
                {isMemberDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 sm:w-60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.25)] p-1.5 z-50 animate-scale-in"
                    style={{
                      background: "var(--popover-bg)",
                      backdropFilter: "blur(16px)",
                    }}
                    role="listbox"
                  >
                    <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      <span>Filter by Member</span>
                      {allUsers.length > 0 && (
                        <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">
                          {allUsers.length} members
                        </span>
                      )}
                    </div>

                    {/* Member Search if more than 4 members */}
                    {allUsers.length > 4 && (
                      <div className="px-1 pb-1.5 pt-0.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                          <LuSearch className="text-slate-400 text-xs shrink-0" />
                          <input
                            type="text"
                            placeholder="Search member..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="bg-transparent outline-none w-full text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                          {memberSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setMemberSearchQuery("")}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
                              title="Clear"
                            >
                              <LuX className="text-[10px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* All Members Option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleAssigneeChange("");
                        setIsMemberDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] transition cursor-pointer ${!userIdParam
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                        }`}
                      role="option"
                      aria-selected={!userIdParam}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <LuUsers className="text-xs" />
                        </div>
                        <span>All Members</span>
                      </div>
                      {!userIdParam && <LuCheck className="text-sm text-primary shrink-0" />}
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />

                    {/* User Items with Custom Scrollbar */}
                    <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5 pr-0.5">
                      {filteredMembers.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">
                          No members found
                        </div>
                      ) : (
                        filteredMembers.map((u) => {
                          const isSelected = u._id === userIdParam;
                          return (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => {
                                handleAssigneeChange(u._id);
                                setIsMemberDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-[13px] transition cursor-pointer ${isSelected
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                                }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <Avatar
                                  src={u.profilePicture}
                                  name={u.name}
                                  className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-xs"
                                  fallbackClassName="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0"
                                />
                                <span className="truncate">{u.name}</span>
                              </div>
                              {isSelected && <LuCheck className="text-sm text-primary shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Zero tasks at all — show CTA */}
        {loading ? (
          <LoadingSpinner className="py-24" />
        ) : totalTaskCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(40, 80, 217, 0.08)" }}
            >
              {userIdParam ? <LuUsers className="text-2xl text-primary" /> : <LuSquarePlus className="text-2xl text-primary" />}
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {userIdParam ? `No tasks found for ${userNameParam || "this member"}` : "No tasks yet"}
            </h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">
              {userIdParam
                ? "This member doesn't have any tasks matching the current filter."
                : "Create your first task to get the team moving."}
            </p>
            {userIdParam ? (
              <button
                className="btn-primary w-auto px-6 cursor-pointer"
                onClick={handleClearUserFilter}
              >
                View All Team Tasks
              </button>
            ) : (
              <button
                className="btn-primary w-auto px-6"
                onClick={() => navigate("/admin/create-task")}
              >
                Create First Task
              </button>
            )}
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
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No matching tasks</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              {userIdParam
                ? `No ${filterStatus === "All" ? "" : filterStatus.toLowerCase()} tasks found for ${userNameParam || "this member"}.`
                : "Try a different search term or status filter."}
            </p>
            {userIdParam && (
              <button
                className="btn-primary w-auto px-5 py-2 text-xs cursor-pointer"
                onClick={handleClearUserFilter}
              >
                Clear Member Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
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
