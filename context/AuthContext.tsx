import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true to check for existing session
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage on initial load
    try {
      const storedToken = localStorage.getItem('vms_token');
      const storedUser = localStorage.getItem('vms_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to parse auth data from localStorage", e);
      localStorage.removeItem('vms_token');
      localStorage.removeItem('vms_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await api.loginApi(credentials);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('vms_token', token);
      localStorage.setItem('vms_user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vms_token');
    localStorage.removeItem('vms_user');
  }, []);

  const value = { user, token, isAuthenticated, isLoading, error, login, logout };

  // Render children only after checking for existing session
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
