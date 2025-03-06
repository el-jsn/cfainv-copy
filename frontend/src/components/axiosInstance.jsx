import axios from "axios";

// Create a custom retry function
const axiosRetry = async (axios, error) => {
  const { config } = error;
  if (!config || !config.retry) {
    return Promise.reject(error);
  }

  // Set the retry count
  config.retryCount = config.retryCount || 0;

  // Check if we've maxed out the total number of retries
  if (config.retryCount >= config.retry) {
    return Promise.reject(error);
  }

  // Increase the retry count
  config.retryCount += 1;

  // Create new promise to handle exponential backoff
  const backoff = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Retrying request (${config.retryCount}/${config.retry})`);
      resolve();
    }, config.retryDelay || 1000);
  });

  // Return the promise in which recalls axios to retry the request
  await backoff;
  return axios(config);
};

const axiosInstance = axios.create({
  // baseURL: "https://cfanbinv.onrender.com/api", // Set the base URL for all requests
  // baseURL: "http://localhost:5000/api", // Set the base URL for
  baseURL: "https://cfanbinv.vercel.app/api",
  withCredentials: true, // Send cookies when cross-origin
  headers: {
    "Content-Type": "application/json", // Default headers
  },
  timeout: 15000, // Set a more reasonable timeout
  retry: 3, // Retry failed requests 3 times
  retryDelay: 1000, // Time between retries (1s)
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
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Backend server might be down or slow to respond.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);

      // Handle 504 errors with a more user-friendly message
      if (error.response.status === 504) {
        console.error('Vercel serverless function timeout. The server is taking too long to respond.');

        // Try to retry the request
        return axiosRetry(axios, error);
      }
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
