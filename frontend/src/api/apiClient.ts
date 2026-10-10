// VITE_API_URL yoksa (örn. geliştirme ortamında tanımlanmamışsa) fallback olarak localhost kullan.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

// Birden fazla eşzamanlı 401 isteğinde tek bir refresh isteği göndermek için promise kilidi
let refreshPromise: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh");
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access", data.access);
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh);
      }
      return data.access;
    }
    return null;
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { requireAuth = true, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (requireAuth) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 401 Unauthorized durumunda ve kimlik doğrulama gerekiyorsa refresh token ile yenilemeyi dene
  if (
    response.status === 401 &&
    requireAuth &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    if (!refreshPromise) {
      refreshPromise = requestNewAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;
    if (newAccessToken) {
      // Yeni token ile isteği bir kez tekrar dene
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(`${BASE_URL}${endpoint}`, config);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const error = new Error(errorData?.detail || errorData?.error || "API isteği başarısız oldu.");
    (error as any).status = response.status;
    throw error;
  }

  // Eğer cevap boş ise (örn 204 No Content), parse etmeye çalışma
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}
