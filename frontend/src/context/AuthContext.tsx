import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "../services/api";

export interface User {
  id: string;
  email: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoaded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("study_auth_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("study_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("study_auth_token");
      if (storedToken) {
        try {
          const userData = await getMeApi();
          const localPlan = localStorage.getItem("study_user_plan") || "free";
          const fullUser = { ...userData, plan: localPlan };
          setUser(fullUser);
          localStorage.setItem("study_user", JSON.stringify(fullUser));
        } catch (e) {
          console.error("Token verification failed, clearing auth:", e);
          localStorage.removeItem("study_auth_token");
          localStorage.removeItem("study_user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoaded(true);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    const newToken = res.access_token;
    const localPlan = localStorage.getItem("study_user_plan") || "free";
    const loggedUser = { ...res.user, plan: localPlan };
    
    setToken(newToken);
    setUser(loggedUser);
    localStorage.setItem("study_auth_token", newToken);
    localStorage.setItem("study_user", JSON.stringify(loggedUser));
    localStorage.setItem("study_user_id", loggedUser.id);
  };

  const register = async (email: string, password: string) => {
    const res = await registerApi(email, password);
    const newToken = res.access_token;
    const registeredUser = { ...res.user, plan: "free" };

    setToken(newToken);
    setUser(registeredUser);
    localStorage.setItem("study_auth_token", newToken);
    localStorage.setItem("study_user", JSON.stringify(registeredUser));
    localStorage.setItem("study_user_id", registeredUser.id);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("study_auth_token");
    localStorage.removeItem("study_user");
    localStorage.removeItem("study_session_id");
  };

  const upgradeToPro = () => {
    if (user) {
      const updated = { ...user, plan: "pro" };
      setUser(updated);
      localStorage.setItem("study_user_plan", "pro");
      localStorage.setItem("study_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoaded, login, register, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
