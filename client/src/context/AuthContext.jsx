import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api"; // Changed port to 8081

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (username, email, password, role) => { // Changed fullName to username
    console.log("Register attempt from frontend:", { username, email, password, role }); // Log request
    const res = await axios.post(`${API_BASE}/auth/register`, {
      username, // Changed from fullName to username
      email,
      password,
      role,
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);