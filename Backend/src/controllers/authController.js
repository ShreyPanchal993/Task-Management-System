import * as authService from "../services/authService.js";
import * as s3storageService from "../services/s3storageService.js"
import ApiSuccess from "../utils/ApiSuccess.js";
import ApiError from "../utils/ApiError.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookieOptions.js";
import { clearCsrfCookie, setCsrfCookie } from "../utils/csrf.js";

const resolveApiError = (error) => (
    error instanceof ApiError
        ? error
        : ApiError.internal(error.message)
);

const getProfilePictureKey = (filename) => (
    filename ? `profile-pictures/${filename}` : null
);

const registerUser = async (req, res) => {
    try{
        const { name, email, password, profilePicture } = req.body;
    
        const response = await authService.registerUser(
            {
                name, 
                email, 
                password, 
                profilePicture,
            }
        );

        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);

        return ApiSuccess.created(res, "User registered successfully", { user: response.user, csrfToken });
    }catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;
        const deviceInfo = req.headers['user-agent'] || 'unknown';

        const response = await authService.loginUser(email, password, deviceInfo);

        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);

        return ApiSuccess.ok(res, "User logged in successfully", { user: response.user, csrfToken });
    }catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            const apiError = ApiError.badRequest("No image uploaded");
            return res.status(apiError.statusCode).json(apiError);
        }

        const { key } = await s3storageService.uploadImageToS3(req.file);

        return ApiSuccess.ok(res, "Image uploaded successfully", { key });
    } catch (error) {
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
}

const getImageUrl = async (req, res) => {
    try{
        const key = getProfilePictureKey(req.params.filename);

        if (!key) {
            const apiError = ApiError.badRequest("Image filename is required");
            return res.status(apiError.statusCode).json(apiError);
        }

        const preSignedUrl = await s3storageService.getPreSignedUrl(key);

        return ApiSuccess.ok(res, "Image fetched successfully", { url: preSignedUrl })
    } catch (error) {
        const apiError = resolveApiError(error)
        return res.status(apiError.statusCode).json(apiError);
    }
}

const deleteImage = async (req, res) => {
    try{
        const key = getProfilePictureKey(req.params.filename);

        if (!key) {
            const apiError = ApiError.badRequest("Image filename is required");
            return res.status(apiError.statusCode).json(apiError)
        }

        await s3storageService.deleteImageFromS3(key);

        return ApiSuccess.ok(res, "Image deleted successfully", { deleted: true });
    } catch (error) {
        const apiError = resolveApiError(error)
        return res.status(apiError.statusCode).json(apiError);
    }
}

const getUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;

        const user = await authService.getUserProfile(userId);

        return ApiSuccess.ok(res, "User profile fetched successfully", user);
    }catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const updateUserProfile = async (req, res) => {
    try{
        const userId = req.user.id;
        const { name, email, profilePicture, currentPassword, newPassword } = req.body;

        if (!userId) {
            const apiError = ApiError.notFound("User not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        const updatedUser = await authService.updateUserProfile(userId, { name, email, profilePicture, currentPassword, newPassword });

        return ApiSuccess.ok(res, "User profile updated successfully", updatedUser);
    }catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const logoutUser = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }
        clearAuthCookies(res);
        clearCsrfCookie(res);
        return ApiSuccess.ok(res, "User logged out successfully");
    }catch(error){
        const apiError = resolveApiError(error);
        return res.status(apiError.statusCode).json(apiError);
    }
};

const refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            const apiError = ApiError.unauthorized("No refresh token");
            return res.status(apiError.statusCode).json(apiError);
        }
        
        const response = await authService.refreshAccessToken(refreshToken);
        
        setAuthCookies(res, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
        });
        const csrfToken = setCsrfCookie(res);
        
        return ApiSuccess.ok(res, "Token refreshed successfully", { csrfToken });
    }catch(error){
        clearAuthCookies(res);
        clearCsrfCookie(res);
        const apiError = ApiError.forbidden("Invalid or expired refresh token");
        return res.status(apiError.statusCode).json(apiError);
    }
};

export { registerUser, loginUser, uploadImage, getImageUrl, deleteImage, getUserProfile, updateUserProfile, logoutUser, refreshToken };
