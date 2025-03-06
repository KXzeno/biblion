'use client';

import React from 'react';

import DefinitionsProvider from '@/providers/DefinitionsProvider';
import Term from '@/forward/dictionary';

/**
 * Wrapper component to hold context
 * 
 * @param { word } - the slug
 * @returns a contextual component
 */
export default function Dictionary({ 
  word,
}: {
  word: string 
}) : React.ReactNode {

  return (
    <DefinitionsProvider>
      <Term term={word} />
    </DefinitionsProvider>
  );
}

