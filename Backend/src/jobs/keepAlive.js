import logger from "../config/logger.js";

/**
 * Keep-alive cron job — prevents Render free-tier from sleeping the container.
 * Pings the health endpoint every 14 minutes via the external URL
 * so it registers as real inbound traffic with Render's proxy.
 *
 * No-op when RENDER_EXTERNAL_URL is not set (i.e. local development).
 */
const KEEP_ALIVE_MS = 14 * 60 * 1000; // 14 minutes

const startKeepAliveJob = () => {
    const externalUrl = process.env.RENDER_EXTERNAL_URL;

    if (!externalUrl) {
        logger.info("Keep-alive skipped — RENDER_EXTERNAL_URL not set");
        return;
    }

    const healthUrl = `${externalUrl}/api/health`;

    setInterval(() => {
        fetch(healthUrl)
            .then(() => logger.info("Keep-alive ping sent"))
            .catch(() => logger.warn("Keep-alive ping failed"));
    }, KEEP_ALIVE_MS);

    logger.info(`Keep-alive enabled — pinging ${healthUrl} every 14m`);
};

export default startKeepAliveJob;
