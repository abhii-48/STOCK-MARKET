import axios from 'axios'

let baseUrl = import.meta.env.VITE_API_URL || '';
if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
}
const API_URL = baseUrl ? `${baseUrl}/api` : '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api