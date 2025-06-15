import React, { createContext, useContext, useState } from "react";

// 1. إنشاء الـ Context
const UserContext = createContext();

// 2. مزوّد الـ Context
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. هوك للاستخدام السهل
export const useUser = () => useContext(UserContext);
