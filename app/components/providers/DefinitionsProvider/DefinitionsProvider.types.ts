import { SearchBarReducAction } from "@/components/forward/navigation";

export interface ContextData {
  formState: { 
    msg: string, 
    similar: string[]
  },
  formAction: (payload: FormData) => void,
  reducState: { input: string },
}

export interface DispatchContextData {
  dispatch: React.ActionDispatch<[SearchBarReducAction]>;
}
