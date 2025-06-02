'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { withAuth } from '@/hoc/withAuth';
import CardImport from './components/CardImport';

// Dynamically import CardImport with no SSR
// const CardImport = dynamic(() => import('./components/CardImport'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex justify-center items-center h-screen">
//       <Loader2 className="h-8 w-8 animate-spin" />
//     </div>
//   ),
// });

const AuthComponent = withAuth(CardImport);

export default function HomePage() {
  return <AuthComponent />;
}
