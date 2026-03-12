import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Hardcoded users (for limited admin access)
const USERS = [
  { username: "admin", password: "admin123" },
  { username: "vamshi", password: "fashion123" },
  { username: "alekhya", password: "alekhya123" }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (username, password) => {
    const foundUser = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      navigate("/dashboard/customers");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
