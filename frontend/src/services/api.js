const BASE_URL = 'http://127.0.0.1:5000/api';

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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
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
