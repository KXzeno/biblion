'use client';

import React from 'react';

import { DefinitionsContext } from '@/providers/DefinitionsProvider';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Term({ term }: { term: string }): React.ReactNode {
  const useDefinitionsContext = () => React.useContext(DefinitionsContext);
  const router = useRouter();

  const getSearchParams = new URLSearchParams(window.location.search);
  const encodedDefs = getSearchParams.get('defs') as string;
  const defs = JSON.parse(decodeURI(encodedDefs));

  // router.replace(window.location.href.replaceAll(/(?<=\?)[\?\S\s]+/g, ''));
  // console.log(defs);

  return (
    <>
      {term}
    </>
  )
}

