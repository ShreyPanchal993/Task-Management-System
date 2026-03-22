import React, { useContext, useEffect, useState } from 'react'
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { HiChevronLeft } from 'react-icons/hi';

const SideMenu = ({ activeMenu, isCollapsed, setIsCollapsed }) => {
    const { user, clearUser } = useContext(UserContext);
    const [ sideMenuData, setSideMenuData ] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {
        if (route === "logout"){
            handleLogout();
            return;
        }

        navigate(route);
    }
    
    const handleLogout = async () => {
        try {
            await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.clear();
            clearUser();
            navigate("/login");
        }
    }

    useEffect(() => {
        if(user){
            setSideMenuData(user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
        }
        return () => {};
    }, [user]);

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20 transition-all duration-300`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-5 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-30"
            >
                <HiChevronLeft className={`text-sm transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex flex-col items-center justify-center mb-7 pt-5">
                <div className="relative">
                    <img
                        src={user?.profilePicture || "https://via.placeholder.com/80"}
                        alt="Profile Image"
                        className={`${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} bg-slate-400 rounded-full object-cover transition-all duration-300`}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/80"; }}
                    />
                </div>

                {!isCollapsed && (
                    <>
                        {user?.role === "admin" && (
                            <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
                                Admin
                            </div>
                        )}

                        <h5 className="text-gray-950 font-medium leading-6 mt-3">
                            {user?.name || ""}
                        </h5>

                        <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
                    </>
                )}
            </div>

            {sideMenuData.map((item, index) => (
                <button
                    key={`menu_${index}`}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} text-[15px] ${
                        activeMenu == item.label
                            ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
                            : ""
                        } py-3 ${isCollapsed ? 'px-0' : 'px-6'} mb-3 cursor-pointer transition-all duration-300`}
                    onClick={() => handleClick(item.path)}
                    title={isCollapsed ? item.label : ''}
                >
                    <item.icon className="text-xl" />
                    {!isCollapsed && item.label}
                </button>
            ))}
        </div>
    )
}

export default SideMenu