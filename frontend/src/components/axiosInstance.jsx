import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://cfanbinv.onrender.com/api", // Set the base URL for all requests
    // baseURL: "http://localhost:5000/api", // Set the base URL for
    withCredentials: true, // Send cookies when cross-origin
  headers: {
    "Content-Type": "application/json", // Default headers
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Axios response:', response);
    console.log('Response cookies:', document.cookie);
    return response;
  },
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
