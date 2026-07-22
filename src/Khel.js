import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="text-center">
    {children}
  </div>
);
