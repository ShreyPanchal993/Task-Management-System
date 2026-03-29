import httpStatus from "http-status";

class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;
        if (errors) {
            this.errors = errors;
        }
    }

    static badRequest(message, errors = null) {
        return new ApiError(httpStatus.BAD_REQUEST, message, errors);
    }

    static conflict(message = "Conflict") {
        return new ApiError(httpStatus.CONFLICT, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new ApiError(httpStatus.UNAUTHORIZED, message);
    }

    static forbidden(message = "Forbidden") {
        return new ApiError(httpStatus.FORBIDDEN, message);
    }

    static notFound(message = "Not Found") {
        return new ApiError(httpStatus.NOT_FOUND, message);
    }

    static internal(message = "Internal Server Error") {
        return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message);
    }
}

export default ApiError;
