import { API_PATHS } from "./apiPaths.js";
import axiosInstance from "./axiosInstance.js";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append the image file to the FormData 
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Set header for file upload
            },
        });
        return response.data; // Assuming the response contains the uploaded image URL or relevant data
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    };
};

export default uploadImage;
