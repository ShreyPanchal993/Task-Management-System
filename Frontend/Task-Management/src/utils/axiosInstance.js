import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";
import { ensureCsrfToken, getCsrfToken, setCsrfToken } from "./csrf";

const SAFE_METHODS = new Set(["get", "head", "options"]);
const PUBLIC_PATHS = new Set(["/", "/login", "/signUp"]);

const isPublicPath = (pathname = "") => PUBLIC_PATHS.has(pathname);

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const method = (config.method || "get").toLowerCase();
        const needsCsrfProtection = !SAFE_METHODS.has(method);
        const isCsrfBootstrapRequest = config.url === API_PATHS.AUTH.CSRF_TOKEN;

        if (needsCsrfProtection && !isCsrfBootstrapRequest) {
            await ensureCsrfToken();
            const csrfToken = getCsrfToken();

            if (csrfToken) {
                config.headers["X-CSRF-Token"] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => {
        const csrfToken = response.data?.data?.csrfToken;

        if (csrfToken) {
            setCsrfToken(csrfToken);
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const currentPath = window.location.pathname;
        const isProfileBootstrapRequest = originalRequest?.url === API_PATHS.AUTH.GET_PROFILE;
        const isOnPublicRoute = isPublicPath(currentPath);

        if (isProfileBootstrapRequest && isOnPublicRoute && error.response?.status === 401) {
            return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            
            try {
                await ensureCsrfToken();

                const csrfToken = getCsrfToken();

                await axios.post(
                    `${BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
                    {},
                    {
                        withCredentials: true,
                        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
                    }
                );
                
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                if (!isOnPublicRoute) {
                    window.location.href = "/";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
