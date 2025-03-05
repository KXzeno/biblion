'use client';

import React from 'react';

import Term from '@/forward/dictionary';

export default function DictionaryPage({ 
  word,
}: {
  word: string 
}) : React.ReactNode {

  return (
    <>
      <Term term={word} />
    </>
  );
}

