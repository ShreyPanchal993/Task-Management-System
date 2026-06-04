const normalizeBaseUrl = (url = "") => url.trim().replace(/\/+$/, "");

export const getPublicServerUrl = (req) => {
    const configuredBaseUrl = normalizeBaseUrl(
        process.env.PUBLIC_SERVER_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        ""
    );

    if (configuredBaseUrl) {
        return configuredBaseUrl;
    }

    const forwardedProto = req.get("x-forwarded-proto");
    const forwardedHost = req.get("x-forwarded-host");

    if (forwardedProto && forwardedHost) {
        return normalizeBaseUrl(`${forwardedProto}://${forwardedHost}`);
    }

    return normalizeBaseUrl(`${req.protocol}://${req.get("host")}`);
};

export const buildPublicUploadUrl = (req, filename) =>
    `${getPublicServerUrl(req)}/uploads/${filename}`;
