'use client';

import dynamic from 'next/dynamic';
const AuspiciousTimeChecker = dynamic(() => import('@/components/AuspiciousTimeChecker'), { ssr: false });

export default function Page() {
  return <AuspiciousTimeChecker />;
}
