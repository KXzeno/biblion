import React from 'react';

import { 
  type ContextData,
  type DispatchContextData,
} from './DefinitionsProvider.types';

import { queryWord } from '@/actions/query';
// import DictionaryEntryParser, { type Payload } from '@/utils/core/DictionaryEnteryParser';
import type { SearchBarReducState, SearchBarReducAction } from '@/components/forward/navigation';
import { ActionType, PayloadStatus } from '@/forward/navigation/SearchBar/SearchBar.types';

export const DefinitionsContext: React.Context<ContextData> = React.createContext({
  formState: { 
    msg: '' as string, 
    similar: [] as string[],
    rawData: [] as object[],
  },
  formAction: (() => null) as (payload: FormData) => void,
  reducState: { 
    input: '' as string,
    CLIENT_CACHE: [] as string[],
    rawData: [] as object[],
    status: PayloadStatus.INACTIVE as PayloadStatus
  },
});

export const DefinitionsDispatchContext: React.Context<DispatchContextData> = React.createContext({
  // Defaults
  dispatch: (() => null) as React.ActionDispatch<[SearchBarReducAction]>,
})

function reducer(state: SearchBarReducState, action: SearchBarReducAction) {
  switch (action.type) {
    case ActionType.Query: {
      if (!action.payload || action.payload.rawData.length === 0) {
        return { ...state, input: '', status: PayloadStatus.FAILED }
      }

      // const input = action.payload.input

      return { 
        input: '',
        CLIENT_CACHE: [...state.CLIENT_CACHE as string[], state.input], 
        rawData: action.payload.rawData,
        status: PayloadStatus.SUCCESS,
      };
    }
    case ActionType.Input: {
      if (!action.payload) {
        return { ...state };
      }

      return { ...state, input: action.payload.input };
    }
    case ActionType.Invalidate: {
      if (state.status === PayloadStatus.INACTIVE) {
        // TODO: Add response to invalidation
        return { ...state };
      }
      return { ...state };
    }
    case ActionType.Inject: {
      if (!action.payload) {
        throw new Error('No payload to parse.');
      }
      return { ...state, rawData: action.payload.rawData };
    }
    default: return { ...state };
  }
}

export default function DefinitionsProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [formState, formAction, ] = React.useActionState(queryWord, { msg: '', similar: [] as string[], rawData: [] as object[] });

  const [reducState, dispatch] = React.useReducer<SearchBarReducState, [SearchBarReducAction]>(reducer, { 
    input: '' as string, 
    CLIENT_CACHE: [] as string[], 
    rawData: [] as object[],
    status: PayloadStatus.INACTIVE as PayloadStatus,
  });

  return (
    <DefinitionsContext.Provider value={{ formState, formAction, reducState }}>
      <DefinitionsDispatchContext.Provider value={{ dispatch }}>
        {children}
      </DefinitionsDispatchContext.Provider>
    </DefinitionsContext.Provider>
  )
}

