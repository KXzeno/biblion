import { format } from 'path';
import React from 'react';

export class DictionaryEntryParser {
  private subentries: Subentries[] = [];
  private contexts: Context[] = [];

  private static PunctuationPatterns = {
    boldMatcher: { 
      rgx: /(?:\{b\})([a-zA-Z\s]+)(?:\{\\\/b\})/g,
      replacement: "$1",
      tag: 'span',
      class: 'font-bold', 
    },
    boldColonMatcher: { 
      rgx: /(\{bc\})/g,
      replacement: ": ",
      tag: 'span', 
      class: 'font-bold', 
    },
    // TODO: Add class prop when defined
    subscriptMatcher: { 
      rgx: /(?:\{inf\})([a-zA-Z\s]+)(?:\{\\\/inf\})/g,
      replacement: "$1",
      tag: 'span',
      class: ''
    },
    italicsMatcher: {
      rgx: /(?:\{it\})([a-zA-Z\s]+)(?:\{\\\/it\})/g,
      replacement: "$1", 
      tag: 'em',
      class: ''
    },
    leftDoubleQuoteMatcher: {
      rgx: /(\{ldquo\})/g,
      replacement: '\u{201C}',
      tag: '',
      class: ''
    },
    rightDoubleQuoteMatcher: {
      rgx: /(\{rdquo\})/g,
      replacement: '\u{201D}',
      tag: '',
      class: ''
    },
    // TODO: Add class prop when defined
    smallCapitalsMatcher: {
      rgx: /(?:\{sc\})([a-zA-Z\s]+)(?:\{\\\/sc\})/g,
      replacement: "$1",
      tag: 'span',
      class: '',
    },
    // TODO: Add class prop when defined
    superscriptMatcher: {
      rgx: /(?:\{sup\})([a-zA-Z\s]+(?:\{\\\/sup\}))/g,
      replacement: "$1",
      tag: 'span',
      class: ''
    },
  }

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
    console.log(formattedDefGroups[0].defs);
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
    let formattedVals = [];
    for (const [, matcher] of Object.entries(DictionaryEntryParser.PunctuationPatterns)) {
      const match = val.matchAll(matcher.rgx);
      if (match) {
        val = val.replaceAll(matcher.rgx, matcher.replacement);
        const Tag = matcher.tag as keyof React.JSX.IntrinsicElements;
        formattedVals.push(<Tag className={matcher.class}>{val}</Tag>);
      } else {
        formattedVals.push(<>{val}</>);
      }
    }
    return <p>[...formattedVals]</p>;
  }

  private static formatUsageNote(val: string) {

  }

  private static formatVerbalIllustration(val: string) {

  }
}

enum StrictDefLabels {
  Text = 'text',
  VerbalIllustration = 'vis',
  UsageNotes = 'uns',
}

type SenseArray = Array<string | object>;
type Context = { id: string, fn: string, defs: string[] };
interface Def {
  vd?: string;
  sseq: Array<SenseArray>;
}

interface Payload {
  meta: {
    id: string;
    stems: Array<string>;
  }
  fl: string;
  shortdef: Array<string>;
  def: Array<object>;
}

interface Subentries {
  id: string;
  variants: string[];
  function: string;
  shortdef: Array<string>;
  def: Array<object>;
}
