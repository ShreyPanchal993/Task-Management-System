const isProduction = process.env.NODE_ENV === "production";
const sameSite = isProduction ? "strict" : "lax";

export const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/",
};

export const csrfCookieOptions = {
    httpOnly: false,
    secure: isProduction,
    sameSite,
    path: "/",
};

export const accessCookieOptions = {
    ...authCookieOptions,
    maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearCookieOptions = {
    secure: isProduction,
    sameSite,
    path: "/",
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
    if (accessToken) {
        res.cookie("accessToken", accessToken, accessCookieOptions);
    }

    if (refreshToken) {
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    }
};

export const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);
};
