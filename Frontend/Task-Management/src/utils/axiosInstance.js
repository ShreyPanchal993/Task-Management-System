import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";
import { tokenStore } from "./tokenStore";

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
    (config) => {
        const accessToken = tokenStore.get();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const response = await axios.post(
                    `${BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
                    {},
                    { withCredentials: true }
                );
                
                const newAccessToken = response.data.data.token;
                tokenStore.set(newAccessToken);
                
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                tokenStore.clear();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        } else if (error.response?.status === 500) {
            console.log("Server error. Please try again later.");
        } else if (error.code === "ECONNABORTED") {
            console.log("Request timeout. Please try again.");
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;