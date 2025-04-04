import "dotenv/config";

import { SharedWorkerCarrier, SocketWorkerEvent } from "@/utils/workers/types/workers.types";
import { 
  type ReducerState,
  type ReducerAction,
  type Payload,
  type RatesPayload,
  type SignalPayload,
  type CarrierPayload,
  type ClientPayload,
  type PendingSignalPayload,
  ActionType,
} from "@/components/providers/SocketProvider/SocketProvider.types";

/**
 * Validates, forms, and transmits data to the SharedWorker
 *
 * @param carrier - the object containing the SharedWorker and a client id
 * @param type - the action type to reference for data conformity
 * @param ambiguous - additional arguments to pass for transmission
 */
export function handleWorkerEvent(carrier: SharedWorkerCarrier, type: SocketWorkerEvent, ambiguous?: string): void {
  if (carrier.worker === null) {
    throw new Error("Nullish carrier transmitted");
  }

  carrier.worker.port.postMessage(`${type}:${carrier.id}${ambiguous ? `:${ambiguous}` : ''}`);
}

/**
 * The reducer function for the `SocketProvider` component
 *
 * @param state - the values to persist
 * @param action - the action emitted via dispatch
 * @returns a modified state, else current state
 */
export function socketProviderReducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (action.type) {
    // Updates rates
    case ActionType.Rate: {
      if (!(action.payload && isRatesPayload(action.payload))) {
        throw new Error('No rates defined in payload');
      }
      return { ...state, rates: action.payload.rates };
    }
    // Initializes objects of named, disparate workers
    case ActionType.Carrier: {
      if (!(action.payload && isCarrierPayload(action.payload))) {
        throw new Error('No carrier defined in payload');
      }
      return { ...state, carrier: action.payload.carrier };
    }
    // Initializes stompjs client
    case ActionType.Client: {
      if (!(action.payload && isClientPayload(action.payload))) {
        throw new Error('No client defined in payload');
      }
      return { ...state, client: action.payload.client };
    }
    // Updates signals (previous rates)
    case ActionType.Signal: {
      if (!(action.payload && isSignalPayload(action.payload))) {
        throw new Error('No signals defined in payload');
      }
      return { ...state, signals: [...state.signals, action.payload.signal] };
    }
    // Utilizes a memoized function for proxies to send the main thread data for transmission
    case ActionType.Offload: {
      if (!(action.payload && isPendingSignalPayload(action.payload))) {
        throw new Error('No pending signal defined in payload');
      }
      return { ...state, pendingSignal: action.payload.pendingSignal };
    }
    default: throw new Error('The action type did not match');
  }
}

/**
 * Predicator for `RatesPayload` type
 *
 * @param payload - a union of paylod types to validate against
 */
function isRatesPayload(payload: Payload): payload is RatesPayload {
  return 'rates' in payload;
}

/**
 * Predicator for `SignalPayload` type
 *
 * @param payload - a union of paylod types to validate against
 */
function isSignalPayload(payload: Payload): payload is SignalPayload {
  return 'signal' in payload;
}

/**
 * Predicator for `ClientPayload` type
 *
 * @param payload - a union of paylod types to validate against
 */
function isClientPayload(payload: Payload): payload is ClientPayload {
  return 'client' in payload;
}

/**
 * Predicator for `PendingSignalPayload` type
 *
 * @param payload - a union of paylod types to validate against
 */
function isPendingSignalPayload(payload: Payload): payload is PendingSignalPayload {
  return 'pendingSignal' in payload;
}

/**
 * Predicator for `CarrierPayload` type
 *
 * @param payload - a union of paylod types to validate against
 */
function isCarrierPayload(payload: Payload): payload is CarrierPayload {
  return 'carrier' in payload;
}
