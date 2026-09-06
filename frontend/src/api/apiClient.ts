const BASE_URL = "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
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

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
  // Refresh token mantığı (401 Unauthorized) AuthContext'ten veya buradan ele alınabilir.
  // Basitlik adına 401 hatasını yukarı fırlatıyoruz, AuthContext logout yapacak.
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    // Eğer 401 dönerse auth context bunu yakalayıp kullanıcıyı login'e atmalı.
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
