// Base URL for the backend API.
// - In local dev this is empty, so requests stay relative ("/api/...") and the
//   Vite proxy (vite.config.js) forwards them to http://127.0.0.1:8000.
// - In production, default to the deployed Render API if VITE_API_URL is not set.
const configuredApiBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE =
  configuredApiBase ||
  (import.meta.env.PROD ? "https://collegenation-api.onrender.com" : "");

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export function assetUrl(src) {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  return apiUrl(src.startsWith("/") ? src : `/${src}`);
}

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}
