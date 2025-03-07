import { SuccessfulResponse } from "@/components/actions/types/query.types";

export interface InputResponseOptions {
  data?: SuccessfulResponse['rawData'];
  invalid?: boolean;
  unacknowledged?: boolean;
  error?: boolean;
  successful?: boolean;
}
