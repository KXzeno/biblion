export interface WSProps {
  endpoint: string | undefined;
  destination: string | undefined;
  broadcast: string | undefined;
  webhookUrl?: string | null;
}

export interface ConnectionProps {
  extFn: () => unknown;
  intFn: (content: string) => unknown;
}
