import { API_URL } from "@/constants/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "signal">;

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `[API ${response.status}] ${response.statusText} — ${path}`,
      );
    }
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
