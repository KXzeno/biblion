'use client';

import React from 'react';

import { DefinitionsProvider } from '@/providers';
import Term from '@/forward/dictionary';
import { SuccessfulResponse } from '../actions/types/query.types';

/**
 * Wrapper component to hold context
 * 
 * @param { word } - the slug
 * @returns a contextual component
 */
export default function Dictionary({ 
  word,
  tempData,
}: {
  word: string,
  tempData: SuccessfulResponse['rawData'] | null,
}) : React.ReactNode {

  return (
    <DefinitionsProvider>
      <Term term={word} tempData={tempData} />
    </DefinitionsProvider>
  );
}

