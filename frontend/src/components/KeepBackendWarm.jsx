import { useEffect } from 'react';
import axiosInstance from './axiosInstance';

// Component to keep the backend warm by pinging it periodically
const KeepBackendWarm = () => {
    useEffect(() => {
        // Function to ping the health endpoint
        const pingBackend = async () => {
            try {
                const response = await axiosInstance.get('/health');
                console.log('Backend is warm:', response.data);
            } catch (error) {
                console.error('Failed to ping backend:', error);
            }
        };

        // Ping immediately on component mount
        pingBackend();

        // Then ping every 4 minutes (to prevent cold starts)
        const interval = setInterval(pingBackend, 4 * 60 * 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // This component doesn't render anything
    return null;
};

export default KeepBackendWarm; 