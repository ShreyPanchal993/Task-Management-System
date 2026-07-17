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
    try {
        return new URL(url).pathname.slice(1);
    } catch {
        return null;
    }
};

