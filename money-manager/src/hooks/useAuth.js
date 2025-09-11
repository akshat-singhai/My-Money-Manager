import { useState, useEffect } from 'react';
import { getUser, saveUser, removeUser } from '../utils/storage';

const useAuth = () => {
  const [user, setUser] = useState(() => getUser());

  const login = (username, password) => {
    // Here you can add your own logic for validating the user
    // For simplicity, we are just saving the username in local storage
    const userData = { username };
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeUser();
    setUser(null);
  };

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return { user, login, logout };
};

export default useAuth;