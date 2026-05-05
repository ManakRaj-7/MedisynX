const ACCESS_TOKEN_KEY = 'medisynx_access_token';

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const isAuthenticated = () => Boolean(getToken());
