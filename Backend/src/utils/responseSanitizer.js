const PROFILE_PICTURE_KEY_PATTERN = /^profile-pictures\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

const sanitizeProfilePicture = (value) => {
    if (typeof value !== "string" || !value) {
        return value;
    }

    const trimmedValue = value.trim();

    if (PROFILE_PICTURE_KEY_PATTERN.test(trimmedValue)) {
        return trimmedValue;
    }

    try {
        const parsedUrl = new URL(trimmedValue);
        const isS3ProfilePicture =
            parsedUrl.hostname.endsWith(".amazonaws.com") &&
            parsedUrl.hostname.includes(".s3") &&
            parsedUrl.pathname.startsWith("/profile-pictures/");

        return isS3ProfilePicture
            ? decodeURIComponent(parsedUrl.pathname.slice(1))
            : value;
    } catch {
        return value;
    }
};

const sanitizeResponseData = (data, seen = new WeakMap()) => {
    if (!data || typeof data !== "object" || data instanceof Date || Buffer.isBuffer(data)) {
        return data;
    }

    if (typeof data.toJSON === "function") {
        return sanitizeResponseData(data.toJSON(), seen);
    }

    if (seen.has(data)) {
        return seen.get(data);
    }

    if (Array.isArray(data)) {
        const sanitizedArray = [];
        seen.set(data, sanitizedArray);
        data.forEach((item) => sanitizedArray.push(sanitizeResponseData(item, seen)));
        return sanitizedArray;
    }

    const sanitizedObject = {};
    seen.set(data, sanitizedObject);

    Object.entries(data).forEach(([key, value]) => {
        sanitizedObject[key] = key === "profilePicture"
            ? sanitizeProfilePicture(value)
            : sanitizeResponseData(value, seen);
    });

    return sanitizedObject;
};

export { sanitizeProfilePicture, sanitizeResponseData };
