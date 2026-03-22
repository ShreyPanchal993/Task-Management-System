import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';
import { UserContext } from '../../context/userContext';

const ManageUsers = () => {
  const { user: currentUser } = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [roleUpdateId, setRoleUpdateId] = useState(null);
  
  const getAllUsers = async () => {
    try{
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setAllUsers(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    }
  };

  const handleRoleChange = async (userId, role) => {
    const targetUser = allUsers.find((item) => item._id === userId);
    if (!targetUser || targetUser.role === role) {
      return;
    }

    setRoleUpdateId(userId);

    try {
      const response = await axiosInstance.patch(API_PATHS.USERS.UPDATE_USER_ROLE(userId), { role });
      const updatedUser = response.data?.data;

      setAllUsers((prevUsers) =>
        prevUsers.map((item) => (item._id === updatedUser._id ? { ...item, ...updatedUser } : item))
      );
      toast.success(`User role updated to ${role.replace("_", " ")}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role.");
    } finally {
      setRoleUpdateId(null);
    }
  };

  //download task report
  const handleDownloadReport = async () => {
    try{
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
      toast.error("Failed to download expense details. Please try again.");
    }
  }

  useEffect(() => {
    getAllUsers();

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10 animate-slide-down">
        <div className="page-header">
          <div>
            <p className="soft-label">People</p>
            <h2 className="page-title mt-2">Team Members</h2>
          </div>

          <button className="flex md:flex download-btn" onClick={handleDownloadReport}>
            <LuFileSpreadsheet className="text-lg"/>
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allUsers?.map((teamMember, index) => (
            <div key={teamMember._id} className="animate-scale-in" style={{animationDelay: `${index * 0.05}s`}}>
              <UserCard
                userInfo={teamMember}
                canManageRoles={currentUser?.role === "super_admin"}
                isUpdatingRole={roleUpdateId === teamMember._id}
                onRoleChange={handleRoleChange}
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
