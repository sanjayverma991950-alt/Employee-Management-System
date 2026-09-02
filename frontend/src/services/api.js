const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // If url does not end with /api, append /api
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const BASE_URL = getBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  let data;
  
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API route not found (404). Please verify backend server is reachable.');
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error('Backend server is waking up or temporarily unavailable. Please retry in a moment.');
      } else {
        throw new Error(`Server error (${response.status})`);
      }
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API GET error: ${error.message}`);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API POST error: ${error.message}`);
      throw error;
    }
  },

  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API PUT error: ${error.message}`);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API DELETE error: ${error.message}`);
      throw error;
    }
  },
};
