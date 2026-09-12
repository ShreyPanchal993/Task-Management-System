import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { extractS3Key } from '../../utils/helper';
import ThemeToggle from '../ThemeToggle';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const { user, updateUser } = useContext(UserContext);
    const location = useLocation();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Close mobile drawer on route change
    useEffect(() => {
        setOpenSideMenu(false);
    }, [location.pathname]);

    // Close mobile drawer on Escape key and lock background scroll
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setOpenSideMenu(false);
            }
        };

        if (openSideMenu) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [openSideMenu]);

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
            const oldImageKey = extractS3Key(user?.profilePicture);
            let imageKey = oldImageKey || '';

            if (removeProfilePicture) {
                // User clicked remove — delete old image from S3 if it exists
                imageKey = '';
                if (oldImageKey) {
                    try {
                        await axiosInstance.delete(API_PATHS.IMAGE.DELETE_IMAGE(oldImageKey));
                    } catch {
                        // non-blocking — profile update continues even if S3 delete fails
                    }
                }
            } else if (profilePicture) {
                // User selected a new image — upload it, then delete the old one
                const uploadRes = await uploadImage(profilePicture);
                imageKey = uploadRes.data?.key;

                if (oldImageKey) {
                    try {
                        await axiosInstance.delete(API_PATHS.IMAGE.DELETE_IMAGE(oldImageKey));
                    } catch {
                        // non-blocking
                    }
                }
            }

            const response = await axiosInstance.patch(API_PATHS.AUTH.GET_PROFILE, {
                name,
                email,
                profilePicture: imageKey,
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
            <header className="app-header sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 md:px-7 py-3 border-b backdrop-blur-xl">
                <div className="flex items-center gap-3 md:gap-5">
                    <button
                        className="flex lg:hidden text-slate-700 dark:text-slate-200 p-1.5 -ml-1 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        onClick={() => setOpenSideMenu(!openSideMenu)}
                        aria-label={openSideMenu ? "Close navigation menu" : "Open navigation menu"}
                    >
                        {openSideMenu ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
                    </button>

                    <div>
                        <p className="soft-label hidden md:block">Workspace</p>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Trackora</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <ThemeToggle />

                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activeMenu}</p>
                    </div>

                    <button
                        onClick={openProfileModal}
                        className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 shadow-md hover:-translate-y-0.5 transition-transform cursor-pointer border-blue-500/30"
                        style={{
                            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.1)',
                        }}
                    >
                        <Avatar
                            src={user?.profilePicture}
                            name={user?.name}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            fallbackClassName="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300"
                        />
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${openSideMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setOpenSideMenu(false)}
                aria-hidden="true"
            />

            {/* Mobile Off-canvas Slide Drawer */}
            <aside
                className={`mobile-drawer-panel fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col lg:hidden transition-transform duration-300 ease-out shadow-2xl ${openSideMenu ? 'translate-x-0' : '-translate-x-full'
                    }`}
                aria-label="Mobile Navigation"
            >
                {/* Mobile Drawer Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b shrink-0 soft-divider"
                >
                    <div>
                        <p className="soft-label">Workspace</p>
                        <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Trackora</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setOpenSideMenu(false)}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                            aria-label="Close menu"
                        >
                            <HiOutlineX className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer Menu Content */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    <SideMenu
                        activeMenu={activeMenu}
                        isCollapsed={false}
                        setIsCollapsed={setIsCollapsed}
                        isMobile={true}
                        onClose={() => setOpenSideMenu(false)}
                    />
                </div>
            </aside>

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
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer bg-slate-100/70 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/80"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 dark:bg-primary/20"
                                >
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Change Password</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-400">Update your account password</p>
                                </div>
                            </div>

                            <svg
                                className={`w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${showPasswordSection ? 'rotate-180' : ''}`}
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
};

export default Navbar;
