

'use client';

import React from 'react';
import './medhayu.css';

// This layout inherits all providers from the root layout.
// It only needs to provide the specific CSS for the Medhayu module.
export default function MedhayuModuleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <>{children}</>
  );
}
