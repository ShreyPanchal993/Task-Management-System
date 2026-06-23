const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const BASE_URL = configuredBaseUrl || (import.meta.env.PROD ? "" : "http://localhost:8000");

export const API_PATHS = {
    AUTH: {
        CSRF_TOKEN: "/api/auth/csrf-token", // Get CSRF token cookie
        REGISTER: "/api/auth/register", // Register API endpoint
        LOGIN: "/api/auth/login", // Login API endpoint
        LOGOUT: "/api/auth/logout", // Logout API endpoint
        REFRESH_TOKEN: "/api/auth/refresh-token", // Refresh token API endpoint
        GET_PROFILE: "/api/auth/profile", // Get user profile API endpoint
    },
    
    USERS: {
        GET_ALL_USERS: "/api/users", // Get all users API endpoint (Admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID API endpoint
        CREATE_USER: "/api/users", // Create user API endpoint (Admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user API endpoint
        UPDATE_USER_ROLE: (userId) => `/api/users/${userId}/role`,
        DELETE_USER: (userId) => `/api/users/${userId}`, // Delete user API endpoint
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get dashboard data API endpoint
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get user-specific dashboard data API endpoint
        GET_ALL_TASKS: "/api/tasks", // Get all tasks API endpoint (Admin: all; User: only assigned tasks)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID API endpoint
        CREATE_TASK: "/api/tasks", // Create task API endpoint (Admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task API endpoint
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete task API endpoint
    
        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status API endpoint
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update task to-do checklist API endpoint
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // Export tasks API endpoint
        EXPORT_USERS: "/api/reports/export/users", // Export users API endpoint
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image", // Upload image API endpoint
    },
};
