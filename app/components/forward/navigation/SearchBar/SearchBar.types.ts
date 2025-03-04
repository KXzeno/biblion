export interface ReducerState {
  input: string;
}

export interface ReducerAction {
  type: 'input' | 'invalidate' | 'query';
  payload?: {
    input: string;
  }
}
