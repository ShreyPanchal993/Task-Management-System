const config = {
    supabase: {
        url: process.env.SUPABASE_URL,
        serviceRoleKey:
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.SUPABASE_SECRET_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            process.env.SUPABASE_KEY,
        bucketName: process.env.SUPABASE_STORAGE_BUCKET || "profile-pictures",
    },

    // Legacy typo alias for backwards compatibility
    supdabase: {
        url: process.env.SUPABASE_URL,
        roleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        storageKey: process.env.SUPABASE_STORAGE_BUCKET || "profile-pictures",
    },

    mongodb: {
        uri: process.env.MONGO_URI,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
};

export default config;
