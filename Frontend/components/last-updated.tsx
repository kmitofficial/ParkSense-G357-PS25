"use client"

import React, { useState, useEffect } from 'react';

const LastUpdated: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Set timestamp only on the client
    setLastUpdated(
      new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      })
    );
  }, []);

  // Render a placeholder during SSR
  if (!lastUpdated) return <div className="text-xs text-gray-400 mt-1">Loading...</div>;

  return (
    <div className="text-sm text-gray-400 mt-1">
      Last Updated: {lastUpdated}
    </div>
  );
};

export default LastUpdated;