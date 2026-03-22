import React, { useContext, useEffect, useState } from 'react'
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { HiChevronLeft } from 'react-icons/hi';

const SideMenu = ({ activeMenu, isCollapsed, setIsCollapsed }) => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {
        if (route === "logout") {
            handleLogout();
            return;
        }

        navigate(route);
    };
    
    const handleLogout = async () => {
        try {
            await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
        } finally {
            clearUser();
            navigate("/");
        }
    };

    useEffect(() => {
        if (user) {
            setSideMenuData(user?.role === "admin" || user?.role === "super_admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
        }
    }, [user]);

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-72'} h-[calc(100vh-77px)] rounded-[28px] border sticky top-[85px] z-20 transition-all duration-300 ml-4`}
            style={{
                background: 'linear-gradient(180deg, rgba(255, 253, 248, 0.88) 0%, rgba(255, 255, 255, 0.72) 100%)',
                borderColor: 'rgba(148, 163, 184, 0.14)',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
            }}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-5 w-7 h-7 text-white rounded-full flex items-center justify-center z-30"
                style={{ background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)' }}
            >
                <HiChevronLeft className={`text-sm transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex flex-col items-center justify-center mb-7 pt-7 px-4">
                <div className="relative">
                    <img
                        src={user?.profilePicture || "https://via.placeholder.com/80"}
                        alt="Profile Image"
                        className={`${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} rounded-full object-cover transition-all duration-300 ring-4 ring-white/80`}
                        style={{ backgroundColor: '#cbd5e1' }}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80";
                        }}
                    />
                </div>

                {!isCollapsed && (
                    <>
                        {(user?.role === "admin" || user?.role === "super_admin") && (
                            <div
                                className="text-[10px] font-semibold text-white px-3 py-1 rounded-full mt-2"
                                style={{ background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)' }}
                            >
                                {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                            </div>
                        )}

                        <h5 className="text-slate-950 font-semibold leading-6 mt-4">
                            {user?.name || ""}
                        </h5>

                        <p className="text-[12px] text-slate-500 text-center">{user?.email || ""}</p>
                    </>
                )}
            </div>

            <div className="px-3">
                {sideMenuData.map((item, index) => (
                    <button
                        key={`menu_${index}`}
                        className={`w-full flex items-center rounded-2xl ${isCollapsed ? 'justify-center' : 'gap-4'} text-[15px] py-3 ${isCollapsed ? 'px-0' : 'px-4'} mb-2.5 cursor-pointer transition-all duration-300 ${
                            activeMenu == item.label
                                ? 'text-white shadow-lg'
                                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                        }`}
                        style={activeMenu == item.label
                            ? {
                                background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)',
                                boxShadow: '0 14px 24px rgba(40, 80, 217, 0.22)',
                            }
                            : undefined}
                        onClick={() => handleClick(item.path)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon className="text-xl" />
                        {!isCollapsed && item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SideMenu
