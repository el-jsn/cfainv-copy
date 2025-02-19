import React from 'react';

const LoadingSpinner = ({ size = 'default' }) => {
    const sizeClasses = {
        small: 'h-8 w-8',
        default: 'h-16 w-16',
        large: 'h-24 w-24'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full border-t-4 border-blue-500 border-b-4 border-blue-500 ${sizeClasses[size]}`}></div>
        </div>
    );
};

export default LoadingSpinner; 