const ACCESS_TOKEN_KEY = 'medisynx_access_token';
const USER_KEY = 'medisynx_user';

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());
