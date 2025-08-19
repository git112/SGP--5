import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  name?: string;
  picture?: string;
  oauth_provider?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { token: storedToken, user: storedUser } = JSON.parse(stored);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsLoggedIn(true);
        // Verify token is still valid
        verifyToken(storedToken);
      }
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Token is invalid, clear auth
        clearAuth();
      }
    } catch (error) {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
  };

  const saveAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("auth", JSON.stringify({ token: newToken, user: newUser }));
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      console.log('API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, token received');
      const userData: User = { email: data.email };
      saveAuth(data.token, userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Removed Google OAuth login

  const signup = async (email: string, password: string) => {
    try {
      console.log('Attempting signup for:', email);
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password: password })
      });

      console.log('Signup response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      console.log('Signup successful, attempting auto-login');
      // Auto-login after successful signup
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send reset email');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          new_password: newPassword, 
          confirm_password: newPassword 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Password reset failed');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("auth", JSON.stringify({ token, user: updatedUser }));
    }
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      token,
      login, 
      logout, 
      signup, 
      forgotPassword,
      resetPassword,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}; 