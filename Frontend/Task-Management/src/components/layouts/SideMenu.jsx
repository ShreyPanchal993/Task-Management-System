import React, { useContext, useEffect, useState } from 'react'
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { HiChevronLeft } from 'react-icons/hi';
import Avatar from '../Avatar';

const SideMenu = ({ activeMenu, isCollapsed, setIsCollapsed, isMobile = false, onClose }) => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {
        if (onClose) {
            onClose();
        }

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

    const navItems = sideMenuData.filter((item) => item.path !== "logout");
    const logoutItem = sideMenuData.find((item) => item.path === "logout");

    return (
        <div
            className={isMobile
                ? "w-full flex-1 flex flex-col justify-between"
                : `${isCollapsed ? 'w-20' : 'w-72'} side-menu-panel h-[calc(100vh-100px)] min-h-[560px] rounded-[28px] border sticky top-[85px] z-20 transition-all duration-300 ml-4 flex flex-col justify-between`}
        >
            {!isMobile && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-5 w-7 h-7 text-white rounded-full flex items-center justify-center z-30 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)' }}
                >
                    <HiChevronLeft className={`text-sm transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Top Section: User Profile & Nav Links */}
            <div>
                <div className={`flex flex-col items-center justify-center ${isMobile ? 'mb-5 pt-4' : 'mb-6 pt-7'} px-4`}>
                    <div className="relative">
                        <Avatar
                            src={user?.profilePicture}
                            name={user?.name}
                            alt="Profile Image"
                            className={`${!isMobile && isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} rounded-full object-cover transition-all duration-300 ring-4 ring-white/80 dark:ring-slate-800`}
                            fallbackClassName={`${!isMobile && isCollapsed ? 'w-12 h-12 text-sm' : 'w-20 h-20 text-xl'} flex items-center justify-center rounded-full transition-all duration-300 ring-4 ring-white/80 dark:ring-slate-800 bg-slate-300 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200`}
                        />
                    </div>

                    {(!isCollapsed || isMobile) && (
                        <>
                            {(user?.role === "admin" || user?.role === "super_admin") && (
                                <div
                                    className="text-[10px] font-semibold text-white px-3 py-1 rounded-full mt-2"
                                    style={{ background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)' }}
                                >
                                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                                </div>
                            )}

                            <h5 className="text-slate-950 dark:text-slate-100 font-semibold leading-6 mt-3 text-center">
                                {user?.name || ""}
                            </h5>

                            <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center break-all px-2">{user?.email || ""}</p>
                        </>
                    )}
                </div>

                <div className="px-3">
                    {navItems.map((item, index) => (
                        <button
                            key={`menu_${index}`}
                            className={`w-full flex items-center rounded-2xl ${!isMobile && isCollapsed ? 'justify-center' : 'gap-4'} text-[15px] py-3 ${!isMobile && isCollapsed ? 'px-0' : 'px-4'} mb-2.5 cursor-pointer transition-all duration-300 ${activeMenu == item.label
                                    ? 'text-white shadow-lg'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            style={activeMenu == item.label
                                ? {
                                    background: 'linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)',
                                    boxShadow: '0 14px 24px rgba(40, 80, 217, 0.22)',
                                }
                                : undefined}
                            onClick={() => handleClick(item.path)}
                            title={!isMobile && isCollapsed ? item.label : ''}
                        >
                            <item.icon className="text-xl shrink-0" />
                            {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Logout Button */}
            {logoutItem && (
                <div className="px-3 pb-4 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <button
                        className={`w-full flex items-center rounded-2xl ${!isMobile && isCollapsed ? 'justify-center' : 'gap-4'} text-[15px] py-3 ${!isMobile && isCollapsed ? 'px-0' : 'px-4'} cursor-pointer transition-all duration-300 text-slate-600 dark:text-slate-300 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400`}
                        onClick={() => handleClick(logoutItem.path)}
                        title={!isMobile && isCollapsed ? logoutItem.label : ''}
                    >
                        <logoutItem.icon className="text-xl shrink-0" />
                        {(!isCollapsed || isMobile) && <span>{logoutItem.label}</span>}
                    </button>
                </div>
            )}
        </div>
    );
}

export default SideMenu
