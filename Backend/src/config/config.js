const config = {
    aws: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.AWS_S3_BUCKET
    },
    mongodb: {
        uri: process.env.MONGO_URI 
    },

    supdabase: {
        url: process.env.SUPABASE_URL,
        roleKey:process.env.SUPABASE_SERVICE_ROLE_KEY,
        storageKey: process.env.SUPABASE_STORAGE_BUCKET
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
};

export default config;