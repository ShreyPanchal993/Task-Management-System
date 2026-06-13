import React, { useEffect, useState } from 'react'
import { LuUsers } from 'react-icons/lu'
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import Modal from '../Modal.jsx';
import AvatarGroup from '../AvatarGroup.jsx';
import toast from 'react-hot-toast';
import Avatar from '../Avatar.jsx';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);

    // Lazy fetch — only load users when the modal is opened for the first time
    const openModal = async () => {
        setIsModalOpen(true);
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
        setIsModalOpen(false);
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    // Keep temp selection in sync with prop when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setTempSelectedUsers(selectedUsers);
        }
    }, [isModalOpen]);

    const selectedUserAvatars = allUsers
        .filter(user => selectedUsers.includes(user._id))
        .map((user) => user.profilePicture);

    return (
        <div className="space-y-4 mt-2">
            {selectedUserAvatars.length === 0 ? (
                <button type="button" className="card-btn" onClick={openModal}>
                    <LuUsers className="text-sm" /> Add Members
                </button>
            ) : (
                <div className="cursor-pointer" onClick={openModal}>
                    <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title="Select Users"
            >
                <div className="space-y-4 h-[60vh] overflow-y-auto">
                    {allUsers.length === 0 ? (
                        <p className="text-center text-gray-500 pt-10">No users found</p>
                    ) : (
                        allUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-4 p-3 border-b border-gray-200"
                            >
                                <Avatar
                                    src={user.profilePicture}
                                    name={user.name}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    fallbackClassName="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                    <p className="text-[13px] text-gray-500">{user.email}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={tempSelectedUsers.includes(user._id)}
                                    onChange={() => toggleUserSelection(user._id)}
                                    className="w-4 h-4 accent-blue-600 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={handleClose} className="card-btn">
                        Cancel
                    </button>
                    <button type="button" onClick={handleAssign} className="card-btn-fill">
                        Done
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SelectUsers;
