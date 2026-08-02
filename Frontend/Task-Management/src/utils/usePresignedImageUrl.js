import { useEffect, useState } from "react";
import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";
import { extractS3Key } from "./helper";
import resolveImageUrl from "./resolveImageUrl";

const IMAGE_URL_TTL_MS = 14 * 60 * 1000;
const signedUrlCache = new Map();

const getCachedSignedUrl = async (key) => {
    const cachedImage = signedUrlCache.get(key);

    if (cachedImage?.url && cachedImage.expiresAt > Date.now()) {
        return cachedImage.url;
    }

    if (cachedImage?.request) {
        return cachedImage.request;
    }

    const request = axiosInstance
        .get(API_PATHS.IMAGE.GET_IMAGE(key))
        .then((response) => {
            const url = response.data?.data?.url;

            if (!url) {
                throw new Error("Image URL was not returned");
            }

            signedUrlCache.set(key, { url, expiresAt: Date.now() + IMAGE_URL_TTL_MS });
            return url;
        })
        .catch((error) => {
            signedUrlCache.delete(key);
            throw error;
        });

    signedUrlCache.set(key, { request });
    return request;
};

const usePresignedImageUrl = (source) => {
    const key = extractS3Key(source);
    const [url, setUrl] = useState(() => (key ? "" : resolveImageUrl(source)));

    useEffect(() => {
        let isCurrent = true;

        if (!key) {
            setUrl(resolveImageUrl(source));
            return () => {
                isCurrent = false;
            };
        }

        setUrl("");

        const loadImageUrl = async () => {
            try {
                const signedUrl = await getCachedSignedUrl(key);

                if (isCurrent) {
                    setUrl(signedUrl);
                }
            } catch {
                if (isCurrent) {
                    setUrl("");
                }
            }
        };

        loadImageUrl();

        const refreshTimer = window.setTimeout(loadImageUrl, IMAGE_URL_TTL_MS + 1000);

        return () => {
            isCurrent = false;
            window.clearTimeout(refreshTimer);
        };
    }, [key, source]);

    return url;
};

export default usePresignedImageUrl;
