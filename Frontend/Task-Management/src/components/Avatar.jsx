import React, { useMemo, useState, useEffect } from "react";

const getInitials = (name = "") => {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (!parts.length) {
        return "U";
    }

    return parts.map((part) => part[0].toUpperCase()).join("");
};

const Avatar = ({
    src,
    name,
    alt = "Profile",
    className = "",
    fallbackClassName = "",
}) => {
    const [hasImageError, setHasImageError] = useState(false);
    const initials = useMemo(() => getInitials(name), [name]);
    const shouldShowImage = Boolean(src) && !hasImageError;

    useEffect(() => {
        setHasImageError(false);
    }, [src]);

    if (shouldShowImage) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setHasImageError(true)}
            />
        );
    }

    return (
        <div
            className={fallbackClassName || className}
            aria-label={alt}
            role="img"
            title={name || "User"}
        >
            <span>{initials}</span>
        </div>
    );
};

export default Avatar;
