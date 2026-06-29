// Base URL for the backend API.
// - In local dev this is empty, so requests stay relative ("/api/...") and the
//   Vite proxy (vite.config.js) forwards them to http://127.0.0.1:8000.
// - In production set the env var VITE_API_URL to your deployed backend URL,
//   e.g. https://collegenation-api.onrender.com
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function apiFetch(path, options) {
  return fetch(`${API_BASE}${path}`, options);
}
