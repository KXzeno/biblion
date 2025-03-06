'use client';

import React from 'react';

import DefinitionsProvider from '@/providers/DefinitionsProvider';
import Term from '@/forward/dictionary';

export default function DictionaryPage({ 
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

