import "dotenv/config";

import { SharedWorkerCarrier, SocketWorkerEvent } from "@/utils/workers/types/workers.types";

export function remountListener(content: Array<string>) {
  try {
    fetch(process.env.DISCORD_WH_ENDPOINT as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `# DISCONNECTED WITH: ${content[content.length - 1]}`,
      }),
    });
  } catch (e) {
    console.error(e);
  }
}

export function handleWorkerEvent(carrier: SharedWorkerCarrier, type: SocketWorkerEvent, ambiguous?: string) {
  if (carrier.worker === null) {
    throw new Error("Nullish carrier transmitted");
  }

  carrier.worker.port.postMessage(`${type}:${carrier.id}${ambiguous ? `:${ambiguous}` : ''}`);
}
