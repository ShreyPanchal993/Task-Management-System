/**
 * @deprecated This service previously used AWS S3. It now forwards all operations
 * to the Supabase Storage service (supabaseStorageService.js).
 */
export {
    uploadImageToSupabase as uploadImageToS3,
    getPreSignedUrl,
    getSignedUrl,
    deleteImageFromSupabase as deleteImageFromS3,
    uploadImageToSupabase,
    deleteImageFromSupabase,
} from "./supabaseStorageService.js";
