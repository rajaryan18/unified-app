"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  userId: string;
  email: string;
  token: string;
  name?: string;
}

interface AuthContextType {
  user: (User & { expiryDate?: number }) | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("unified_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.expiryDate && new Date().getTime() < parsedUser.expiryDate) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("unified_user");
        }
      } catch (e) {
        localStorage.removeItem("unified_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/auth", "/login", "/signup"];
      if (!user && !publicRoutes.includes(pathname) && !pathname.startsWith("/api/")) {
        router.push("/auth");
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    const expiryDate = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    const dataToStore = { ...userData, expiryDate };
    setUser(userData);
    localStorage.setItem("unified_user", JSON.stringify(dataToStore));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unified_user");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
