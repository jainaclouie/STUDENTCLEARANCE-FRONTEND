// Base URL of the Laravel backend (no trailing slash, no trailing /api).
// Set VITE_API_URL in .env (local) or in the Vercel project settings (production).
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000")
    .trim()
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

const TOKEN_KEY = "auth_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

function buildUrl(endpoint) {
    const path = endpoint.startsWith("/api/")
        ? endpoint
        : endpoint.startsWith("/")
        ? `/api${endpoint}`
        : `/api/${endpoint}`;
    return `${API_URL}${path}`;
}

// Returns the raw Response (with auth header attached). On 401 the session is cleared.
export async function apiRaw(endpoint, options = {}) {
    const token = getToken();
    const response = await fetch(buildUrl(endpoint), {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 401 && token) {
        clearToken();
        window.location.href = "/";
    }

    return response;
}

// Returns parsed JSON, throws on non-2xx.
export async function apiRequest(endpoint, options = {}) {
    const response = await apiRaw(endpoint, options);

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const firstError = data?.errors ? Object.values(data.errors)[0] : null;
        throw new Error(
            (Array.isArray(firstError) ? firstError[0] : data?.message) ||
                `API Error: ${response.status}`
        );
    }

    return response.json();
}

export const apiFetch = apiRequest;
