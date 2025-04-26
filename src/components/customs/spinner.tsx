import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-muted">
      <div className="w-16 h-16 border-8 border-t-8 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
