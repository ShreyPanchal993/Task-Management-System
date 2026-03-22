import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try{
      const params = filterStatus === "All" ? {} : { status: filterStatus };

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      const data = response.data?.data || {};
      setAllTasks(data.tasks || []);

      // Map status Summary data with fixed labels and order
      const statusSummary = data.statusSummary || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 }
      ];

      setTabs(statusArray);
    }catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks.");
    }
  };

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  useEffect(() => {
    getAllTasks();
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5 animate-slide-down">
        <div className="page-header">
            <div>
              <p className="soft-label">Assignments</p>
              <h2 className="page-title mt-2">My Tasks</h2>
            </div>

          {tabs?.[0]?.count > 0 && (
              <TaskStatusTabs 
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.map((item, index) => (
            <div key={item._id} className="animate-scale-in" style={{animationDelay: `${index * 0.05}s`}}>
              <TaskCard 
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo?.map((item) => item.profilePicture)}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoChecklist || []}
                onClick={() => 
                  {handleClick(item._id)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTasks
