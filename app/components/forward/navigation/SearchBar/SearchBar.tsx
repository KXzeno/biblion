'use client';

import React from 'react';

import { queryWord } from '@/actions/query';
import { DictionaryEntryParser } from '@/utils/core/DictionaryEntryParser';
import { Payload } from '@/utils/core/types/DictionaryEntryParser.types';

const initialState = {
  msg: '',
}

export default function SearchBar() {
  const [state, formAction, pending] = React.useActionState(queryWord, initialState);

  return (
    <div>
      <input
        value 
      />
    </div>
  );
}
