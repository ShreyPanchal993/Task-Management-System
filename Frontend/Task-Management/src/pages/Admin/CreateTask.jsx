import React, { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data.js'
import axiosInstance from '../../utils/axiosInstance.js'
import { API_PATHS } from '../../utils/apiPaths.js'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import moment from 'moment'
import { LuCalendarDays, LuTrash2 } from 'react-icons/lu';
import SelectDropDown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInputs from '../../components/Inputs/AddAttachmentsInputs'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'

const DATE_FORMAT = "DD/MM/YYYY";
const getTodayDateString = () => moment().format(DATE_FORMAT);
const formatDueDateForInput = (value = "") => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseDueDateToIsoString = (value) => {
  const parsedDate = moment(value, DATE_FORMAT, true);

  if (!parsedDate.isValid()) {
    return null;
  }

  return parsedDate.startOf("day").toISOString();
};

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();
  const hiddenDateInputRef = useRef(null);

  const [taskData, setTaskData] = React.useState({
    title: "",
    description: "",
    priority: PRIORITY_DATA[0].value,
    dueDate: getTodayDateString(),
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    // Reset form
    setTaskData({
      title: "",
      description: "",
      priority: PRIORITY_DATA[0].value,
      dueDate: getTodayDateString(),
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  const openDatePicker = () => {
    if (!hiddenDateInputRef.current) {
      return;
    }

    if (typeof hiddenDateInputRef.current.showPicker === "function") {
      hiddenDateInputRef.current.showPicker();
      return;
    }

    hiddenDateInputRef.current.click();
  };

  // Create Task
  const createTask = async () => {
    setLoading(true);

    try{
      const todoList = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false
      }));

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: parseDueDateToIsoString(taskData.dueDate),
        todoChecklist: todoList,
      });

      toast.success("Task created successfully!");

      clearData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  // Update Task
  const updateTask = async () => {
    setLoading(true);

    try{
      const todoList = taskData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentTask?.todoChecklist || [];
        const matchedTask = prevTodoChecklist.find((task) => task.text == item);

        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });

      // Update Task by ID
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
        ...taskData,
        dueDate: parseDueDateToIsoString(taskData.dueDate),
        todoChecklist: todoList,
      });

      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task.");
    } finally {
      setLoading(false)
    }
  };

  const handleSubmit = async() => {
    setError(null);

    // Input validation
    if (!taskData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!taskData.dueDate) {
      setError("Due date is required");
      return;
    }

    if (!moment(taskData.dueDate, DATE_FORMAT, true).isValid()) {
      setError("Due date must be in DD/MM/YYYY format");
      return;
    }

    if (taskData.assignedTo?.length === 0) {
      setError("Task not assigned to any member");
      return;
    }

    if (taskData.todoChecklist?.length === 0) {
      setError("Add at least one todo task");
      return;
    }

    if (taskId) {
      updateTask();
      return;
    }

    createTask();
  };

  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));

      if(response.data?.data){
        const taskInfo = response.data.data;
        setCurrentTask(taskInfo);

        setTaskData((prevState) => ({
          title: taskInfo.title,
          description: taskInfo.description,
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format(DATE_FORMAT) : getTodayDateString(),
          assignedTo: taskInfo?.assignedTo?.map((item) => item._id) || [],
          todoChecklist: taskInfo?.todoChecklist?.map((item) => item.text) || [],
          attachments: taskInfo?.attachments || [],
        })) 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load task details.");
    }
  };

  // Delete Task
  const deleteTask = async () => {
    try{
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

      setOpenDeleteAlert(false);
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task.");
    }
  };

  useEffect(() => {
    if(taskId){
      getTaskDetailsByID(taskId);
    }

    return () => {}
  }, [taskId])

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5 mb-10 animate-slide-down">
        <div className="flex justify-center">
          <div className="form-card w-full max-w-4xl">

            <div className="flex item-center justify-between">
              <div>
                <p className="soft-label">{taskId ? "Task Editor" : "New Task"}</p>
                <h2 className="text-xl md:text-2xl font-semibold mt-2">
                {taskId ? "Update Task" : "Create Task"}
                </h2>
              </div>

              {taskId && (
                <button 
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-700 bg-rose-100/70 rounded-full px-4 py-2 border border-rose-200 hover:border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

              <div className="mt-6">
                  <label className="text-sm font-medium text-slate-700">
                    Task Title
                  </label>

                <input
                  placeholder="Create App UI" 
                  className="form-input mt-1.5"
                  value={taskData.title}
                  onChange={({ target }) => 
                    handleValueChange("title", target.value)
                  }
                />
              </div>

              <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>
                
                <textarea 
                  placeholder="Describe Task" 
                  className="form-input mt-1.5"
                  rows={5}
                  value={taskData.description}
                  onChange={({ target }) => 
                    handleValueChange("description", target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <SelectDropDown
                    options={PRIORITY_DATA}
                    value={taskData.priority}
                    onChange={(value) => handleValueChange("priority", value)}
                    placeholder="Select Priority"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Due Date
                  </label>

                  <div className="relative mt-1.5">
                    <input 
                      placeholder="DD/MM/YYYY"
                      className="form-input pr-12"
                      value={taskData.dueDate}
                      onChange={({ target }) => 
                        handleValueChange("dueDate", formatDueDateForInput(target.value))
                      } 
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                    />

                    <button
                      type="button"
                      onClick={openDatePicker}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label="Open date picker"
                    >
                      <LuCalendarDays className="text-lg" />
                    </button>

                    <input
                      ref={hiddenDateInputRef}
                      type="date"
                      className="pointer-events-none absolute right-0 top-0 h-0 w-0 opacity-0"
                      tabIndex={-1}
                      value={
                        moment(taskData.dueDate, DATE_FORMAT, true).isValid()
                          ? moment(taskData.dueDate, DATE_FORMAT, true).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={({ target }) =>
                        handleValueChange(
                          "dueDate",
                          target.value ? moment(target.value).format(DATE_FORMAT) : ""
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Assign To
                  </label>

                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(value) =>
                      handleValueChange("assignedTo", value)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-slate-700">
                  TODO Checklist
                </label>

                <TodoListInput
                  todoList={taskData?.todoChecklist}
                  setTodoList={(value) =>
                    handleValueChange("todoChecklist", value)}
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-slate-700">
                  Add Attachments
                </label>

                <AddAttachmentsInputs
                  attachments={taskData?.attachments}
                  setAttachments={(value) =>
                    handleValueChange("attachments", value)
                  }
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500 mt-5"> {error} </p>
              )}

              <div className="flex justify-end mt-8">
                <button
                  className="add-btn px-8 py-3"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {taskId ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert 
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default CreateTask
