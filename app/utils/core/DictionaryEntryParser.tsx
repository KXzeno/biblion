import React from 'react';

import { 
  puncPatterns, 
  markPatterns,
  crossRefPatterns,
} from './ModelPatterns';

import {
  StrictDefLabels,
  StrictDefMarkLabels,
  type Context,
  type Def,
  type Payload,
  type Subentries,
  type DefiningText,
  type ParsedPayload,
  type DefinitionCollection,
} from './types/DictionaryEntryParser.types';

/**
 * A parser that transforms the response payload of 
 * Merriam-Webster's dictionary endpoint to React elements
 *
 * @author Kx
 */
export class DictionaryEntryParser {
  // Nested values extracted from payload
  private subentries: Subentries[] = [];
  // Subentries divided into context form
  private contexts: Context[] = [];

  // Reference imported dynamic matchers
  private static PunctuationPatterns = puncPatterns;
  private static MarkPatterns = markPatterns;
  private static CrossRefPatterns = crossRefPatterns;

  /**
   * @param payload - a successful response from the api endpoint in JSON
   */
  private constructor(payload: Array<Payload>) {
    // Initialize subentries
    for (let i = 0; i < payload.length; i++) {
      this.subentries.push({
        id: payload[i].meta.id,
        variants: payload[i].meta.stems,
        function: payload[i].fl,
        shortdef: payload[i].shortdef,
        def: payload[i].def,
      });
    }
  }

  /**
   * Parses and transforms the given payload, also 
   * the consumer's only access to initialization
   *
   * @param payload - the payload to be parsed
   * @returns the payload mapped to a React node
   *
   * @example
   * Fetching
   * ```
   *   const payload = await fetch('http://localhost:3000/api/v1').then(res => res.json());
   *   const parsed = DictionaryEntryParser.parse(payload);
   * ```
   */
  public static parse(payload: Array<Payload>): ParsedPayload {
    // Initialize parser
    const parser = new DictionaryEntryParser(payload);

    // Parse the initialized subentries and initialize contexts
    parser.parseContexts();

    // Parse the definition objects and index the contexts
    const defGroups = DictionaryEntryParser.parseDefs(parser.contexts);

    // Probe all definition tokens and transform them to elements
    const formattedDefGroups = defGroups.map(group => ({ id: group.id, defs: DictionaryEntryParser.formatDefGroups(group.defs) })) as ParsedPayload;

    return formattedDefGroups;
  }

  /**
   * Parses subentries and initializes contexts
   */
  private parseContexts(): void {
    this.subentries.forEach((entry) => {
      if (entry.def) {
        // Iterate through senses of the entry's definition object
        entry.def.forEach(sense => { 
          // If the sense contains a verb divider (vd), ensure data collision
          if (sense.vd) {
            // Parse sense and push to current context
            const parsedDef = this.parseSenses({ vd: sense.vd, sseq: sense.sseq });
            if (this.contexts.length > 0 && entry.id === this.contexts[this.contexts.length - 1].id) {
              this.contexts[this.contexts.length - 1].defs.push(...parsedDef);
            } else {
              // Retain updated context
              // TODO: Investigate inutility
              this.contexts.push({ id: entry.id, fn: entry.function, defs: parsedDef });
            }
          } else {
            // If no verb divider, parse sense and push as new context
            const parsedDef = this.parseSenses({ sseq: sense.sseq });
            this.contexts.push({ id: entry.id, fn: entry.function, defs: parsedDef });
          }
        });
      }
    });
  }

  /**
   * Utility method to parse a context 
   *
   * @param def - a definition object from a context
   * @returns a collection of defining text objects
   */
  private parseSenses(def: Def): Array<Def> {
    // Destructure sense sequence
    const { sseq } = def;

    // Initialize defining text array
    const volatileContext = [];

    if (def.vd) {
      // Insert verb type as inline text
      volatileContext.push([['text', `${def.vd}`]]);
    }

    // Iterate over sense sequence
    for (let i = 0; i < sseq.length; i++) {
      // Iterate over sense
      for (let j = 0; j < sseq[i].length; j++) {
        // Get sense, type, and "strict" definitions
        const sense = sseq[i][j];
        const type = sense[0];
        const sdef = sense[1];

        // Identifies subcontexts by sense number
        // TODO: Mark subcontexts
        if (sdef.sn && sdef.sn.match(/\d|(?:\d\sa)/)) {
          volatileContext.push(sdef.dt);
          continue;
        }

        switch (type) {
          // Handle binding substitutes (series of senses)
          case 'bs': 
            volatileContext.push(sdef.sense.dt);
          break;
          // Handle single sense
          default: volatileContext.push(sdef.dt);
        }
      }
    }
    // Assert type due to potential verb divider injection
    return volatileContext as Array<Def>;
  }

  /**
   * Parses instance contexts and map them 
   * as an enumerable with indexes as ids
   *
   * @param contexts - an instance's contexts
   * @returns an ID'd enumerable of contexts
   */
  private static parseDefs(contexts: Context[]): Array<Omit<Context, "fn">> {
    const data: Omit<Context, "fn">[] = [];
    let section = [];

    // If with one context, do selective transform and return it
    if (contexts.length === 1) {
      return [{ id: '1', defs: [...contexts[0].defs] }];
    }

    for (let i = 0; i < contexts.length; i++) {
      // If sections is populated, append to data output
      // TODO: Consider logical inutility, doesn't need to be array?
      if (section.length !== 0) {
        data.push({ id: `${data.length + 1}`, defs: section });
        section = [];
      }
      // Iterate over context definition and push to sections
      for (let j = 0; j < contexts[i].defs.length; j++) {
        section.push(contexts[i].defs[j]);
      }
    }
    return data;
  }

  /**
   * Transforms a collection of definition objects to React elements
   *
   * @param groups - a collection of definition objects
   * @returns a React node of the transformed definition objects
   */
  private static formatDefGroups(groups: Def[] | DefinitionCollection): React.ReactNode[] {
    // Initialize carrier array
    let formatted: Array<[string, React.ReactNode]> = [];

    ((groups as DefinitionCollection).forEach(group => {
      for (let i = 0; i < group.length ; i++) {
        // Initialize cache
        const arr = [];

        // Iterate Def objects
        for (let j = 0; j < group[i].length; j++) {
          // Reference a text, usage note, or verbal illustration
          let val = group[i][j];

          // If cache has an item (must be the label), then parse the following item
          if (arr.length === 1) {
            switch (arr[0]) {
              case StrictDefLabels.Text: val = DictionaryEntryParser.formatText(val as string); break;
              case StrictDefLabels.UsageNotes: val = DictionaryEntryParser.formatUsageNote(val as Array<DefiningText>); break;
              case StrictDefLabels.VerbalIllustration: val = DictionaryEntryParser.formatVerbalIllustration(val as Array<DefiningText>); break;
            }
            arr.push(val as React.ReactNode);
            continue;
          }
          // If cache is empty, push this item (should be the label)
          arr.push(val as string);
        }
        // Initialize or expand formatted array
        formatted = formatted ? [...formatted, (arr as [string, React.ReactNode])] : [arr as [string, React.ReactNode]];
      }
    }));
    return formatted;
  }

  /**
   * Parses format codes/tokens and respectively transforms strings
   *
   * @param val - the string to parse
   * @returns a React node of the transformed text
   */
  private static formatText(val: string): React.ReactNode {
    const formattedVals = [];

    // Make relevant composite pattern object
    const PunctuationAndCrossRefPatterns = {
      ...DictionaryEntryParser.PunctuationPatterns,
      ...DictionaryEntryParser.CrossRefPatterns,
    }

    for (const [, matcher] of Object.entries(PunctuationAndCrossRefPatterns)) {
      // Iterate over each pattern and assign a match
      const match = val.matchAll(matcher.rgx);
      if (match) {
        // Create an element with the matcher's properties if there's a match
        const newVal = val = val.replaceAll(matcher.rgx, matcher.replacement);
        const Tag = matcher.tag as keyof React.JSX.IntrinsicElements;
        formattedVals.push(<Tag key={crypto.randomUUID()} className={matcher.class}>{newVal}</Tag>);
      } else {
        // Push the updated value if there isn't a match
        // TODO: Consider inutility
        formattedVals.push(<span key={crypto.randomUUID()}>{val}</span>);
      }
    }
    // Return the most recently updated value
    return <div key={crypto.randomUUID()}>{formattedVals[formattedVals.length - 1]}</div>;
  }

  /**
   * Parses a definition object with the usage note 
   * token and transforms content to a React node
   *
   * @param val - the definition object to parse
   * @returns a React node of the transformed definition object
   */
  private static formatUsageNote(val: Array<DefiningText>): React.ReactNode {
    const formattedVals = [];
    // Narrow reference, exterior collection is useless
    const inner = Object.values(val[0]);

    for (let i = 0; i < inner.length; i++) {
      // Reference definition
      /** @example ['text', '{it}sup{/it}'] */
      const dt = inner[i];

      // Pipe to formatter methods based on type (dt[0])
      switch (dt[0]) {
        case StrictDefLabels.Text: formattedVals.push(DictionaryEntryParser.formatText(dt[1])); break;
        case StrictDefLabels.UsageNotes: formattedVals.push(DictionaryEntryParser.formatUsageNote(dt[1])); break;
        case StrictDefLabels.VerbalIllustration: formattedVals.push(DictionaryEntryParser.formatVerbalIllustration(dt[1])); break;
      }
    }

    // Return the most updated formatted value
    return <div key={crypto.randomUUID()}>{formattedVals[formattedVals.length - 1]}</div>;
  }

  /**
   * Parses a definition object with the verbal illustration
   * token and transforms content to a React node
   *
   * @param val - the definition object to parse
   * @returns a React node of the transformed definition object
   */
  private static formatVerbalIllustration(val: Array<DefiningText>): React.ReactNode {
    const formattedVals = [];

    for (let i = 0; i < val.length; i++) {
      // Reference entries for an iterable
      const visEntries = Object.entries(val[i]);

      for (const [id, immutableVal] of visEntries) {
        let val = immutableVal;
        // Parse types of text or quote attributions 
        // and respectively transform via formatter methods
        switch (id) {
          case StrictDefMarkLabels.Text: {
            // Initialize cache
            const tmp = [];
            // Make relevant composite pattern object
            const AllPatterns = {
              ...DictionaryEntryParser.PunctuationPatterns, 
              ...DictionaryEntryParser.MarkPatterns,
              ...DictionaryEntryParser.CrossRefPatterns,
            };

            for (const [, matcher] of Object.entries(AllPatterns)) {
              // Iterate over each pattern and assign a match
              const match = val.matchAll(matcher.rgx);
              if (match) {
                // Create an element with the matcher's properties if there's a match
                const newVal = val = val.replaceAll(matcher.rgx, matcher.replacement);
                const Tag = matcher.tag as keyof React.JSX.IntrinsicElements;
                tmp.push(<Tag key={crypto.randomUUID()} className={matcher.class}>{newVal}</Tag>);
              } else {
                // Push the updated value if there isn't a match
                tmp.push(<span key={crypto.randomUUID()}>{val}</span>);
              }
            }
            // Push most recent value of cache to output
            formattedVals.push(tmp[tmp.length - 1]);
            break;
          }
          case StrictDefMarkLabels.AttributionOfQuote: {
            const formatted = DictionaryEntryParser.formatAttributionOfQuote(val as { auth: string } | { source: string });
            formattedVals.push(formatted);
            break;
          }
        }
      }
    }
    // Return the collection output, not the recent value
    return <div key={crypto.randomUUID()}>{...formattedVals}</div>;
  }

  /**
   * Parses a definition object with the 
   * verbal illustration token of type attribution
   *
   * @param val - the author or source object
   * @returns a React node of the transformed attribution object
   */
  private static formatAttributionOfQuote(val: { auth: string } | { source: string }): React.ReactNode {
    // Enforce predicate
    if (DictionaryEntryParser.isAuth(val)) {
      return <span key={crypto.randomUUID()}>{`— ${val.auth}`}</span>;
    } 
    return <span key={crypto.randomUUID()}>{`— ${val.source}`}</span>;
  }

  /**
   * Type predicate for attribution objects
   *
   * @param token - the attribution object to validate
   * @returns a type guard asserting the token is or is not for an author
   */
  private static isAuth(token: { auth: string } | { source: string }): token is { auth: string } {
    return (token as { auth: string }).auth !== undefined && (token as { auth: string }).auth !== null;
  }
}
