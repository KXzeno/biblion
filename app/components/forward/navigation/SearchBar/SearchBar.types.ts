export enum PayloadStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  INACTIVE = 'INACTIVE',
}

export enum ActionType {
  Input = 'input',
  Invalidate = 'invalidate',
  Query = 'query',
  Inject = 'inject',
}

export interface ReducerState {
  input: string;
  CLIENT_CACHE: string[];
  rawData: object[];
  status: PayloadStatus;
}

export interface ReducerAction {
  type: ActionType;
  payload?: {
    input: string;
    CLIENT_CACHE: string[];
    rawData: object[];
    status: PayloadStatus;
  }
}
