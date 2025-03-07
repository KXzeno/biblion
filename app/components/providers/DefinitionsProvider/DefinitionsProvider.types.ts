import { SearchBarReducAction } from "@/components/forward/navigation";
import { PayloadStatus } from "@/forward/navigation/SearchBar/SearchBar.types";
import { PendingResponse } from "@/components/actions/types/query.types";

export interface ContextData {
  formState: PendingResponse;
  formAction: (payload: FormData) => void,
  reducState: { 
    input: string,
    CLIENT_CACHE: Array<string>,
    rawData: object[], 
    status: PayloadStatus,
  },
  formStatePending: boolean;
}

export interface DispatchContextData {
  dispatch: React.ActionDispatch<[SearchBarReducAction]>;
}
