'use client';

import { Suspense } from 'react';
import AccountPage from '@/views/AccountPage';
import { useApp } from '@/context/AppContext';

function AccountPageWrapper() {
  const { handleAddToCart, formatPrice } = useApp();
  return <AccountPage handleAddToCart={handleAddToCart} formatPrice={formatPrice} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-24 min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#164475] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AccountPageWrapper />
    </Suspense>
  );
}
