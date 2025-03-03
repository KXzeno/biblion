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

export interface DefiningText {
  sn: string,
  dt: Def,
  sense: Pick<DefiningText, 'dt'>,
}

export type SenseArray = Array<Sense>;

export type Sense = [label: string, dt: DefiningText];

export type Context = { id: string, fn: string, defs: Def[] };

export interface Def {
  vd?: string;
  sseq: Array<SenseArray>;
}

// export type DefinitionCollection = Array<Array<Array<string | Array<DefiningText>>>>;
export type DefinitionCollection = Array<Array<Array<string | DefiningText[] | React.ReactNode>>>;
export interface Payload {
  meta: {
    id: string;
    stems: Array<string>;
  }
  fl: string;
  shortdef: Array<string>;
  def: Array<Def>;
}

export interface Subentries {
  id: string;
  variants: string[];
  function: string;
  shortdef: Array<string>;
  def: Array<Def>;
}

export type ParsedPayload = Array<{ id: string, defs: Array<[string, React.ReactNode]>}>
