'use client';

import React from 'react';

import SearchBar from '@/forward/navigation/SearchBar';
import DefinitionsProvider from '@/providers/DefinitionsProvider';

export default function Landing() {
  return (
    <DefinitionsProvider>
      <SearchBar />
    </DefinitionsProvider>
  );
}

