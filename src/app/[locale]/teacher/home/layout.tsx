'use client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 w-full transition-colors">{children}</main>;
}
