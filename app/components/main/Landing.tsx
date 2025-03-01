'use client';

import React from 'react';

import { DictionaryEntryParser } from '@/app/utils/core/DictionaryEntryParser';
import { Payload } from '@/app/utils/core/types/DictionaryEntryParser.types';

export default function Landing() {
  const [wordData, setWordData] = React.useState<unknown>(null);
  const [parsedWordData, setParsedWordData] = React.useState<unknown>([]);

  React.useEffect(() => {
    if (wordData !== null) {
      const parsed = DictionaryEntryParser.parse(wordData);
      const items = [];
      parsed.forEach(seq => seq.defs.forEach(def => items.push(def[1])));
      setParsedWordData(items);
    }
  }, [wordData]);

  return (
    <>
      <button 
        type="button"
        onClick={() => setWordData(() => fetch('http://localhost:3000/api/v1', {
          method: 'POST',
          body: JSON.stringify('light')
        }).then(res => res.json().then(res => setWordData(res))))}
      >
        Hi
      </button>
      {parsedWordData}
    </>
  )
}

