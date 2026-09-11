import { useEffect, useRef, useState, useMemo } from "react";
import { BASE_URL } from "./apiPaths";
import { ensureCsrfToken } from "./csrf";

/**
 * Shared singleton state so every component that calls useServerStatus()
 * piggy-backs on a single warmup attempt instead of firing its own.
 */
let globalStatus = "idle"; // "idle" | "checking" | "connected" | "error"
let globalListeners = new Set();
let warmupPromise = null;

const notify = (status) => {
  globalStatus = status;
  globalListeners.forEach((fn) => fn(status));
};

const BACKOFF_BASE_MS = 1500;
const MAX_RETRIES = 3;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ping the backend health endpoint with exponential backoff.
 * Resolves `true` on success, `false` after all retries fail.
 */
const pingWithRetry = async () => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, {
        method: "GET",
        // Short timeout per attempt — we retry rather than wait forever
        signal: AbortSignal.timeout(attempt === 0 ? 8000 : 15000),
      });
      if (res.ok) return true;
    } catch {
      // Network error or timeout — fall through to retry
    }

    if (attempt < MAX_RETRIES) {
      await delay(BACKOFF_BASE_MS * 2 ** attempt);
    }
  }

  return false;
};

/**
 * The actual warmup sequence:
 * 1. Ping health endpoint (with retries) to wake the Render container
 * 2. Pre-fetch CSRF token so auth POST requests don't need an extra round-trip
 */
const startWarmup = () => {
  if (warmupPromise) return warmupPromise;

  notify("checking");

  warmupPromise = (async () => {
    const alive = await pingWithRetry();

    if (!alive) {
      notify("error");
      return;
    }

    // Backend is up — eagerly grab CSRF token in the background
    try {
      await ensureCsrfToken();
    } catch {
      // Non-fatal — the axios interceptor will retry if needed
    }

    notify("connected");
  })();

  return warmupPromise;
};

/**
 * Hook: useServerStatus
 *
 * Returns the current backend connection state. On first call (globally),
 * triggers a warmup ping with exponential backoff + eager CSRF fetch.
 *
 * @returns {{
 *   status: "idle" | "checking" | "connected" | "error",
 *   isReady: boolean,
 *   isChecking: boolean,
 *   retry: () => void,
 * }}
 */
const useServerStatus = () => {
  const [status, setStatus] = useState(globalStatus);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const listener = (newStatus) => {
      if (mounted.current) setStatus(newStatus);
    };

    globalListeners.add(listener);

    // Kick off warmup if nobody has yet
    if (globalStatus === "idle") {
      startWarmup();
    }

    // Sync in case warmup already finished before this component mounted
    setStatus(globalStatus);

    return () => {
      mounted.current = false;
      globalListeners.delete(listener);
    };
  }, []);

  const retry = useMemo(
    () => () => {
      warmupPromise = null;
      globalStatus = "idle";
      startWarmup();
    },
    []
  );

  return {
    status,
    isReady: status === "connected",
    isChecking: status === "checking",
    retry,
  };
};

export default useServerStatus;
