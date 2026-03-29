import React from 'react'
import resolveImageUrl from '../utils/resolveImageUrl';

const AvatarGroup = ({ avatars, maxVisible}) => {
    return (
        <div className="flex items-center">
            {avatars.slice(0, maxVisible).map((avatar, index) => (
                <img 
                    key={index} 
                    src={resolveImageUrl(avatar)}
                    alt={`Avatar ${index}`}
                    className="w-9 h-9 rounded-full border-2 border-white/85 shadow-sm -ml-3 first:ml-0 object-cover"
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
