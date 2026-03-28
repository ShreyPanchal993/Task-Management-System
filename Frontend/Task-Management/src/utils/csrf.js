import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_STORAGE_KEY = "csrfToken";
let csrfTokenCache = "";

const readCookie = (name) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1]) : "";
};

const readStoredToken = () => {
  if (typeof window === "undefined") {
    return csrfTokenCache;
  }

  return window.sessionStorage.getItem(CSRF_STORAGE_KEY) || csrfTokenCache;
};

export const setCsrfToken = (token = "") => {
  csrfTokenCache = token;

  if (typeof window === "undefined") {
    return csrfTokenCache;
  }

  if (token) {
    window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
  }

  return token;
};

export const clearCsrfToken = () => setCsrfToken("");

export const getCsrfToken = () => readCookie(CSRF_COOKIE_NAME) || readStoredToken();

export const ensureCsrfToken = async () => {
  const existingToken = getCsrfToken();

  if (existingToken) {
    return existingToken;
  }

  const response = await axios.get(`${BASE_URL}${API_PATHS.AUTH.CSRF_TOKEN}`, {
    withCredentials: true,
  });

  const issuedToken = response?.data?.data?.csrfToken || getCsrfToken();
  return setCsrfToken(issuedToken);
};
