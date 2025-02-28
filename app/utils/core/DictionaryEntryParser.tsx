import React from 'react';

import { puncPatterns, markPatterns } from './ModelPatterns';
import {
  StrictDefLabels,
  StrictDefMarkLabels,
  type Context,
  type Def,
  type Payload,
  type Subentries,
} from './types/DictionaryEntryParser.types';

export class DictionaryEntryParser {
  private subentries: Subentries[] = [];
  private contexts: Context[] = [];

  private static PunctuationPatterns = puncPatterns;
  private static MarkPatterns = markPatterns;

  private constructor(payload: Array<Payload>) {
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

  public static parse(payload: Array<Payload>) {
    const parser = new DictionaryEntryParser(payload);
    parser.parseContexts();
    const defGroups = DictionaryEntryParser.parseDefs(parser.contexts);
    const formattedDefGroups = defGroups.map(group => ({ id: group.id, defs: DictionaryEntryParser.formatDefGroups(group.defs) }));
    // return formattedDefGroups;
  }

  private parseContexts() {
    this.subentries.forEach((entry) => {
      if (entry.def) {
        entry.def.forEach(sense => { 
          if (sense.vd) {
            const parsedDef = this.parseSenses({ vd: sense.vd, sseq: sense.sseq });
            if (entry.id === this.contexts[this.contexts.length - 1].id) {
              this.contexts[this.contexts.length - 1].defs.push(parsedDef);
            } else {
              this.contexts.push({ id: entry.id, fn: entry.function, defs: parsedDef });
            }
          } else {
            const parsedDef = this.parseSenses({ sseq: sense.sseq });
            this.contexts.push({ id: entry.id, fn: entry.function, defs: parsedDef });
          }
        });
      }
      // console.log(this.contexts);
    });
  }

  private parseSenses(def: Def): string[] {
    // console.log(def);
    const { sseq } = def;
    const volatileContext = [];
    if (def.vd) {
      // console.log(def.sseq);
    }
    for (let i = 0; i < sseq.length; i++) {
      for (let j = 0; j < sseq[i].length; j++) {
        const sense = sseq[i][j];
        const type = sense[0];
        const sdef = sense[1];

        if (sdef.sn && (sdef.sn as string).match(/[a-z]|(?:\d\sa)/)) {
          volatileContext.push(sdef.dt);
          continue;
        }
        switch (type) {
          case 'bs': 
            volatileContext.push(sdef.sense.dt);
          break;
          default: volatileContext.push(sdef.dt);
        }
      }
    }
    return volatileContext;
  }

  private static parseDefs(contexts: Context[]) {
    const data = [];
    let section = [];
    for (let i = 0; i < contexts.length; i++) {
      if (section.length !== 0) {
        data.push({ id: data.length + 1, defs: section });
        section = [];
      }
      for (let j = 0; j < contexts[i].defs.length; j++) {
        section.push(contexts[i].defs[j]);
      }
    }
    return data;
  }

  private static formatDefGroups(groups: any) {
    const formatted = [];
    (groups as any[]).map(group => {
      for (let i = 0; i < group.length; i++) {
        const arr = [];
        for (let j = 0; j < group[i].length; j++) {
          let val = group[i][j];
          if (arr.length === 1) {
            switch (arr[0]) {
              case StrictDefLabels.Text: val = DictionaryEntryParser.formatText(val); break;
              case StrictDefLabels.UsageNotes: val = DictionaryEntryParser.formatUsageNote(val); break;
              case StrictDefLabels.VerbalIllustration: val = DictionaryEntryParser.formatVerbalIllustration(val); break;
            }
            arr.push(val);
            continue;
          }
          arr.push(val);
        }
        formatted.push(arr);
      }
    });
    return formatted;
  }

  private static formatText(val: string) {
    const formattedVals = [];
    for (const [, matcher] of Object.entries(DictionaryEntryParser.PunctuationPatterns)) {
      const match = val.matchAll(matcher.rgx);
      if (match) {
        const newVal = val.replaceAll(matcher.rgx, matcher.replacement);
        const Tag = matcher.tag as keyof React.JSX.IntrinsicElements;
        formattedVals.push(<Tag className={matcher.class}>{newVal}</Tag>);
      } else {
        formattedVals.push(<>{val}</>);
      }
    }
    return <p>[...formattedVals]</p>;
  }

  private static formatUsageNote(val: Array<string>) {
    const formattedVal = [];
    const inner = val[0];
    for (let i = 0; i < inner.length; i++) {
      const dt = inner[i];
      switch (dt[0]) {
        case StrictDefLabels.Text: DictionaryEntryParser.formatText(dt[1]); break;
        case StrictDefLabels.UsageNotes: DictionaryEntryParser.formatUsageNote(dt[1]); break;
        case StrictDefLabels.VerbalIllustration: DictionaryEntryParser.formatVerbalIllustration(dt[1]); break;
      }
    }
    return <p>[...formattedVal]</p>;
  }

  private static formatVerbalIllustration(val: Array<object>) {
    const formattedVals = [];
    for (let i = 0; i < val.length; i++) {
      const visEntries = Object.entries(val[i]);
      for (const [id, val] of visEntries) {
        switch (id) {
          case StrictDefMarkLabels.Text: {
            for (const [, matcher] of Object.entries(DictionaryEntryParser.MarkPatterns)) {
              const match = val.matchAll(matcher.rgx);
              if (match) {
                const newVal = val.replaceAll(matcher.rgx, matcher.replacement);
                const Tag = matcher.tag as keyof React.JSX.IntrinsicElements;
                formattedVals.push(<Tag className={matcher.class}>{newVal}</Tag>);
              } else {
                formattedVals.push(<>{val}</>);
              }
            }
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
    return <p>[...formattedVals]</p>;
  }

  private static formatAttributionOfQuote(val: { auth: string } | { source: string }) {
    if (DictionaryEntryParser.isAuth(val)) {
      return <span>{`— ${val.auth}`}</span>;
    } 
    return <span>{`— ${val.source}`}</span>;
  }

  private static isAuth(token: { auth: string } | { source: string }): token is { auth: string } {
    return (token as { auth: string }).auth !== undefined && (token as { auth: string }).auth !== null;
  }
}
