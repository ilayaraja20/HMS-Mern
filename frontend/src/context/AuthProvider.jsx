import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthStore";

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false;
  const current = Math.floor(Date.now() / 1000);
  return decoded.exp > current;
};

export const AuthProvider = ({ children }) => {
  const initialAdminToken = localStorage.getItem("adminToken");
  const initialUserToken = localStorage.getItem("userToken");

  const [adminToken, setAdminToken] = useState(isTokenValid(initialAdminToken) ? initialAdminToken : "");
  const [userToken, setUserToken] = useState(isTokenValid(initialUserToken) ? initialUserToken : "");

  const adminAuth = useMemo(() => isTokenValid(adminToken), [adminToken]);
  const userAuth = useMemo(() => isTokenValid(userToken), [userToken]);

  useEffect(() => {
    if (!adminAuth) {
      localStorage.removeItem("adminToken");
      if (localStorage.getItem("activeRole") === "admin") {
        localStorage.removeItem("activeRole");
      }
    }

    if (!userAuth) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      if (localStorage.getItem("activeRole") === "user") {
        localStorage.removeItem("activeRole");
      }
    }
  }, [adminAuth, userAuth]);

  useEffect(() => {
    const activeRole = localStorage.getItem("activeRole");
    const tokenToUse = activeRole === "admin" ? adminToken : userToken;

    if (tokenToUse) {
      api.defaults.headers.common.Authorization = `Bearer ${tokenToUse}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [adminToken, userToken]);

  const adminLogin = (token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("activeRole", "admin");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");

    setUserToken("");
    setAdminToken(token);
  };

  const userLogin = (token, userId) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("activeRole", "user");
    localStorage.removeItem("adminToken");

    setAdminToken("");
    setUserToken(token);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("activeRole");

    setAdminToken("");
    setUserToken("");
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{
        adminAuth,
        userAuth,
        adminToken,
        userToken,
        adminLogin,
        userLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
