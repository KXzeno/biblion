'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { 
  DefinitionsContext,
  DefinitionsDispatchContext
} from '@/providers/DefinitionsProvider';
import { ActionType } from '@/forward/navigation/SearchBar/SearchBar.types';


export default function Term({ term }: { term: string }): React.ReactNode {
  const router = useRouter();

  const useDefinitionsContext = () => React.useContext(DefinitionsContext);
  const { reducState } = useDefinitionsContext();

  const useDefinitionsDispatchContext = () => React.useContext(DefinitionsDispatchContext);
  const { dispatch } = useDefinitionsDispatchContext();

  React.useEffect(() => {
    const getSearchParams = new URLSearchParams(window.location.search);
    const encodedDefs = getSearchParams.get('defs') as string;
    const defs = JSON.parse(decodeURI(encodedDefs));
    router.replace(window.location.href.replaceAll(/(?<=\?)[\?\S\s]+/g, ''));
    dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: defs } });
    console.log(defs);
  }, []);


  return (
    <>
      {term}
    </>
  )
}

