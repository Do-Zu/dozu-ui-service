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
    <header className="p-5 bg-muted dark:bg-muted text-foreground transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <nav>
            <ul className="list-none flex gap-6">
              <li>
                <a href="/" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                  About
                </a>
              </li>
              {isLoggedIn ? (
                <li>
                  <a href="/profile" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
                    Profile
                  </a>
                </li>
              ) : (
                <li>
                  <a href="/login" className="hover:text-muted-foreground dark:hover:text-muted-foreground">
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
