import React from 'react'
import Avatar from './Avatar';

const AvatarGroup = ({ avatars, maxVisible, avatarClassName = "w-9 h-9" }) => {
    const isSmall = avatarClassName.includes("w-6") || avatarClassName.includes("w-7");
    const overlapClass = isSmall ? "-ml-2" : "-ml-3";

    return (
        <div className="flex items-center">
            {avatars.slice(0, maxVisible).map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar}
                    name={`User ${index + 1}`}
                    alt={`Avatar ${index + 1}`}
                    className={`${avatarClassName} rounded-full border-2 border-white/85 dark:border-slate-800 shadow-sm ${overlapClass} first:ml-0 object-cover`}
                    fallbackClassName={`${avatarClassName} flex items-center justify-center rounded-full border-2 border-white/85 dark:border-slate-800 shadow-sm ${overlapClass} first:ml-0 bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300`}
                />
            ))}
            {avatars.length > maxVisible && (
                <div
                    className={`${avatarClassName} flex items-center justify-center ${isSmall ? 'text-[10px]' : 'text-sm'} font-medium rounded-full border-2 border-white/85 dark:border-slate-800 ${overlapClass}`}
                    style={{ background: "rgba(40, 80, 217, 0.12)", color: "var(--primary)" }}
                >
                    +{avatars.length - maxVisible}
                </div>
            )}
        </div>
    )
}

export default AvatarGroup
