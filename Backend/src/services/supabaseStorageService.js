import { createClient } from "@supabase/supabase-js";
import path from "path";
import ApiError from "../utils/ApiError.js";

const getSupabaseConfig = () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "profile-pictures";

    if (!url || !serviceRoleKey) {
        const missing = [];
        if (!url) missing.push("SUPABASE_URL");
        if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
        throw ApiError.internal(
            `Supabase storage is not configured properly. Missing: ${missing.join(", ")}. Please update your .env file.`
        );
    }

    return {
        url,
        serviceRoleKey,
        bucketName,
    };
};

let cachedClient = null;
let cachedClientKey = null;

const getSupabaseClient = () => {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const clientKey = `${url}:${serviceRoleKey}`;

    if (!cachedClient || cachedClientKey !== clientKey) {
        cachedClient = createClient(url, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });
        cachedClientKey = clientKey;
    }

    return cachedClient;
};

const buildStorageFilePath = (file) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const random = Math.random().toString(36).substring(2, 10);
    return `profile-pictures/${Date.now()}-${random}${extension}`;
};

const normalizeStoragePath = (key) => {
    if (!key || typeof key !== "string") {
        return "";
    }
    return key.trim().replace(/^\/+/, "");
};

/**
 * Upload an image buffer to Supabase Storage
 * @param {Object} file - Multer file object
 * @returns {Promise<{ key: string, publicUrl?: string }>}
 */
const uploadImageToSupabase = async (file) => {
    if (!file?.buffer) {
        throw ApiError.badRequest("No image file provided");
    }

    const { bucketName } = getSupabaseConfig();
    const supabase = getSupabaseClient();
    const key = buildStorageFilePath(file);

    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(key, file.buffer, {
            contentType: file.mimetype || "image/jpeg",
            upsert: true,
        });

    if (uploadError) {
        throw ApiError.internal(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(key);

    return {
        key,
        publicUrl: publicData?.publicUrl,
    };
};

/**
 * Get a signed URL for an image in Supabase Storage.
 * Falls back to public URL if signed URL creation is not supported or if the bucket is public.
 * @param {string} key - Image storage path/key (e.g. profile-pictures/123.jpg)
 * @param {number} expiresIn - Expiry time in seconds (default 3600 = 1 hour)
 * @returns {Promise<string>}
 */
const getPreSignedUrl = async (key, expiresIn = 3600) => {
    const normalizedKey = normalizeStoragePath(key);
    if (!normalizedKey) {
        throw ApiError.badRequest("Image key is required");
    }

    const { bucketName } = getSupabaseConfig();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(normalizedKey, expiresIn);

    if (error || !data?.signedUrl) {
        // Fall back to getPublicUrl if signed URL creation failed (e.g. public bucket or permission)
        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(normalizedKey);

        if (publicData?.publicUrl) {
            return publicData.publicUrl;
        }

        throw ApiError.internal(`Supabase fetch failed: ${error?.message || "Could not generate image URL"}`);
    }

    return data.signedUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param {string} key - Image storage path/key
 * @returns {Promise<{ deleted: boolean, key: string }>}
 */
const deleteImageFromSupabase = async (key) => {
    const normalizedKey = normalizeStoragePath(key);
    if (!normalizedKey) {
        return { deleted: false, key: "" };
    }

    const { bucketName } = getSupabaseConfig();
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
        .from(bucketName)
        .remove([normalizedKey]);

    if (error) {
        throw ApiError.internal(`Supabase delete failed: ${error.message}`);
    }

    return { deleted: true, key: normalizedKey };
};

// Aliases for seamless drop-in backwards compatibility with existing codebase
const uploadImageToS3 = uploadImageToSupabase;
const deleteImageFromS3 = deleteImageFromSupabase;
const getSignedUrl = getPreSignedUrl;

export {
    uploadImageToSupabase,
    getPreSignedUrl,
    getSignedUrl,
    deleteImageFromSupabase,
    uploadImageToS3,
    deleteImageFromS3,
};
