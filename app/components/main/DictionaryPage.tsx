'use client';

import React from 'react';

import { DefinitionsContext } from '@/providers/DefinitionsProvider';

export default function DictionaryPage({ 
  word,
}: {
  word: string 
}) : React.ReactNode {
  const { reducState } = React.useContext(DefinitionsContext);
  console.log(reducState);
  return (
    <div>
      {word}
    </div>
  );
}

