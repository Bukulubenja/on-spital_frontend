import type { Session } from "../auth/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(session: Session, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${btoa(`${session.username}:${session.password}`)}`,
      "X-Hospital-Subdomain": session.subdomain,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function verifyLogin(session: Session): Promise<{ username: string; role: string; hospitalSubdomain: string }> {
  return apiFetch(session, "/api/whoami");
}
