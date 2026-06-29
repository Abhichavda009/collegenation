// Base URL for the backend API.
// - In local dev this is empty, so requests stay relative ("/api/...") and the
//   Vite proxy (vite.config.js) forwards them to http://127.0.0.1:8000.
// - In production, default to the deployed Render API if VITE_API_URL is not set.
const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "https://collegenation-api.onrender.com" : "");

export function apiFetch(path, options) {
  return fetch(`${API_BASE}${path}`, options);
}
