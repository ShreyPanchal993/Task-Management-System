import { BASE_URL } from "./apiPaths";

const ABSOLUTE_URL_PATTERN = /^(?:https?:|data:|blob:)/i;

const getAppOrigin = () => {
    if (typeof window !== "undefined" && window.location?.origin) {
        return window.location.origin;
    }

    return "";
};

export const resolveImageUrl = (value) => {
    if (!value || typeof value !== "string") {
        return "";
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return "";
    }

    if (ABSOLUTE_URL_PATTERN.test(trimmedValue)) {
        return trimmedValue;
    }

    const normalizedPath = trimmedValue.startsWith("/")
        ? trimmedValue
        : `/${trimmedValue}`;
    const baseOrigin = BASE_URL || getAppOrigin();

    if (!baseOrigin) {
        return normalizedPath;
    }

    return `${baseOrigin.replace(/\/+$/, "")}${normalizedPath}`;
};

export default resolveImageUrl;
