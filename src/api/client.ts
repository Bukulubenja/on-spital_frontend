export type Credentials = {
  subdomain: string;
  username: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(credentials: Credentials, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      "X-Hospital-Subdomain": credentials.subdomain,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function verifyLogin(credentials: Credentials): Promise<{ username: string; role: string; hospitalSubdomain: string }> {
  return apiFetch(credentials, "/api/whoami");
}
