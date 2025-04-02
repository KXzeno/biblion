import ColligateWebSocket from "@/utils/core/WebSockets";
import { SharedWorkerCarrier } from "@/utils/workers";

export interface ContextData {
  send: () => void;
  signals: Array<string>;
  pendingSignal: string;
  rates: string;
  sendFromProxy: () => void;
  client: ColligateWebSocket | null;
}

export interface DispatchContextData {
  dispatch: React.ActionDispatch<[ReducerAction]>;
}

export interface ReducerState {
  carrier: SharedWorkerCarrier;
  client: ColligateWebSocket | null;
  signals: Array<string>;
  pendingSignal: string;
  rates: string;
}

export interface ReducerAction {
  type: ActionType;
  payload?: CarrierPayload | ClientPayload | SignalPayload | RatesPayload | PendingSignalPayload;
}

export interface ClientPayload {
  client: ReducerState['client'];
}

export interface SignalPayload {
  signal: string;
}

export interface RatesPayload {
  rates: ReducerState['rates'];
}

export interface PendingSignalPayload {
  pendingSignal: ReducerState['pendingSignal'];
}

export interface CarrierPayload {
  carrier: ReducerState['carrier'];
}

export type Payload = CarrierPayload | ClientPayload | SignalPayload | RatesPayload | PendingSignalPayload;

export enum ActionType {
  Client = "CLIENT",
  Offload = "OFFLOAD",
  Signal = "SIGNAL",
  Rate = "RATE",
  Carrier = "CARRIER",
}
