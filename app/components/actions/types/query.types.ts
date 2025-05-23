export type ResponseData = Array<string | object> | ErroneousResponse;

export interface SuccessfulResponse { 
  msg: string;
  similar: Array<string>;
  rawData: Array<{ target: string } | object | string>;
}

export interface ErroneousResponse {
  msg: string;
  similar: Array<string>;
  rawData: Array<{ target: string; error: string } | object>;
}

export type PendingResponse = SuccessfulResponse | ErroneousResponse;
