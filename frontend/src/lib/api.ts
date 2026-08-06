import { useAuthStore } from "@/stores/authStore";
import type { Paginated } from "@/types";

export const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    : "";

const isServer = typeof window === "undefined";

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data?: { accessToken?: string } };
    const token = json.data?.accessToken || null;
    if (token) useAuthStore.getState().setToken(token);
    return token;
  } catch {
    return null;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  retryAuth?: boolean;
  formData?: FormData;
}

interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

async function rawFetch<T>(path: string, options: ApiOptions = {}): Promise<ApiEnvelope<T>> {
  const { body, auth = true, retryAuth = true, formData, headers: extraHeaders, ...rest } = options;
  const token = useAuthStore.getState().token;
  const headers = new Headers(extraHeaders);

  if (formData) {
    // let the browser set the multipart boundary
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && auth && retryAuth && !isServer) {
    refreshing = refreshing || refreshAccessToken();
    const newToken = await refreshing;
    refreshing = null;
    if (newToken) {
      const retryHeaders = new Headers(extraHeaders);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      const retry = await fetch(`${API_BASE}${path}`, {
        ...rest,
        credentials: "include",
        headers: retryHeaders,
        body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      });
      if (retry.ok || retry.status !== 401) {
        return parseEnvelope<T>(retry);
      }
    }
    useAuthStore.getState().logout();
    throw new ApiClientError(401, "Session expired. Please sign in again.", "UNAUTHORIZED");
  }

  return parseEnvelope<T>(res);
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const env = await rawFetch<T>(path, options);
  return env.data;
}

// Backend list endpoints return a flat envelope: { success, data: T[], meta }.
// This assembles them into the { data, meta } shape admin/public pages expect.
export async function apiFetchPaginated<T, M extends Record<string, unknown> = Record<string, unknown>>(
  path: string,
  options: ApiOptions = {}
): Promise<{ data: T[]; meta: Paginated<T>["meta"] & M }> {
  const env = await rawFetch<T[]>(path, options);
  const meta = env.meta ?? { page: 1, limit: 20, total: 0, pages: 1 };
  return { data: env.data ?? [], meta: meta as Paginated<T>["meta"] & M };
}

async function parseEnvelope<T>(res: Response): Promise<ApiEnvelope<T>> {
  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; details?: unknown } })?.error;
    throw new ApiClientError(res.status, err?.message || `Request failed (${res.status})`, err?.code || "API_ERROR", err?.details);
  }
  const envelope = json as { data: T; meta?: Record<string, unknown> };
  return { data: envelope.data, meta: envelope.meta };
}

// ---------- Typed endpoint helpers ----------

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "DELETE" }),
  upload: <T>(path: string, formData: FormData, opts?: ApiOptions) => apiFetch<T>(path, { ...opts, method: "POST", formData }),
};

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}
