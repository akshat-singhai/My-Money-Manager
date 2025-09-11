import React, { createContext, useState, useEffect } from 'react';
import { getUser, saveUser, removeUser } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (username, password) => {
    // In a real application, you would validate the credentials here
    const userData = { username }; // Simplified for this example
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};