import React from 'react'
import Avatar from './Avatar';

const AvatarGroup = ({ avatars, maxVisible}) => {
    return (
        <div className="flex items-center">
            {avatars.slice(0, maxVisible).map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar}
                    name={`User ${index + 1}`}
                    alt={`Avatar ${index + 1}`}
                    className="w-9 h-9 rounded-full border-2 border-white/85 shadow-sm -ml-3 first:ml-0 object-cover"
                    fallbackClassName="w-9 h-9 flex items-center justify-center rounded-full border-2 border-white/85 shadow-sm -ml-3 first:ml-0 bg-slate-200 text-xs font-semibold text-slate-600"
                />
            ))}
            {avatars.length > maxVisible && (
                <div className="w-9 h-9 flex items-center justify-center text-sm font-medium rounded-full border-2 border-white/85 -ml-3" style={{ background: "rgba(40, 80, 217, 0.12)", color: "var(--primary)" }}>
                    +{avatars.length - maxVisible}
                </div>
            )}
        </div>
    )
}

export default AvatarGroup
