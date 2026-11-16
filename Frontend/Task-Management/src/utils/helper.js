export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const addThousandSeparator = (num) => {
    if (num == null || num === undefined) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;
};

export const extractStorageKey = (url) => {
    if (!url) return null;

    if (typeof url === "string" && url.startsWith("profile-pictures/")) {
        return url;
    }

    try {
        const parsedUrl = new URL(url);
        const isS3Url =
            parsedUrl.hostname.endsWith(".amazonaws.com") &&
            parsedUrl.hostname.includes(".s3") &&
            parsedUrl.pathname.startsWith("/profile-pictures/");

        if (isS3Url) {
            return decodeURIComponent(parsedUrl.pathname.slice(1));
        }

        const isSupabaseUrl =
            parsedUrl.hostname.endsWith(".supabase.co") &&
            parsedUrl.pathname.includes("/profile-pictures/");

        if (isSupabaseUrl) {
            const index = parsedUrl.pathname.indexOf("profile-pictures/");
            return decodeURIComponent(parsedUrl.pathname.slice(index));
        }

        return null;
    } catch {
        return null;
    }
};

// Backwards compatibility alias
export const extractS3Key = extractStorageKey;
