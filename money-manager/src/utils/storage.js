import { useState } from 'react';

export const saveUserCredentials = (username, password) => {
  const userCredentials = { username, password };
  localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
};

export const getUserCredentials = () => {
  const storedCredentials = localStorage.getItem('userCredentials');
  return storedCredentials ? JSON.parse(storedCredentials) : null;
};

export const clearUserCredentials = () => {
  localStorage.removeItem('userCredentials');
};