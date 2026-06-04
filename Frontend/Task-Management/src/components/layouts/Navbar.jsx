import React, { useContext, useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import SideMenu from './SideMenu';
import { UserContext } from '../../context/userContext';
import Modal from '../Modal';
import Input from '../Inputs/Input';
import ProfilePhotoSelector from '../Inputs/ProfilePhotoSelector';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
import Avatar from '../Avatar';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const { user, updateUser } = useContext(UserContext);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const openProfileModal = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setProfilePicture(null);
        setRemoveProfilePicture(false);
        setError('');
        setPasswordError('');
        setShowPasswordSection(false);
        setShowProfileModal(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let imageUrl = user?.profilePicture;

            if (removeProfilePicture) {
                imageUrl = '';
            } else if (profilePicture) {
                const uploadRes = await uploadImage(profilePicture);
                imageUrl = uploadRes.url;
            }

            const response = await axiosInstance.patch(API_PATHS.AUTH.GET_PROFILE, {
                name,
                email,
                profilePicture: imageUrl,
            });

            updateUser(response.data.data);
            setShowProfileModal(false);
            setProfilePicture(null);
            setRemoveProfilePicture(false);
        } catch (updateError) {
            setError(updateError.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');

        if (!currentPassword) {
            setPasswordError('Current password is required.');
            return;
        }

        if (!newPassword) {
            setPasswordError('Please enter a new password.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        try {
            await axiosInstance.patch(API_PATHS.AUTH.GET_PROFILE, { currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
        } catch (updateError) {
            setPasswordError(updateError.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <>
            <div
                className="flex items-center justify-between gap-5 border-b px-4 py-4 md:px-7 sticky top-0 z-30 backdrop-blur-xl"
                style={{
                    background: 'rgba(248, 244, 236, 0.72)',
                    borderColor: 'rgba(148, 163, 184, 0.14)',
                }}
            >
                <div className="flex items-center gap-5">
                    <button
                        className="block lg:hidden text-slate-700"
                        onClick={() => setOpenSideMenu(!openSideMenu)}
                    >
                        {openSideMenu ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
                    </button>

                    <div>
                        <p className="soft-label hidden md:block">Workspace</p>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Trackora</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{activeMenu}</p>
                    </div>

                    <button
                        onClick={openProfileModal}
                        className="w-11 h-11 rounded-full overflow-hidden border-2 shadow-lg hover:-translate-y-0.5"
                        style={{
                            borderColor: 'rgba(40, 80, 217, 0.24)',
                            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                        }}
                    >
                        <Avatar
                            src={user?.profilePicture}
                            name={user?.name}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            fallbackClassName="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-600"
                        />
                    </button>
                </div>

                {openSideMenu && (
                    <div className="fixed top-[77px] left-4 rounded-[28px] overflow-hidden lg:hidden">
                        <SideMenu
                            activeMenu={activeMenu}
                            isCollapsed={isCollapsed}
                            setIsCollapsed={setIsCollapsed}
                        />
                    </div>
                )}
            </div>

            <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
                <form onSubmit={handleUpdateProfile}>
                    <div className="flex flex-col items-center pb-5 mb-5 border-b soft-divider">
                        <ProfilePhotoSelector
                            image={profilePicture}
                            setImage={setProfilePicture}
                            existingImageUrl={removeProfilePicture ? null : user?.profilePicture}
                            onRemoveExisting={setRemoveProfilePicture}
                        />
                        <h3 className="mt-3 text-base font-semibold text-gray-900">{user?.name}</h3>
                        <span className="text-xs text-gray-400">{user?.email}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            label="Full Name"
                            placeholder="Enter your name"
                            type="text"
                        />
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email Address"
                            placeholder="Enter your email"
                            type="email"
                        />
                    </div>

                    <div className="border-t soft-divider mt-4 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowPasswordSection(!showPasswordSection);
                                setPasswordError('');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border"
                            style={{
                                background: 'rgba(248, 244, 236, 0.72)',
                                borderColor: 'rgba(148, 163, 184, 0.14)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(40, 80, 217, 0.12)' }}
                                >
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-800">Change Password</p>
                                    <p className="text-xs text-gray-400">Update your account password</p>
                                </div>
                            </div>

                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPasswordSection ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showPasswordSection && (
                            <div className="mt-3 space-y-1">
                                <Input
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    label="Current Password"
                                    placeholder="Enter current password"
                                    type="password"
                                />

                                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                                    <Input
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        label="New Password"
                                        placeholder="Min. 8 characters"
                                        type="password"
                                    />
                                    <Input
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        label="Confirm Password"
                                        placeholder="Re-enter password"
                                        type="password"
                                    />
                                </div>

                                {passwordError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl px-3 py-2">
                                        <span>!</span> {passwordError}
                                    </div>
                                )}

                                <button type="button" onClick={handleChangePassword} className="btn-primary mt-3">
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl px-3 py-2 mt-3">
                            <span>!</span> {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="btn-primary flex-1">
                            Save Changes
                        </button>
                        <button type="button" onClick={() => setShowProfileModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default Navbar
