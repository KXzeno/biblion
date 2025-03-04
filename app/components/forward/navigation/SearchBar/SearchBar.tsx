'use client';

import React from 'react';

import { queryWord } from '@/actions/query';
// import DictionaryEntryParser, { type Payload } from '@/utils/core/DictionaryEnteryParser';
import type { ReducerState, ReducerAction } from './SearchBar.types';

function reducer(state: ReducerState, action: ReducerAction) {
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

export default function SearchBar() {
  const [formState, formAction, ] = React.useActionState(queryWord, { msg: '', similar: [] });
  const [reductState, dispatch] = React.useReducer<ReducerState, [ReducerAction]>(reducer, { input: '' });

  return (
    <div className='flex flex-col w-screen h-screen border-gray-800 border-8 text-center'>
      <div className='inline-flex justify-center items-center bg-slate-900 h-7 w-64 self-center translate-y-34 rounded-lg text-violet-300 border-1 border-violet-900'>
        <form 
          action={formAction} 
          onSubmit={(e) => {
            dispatch({ type: 'invalidate' });
            dispatch({ type: 'query', payload: { input: reductState.input } });
            e.stopPropagation();
          }}
        >
          <input
            placeholder='Search a word'
            name='word'
            value={reductState.input}
            onChange={(e) => {
              dispatch({
                type: 'input',
                payload: { input: e.target.value },
              });
            }}
            className='pl-2 h-5'
            autoComplete='off'
          />
        </form>
        {formState.msg && 
        <>
          <p className='absolute -translate-y-12'>
            {`Search for \'${formState.msg}\' failed.`}
          </p>
        </>
        }
      </div>
          <>
            {formState.msg && formState.similar && 
            <div className='flex self-center justify-center relative translate-y-34 w-screen h-64'>
              <div className='absolute flex flex-col w-96 h-max translate-y-20'>
                <span>Did you mean any of:</span> 
                <div className='grid grid-cols-3 mt-8'>{formState.similar.map((pot: string) => {
                  return (
                    <p key={`${pot}`}>
                      {pot}
                    </p>
                  );
                })}
                </div>
              </div>
            </div>
            }
          </>
    </div>
  );
}
