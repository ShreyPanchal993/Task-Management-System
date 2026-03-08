import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data.js'
import axiosInstance from '../../utils/axiosInstance.js'
import { API_PATHS } from '../../utils/apiPaths.js'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import moment from 'moment'
import { LuTrash2 } from 'react-icons/lu';
import SelectDropDown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInputs from '../../components/Inputs/AddAttachmentsInputs'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = React.useState({
    title: "",
    description: "",
    priority: PRIORITY_DATA[0].value,
    dueDate: null,
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
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  // Create Task
  const createTask = async () => {
    setLoading(true);

    try{
      const todoList = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false
      }));

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList,
      });

      toast.success("Task created successfully!");

      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      setLoading(false);
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
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todoList,
      });

      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      setLoading(false);
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
          dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format("YYYY-MM-DD") : null,
          assignedTo: taskInfo?.assignedTo?.map((item) => item._id) || [],
          todoChecklist: taskInfo?.todoChecklist?.map((item) => item.text) || [],
          attachments: taskInfo?.attachments || [],
        })) 
      }
    } catch (error) {
      console.error("Error fetching task:", error)
    }
  };

  // Delete Task
  const deleteTask = async () => {
    try{
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

      setOpenDeleteAlert(false);
      toast.success("Expense details deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error deleting task:", error.response?.data?.message || error.message);
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
              <h2 className="text-xl md:text-2xl font-semibold">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button 
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-3 py-2 border border-rose-100 hover:border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
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

                  <input 
                    placeholder="Crate App UI"
                    className="form-input mt-1.5"
                    value={taskData.dueDate}
                    onChange={({ target }) => 
                      handleValueChange("dueDate", target.value)
                    } 
                    type="date"
                  />
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