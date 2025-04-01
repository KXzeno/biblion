export interface ContextData {
  send: () => void;
  signals: Array<string>;
  rates: string;
  setRates: React.Dispatch<React.SetStateAction<string>> | (() => void);
}
