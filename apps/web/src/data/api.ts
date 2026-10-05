const tokenKey = "rgr_access_token";

type ApiError = Error & { status?: number };

export function getAccessToken() {
  return sessionStorage.getItem(tokenKey);
}

export function setAccessToken(token: string | null) {
  if (token) sessionStorage.setItem(tokenKey, token);
  else sessionStorage.removeItem(tokenKey);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as
      | { error?: string | { formErrors?: string[] } }
      | null;
    const message =
      typeof detail?.error === "string"
        ? detail.error
        : detail?.error?.formErrors?.join(", ") ??
          `La solicitud falló (${response.status})`;
    const error = new Error(message) as ApiError;
    error.status = response.status;
    window.dispatchEvent(new CustomEvent("rgr-api-error", { detail: message }));
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type ApiSession = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export async function login(email: string, password: string) {
  const session = await apiRequest<ApiSession>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false,
  );
  setAccessToken(session.accessToken);
  return session.user;
}

export async function createFirstAdmin(
  name: string,
  email: string,
  password: string,
) {
  const session = await apiRequest<ApiSession>(
    "/api/auth/bootstrap",
    { method: "POST", body: JSON.stringify({ name, email, password }) },
    false,
  );
  setAccessToken(session.accessToken);
  return session.user;
}

export async function restoreSession() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return await apiRequest<ApiSession["user"]>("/api/auth/me");
  } catch (error) {
    if ((error as ApiError).status !== 401) throw error;
  }
  const session = await apiRequest<ApiSession>(
    "/api/auth/refresh",
    { method: "POST" },
    false,
  );
  setAccessToken(session.accessToken);
  return session.user;
}

export async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" }, false);
  } finally {
    setAccessToken(null);
  }
}
