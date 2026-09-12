import React, { useEffect, useRef, useState } from 'react'
import { LuCheck, LuChevronDown, LuSearch, LuUsers, LuX } from 'react-icons/lu'
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import AvatarGroup from '../AvatarGroup.jsx';
import toast from 'react-hot-toast';
import Avatar from '../Avatar.jsx';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [hasFetched, setHasFetched] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef(null);

    // Fetch users once on first open & check available viewport space
    const openPopover = async () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpward(spaceBelow < 280 && rect.top > spaceBelow);
        }
        setIsOpen(prev => !prev);
        if (hasFetched) return;
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            setAllUsers(response.data?.data || []);
            setHasFetched(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load users.");
        }
    };

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchTerm("");
        setTempSelectedUsers(selectedUsers);
    };

    // Keep temp selection in sync with props
    useEffect(() => {
        if (isOpen) {
            setTempSelectedUsers(selectedUsers);
            setSearchTerm("");
        }
    }, [isOpen, selectedUsers]);

    // Close on outside click or Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                handleClose();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, selectedUsers]);

    const selectedUserAvatars = allUsers
        .filter(user => selectedUsers.includes(user._id))
        .map((user) => user.profilePicture);

    const filteredUsers = allUsers.filter((user) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
    });

    return (
        <div className="relative w-full mt-2" ref={containerRef}>
            {/* Trigger Button / Avatar Group */}
            <button
                type="button"
                onClick={openPopover}
                className={`w-full h-[50px] text-sm outline-none px-4 py-3.5 rounded-2xl flex justify-between items-center border transition-all cursor-pointer ${isOpen ? 'ring-2 ring-primary/15' : 'hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300'
                    }`}
                style={{
                    color: "var(--text-strong)",
                    background: "var(--surface-1)",
                    borderColor: isOpen ? "var(--primary)" : "var(--border-soft)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
            >
                {selectedUserAvatars.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <LuUsers className={`text-base ${isOpen ? 'text-primary' : 'text-slate-400'}`} />
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Add Members</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} avatarClassName="w-6 h-6" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {selectedUsers.length} {selectedUsers.length === 1 ? 'member' : 'members'} assigned
                        </span>
                    </div>
                )}
                <span className="ml-2 text-slate-400 text-sm shrink-0">
                    <LuChevronDown
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''
                            }`}
                    />
                </span>
            </button>

            {/* Inline Floating Popover (Zero background dimming or blur) */}
            {isOpen && (
                <div
                    className={`absolute left-0 sm:left-auto sm:right-0 ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
                        } w-full sm:w-80 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.14)] p-2.5 z-30 animate-scale-in`}
                    style={{
                        background: "var(--popover-bg)",
                        backdropFilter: "blur(18px)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-1 pb-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            Assign Members
                        </span>
                        {tempSelectedUsers.length > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {tempSelectedUsers.length} selected
                            </span>
                        )}
                    </div>

                    {/* Member Search */}
                    <div className="mb-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <LuSearch className="text-slate-400 text-xs shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none w-full text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                                >
                                    <LuX className="text-[10px]" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Members List */}
                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-0.5 py-0.5">
                        {allUsers.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 text-xs">No users found</p>
                        ) : filteredUsers.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 text-xs">No members match "{searchTerm}"</p>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = tempSelectedUsers.includes(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUserSelection(user._id)}
                                        className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                                                ? 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-300/80 dark:border-sky-700/80 text-slate-900 dark:text-slate-100 shadow-xs'
                                                : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-slate-300/70 text-slate-700 dark:text-slate-200'
                                            }`}
                                    >
                                        <Avatar
                                            src={user.profilePicture}
                                            name={user.name}
                                            alt={user.name}
                                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200/70 dark:border-slate-700 shadow-xs"
                                            fallbackClassName="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 border border-primary/20"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                        </div>

                                        {/* Checkbox */}
                                        <div
                                            className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isSelected
                                                    ? 'bg-primary border-primary text-white shadow-xs'
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-slate-400'
                                                }`}
                                        >
                                            {isSelected && <LuCheck className="text-[9px] stroke-[3]" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Popover Footer */}
                    <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                        {tempSelectedUsers.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setTempSelectedUsers([])}
                                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                            >
                                Clear all
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssign}
                                className="px-3 py-1 text-xs font-semibold text-white rounded-full transition cursor-pointer shadow-sm hover:shadow active:scale-95"
                                style={{
                                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
                                }}
                            >
                                Done {tempSelectedUsers.length > 0 ? `(${tempSelectedUsers.length})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectUsers;

