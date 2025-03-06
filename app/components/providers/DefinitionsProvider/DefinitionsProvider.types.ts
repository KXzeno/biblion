import { SearchBarReducAction } from "@/components/forward/navigation";
import { PayloadStatus } from "@/forward/navigation/SearchBar/SearchBar.types";

export interface ContextData {
  formState: { 
    msg: string;
    similar: string[];
    rawData: object[];
  },
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
