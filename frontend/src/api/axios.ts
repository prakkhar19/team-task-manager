import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api"),
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle global errors here
    return Promise.reject(error);
  }
);
