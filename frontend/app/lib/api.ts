"use client";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function performRequest(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = "Request failed";
    try {
      const payload = await res.json();
      message = payload?.detail || payload?.message || JSON.stringify(payload);
    } catch {
      const text = await res.text();
      if (text) message = text;
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

  // If the primary base URL is unreachable (e.g., due to mixed content),
  // retry using the current origin as a fallback to improve resiliency.
  if (typeof window !== "undefined") {
    const sameOrigin = `${window.location.origin}${path}`;
    if (!urls.includes(sameOrigin)) urls.push(sameOrigin);
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
