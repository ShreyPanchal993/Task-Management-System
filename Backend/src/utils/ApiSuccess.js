import httpStatus from "http-status";

class ApiSuccess {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        if (data) {
            this.data = data;
        }
    }

    static ok(res, message, data = null) {
        return res.status(httpStatus.OK).json(new ApiSuccess(httpStatus.OK, message, data));
    }

    static created(res, message, data = null) {
        return res.status(httpStatus.CREATED).json(new ApiSuccess(httpStatus.CREATED, message, data));
    }
}

export default ApiSuccess;
