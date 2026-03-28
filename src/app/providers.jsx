'use client';

import React from 'react';
import { AuthProvider } from '../auth/AuthContext';
import { ProductProvider } from '../data/ProductContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ProductProvider>{children}</ProductProvider>
    </AuthProvider>
  );
}
