export interface SharedWorkerCarrier {
  worker: SharedWorker | null,
  id: string | null,
}

export enum SocketWorkerEvent {
  Terminate = "DISCONNECT",
  Focus = "FOCUS",
  KeepAlive = "KEEPALIVE",
}
