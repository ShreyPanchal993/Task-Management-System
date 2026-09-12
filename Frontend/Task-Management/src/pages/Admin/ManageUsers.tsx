import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet, LuUsers } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { UserContext } from '../../context/userContext';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [roleUpdateId, setRoleUpdateId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setAllUsers(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    const targetUser = allUsers.find((item) => item._id === userId);
    if (!targetUser || targetUser.role === role) return;

    setRoleUpdateId(userId);

    try {
      const response = await axiosInstance.patch(API_PATHS.USERS.UPDATE_USER_ROLE(userId), { role });
      const updatedUser = response.data?.data;

      setAllUsers((prevUsers) =>
        prevUsers.map((item) => (item._id === updatedUser._id ? { ...item, ...updatedUser } : item))
      );

      // If the changed user is the currently logged-in user, refresh their context
      if (updatedUser._id === currentUser?._id || updatedUser._id === currentUser?.id) {
        try {
          const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
          updateUser(profileRes.data?.data || profileRes.data);
        } catch {
          // non-blocking — context will refresh on next page load
        }
      }

      toast.success(`User role updated to ${role.replace("_", " ")}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role.");
    } finally {
      setRoleUpdateId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_detail.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download user report. Please try again.");
    }
  };

  const handleStatClick = (user, status) => {
    const params = new URLSearchParams({
      userId: user._id,
      userName: user.name || "Member",
      status: status,
    });
    navigate(`/admin/tasks?${params.toString()}`);
  };

  useEffect(() => {
    getAllUsers();
    return () => { };
  }, []);

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10 animate-slide-down">
        <div className="page-header">
          <div className="flex items-center justify-between gap-3 w-full">
            <div>
              <p className="soft-label">People</p>
              <h2 className="page-title mt-2">Team Members</h2>
            </div>

            <button className="download-btn" onClick={handleDownloadReport}>
              <LuFileSpreadsheet className="text-lg" />
              <span className="hidden sm:inline">Download </span>Report
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner className="py-24" />
        ) : allUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(40, 80, 217, 0.08)" }}
            >
              <LuUsers className="text-2xl text-primary" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No team members yet</h3>
            <p className="text-sm text-slate-400 mt-1">Members will appear here once they sign up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {allUsers.map((teamMember, index) => (
              <div
                key={teamMember._id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <UserCard
                  userInfo={teamMember}
                  canManageRoles={currentUser?.role === "super_admin"}
                  isUpdatingRole={roleUpdateId === teamMember._id}
                  onRoleChange={handleRoleChange}
                  onStatClick={(user, status) => handleStatClick(user, status)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
