import React from 'react';

const footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6 transition-colors">
      <div className="container mx-auto text-center">
        <p className="text-sm">© 2025 My Website. All rights reserved.</p>
        <div className="mt-4">
          <ul className="list-none flex justify-center gap-8">
            <li>
              <a href="/privacy-policy" className="hover:text-gray-400 dark:hover:text-gray-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-gray-400 dark:hover:text-gray-300">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-gray-400 dark:hover:text-gray-300">
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
