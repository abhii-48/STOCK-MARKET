import axios from 'axios';

// In production the Express server serves both the app and its API. Keeping
// requests relative prevents a page refresh from trying to reach a stale or
// unavailable localhost port.
// const api = axios.create({
//     baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
//     timeout: 10000,
// });

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
    timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Redirect to login without triggering a React re-render loop
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
