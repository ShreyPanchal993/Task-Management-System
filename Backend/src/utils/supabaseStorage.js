import { createClient } from "@supabase/supabase-js";
import path from "path";
import ApiError from "./ApiError.js";

const requiredEnvVars = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_STORAGE_BUCKET",
];

const getMissingEnvVars = () => 
    requiredEnvVars.filter((envVar) => !process.env[envVar]);

const getSupabaseClient = () => {
    const missingEnvVars = getMissingEnvVars();

    if (missingEnvVars.length > 0) {
        throw ApiError.internal(
            `Missing Supabase storage configuration: ${missingEnvVars.join(", ")}`
        );
    }

    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
};

const buildStorageFilePath = (file) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    const folder = (process.env.SUPABASE_STORAGE_FOLDER || "profile-pictures")
        .trim()
        .replace(/^\/+|\/+$/g, "");
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;

    return folder ? `${folder}/${fileName}` : fileName;
};

export const uploadImageToSupabase = async (file) => {
    if (!file?.buffer) {
        throw ApiError.badRequest("No image file buffer provided");
    }

    const supabase = getSupabaseClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    const filePath = buildStorageFilePath(file);

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (uploadError) {
        throw ApiError.internal(uploadError.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
        path: filePath,
        publicUrl: data.publicUrl,
    };
};
