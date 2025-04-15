'use client';

import React, { useState, useEffect } from 'react';
import ThemeToggle from '@/components/toolbar/ThemeToggle';

interface IHeaderProps {
  isLoggedIn?: boolean;
  username?: string;
}

const header: React.FC<IHeaderProps> = () => {
  // maybe get from local global state
  const [title, setTitle] = useState<string>();
  const isLoggedIn = false;
  const username = '';

  useEffect(() => {
    if (isLoggedIn) {
      setTitle(`Welcome back, ${username}!`);
    } else {
      setTitle('Welcome to My Website');
    }
  }, [isLoggedIn, username]);

  return (
    <header className="p-5 bg-gray-800 dark:bg-gray-900 text-white transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <nav>
            <ul className="list-none flex gap-6">
              <li>
                <a href="/" className="hover:text-gray-400 dark:hover:text-gray-300">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-gray-400 dark:hover:text-gray-300">
                  About
                </a>
              </li>
              {isLoggedIn ? (
                <li>
                  <a href="/profile" className="hover:text-gray-400 dark:hover:text-gray-300">
                    Profile
                  </a>
                </li>
              ) : (
                <li>
                  <a href="/login" className="hover:text-gray-400 dark:hover:text-gray-300">
                    Login
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
export default header;
