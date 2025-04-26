import React from 'react';

const footer: React.FC = () => {
  return (
    <footer className="bg-muted dark:bg-muted text-foreground py-6 transition-colors">
      <div className="container mx-auto text-center">
        <p className="text-sm">© 2025 My Website. All rights reserved.</p>
        <div className="mt-4">
          <ul className="list-none flex justify-center gap-8">
            <li>
              <a href="/privacy-policy" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default footer;
