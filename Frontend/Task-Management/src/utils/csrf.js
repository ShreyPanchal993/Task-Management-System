import axios from "axios";
import { BASE_URL, API_PATHS } from "./apiPaths";

const CSRF_COOKIE_NAME = "csrfToken";

const readCookie = (name) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1]) : "";
};

export const getCsrfToken = () => readCookie(CSRF_COOKIE_NAME);

export const ensureCsrfToken = async () => {
  const existingToken = getCsrfToken();

  if (existingToken) {
    return existingToken;
  }

  await axios.get(`${BASE_URL}${API_PATHS.AUTH.CSRF_TOKEN}`, {
    withCredentials: true,
  });

  return getCsrfToken();
};
