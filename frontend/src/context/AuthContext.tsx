import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  signup: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { isLoggedIn, userEmail } = JSON.parse(stored);
      setIsLoggedIn(isLoggedIn);
      setUserEmail(userEmail);
    }
  }, []);

  const login = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem("auth", JSON.stringify({ isLoggedIn: true, userEmail: email }));
  };
  const signup = login;
  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}; 