import ColligateWebSocket from "@/utils/core/WebSockets";

export interface ContextData {
  send: () => void;
  signals: Array<string>;
  pendingSignal: string;
  rates: string;
  setRates: React.Dispatch<React.SetStateAction<string>> | (() => void);
  sendFromProxy: () => void;
  client: ColligateWebSocket | null;
}
