export interface WSProps {
  endpoint: string | undefined;
  destination: string | undefined;
  broadcast: string | undefined;
}

export interface ConnectionProps {
  extFn: () => unknown;
  intFn: (content: string) => unknown;
}
