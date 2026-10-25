const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers as Record<string, string>),
    },
    ...rest,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected server error occurred.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // not JSON
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
