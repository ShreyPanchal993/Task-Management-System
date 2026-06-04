import React, { useRef, useState, useEffect } from 'react';
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";
import Avatar from '../Avatar';
import resolveImageUrl from '../../utils/resolveImageUrl';

const ProfilePhotoSelector = ({ image, setImage, existingImageUrl, onRemoveExisting }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(resolveImageUrl(existingImageUrl) || null);

    useEffect(() => {
        setPreviewUrl(resolveImageUrl(existingImageUrl) || null);
    }, [existingImageUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith?.("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (previewUrl?.startsWith?.("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }

            setImage(file);
            onRemoveExisting?.(false);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview); 
        }
    };

    const handleRemoveImage = () => {
        if (previewUrl?.startsWith?.("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setImage(null);
        onRemoveExisting?.(true);
        setPreviewUrl(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };

    return <div className="flex justify-center mb-6">
        <input 
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleImageChange}
            className="hidden"
        />

        {!previewUrl ? (
            <div className="w-20 h-20 flex items-center justify-center bg-blue-100/50 rounded-full relative cursor-pointer">
                <LuUser className="text-4xl text-primary" />
                <button 
                    type="button"
                    className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
                    onClick={onChooseFile}
                >
                    <LuUpload />
                </button>
            </div>
        ) : (
            <div className="relative">
                <Avatar
                    src={previewUrl}
                    name="Profile Photo"
                    alt="profile photo"
                    className="w-20 h-20 rounded-full object-cover"
                    fallbackClassName="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100/50 text-primary"
                />
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1"
                        onClick={handleRemoveImage}
                    >
                    <LuTrash />
                </button>
            </div>
        )}
    </div>
}

export default ProfilePhotoSelector
