export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const addThousandSeparator = (num) => {
    if (num == null || num === undefined) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;
}

export const extractS3Key = (url) => {
    if (!url) return null;

    if (typeof url === "string" && url.startsWith("profile-pictures/")) {
        return url;
    }

    try {
        const parsedUrl = new URL(url);
        const isS3Url = parsedUrl.hostname.endsWith(".amazonaws.com") && parsedUrl.hostname.includes(".s3");

        return isS3Url && parsedUrl.pathname.startsWith("/profile-pictures/")
            ? decodeURIComponent(parsedUrl.pathname.slice(1))
            : null;
    } catch {
        return null;
    }
};

