// Token management utility for the application
export const getToken = () => {
  return localStorage.getItem("superadmintoken") || localStorage.getItem("admintoken") || null;
};

export const setToken = (token) => {
  localStorage.setItem("superadmintoken", token);
};

export const removeToken = () => {
  localStorage.removeItem("superadmintoken");
  localStorage.removeItem("admintoken");
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic token validation - you can enhance this with JWT decoding if needed
    const parts = token.split('.');
    return parts.length === 3; // Basic JWT structure check
  } catch (error) {
    return false;
  }
};