import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";

const CSRF_STORAGE_KEY = "csrfToken";

let csrfTokenCache = "";

export const setCsrfToken = (token) => {
  csrfTokenCache = token || "";

  if (typeof window !== "undefined") {
    if (csrfTokenCache) {
      window.sessionStorage.setItem(CSRF_STORAGE_KEY, csrfTokenCache);
    } else {
      window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
  }
};

export const getCsrfToken = () => {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  if (typeof window !== "undefined") {
    csrfTokenCache = window.sessionStorage.getItem(CSRF_STORAGE_KEY) || "";
  }

  return csrfTokenCache;
};

export const ensureCsrfToken = async () => {
  const existingToken = getCsrfToken();

  if (existingToken) {
    return existingToken;
  }

  const response = await axios.get(`${BASE_URL}${API_PATHS.AUTH.CSRF_TOKEN}`, {
    withCredentials: true,
  });

  const csrfToken = response.data?.data?.csrfToken || "";
  setCsrfToken(csrfToken);
  return csrfToken;
};
