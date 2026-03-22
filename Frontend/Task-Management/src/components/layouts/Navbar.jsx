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

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { user, updateUser } = useContext(UserContext);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = user?.profilePicture;
            
            if (profilePicture) {
                const uploadRes = await uploadImage(profilePicture);
                imageUrl = uploadRes.url;
            }

            const updateData = { name, email, profilePicture: imageUrl };
            if (password) updateData.password = password;

            const response = await axiosInstance.patch(API_PATHS.AUTH.GET_PROFILE, updateData);
            
            updateUser({ ...response.data.data, token: localStorage.getItem('token') });
            setShowProfileModal(false);
            setPassword('');
            setProfilePicture(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <>
        <div className="flex justify-between items-center gap-5 bg-white border border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
            <div className="flex items-center gap-5">
                <button 
                    className="block lg:hidden text-black"
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                >
                    {openSideMenu ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
                </button>
                <h2 className="text-lg font-medium text-black">Task Management</h2>
            </div>

            <button 
                onClick={() => {
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                    setShowProfileModal(true);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary hover:border-blue-600 transition-colors"
            >
                <img 
                    src={user?.profilePicture || "https://via.placeholder.com/40"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                />
            </button>

            {openSideMenu && (
                <div className="fixed top-[61px] -ml-4 bg-white">
                    <SideMenu activeMenu={activeMenu} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                </div>
            )}
        </div>

        <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}>
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
                <ProfilePhotoSelector 
                    image={profilePicture} 
                    setImage={setProfilePicture}
                    existingImageUrl={user?.profilePicture}
                />
                
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    label="Name"
                    placeholder="Enter your name"
                    type="text"
                />
                
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                />
                
                <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="New Password (optional)"
                    placeholder="Leave blank to keep current"
                    type="password"
                />

                {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                <div className="flex gap-3 mt-4">
                    <button type="submit" className="btn-primary flex-1">Update Profile</button>
                    <button type="button" onClick={() => setShowProfileModal(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        </Modal>
        </>
    )
}

export default Navbar