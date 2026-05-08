const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const createHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiPost = async (path, body, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(body),
  });
  return response.json();
};

export const apiGet = async (path, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: createHeaders(token),
  });
  return response.json();
};

export const apiGetBlob = async (path, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: createHeaders(token),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to download file');
  }
  return response.blob();
};

export const apiPatch = async (path, body, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: createHeaders(token),
    body: JSON.stringify(body),
  });
  return response.json();
};

export const apiPut = async (path, body, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: createHeaders(token),
    body: JSON.stringify(body),
  });
  return response.json();
};
