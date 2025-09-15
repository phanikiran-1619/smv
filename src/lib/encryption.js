// Simple encryption/decryption utilities for user data
const ENCRYPTION_KEY = 'school_bus_tracker_key_2024';

export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(jsonString);
    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const decoded = atob(encryptedData);
    const parsedData = JSON.parse(decoded);
    return parsedData;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const storeEncryptedUserData = (userType, userData) => {
  const encryptedData = encryptData(userData);
  if (encryptedData) {
    localStorage.setItem(`${userType}UserData`, encryptedData);
  }
};

export const getDecryptedUserData = (userType) => {
  const encryptedData = localStorage.getItem(`${userType}UserData`);
  if (encryptedData) {
    return decryptData(encryptedData);
  }
  return null;
};

export const getRoleDisplayName = (role) => {
  const roleMapping = {
    'ADMIN': 'TransportAdmin',
    'SUPERADMIN': 'SuperAdmin',
    'PARENT': 'Parent'
  };
  return roleMapping[role] || role;
};