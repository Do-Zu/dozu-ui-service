import React from 'react';
interface IFooterProps {
  className?: string;
}

const Footer: React.FC<IFooterProps> = ({ className }) => {
  return (
    <footer
      className={`bg-muted dark:bg-muted text-foreground py-6 transition-colors ${className}`}
    ></footer>
  );
};

export default Footer;
