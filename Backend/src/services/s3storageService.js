import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import path from "path";
import ApiError from "./../utils/ApiError.js";

// Read env vars lazily (inside functions) so dotenv.config() has already run
const getS3Config = () => ({
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const getS3Client = () => {
    const { region, accessKeyId, secretAccessKey } = getS3Config();
    return new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
    });
};

const buildS3FilePath = (file) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const random = Math.random().toString(36).substring(2, 10);
    return `profile-pictures/${Date.now()}-${random}${extension}`;
};

const getObjectUrl = (key) => {
    const { bucketName, region } = getS3Config();
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

const uploadImageToS3 = async (file) => {
    if (!file?.buffer) {
        throw ApiError.badRequest("No image file provided");
    }

    const { bucketName } = getS3Config();
    const key = buildS3FilePath(file);

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await getS3Client().send(command);
    } catch (err) {
        throw ApiError.internal(`S3 upload failed: ${err.message}`);
    }

    return {
        key,
        publicUrl: getObjectUrl(key),
    };
};

const getPreSignedUrl = async (key) => {
    const { bucketName } = getS3Config();

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key:key
    })

    let url;
    try{
        url = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
    } catch (err) {
        throw ApiError.internal(`S3 fetch failed: ${err.message}`);
    }

    return url;
};

const deleteImageFromS3 = async (key) => {
    const { bucketName } = getS3Config();

    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
    });

    try{
        await getS3Client().send(command)
    } catch (err) {
        throw ApiError.internal(`S3 delete failed: ${err.message}`);
    }

    return {deleted: true, key};
};

export {getObjectUrl, uploadImageToS3, getPreSignedUrl, deleteImageFromS3}