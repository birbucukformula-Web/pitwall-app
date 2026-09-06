import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/auth";
import type { UserResponse } from "../api/auth";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Uygulama yüklendiğinde token var mı kontrol et, varsa kullanıcı bilgilerini çek
    const initAuth = async () => {
      const token = localStorage.getItem("access");
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error: any) {
          console.error("Token geçersiz veya süresi dolmuş", error);
          if (error.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: Record<string, string>) => {
    const data = await authApi.login(credentials);
    
    // Tokenları sakla
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    
    // Kullanıcı bilgilerini çek
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
