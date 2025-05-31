"use client"

import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>(''); // Initialize as empty string

  useEffect(() => {
    // Update time only on client side
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }));
    };

    updateTime(); // Initial update
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Render nothing or a placeholder during SSR
  if (!time) return null;

  return (
    <div className="flex flex-col items-center justify-center w-36 ml-auto bg-gray-900 text-white rounded-lg p-1 shadow-lg">
      <h1 className="text-xl font-semibold">Current Time</h1>
      <div className="text-xl font-mono">{time}</div>
    </div>
  );
};

export default Clock;