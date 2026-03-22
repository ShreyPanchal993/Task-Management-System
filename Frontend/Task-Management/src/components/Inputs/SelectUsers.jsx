import React, { useEffect, useState } from 'react'
import { LuUsers } from 'react-icons/lu'
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import Modal from '../Modal.jsx';
import AvatarGroup from '../AvatarGroup.jsx';
import toast from 'react-hot-toast';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModelOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            setAllUsers(response.data?.data || []);
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
        setIsModelOpen(false);
    };

    const selectedUserAvatars = allUsers
        .filter(user => selectedUsers.includes(user._id))
        .map((user) => user.profilePicture);

    useEffect(() => {
        getAllUsers();
    }, []);

    useEffect(() => {
        setTempSelectedUsers(selectedUsers);
    }, [selectedUsers, isModalOpen]);

    return (
        <div className="space-y-4 mt-2">
            {selectedUserAvatars.length === 0 && (
                <button className="card-btn" onClick={() => setIsModelOpen(true)}>
                    <LuUsers className="text-sm" /> Add Members
                </button>
            )}

            {selectedUserAvatars.length > 0 && (
                <div className="cursor-pointer" onClick={() => setIsModelOpen(true)}>
                    <AvatarGroup avatars={selectedUserAvatars} maxVisible={3}/>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModelOpen(false)}
                title="Select Users"
            >
                <div className="space-y-4 h-[60vh] overflow-y-auto">
                    {allUsers.length === 0 ? (
                        <p className="text-center text-gray-500">No users found</p>
                    ) : (
                        allUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-4 p-3 border-b border-gray-200"
                            >
                                <img 
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />

                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                        {user.name}
                                    </p>
                                    <p className="text-[13px] text-gray-500">
                                        {user.email}
                                    </p>
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
                    <button
                        onClick={() => setIsModelOpen(false)}
                        className="card-btn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        className="card-btn-fill"
                    >
                        Done
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default SelectUsers
