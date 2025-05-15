'use client';

import React from 'react';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <>{children}</>;
}
