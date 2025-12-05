"use client";

const LOCAL_FALLBACK_BASE = "http://localhost:8000";
const REMOTE_FALLBACK_BASE = "https://student-result-tracking-backend.onrender.com";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (typeof window !== "undefined"
    ? ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
      ? LOCAL_FALLBACK_BASE
      : REMOTE_FALLBACK_BASE
    : LOCAL_FALLBACK_BASE);

async function performRequest(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed (status ${res.status})`;
    const contentType = res.headers.get("content-type") || "";

    // Prefer structured messages from JSON responses when available.
    if (contentType.includes("application/json")) {
      try {
        const payload = await res.json();
        message = payload?.detail || payload?.message || JSON.stringify(payload);
      } catch {
        // If JSON parsing fails, fall back to the default message.
      }
    } else {
      // Avoid dumping full HTML documents into the UI; keep the message concise.
      const responseText = await res.text();
      const safeText = responseText.replace(/<[^>]*>/g, "").trim();
      if (safeText) {
        message = safeText.slice(0, 300);
      }
    }

    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const requestOptions = { ...options, headers };
  const urls: string[] = [`${API_BASE}${path}`];

  // If the primary base URL is unreachable (e.g., due to mixed content or a
  // sleeping local server), retry the hosted fallback API before failing.
  if (!urls.some((url) => url.startsWith(REMOTE_FALLBACK_BASE))) {
    urls.push(`${REMOTE_FALLBACK_BASE}${path}`);
  }

  let lastError: unknown = null;
  for (const url of urls) {
    try {
      return await performRequest(url, requestOptions);
    } catch (error: any) {
      lastError = error;
      // Only fall back when the failure is a network/type error; otherwise, bubble up.
      const isNetworkError = error?.name === "TypeError" || error?.message === "Failed to fetch";
      if (!isNetworkError) {
        throw error;
      }
    }
  }

  // If all attempts failed, throw the last captured error.
  if (lastError) throw lastError;
  throw new Error("Request failed");
}

export function saveAuth(token: string, role: string, name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("name", name);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function getName() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("name");
}
