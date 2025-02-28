export const puncPatterns = {
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

  export const glossPatterns = {

  };
