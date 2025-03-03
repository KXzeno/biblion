'use client';

import React from 'react';

import { queryWord } from '@/actions/query';
import DictionaryEntryParser, { type Payload } from '@/utils/core/DictionaryEnteryParser';

const initialState = {
  msg: '',
}

export default function SearchBar() {
  const [state, formAction, pending] = React.useActionState(queryWord, initialState);

  return (
    <div>
      <input
      />
    </div>
  );
}
