import React from 'react';

import { 
  type ContextData,
  type DispatchContextData,
} from './DefinitionsProvider.types';

import { queryWord } from '@/actions/query';
// import DictionaryEntryParser, { type Payload } from '@/utils/core/DictionaryEnteryParser';
import type { SearchBarReducState, SearchBarReducAction } from '@/components/forward/navigation';

export const DefinitionsContext: React.Context<ContextData> = React.createContext({
  formState: { 
    msg: '', 
    similar: [''],
  },
  formAction: (() => null) as (payload: FormData) => void,
  reducState: { input: '' },
});

export const DefinitionsDispatchContext: React.Context<DispatchContextData> = React.createContext({
  // Defaults
  dispatch: (() => null) as React.ActionDispatch<[SearchBarReducAction]>,
})

function reducer(state: SearchBarReducState, action: SearchBarReducAction) {
  switch (action.type) {
    case 'query': {
      if (!action.payload) {
        throw new Error('Payload empty.');
      }

      // const input = action.payload.input

      return { ...state, input: '' };
    }
    case 'input': {
      if (!action.payload) {
        return { ...state };
      }

      return { ...state, input: action.payload.input };
    }
    case 'invalidate': {
      return { ...state };
    }
  }
}

export default function DefinitionsProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [formState, formAction, ] = React.useActionState(queryWord, { msg: '', similar: [] });
  const [reducState, dispatch] = React.useReducer<SearchBarReducState, [SearchBarReducAction]>(reducer, { input: '' });

  return (
    <DefinitionsContext.Provider value={{ formState, formAction, reducState }}>
      <DefinitionsDispatchContext.Provider value={{ dispatch }}>
        {children}
      </DefinitionsDispatchContext.Provider>
    </DefinitionsContext.Provider>
  )
}

