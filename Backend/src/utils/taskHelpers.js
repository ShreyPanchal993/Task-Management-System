/**
 * Shared task helper utilities used across controller, service, and repository layers.
 * Centralised here to avoid duplication.
 */

export const canManageAllTasks = (user) =>
    user.role === "admin" || user.role === "super_admin";
