import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://cfanbinv.onrender.com/api", // Set the base URL for all requests
  // baseURL: "http://localhost:5000/api", // Set the base URL for
  baseURL: "https://cfanbinv-bkta.vercel.app/api",
  withCredentials: true, // Send cookies when cross-origin
  headers: {
    "Content-Type": "application/json", // Default headers
  },
  timeout: 30000, // Increase timeout to 30 seconds
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
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Backend server might be down or slow to respond.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
