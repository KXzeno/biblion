export const puncPatterns = {
    boldMatcher: { 
      rgx: /(?:\{b\})([a-zA-Z\s]+)(?:\{\/b\})/g,
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
      rgx: /(?:\{inf\})([a-zA-Z\s]+)(?:\{\/inf\})/g,
      replacement: "$1",
      tag: 'span',
      class: ''
    },
    italicsMatcher: {
      rgx: /(?:\{it\})([a-zA-Z\s]+)(?:\{\/it\})/g,
      replacement: "$1", 
      tag: 'em',
      class: ''
    },
    leftDoubleQuoteMatcher: {
      rgx: /(\{ldquo\})/g,
      replacement: '\u{201C}',
      tag: 'span',
      class: ''
    },
    rightDoubleQuoteMatcher: {
      rgx: /(\{rdquo\})/g,
      replacement: '\u{201D}',
      tag: 'span',
      class: ''
    },
    // TODO: Add class prop when defined
    smallCapitalsMatcher: {
      rgx: /(?:\{sc\})([a-zA-Z\s]+)(?:\{\/sc\})/g,
      replacement: "$1",
      tag: 'span',
      class: '',
    },
    // TODO: Add class prop when defined
    superscriptMatcher: {
      rgx: /(?:\{sup\})([a-zA-Z\s]+(?:\{\/sup\}))/g,
      replacement: "$1",
      tag: 'span',
      class: ''
    },
  }

  export const markPatterns = {
    // TODO: Add class prop when defined
    glossMatcher: {
      rgx: /(?:\{gloss\})([a-zA-Z\s]+)(?:\{\/gloss\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    // TODO: Add class prop when defined
    headwordMatcherInParagraphMatcher: {
      rgx: /(?:\{parahw\})([a-zA-Z\s]+)(?:\{\/qword\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    // TODO: Add class prop when defined
    phraseMatcher: {
      rgx: /(?:\{phrase\})([a-zA-Z\s]+)(?:\{\/phrase\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    // TODO: Add class prop when defined
    headwordQuoteMatcher: {
      rgx: /(?:\{qword\})([a-zA-Z\s]+)(?:\{\/qword\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    // TODO: Add class prop when defined
    headwordRunningTextMatcher: {
      rgx: /(?:\{wi\})([a-zA-Z\s]+)(?:\{\/wi\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    }
  };

  export const crossRefPatterns = {
    autoLinkMatcher: {
      rgx: /(?:\{a_link\|)([\w\s\d\:\,]+){1}(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    directLinkMatcher: {
      rgx: /(?:\{d_link\|)([\w\s\d\:\,]+){1}(?:\|)([\w\s\d\:\,]+)?(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    italicizedLinkMatcher: {
      rgx: /(?:\{i_link\|)([\w\s\d\:\,]+){1}(?:\|)([\w\s\d\:\,]+)?(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    etymologyLinkMatcher: {
      rgx: /(?:\{et_link\|)([\w\s\d\:\,]+){1}(?:\|)([\w\s\d\:\,]+)?(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    synonymousCrossRefMatcher: {
      rgx: /(?:\{sx\|)([\w\s\d\:\,]+){1}(?:\|)([\w\s\d\:\,]+)?(?:\|)([\d\w\s\d\:\,]+)?(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    directionalCrossRefMatcher: {
      rgx: /(?:\{dxt\|)([\w\s\d\:\,]+){1}(?:\|)([\w\s\d\:\,]+)?(?:\|)([\d\w\s\d\:\,]+)?(?:\})/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    /** Grouping Tokens*/
    introductoryGroupMatcher: {
      rgx: /(?:\{dx\}([\w\s\d\:\{\}\|\,]+)(?:\{\/dx\}))/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    parentheticalIntroductoryGroupMatcher: {
      rgx: /(?:\{dx_def\}([\w\s\d\:\{\}\|]+)(?:\{\/dx_def\}))/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    directionalIntroductoryGroupMatcher: {
      rgx: /(?:\{dx_ety\}([\w\s\d\:\{\}\|]+)(?:\{\/dx_ety\}))/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
    moreMatcher: {
      rgx: /(?:\{ma\}([\w\s\d\:\{\}\|]+)(?:\{\/ma\}))/g,
      replacement: "$1",
      tag: "span",
      class: "",
    },
  }
