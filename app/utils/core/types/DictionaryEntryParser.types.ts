export enum StrictDefLabels {
  Text = 'text',
  VerbalIllustration = 'vis',
  UsageNotes = 'uns',
}

export enum StrictDefMarkLabels {
  Text = 't',
  AttributionOfQuote = 'aq',
  Author = 'auth',
  Source = 'source',
}

export type SenseArray = Array<string | object>;

export type Context = { id: string, fn: string, defs: string[] };

export interface Def {
  vd?: string;
  sseq: Array<SenseArray>;
}

export interface Payload {
  meta: {
    id: string;
    stems: Array<string>;
  }
  fl: string;
  shortdef: Array<string>;
  def: Array<object>;
}

export interface Subentries {
  id: string;
  variants: string[];
  function: string;
  shortdef: Array<string>;
  def: Array<object>;
}
