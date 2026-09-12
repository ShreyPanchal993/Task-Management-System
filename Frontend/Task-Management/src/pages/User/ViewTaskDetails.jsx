import { useParams, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import moment from 'moment';
import AvatarGroup from '../../components/AvatarGroup';
import { LuSquareArrowOutUpRight, LuX } from 'react-icons/lu';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ViewTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800";

      case "Completed":
        return "text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800";

      default:
        return "text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800";
    }
  };

  // Get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));

      if (response.data?.data) {
        const taskInfo = response.data.data;
        setTask(taskInfo);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Todo check
  const updateTodoChecklist = async (index) => {
    const todoChecklist = [...(task?.todoChecklist || [])];
    const taskId = id;

    if (todoChecklist && todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index]?.completed;
    }

    try {
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId), {
        todoChecklist
      });

      if (response.status === 200) {
        setTask(response.data?.data || task);
      } else {
        // Optionally revert the toggle if the API call fails.
        todoChecklist[index].completed = !todoChecklist[index]?.completed;
      }
    } catch (error) {
      todoChecklist[index].completed = !todoChecklist[index]?.completed;
      toast.error(error.response?.data?.message || "Failed to update checklist. Please try again.");
    }
  };

  // Handle attachment link click
  const handleLinkClick = (link) => {
    if (!/^https?:\/\/./.test(link)) {
      link = "https://" + link;                 // Default to HTTPS
    }
    window.open(link, "_blank");
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsByID();
    }
    return () => { };
  }, [id]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {loading ? (
          <LoadingSpinner className="py-24" />
        ) : task ? (
          <div className="w-full max-w-4xl mt-4">
            <div className="form-card w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="soft-label">Task Detail</p>
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold mt-1 sm:mt-2">{task?.title}</h2>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`text-[10px] sm:text-[11px] md:text-[13px] font-semibold ${getStatusTagColor(
                    task?.status
                  )} px-3 sm:px-4 py-1 rounded-full`}
                  >
                    {task?.status}
                  </div>

                  <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <LuX className="text-xl text-gray-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Description" value={task?.description} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <InfoBox label="Priority" value={task?.priority} />
                </div>
                <div>
                  <InfoBox
                    label="Due Date"
                    value={
                      task?.dueDate
                        ? moment(task?.dueDate).format("Do MMMM YYYY")
                        : "N/A"
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned To</label>
                  <div className="mt-1">
                    <AvatarGroup
                      avatars={
                        task?.assignedTo?.map((item) => item.profilePicture) || []
                      }
                      maxVisible={5}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Todo Checklist</label>

                {task?.todoChecklist?.map((item, index) => (
                  <TodoCheckList
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item?.completed}
                    onCheck={() => updateTodoChecklist(index)}
                  />
                ))}
              </div>

              {task?.attachments?.length > 0 && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Attachments</label>

                  {task?.attachments?.map((link, index) => (
                    <Attachments
                      key={`link_${index}`}
                      link={link}
                      index={index}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>

      <p className="text-[12px] md:text-[13px] font-medium text-slate-700 dark:text-slate-200 mt-0.5">{value}</p>
    </>
  )
}

const TodoCheckList = ({ text, isChecked, onCheck }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onCheck}
        className="w-4 h-4 accent-blue-600 border-gray-300 rounded-sm outline-none cursor-pointer"
      />

      <p className="text-[13px] text-slate-800 dark:text-slate-200">{text}</p>
    </div>
  )
}

const Attachments = ({ link, index, onClick }) => {
  return (
    <div
      className="flex justify-between bg-white/70 dark:bg-slate-850 border px-3 py-3 rounded-2xl mb-3 mt-2 cursor-pointer hover:bg-white/90 dark:hover:bg-slate-800 transition-colors"
      style={{ borderColor: "var(--border-soft)" }}
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold mr-2">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>

        <p className="text-xs text-slate-900 dark:text-slate-200 truncate pr-2">{link}</p>
      </div>

      <LuSquareArrowOutUpRight className="text-slate-400" />
    </div>
  )
}
