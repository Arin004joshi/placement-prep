/* eslint react-refresh/only-export-components: off */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, signup as signupRequest } from "../api/auth.api";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setIsBootstrapping(false);
      return null;
    }

    try {
      const response = await getMe();
      setUser(response.data);
      return response.data;
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().catch(() => {
      clearToken();
      setUser(null);
      setIsBootstrapping(false);
    });
  }, [refreshUser]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isBootstrapping,
      login,
      signup,
      logout,
      refreshUser
    }),
    [isBootstrapping, user, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
