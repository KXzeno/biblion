'use client';

import React from 'react';

import SearchBar from '@/forward/navigation/SearchBar';
import DefinitionsProvider from '@/providers/DefinitionsProvider';
import { LandingHeader } from '@/forward/landing';
import { NavBar } from '@/forward/navigation';

/**
 * The landing page
 *
 * @returns the home/landing page
 */
export default function Landing(): React.ReactNode {
  return (
    <DefinitionsProvider>
      <NavBar />
      <LandingHeader />
      <SearchBar />
    </DefinitionsProvider>
  );
}

