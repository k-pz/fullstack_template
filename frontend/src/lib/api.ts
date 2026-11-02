import axios from "axios";

// Django's CSRF cookie and header names, so writes pass DRF's SessionAuthentication when logged in.
export const api = axios.create({
  baseURL: "/api",
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});
