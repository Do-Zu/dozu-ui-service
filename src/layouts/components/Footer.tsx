'use client';

import React from 'react';

interface IFooterProps {
  className?: string;
}

const Footer: React.FC<IFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`h-[var(--footer-height)] ${className}`}>
      {/* Footer content goes here if needed */}
    </footer>
  );
};

export default Footer;
