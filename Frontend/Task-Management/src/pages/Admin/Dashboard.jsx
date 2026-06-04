import React, { useContext, useEffect, useState }  from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import moment from "moment";
import { addThousandSeparator } from "../../utils/helper.js";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const Dashboard = () => {
  useUserAuth(); // Custom hook to check user authentication

  const {user} = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevel = data?.taskPriorityLevel || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "Low", count: taskPriorityLevel?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevel?.Medium || 0 },
      { priority: "High", count: taskPriorityLevel?.High || 0 },
    ];

    setBarChartData(PriorityLevelData);
  }

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
      if (response.data?.data) {
        setDashboardData(response.data.data); 
        prepareChartData(response.data.data?.charts || null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const onSeeMore = () => {
    navigate("/admin/tasks");
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
  }, []);

  return(
    <DashboardLayout activeMenu={"Dashboard"}>
      {loading ? <LoadingSpinner /> : (
      <>
      <div className="card my-5 animate-slide-up stagger-1">
        <div className="page-header mb-0">
          <div className="col-span-3"> 
            <p className="soft-label">Overview</p>
            <h2 className="page-title mt-2">{getGreeting()}, {user?.name}</h2>
            <p className="page-subtitle mt-2">
              {moment().format("dddd Do MMMM YYYY")}
            </p>
          </div>

          <div className="rounded-[24px] border px-4 py-3 text-sm text-slate-600" style={{ background: "rgba(255,255,255,0.58)", borderColor: "var(--border-soft)" }}>
            Delivery health, workload, and recent activity in one place.
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />

          <InfoCard
            label="Pending Tasks"
            value={addThousandSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />

          <InfoCard
            label="In Progress Tasks"
            value={addThousandSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />

          <InfoCard
            label="Completed Tasks"
            value={addThousandSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="animate-slide-up stagger-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-slate-900">Task Distribution</h5>
            </div>

            <CustomPieChart 
              data={pieChartData}
              colors={COLORS}
            />
          </div>
        </div>

        <div className="animate-slide-up stagger-3">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-slate-900">Task Priority Levels</h5>
            </div>

            <CustomBarChart 
              data={barChartData}
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="md:col-span-2 animate-slide-up stagger-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold text-slate-900">Recent Tasks</h5>
              <button className="card-btn" onClick={onSeeMore}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>

            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
      </>
      )}
    </DashboardLayout>
  )
}

export default Dashboard
