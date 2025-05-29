import React, { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
