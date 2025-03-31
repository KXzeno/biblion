export interface SharedWorkerCarrier {
  worker: SharedWorker | null,
  id: string | null,
}

export enum SocketWorkerEvent {
  Unload = "DISCONNECT",
  Focus = "FOCUS",
}
