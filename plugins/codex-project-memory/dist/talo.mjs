var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/constants.js"(exports, module) {
    "use strict";
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var SEP = "/";
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
      SEP
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
      SEP: "\\"
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/utils.js"(exports) {
    "use strict";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants();
    exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
    exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports.isWindows = () => {
      if (typeof navigator !== "undefined" && navigator.platform) {
        const platform = navigator.platform.toLowerCase();
        return platform === "win32" || platform === "windows";
      }
      if (typeof process !== "undefined" && process.platform) {
        return process.platform === "win32";
      }
      return false;
    };
    exports.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
    exports.basename = (path12, { windows } = {}) => {
      const segs = path12.split(windows ? /[\\/]/ : "/");
      const last = segs[segs.length - 1];
      if (last === "") {
        return segs[segs.length - 2];
      }
      return last;
    };
  }
});

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/scan.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module.exports = scan;
  }
});

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/parse.js
var require_parse = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/parse.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var utils = require_utils();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const a = values[i];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var buildCharClassStar = (chars) => {
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var getStarExtglobSequenceChars = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      return chars;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      const safeChars = [];
      let sawStarSequence = false;
      let combinable = true;
      for (const branch of branches) {
        const chars = getStarExtglobSequenceChars(branch);
        if (chars) {
          sawStarSequence = true;
          safeChars.push(...chars);
          continue;
        }
        const literal = normalizeSimpleBranch(branch);
        if (literal && literal.length === 1) {
          safeChars.push(literal);
          continue;
        }
        combinable = false;
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      if (sawStarSequence) {
        return combinable ? { risky: true, safeOutput: buildCharClassStar([...new Set(safeChars)]) } : { risky: true };
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const PLATFORM_CHARS = constants.globChars(opts.windows);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.output = (prev.output || prev.value) + tok.value;
          prev.value += tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(opts.windows);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module.exports = parse;
  }
});

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/lib/picomatch.js"(exports, module) {
    "use strict";
    var scan = require_scan();
    var parse = require_parse();
    var utils = require_utils();
    var constants = require_constants();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch2 = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch2(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = opts.windows;
      const regex = isState ? picomatch2.compileRe(glob, options) : picomatch2.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch2(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch2.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch2.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch2.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch2.matchBase = (input, glob, options, posix = options && options.windows) => {
      const regex = glob instanceof RegExp ? glob : picomatch2.makeRe(glob, options);
      return regex.test(utils.basename(input, { windows: posix }));
    };
    picomatch2.isMatch = (str, patterns, options) => picomatch2(patterns, options)(str);
    picomatch2.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch2.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch2.scan = (input, options) => scan(input, options);
    picomatch2.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch2.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch2.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch2.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true) throw err;
        return /$^/;
      }
    };
    picomatch2.constants = constants;
    module.exports = picomatch2;
  }
});

// ../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "../../node_modules/.pnpm/picomatch@4.0.5/node_modules/picomatch/index.js"(exports, module) {
    "use strict";
    var pico = require_picomatch();
    var utils = require_utils();
    function picomatch2(glob, options, returnState = false) {
      if (options && (options.windows === null || options.windows === void 0)) {
        options = { ...options, windows: utils.isWindows() };
      }
      return pico(glob, options, returnState);
    }
    Object.assign(picomatch2, pico);
    module.exports = picomatch2;
  }
});

// ../../node_modules/.pnpm/ignore@7.0.5/node_modules/ignore/index.js
var require_ignore = __commonJS({
  "../../node_modules/.pnpm/ignore@7.0.5/node_modules/ignore/index.js"(exports, module) {
    "use strict";
    function makeArray(subject) {
      return Array.isArray(subject) ? subject : [subject];
    }
    var UNDEFINED = void 0;
    var EMPTY = "";
    var SPACE = " ";
    var ESCAPE = "\\";
    var REGEX_TEST_BLANK_LINE = /^\s+$/;
    var REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/;
    var REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/;
    var REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/;
    var REGEX_SPLITALL_CRLF = /\r?\n/g;
    var REGEX_TEST_INVALID_PATH = /^\.{0,2}\/|^\.{1,2}$/;
    var REGEX_TEST_TRAILING_SLASH = /\/$/;
    var SLASH = "/";
    var TMP_KEY_IGNORE = "node-ignore";
    if (typeof Symbol !== "undefined") {
      TMP_KEY_IGNORE = /* @__PURE__ */ Symbol.for("node-ignore");
    }
    var KEY_IGNORE = TMP_KEY_IGNORE;
    var define = (object, key, value) => {
      Object.defineProperty(object, key, { value });
      return value;
    };
    var REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g;
    var RETURN_FALSE = () => false;
    var sanitizeRange = (range) => range.replace(
      REGEX_REGEXP_RANGE,
      (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0) ? match : EMPTY
    );
    var cleanRangeBackSlash = (slashes) => {
      const { length } = slashes;
      return slashes.slice(0, length - length % 2);
    };
    var REPLACERS = [
      [
        // Remove BOM
        // TODO:
        // Other similar zero-width characters?
        /^\uFEFF/,
        () => EMPTY
      ],
      // > Trailing spaces are ignored unless they are quoted with backslash ("\")
      [
        // (a\ ) -> (a )
        // (a  ) -> (a)
        // (a ) -> (a)
        // (a \ ) -> (a  )
        /((?:\\\\)*?)(\\?\s+)$/,
        (_, m1, m2) => m1 + (m2.indexOf("\\") === 0 ? SPACE : EMPTY)
      ],
      // Replace (\ ) with ' '
      // (\ ) -> ' '
      // (\\ ) -> '\\ '
      // (\\\ ) -> '\\ '
      [
        /(\\+?)\s/g,
        (_, m1) => {
          const { length } = m1;
          return m1.slice(0, length - length % 2) + SPACE;
        }
      ],
      // Escape metacharacters
      // which is written down by users but means special for regular expressions.
      // > There are 12 characters with special meanings:
      // > - the backslash \,
      // > - the caret ^,
      // > - the dollar sign $,
      // > - the period or dot .,
      // > - the vertical bar or pipe symbol |,
      // > - the question mark ?,
      // > - the asterisk or star *,
      // > - the plus sign +,
      // > - the opening parenthesis (,
      // > - the closing parenthesis ),
      // > - and the opening square bracket [,
      // > - the opening curly brace {,
      // > These special characters are often called "metacharacters".
      [
        /[\\$.|*+(){^]/g,
        (match) => `\\${match}`
      ],
      [
        // > a question mark (?) matches a single character
        /(?!\\)\?/g,
        () => "[^/]"
      ],
      // leading slash
      [
        // > A leading slash matches the beginning of the pathname.
        // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
        // A leading slash matches the beginning of the pathname
        /^\//,
        () => "^"
      ],
      // replace special metacharacter slash after the leading slash
      [
        /\//g,
        () => "\\/"
      ],
      [
        // > A leading "**" followed by a slash means match in all directories.
        // > For example, "**/foo" matches file or directory "foo" anywhere,
        // > the same as pattern "foo".
        // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
        // >   under directory "foo".
        // Notice that the '*'s have been replaced as '\\*'
        /^\^*\\\*\\\*\\\//,
        // '**/foo' <-> 'foo'
        () => "^(?:.*\\/)?"
      ],
      // starting
      [
        // there will be no leading '/'
        //   (which has been replaced by section "leading slash")
        // If starts with '**', adding a '^' to the regular expression also works
        /^(?=[^^])/,
        function startingReplacer() {
          return !/\/(?!$)/.test(this) ? "(?:^|\\/)" : "^";
        }
      ],
      // two globstars
      [
        // Use lookahead assertions so that we could match more than one `'/**'`
        /\\\/\\\*\\\*(?=\\\/|$)/g,
        // Zero, one or several directories
        // should not use '*', or it will be replaced by the next replacer
        // Check if it is not the last `'/**'`
        (_, index, str) => index + 6 < str.length ? "(?:\\/[^\\/]+)*" : "\\/.+"
      ],
      // normal intermediate wildcards
      [
        // Never replace escaped '*'
        // ignore rule '\*' will match the path '*'
        // 'abc.*/' -> go
        // 'abc.*'  -> skip this rule,
        //    coz trailing single wildcard will be handed by [trailing wildcard]
        /(^|[^\\]+)(\\\*)+(?=.+)/g,
        // '*.js' matches '.js'
        // '*.js' doesn't match 'abc'
        (_, p1, p2) => {
          const unescaped = p2.replace(/\\\*/g, "[^\\/]*");
          return p1 + unescaped;
        }
      ],
      [
        // unescape, revert step 3 except for back slash
        // For example, if a user escape a '\\*',
        // after step 3, the result will be '\\\\\\*'
        /\\\\\\(?=[$.|*+(){^])/g,
        () => ESCAPE
      ],
      [
        // '\\\\' -> '\\'
        /\\\\/g,
        () => ESCAPE
      ],
      [
        // > The range notation, e.g. [a-zA-Z],
        // > can be used to match one of the characters in a range.
        // `\` is escaped by step 3
        /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
        (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}` : close === "]" ? endEscape.length % 2 === 0 ? `[${sanitizeRange(range)}${endEscape}]` : "[]" : "[]"
      ],
      // ending
      [
        // 'js' will not match 'js.'
        // 'ab' will not match 'abc'
        /(?:[^*])$/,
        // WTF!
        // https://git-scm.com/docs/gitignore
        // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
        // which re-fixes #24, #38
        // > If there is a separator at the end of the pattern then the pattern
        // > will only match directories, otherwise the pattern can match both
        // > files and directories.
        // 'js*' will not match 'a.js'
        // 'js/' will not match 'a.js'
        // 'js' will match 'a.js' and 'a.js/'
        (match) => /\/$/.test(match) ? `${match}$` : `${match}(?=$|\\/$)`
      ]
    ];
    var REGEX_REPLACE_TRAILING_WILDCARD = /(^|\\\/)?\\\*$/;
    var MODE_IGNORE = "regex";
    var MODE_CHECK_IGNORE = "checkRegex";
    var UNDERSCORE = "_";
    var TRAILING_WILD_CARD_REPLACERS = {
      [MODE_IGNORE](_, p1) {
        const prefix = p1 ? `${p1}[^/]+` : "[^/]*";
        return `${prefix}(?=$|\\/$)`;
      },
      [MODE_CHECK_IGNORE](_, p1) {
        const prefix = p1 ? `${p1}[^/]*` : "[^/]*";
        return `${prefix}(?=$|\\/$)`;
      }
    };
    var makeRegexPrefix = (pattern) => REPLACERS.reduce(
      (prev, [matcher, replacer]) => prev.replace(matcher, replacer.bind(pattern)),
      pattern
    );
    var isString = (subject) => typeof subject === "string";
    var checkPattern = (pattern) => pattern && isString(pattern) && !REGEX_TEST_BLANK_LINE.test(pattern) && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern) && pattern.indexOf("#") !== 0;
    var splitPattern = (pattern) => pattern.split(REGEX_SPLITALL_CRLF).filter(Boolean);
    var IgnoreRule = class {
      constructor(pattern, mark, body, ignoreCase, negative, prefix) {
        this.pattern = pattern;
        this.mark = mark;
        this.negative = negative;
        define(this, "body", body);
        define(this, "ignoreCase", ignoreCase);
        define(this, "regexPrefix", prefix);
      }
      get regex() {
        const key = UNDERSCORE + MODE_IGNORE;
        if (this[key]) {
          return this[key];
        }
        return this._make(MODE_IGNORE, key);
      }
      get checkRegex() {
        const key = UNDERSCORE + MODE_CHECK_IGNORE;
        if (this[key]) {
          return this[key];
        }
        return this._make(MODE_CHECK_IGNORE, key);
      }
      _make(mode, key) {
        const str = this.regexPrefix.replace(
          REGEX_REPLACE_TRAILING_WILDCARD,
          // It does not need to bind pattern
          TRAILING_WILD_CARD_REPLACERS[mode]
        );
        const regex = this.ignoreCase ? new RegExp(str, "i") : new RegExp(str);
        return define(this, key, regex);
      }
    };
    var createRule = ({
      pattern,
      mark
    }, ignoreCase) => {
      let negative = false;
      let body = pattern;
      if (body.indexOf("!") === 0) {
        negative = true;
        body = body.substr(1);
      }
      body = body.replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, "!").replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, "#");
      const regexPrefix = makeRegexPrefix(body);
      return new IgnoreRule(
        pattern,
        mark,
        body,
        ignoreCase,
        negative,
        regexPrefix
      );
    };
    var RuleManager = class {
      constructor(ignoreCase) {
        this._ignoreCase = ignoreCase;
        this._rules = [];
      }
      _add(pattern) {
        if (pattern && pattern[KEY_IGNORE]) {
          this._rules = this._rules.concat(pattern._rules._rules);
          this._added = true;
          return;
        }
        if (isString(pattern)) {
          pattern = {
            pattern
          };
        }
        if (checkPattern(pattern.pattern)) {
          const rule = createRule(pattern, this._ignoreCase);
          this._added = true;
          this._rules.push(rule);
        }
      }
      // @param {Array<string> | string | Ignore} pattern
      add(pattern) {
        this._added = false;
        makeArray(
          isString(pattern) ? splitPattern(pattern) : pattern
        ).forEach(this._add, this);
        return this._added;
      }
      // Test one single path without recursively checking parent directories
      //
      // - checkUnignored `boolean` whether should check if the path is unignored,
      //   setting `checkUnignored` to `false` could reduce additional
      //   path matching.
      // - check `string` either `MODE_IGNORE` or `MODE_CHECK_IGNORE`
      // @returns {TestResult} true if a file is ignored
      test(path12, checkUnignored, mode) {
        let ignored = false;
        let unignored = false;
        let matchedRule;
        this._rules.forEach((rule) => {
          const { negative } = rule;
          if (unignored === negative && ignored !== unignored || negative && !ignored && !unignored && !checkUnignored) {
            return;
          }
          const matched = rule[mode].test(path12);
          if (!matched) {
            return;
          }
          ignored = !negative;
          unignored = negative;
          matchedRule = negative ? UNDEFINED : rule;
        });
        const ret = {
          ignored,
          unignored
        };
        if (matchedRule) {
          ret.rule = matchedRule;
        }
        return ret;
      }
    };
    var throwError = (message, Ctor) => {
      throw new Ctor(message);
    };
    var checkPath = (path12, originalPath, doThrow) => {
      if (!isString(path12)) {
        return doThrow(
          `path must be a string, but got \`${originalPath}\``,
          TypeError
        );
      }
      if (!path12) {
        return doThrow(`path must not be empty`, TypeError);
      }
      if (checkPath.isNotRelative(path12)) {
        const r = "`path.relative()`d";
        return doThrow(
          `path should be a ${r} string, but got "${originalPath}"`,
          RangeError
        );
      }
      return true;
    };
    var isNotRelative = (path12) => REGEX_TEST_INVALID_PATH.test(path12);
    checkPath.isNotRelative = isNotRelative;
    checkPath.convert = (p) => p;
    var Ignore = class {
      constructor({
        ignorecase = true,
        ignoreCase = ignorecase,
        allowRelativePaths = false
      } = {}) {
        define(this, KEY_IGNORE, true);
        this._rules = new RuleManager(ignoreCase);
        this._strictPathCheck = !allowRelativePaths;
        this._initCache();
      }
      _initCache() {
        this._ignoreCache = /* @__PURE__ */ Object.create(null);
        this._testCache = /* @__PURE__ */ Object.create(null);
      }
      add(pattern) {
        if (this._rules.add(pattern)) {
          this._initCache();
        }
        return this;
      }
      // legacy
      addPattern(pattern) {
        return this.add(pattern);
      }
      // @returns {TestResult}
      _test(originalPath, cache, checkUnignored, slices) {
        const path12 = originalPath && checkPath.convert(originalPath);
        checkPath(
          path12,
          originalPath,
          this._strictPathCheck ? throwError : RETURN_FALSE
        );
        return this._t(path12, cache, checkUnignored, slices);
      }
      checkIgnore(path12) {
        if (!REGEX_TEST_TRAILING_SLASH.test(path12)) {
          return this.test(path12);
        }
        const slices = path12.split(SLASH).filter(Boolean);
        slices.pop();
        if (slices.length) {
          const parent = this._t(
            slices.join(SLASH) + SLASH,
            this._testCache,
            true,
            slices
          );
          if (parent.ignored) {
            return parent;
          }
        }
        return this._rules.test(path12, false, MODE_CHECK_IGNORE);
      }
      _t(path12, cache, checkUnignored, slices) {
        if (path12 in cache) {
          return cache[path12];
        }
        if (!slices) {
          slices = path12.split(SLASH).filter(Boolean);
        }
        slices.pop();
        if (!slices.length) {
          return cache[path12] = this._rules.test(path12, checkUnignored, MODE_IGNORE);
        }
        const parent = this._t(
          slices.join(SLASH) + SLASH,
          cache,
          checkUnignored,
          slices
        );
        return cache[path12] = parent.ignored ? parent : this._rules.test(path12, checkUnignored, MODE_IGNORE);
      }
      ignores(path12) {
        return this._test(path12, this._ignoreCache, false).ignored;
      }
      createFilter() {
        return (path12) => !this.ignores(path12);
      }
      filter(paths) {
        return makeArray(paths).filter(this.createFilter());
      }
      // @returns {TestResult}
      test(path12) {
        return this._test(path12, this._testCache, true);
      }
    };
    var factory = (options) => new Ignore(options);
    var isPathValid = (path12) => checkPath(path12 && checkPath.convert(path12), path12, RETURN_FALSE);
    var setupWindows = () => {
      const makePosix = (str) => /^\\\\\?\\/.test(str) || /["<>|\u0000-\u001F]+/u.test(str) ? str : str.replace(/\\/g, "/");
      checkPath.convert = makePosix;
      const REGEX_TEST_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i;
      checkPath.isNotRelative = (path12) => REGEX_TEST_WINDOWS_PATH_ABSOLUTE.test(path12) || isNotRelative(path12);
    };
    if (
      // Detect `process` so that it can run in browsers.
      typeof process !== "undefined" && process.platform === "win32"
    ) {
      setupWindows();
    }
    module.exports = factory;
    factory.default = factory;
    module.exports.isPathValid = isPathValid;
    define(module.exports, /* @__PURE__ */ Symbol.for("setupWindows"), setupWindows);
  }
});

// ../../packages/project-memory-core/src/cli.ts
import { spawnSync as spawnSync3 } from "child_process";
import { readFileSync as readFileSync9 } from "fs";
import { pathToFileURL as pathToFileURL3 } from "url";

// ../../packages/project-memory-core/src/desktop-integration.ts
import { spawnSync } from "child_process";
import {
  chmodSync as chmodSync4,
  copyFileSync as copyFileSync2,
  existsSync as existsSync5,
  readdirSync as readdirSync4,
  readFileSync as readFileSync5,
  renameSync as renameSync4,
  statSync as statSync4,
  writeFileSync as writeFileSync4
} from "fs";
import { homedir as homedir4 } from "os";
import path6 from "path";

// ../../packages/project-memory-core/src/codex-access.ts
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync
} from "fs";
import { homedir } from "os";
import path from "path";

// ../../packages/project-memory-core/src/errors.ts
var ProjectMemoryError = class extends Error {
  code;
  details;
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ProjectMemoryError";
    this.code = code;
    this.details = details;
  }
};
function normalizeError(error) {
  if (error instanceof ProjectMemoryError) {
    return { code: error.code, message: error.message, details: error.details };
  }
  const filesystemError = error;
  if ((filesystemError.code === "EACCES" || filesystemError.code === "EPERM") && typeof filesystemError.path === "string") {
    return {
      code: "MEMORY_HOME_NOT_ACCESSIBLE",
      message: "Talo data directory is not writable.",
      details: {
        path: filesystemError.path,
        cause: filesystemError.code,
        codexRepairCommand: "project-memory integration repair codex",
        codexEscalationLauncher: "~/.project-memory/bin/project-memory",
        sandboxEscalationRequired: true,
        restartRequired: false
      }
    };
  }
  return {
    code: "STORAGE_ERROR",
    message: error instanceof Error ? error.message : String(error),
    details: {}
  };
}

// ../../packages/project-memory-core/src/codex-access.ts
var ESCALATED_MEMORY_COMMANDS = [
  "detect",
  "recall",
  "get",
  "load",
  "search",
  "brief",
  "story",
  "guide",
  "relations",
  "path",
  "graph",
  "hub",
  "proposals",
  "propose",
  "commit",
  "reject",
  "home"
];
function codexConfigPath(options) {
  const env = { ...process.env, ...options.env };
  const codexHome = env.CODEX_HOME ? path.resolve(env.CODEX_HOME) : path.join(options.homeDir ?? homedir(), ".codex");
  return path.join(codexHome, "config.toml");
}
function managedAccessPaths(options) {
  const dataRoot = path.resolve(options.dataRoot);
  const codexHome = path.dirname(codexConfigPath(options));
  return {
    launcherPath: path.join(path.dirname(dataRoot), "bin", "project-memory"),
    rulesPath: path.join(codexHome, "rules", "project-memory.rules")
  };
}
function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}
function launcherContent(options) {
  const nodePath = path.resolve(options.nodePath ?? process.execPath);
  const cliPath = path.resolve(options.cliPath ?? process.argv[1] ?? "project-memory.mjs");
  const appNode = "/Applications/Talo.app/Contents/MacOS/project-memory-node";
  const appCli = "/Applications/Talo.app/Contents/Resources/resources/runtime/project-memory.mjs";
  const legacyAppNode = "/Applications/Project Memory.app/Contents/MacOS/project-memory-node";
  const legacyAppCli = "/Applications/Project Memory.app/Contents/Resources/resources/runtime/project-memory.mjs";
  return `#!/bin/sh
set -eu
if [ -x ${shellQuote(appNode)} ] && [ -f ${shellQuote(appCli)} ]; then
  exec ${shellQuote(appNode)} ${shellQuote(appCli)} "$@"
fi
if [ -x ${shellQuote(legacyAppNode)} ] && [ -f ${shellQuote(legacyAppCli)} ]; then
  exec ${shellQuote(legacyAppNode)} ${shellQuote(legacyAppCli)} "$@"
fi
exec ${shellQuote(nodePath)} ${shellQuote(cliPath)} "$@"
`;
}
function rulesContent(launcherPath) {
  const rules = ESCALATED_MEMORY_COMMANDS.map(
    (command) => `prefix_rule(pattern=[${JSON.stringify(launcherPath)}, ${JSON.stringify(command)}], decision="allow")`
  );
  return `# Managed by Talo. Destructive and integration commands remain approval-gated.
${rules.join("\n")}
`;
}
function writeManagedFile(filePath, content, mode) {
  if (existsSync(filePath) && readFileSync(filePath, "utf8") === content) return false;
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 448 });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, content, { encoding: "utf8", mode });
  if (process.platform !== "win32") chmodSync(temporaryPath, mode);
  renameSync(temporaryPath, filePath);
  if (process.platform !== "win32") chmodSync(filePath, mode);
  return true;
}
function managedFallbackConfigured(options) {
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  return existsSync(launcherPath) && readFileSync(launcherPath, "utf8") === launcherContent(options) && existsSync(rulesPath) && readFileSync(rulesPath, "utf8") === rulesContent(launcherPath);
}
function ensureManagedFallback(options) {
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  const launcherChanged = writeManagedFile(launcherPath, launcherContent(options), 448);
  const rulesChanged = writeManagedFile(rulesPath, rulesContent(launcherPath), 384);
  return launcherChanged || rulesChanged;
}
function skipSpaceAndComments(source, start) {
  let index = start;
  while (index < source.length) {
    if (/\s/.test(source[index] ?? "")) {
      index += 1;
      continue;
    }
    if (source[index] === "#") {
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }
    break;
  }
  return index;
}
function parseBasicString(source, start) {
  let index = start + 1;
  let escaped = false;
  while (index < source.length) {
    const character = source[index];
    if (!escaped && character === '"') {
      const raw = source.slice(start, index + 1);
      try {
        return { value: JSON.parse(raw), end: index + 1 };
      } catch {
        return null;
      }
    }
    if (!escaped && character === "\\") escaped = true;
    else escaped = false;
    index += 1;
  }
  return null;
}
function parseLiteralString(source, start) {
  const end = source.indexOf("'", start + 1);
  if (end === -1) return null;
  return { value: source.slice(start + 1, end), end: end + 1 };
}
function parseStringArray(source, arrayStart) {
  const values = [];
  let index = arrayStart + 1;
  while (index < source.length) {
    index = skipSpaceAndComments(source, index);
    if (source[index] === "]") return { values, arrayEnd: index + 1 };
    const parsed = source[index] === '"' ? parseBasicString(source, index) : source[index] === "'" ? parseLiteralString(source, index) : null;
    if (!parsed) return null;
    values.push(parsed.value);
    index = skipSpaceAndComments(source, parsed.end);
    if (source[index] === ",") {
      index += 1;
      continue;
    }
    if (source[index] === "]") return { values, arrayEnd: index + 1 };
    return null;
  }
  return null;
}
function assignmentFromMatch(source, match) {
  const equals = source.indexOf("=", match.index);
  const arrayStart = skipSpaceAndComments(source, equals + 1);
  if (source[arrayStart] !== "[") return null;
  const parsed = parseStringArray(source, arrayStart);
  if (!parsed) return null;
  return {
    arrayStart,
    arrayEnd: parsed.arrayEnd,
    values: parsed.values,
    indent: match[1] ?? "",
    newline: source.includes("\r\n") ? "\r\n" : "\n"
  };
}
function findWritableRootsAssignment(source) {
  const dotted = /^([ \t]*)sandbox_workspace_write\.writable_roots[ \t]*=/gm.exec(source);
  if (dotted) return assignmentFromMatch(source, dotted) ?? "conflict";
  const table = /^[ \t]*\[sandbox_workspace_write\][ \t]*(?:#.*)?$/gm.exec(source);
  if (!table) return null;
  const sectionStart = table.index + table[0].length;
  const nextTable = /^[ \t]*\[\[?[^\r\n]+$/gm;
  nextTable.lastIndex = sectionStart;
  const next = nextTable.exec(source);
  const sectionEnd = next?.index ?? source.length;
  const section2 = source.slice(sectionStart, sectionEnd);
  const key = /^([ \t]*)writable_roots[ \t]*=/gm.exec(section2);
  if (!key) return null;
  key.index += sectionStart;
  return assignmentFromMatch(source, key) ?? "conflict";
}
function renderArray(values, assignment) {
  if (!assignment.values.length || !assignment.values.some((value) => value.includes("\n"))) {
    const multiline = assignment.arrayEnd - assignment.arrayStart > 88 || values.length > 2;
    if (!multiline) return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
  }
  const itemIndent = `${assignment.indent}  `;
  return `[${assignment.newline}${values.map((value) => `${itemIndent}${JSON.stringify(value)},`).join(assignment.newline)}${assignment.newline}${assignment.indent}]`;
}
function addWritableRoot(source, dataRoot) {
  const assignment = findWritableRootsAssignment(source);
  if (assignment === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex writable_roots uses an unsupported TOML value.",
      { dataRoot }
    );
  }
  if (assignment) {
    if (assignment.values.some((value) => path.resolve(value) === dataRoot)) return source;
    const replacement = renderArray([...assignment.values, dataRoot], assignment);
    return `${source.slice(0, assignment.arrayStart)}${replacement}${source.slice(assignment.arrayEnd)}`;
  }
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const table = /^[ \t]*\[sandbox_workspace_write\][ \t]*(?:#.*)?$/gm.exec(source);
  if (table) {
    const headerEnd = table.index + table[0].length;
    const insertionPoint = source.startsWith(newline, headerEnd) ? headerEnd + newline.length : headerEnd;
    const prefix = insertionPoint === headerEnd ? newline : "";
    return `${source.slice(0, insertionPoint)}${prefix}writable_roots = [${JSON.stringify(dataRoot)}]${newline}${source.slice(insertionPoint)}`;
  }
  const suffix = source.length === 0 || source.endsWith(newline) ? "" : newline;
  const separator = source.trim().length === 0 ? "" : newline;
  return `${source}${suffix}${separator}[sandbox_workspace_write]${newline}writable_roots = [${JSON.stringify(dataRoot)}]${newline}`;
}
function inspectCodexMemoryAccess(options) {
  const configPath = codexConfigPath(options);
  const dataRoot = path.resolve(options.dataRoot);
  const { launcherPath, rulesPath } = managedAccessPaths(options);
  if (!existsSync(configPath)) {
    return { state: "missing", configPath, dataRoot, launcherPath, rulesPath, issue: null };
  }
  const source = readFileSync(configPath, "utf8");
  const assignment = findWritableRootsAssignment(source);
  if (assignment === "conflict") {
    return {
      state: "conflict",
      configPath,
      dataRoot,
      launcherPath,
      rulesPath,
      issue: "Codex writable_roots \u4E0D\u662F\u53EF\u5B89\u5168\u66F4\u65B0\u7684\u5B57\u7B26\u4E32\u6570\u7EC4\u3002"
    };
  }
  if (assignment?.values.some((value) => path.resolve(value) === dataRoot)) {
    if (managedFallbackConfigured(options)) {
      return { state: "configured", configPath, dataRoot, launcherPath, rulesPath, issue: null };
    }
    return {
      state: "missing",
      configPath,
      dataRoot,
      launcherPath,
      rulesPath,
      issue: "Codex \u6258\u7BA1\u6743\u9650\u6A21\u5F0F\u7684 Talo \u5347\u7EA7\u6267\u884C\u515C\u5E95\u5C1A\u672A\u5B89\u88C5\u3002"
    };
  }
  return { state: "missing", configPath, dataRoot, launcherPath, rulesPath, issue: null };
}
function ensureCodexMemoryAccess(options) {
  const inspected = inspectCodexMemoryAccess(options);
  if (inspected.state === "configured") {
    return { ...inspected, changed: false, backupPath: null, restartRequired: false };
  }
  if (inspected.state === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      inspected.issue ?? "Codex sandbox configuration cannot be updated safely.",
      { configPath: inspected.configPath, dataRoot: inspected.dataRoot }
    );
  }
  const source = existsSync(inspected.configPath) ? readFileSync(inspected.configPath, "utf8") : "";
  const updated = addWritableRoot(source, inspected.dataRoot);
  const configChanged = updated !== source;
  let backupPath = null;
  if (configChanged) {
    const directory = path.dirname(inspected.configPath);
    mkdirSync(directory, { recursive: true, mode: 448 });
    backupPath = `${inspected.configPath}.project-memory-backup`;
    if (source && !existsSync(backupPath)) {
      copyFileSync(inspected.configPath, backupPath);
      if (process.platform !== "win32") chmodSync(backupPath, 384);
    }
    const temporaryPath = `${inspected.configPath}.${process.pid}.tmp`;
    const existingMode = existsSync(inspected.configPath) ? statSync(inspected.configPath).mode & 511 : 384;
    writeFileSync(temporaryPath, updated, { encoding: "utf8", mode: existingMode });
    if (process.platform !== "win32") chmodSync(temporaryPath, existingMode);
    renameSync(temporaryPath, inspected.configPath);
  }
  const fallbackChanged = ensureManagedFallback(options);
  return {
    state: "configured",
    configPath: inspected.configPath,
    dataRoot: inspected.dataRoot,
    launcherPath: inspected.launcherPath,
    rulesPath: inspected.rulesPath,
    issue: null,
    changed: configChanged || fallbackChanged,
    backupPath: source ? backupPath : null,
    restartRequired: configChanged || fallbackChanged
  };
}

// ../../packages/project-memory-core/src/integration.ts
import {
  chmodSync as chmodSync3,
  cpSync as cpSync2,
  existsSync as existsSync4,
  lstatSync as lstatSync2,
  mkdirSync as mkdirSync3,
  readdirSync as readdirSync3,
  readFileSync as readFileSync4,
  realpathSync as realpathSync3,
  renameSync as renameSync3,
  rmSync as rmSync2,
  writeFileSync as writeFileSync3
} from "fs";
import { homedir as homedir3 } from "os";
import path5 from "path";

// ../../packages/project-memory-core/src/paths.ts
var import_picomatch = __toESM(require_picomatch2(), 1);
import {
  chmodSync as chmodSync2,
  cpSync,
  existsSync as existsSync2,
  mkdirSync as mkdirSync2,
  readdirSync,
  readFileSync as readFileSync2,
  renameSync as renameSync2,
  rmSync,
  writeFileSync as writeFileSync2
} from "fs";
import { homedir as homedir2 } from "os";
import path2 from "path";
function configRoot() {
  const windowsAppData = process.platform === "win32" ? process.env.APPDATA ?? process.env.LOCALAPPDATA : null;
  return process.env.PROJECT_MEMORY_CONFIG_HOME ? path2.resolve(process.env.PROJECT_MEMORY_CONFIG_HOME) : path2.join(windowsAppData ?? homedir2(), ".project-memory");
}
function resolveConfigRoot() {
  return configRoot();
}
function legacyRoot() {
  const codexHome = process.env.CODEX_HOME ? path2.resolve(process.env.CODEX_HOME) : path2.join(homedir2(), ".codex");
  return path2.join(codexHome, "project-memory", "v1");
}
function selectionFile() {
  return path2.join(configRoot(), "active-home.json");
}
function readSelectedHome() {
  const filePath = selectionFile();
  if (!existsSync2(filePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync2(filePath, "utf8"));
    return typeof parsed.activeHome === "string" && parsed.activeHome.trim() ? path2.resolve(parsed.activeHome) : null;
  } catch (error) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Talo home selection is invalid.", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}
function inspectDataHomes() {
  const neutralHome = path2.join(configRoot(), "v1");
  const legacyHome = legacyRoot();
  const neutralExists = existsSync2(neutralHome);
  const legacyExists = existsSync2(legacyHome);
  const projectEnv = process.env.PROJECT_MEMORY_HOME;
  const legacyEnv = process.env.CODEX_PROJECT_MEMORY_HOME;
  const selected = readSelectedHome();
  let activeHome = null;
  let selectionSource = null;
  if (projectEnv) {
    activeHome = path2.resolve(projectEnv);
    selectionSource = "project-env";
  } else if (legacyEnv) {
    activeHome = path2.resolve(legacyEnv);
    selectionSource = "legacy-env";
  } else if (selected) {
    activeHome = selected;
    selectionSource = "selection";
  } else if (neutralExists && legacyExists && neutralHome !== legacyHome) {
    return {
      activeHome: null,
      selectionSource: null,
      neutralHome,
      legacyHome,
      neutralExists,
      legacyExists,
      ambiguous: true,
      selectionPath: selectionFile()
    };
  } else if (neutralExists) {
    activeHome = neutralHome;
    selectionSource = "neutral";
  } else if (legacyExists) {
    activeHome = legacyHome;
    selectionSource = "legacy";
  } else {
    activeHome = neutralHome;
    selectionSource = "new";
  }
  return {
    activeHome,
    selectionSource,
    neutralHome,
    legacyHome,
    neutralExists,
    legacyExists,
    ambiguous: false,
    selectionPath: selectionFile()
  };
}
function resolveMemoryHubPath() {
  return path2.join(configRoot(), "MEMORY_HUB.html");
}
function resolveDataDir() {
  const inspection = inspectDataHomes();
  if (inspection.ambiguous || !inspection.activeHome) {
    throw new ProjectMemoryError(
      "AMBIGUOUS_MEMORY_HOME",
      "Both the shared and legacy Talo homes exist. Select one explicitly.",
      { ...inspection }
    );
  }
  return inspection.activeHome;
}
function selectDataDir(dataDir) {
  const selected = path2.resolve(dataDir);
  if (!existsSync2(selected)) {
    throw new ProjectMemoryError(
      "MEMORY_HOME_NOT_ACCESSIBLE",
      "The selected Talo home does not exist.",
      { path: selected }
    );
  }
  const root = configRoot();
  mkdirSync2(root, { recursive: true, mode: 448 });
  chmodSync2(root, 448);
  const target = selectionFile();
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync2(temporary, `${JSON.stringify({ activeHome: selected }, null, 2)}
`, {
    encoding: "utf8",
    mode: 384
  });
  chmodSync2(temporary, 384);
  renameSync2(temporary, target);
  chmodSync2(target, 384);
  return inspectDataHomes();
}
function countMarkdownMemories(filePath) {
  if (!existsSync2(filePath)) return 0;
  return [...readFileSync2(filePath, "utf8").matchAll(/^## \[[0-9a-f-]+\](?: .*)?$/gim)].length;
}
function inspectDataHomeCounts(dataDir) {
  const root = path2.resolve(dataDir);
  const registryPath = path2.join(root, "registry.json");
  const registry = existsSync2(registryPath) ? JSON.parse(readFileSync2(registryPath, "utf8")) : { projects: [] };
  const ids = (registry.projects ?? []).map((entry) => entry.id).filter((id) => typeof id === "string" && Boolean(id));
  const counts = {
    projects: ids.length,
    memories: 0,
    relations: 0,
    proposals: 0,
    auditEvents: 0
  };
  for (const projectId of ids) {
    const projectDir = path2.join(root, "projects", projectId);
    counts.memories += countMarkdownMemories(path2.join(projectDir, "MEMORY.md"));
    const relationsPath = path2.join(projectDir, "RELATIONS.json");
    if (existsSync2(relationsPath)) {
      const document = JSON.parse(readFileSync2(relationsPath, "utf8"));
      counts.relations += Array.isArray(document.relations) ? document.relations.length : 0;
    }
    const proposalsDir = path2.join(projectDir, "proposals");
    if (existsSync2(proposalsDir)) {
      counts.proposals += readdirSync(proposalsDir).filter((name) => name.endsWith(".json")).length;
    }
    const auditPath = path2.join(projectDir, "audit.jsonl");
    if (existsSync2(auditPath)) {
      counts.auditEvents += readFileSync2(auditPath, "utf8").split(/\r?\n/).filter((line) => line.trim()).length;
    }
  }
  return counts;
}
function hardenTree(root) {
  chmodSync2(root, 448);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const target = path2.join(root, entry.name);
    if (entry.isDirectory()) hardenTree(target);
    else if (entry.isFile()) chmodSync2(target, 384);
  }
}
function migrateDataDir(sourceDir, targetDir) {
  const source = path2.resolve(sourceDir);
  const target = path2.resolve(targetDir);
  if (source === target) {
    throw new ProjectMemoryError("INVALID_INPUT", "Source and target homes must be different.", {
      source,
      target
    });
  }
  if (!existsSync2(source)) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Source Talo home does not exist.", {
      source
    });
  }
  if (existsSync2(target) && readdirSync(target).length > 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Target Talo home is not empty.", {
      target
    });
  }
  const parent = path2.dirname(target);
  mkdirSync2(parent, { recursive: true, mode: 448 });
  const suffix = (/* @__PURE__ */ new Date()).toISOString().replaceAll(/[:.]/g, "-");
  const backup = `${source}.backup-${suffix}`;
  const staging = `${target}.migrating-${process.pid}`;
  const sourceCounts = inspectDataHomeCounts(source);
  try {
    cpSync(source, backup, { recursive: true, errorOnExist: true, force: false });
    hardenTree(backup);
    cpSync(source, staging, { recursive: true, errorOnExist: true, force: false });
    hardenTree(staging);
    const stagedCounts = inspectDataHomeCounts(staging);
    if (JSON.stringify(sourceCounts) !== JSON.stringify(stagedCounts)) {
      throw new ProjectMemoryError(
        "STORAGE_ERROR",
        "Migrated Talo counts do not match the source.",
        { sourceCounts, stagedCounts }
      );
    }
    if (existsSync2(target)) rmSync(target, { recursive: true, force: true });
    renameSync2(staging, target);
    const targetCounts = inspectDataHomeCounts(target);
    selectDataDir(target);
    return {
      source,
      target,
      backup,
      preservedSource: true,
      selected: true,
      counts: targetCounts
    };
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}
function ensureDataDir(dataDir = resolveDataDir()) {
  mkdirSync2(dataDir, { recursive: true, mode: 448 });
  return dataDir;
}
function loadLocalConfig(dataDir) {
  const configPath = path2.join(dataDir, "config.json");
  if (!existsSync2(configPath)) {
    return { denyPatterns: [] };
  }
  const raw = JSON.parse(readFileSync2(configPath, "utf8"));
  return {
    denyPatterns: Array.isArray(raw.denyPatterns) ? raw.denyPatterns.filter((value) => typeof value === "string") : []
  };
}
function matchesCustomDeny(relativePath, patterns) {
  return patterns.some((pattern) => import_picomatch.default.isMatch(relativePath, pattern, { dot: true }));
}

// ../../packages/project-memory-core/src/security.ts
var import_ignore = __toESM(require_ignore(), 1);
import { createHash } from "crypto";
import { existsSync as existsSync3, lstatSync, readdirSync as readdirSync2, readFileSync as readFileSync3, realpathSync as realpathSync2, statSync as statSync3 } from "fs";
import path4 from "path";

// ../../packages/project-memory-core/src/git.ts
import { execFileSync } from "child_process";
import { realpathSync, statSync as statSync2 } from "fs";
import path3 from "path";
function git(pathValue, args) {
  try {
    return execFileSync("git", ["-C", pathValue, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return null;
  }
}
function detectGitMetadata(inputPath) {
  const realInput = realpathSync(path3.resolve(inputPath));
  const directory = statSync2(realInput).isDirectory() ? realInput : path3.dirname(realInput);
  const root = git(directory, ["rev-parse", "--show-toplevel"]);
  if (!root) {
    return {
      rootPath: directory,
      isGit: false,
      gitCommonDir: null,
      remoteUrl: null,
      headCommit: null
    };
  }
  const rootPath = realpathSync(root);
  const commonDirRaw = git(rootPath, ["rev-parse", "--git-common-dir"]);
  const gitCommonDir = commonDirRaw ? realpathSync(path3.resolve(rootPath, commonDirRaw)) : null;
  return {
    rootPath,
    isGit: true,
    gitCommonDir,
    remoteUrl: git(rootPath, ["remote", "get-url", "origin"]),
    headCommit: git(rootPath, ["rev-parse", "HEAD"])
  };
}
function listGitFiles(rootPath) {
  try {
    const output = execFileSync(
      "git",
      ["-C", rootPath, "ls-files", "-co", "--exclude-standard", "-z"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 20 * 1024 * 1024 }
    );
    return output.split("\0").filter(Boolean);
  } catch {
    return null;
  }
}

// ../../packages/project-memory-core/src/security.ts
var MAX_FILE_BYTES = 1024 * 1024;
var MAX_SEARCH_RESULTS = 50;
var MAX_SEARCH_FILES = 1e4;
var MAX_EXCERPT_CHARS = 400;
var DENIED_SEGMENTS = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "target",
  ".next",
  ".turbo",
  "coverage"
]);
var DENIED_BASENAMES = /* @__PURE__ */ new Set([
  "id_rsa",
  "id_ed25519",
  "credentials",
  "credentials.json",
  "service-account.json"
]);
var DENIED_EXTENSIONS = /* @__PURE__ */ new Set([".pem", ".key", ".p12", ".pfx", ".jks", ".keystore"]);
var SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/i
];
function normalizeRelative(relativePath) {
  if (!relativePath || path4.isAbsolute(relativePath)) {
    throw new ProjectMemoryError("PATH_DENIED", "Path must be relative to the project root.", {
      path: relativePath
    });
  }
  const normalized = relativePath.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.includes("..")) {
    throw new ProjectMemoryError("PATH_DENIED", "Parent path traversal is not allowed.", {
      path: relativePath
    });
  }
  return parts.join("/");
}
function isDeniedPath(relativePath, customPatterns = []) {
  const normalized = relativePath.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  const basename2 = parts.at(-1)?.toLowerCase() ?? "";
  const extension = path4.extname(basename2);
  return parts.some((part) => DENIED_SEGMENTS.has(part)) || /^\.env(?:\.|$)/i.test(basename2) || DENIED_BASENAMES.has(basename2) || DENIED_EXTENSIONS.has(extension) || matchesCustomDeny(normalized, customPatterns);
}
function containsSecret(text2) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(text2));
}
function assertNoSecret(text2, field) {
  if (containsSecret(text2)) {
    throw new ProjectMemoryError("SECRET_DETECTED", `Potential secret detected in ${field}.`, {
      field
    });
  }
}
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}
function ensureInsideRoot(rootPath, candidatePath) {
  const relative = path4.relative(rootPath, candidatePath);
  if (relative === "" || !relative.startsWith("..") && !path4.isAbsolute(relative)) {
    return;
  }
  throw new ProjectMemoryError("PATH_DENIED", "Resolved path escapes the project root.", {
    path: candidatePath
  });
}
function resolveReadableFile(rootPath, relativePath, customPatterns = []) {
  const normalized = normalizeRelative(relativePath);
  if (isDeniedPath(normalized, customPatterns)) {
    throw new ProjectMemoryError("PATH_DENIED", "Path is blocked by the project memory policy.", {
      path: normalized
    });
  }
  const realRoot = realpathSync2(rootPath);
  const candidate = path4.resolve(realRoot, normalized);
  if (!existsSync3(candidate)) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "File does not exist.", { path: normalized });
  }
  const realCandidate = realpathSync2(candidate);
  ensureInsideRoot(realRoot, realCandidate);
  if (!statSync3(realCandidate).isFile()) {
    throw new ProjectMemoryError("PATH_DENIED", "Path is not a regular file.", {
      path: normalized
    });
  }
  return { absolutePath: realCandidate, relativePath: normalized };
}
function isBinary(data) {
  const sample = data.subarray(0, Math.min(data.length, 8192));
  return sample.includes(0);
}
function readProjectFile(rootPath, relativePath, commit, customPatterns = []) {
  const resolved = resolveReadableFile(rootPath, relativePath, customPatterns);
  const size = statSync3(resolved.absolutePath).size;
  if (size > MAX_FILE_BYTES) {
    throw new ProjectMemoryError("FILE_TOO_LARGE", "File exceeds the 1 MiB read limit.", {
      path: resolved.relativePath,
      size,
      limit: MAX_FILE_BYTES
    });
  }
  const buffer = readFileSync3(resolved.absolutePath);
  if (isBinary(buffer)) {
    throw new ProjectMemoryError("BINARY_FILE", "Binary files cannot be read.", {
      path: resolved.relativePath
    });
  }
  return {
    path: resolved.relativePath,
    content: buffer.toString("utf8"),
    truncated: false,
    size,
    commit,
    fileHash: sha256(buffer)
  };
}
function walkNonGitFiles(rootPath) {
  const matcher = (0, import_ignore.default)();
  const gitignore = path4.join(rootPath, ".gitignore");
  if (existsSync3(gitignore)) {
    matcher.add(readFileSync3(gitignore, "utf8"));
  }
  const output = [];
  const queue = [""];
  while (queue.length > 0 && output.length < MAX_SEARCH_FILES) {
    const relativeDir = queue.shift() ?? "";
    const absoluteDir = path4.join(rootPath, relativeDir);
    for (const entry of readdirSync2(absoluteDir, { withFileTypes: true })) {
      const relative = path4.posix.join(relativeDir.replaceAll("\\", "/"), entry.name);
      if (matcher.ignores(relative) || isDeniedPath(relative)) {
        continue;
      }
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory()) {
        queue.push(relative);
      } else if (entry.isFile()) {
        output.push(relative);
      }
      if (output.length >= MAX_SEARCH_FILES) {
        break;
      }
    }
  }
  return output;
}
function listSearchableFiles(rootPath, customPatterns = []) {
  const gitFiles = listGitFiles(rootPath);
  const files = gitFiles ?? walkNonGitFiles(rootPath);
  return files.filter((relativePath) => !isDeniedPath(relativePath, customPatterns)).slice(0, MAX_SEARCH_FILES);
}
function excerpt(line, matchIndex, queryLength) {
  const half = Math.floor((MAX_EXCERPT_CHARS - queryLength) / 2);
  const start = Math.max(0, matchIndex - half);
  const end = Math.min(line.length, matchIndex + queryLength + half);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < line.length ? "..." : "";
  return `${prefix}${line.slice(start, end)}${suffix}`;
}
function searchProjectFiles(rootPath, query, commit, customPatterns = []) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) {
    throw new ProjectMemoryError("INVALID_INPUT", "Search query cannot be empty.");
  }
  const results = [];
  for (const relativePath of listSearchableFiles(rootPath, customPatterns)) {
    if (results.length >= MAX_SEARCH_RESULTS) {
      break;
    }
    let resolved;
    try {
      resolved = resolveReadableFile(rootPath, relativePath, customPatterns);
    } catch {
      continue;
    }
    const stats = lstatSync(resolved.absolutePath);
    if (stats.size > MAX_FILE_BYTES) {
      continue;
    }
    const buffer = readFileSync3(resolved.absolutePath);
    if (isBinary(buffer)) {
      continue;
    }
    const text2 = buffer.toString("utf8");
    const lines = text2.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index] ?? "";
      const matchIndex = line.toLocaleLowerCase().indexOf(needle);
      if (matchIndex === -1) {
        continue;
      }
      results.push({
        path: resolved.relativePath,
        line: index + 1,
        excerpt: excerpt(line, matchIndex, needle.length),
        commit,
        fileHash: sha256(buffer)
      });
      if (results.length >= MAX_SEARCH_RESULTS) {
        break;
      }
    }
  }
  return results;
}

// ../../packages/project-memory-core/src/integration.ts
var INTEGRATION_VERSION = "0.14.1";
var INTEGRATION_SCHEMA_VERSION = 1;
var RULE_START = "<!-- project-memory:start -->";
var RULE_END = "<!-- project-memory:end -->";
var ANTIGRAVITY_RULE = `${RULE_START}
Before substantial work in a local workspace, use the global Talo Skill to detect the current project. If the project is registered, recall only task-relevant reviewed memories and deep-read only the recommended memory IDs. If the project is not registered and the user did not explicitly ask about Talo, continue silently without registering or relinking it. Propose durable updates with actor.platform set to antigravity and resolve them through the shared review workflow. Never parse or edit Talo storage files directly.
${RULE_END}`;
function integrationPaths(options = {}) {
  const antigravityHome = path5.resolve(
    options.antigravityHome ?? process.env.PROJECT_MEMORY_ANTIGRAVITY_HOME ?? path5.join(homedir3(), ".gemini")
  );
  const configHome = path5.resolve(options.configHome ?? resolveConfigRoot());
  return {
    antigravityHome,
    configHome,
    skillPath: path5.join(antigravityHome, "config", "skills", "project-memory"),
    rulePath: path5.join(antigravityHome, "GEMINI.md"),
    manifestPath: path5.join(configHome, "integrations", "antigravity.json")
  };
}
function firstExisting(candidates, label) {
  const match = candidates.filter((candidate) => Boolean(candidate)).find(existsSync4);
  if (!match) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} is not available for installation.`, {
      candidates: candidates.filter(Boolean)
    });
  }
  return realpathSync3(match);
}
function integrationSources(options = {}) {
  const cliPath = firstExisting(
    [options.sourceCliPath, process.env.PROJECT_MEMORY_CLI_SOURCE, process.argv[1]],
    "Talo CLI"
  );
  const cliDir = path5.dirname(cliPath);
  const skillDir = firstExisting(
    [
      options.sourceSkillDir,
      process.env.PROJECT_MEMORY_SKILL_SOURCE,
      path5.resolve(cliDir, "skills/project-memory"),
      path5.resolve(cliDir, "../skills/project-memory"),
      path5.resolve(cliDir, "../project-memory"),
      path5.resolve(cliDir, "../../../skills/project-memory")
    ],
    "Talo Skill source"
  );
  const browserDir = firstExisting(
    [
      options.sourceBrowserDir,
      process.env.PROJECT_MEMORY_BROWSER_SOURCE,
      path5.resolve(cliDir, "browser"),
      path5.resolve(cliDir, "../dist/browser"),
      path5.resolve(cliDir, "../../../packages/project-memory-core/dist/browser")
    ],
    "Talo browser assets"
  );
  return { skillDir, cliPath, browserDir };
}
function claudeIntegrationPaths(options = {}) {
  const claudeHome = path5.resolve(
    options.claudeHome ?? process.env.CLAUDE_HOME ?? path5.join(homedir3(), ".claude")
  );
  const configHome = path5.resolve(options.configHome ?? resolveConfigRoot());
  return {
    skillPath: path5.join(claudeHome, "skills", "project-memory"),
    manifestPath: path5.join(configHome, "integrations", "claude.json")
  };
}
function claudeIntegrationSources(options = {}) {
  return integrationSources(options);
}
function writeAtomic(filePath, content, mode = 384) {
  mkdirSync3(path5.dirname(filePath), { recursive: true, mode: 448 });
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync3(temporary, content, { encoding: "utf8", mode });
  if (process.platform !== "win32") chmodSync3(temporary, mode);
  renameSync3(temporary, filePath);
  if (process.platform !== "win32") chmodSync3(filePath, mode);
}
function readManifest(manifestPath) {
  if (!existsSync4(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync4(manifestPath, "utf8"));
    if (manifest.schemaVersion !== INTEGRATION_SCHEMA_VERSION || manifest.platform !== "antigravity" || typeof manifest.version !== "string" || typeof manifest.skillPath !== "string" || typeof manifest.rulePath !== "string" || !manifest.files || typeof manifest.files !== "object" || typeof manifest.ruleHash !== "string") {
      throw new Error("invalid manifest shape");
    }
    return manifest;
  } catch (error) {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration manifest is invalid.",
      {
        path: manifestPath,
        cause: error instanceof Error ? error.message : String(error)
      }
    );
  }
}
function readClaudeManifest(manifestPath) {
  if (!existsSync4(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync4(manifestPath, "utf8"));
    if (manifest.schemaVersion !== INTEGRATION_SCHEMA_VERSION || manifest.platform !== "claude" || !manifest.version || !manifest.skillPath || !manifest.files) {
      return null;
    }
    return manifest;
  } catch {
    return null;
  }
}
function locateManagedBlock(content) {
  const start = content.indexOf(RULE_START);
  const endMarker = content.indexOf(RULE_END);
  if (start === -1 && endMarker === -1) return null;
  if (start === -1 || endMarker === -1 || endMarker < start) {
    throw new ProjectMemoryError("INTEGRATION_CONFLICT", "Talo rule markers are incomplete.");
  }
  const end = endMarker + RULE_END.length;
  if (content.indexOf(RULE_START, start + RULE_START.length) !== -1 || content.indexOf(RULE_END, end) !== -1) {
    throw new ProjectMemoryError("INTEGRATION_CONFLICT", "Multiple Talo rule blocks were found.");
  }
  return { start, end, block: content.slice(start, end) };
}
function upsertManagedBlock(content) {
  const located = locateManagedBlock(content);
  if (located) {
    return `${content.slice(0, located.start)}${ANTIGRAVITY_RULE}${content.slice(located.end)}`;
  }
  const prefix = content.trimEnd();
  return prefix ? `${prefix}

${ANTIGRAVITY_RULE}
` : `${ANTIGRAVITY_RULE}
`;
}
function removeManagedBlock(content) {
  const located = locateManagedBlock(content);
  if (!located) return content;
  const before = content.slice(0, located.start);
  const after = content.slice(located.end);
  if (!before.trim() && !after.trim()) return "";
  if (!after.trim()) return `${before.trimEnd()}
`;
  if (!before.trim()) return after.trimStart();
  return `${before.trimEnd()}
${after.trimStart()}`;
}
function walkFiles(root, current = "") {
  const directory = path5.join(root, current);
  const files = [];
  for (const entry of readdirSync3(directory, { withFileTypes: true })) {
    const relative = path5.join(current, entry.name);
    const absolute = path5.join(root, relative);
    if (entry.isSymbolicLink()) {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Managed Skill files cannot be symbolic links.",
        {
          path: absolute
        }
      );
    }
    if (entry.isDirectory()) files.push(...walkFiles(root, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}
function hashFiles(root) {
  return Object.fromEntries(
    walkFiles(root).map((relative) => [
      relative.replaceAll("\\", "/"),
      sha256(readFileSync4(path5.join(root, relative)))
    ])
  );
}
function compareManagedFiles(skillPath, files) {
  const issues = [];
  if (!existsSync4(skillPath)) return ["managed Skill directory is missing"];
  for (const [relative, expectedHash] of Object.entries(files)) {
    const target = path5.join(skillPath, relative);
    if (!existsSync4(target)) issues.push(`managed file is missing: ${relative}`);
    else if (lstatSync2(target).isSymbolicLink())
      issues.push(`managed file became a symbolic link: ${relative}`);
    else if (!lstatSync2(target).isFile()) issues.push(`managed path is not a file: ${relative}`);
    else if (sha256(readFileSync4(target)) !== expectedHash)
      issues.push(`managed file changed: ${relative}`);
  }
  if (issues.length === 0) {
    const actualFiles = Object.keys(hashFiles(skillPath));
    const unexpected = actualFiles.filter((relative) => !(relative in files));
    for (const relative of unexpected)
      issues.push(`unmanaged file exists in Skill directory: ${relative}`);
  }
  return issues;
}
function inspectRule(rulePath, expectedHash) {
  if (!existsSync4(rulePath)) return ["managed Antigravity rule is missing"];
  const located = locateManagedBlock(readFileSync4(rulePath, "utf8"));
  if (!located) return ["managed Antigravity rule is missing"];
  if (expectedHash && sha256(located.block) !== expectedHash) {
    return ["managed Antigravity rule changed"];
  }
  return [];
}
function prepareSkill(target, sources) {
  cpSync2(sources.skillDir, target, { recursive: true, errorOnExist: true });
  const binDir = path5.join(target, "bin");
  rmSync2(binDir, { recursive: true, force: true });
  mkdirSync3(path5.join(binDir, "browser"), { recursive: true, mode: 448 });
  cpSync2(sources.cliPath, path5.join(binDir, "project-memory.mjs"));
  cpSync2(
    path5.join(sources.browserDir, "graph-app.js"),
    path5.join(binDir, "browser", "graph-app.js")
  );
  cpSync2(
    path5.join(sources.browserDir, "graph-app.css"),
    path5.join(binDir, "browser", "graph-app.css")
  );
  if (process.platform !== "win32") {
    chmodSync3(path5.join(target, "scripts", "project-memory.mjs"), 493);
    chmodSync3(path5.join(binDir, "project-memory.mjs"), 493);
  }
  return hashFiles(target);
}
function antigravityIntegrationStatus(options = {}) {
  const paths = integrationPaths(options);
  const currentVersion = options.version ?? INTEGRATION_VERSION;
  const manifest = readManifest(paths.manifestPath);
  if (!manifest) {
    const issues2 = [];
    if (existsSync4(paths.skillPath)) issues2.push("an unmanaged Talo Skill already exists");
    if (existsSync4(paths.rulePath)) {
      const located = locateManagedBlock(readFileSync4(paths.rulePath, "utf8"));
      if (located) issues2.push("an unmanaged Talo rule block already exists");
    }
    return {
      platform: "antigravity",
      state: issues2.length > 0 ? "conflict" : "absent",
      version: null,
      currentVersion,
      skillPath: paths.skillPath,
      rulePath: paths.rulePath,
      manifestPath: paths.manifestPath,
      issues: issues2
    };
  }
  const issues = [
    ...path5.resolve(manifest.skillPath) === paths.skillPath ? [] : ["manifest Skill path does not match"],
    ...path5.resolve(manifest.rulePath) === paths.rulePath ? [] : ["manifest rule path does not match"],
    ...compareManagedFiles(paths.skillPath, manifest.files),
    ...inspectRule(paths.rulePath, manifest.ruleHash)
  ];
  return {
    platform: "antigravity",
    state: issues.length > 0 ? issues.some(
      (issue) => issue.includes("changed") || issue.includes("unmanaged") || issue.includes("does not match")
    ) ? "conflict" : "partial" : manifest.version === currentVersion ? "installed" : "outdated",
    version: manifest.version,
    currentVersion,
    skillPath: paths.skillPath,
    rulePath: paths.rulePath,
    manifestPath: paths.manifestPath,
    issues
  };
}
function installAntigravityIntegration(options = {}) {
  const paths = integrationPaths(options);
  const sources = integrationSources(options);
  const version = options.version ?? INTEGRATION_VERSION;
  const existingManifest = readManifest(paths.manifestPath);
  const status = antigravityIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration cannot be updated safely.",
      {
        ...status
      }
    );
  }
  mkdirSync3(path5.dirname(paths.skillPath), { recursive: true, mode: 448 });
  const temporarySkill = `${paths.skillPath}.${process.pid}.${Date.now()}.tmp`;
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  rmSync2(temporarySkill, { recursive: true, force: true });
  let desiredFiles;
  try {
    desiredFiles = prepareSkill(temporarySkill, sources);
  } catch (error) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    throw error;
  }
  const previousRule = existsSync4(paths.rulePath) ? readFileSync4(paths.rulePath, "utf8") : null;
  const previousManifest = existsSync4(paths.manifestPath) ? readFileSync4(paths.manifestPath, "utf8") : null;
  const nextRule = upsertManagedBlock(previousRule ?? "");
  const desiredRuleHash = sha256(ANTIGRAVITY_RULE);
  if (existingManifest && existingManifest.version === version && JSON.stringify(existingManifest.files) === JSON.stringify(desiredFiles) && existingManifest.ruleHash === desiredRuleHash && previousRule === nextRule) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    return { ...status, changed: false, action: "unchanged", restartRequired: false };
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const manifest = {
    schemaVersion: INTEGRATION_SCHEMA_VERSION,
    platform: "antigravity",
    version,
    installedAt: existingManifest?.installedAt ?? timestamp,
    updatedAt: timestamp,
    skillPath: paths.skillPath,
    rulePath: paths.rulePath,
    files: desiredFiles,
    ruleHash: desiredRuleHash
  };
  let movedExistingSkill = false;
  try {
    if (existsSync4(paths.skillPath)) {
      renameSync3(paths.skillPath, backupSkill);
      movedExistingSkill = true;
    }
    renameSync3(temporarySkill, paths.skillPath);
    writeAtomic(paths.rulePath, nextRule);
    writeAtomic(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}
`);
    rmSync2(backupSkill, { recursive: true, force: true });
  } catch (error) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    rmSync2(paths.skillPath, { recursive: true, force: true });
    if (movedExistingSkill && existsSync4(backupSkill)) renameSync3(backupSkill, paths.skillPath);
    if (previousRule === null) rmSync2(paths.rulePath, { force: true });
    else writeAtomic(paths.rulePath, previousRule);
    if (previousManifest === null) rmSync2(paths.manifestPath, { force: true });
    else writeAtomic(paths.manifestPath, previousManifest);
    throw error;
  }
  return {
    ...antigravityIntegrationStatus(options),
    changed: true,
    action: existingManifest ? "updated" : "installed",
    restartRequired: true
  };
}
function removeAntigravityIntegration(options = {}) {
  const paths = integrationPaths(options);
  const manifest = readManifest(paths.manifestPath);
  if (!manifest) {
    const status2 = antigravityIntegrationStatus(options);
    if (status2.state === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Unmanaged Antigravity integration files cannot be removed.",
        {
          ...status2
        }
      );
    }
    return { ...status2, changed: false, action: "absent", restartRequired: false };
  }
  const status = antigravityIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Antigravity integration was modified and cannot be removed safely.",
      {
        ...status
      }
    );
  }
  const ruleContent = readFileSync4(paths.rulePath, "utf8");
  const manifestContent = readFileSync4(paths.manifestPath, "utf8");
  const nextRule = removeManagedBlock(ruleContent);
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  renameSync3(paths.skillPath, backupSkill);
  try {
    if (nextRule) writeAtomic(paths.rulePath, nextRule);
    else rmSync2(paths.rulePath, { force: true });
    rmSync2(paths.manifestPath, { force: true });
  } catch (error) {
    writeAtomic(paths.rulePath, ruleContent);
    writeAtomic(paths.manifestPath, manifestContent);
    if (existsSync4(backupSkill)) renameSync3(backupSkill, paths.skillPath);
    throw error;
  }
  rmSync2(backupSkill, { recursive: true, force: true });
  return {
    ...antigravityIntegrationStatus(options),
    changed: true,
    action: "removed",
    restartRequired: true
  };
}
function claudeIntegrationStatus(options = {}) {
  const paths = claudeIntegrationPaths(options);
  const currentVersion = options.version ?? INTEGRATION_VERSION;
  const manifest = readClaudeManifest(paths.manifestPath);
  if (!manifest) {
    const issues2 = existsSync4(paths.skillPath) ? ["an unmanaged Talo Skill already exists"] : [];
    return {
      platform: "claude",
      state: issues2.length > 0 ? "conflict" : "absent",
      version: null,
      currentVersion,
      skillPath: paths.skillPath,
      manifestPath: paths.manifestPath,
      issues: issues2
    };
  }
  const issues = [
    ...path5.resolve(manifest.skillPath) === paths.skillPath ? [] : ["manifest Skill path does not match"],
    ...compareManagedFiles(paths.skillPath, manifest.files)
  ];
  return {
    platform: "claude",
    state: issues.length > 0 ? issues.some(
      (issue) => issue.includes("changed") || issue.includes("unmanaged") || issue.includes("does not match")
    ) ? "conflict" : "partial" : manifest.version === currentVersion ? "installed" : "outdated",
    version: manifest.version,
    currentVersion,
    skillPath: paths.skillPath,
    manifestPath: paths.manifestPath,
    issues
  };
}
function installClaudeIntegration(options = {}) {
  const paths = claudeIntegrationPaths(options);
  const sources = claudeIntegrationSources(options);
  const version = options.version ?? INTEGRATION_VERSION;
  const existingManifest = readClaudeManifest(paths.manifestPath);
  const status = claudeIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Claude Code integration cannot be updated safely.",
      { ...status }
    );
  }
  mkdirSync3(path5.dirname(paths.skillPath), { recursive: true, mode: 448 });
  const temporarySkill = `${paths.skillPath}.${process.pid}.${Date.now()}.tmp`;
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  rmSync2(temporarySkill, { recursive: true, force: true });
  let desiredFiles;
  try {
    desiredFiles = prepareSkill(temporarySkill, sources);
  } catch (error) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    throw error;
  }
  if (existingManifest && existingManifest.version === version && JSON.stringify(existingManifest.files) === JSON.stringify(desiredFiles)) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    return { ...status, changed: false, action: "unchanged", restartRequired: false };
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const manifest = {
    schemaVersion: INTEGRATION_SCHEMA_VERSION,
    platform: "claude",
    version,
    installedAt: existingManifest?.installedAt ?? timestamp,
    updatedAt: timestamp,
    skillPath: paths.skillPath,
    files: desiredFiles
  };
  const previousManifest = existsSync4(paths.manifestPath) ? readFileSync4(paths.manifestPath, "utf8") : null;
  let movedExistingSkill = false;
  try {
    if (existsSync4(paths.skillPath)) {
      renameSync3(paths.skillPath, backupSkill);
      movedExistingSkill = true;
    }
    renameSync3(temporarySkill, paths.skillPath);
    writeAtomic(paths.manifestPath, `${JSON.stringify(manifest, null, 2)}
`);
    rmSync2(backupSkill, { recursive: true, force: true });
  } catch (error) {
    rmSync2(temporarySkill, { recursive: true, force: true });
    rmSync2(paths.skillPath, { recursive: true, force: true });
    if (movedExistingSkill && existsSync4(backupSkill)) renameSync3(backupSkill, paths.skillPath);
    if (previousManifest === null) rmSync2(paths.manifestPath, { force: true });
    else writeAtomic(paths.manifestPath, previousManifest);
    throw error;
  }
  return {
    ...claudeIntegrationStatus(options),
    changed: true,
    action: existingManifest ? "updated" : "installed",
    restartRequired: true
  };
}
function removeClaudeIntegration(options = {}) {
  const paths = claudeIntegrationPaths(options);
  const manifest = readClaudeManifest(paths.manifestPath);
  if (!manifest) {
    const status2 = claudeIntegrationStatus(options);
    if (status2.state === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Unmanaged Claude Code integration files cannot be removed.",
        { ...status2 }
      );
    }
    return { ...status2, changed: false, action: "absent", restartRequired: false };
  }
  const status = claudeIntegrationStatus(options);
  if (status.state === "conflict" || status.state === "partial") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Claude Code integration was modified and cannot be removed safely.",
      { ...status }
    );
  }
  const manifestContent = readFileSync4(paths.manifestPath, "utf8");
  const backupSkill = `${paths.skillPath}.${process.pid}.${Date.now()}.bak`;
  renameSync3(paths.skillPath, backupSkill);
  try {
    rmSync2(paths.manifestPath, { force: true });
  } catch (error) {
    writeAtomic(paths.manifestPath, manifestContent);
    if (existsSync4(backupSkill)) renameSync3(backupSkill, paths.skillPath);
    throw error;
  }
  rmSync2(backupSkill, { recursive: true, force: true });
  return {
    ...claudeIntegrationStatus(options),
    changed: true,
    action: "removed",
    restartRequired: true
  };
}

// ../../packages/project-memory-core/src/desktop-integration.ts
var DESKTOP_MARKETPLACE = "project-memory-desktop";
var PLUGIN_NAME = "codex-project-memory";
var DEFAULT_VERSION = "0.14.1";
function integrationDataRoot(options) {
  if (options.dataRoot) return path6.resolve(options.dataRoot);
  if (options.homeDir) {
    const env = { ...process.env, ...options.env };
    const windowsAppData = options.platform === "win32" ? env.APPDATA ?? env.LOCALAPPDATA ?? path6.join(path6.resolve(options.homeDir), "AppData", "Roaming") : null;
    return path6.join(windowsAppData ?? path6.resolve(options.homeDir), ".project-memory", "v1");
  }
  return resolveDataDir();
}
function runCommand(command, args, env, runner) {
  if (runner) return runner(command, args, env);
  const requiresShell = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env,
    shell: requiresShell,
    timeout: 3e4,
    windowsHide: true
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? result.error?.message ?? ""
  };
}
function executableOnPath(name, env, platform) {
  const pathValue = env.PATH ?? env.Path ?? env.path ?? "";
  const delimiter = platform === "win32" ? ";" : path6.delimiter;
  const extensions = platform === "win32" ? (env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";").filter(Boolean) : [""];
  for (const directory of pathValue.split(delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path6.join(directory, platform === "win32" ? `${name}${extension}` : name);
      if (existsSync5(candidate)) return path6.resolve(candidate);
      if (platform === "win32") {
        try {
          const expectedName = path6.basename(candidate).toLocaleLowerCase();
          const matchedName = readdirSync4(directory).find(
            (entry) => entry.toLocaleLowerCase() === expectedName
          );
          if (matchedName) return path6.resolve(directory, matchedName);
        } catch {
        }
      }
    }
  }
  return null;
}
function firstExisting2(candidates) {
  const match = candidates.find(
    (candidate) => Boolean(candidate && existsSync5(candidate))
  );
  return match ? path6.resolve(match) : null;
}
function compatibleIntegrationVersion(installedVersion, currentVersion) {
  if (!installedVersion) return false;
  return installedVersion.split("+", 1)[0] === currentVersion.split("+", 1)[0];
}
function codexCandidates(platform, homeDir, env) {
  if (platform === "darwin") {
    return [
      "/Applications/ChatGPT.app/Contents/Resources/codex",
      "/Applications/Codex.app/Contents/Resources/codex",
      path6.join(homeDir, "Applications/ChatGPT.app/Contents/Resources/codex"),
      path6.join(homeDir, "Applications/Codex.app/Contents/Resources/codex")
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path6.join(homeDir, "AppData", "Local");
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value) => Boolean(value)
    );
    return [
      path6.join(local, "Programs", "Codex", "codex.exe"),
      path6.join(local, "Programs", "ChatGPT", "resources", "codex.exe"),
      ...programFiles.flatMap((root) => [
        path6.join(root, "Codex", "codex.exe"),
        path6.join(root, "ChatGPT", "resources", "codex.exe")
      ])
    ];
  }
  return [];
}
function antigravityCandidates(platform, homeDir, env) {
  if (platform === "darwin") {
    return [
      "/Applications/Antigravity.app/Contents/MacOS/Antigravity",
      path6.join(homeDir, "Applications/Antigravity.app/Contents/MacOS/Antigravity")
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path6.join(homeDir, "AppData", "Local");
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value) => Boolean(value)
    );
    return [
      path6.join(local, "Programs", "Antigravity", "Antigravity.exe"),
      ...programFiles.map((root) => path6.join(root, "Antigravity", "Antigravity.exe"))
    ];
  }
  return [];
}
function claudeCandidates(platform, homeDir) {
  if (platform === "darwin") {
    return [
      path6.join(homeDir, ".local", "bin", "claude"),
      path6.join(homeDir, ".npm-global", "bin", "claude")
    ];
  }
  if (platform === "win32") {
    return [
      path6.join(homeDir, "AppData", "Roaming", "npm", "claude.cmd"),
      path6.join(homeDir, "AppData", "Local", "Programs", "Claude", "claude.exe")
    ];
  }
  return [path6.join(homeDir, ".local", "bin", "claude")];
}
function claudeAppCandidates(platform, homeDir, env) {
  if (platform === "darwin") {
    return [
      "/Applications/Claude.app/Contents/MacOS/Claude",
      path6.join(homeDir, "Applications", "Claude.app", "Contents", "MacOS", "Claude")
    ];
  }
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path6.join(homeDir, "AppData", "Local");
    const programFiles = [env.ProgramFiles, env["ProgramFiles(x86)"]].filter(
      (value) => Boolean(value)
    );
    return [
      path6.join(local, "Programs", "Claude", "Claude.exe"),
      ...programFiles.map((root) => path6.join(root, "Claude", "Claude.exe"))
    ];
  }
  return [];
}
function detectProduct(platformName, options) {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir4();
  const env = { ...process.env, ...options.env };
  const explicitCommand = platformName === "codex" ? options.codexPath : platformName === "claude" ? options.claudePath : options.antigravityPath;
  const onPath = executableOnPath(platformName, env, platform);
  const candidates = platformName === "codex" ? codexCandidates(platform, homeDir, env) : platformName === "claude" ? claudeCandidates(platform, homeDir) : antigravityCandidates(platform, homeDir, env);
  const commandPath = firstExisting2([explicitCommand, onPath, ...candidates]);
  const executablePath = platformName === "claude" ? firstExisting2([
    commandPath,
    options.claudeAppPath,
    ...claudeAppCandidates(platform, homeDir, env)
  ]) : commandPath;
  const configPath = path6.join(
    homeDir,
    platformName === "codex" ? ".codex" : platformName === "claude" ? ".claude" : ".gemini"
  );
  const state = executablePath ? "found" : existsSync5(configPath) ? "config_only" : "not_found";
  if (!executablePath) return { state, executablePath: null, commandPath: null, version: null };
  if (platformName === "antigravity") {
    return { state, executablePath, commandPath, version: null };
  }
  if (!commandPath) return { state, executablePath, commandPath: null, version: null };
  const result = runCommand(commandPath, ["--version"], env, options.commandRunner);
  const version = result.status === 0 ? result.stdout.trim() || null : null;
  return { state, executablePath, commandPath, version };
}
function readBundledPluginVersion(marketplaceRoot, fallback) {
  if (!marketplaceRoot) return fallback;
  const manifestPath = path6.join(
    marketplaceRoot,
    "plugins",
    PLUGIN_NAME,
    ".codex-plugin",
    "plugin.json"
  );
  if (!existsSync5(manifestPath)) return fallback;
  try {
    const manifest = JSON.parse(readFileSync5(manifestPath, "utf8"));
    return manifest.version?.trim() || fallback;
  } catch {
    return fallback;
  }
}
function readBundledClaudePluginVersion(marketplaceRoot, fallback) {
  if (!marketplaceRoot) return fallback;
  const manifestPath = path6.join(
    marketplaceRoot,
    "adapters",
    "claude-code",
    ".claude-plugin",
    "plugin.json"
  );
  if (!existsSync5(manifestPath)) return fallback;
  try {
    const manifest = JSON.parse(readFileSync5(manifestPath, "utf8"));
    return manifest.version?.trim() || fallback;
  } catch {
    return fallback;
  }
}
function parseJson(result, label) {
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} failed.`, {
      status: result.status,
      stderr: result.stderr.trim()
    });
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} returned invalid JSON.`, {
      stdout: result.stdout.slice(0, 500)
    });
  }
}
function codexConfigPath2(options) {
  const env = { ...process.env, ...options.env };
  const codexHome = env.CODEX_HOME ? path6.resolve(env.CODEX_HOME) : path6.join(options.homeDir ?? homedir4(), ".codex");
  return path6.join(codexHome, "config.toml");
}
function hasMarketplaceManifest(root) {
  return existsSync5(path6.join(root, ".agents", "plugins", "marketplace.json"));
}
function normalizeBrokenLocalPath(source, platform) {
  if (platform === "win32" || source.length < 4) return source;
  if (source[0] === "\\" && source[1] === "\\" && source[2] === "?") {
    if (source[3] === "\\") return source.slice(4);
    if (source[3] === "/") return source.slice(3);
  }
  return source;
}
function repairedMarketplaceSource(marketplaceName, source, options) {
  const bundledRoot = options.marketplaceRoot ? path6.resolve(options.marketplaceRoot) : null;
  if (marketplaceName === DESKTOP_MARKETPLACE && bundledRoot && bundledRoot !== source && hasMarketplaceManifest(bundledRoot)) {
    return bundledRoot;
  }
  const normalized = normalizeBrokenLocalPath(source, options.platform ?? process.platform);
  if (normalized === source) return null;
  const resolved = path6.resolve(normalized);
  return hasMarketplaceManifest(resolved) ? resolved : null;
}
function repairCodexMarketplaceConfig(options = {}) {
  const configPath = codexConfigPath2(options);
  if (!existsSync5(configPath)) {
    return { changed: false, configPath, backupPath: null, repairedMarketplaces: [] };
  }
  const source = readFileSync5(configPath, "utf8");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r?\n/);
  const repairedMarketplaces = [];
  let marketplaceName = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const table = /^\s*\[marketplaces\.([^\]]+)\]\s*(?:#.*)?$/.exec(line);
    if (table) {
      marketplaceName = table[1] ?? null;
      continue;
    }
    if (/^\s*\[/.test(line)) {
      marketplaceName = null;
      continue;
    }
    if (!marketplaceName) continue;
    const assignment = /^(\s*source\s*=\s*)(["'])(.*)\2(\s*(?:#.*)?)$/.exec(line);
    if (!assignment) continue;
    const repaired = repairedMarketplaceSource(marketplaceName, assignment[3] ?? "", options);
    if (!repaired) continue;
    lines[index] = `${assignment[1]}${JSON.stringify(repaired)}${assignment[4] ?? ""}`;
    repairedMarketplaces.push(marketplaceName);
  }
  if (repairedMarketplaces.length === 0) {
    return { changed: false, configPath, backupPath: null, repairedMarketplaces };
  }
  const updated = lines.join(newline);
  const backupPath = `${configPath}.project-memory-marketplace-backup`;
  if (!existsSync5(backupPath)) {
    copyFileSync2(configPath, backupPath);
    if ((options.platform ?? process.platform) !== "win32") chmodSync4(backupPath, 384);
  }
  const existingMode = statSync4(configPath).mode & 511;
  const temporaryPath = `${configPath}.${process.pid}.tmp`;
  writeFileSync4(temporaryPath, updated, { encoding: "utf8", mode: existingMode });
  if ((options.platform ?? process.platform) !== "win32") chmodSync4(temporaryPath, existingMode);
  renameSync4(temporaryPath, configPath);
  return { changed: true, configPath, backupPath, repairedMarketplaces };
}
function codexPluginList(executablePath, options) {
  const env = { ...process.env, ...options.env };
  const inspect = () => parseJson(
    runCommand(
      executablePath,
      ["plugin", "list", "--available", "--json"],
      env,
      options.commandRunner
    ),
    "Codex plugin inspection"
  );
  try {
    return inspect();
  } catch (error) {
    const repair = repairCodexMarketplaceConfig(options);
    if (!repair.changed) throw error;
    return inspect();
  }
}
function claudePluginList(executablePath, options) {
  const result = runCommand(
    executablePath,
    ["plugin", "list", "--json"],
    { ...process.env, ...options.env },
    options.commandRunner
  );
  const parsed = parseJson(
    result,
    "Claude Code plugin inspection"
  );
  return Array.isArray(parsed) ? parsed : parsed.plugins ?? [];
}
function claudePluginMatches(plugin) {
  return plugin.name === "project-memory" || plugin.id === "project-memory" || plugin.id?.startsWith("project-memory@") === true;
}
function inspectionIssue(error) {
  if (!(error instanceof ProjectMemoryError)) {
    return error instanceof Error ? error.message : String(error);
  }
  const stderr = typeof error.details.stderr === "string" ? error.details.stderr.trim() : "";
  if (!stderr) return error.message;
  return `${error.message} ${stderr.split(/\r?\n/).slice(0, 3).join(" ")}`;
}
function statusActions(productState, integrationState, memoryAccessState = "not_applicable") {
  if (productState !== "found") return ["rescan"];
  switch (integrationState) {
    case "absent":
      return ["install", "rescan"];
    case "outdated":
      return ["update", "remove", "rescan"];
    case "installed":
      if (memoryAccessState === "not_applicable") return ["remove", "rescan"];
      return memoryAccessState === "configured" ? ["remove", "rescan"] : ["repair", "remove", "rescan"];
    case "external":
      return ["migrate", "rescan"];
    default:
      return ["rescan"];
  }
}
function codexStatus(options) {
  const product = detectProduct("codex", options);
  const marketplaceRoot = options.marketplaceRoot ? path6.resolve(options.marketplaceRoot) : null;
  const currentVersion = readBundledPluginVersion(
    marketplaceRoot,
    options.version ?? DEFAULT_VERSION
  );
  let integrationState = "absent";
  let installedVersion = null;
  let managedBy = null;
  let externalPluginId = null;
  const issues = [];
  const dataRoot = integrationDataRoot(options);
  const memoryAccess = inspectCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot
  });
  if (product.executablePath) {
    try {
      const plugins = codexPluginList(product.executablePath, options);
      const installed = (plugins.installed ?? []).find((plugin) => plugin.name === PLUGIN_NAME);
      if (installed) {
        installedVersion = installed.version ?? null;
        if (installed.marketplaceName === DESKTOP_MARKETPLACE) {
          managedBy = "desktop";
          integrationState = compatibleIntegrationVersion(installedVersion, currentVersion) ? "installed" : "outdated";
        } else {
          managedBy = "external";
          integrationState = "external";
          externalPluginId = installed.pluginId ?? null;
          issues.push(`installed from ${installed.marketplaceName ?? "another marketplace"}`);
        }
      }
    } catch (error) {
      integrationState = "conflict";
      issues.push(inspectionIssue(error));
    }
  }
  if (["installed", "outdated", "external"].includes(integrationState) && memoryAccess.state !== "configured") {
    issues.push(
      memoryAccess.issue ?? `Codex sandbox has not allowed the Talo data directory: ${dataRoot}`
    );
  }
  return {
    platform: "codex",
    displayName: "Codex",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState,
    installedVersion,
    currentVersion,
    managedBy,
    externalPluginId,
    memoryAccessState: memoryAccess.state,
    memoryDataRoot: dataRoot,
    memoryConfigPath: memoryAccess.configPath,
    issues,
    actions: statusActions(product.state, integrationState, memoryAccess.state),
    restartRequired: memoryAccess.state !== "configured",
    successMessage: memoryAccess.state === "configured" ? "\u5DF2\u914D\u7F6E\u666E\u901A\u53EF\u5199\u76EE\u5F55\u6743\u9650\u548C\u6258\u7BA1\u6C99\u7BB1\u5347\u7EA7\u6267\u884C\u515C\u5E95\u3002" : "\u9700\u8981\u5148\u4FEE\u590D Talo \u6570\u636E\u76EE\u5F55\u6743\u9650\u3002",
    downloadUrl: "https://openai.com/codex/"
  };
}
function antigravityStatus(options) {
  const product = detectProduct("antigravity", options);
  const integration = antigravityIntegrationStatus({
    ...options.antigravity,
    version: options.version ?? options.antigravity?.version
  });
  return {
    platform: "antigravity",
    displayName: "Antigravity",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState: integration.state,
    installedVersion: integration.version,
    currentVersion: integration.currentVersion,
    managedBy: integration.state === "absent" ? null : integration.version ? "desktop" : "external",
    externalPluginId: null,
    memoryAccessState: "not_applicable",
    memoryDataRoot: null,
    memoryConfigPath: null,
    issues: integration.issues,
    actions: statusActions(product.state, integration.state),
    restartRequired: integration.state !== "absent",
    successMessage: "\u91CD\u542F Antigravity \u540E\u751F\u6548\u3002",
    downloadUrl: "https://antigravity.google/"
  };
}
function claudeStatus(options) {
  const product = detectProduct("claude", options);
  const marketplaceRoot = options.marketplaceRoot ? path6.resolve(options.marketplaceRoot) : null;
  const currentVersion = readBundledClaudePluginVersion(
    marketplaceRoot,
    options.version ?? DEFAULT_VERSION
  );
  if (!product.commandPath) {
    const integration = claudeIntegrationStatus({
      ...options.claude,
      version: currentVersion
    });
    return {
      platform: "claude",
      displayName: "Claude Code",
      productState: product.state,
      executablePath: product.executablePath,
      productVersion: product.version,
      integrationState: integration.state,
      installedVersion: integration.version,
      currentVersion: integration.currentVersion,
      managedBy: integration.state === "absent" ? null : integration.version ? "desktop" : "external",
      externalPluginId: null,
      memoryAccessState: "not_applicable",
      memoryDataRoot: null,
      memoryConfigPath: integration.manifestPath,
      issues: integration.issues,
      actions: statusActions(product.state, integration.state),
      restartRequired: integration.state !== "absent",
      successMessage: "\u91CD\u542F Claude Code \u540E\u751F\u6548\u3002",
      downloadUrl: "https://claude.ai/download"
    };
  }
  let integrationState = "absent";
  let installedVersion = null;
  let managedBy = null;
  let externalPluginId = null;
  const issues = [];
  if (product.commandPath) {
    try {
      const installed = claudePluginList(product.commandPath, options).find(claudePluginMatches);
      if (installed) {
        installedVersion = installed.version ?? null;
        const marketplaceName = installed.marketplaceName ?? installed.marketplace ?? "";
        const managed = marketplaceName === "project-memory" || marketplaceName === "project-memory-desktop" || installed.id?.endsWith("@project-memory") === true;
        if (managed) {
          managedBy = "desktop";
          integrationState = compatibleIntegrationVersion(installedVersion, currentVersion) ? "installed" : "outdated";
        } else {
          managedBy = "external";
          integrationState = "external";
          externalPluginId = installed.id ?? installed.name ?? null;
          issues.push(`installed from ${marketplaceName || "another marketplace"}`);
        }
      }
    } catch (error) {
      integrationState = "conflict";
      issues.push(inspectionIssue(error));
    }
  }
  return {
    platform: "claude",
    displayName: "Claude Code",
    productState: product.state,
    executablePath: product.executablePath,
    productVersion: product.version,
    integrationState,
    installedVersion,
    currentVersion,
    managedBy,
    externalPluginId,
    memoryAccessState: "not_applicable",
    memoryDataRoot: null,
    memoryConfigPath: null,
    issues,
    actions: statusActions(product.state, integrationState),
    restartRequired: false,
    successMessage: "\u91CD\u542F Claude Code \u540E\u751F\u6548\u3002",
    downloadUrl: "https://claude.ai/download"
  };
}
function scanDesktopIntegrations(options = {}) {
  return [codexStatus(options), claudeStatus(options), antigravityStatus(options)];
}
function requireDetected(status) {
  if (status.productState !== "found" || !status.executablePath) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", `${status.displayName} is not installed.`, {
      platform: status.platform,
      productState: status.productState
    });
  }
  return status.executablePath;
}
function runCodexJson(executablePath, args, options, label) {
  return parseJson(
    runCommand(executablePath, args, { ...process.env, ...options.env }, options.commandRunner),
    label
  );
}
function runClaudeCommand(executablePath, args, options, label) {
  const result = runCommand(
    executablePath,
    args,
    { ...process.env, ...options.env },
    options.commandRunner
  );
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", `${label} failed.`, {
      status: result.status,
      stderr: result.stderr.trim()
    });
  }
  return result;
}
function installDesktopIntegration(platformName, options = {}) {
  if (platformName === "antigravity") {
    requireDetected(antigravityStatus(options));
    return installAntigravityIntegration({
      ...options.antigravity,
      version: options.version ?? options.antigravity?.version
    });
  }
  if (platformName === "claude") {
    const status2 = claudeStatus(options);
    requireDetected(status2);
    const product = detectProduct("claude", options);
    if (!product.commandPath) {
      return installClaudeIntegration({
        ...options.claude,
        version: status2.currentVersion
      });
    }
    const executablePath2 = product.commandPath;
    const marketplaceRoot2 = options.marketplaceRoot ? path6.resolve(options.marketplaceRoot) : null;
    if (!marketplaceRoot2 || !existsSync5(path6.join(marketplaceRoot2, ".claude-plugin", "marketplace.json"))) {
      throw new ProjectMemoryError(
        "FILE_NOT_FOUND",
        "Bundled Claude Code marketplace is missing.",
        {
          marketplaceRoot: marketplaceRoot2
        }
      );
    }
    if (status2.integrationState === "external" && !options.migrateExternal) {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Claude Code Talo is installed from another marketplace.",
        { externalPluginId: status2.externalPluginId }
      );
    }
    if (status2.integrationState === "conflict") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Claude Code integration cannot be changed safely.",
        {
          issues: status2.issues
        }
      );
    }
    if (status2.externalPluginId) {
      runClaudeCommand(
        executablePath2,
        ["plugin", "uninstall", status2.externalPluginId, "--scope", "user"],
        options,
        "Claude Code external plugin removal"
      );
    }
    runClaudeCommand(
      executablePath2,
      ["plugin", "marketplace", "add", marketplaceRoot2],
      options,
      "Claude Code marketplace installation"
    );
    runClaudeCommand(
      executablePath2,
      ["plugin", "install", "project-memory@project-memory", "--scope", "user"],
      options,
      "Claude Code plugin installation"
    );
    return {
      ...claudeStatus(options),
      changed: true,
      action: status2.integrationState === "absent" ? "installed" : "updated",
      restartRequired: true
    };
  }
  const status = codexStatus(options);
  const executablePath = requireDetected(status);
  const marketplaceRoot = options.marketplaceRoot ? path6.resolve(options.marketplaceRoot) : null;
  if (!marketplaceRoot || !existsSync5(path6.join(marketplaceRoot, ".agents", "plugins", "marketplace.json"))) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Bundled Codex marketplace is missing.", {
      marketplaceRoot
    });
  }
  if (status.integrationState === "external" && !options.migrateExternal) {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex Talo is installed from another marketplace.",
      { externalPluginId: status.externalPluginId }
    );
  }
  if (status.integrationState === "conflict") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Codex integration cannot be changed safely.",
      {
        issues: status.issues
      }
    );
  }
  ensureCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot: integrationDataRoot(options)
  });
  const removedExternal = status.integrationState === "external" ? status.externalPluginId : null;
  if (removedExternal) {
    runCodexJson(
      executablePath,
      ["plugin", "remove", removedExternal, "--json"],
      options,
      "Codex external plugin removal"
    );
  }
  try {
    runCodexJson(
      executablePath,
      ["plugin", "marketplace", "add", marketplaceRoot, "--json"],
      options,
      "Codex marketplace installation"
    );
    runCodexJson(
      executablePath,
      ["plugin", "add", `${PLUGIN_NAME}@${DESKTOP_MARKETPLACE}`, "--json"],
      options,
      "Codex plugin installation"
    );
  } catch (error) {
    if (removedExternal) {
      runCommand(
        executablePath,
        ["plugin", "add", removedExternal, "--json"],
        { ...process.env, ...options.env },
        options.commandRunner
      );
    }
    throw error;
  }
  return {
    ...codexStatus(options),
    changed: true,
    action: status.integrationState === "absent" ? "installed" : "updated",
    restartRequired: false
  };
}
function repairDesktopIntegration(platformName, options = {}) {
  if (platformName !== "codex") {
    throw new ProjectMemoryError(
      "INVALID_INPUT",
      "Sandbox access repair is only required for Codex.",
      { platform: platformName }
    );
  }
  requireDetected(codexStatus(options));
  const result = ensureCodexMemoryAccess({
    homeDir: options.homeDir,
    env: options.env,
    dataRoot: integrationDataRoot(options)
  });
  return {
    ...result,
    action: result.changed ? "repaired" : "already_configured",
    message: result.changed ? "Codex sandbox access is configured. Start a new Codex task to apply it." : "Codex sandbox access is already configured."
  };
}
function removeDesktopIntegration(platformName, options = {}) {
  if (platformName === "antigravity") {
    return removeAntigravityIntegration({
      ...options.antigravity,
      version: options.version ?? options.antigravity?.version
    });
  }
  if (platformName === "claude") {
    const status2 = claudeStatus(options);
    requireDetected(status2);
    if (status2.integrationState === "absent") {
      return { ...status2, changed: false, action: "absent" };
    }
    if (status2.managedBy !== "desktop") {
      throw new ProjectMemoryError(
        "INTEGRATION_CONFLICT",
        "Talo Desktop does not manage this Claude Code plugin.",
        { integrationState: status2.integrationState }
      );
    }
    const product = detectProduct("claude", options);
    if (!product.commandPath) {
      return removeClaudeIntegration({
        ...options.claude,
        version: status2.currentVersion
      });
    }
    const executablePath2 = product.commandPath;
    runClaudeCommand(
      executablePath2,
      ["plugin", "uninstall", "project-memory@project-memory", "--scope", "user"],
      options,
      "Claude Code plugin removal"
    );
    runClaudeCommand(
      executablePath2,
      ["plugin", "marketplace", "remove", "project-memory"],
      options,
      "Claude Code marketplace removal"
    );
    return { ...claudeStatus(options), changed: true, action: "removed" };
  }
  const status = codexStatus(options);
  const executablePath = requireDetected(status);
  if (status.integrationState === "absent") {
    return { ...status, changed: false, action: "absent" };
  }
  if (status.managedBy !== "desktop") {
    throw new ProjectMemoryError(
      "INTEGRATION_CONFLICT",
      "Talo Desktop does not manage this Codex plugin.",
      { integrationState: status.integrationState }
    );
  }
  runCodexJson(
    executablePath,
    ["plugin", "remove", `${PLUGIN_NAME}@${DESKTOP_MARKETPLACE}`, "--json"],
    options,
    "Codex plugin removal"
  );
  runCommand(
    executablePath,
    ["plugin", "marketplace", "remove", DESKTOP_MARKETPLACE],
    { ...process.env, ...options.env },
    options.commandRunner
  );
  return { ...codexStatus(options), changed: true, action: "removed" };
}

// ../../packages/project-memory-core/src/launcher.ts
import { spawnSync as spawnSync2 } from "child_process";
import {
  chmodSync as chmodSync5,
  copyFileSync as copyFileSync3,
  existsSync as existsSync6,
  mkdirSync as mkdirSync4,
  renameSync as renameSync5,
  rmSync as rmSync3,
  writeFileSync as writeFileSync5
} from "fs";
import { homedir as homedir5 } from "os";
import path7 from "path";
function shellQuote2(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
function xmlText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
function browserAssetPath(cliPath, name) {
  const cliDir = path7.dirname(cliPath);
  const candidates = [
    path7.join(cliDir, "browser", name),
    path7.resolve(cliDir, "..", "dist", "browser", name),
    path7.resolve(cliDir, "../../../plugins/codex-project-memory/dist/browser", name),
    path7.resolve(process.cwd(), "dist", "browser", name),
    path7.resolve(process.cwd(), "packages/project-memory-core/dist/browser", name),
    path7.resolve(process.cwd(), "plugins/codex-project-memory/dist/browser", name)
  ];
  const resolved = candidates.find((candidate) => existsSync6(candidate));
  if (!resolved) {
    throw new ProjectMemoryError(
      "FILE_NOT_FOUND",
      `Browser asset ${name} is missing. Build Talo before installing the application.`,
      { candidates }
    );
  }
  return resolved;
}
function launcherIconPath(cliPath, explicitPath) {
  const cliDir = path7.dirname(cliPath);
  const candidates = [
    explicitPath,
    process.env.PROJECT_MEMORY_APP_ICON,
    path7.resolve(cliDir, "../assets/logo.png"),
    path7.resolve(cliDir, "../../assets/logo.png"),
    path7.resolve(cliDir, "../../../plugins/codex-project-memory/assets/logo.png"),
    path7.resolve(process.cwd(), "plugins/codex-project-memory/assets/logo.png")
  ].filter((candidate) => Boolean(candidate));
  const resolved = candidates.find((candidate) => existsSync6(candidate));
  if (!resolved) {
    throw new ProjectMemoryError("FILE_NOT_FOUND", "Talo application icon is missing.", {
      candidates
    });
  }
  return resolved;
}
function compileMacIcon(sourcePath, targetPath) {
  const iconsetPath = `${targetPath}.iconset`;
  rmSync3(iconsetPath, { recursive: true, force: true });
  mkdirSync4(iconsetPath, { recursive: true, mode: 448 });
  const sizes = [16, 32, 128, 256, 512];
  try {
    for (const size of sizes) {
      const regular = path7.join(iconsetPath, `icon_${size}x${size}.png`);
      const retina = path7.join(iconsetPath, `icon_${size}x${size}@2x.png`);
      const regularResult = spawnSync2(
        "sips",
        ["-z", String(size), String(size), sourcePath, "--out", regular],
        {
          stdio: "ignore"
        }
      );
      const retinaResult = spawnSync2(
        "sips",
        ["-z", String(size * 2), String(size * 2), sourcePath, "--out", retina],
        { stdio: "ignore" }
      );
      if (regularResult.status !== 0 || retinaResult.status !== 0) {
        throw new ProjectMemoryError(
          "STORAGE_ERROR",
          "Unable to resize the macOS application icon."
        );
      }
    }
    const result = spawnSync2("iconutil", ["-c", "icns", iconsetPath, "-o", targetPath], {
      stdio: "ignore"
    });
    if (result.status !== 0) {
      throw new ProjectMemoryError(
        "STORAGE_ERROR",
        "Unable to compile the macOS application icon."
      );
    }
    chmodSync5(targetPath, 384);
  } finally {
    rmSync3(iconsetPath, { recursive: true, force: true });
  }
}
function macApplicationPath(homeDir) {
  return path7.join(homeDir, "Applications", "Talo.app");
}
function legacyMacApplicationPath(homeDir) {
  return path7.join(homeDir, "Applications", "Project Memory.app");
}
function legacyMacShortcutPath(homeDir) {
  return path7.join(homeDir, "Desktop", "Project Memory.command");
}
function installMacApplication(options) {
  const target = macApplicationPath(options.homeDir);
  const legacyApplication = legacyMacApplicationPath(options.homeDir);
  const staging = `${target}.installing-${process.pid}`;
  const previous = `${target}.previous-${process.pid}`;
  const contents = path7.join(staging, "Contents");
  const macos = path7.join(contents, "MacOS");
  const resources = path7.join(contents, "Resources");
  const browser = path7.join(resources, "browser");
  const embeddedCli = path7.join(resources, "project-memory.mjs");
  const executable = path7.join(macos, "project-memory-launcher");
  const iconTarget = path7.join(resources, "Talo.icns");
  const legacyShortcut = legacyMacShortcutPath(options.homeDir);
  rmSync3(staging, { recursive: true, force: true });
  rmSync3(previous, { recursive: true, force: true });
  mkdirSync4(macos, { recursive: true, mode: 448 });
  mkdirSync4(browser, { recursive: true, mode: 448 });
  copyFileSync3(options.cliPath, embeddedCli);
  copyFileSync3(
    browserAssetPath(options.cliPath, "graph-app.js"),
    path7.join(browser, "graph-app.js")
  );
  copyFileSync3(
    browserAssetPath(options.cliPath, "graph-app.css"),
    path7.join(browser, "graph-app.css")
  );
  chmodSync5(embeddedCli, 384);
  chmodSync5(path7.join(browser, "graph-app.js"), 384);
  chmodSync5(path7.join(browser, "graph-app.css"), 384);
  const compileIcon = options.iconCompiler ?? compileMacIcon;
  compileIcon(launcherIconPath(options.cliPath, options.iconPath), iconTarget);
  const launcher = `#!/bin/sh
APP_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
exec ${shellQuote2(options.nodePath)} "$APP_ROOT/Contents/Resources/project-memory.mjs" open
`;
  writeFileSync5(executable, launcher, { encoding: "utf8", mode: 448 });
  chmodSync5(executable, 448);
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key><string>Talo</string>
  <key>CFBundleExecutable</key><string>project-memory-launcher</string>
  <key>CFBundleIconFile</key><string>Talo</string>
  <key>CFBundleIdentifier</key><string>com.wangxuezhi.talo</string>
  <key>CFBundleName</key><string>Talo</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.14.1</string>
  <key>CFBundleVersion</key><string>1401</string>
  <key>LSMinimumSystemVersion</key><string>12.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>TaloCLI</key><string>${xmlText(options.cliPath)}</string>
</dict>
</plist>
`;
  writeFileSync5(path7.join(contents, "Info.plist"), plist, { encoding: "utf8", mode: 384 });
  mkdirSync4(path7.dirname(target), { recursive: true, mode: 448 });
  try {
    if (existsSync6(target)) renameSync5(target, previous);
    renameSync5(staging, target);
    rmSync3(previous, { recursive: true, force: true });
  } catch (error) {
    rmSync3(staging, { recursive: true, force: true });
    if (!existsSync6(target) && existsSync6(previous)) renameSync5(previous, target);
    throw error;
  }
  const legacyShortcutRemoved = existsSync6(legacyShortcut);
  rmSync3(legacyShortcut, { force: true });
  const legacyApplicationRemoved = existsSync6(legacyApplication);
  rmSync3(legacyApplication, { recursive: true, force: true });
  return {
    installed: true,
    shortcutPath: target,
    appPath: target,
    opens: "memory-hub",
    legacyShortcutRemoved,
    legacyApplicationRemoved,
    embeddedCli: path7.join(target, "Contents", "Resources", "project-memory.mjs")
  };
}
function installShortcut(options = {}) {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir5();
  const cliPath = path7.resolve(options.cliPath ?? process.argv[1] ?? "project-memory.mjs");
  const nodePath = path7.resolve(options.nodePath ?? process.execPath);
  if (platform === "darwin") {
    return installMacApplication({ ...options, homeDir, cliPath, nodePath });
  }
  const target = platform === "win32" ? path7.join(homeDir, "Desktop", "Talo.cmd") : path7.join(homeDir, ".local", "share", "applications", "project-memory.desktop");
  mkdirSync4(path7.dirname(target), { recursive: true });
  const command = `${JSON.stringify(nodePath)} ${JSON.stringify(cliPath)} open`;
  const content = platform === "win32" ? `@echo off\r
${command}\r
` : `[Desktop Entry]
Type=Application
Name=Talo
Exec=${command}
Terminal=false
Categories=Utility;Development;
`;
  writeFileSync5(target, content, { encoding: "utf8", mode: 448 });
  if (platform !== "win32") chmodSync5(target, 448);
  return { installed: true, shortcutPath: target, command };
}
function removeShortcut(options = {}) {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir5();
  if (platform === "darwin") {
    const appPath = macApplicationPath(homeDir);
    const legacyAppPath = legacyMacApplicationPath(homeDir);
    const legacyShortcutPath = legacyMacShortcutPath(homeDir);
    rmSync3(appPath, { recursive: true, force: true });
    rmSync3(legacyAppPath, { recursive: true, force: true });
    rmSync3(legacyShortcutPath, { force: true });
    return { removed: true, shortcutPath: appPath, appPath, legacyAppPath, legacyShortcutPath };
  }
  const target = platform === "win32" ? path7.join(homeDir, "Desktop", "Talo.cmd") : path7.join(homeDir, ".local", "share", "applications", "project-memory.desktop");
  rmSync3(target, { force: true });
  return { removed: true, shortcutPath: target };
}

// ../../packages/project-memory-core/src/service.ts
import path10, { basename } from "path";
import { pathToFileURL as pathToFileURL2 } from "url";

// ../../packages/project-memory-core/src/display-title.ts
var FALLBACK_ROLES = {
  architecture: "conclusion",
  decision: "conclusion",
  workflow: "progress",
  convention: "progress",
  pitfall: "risk",
  status: "progress"
};
var ROLE_PREFIXES = {
  conclusion: "\u5DF2\u786E\u8BA4",
  progress: "\u8FDB\u5C55",
  risk: "\u9700\u8981\u6CE8\u610F",
  next_step: "\u4E0B\u4E00\u6B65",
  reference: "\u8D44\u6599"
};
var ROLE_FALLBACKS = {
  conclusion: "\u5DF2\u786E\u8BA4\u7684\u9879\u76EE\u7ED3\u8BBA",
  progress: "\u6700\u8FD1\u9879\u76EE\u8FDB\u5C55",
  risk: "\u9700\u8981\u5173\u6CE8\u7684\u95EE\u9898",
  next_step: "\u5DF2\u786E\u8BA4\u7684\u4E0B\u4E00\u6B65",
  reference: "\u9879\u76EE\u53C2\u8003\u8D44\u6599"
};
function compactText(value) {
  return value.replaceAll(/\s+/g, " ").replaceAll(/^[#>*`\-\s]+|[#>*`\s]+$/g, "").trim();
}
function firstSentence(value, maxLength = 30) {
  const compact2 = compactText(value);
  const sentence = compact2.split(/[。！？.!?]\s*/u)[0]?.trim() ?? compact2;
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength - 1)}\u2026` : sentence;
}
function isTechnicalMemoryTitle(value) {
  const title = compactText(value);
  if (!title) return false;
  return [
    /\b[0-9a-f]{7,64}\b/iu,
    /\b(?:build|deploy|candidate|memory|proposal)[-_:][a-z0-9._:-]+\b/iu,
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu,
    /(?:^|\s)(?:\/Users\/|[A-Za-z]:\\|\.{0,2}\/|[\w.-]+\/[\w./-]+)/u,
    /\b(?:related_to|observes|causes|depends_on|supports|contradicts|supersedes|derived_from)\b/u,
    /(?:端口|port)\s*[:：]?\s*\d{2,5}\b/iu,
    /(?:构建指纹|提交哈希|commit hash|candidateRef|memoryId|proposalId)/iu
  ].some((pattern) => pattern.test(title));
}
function readableCandidate(value) {
  if (!value) return null;
  const candidate = firstSentence(value);
  return candidate && !isTechnicalMemoryTitle(candidate) ? candidate : null;
}
function buildMemoryDisplayTitle(source) {
  const role = source.briefRole ?? (source.kind ? FALLBACK_ROLES[source.kind] : "reference");
  const topic = readableCandidate(source.topic);
  if (topic) return role === "reference" ? `${topic}\u8D44\u6599` : `${ROLE_PREFIXES[role]}\uFF1A${topic}`;
  const narrative = readableCandidate(source.narrative?.conclusion);
  if (narrative) return narrative;
  const summary = readableCandidate(source.summary);
  if (summary) return summary;
  const original = readableCandidate(source.title);
  return original ?? ROLE_FALLBACKS[role];
}
function withoutRolePrefix(value) {
  return firstSentence(value, 48).replace(/^(?:进展|已确认|需要注意|下一步|资料)\s*[:：]\s*/u, "");
}
function eventDate(source) {
  return (source.narrative?.occurredAt ?? source.createdAt ?? source.updatedAt ?? "\u65F6\u95F4\u672A\u8865\u5168").slice(0, 10);
}
function buildContextualMemoryDisplayTitles(sources) {
  const topicTitles = new Map(
    sources.map((source) => [
      source.id,
      withoutRolePrefix(source.displayTitle ?? buildMemoryDisplayTitle(source)) || "\u9879\u76EE\u4E8B\u4EF6"
    ])
  );
  const counts = /* @__PURE__ */ new Map();
  for (const title of topicTitles.values()) counts.set(title, (counts.get(title) ?? 0) + 1);
  const provisional = sources.map((source) => {
    const topicTitle = topicTitles.get(source.id) ?? "\u9879\u76EE\u4E8B\u4EF6";
    const original = withoutRolePrefix(source.title);
    const narrative = withoutRolePrefix(source.narrative?.conclusion ?? "");
    const readable = original && !isTechnicalMemoryTitle(original) ? original : narrative || topicTitle;
    if ((counts.get(topicTitle) ?? 0) === 1) return { source, title: readable };
    return { source, title: `${eventDate(source)}\uFF5C${readable}` };
  });
  const totals = /* @__PURE__ */ new Map();
  const occurrences = /* @__PURE__ */ new Map();
  for (const item of provisional) totals.set(item.title, (totals.get(item.title) ?? 0) + 1);
  return new Map(
    provisional.map(({ source, title }) => {
      const occurrence = (occurrences.get(title) ?? 0) + 1;
      occurrences.set(title, occurrence);
      return [
        source.id,
        (totals.get(title) ?? 0) > 1 ? `${title} \xB7 ${source.sequence ?? occurrence}` : title
      ];
    })
  );
}

// ../../packages/project-memory-core/src/retrieval.ts
var TOKEN_ESTIMATION_NOTE = "Model-independent estimate for context planning; not billing or model tokenizer output.";
var FIELD_WEIGHTS = {
  title: 6,
  summary: 5,
  topic: 4,
  tags: 3,
  content: 1,
  citations: 1
};
var CONFIDENCE_MULTIPLIER = {
  verified: 1.1,
  observed: 1,
  inferred: 0.9
};
function normalizeRecallText(value) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}
function tokenizeRecallText(value) {
  const normalized = normalizeRecallText(value);
  const tokens = [];
  for (const match of normalized.matchAll(/[\p{Script=Han}]+|[a-z0-9]+/gu)) {
    const segment = match[0];
    if (/^[\p{Script=Han}]+$/u.test(segment)) {
      tokens.push(segment);
      for (let index = 0; index < segment.length - 1; index += 1) {
        tokens.push(segment.slice(index, index + 2));
      }
    } else {
      tokens.push(segment);
    }
  }
  return tokens;
}
function estimateTokens(value) {
  let cjk = 0;
  let other = 0;
  for (const character of value) {
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(character)) {
      cjk += 1;
    } else if (!/\s/u.test(character)) {
      other += 1;
    }
  }
  return Math.max(1, cjk + Math.ceil(other / 4));
}
function temporarySummary(memory) {
  if (memory.summary) return memory.summary;
  const compact2 = memory.content.replace(/\s+/g, " ").trim();
  return compact2.length <= 220 ? compact2 : `${compact2.slice(0, 217)}...`;
}
function memoryFields(memory) {
  return {
    title: memory.title,
    summary: memory.summary ?? temporarySummary(memory),
    topic: memory.topic ?? "",
    tags: memory.tags.join(" "),
    content: memory.content,
    citations: memory.citations.map((citation) => `${citation.sourcePath} ${citation.note ?? ""}`).join(" ")
  };
}
function termFrequency(tokens, term) {
  let count = 0;
  for (const token of tokens) if (token === term) count += 1;
  return count;
}
function relationCounts(memories, relations) {
  const visibleIds = new Set(memories.map((memory) => memory.id));
  const counts = /* @__PURE__ */ new Map();
  for (const relation of relations) {
    if (!visibleIds.has(relation.fromMemoryId) || !visibleIds.has(relation.toMemoryId)) continue;
    counts.set(relation.fromMemoryId, (counts.get(relation.fromMemoryId) ?? 0) + 1);
    counts.set(relation.toMemoryId, (counts.get(relation.toMemoryId) ?? 0) + 1);
  }
  return counts;
}
function rankMemories(options) {
  const { currentProjectId, memories, relations, mode } = options;
  const counts = relationCounts(memories, relations);
  if (mode === "recent") {
    return [...memories].sort(
      (left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id)
    ).map((memory, index) => ({
      memory,
      score: 1 / (index + 1) * (memory.projectId === currentProjectId ? 1 : 0.85) * CONFIDENCE_MULTIPLIER[memory.confidence] * (memory.stale ? 0.35 : 1),
      matchReasons: ["recent"],
      formalRelationCount: counts.get(memory.id) ?? 0
    })).sort(
      (left, right) => right.score - left.score || Number(right.memory.projectId === currentProjectId) - Number(left.memory.projectId === currentProjectId) || right.memory.updatedAt.localeCompare(left.memory.updatedAt) || left.memory.id.localeCompare(right.memory.id)
    );
  }
  const normalizedQuery = normalizeRecallText(options.query ?? "");
  const queryTokens = [...new Set(tokenizeRecallText(normalizedQuery))];
  if (queryTokens.length === 0) return [];
  const documents = memories.map((memory) => {
    const fields = memoryFields(memory);
    const tokenized = Object.fromEntries(
      Object.entries(fields).map(([field, value]) => [field, tokenizeRecallText(value)])
    );
    return { memory, fields, tokenized };
  });
  const averageLengths = Object.fromEntries(
    Object.keys(FIELD_WEIGHTS).map((field) => {
      const key = field;
      const total = documents.reduce((sum, document) => sum + document.tokenized[key].length, 0);
      return [key, Math.max(1, total / Math.max(1, documents.length))];
    })
  );
  const documentFrequency = /* @__PURE__ */ new Map();
  for (const term of queryTokens) {
    documentFrequency.set(
      term,
      documents.filter(
        (document) => Object.keys(FIELD_WEIGHTS).some(
          (field) => document.tokenized[field].includes(term)
        )
      ).length
    );
  }
  const ranked = documents.map(({ memory, fields, tokenized }) => {
    let score = 0;
    const reasons = /* @__PURE__ */ new Set();
    for (const term of queryTokens) {
      const frequency = documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (memories.length - frequency + 0.5) / (frequency + 0.5));
      for (const field of Object.keys(FIELD_WEIGHTS)) {
        const tf = termFrequency(tokenized[field], term);
        if (tf === 0) continue;
        const length = tokenized[field].length;
        const denominator = tf + 1.2 * (0.25 + 0.75 * (length / averageLengths[field]));
        score += FIELD_WEIGHTS[field] * idf * (tf * 2.2 / denominator);
        reasons.add(`field:${field}`);
      }
    }
    if (normalizedQuery.length > 1) {
      for (const field of Object.keys(FIELD_WEIGHTS)) {
        if (normalizeRecallText(fields[field]).includes(normalizedQuery)) {
          score += 4;
          reasons.add(`exact_phrase:${field}`);
        }
      }
    }
    score *= CONFIDENCE_MULTIPLIER[memory.confidence];
    if (memory.stale) score *= 0.35;
    if (memory.projectId !== currentProjectId) score *= 0.85;
    return {
      memory,
      score,
      matchReasons: [...reasons].sort(),
      formalRelationCount: counts.get(memory.id) ?? 0
    };
  }).filter((entry) => entry.score > 0);
  const baseScores = new Map(ranked.map((entry) => [entry.memory.id, entry.score]));
  const maximumScore = Math.max(0, ...ranked.map((entry) => entry.score));
  for (const entry of ranked) {
    let strongestNeighbor = 0;
    for (const relation of relations) {
      const neighborId = relation.fromMemoryId === entry.memory.id ? relation.toMemoryId : relation.toMemoryId === entry.memory.id ? relation.fromMemoryId : null;
      if (neighborId)
        strongestNeighbor = Math.max(strongestNeighbor, baseScores.get(neighborId) ?? 0);
    }
    if (strongestNeighbor > 0 && maximumScore > 0) {
      entry.score *= 1 + Math.min(0.1, strongestNeighbor / maximumScore * 0.1);
      entry.matchReasons.push("reviewed_relation_neighbor");
    }
  }
  return ranked.sort(
    (left, right) => right.score - left.score || Number(right.memory.projectId === currentProjectId) - Number(left.memory.projectId === currentProjectId) || right.memory.updatedAt.localeCompare(left.memory.updatedAt) || left.memory.id.localeCompare(right.memory.id)
  );
}
function candidateFromRanked(entry) {
  const candidate = {
    memoryId: entry.memory.id,
    projectId: entry.memory.projectId,
    projectName: entry.memory.projectName,
    kind: entry.memory.kind,
    title: entry.memory.title,
    summary: temporarySummary(entry.memory),
    topic: entry.memory.topic,
    tags: entry.memory.tags,
    confidence: entry.memory.confidence,
    score: Number(entry.score.toFixed(6)),
    matchReasons: entry.matchReasons,
    stale: entry.memory.stale,
    staleReason: entry.memory.staleReason,
    citationCount: entry.memory.citations.length,
    formalRelationCount: entry.formalRelationCount,
    updatedAt: entry.memory.updatedAt,
    estimatedTokens: 0
  };
  candidate.estimatedTokens = estimateTokens(JSON.stringify(candidate));
  return candidate;
}
function buildOmissions(entries) {
  const reasons = ["budget_exceeded", "limit_exceeded"];
  return reasons.map((reason) => ({
    reason,
    memoryIds: entries.filter((entry) => entry.reason === reason).map((entry) => entry.memoryId)
  })).filter((entry) => entry.memoryIds.length > 0);
}
function buildRecallResult(options) {
  const ranked = rankMemories(options);
  const itemBudget = Math.floor(options.budgetTokens * 0.9);
  let used = 0;
  const candidates = [];
  const omitted = [];
  for (const [index, entry] of ranked.entries()) {
    if (index >= options.limit) {
      omitted.push({ reason: "limit_exceeded", memoryId: entry.memory.id });
      continue;
    }
    const candidate = candidateFromRanked(entry);
    if (used + candidate.estimatedTokens > itemBudget) {
      omitted.push({ reason: "budget_exceeded", memoryId: entry.memory.id });
      continue;
    }
    candidates.push(candidate);
    used += candidate.estimatedTokens;
  }
  return {
    queryMode: options.mode,
    query: options.mode === "query" ? options.query : null,
    candidates,
    recommendedMemoryIds: candidates.slice(0, Math.min(options.recommend, candidates.length)).map((candidate) => candidate.memoryId),
    estimatedTokens: Math.ceil(used / 0.9),
    budgetTokens: options.budgetTokens,
    estimationNote: TOKEN_ESTIMATION_NOTE,
    omissions: buildOmissions(omitted)
  };
}
function retrievedMemory(memory) {
  const {
    sourceCommit: _sourceCommit,
    sourceFileHash: _sourceFileHash,
    citations,
    ...rest
  } = memory;
  const result = {
    ...rest,
    citations: citations.map(
      ({ sourceCommit: _citationCommit, sourceFileHash: _citationHash, ...citation }) => citation
    ),
    estimatedTokens: 0
  };
  result.estimatedTokens = estimateTokens(JSON.stringify(result));
  return result;
}
function buildGetResult(memories, budgetTokens) {
  const itemBudget = Math.floor(budgetTokens * 0.9);
  let used = 0;
  const included = [];
  const omittedMemoryIds = [];
  for (const memory of memories) {
    const item = retrievedMemory(memory);
    if (used + item.estimatedTokens > itemBudget) {
      omittedMemoryIds.push(memory.id);
      continue;
    }
    included.push(item);
    used += item.estimatedTokens;
  }
  return {
    memories: included,
    omittedMemoryIds,
    omissions: omittedMemoryIds.length > 0 ? [{ reason: "budget_exceeded", memoryIds: omittedMemoryIds }] : [],
    estimatedTokens: Math.ceil(used / 0.9),
    budgetTokens,
    estimationNote: TOKEN_ESTIMATION_NOTE
  };
}

// ../../packages/project-memory-core/src/brief.ts
var FALLBACK_ROLES2 = {
  architecture: "conclusion",
  decision: "conclusion",
  workflow: "progress",
  convention: "progress",
  pitfall: "risk",
  status: "progress"
};
function resolvedBriefRole(memory) {
  if (memory.briefRole) return { role: memory.briefRole, source: "reviewed" };
  return { role: FALLBACK_ROLES2[memory.kind] ?? "reference", source: "inferred" };
}
function compareRecent(left, right) {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || left.id.localeCompare(right.id);
}
function briefItem(memory) {
  const resolved = resolvedBriefRole(memory);
  return {
    memoryId: memory.id,
    title: memory.title,
    displayTitle: buildMemoryDisplayTitle(memory),
    summary: temporarySummary(memory),
    topic: memory.topic,
    briefRole: resolved.role,
    roleSource: resolved.source,
    stale: memory.stale,
    citationCount: memory.citations.length,
    updatedAt: memory.updatedAt,
    occurredAt: memory.narrative?.occurredAt ?? null,
    narrative: memory.narrative ?? null
  };
}
function compareOccurred(left, right) {
  const leftOccurred = left.narrative?.occurredAt;
  const rightOccurred = right.narrative?.occurredAt;
  if (leftOccurred && rightOccurred) {
    return Date.parse(rightOccurred) - Date.parse(leftOccurred) || compareRecent(left, right);
  }
  if (leftOccurred) return -1;
  if (rightOccurred) return 1;
  return compareRecent(left, right);
}
function handoffItem(memory) {
  return { ...briefItem(memory), isLegacy: !memory.narrative };
}
function coverageFor(memories) {
  const relevant = memories.filter((memory) => resolvedBriefRole(memory).role !== "reference");
  if (relevant.length === 0)
    return "\u6839\u636E\u5DF2\u4FDD\u5B58\u8BB0\u5F55\u6574\u7406\uFF1A\u76EE\u524D\u8FD8\u6CA1\u6709\u8DB3\u591F\u7684\u5DE5\u4F5C\u8BB0\u5F55\u6765\u8BF4\u660E\u8FD9\u4EFD\u9879\u76EE\u8D44\u6599\u4E3B\u8981\u8986\u76D6\u4EC0\u4E48\u3002";
  const topics = [...new Set(relevant.map((memory) => memory.topic).filter(Boolean))].slice(0, 3);
  const titles = relevant.slice(0, 3).map((memory) => `\u300A${buildMemoryDisplayTitle(memory)}\u300B`);
  const subject = topics.length > 0 ? `\u56F4\u7ED5${topics.join("\u3001")}` : "\u56F4\u7ED5\u6700\u8FD1\u4FDD\u5B58\u7684\u9879\u76EE\u5DE5\u4F5C";
  return `\u6839\u636E\u5DF2\u4FDD\u5B58\u8BB0\u5F55\u6574\u7406\uFF1A\u8FD9\u4EFD\u8D44\u6599\u4E3B\u8981${subject}\uFF0C\u5305\u62EC${titles.join("\u3001")}\u7B49\u5DE5\u4F5C\u3002`;
}
function startHere(memories) {
  const byRole = (role) => memories.filter((memory) => resolvedBriefRole(memory).role === role);
  const next = byRole("next_step").sort(compareOccurred);
  const conclusions = byRole("conclusion").sort(compareOccurred);
  const progress = byRole("progress").filter((memory) => Boolean(memory.narrative?.conclusion)).sort(compareOccurred);
  const candidates = [
    ...next.map((memory) => ({ memory, reason: "\u8FD9\u662F\u5F53\u524D\u5DF2\u786E\u8BA4\u8981\u505A\u7684\u4E8B\u3002" })),
    ...conclusions.map((memory) => ({ memory, reason: "\u8FD9\u662F\u6700\u8FD1\u5DF2\u786E\u8BA4\u3001\u4F1A\u5F71\u54CD\u5F53\u524D\u5224\u65AD\u7684\u7ED3\u8BBA\u3002" })),
    ...progress.map((memory) => ({
      memory,
      reason: "\u8FD9\u9879\u5DE5\u4F5C\u5DF2\u7ECF\u4EA7\u51FA\u7ED3\u8BBA\uFF0C\u80FD\u5E2E\u52A9\u4F60\u7406\u89E3\u76EE\u524D\u8FDB\u5C55\u3002"
    })),
    ...memories.sort(compareOccurred).map((memory) => ({ memory, reason: "\u8FD9\u662F\u6700\u8FD1\u4FDD\u5B58\u7684\u9879\u76EE\u8BB0\u5F55\u3002" }))
  ];
  const seen = /* @__PURE__ */ new Set();
  return candidates.filter(({ memory }) => !seen.has(memory.id) && seen.add(memory.id)).slice(0, 4).map(({ memory, reason }) => ({ ...handoffItem(memory), reason }));
}
function buildSuggestions(memories, sections) {
  const suggestions = [];
  const stale = memories.filter(
    (memory) => memory.stale || memory.citations.some((citation) => citation.stale)
  );
  for (const memory of stale.slice(0, 2)) {
    suggestions.push({
      id: `suggestion:recheck:${memory.id}`,
      text: `\u91CD\u65B0\u6838\u5BF9\u300A${buildMemoryDisplayTitle(memory)}\u300B\u7684\u6765\u6E90\u662F\u5426\u4ECD\u7136\u6709\u6548`,
      reason: "\u8FD9\u6761\u8BB0\u5FC6\u6216\u5B83\u5F15\u7528\u7684\u6587\u4EF6\u5DF2\u7ECF\u53D1\u751F\u53D8\u5316\u3002",
      memoryIds: [memory.id]
    });
  }
  if ((sections.get("next_step")?.length ?? 0) === 0) {
    const risk = sections.get("risk")?.[0];
    const conclusion = sections.get("conclusion")?.[0];
    if (risk) {
      suggestions.push({
        id: `suggestion:resolve-risk:${risk.memoryId}`,
        text: `\u786E\u8BA4\u300A${risk.displayTitle}\u300B\u4E2D\u7684\u8FB9\u754C\u540E\uFF0C\u518D\u51B3\u5B9A\u4E0B\u4E00\u6B65\u6267\u884C\u52A8\u4F5C`,
        reason: "\u9879\u76EE\u5C1A\u672A\u4FDD\u5B58\u660E\u786E\u7684\u4E0B\u4E00\u6B65\uFF0C\u800C\u8FD9\u6761\u98CE\u9669\u4F1A\u5F71\u54CD\u540E\u7EED\u884C\u52A8\u3002",
        memoryIds: [risk.memoryId]
      });
    } else if (conclusion) {
      suggestions.push({
        id: `suggestion:plan:${conclusion.memoryId}`,
        text: `\u57FA\u4E8E\u300A${conclusion.displayTitle}\u300B\u786E\u8BA4\u5E76\u4FDD\u5B58\u4E0B\u4E00\u6B65\u6267\u884C\u8BA1\u5212`,
        reason: "\u9879\u76EE\u5DF2\u6709\u7ED3\u8BBA\uFF0C\u4F46\u5C1A\u672A\u4FDD\u5B58\u660E\u786E\u7684\u4E0B\u4E00\u6B65\u3002",
        memoryIds: [conclusion.memoryId]
      });
    }
  }
  return suggestions.slice(0, 3);
}
function buildProjectBrief(projectId, projectName, graph, guide, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), limit = 12) {
  const memories = [...graph.nodes].sort(compareRecent).slice(0, limit);
  const sections = /* @__PURE__ */ new Map([
    ["conclusion", []],
    ["progress", []],
    ["risk", []],
    ["next_step", []],
    ["reference", []]
  ]);
  for (const memory of memories) {
    const item = briefItem(memory);
    sections.get(item.briefRole)?.push(item);
  }
  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
  const recommendations = /* @__PURE__ */ new Map();
  for (const highlight of guide.highlights) {
    if (!memoryById.has(highlight.memoryId)) continue;
    const current = recommendations.get(highlight.memoryId) ?? {
      title: highlight.title,
      displayTitle: buildMemoryDisplayTitle(memoryById.get(highlight.memoryId)),
      reasons: []
    };
    if (!current.reasons.includes(highlight.reason)) current.reasons.push(highlight.reason);
    recommendations.set(highlight.memoryId, current);
  }
  const topicIndex = /* @__PURE__ */ new Map();
  for (const memory of memories) {
    const topic = memory.topic?.trim();
    if (!topic) continue;
    topicIndex.set(topic, [...topicIndex.get(topic) ?? [], memory.id]);
  }
  const topics = [...topicIndex].filter(([, memoryIds]) => memoryIds.length >= 2).sort(([left], [right]) => left.localeCompare(right, "zh-CN")).map(([name, memoryIds]) => ({ name, memoryIds, memoryCount: memoryIds.length }));
  const currentConclusions = sections.get("conclusion") ?? [];
  const completedWork = sections.get("progress") ?? [];
  const risks = sections.get("risk") ?? [];
  const nextSteps = sections.get("next_step") ?? [];
  const references = sections.get("reference") ?? [];
  const citationCount = memories.reduce((total, memory) => total + memory.citations.length, 0);
  const staleCitationCount = memories.reduce(
    (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
    0
  );
  return {
    projectId,
    projectName,
    generatedAt,
    overview: `\u5DF2\u4FDD\u5B58 ${memories.length} \u6761\u9879\u76EE\u8BB0\u5FC6\uFF0C\u5305\u62EC ${currentConclusions.length} \u9879\u5F53\u524D\u7ED3\u8BBA\u3001${completedWork.length} \u9879\u5DF2\u5B8C\u6210\u5DE5\u4F5C\u3001${risks.length} \u9879\u98CE\u9669\u8FB9\u754C\u548C ${nextSteps.length} \u9879\u5DF2\u786E\u8BA4\u4E0B\u4E00\u6B65\u3002`,
    summary: {
      memoryCount: memories.length,
      conclusionCount: currentConclusions.length,
      progressCount: completedWork.length,
      riskCount: risks.length,
      nextStepCount: nextSteps.length,
      citationCount,
      staleMemoryCount: memories.filter((memory) => memory.stale).length,
      staleCitationCount
    },
    currentConclusions,
    completedWork,
    risks,
    nextSteps,
    references,
    systemSuggestions: buildSuggestions(memories, sections),
    recommendedReading: [...recommendations].slice(0, 3).map(([memoryId, value]) => ({
      memoryId,
      title: value.title,
      displayTitle: value.displayTitle,
      reasons: value.reasons
    })),
    recentUpdates: memories.slice(0, 5).map(briefItem),
    topics,
    handoff: {
      coverage: coverageFor(memories),
      startHere: startHere(memories),
      recentWork: memories.filter((memory) => resolvedBriefRole(memory).role !== "reference").sort(compareOccurred).slice(0, 5).map(handoffItem),
      history: memories.filter((memory) => resolvedBriefRole(memory).role !== "reference").sort(compareOccurred).map(handoffItem)
    }
  };
}

// ../../packages/project-memory-core/src/guide.ts
import { createHash as createHash2 } from "crypto";
var CITATION_WEIGHTS = {
  evidence: 3,
  report: 2,
  workflow: 2,
  reference: 1
};
var RELATION_LABELS = {
  related_to: "\u76F8\u5173",
  observes: "\u6CE8\u610F\u5230",
  causes: "\u539F\u56E0",
  depends_on: "\u4F9D\u8D56",
  supports: "\u652F\u6301",
  contradicts: "\u77DB\u76FE",
  supersedes: "\u66FF\u4EE3",
  derived_from: "\u6765\u6E90\u4E8E"
};
function pairKey(left, right) {
  return [left, right].sort().join("\0");
}
function stableId(prefix, values) {
  return `${prefix}_${createHash2("sha256").update(values.join("\0")).digest("hex").slice(0, 16)}`;
}
function fileName(sourcePath) {
  return sourcePath.split("/").at(-1) ?? sourcePath;
}
function sortedMemories(memories) {
  return [...memories].sort((left, right) => left.id.localeCompare(right.id));
}
function relationDegrees(graph) {
  const degrees = new Map(graph.nodes.map((memory) => [memory.id, 0]));
  for (const relation of graph.relations) {
    degrees.set(relation.fromMemoryId, (degrees.get(relation.fromMemoryId) ?? 0) + 1);
    degrees.set(relation.toMemoryId, (degrees.get(relation.toMemoryId) ?? 0) + 1);
  }
  return degrees;
}
function connectedComponents(graph) {
  const adjacency = new Map(graph.nodes.map((memory) => [memory.id, /* @__PURE__ */ new Set()]));
  for (const relation of graph.relations) {
    adjacency.get(relation.fromMemoryId)?.add(relation.toMemoryId);
    adjacency.get(relation.toMemoryId)?.add(relation.fromMemoryId);
  }
  const visited = /* @__PURE__ */ new Set();
  const components = [];
  for (const memory of sortedMemories(graph.nodes)) {
    if (visited.has(memory.id)) continue;
    const component = [];
    const queue = [memory.id];
    visited.add(memory.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      component.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
    components.push(component.sort());
  }
  return components.sort(
    (left, right) => right.length - left.length || (left[0] ?? "").localeCompare(right[0] ?? "")
  );
}
function buildHighlights(graph, degrees) {
  const memories = [...graph.nodes];
  const highlights = [];
  const select = (kind, candidates, reason, value) => {
    const memory = candidates[0];
    if (!memory) return;
    highlights.push({
      id: `highlight:${kind}:${memory.id}`,
      kind,
      memoryId: memory.id,
      title: buildMemoryDisplayTitle(memory),
      reason: reason(memory),
      value: value(memory)
    });
  };
  const byDegree = [...memories].sort(
    (left, right) => (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0) || right.citations.length - left.citations.length || left.id.localeCompare(right.id)
  );
  if ((degrees.get(byDegree[0]?.id ?? "") ?? 0) > 0) {
    select(
      "connected",
      byDegree,
      (memory) => `\u8FDE\u63A5 ${degrees.get(memory.id) ?? 0} \u6761\u5DF2\u5BA1\u6838\u5173\u7CFB`,
      (memory) => degrees.get(memory.id) ?? 0
    );
  }
  select(
    "evidence",
    [...memories].sort(
      (left, right) => right.citations.length - left.citations.length || left.id.localeCompare(right.id)
    ),
    (memory) => `\u8BB0\u5F55 ${memory.citations.length} \u4E2A\u53EF\u8FFD\u6EAF\u6765\u6E90`,
    (memory) => memory.citations.length
  );
  select(
    "recent",
    [...memories].sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || left.id.localeCompare(right.id)
    ),
    (memory) => `\u6700\u8FD1\u66F4\u65B0\u4E8E ${memory.updatedAt}`,
    (memory) => memory.updatedAt
  );
  return highlights;
}
function buildRelationSuggestions(projectId, graph, limit) {
  const memories = sortedMemories(graph.nodes.filter((memory) => memory.projectId === projectId));
  if (memories.length < 2) return [];
  const existingPairs = new Set(
    graph.relations.map((relation) => pairKey(relation.fromMemoryId, relation.toMemoryId))
  );
  const signalsByPair = /* @__PURE__ */ new Map();
  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
  const addSignal = (leftId, rightId, signal) => {
    if (leftId === rightId || existingPairs.has(pairKey(leftId, rightId))) return;
    const key = pairKey(leftId, rightId);
    const signals = signalsByPair.get(key) ?? [];
    if (!signals.some((candidate) => candidate.key === signal.key)) signals.push(signal);
    signalsByPair.set(key, signals);
  };
  const citationIndex = /* @__PURE__ */ new Map();
  for (const memory of memories) {
    const seen = /* @__PURE__ */ new Set();
    for (const citation of memory.citations) {
      if (!citation.accessible) continue;
      const key = `${citation.sourceProjectId}\0${citation.sourcePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const indexed = citationIndex.get(key) ?? [];
      indexed.push({
        memoryId: memory.id,
        role: citation.role,
        sourceProjectId: citation.sourceProjectId,
        sourcePath: citation.sourcePath
      });
      citationIndex.set(key, indexed);
    }
  }
  for (const [key, references] of citationIndex) {
    if (references.length / memories.length > 0.6) continue;
    for (let leftIndex = 0; leftIndex < references.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < references.length; rightIndex += 1) {
        const left = references[leftIndex];
        const right = references[rightIndex];
        if (!left || !right) continue;
        const role = CITATION_WEIGHTS[left.role] >= CITATION_WEIGHTS[right.role] ? left.role : right.role;
        addSignal(left.memoryId, right.memoryId, {
          kind: "shared_citation",
          key: `citation:${key}`,
          label: `\u5171\u4EAB${role === "evidence" ? "\u8BC1\u636E" : role === "report" ? "\u62A5\u544A" : role === "workflow" ? "\u6D41\u7A0B" : "\u53C2\u8003"}\uFF1A${fileName(left.sourcePath)}`,
          weight: CITATION_WEIGHTS[role],
          role,
          sourceProjectId: left.sourceProjectId,
          sourcePath: left.sourcePath
        });
      }
    }
  }
  const topicIndex = /* @__PURE__ */ new Map();
  for (const memory of memories) {
    const topic = memory.topic?.trim();
    if (!topic) continue;
    topicIndex.set(topic, [...topicIndex.get(topic) ?? [], memory.id]);
  }
  for (const [topic, memoryIds] of topicIndex) {
    for (let leftIndex = 0; leftIndex < memoryIds.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < memoryIds.length; rightIndex += 1) {
        const leftId = memoryIds[leftIndex];
        const rightId = memoryIds[rightIndex];
        if (!leftId || !rightId) continue;
        addSignal(leftId, rightId, {
          kind: "same_topic",
          key: `topic:${topic}`,
          label: `\u540C\u5C5E\u4E3B\u9898\uFF1A${topic}`,
          weight: 2
        });
      }
    }
  }
  const tagFrequency = /* @__PURE__ */ new Map();
  for (const memory of memories) {
    for (const tag of new Set(memory.tags.map((value) => value.trim()).filter(Boolean))) {
      tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
    }
  }
  for (let leftIndex = 0; leftIndex < memories.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < memories.length; rightIndex += 1) {
      const left = memories[leftIndex];
      const right = memories[rightIndex];
      if (!left || !right) continue;
      const rightTags = new Set(right.tags);
      const shared = [...new Set(left.tags)].filter(
        (tag) => rightTags.has(tag) && (tagFrequency.get(tag) ?? 0) / memories.length <= 0.5
      ).sort();
      if (shared.length < 2) continue;
      for (const tag of shared.slice(0, 2)) {
        addSignal(left.id, right.id, {
          kind: "shared_tag",
          key: `tag:${tag}`,
          label: `\u5171\u4EAB\u6807\u7B7E\uFF1A${tag}`,
          weight: 1
        });
      }
    }
  }
  const suggestions = [];
  for (const [key, rawSignals] of signalsByPair) {
    const [fromMemoryId, toMemoryId] = key.split("\0");
    if (!fromMemoryId || !toMemoryId || !memoryById.has(fromMemoryId) || !memoryById.has(toMemoryId))
      continue;
    const signals = [...rawSignals].sort(
      (left, right) => right.weight - left.weight || left.key.localeCompare(right.key)
    );
    const score = signals.reduce((total, signal) => total + signal.weight, 0);
    if (score < 2) continue;
    const signalKeys = signals.map((signal) => signal.key).sort();
    suggestions.push({
      id: stableId("hint", [projectId, fromMemoryId, toMemoryId, ...signalKeys]),
      projectId,
      fromMemoryId,
      toMemoryId,
      type: "related_to",
      rationale: signals.map((signal) => signal.label).join("\uFF1B"),
      score,
      signals
    });
  }
  return suggestions.sort(
    (left, right) => right.score - left.score || left.fromMemoryId.localeCompare(right.fromMemoryId) || left.toMemoryId.localeCompare(right.toMemoryId)
  ).slice(0, Math.max(1, Math.min(limit, 50)));
}
function buildGaps(graph, degrees) {
  const gaps = [];
  for (const memory of sortedMemories(graph.nodes)) {
    if ((degrees.get(memory.id) ?? 0) === 0) {
      gaps.push({
        id: `gap:isolated:${memory.id}`,
        kind: "isolated",
        memoryIds: [memory.id],
        message: `\u201C${buildMemoryDisplayTitle(memory)}\u201D\u5C1A\u672A\u8FDE\u63A5\u4EFB\u4F55\u5DF2\u5BA1\u6838\u5173\u7CFB\u3002`
      });
    }
    if (memory.stale) {
      gaps.push({
        id: `gap:stale-memory:${memory.id}`,
        kind: "stale_memory",
        memoryIds: [memory.id],
        message: `\u201C${buildMemoryDisplayTitle(memory)}\u201D\u5DF2\u8FC7\u671F\uFF1A${memory.staleReason ?? "\u6765\u6E90\u53D1\u751F\u53D8\u5316"}`
      });
    }
    const staleCitations = memory.citations.filter((citation) => citation.stale);
    if (staleCitations.length > 0) {
      gaps.push({
        id: `gap:stale-citation:${memory.id}`,
        kind: "stale_citation",
        memoryIds: [memory.id],
        message: `\u201C${buildMemoryDisplayTitle(memory)}\u201D\u6709 ${staleCitations.length} \u4E2A\u6765\u6E90\u5DF2\u5931\u6548\u3002`
      });
    }
  }
  return gaps;
}
function buildSuggestedQuestions(graph, suggestions, degrees) {
  const memoryById = new Map(graph.nodes.map((memory) => [memory.id, memory]));
  const questions = [];
  for (const relation of graph.relations) {
    const from = memoryById.get(relation.fromMemoryId);
    const to = memoryById.get(relation.toMemoryId);
    if (!from || !to) continue;
    const fromTitle = buildMemoryDisplayTitle(from);
    const toTitle = buildMemoryDisplayTitle(to);
    const question = relation.type === "causes" ? `\u201C${fromTitle}\u201D\u4E3A\u4EC0\u4E48\u662F\u201C${toTitle}\u201D\u7684\u539F\u56E0\uFF1F` : `\u201C${fromTitle}\u201D\u5982\u4F55${RELATION_LABELS[relation.type]}\u201C${toTitle}\u201D\uFF1F`;
    questions.push({
      id: `question:relation:${relation.id}`,
      question,
      why: `\u5DF2\u6709\u4E00\u6761\u5DF2\u5BA1\u6838\u7684${RELATION_LABELS[relation.type]}\u5173\u7CFB\uFF0C\u53EF\u6CBF\u5173\u7CFB\u7406\u7531\u548C\u6765\u6E90\u7EE7\u7EED\u8FFD\u6EAF\u3002`,
      memoryIds: [from.id, to.id]
    });
  }
  for (const suggestion of suggestions) {
    const from = memoryById.get(suggestion.fromMemoryId);
    const to = memoryById.get(suggestion.toMemoryId);
    if (!from || !to) continue;
    questions.push({
      id: `question:suggestion:${suggestion.id}`,
      question: `\u201C${buildMemoryDisplayTitle(from)}\u201D\u4E0E\u201C${buildMemoryDisplayTitle(to)}\u201D\u4E4B\u95F4\u662F\u5426\u7F3A\u5C11\u4E00\u6761\u6B63\u5F0F\u5173\u7CFB\uFF1F`,
      why: suggestion.rationale,
      memoryIds: [from.id, to.id]
    });
  }
  for (const memory of sortedMemories(graph.nodes)) {
    if ((degrees.get(memory.id) ?? 0) !== 0) continue;
    questions.push({
      id: `question:isolated:${memory.id}`,
      question: `\u201C${buildMemoryDisplayTitle(memory)}\u201D\u5E94\u4E0E\u54EA\u4E9B\u5DF2\u6709\u8BB0\u5FC6\u5EFA\u7ACB\u8054\u7CFB\uFF1F`,
      why: "\u8BE5\u8BB0\u5FC6\u5F53\u524D\u662F\u5B64\u7ACB\u8282\u70B9\uFF0C\u53EF\u80FD\u5B58\u5728\u5C1A\u672A\u5BA1\u6838\u7684\u77E5\u8BC6\u8054\u7CFB\u3002",
      memoryIds: [memory.id]
    });
  }
  return questions.slice(0, 5);
}
function analyzeKnowledgeGraph(projectId, projectName, graph, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), relationSuggestionLimit = 12) {
  const degrees = relationDegrees(graph);
  const components = connectedComponents(graph);
  const relationSuggestions = buildRelationSuggestions(projectId, graph, relationSuggestionLimit);
  const topics = /* @__PURE__ */ new Map();
  for (const memory of graph.nodes) {
    const topic = memory.topic ?? "\u672A\u5206\u7EC4";
    topics.set(topic, [...topics.get(topic) ?? [], memory]);
  }
  return {
    projectId,
    projectName,
    generatedAt,
    summary: {
      memoryCount: graph.nodes.length,
      formalRelationCount: graph.relations.length,
      citationCount: graph.nodes.reduce((total, memory) => total + memory.citations.length, 0),
      staleMemoryCount: graph.nodes.filter((memory) => memory.stale).length,
      staleCitationCount: graph.nodes.reduce(
        (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
        0
      ),
      componentCount: components.length,
      isolatedCount: graph.nodes.filter((memory) => (degrees.get(memory.id) ?? 0) === 0).length
    },
    topics: [...topics].sort(([left], [right]) => left.localeCompare(right, "zh-CN")).map(([name, memories]) => ({
      name,
      memoryIds: sortedMemories(memories).map((memory) => memory.id),
      memoryCount: memories.length,
      staleCount: memories.filter((memory) => memory.stale).length
    })),
    highlights: buildHighlights(graph, degrees),
    gaps: buildGaps(graph, degrees),
    suggestedQuestions: buildSuggestedQuestions(graph, relationSuggestions, degrees),
    relationSuggestions
  };
}

// ../../packages/project-memory-core/src/hub.ts
import { createHash as createHash3 } from "crypto";
function text(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function hash(value) {
  return createHash3("sha256").update(value).digest("base64");
}
var css = `
:root{color-scheme:dark;--void:#080b12;--stage:#0c111b;--panel:#111827;--panel-raised:#151f30;--panel-soft:rgba(21,31,48,.72);--ink:#eef4ff;--ink-soft:#c7d3e4;--muted:#8190a7;--muted-bright:#aebbd0;--line:#253149;--line-soft:rgba(148,163,184,.14);--cyan:#71e5fb;--cyan-deep:#39cce8;--blue:#8dc8ff;--green:#62e5b1;--amber:#f7bd68;--red:#ff9bac;--purple:#c6a1ff;--shadow:0 18px 48px rgba(0,0,0,.24);--sans:"Avenir Next","PingFang SC","Microsoft YaHei",sans-serif;--mono:"SF Mono","Cascadia Code","Roboto Mono",ui-monospace,monospace}
*{box-sizing:border-box}html{background:var(--void)}body{margin:0;min-width:320px;background:radial-gradient(circle at 75% -12%,#172554 0,transparent 32%),var(--void);color:var(--ink);font-family:var(--sans);line-height:1.55}.shell{min-height:100vh}.masthead{position:relative;isolation:isolate;overflow:hidden;padding:30px clamp(22px,5vw,72px) 34px;background:linear-gradient(135deg,rgba(15,25,43,.97),rgba(8,12,21,.98));border-bottom:1px solid #263a54;box-shadow:0 16px 48px rgba(0,0,0,.18)}.masthead:before{content:"";position:absolute;z-index:-1;inset:-30% -10% auto auto;width:560px;height:420px;background:radial-gradient(circle,rgba(57,204,232,.17),transparent 68%);pointer-events:none}.masthead:after{content:"";position:absolute;z-index:-1;right:0;bottom:0;left:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan-deep),transparent);opacity:.8}.masthead-inner{max-width:1440px;margin:0 auto}.masthead-top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:38px}.brand{display:flex;align-items:center;gap:12px}.brand-mark{width:40px;height:40px;display:grid;place-items:center;border:1px solid #2b6076;border-radius:12px;background:linear-gradient(145deg,#12304a,#12172b);color:var(--cyan);box-shadow:0 10px 26px rgba(0,0,0,.2)}.brand-copy{display:grid;gap:2px}.brand-copy strong{font-size:15px}.brand-copy span{color:var(--muted);font:10px var(--mono)}.masthead-status{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid #263c56;border-radius:999px;background:rgba(17,29,47,.7);color:var(--muted-bright);font:10px var(--mono)}.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 12px rgba(98,229,177,.75)}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:36px;align-items:end}.eyebrow{display:flex;align-items:center;gap:8px;margin:0 0 11px;color:var(--cyan);font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase}.eyebrow:before{content:"";width:18px;height:1px;background:var(--cyan)}.masthead h1{max-width:800px;margin:0;color:#f7fbff;font-size:clamp(34px,5vw,58px);font-weight:650;letter-spacing:-.05em;line-height:1.08}.masthead .hero-copy{max-width:780px;margin:17px 0 0;color:var(--muted-bright);font-size:15px;line-height:1.8}.hero-aside{display:grid;min-width:220px;gap:12px}.hero-link{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border:0;border-bottom:1px solid var(--line-soft);background:transparent;color:var(--ink-soft);font-size:12px;text-decoration:none}.hero-link:hover{padding-left:5px;color:var(--cyan)}.hero-link span{color:var(--muted);font:9px var(--mono)}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:34px;border:1px solid var(--line);background:var(--line)}.metric{display:grid;gap:5px;min-width:0;padding:16px 17px;background:rgba(10,16,28,.88)}.metric strong{color:var(--cyan);font:650 26px/1 var(--mono)}.metric span{color:var(--muted);font:10px var(--mono)}.metric:nth-child(3) strong{color:var(--amber)}.metric:nth-child(4) strong{color:var(--red)}.toolbar{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:minmax(260px,1fr) auto minmax(0,auto) auto;gap:10px;align-items:center;padding:12px clamp(22px,5vw,72px);background:rgba(8,11,18,.88);border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.search{width:100%;min-width:180px;height:42px;border:1px solid var(--line);border-radius:11px;background:#0e1421;padding:0 14px;color:var(--ink);font:13px var(--sans);outline:none}.search::placeholder{color:#66758c}.search:focus,.sort:focus{border-color:var(--cyan-deep);box-shadow:0 0 0 3px rgba(57,204,232,.12)}.sort{height:42px;border:1px solid var(--line);border-radius:11px;background:#0e1421;padding:0 12px;color:var(--ink-soft);font:11px var(--mono);outline:none}.filters{display:flex;gap:4px;padding:4px;border:1px solid var(--line);border-radius:12px;background:#0e1421}.filter{border:0;border-radius:8px;background:transparent;padding:7px 10px;color:var(--muted);font:11px var(--sans);cursor:pointer;white-space:nowrap}.filter:hover,.filter[aria-pressed=true]{background:#1b2a40;color:#eef7ff}.filter[aria-pressed=true]{box-shadow:inset 0 0 0 1px rgba(113,229,251,.2)}.content{padding:36px clamp(22px,5vw,72px) 70px}.section{max-width:1440px;margin:0 auto 42px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px;padding:0 2px}.section h2{margin:0;color:#f3f7ff;font-size:22px;letter-spacing:-.025em}.section-head:after{content:"";order:-1;width:3px;height:22px;border-radius:99px;background:var(--cyan-deep);box-shadow:0 0 14px rgba(57,204,232,.4)}.section-note{color:var(--muted);font:10px var(--mono);text-align:right}.project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}.project{position:relative;display:flex;flex-direction:column;min-height:286px;padding:18px;border:1px solid #263149;border-radius:14px;background:linear-gradient(145deg,rgba(20,28,44,.96),rgba(12,18,30,.96));box-shadow:var(--shadow);text-decoration:none;color:inherit;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.project:before{content:"";position:absolute;top:0;right:18px;left:18px;height:1px;background:linear-gradient(90deg,transparent,rgba(113,229,251,.36),transparent)}.project:hover,.project:focus-visible{transform:translateY(-3px);border-color:#395975;box-shadow:0 20px 42px rgba(0,0,0,.32);outline:none}.project-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.project h3{margin:0;color:#f1f6ff;font-size:17px;line-height:1.35}.date{white-space:nowrap;color:var(--muted);font:10px var(--mono)}.overview{display:-webkit-box;overflow:hidden;min-height:44px;margin:10px 0 18px;color:#8d9bb0;font-size:12px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:2}.facts{display:grid;gap:8px;margin-top:auto}.fact{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:8px 10px;border:1px solid rgba(38,49,73,.8);border-radius:9px;background:rgba(8,13,23,.5);font-size:11px}.fact b{color:#68778e;font:10px var(--mono)}.fact span{min-width:0;overflow:hidden;color:#cbd8e9;text-overflow:ellipsis;white-space:nowrap}.pending-note{margin:13px 0 0;padding:10px 11px;border:1px solid rgba(247,189,104,.2);border-radius:9px;background:rgba(76,48,18,.16);color:var(--amber);font-size:11px;line-height:1.55}.badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:14px}.badge{padding:4px 8px;border:1px solid #273850;border-radius:999px;background:#111c2c;color:#91a2b9;font:10px var(--mono)}.badge.risk{border-color:#5f2734;background:#29151b;color:var(--red)}.badge.pending{border-color:#654821;background:#2a2115;color:var(--amber)}.badge.ok{border-color:#245169;background:#112b40;color:var(--cyan)}.empty{padding:32px;border:1px dashed #33445d;border-radius:14px;color:var(--muted);text-align:center}.footer{max-width:1440px;margin:0 auto;padding-top:20px;border-top:1px solid var(--line-soft);color:#5f6b81;font:10px var(--mono)}.hidden{display:none!important}@media(max-width:980px){.toolbar{grid-template-columns:minmax(0,1fr) auto}.filters{grid-column:1/-1;overflow-x:auto}.filter{white-space:nowrap}.hero-grid{grid-template-columns:1fr}.hero-aside{grid-template-columns:repeat(2,minmax(0,1fr))}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.masthead{padding-top:24px}.masthead-top{margin-bottom:28px}.masthead-status{font-size:9px}.toolbar{align-items:stretch;grid-template-columns:1fr;padding-top:10px;padding-bottom:10px}.sort{width:100%}.filters{grid-column:auto;overflow-x:auto;flex-wrap:nowrap}.content{padding-top:28px}.project-grid{grid-template-columns:1fr}.summary{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:26px}.metric{padding:13px}.hero-aside{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column;gap:6px}.section-note{text-align:left}}
.project-title{min-width:0;display:flex;align-items:center;gap:9px}.project-glyph{width:25px;height:25px;display:grid;place-items:center;flex:0 0 25px;border:1px solid #2b6076;border-radius:8px;background:#112b40;color:var(--cyan);font:16px/1 var(--mono)}#recent,#projects{scroll-margin-top:90px}
`;
var script = `(()=>{const search=document.getElementById('search');const sort=document.getElementById('sort');const buttons=[...document.querySelectorAll('[data-filter]')];let filter='all';function norm(v){return String(v||'').toLocaleLowerCase()}function reorder(){document.querySelectorAll('[data-grid]').forEach(grid=>{[...grid.children].sort((a,b)=>sort.value==='name'?a.dataset.name.localeCompare(b.dataset.name,'zh-CN'):(b.dataset.date||'').localeCompare(a.dataset.date||'')||a.dataset.name.localeCompare(b.dataset.name,'zh-CN')).forEach(el=>grid.appendChild(el))})}function apply(){const query=norm(search.value).trim();const names=new Set;document.querySelectorAll('[data-project]').forEach(el=>{const attention=el.dataset.attention==='true';const pending=el.dataset.pending==='true';const stale=el.dataset.stale==='true';const risk=el.dataset.risk==='true';const matches=filter==='all'||filter==='attention'&&attention||filter==='pending'&&pending||filter==='stale'&&stale||filter==='risk'&&risk;const show=matches&&(!query||norm(el.dataset.search).includes(query));el.classList.toggle('hidden',!show);if(show)names.add(el.dataset.name)});document.getElementById('empty').classList.toggle('hidden',names.size!==0);document.getElementById('result-count').textContent=names.size+' \u4E2A\u9879\u76EE'}search.addEventListener('input',apply);sort.addEventListener('change',()=>{reorder();apply()});buttons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply()}));reorder();apply()})();`;
function date(value) {
  if (!value) return "\u6682\u65E0\u8BB0\u5F55";
  return value.slice(0, 10);
}
function projectCard(project) {
  const search = [
    project.name,
    project.overview,
    project.latestActivityTitle,
    project.latestConclusion?.title,
    project.latestConclusion?.summary,
    project.nextStep?.title,
    project.risk?.title,
    project.searchText
  ].filter(Boolean).join(" ");
  const badges = [
    project.pendingProposalCount > 0 ? `<span class="badge pending">${project.pendingProposalCount} \u9879\u5F85\u5BA1\u6838</span>` : "",
    project.staleCitationCount > 0 ? `<span class="badge risk">${project.staleCitationCount} \u4E2A\u6765\u6E90\u9700\u6838\u5BF9</span>` : "",
    project.pendingProposalCount === 0 && project.staleCitationCount === 0 ? '<span class="badge ok">\u8BB0\u5F55\u72B6\u6001\u6B63\u5E38</span>' : ""
  ].join("");
  const platformNames = {
    codex: "Codex",
    claude: "Claude",
    antigravity: "Antigravity",
    generic: "\u5176\u4ED6 AI",
    legacy: "\u65E7\u7248\u672C"
  };
  const pending = project.pendingProposals.length > 0 ? `<p class="pending-note">\u5F85\u5BA1\u6838\u6765\u81EA ${project.pendingProposals.map((proposal) => text(platformNames[proposal.platform] ?? proposal.platform)).join("\u3001")}\uFF1A${text(
    project.pendingProposals.flatMap((proposal) => proposal.summaries).slice(0, 3).join("\uFF1B")
  )}</p>` : "";
  return `<a class="project" data-project data-name="${text(project.name)}" data-date="${text(project.latestActivityAt ?? "")}" data-attention="${project.needsAttention}" data-risk="${Boolean(project.risk)}" data-pending="${project.pendingProposalCount > 0}" data-stale="${project.staleCitationCount > 0}" data-search="${text(search)}" href="${text(project.storyPath)}">
    <div class="project-top"><div class="project-title"><span class="project-glyph" aria-hidden="true">\u2301</span><h3>${text(project.name)}</h3></div><span class="date">${date(project.latestActivityAt)}</span></div>
    <p class="overview">${text(project.overview)}</p>
    <div class="facts">
      <div class="fact"><b>\u6700\u8FD1\u505A\u4E86</b><span>${text(project.latestActivityTitle ?? "\u6682\u65E0\u5DF2\u4FDD\u5B58\u7684\u5DE5\u4F5C\u8BB0\u5F55")}</span></div>
      <div class="fact"><b>\u5F53\u524D\u7ED3\u8BBA</b><span>${text(project.latestConclusion?.title ?? "\u6682\u65E0\u5DF2\u786E\u8BA4\u7ED3\u8BBA")}</span></div>
      <div class="fact"><b>\u4E0B\u4E00\u6B65</b><span>${text(project.nextStep?.title ?? "\u6682\u65E0\u5DF2\u786E\u8BA4\u4E0B\u4E00\u6B65")}</span></div>
      <div class="fact"><b>\u98CE\u9669</b><span>${text(project.risk?.title ?? "\u6682\u65E0\u5DF2\u8BB0\u5F55\u98CE\u9669")}</span></div>
    </div>
    ${pending}
    <div class="badges">${badges}</div>
  </a>`;
}
function section(title, note, projects) {
  if (projects.length === 0) return "";
  return `<section class="section"><div class="section-head"><h2>${title}</h2><span class="section-note">${note}</span></div><div class="project-grid" data-grid>${projects.map(projectCard).join("")}</div></section>`;
}
function renderMemoryHubHtml(hub) {
  const csp = [
    "default-src 'none'",
    `style-src 'sha256-${hash(css)}'`,
    `script-src 'sha256-${hash(script)}'`,
    "img-src data:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'"
  ].join("; ");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${text(csp)}"><title>Talo \xB7 \u8BB0\u5FC6\u4E2D\u5FC3</title><style>${css}</style></head><body><div class="shell">
  <header class="masthead"><div class="masthead-inner"><div class="masthead-top"><div class="brand"><span class="brand-mark" aria-hidden="true">\u2318</span><div class="brand-copy"><strong>Talo</strong><span>\u9879\u76EE\u5DE5\u4F5C\u8BB0\u5FC6 \xB7 \u672C\u5730\u7A7A\u95F4</span></div></div><span class="masthead-status"><i class="status-dot"></i>\u672C\u5730 \xB7 \u79C1\u6709 \xB7 \u79BB\u7EBF</span></div><div class="hero-grid"><div><p class="eyebrow">\u9879\u76EE\u603B\u89C8</p><h1>\u9879\u76EE\u8BB0\u5FC6\u4E2D\u5FC3</h1><p class="hero-copy">\u4ECE\u6700\u8FD1\u53D1\u751F\u7684\u5DE5\u4F5C\u5F00\u59CB\uFF0C\u5FEB\u901F\u770B\u6E05\u6BCF\u4E2A\u9879\u76EE\u4E3A\u4EC0\u4E48\u505A\u3001\u505A\u4E86\u4EC0\u4E48\u3001\u4F9D\u636E\u5728\u54EA\u91CC\uFF0C\u4EE5\u53CA\u63A5\u4E0B\u6765\u8981\u5904\u7406\u4EC0\u4E48\u3002</p></div><div class="hero-aside"><a class="hero-link" href="#recent">\u6700\u8FD1\u53D1\u751F<span>\u6309\u65F6\u95F4\u9605\u8BFB \u2192</span></a><a class="hero-link" href="#projects">\u5168\u90E8\u9879\u76EE<span>\u6253\u5F00\u76EE\u5F55 \u2192</span></a></div></div><div class="summary"><div class="metric"><strong>${hub.summary.projectCount}</strong><span>\u5DF2\u6CE8\u518C\u9879\u76EE</span></div><div class="metric"><strong>${hub.summary.memoryCount}</strong><span>\u6B63\u5F0F\u8BB0\u5FC6</span></div><div class="metric"><strong>${hub.summary.pendingProposalCount}</strong><span>\u5F85\u5BA1\u6838</span></div><div class="metric"><strong>${hub.summary.attentionProjectCount}</strong><span>\u9700\u8981\u5173\u6CE8</span></div></div></div></header>
  <div class="toolbar"><input id="search" class="search" aria-label="\u641C\u7D22\u9879\u76EE\u8BB0\u5FC6" placeholder="\u641C\u7D22\u9879\u76EE\u3001\u7ED3\u8BBA\u3001\u4EA7\u51FA\u3001\u6765\u6E90\u8BF4\u660E\u6216\u4E0B\u4E00\u6B65"><select id="sort" class="sort" aria-label="\u9879\u76EE\u6392\u5E8F"><option value="recent">\u6700\u8FD1\u66F4\u65B0</option><option value="name">\u6309\u540D\u79F0</option></select><div class="filters"><button class="filter" data-filter="all" aria-pressed="true">\u5168\u90E8</button><button class="filter" data-filter="attention" aria-pressed="false">\u9700\u8981\u5173\u6CE8</button><button class="filter" data-filter="risk" aria-pressed="false">\u6709\u98CE\u9669</button><button class="filter" data-filter="pending" aria-pressed="false">\u5F85\u5BA1\u6838</button><button class="filter" data-filter="stale" aria-pressed="false">\u6765\u6E90\u5931\u6548</button></div><span id="result-count" class="section-note"></span></div>
  <main class="content"><div id="recent"></div>${section("\u6700\u8FD1\u53D1\u751F", "\u6309\u5B9E\u9645\u5DE5\u4F5C\u65F6\u95F4\u6392\u5E8F", hub.recentProjects)}${section("\u9700\u8981\u5173\u6CE8", "\u98CE\u9669\u3001\u5931\u6548\u6765\u6E90\u6216\u5F85\u5BA1\u6838\u5185\u5BB9", hub.attentionProjects)}${section("\u5F85\u5BA1\u6838", "\u6765\u81EA\u5404\u4E2A AI \u5E73\u53F0\u7684\u5019\u9009\u5185\u5BB9", hub.pendingProjects)}<section id="projects" class="section"><div class="section-head"><h2>\u5168\u90E8\u9879\u76EE</h2><span class="section-note">\u70B9\u51FB\u9879\u76EE\u8FDB\u5165\u5B8C\u6574\u65F6\u95F4\u7EBF</span></div><div class="project-grid" data-grid>${hub.projects.map(projectCard).join("")}</div><div id="empty" class="empty hidden">\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u9879\u76EE\u3002</div></section><footer class="footer">\u751F\u6210\u4E8E ${text(hub.generatedAt)} \xB7 \u672C\u5730\u9759\u6001\u5FEB\u7167 \xB7 \u4E0D\u8FDE\u63A5\u7F51\u7EDC</footer></main>
  </div><template id="hub-data">${text(JSON.stringify({ generatedAt: hub.generatedAt }))}</template><script>${script}</script></body></html>`;
}

// ../../packages/project-memory-core/src/platform-projects.ts
import {
  closeSync,
  existsSync as existsSync7,
  openSync,
  readdirSync as readdirSync5,
  readFileSync as readFileSync6,
  readSync,
  statSync as statSync5
} from "fs";
import { homedir as homedir6 } from "os";
import path8 from "path";
import { fileURLToPath } from "url";
var MAX_CODEX_SESSION_FILES = 2e3;
var MAX_SESSION_META_BYTES = 256 * 1024;
function readFirstLine(filePath) {
  let descriptor = null;
  try {
    descriptor = openSync(filePath, "r");
    const buffer = Buffer.alloc(MAX_SESSION_META_BYTES);
    const bytesRead = readSync(descriptor, buffer, 0, buffer.length, 0);
    const firstLine = buffer.subarray(0, bytesRead).toString("utf8").split("\n", 1)[0];
    return firstLine || null;
  } catch {
    return null;
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}
function listFiles(root, depth = 0, result = []) {
  if (depth > 8 || result.length >= MAX_CODEX_SESSION_FILES || !existsSync7(root)) return result;
  let entries;
  try {
    entries = readdirSync5(root, { encoding: "utf8", withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    if (result.length >= MAX_CODEX_SESSION_FILES) break;
    const entryPath = path8.join(root, entry.name);
    if (entry.isDirectory()) listFiles(entryPath, depth + 1, result);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) result.push(entryPath);
  }
  return result;
}
function normalizeProjectPath(inputPath) {
  try {
    if (!existsSync7(inputPath) || !statSync5(inputPath).isDirectory()) return null;
    return detectGitMetadata(inputPath).rootPath;
  } catch {
    return null;
  }
}
function addCandidate(candidates, candidate) {
  const key = `${candidate.platform}:${candidate.path}`;
  const existing = candidates.get(key);
  if (!existing || (candidate.lastSeenAt ?? "") > (existing.lastSeenAt ?? "")) {
    candidates.set(key, candidate);
  }
}
function scanCodexProjects(options) {
  const homeDir = options.homeDir ?? homedir6();
  const codexHome = options.codexHome ?? process.env.CODEX_HOME ?? path8.join(homeDir, ".codex");
  const sessionRoot = path8.join(codexHome, "sessions");
  const sessionsByPath = /* @__PURE__ */ new Map();
  const candidates = /* @__PURE__ */ new Map();
  for (const sessionPath of listFiles(sessionRoot)) {
    const firstLine = readFirstLine(sessionPath);
    if (!firstLine) continue;
    try {
      const record = JSON.parse(firstLine);
      if (record.type !== "session_meta" || typeof record.payload?.cwd !== "string") continue;
      const existing = sessionsByPath.get(record.payload.cwd);
      if (!existing || (record.timestamp ?? "") > (existing.lastSeenAt ?? "")) {
        sessionsByPath.set(record.payload.cwd, {
          platformProjectId: record.payload.session_id ?? record.payload.id ?? null,
          lastSeenAt: record.timestamp ?? null
        });
      }
    } catch {
    }
  }
  for (const [sessionCwd, session] of sessionsByPath) {
    const projectPath = normalizeProjectPath(sessionCwd);
    if (!projectPath) continue;
    addCandidate(candidates, {
      platform: "codex",
      platformProjectId: session.platformProjectId,
      name: path8.basename(projectPath),
      path: projectPath,
      lastSeenAt: session.lastSeenAt,
      source: "codex-session"
    });
  }
  return [...candidates.values()];
}
function scanAntigravityProjects(options) {
  const homeDir = options.homeDir ?? homedir6();
  const geminiHome = options.geminiHome ?? process.env.GEMINI_HOME ?? path8.join(homeDir, ".gemini");
  const configRoot2 = path8.join(geminiHome, "config", "projects");
  const candidates = /* @__PURE__ */ new Map();
  let entries;
  try {
    entries = readdirSync5(configRoot2, { encoding: "utf8", withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const filePath = path8.join(configRoot2, entry.name);
    try {
      const config = JSON.parse(readFileSync6(filePath, "utf8"));
      for (const resource of config.projectResources?.resources ?? []) {
        if (typeof resource.folderUri !== "string") continue;
        let requestedPath;
        try {
          requestedPath = resource.folderUri.startsWith("file:") ? fileURLToPath(resource.folderUri) : resource.folderUri;
        } catch {
          continue;
        }
        const projectPath = normalizeProjectPath(requestedPath);
        if (!projectPath) continue;
        addCandidate(candidates, {
          platform: "antigravity",
          platformProjectId: config.id ?? path8.basename(entry.name, ".json"),
          name: config.name?.trim() || path8.basename(projectPath),
          path: projectPath,
          lastSeenAt: config.updatedAt ?? null,
          source: "antigravity-config"
        });
      }
    } catch {
    }
  }
  return [...candidates.values()];
}
function scanClaudeProjects(options) {
  const homeDir = options.homeDir ?? homedir6();
  const claudeHome = options.claudeHome ?? process.env.CLAUDE_HOME ?? path8.join(homeDir, ".claude");
  const sessionRoot = path8.join(claudeHome, "projects");
  const sessionsByPath = /* @__PURE__ */ new Map();
  const candidates = /* @__PURE__ */ new Map();
  for (const sessionPath of listFiles(sessionRoot)) {
    let descriptor = null;
    try {
      descriptor = openSync(sessionPath, "r");
      const buffer = Buffer.alloc(MAX_SESSION_META_BYTES);
      const bytesRead = readSync(descriptor, buffer, 0, buffer.length, 0);
      for (const line of buffer.subarray(0, bytesRead).toString("utf8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const record = JSON.parse(line);
          if (typeof record.cwd !== "string") continue;
          const existing = sessionsByPath.get(record.cwd);
          if (!existing || (record.timestamp ?? "") > (existing.lastSeenAt ?? "")) {
            sessionsByPath.set(record.cwd, {
              platformProjectId: record.sessionId ?? record.session_id ?? null,
              lastSeenAt: record.timestamp ?? null
            });
          }
        } catch {
        }
      }
    } catch {
    } finally {
      if (descriptor !== null) closeSync(descriptor);
    }
  }
  for (const [sessionCwd, session] of sessionsByPath) {
    const projectPath = normalizeProjectPath(sessionCwd);
    if (!projectPath) continue;
    addCandidate(candidates, {
      platform: "claude",
      platformProjectId: session.platformProjectId,
      name: path8.basename(projectPath),
      path: projectPath,
      lastSeenAt: session.lastSeenAt,
      source: "claude-session"
    });
  }
  return [...candidates.values()];
}
function discoverDesktopPlatformProjects(options = {}) {
  const candidates = [
    ...scanCodexProjects(options),
    ...scanClaudeProjects(options),
    ...scanAntigravityProjects(options)
  ];
  return candidates.sort(
    (left, right) => left.platform.localeCompare(right.platform) || left.name.localeCompare(right.name, "zh-CN") || left.path.localeCompare(right.path)
  );
}
function buildDesktopPlatformInventory(candidates, registeredProjects, hubProjects) {
  const hubById = new Map(hubProjects.map((project) => [project.projectId, project]));
  const registeredByPath = new Map(
    registeredProjects.map((project) => [project.primaryPath, project])
  );
  const projects = candidates.map((candidate) => {
    const registered = registeredByPath.get(candidate.path) ?? null;
    const hubProject = registered ? hubById.get(registered.id) : null;
    return {
      ...candidate,
      registered: Boolean(registered),
      registeredProjectId: registered?.id ?? null,
      memoryCount: hubProject?.memoryCount ?? 0
    };
  });
  const groups = ["codex", "claude", "antigravity"].map(
    (platform) => {
      const platformProjects = projects.filter((project) => project.platform === platform);
      return {
        platform,
        displayName: platform === "codex" ? "Codex" : platform === "claude" ? "Claude Code" : "Antigravity",
        projectCount: platformProjects.length,
        registeredCount: platformProjects.filter((project) => project.registered).length,
        unregisteredCount: platformProjects.filter((project) => !project.registered).length,
        projects: platformProjects
      };
    }
  );
  return { generatedAt: (/* @__PURE__ */ new Date()).toISOString(), platforms: groups };
}

// ../../packages/project-memory-core/src/types.ts
var MEMORY_KINDS = [
  "architecture",
  "decision",
  "workflow",
  "convention",
  "pitfall",
  "status"
];
var MEMORY_PHASES = [
  "context",
  "data_collection",
  "analysis",
  "decision",
  "execution",
  "verification",
  "handoff",
  "learning",
  "risk",
  "next_step",
  "other"
];
var BRIEF_ROLES = ["conclusion", "progress", "risk", "next_step", "reference"];
var CITATION_ROLES = ["evidence", "report", "workflow", "reference"];
var RELATION_TYPES = [
  "related_to",
  "observes",
  "causes",
  "depends_on",
  "supports",
  "contradicts",
  "supersedes",
  "derived_from"
];

// ../../packages/project-memory-core/src/view.ts
import { createHash as createHash4 } from "crypto";
import { existsSync as existsSync8, readFileSync as readFileSync7 } from "fs";
import path9 from "path";
import { fileURLToPath as fileURLToPath2, pathToFileURL } from "url";

// ../../packages/project-memory-core/src/event-metadata.ts
var DATE_SEGMENT = /^20\d{2}-\d{2}-\d{2}$/u;
var RUN_ID_PATTERNS = [
  /\brun[_ -]?id\s*[:=：]\s*([A-Za-z0-9._:/-]+)/iu,
  /\brunId\s*[:=：]\s*([A-Za-z0-9._:/-]+)/u,
  /运行批次\s*[:：]?\s*([A-Za-z0-9._:/-]+)/u
];
var PHASE_RULES = [
  ["learning", /(SOP|规范|规则|标准|手册)/iu],
  ["data_collection", /(报表|报告|下载|补数|补齐|采集|抓取|落盘|数据缺失|原始数据)/iu],
  ["verification", /(验证|复核|纠偏|验收|确认结果|回归)/iu],
  ["analysis", /(复盘|对账|诊断|分析|核对|排查|周报)/iu],
  ["decision", /(动作方案|方案|决策|授权|确定|选择|批准)/iu],
  ["execution", /(执行|上线|修改|补救|实施|调整|发布)/iu],
  ["learning", /流程/iu],
  ["handoff", /(交接|移交|交付)/iu],
  ["risk", /(风险|阻塞|注意|缺口|隐患)/iu],
  ["next_step", /(下一步|待办|后续动作)/iu]
];
function compact(value) {
  return (value ?? "").replaceAll(/\s+/gu, " ").trim();
}
function dateKey(input) {
  const occurredAt = input.narrative?.occurredAt;
  const value = occurredAt ?? input.createdAt ?? input.updatedAt;
  if (!value) return null;
  const match = value.match(/^(20\d{2}-\d{2}-\d{2})/u);
  return match?.[1] ?? null;
}
function extractRunId(input) {
  const text2 = [
    input.summary,
    input.content,
    input.narrative?.reason,
    input.narrative?.action,
    input.narrative?.outcome,
    input.narrative?.conclusion
  ].map((value) => compact(value)).join(" ");
  for (const pattern of RUN_ID_PATTERNS) {
    const match = text2.match(pattern);
    if (match?.[1]) return match[1].replace(/[),.;，。；）】]+$/u, "");
  }
  return null;
}
function extractStableWorkUnit(sourcePath) {
  const segments = compact(sourcePath).split(/[\\/]+/u).filter(Boolean);
  const dateIndex = segments.findIndex((segment) => DATE_SEGMENT.test(segment));
  if (dateIndex >= 1) return `${segments[dateIndex - 1]}/${segments[dateIndex]}`;
  return null;
}
function inferredPhase(input) {
  if (input.phase) return input.phase;
  const primaryText = [input.title, input.narrative?.action, input.narrative?.conclusion].map((value) => compact(value)).join(" ");
  const primaryPhase = PHASE_RULES.find(([, pattern]) => pattern.test(primaryText))?.[0];
  if (primaryPhase) return primaryPhase;
  const secondaryText = [
    input.summary,
    input.content,
    input.topic,
    input.narrative?.reason,
    input.narrative?.outcome
  ].map((value) => compact(value)).join(" ");
  return PHASE_RULES.find(([, pattern]) => pattern.test(secondaryText))?.[0] ?? "other";
}
function directMetadata(input) {
  const explicitWorkUnitId = compact(input.workUnitId) || null;
  const explicitRunId = compact(input.runId) || null;
  if (explicitWorkUnitId) {
    return {
      workUnitId: explicitWorkUnitId,
      runId: explicitRunId,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: "explicit"
    };
  }
  const runId = explicitRunId ?? extractRunId(input);
  if (runId) {
    return {
      workUnitId: `run:${runId}`,
      runId,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: explicitRunId ? "explicit" : "run_id"
    };
  }
  const workUnit = extractStableWorkUnit(input.sourcePath) ?? input.citations?.map((citation) => extractStableWorkUnit(citation.sourcePath)).find(Boolean) ?? null;
  if (workUnit) {
    return {
      workUnitId: `source:${workUnit}`,
      runId: null,
      phase: inferredPhase(input),
      sequence: input.sequence ?? null,
      groupingEvidence: "source_path"
    };
  }
  return {
    workUnitId: null,
    runId: null,
    phase: inferredPhase(input),
    sequence: input.sequence ?? null,
    groupingEvidence: "none"
  };
}
function resolveEventMetadata(inputs, relations = []) {
  const result = new Map(inputs.map((input) => [input.id, directMetadata(input)]));
  const byId = new Map(inputs.map((input) => [input.id, input]));
  const relationNeighbors = /* @__PURE__ */ new Map();
  for (const relation of relations) {
    if (!byId.has(relation.fromMemoryId) || !byId.has(relation.toMemoryId)) continue;
    if (!relationNeighbors.has(relation.fromMemoryId))
      relationNeighbors.set(relation.fromMemoryId, /* @__PURE__ */ new Set());
    if (!relationNeighbors.has(relation.toMemoryId))
      relationNeighbors.set(relation.toMemoryId, /* @__PURE__ */ new Set());
    relationNeighbors.get(relation.fromMemoryId)?.add(relation.toMemoryId);
    relationNeighbors.get(relation.toMemoryId)?.add(relation.fromMemoryId);
    const from = byId.get(relation.fromMemoryId);
    const to = byId.get(relation.toMemoryId);
    const fromMetadata = result.get(relation.fromMemoryId);
    const toMetadata = result.get(relation.toMemoryId);
    if (!from || !to || !fromMetadata || !toMetadata || fromMetadata.workUnitId || toMetadata.workUnitId)
      continue;
    const sameTopic = compact(from.topic) && compact(from.topic) === compact(to.topic);
    const sameDate = dateKey(from) === dateKey(to);
    if (sameTopic || sameDate) {
      const workUnitId = `relation:${[from.id, to.id].sort().join(":")}`;
      fromMetadata.workUnitId = workUnitId;
      toMetadata.workUnitId = workUnitId;
      fromMetadata.groupingEvidence = "formal_relation";
      toMetadata.groupingEvidence = "formal_relation";
    }
  }
  for (const input of inputs) {
    const current = result.get(input.id);
    if (!current || current.workUnitId) continue;
    const candidates = [...relationNeighbors.get(input.id) ?? []].map((id) => ({ id, metadata: result.get(id), input: byId.get(id) })).filter((candidate) => candidate.metadata?.workUnitId && candidate.input).filter((candidate) => {
      const sameTopic = compact(candidate.input?.topic) && compact(candidate.input?.topic) === compact(input.topic);
      const sameDate = dateKey(candidate.input) === dateKey(input);
      return sameTopic || sameDate;
    });
    const groups = [
      ...new Set(candidates.map((candidate) => candidate.metadata?.workUnitId).filter(Boolean))
    ];
    if (groups.length === 1) {
      current.workUnitId = groups[0] ?? null;
      current.groupingEvidence = "formal_relation";
    }
  }
  const grouped = /* @__PURE__ */ new Map();
  for (const input of inputs) {
    const metadata = result.get(input.id);
    if (!metadata?.workUnitId) continue;
    const list = grouped.get(metadata.workUnitId) ?? [];
    list.push({ input, metadata });
    grouped.set(metadata.workUnitId, list);
  }
  for (const list of grouped.values()) {
    list.sort((left, right) => {
      const leftTime = left.input.narrative?.occurredAt ?? left.input.createdAt ?? left.input.updatedAt ?? "";
      const rightTime = right.input.narrative?.occurredAt ?? right.input.createdAt ?? right.input.updatedAt ?? "";
      return leftTime.localeCompare(rightTime) || left.input.id.localeCompare(right.input.id);
    });
    list.forEach((entry, index) => {
      if (entry.metadata.sequence === null) entry.metadata.sequence = index + 1;
    });
  }
  return result;
}
function resolveMemoryEventMetadata(memories, relations = []) {
  return resolveEventMetadata(memories, relations);
}

// ../../packages/project-memory-core/src/view.ts
var RELATION_LABELS2 = {
  related_to: "\u76F8\u5173",
  observes: "\u6CE8\u610F\u5230",
  causes: "\u539F\u56E0",
  depends_on: "\u4F9D\u8D56",
  supports: "\u652F\u6301",
  contradicts: "\u77DB\u76FE",
  supersedes: "\u66FF\u4EE3",
  derived_from: "\u6765\u6E90\u4E8E"
};
function relationSentence(relation, fromTitle, toTitle) {
  switch (relation.type) {
    case "related_to":
      return `\u300A${fromTitle}\u300B\u4E0E\u300A${toTitle}\u300B\u6709\u5173\u8054`;
    case "observes":
      return `\u300A${fromTitle}\u300B\u6CE8\u610F\u5230\u300A${toTitle}\u300B`;
    case "causes":
      return `\u300A${fromTitle}\u300B\u662F\u300A${toTitle}\u300B\u7684\u539F\u56E0`;
    case "depends_on":
      return `\u300A${fromTitle}\u300B\u4F9D\u8D56\u300A${toTitle}\u300B`;
    case "supports":
      return `\u300A${fromTitle}\u300B\u4E3A\u300A${toTitle}\u300B\u63D0\u4F9B\u652F\u6301`;
    case "contradicts":
      return `\u300A${fromTitle}\u300B\u4E0E\u300A${toTitle}\u300B\u5B58\u5728\u77DB\u76FE`;
    case "supersedes":
      return `\u300A${fromTitle}\u300B\u66FF\u4EE3\u300A${toTitle}\u300B`;
    case "derived_from":
      return `\u300A${fromTitle}\u300B\u7684\u4F9D\u636E\u6765\u81EA\u300A${toTitle}\u300B`;
  }
}
var CITATION_LABELS = {
  evidence: "\u8BC1\u636E",
  report: "\u62A5\u544A",
  workflow: "\u6D41\u7A0B",
  reference: "\u53C2\u8003"
};
function summaryFor(memory) {
  const value = memory.summary ?? memory.content.split(/[。！？.!?]\s*/u)[0] ?? memory.content;
  return value.trim().slice(0, 140);
}
function markdownText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|");
}
function renderGraphMarkdown(projectName, graph, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), providedGuide, providedBrief) {
  const projectId = providedGuide?.projectId ?? graph.nodes[0]?.projectId ?? "unknown-project";
  const guide = providedGuide ?? analyzeKnowledgeGraph(projectId, projectName, graph, generatedAt, 12);
  const brief = providedBrief ?? buildProjectBrief(projectId, projectName, graph, guide, generatedAt, 12);
  const memoryById = new Map(graph.nodes.map((memory) => [memory.id, memory]));
  const lines = [
    `# ${projectName} \u9879\u76EE\u8BB0\u5FC6`,
    "",
    `> \u9759\u6001\u5FEB\u7167\uFF1A${generatedAt}`,
    "",
    "## \u9879\u76EE\u4EA4\u63A5",
    "",
    brief.handoff.coverage,
    "",
    "## \u4ECE\u8FD9\u91CC\u5F00\u59CB",
    ""
  ];
  if (brief.handoff.startHere.length === 0) lines.push("- \u6682\u65E0\u5DF2\u4FDD\u5B58\u7684\u5DE5\u4F5C\u8BB0\u5F55");
  else {
    for (const item of brief.handoff.startHere) {
      lines.push(
        `- **${markdownText(item.displayTitle)}**\uFF1A${markdownText(item.reason)} ${markdownText(item.summary)}`
      );
    }
  }
  lines.push("", "## \u6700\u8FD1\u53D1\u751F\u4E86\u4EC0\u4E48", "");
  if (brief.handoff.recentWork.length === 0) lines.push("- \u6682\u65E0\u53EF\u7528\u4E8E\u65F6\u95F4\u7EBF\u7684\u5DE5\u4F5C\u8BB0\u5F55");
  else {
    for (const item of brief.handoff.recentWork) {
      lines.push(
        `- **${item.occurredAt ? item.occurredAt.slice(0, 10) : "\u8BB0\u5F55\u65F6\u95F4\u672A\u77E5"} \xB7 ${markdownText(item.displayTitle)}**\uFF1A${markdownText(item.narrative?.outcome ?? "\u65E7\u8BB0\u5F55\u5C1A\u672A\u8865\u5168\u4EA7\u51FA\u4FE1\u606F")}`
      );
    }
  }
  lines.push("", "## \u5F53\u524D\u72B6\u6001", "");
  lines.push("## \u5F53\u524D\u7ED3\u8BBA", "");
  const appendItems = (items, empty) => {
    if (items.length === 0) lines.push(`- ${empty}`);
    else {
      for (const item of items) {
        lines.push(`- **${markdownText(item.displayTitle)}**\uFF1A${markdownText(item.summary)}`);
      }
    }
  };
  appendItems(brief.currentConclusions, "\u6682\u65E0\u5F53\u524D\u7ED3\u8BBA");
  lines.push("", "## \u5DF2\u5B8C\u6210\u5DE5\u4F5C", "");
  appendItems(brief.completedWork, "\u6682\u65E0\u5DF2\u5B8C\u6210\u5DE5\u4F5C");
  lines.push("", "## \u98CE\u9669\u4E0E\u8BC1\u636E\u8FB9\u754C", "");
  appendItems(brief.risks, "\u6682\u65E0\u5DF2\u8BB0\u5F55\u98CE\u9669");
  lines.push("", "## \u4E0B\u4E00\u6B65", "");
  appendItems(brief.nextSteps, "\u6682\u65E0\u5DF2\u786E\u8BA4\u7684\u4E0B\u4E00\u6B65");
  if (brief.systemSuggestions.length > 0) {
    lines.push("", "**\u7CFB\u7EDF\u5EFA\u8BAE\uFF08\u672A\u7ECF\u5BA1\u6838\uFF09**", "");
    for (const suggestion of brief.systemSuggestions) {
      lines.push(`- ${markdownText(suggestion.text)} \xB7 ${markdownText(suggestion.reason)}`);
    }
  }
  lines.push("", "## \u63A8\u8350\u9605\u8BFB", "");
  if (brief.recommendedReading.length === 0) lines.push("- \u6682\u65E0\u63A8\u8350");
  else {
    for (const item of brief.recommendedReading) {
      lines.push(
        `- **${markdownText(item.displayTitle)}**\uFF1A${markdownText(item.reasons.join("\uFF1B"))}`
      );
    }
  }
  if (brief.topics.length > 0) {
    lines.push("", "## \u5171\u4EAB\u4E3B\u9898", "");
    for (const topic of brief.topics) {
      lines.push(`- **${markdownText(topic.name)}**\uFF1A${topic.memoryCount} \u6761\u8BB0\u5FC6`);
    }
  }
  lines.push("", "## \u6765\u6E90\u72B6\u6001", "");
  lines.push(
    `- ${brief.summary.citationCount} \u4E2A\u53EF\u8FFD\u6EAF\u6765\u6E90 \xB7 ${brief.summary.staleCitationCount} \u4E2A\u5931\u6548\u6765\u6E90 \xB7 ${brief.summary.staleMemoryCount} \u6761\u8FC7\u671F\u8BB0\u5FC6`
  );
  lines.push("", "## \u5F85\u5BA1\u6838\u5173\u8054\u7EBF\u7D22", "");
  if (guide.relationSuggestions.length === 0) lines.push("- \u6682\u65E0\u5173\u8054\u7EBF\u7D22");
  else {
    for (const suggestion of guide.relationSuggestions) {
      const from = memoryById.get(suggestion.fromMemoryId);
      const to = memoryById.get(suggestion.toMemoryId);
      lines.push(
        `- **${markdownText(from ? buildMemoryDisplayTitle(from) : "\u5DF2\u6709\u8BB0\u5FC6")}** \u4E0E **${markdownText(to ? buildMemoryDisplayTitle(to) : "\u5DF2\u6709\u8BB0\u5FC6")}** \u53EF\u80FD\u76F8\u5173\uFF1A${markdownText(suggestion.rationale)}`
      );
    }
  }
  lines.push("", "## \u8BB0\u5FC6\u8BE6\u60C5", "");
  for (const memory of graph.nodes) {
    lines.push(
      `### ${markdownText(buildMemoryDisplayTitle(memory))}${memory.stale ? " [\u5DF2\u8FC7\u671F]" : ""}`,
      "",
      `- \u4E3B\u9898\uFF1A${markdownText(memory.topic ?? "\u672A\u5206\u7EC4")}`,
      `- \u539F\u59CB\u6807\u9898\uFF1A${markdownText(memory.title)}`,
      `- \u9996\u9875\u4F4D\u7F6E\uFF1A${memory.briefRole ?? "\u6839\u636E\u8BB0\u5FC6\u7C7B\u578B\u81EA\u52A8\u5F52\u7C7B"}`,
      `- \u7C7B\u578B\uFF1A${memory.kind}`,
      `- \u6458\u8981\uFF1A${markdownText(summaryFor(memory))}`,
      `- \u7F6E\u4FE1\u5EA6\uFF1A${memory.confidence}`,
      `- \u66F4\u65B0\u65F6\u95F4\uFF1A${memory.updatedAt}`,
      "",
      memory.content,
      "",
      "**\u8FD9\u9879\u5DE5\u4F5C\u600E\u4E48\u53D1\u751F\u7684**",
      ""
    );
    if (!memory.narrative) {
      lines.push("- \u65E7\u8BB0\u5F55\u5C1A\u672A\u8865\u5168\u8FD9\u9879\u4FE1\u606F\u3002", "");
    } else {
      lines.push(
        `- \u65E5\u671F\uFF1A${memory.narrative.occurredAt.slice(0, 10)}`,
        `- \u505A\u4E86\u4EC0\u4E48\uFF1A${markdownText(memory.narrative.action)}`,
        `- \u4E3A\u4EC0\u4E48\u505A\uFF1A${markdownText(memory.narrative.reason)}`,
        `- \u4EA7\u51FA\u4E86\u4EC0\u4E48\uFF1A${markdownText(memory.narrative.outcome)}`,
        `- \u73B0\u5728\u610F\u5473\u7740\u4EC0\u4E48\uFF1A${markdownText(memory.narrative.conclusion)}`,
        ""
      );
    }
    lines.push("**\u6765\u6E90**", "");
    if (memory.citations.length === 0) {
      lines.push("- \u65E0\u5DF2\u8BB0\u5F55\u6765\u6E90");
    } else {
      for (const citation of memory.citations) {
        const locator = citation.locator ? ` \xB7 ${markdownText(citation.locator)}` : "";
        const stale = citation.stale ? ` \xB7 \u5DF2\u8FC7\u671F\uFF1A${citation.staleReason}` : "";
        lines.push(
          "- " + CITATION_LABELS[citation.role] + " \xB7 " + markdownText(`${citation.sourceProjectName}/${citation.sourcePath}`) + locator + stale + (citation.note ? ` \xB7 ${markdownText(citation.note)}` : "")
        );
      }
    }
    const connected = graph.relations.filter(
      (relation) => relation.fromMemoryId === memory.id || relation.toMemoryId === memory.id
    );
    lines.push("", "**\u5173\u7CFB**", "");
    if (connected.length === 0) {
      lines.push("- \u65E0\u5DF2\u8BB0\u5F55\u5173\u7CFB");
    } else {
      for (const relation of connected) {
        const from = graph.nodes.find((candidate) => candidate.id === relation.fromMemoryId);
        const to = graph.nodes.find((candidate) => candidate.id === relation.toMemoryId);
        lines.push(
          `- ${markdownText(relationSentence(relation, from ? buildMemoryDisplayTitle(from) : "\u5DF2\u6709\u8BB0\u5FC6", to ? buildMemoryDisplayTitle(to) : "\u5DF2\u6709\u8BB0\u5FC6"))}\uFF1A${markdownText(relation.rationale)} \xB7 ${RELATION_LABELS2[relation.type]} \xB7 ${relation.confidence}`
        );
      }
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}
`;
}
function buildGraphViewData(projectName, graph, generatedAt, guide, brief) {
  const eventMetadata = resolveMemoryEventMetadata(graph.nodes, graph.relations);
  const contextualTitles = buildContextualMemoryDisplayTitles(
    graph.nodes.map((memory) => ({
      ...memory,
      sequence: eventMetadata.get(memory.id)?.sequence ?? memory.sequence
    }))
  );
  return {
    projectName,
    generatedAt,
    hubUrl: pathToFileURL(resolveMemoryHubPath()).href,
    guide,
    brief,
    memories: graph.nodes.map((memory) => ({
      id: memory.id,
      projectId: memory.projectId,
      projectName: memory.projectName,
      kind: memory.kind,
      title: memory.title,
      displayTitle: contextualTitles.get(memory.id) ?? buildMemoryDisplayTitle(memory),
      summary: memory.summary,
      topic: memory.topic,
      briefRole: memory.briefRole,
      workUnitId: eventMetadata.get(memory.id)?.workUnitId ?? null,
      runId: eventMetadata.get(memory.id)?.runId ?? null,
      phase: eventMetadata.get(memory.id)?.phase ?? "other",
      sequence: eventMetadata.get(memory.id)?.sequence ?? null,
      narrative: memory.narrative ?? null,
      content: memory.content,
      tags: memory.tags,
      citations: memory.citations.map((citation) => ({
        sourceProjectId: citation.sourceProjectId,
        sourceProjectName: citation.sourceProjectName,
        sourcePath: citation.sourcePath,
        role: citation.role,
        locator: citation.locator,
        note: citation.note,
        sourceCommit: citation.sourceCommit,
        stale: citation.stale,
        staleReason: citation.staleReason,
        accessible: citation.accessible,
        fileUrl: citation.accessible ? citation.fileUrl : null
      })),
      submittedBy: memory.submittedBy ?? null,
      sourceProposalId: memory.sourceProposalId ?? null,
      confidence: memory.confidence,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      stale: memory.stale,
      staleReason: memory.staleReason
    })),
    relations: graph.relations.map((relation) => ({
      id: relation.id,
      fromMemoryId: relation.fromMemoryId,
      toMemoryId: relation.toMemoryId,
      type: relation.type,
      rationale: relation.rationale,
      confidence: relation.confidence
    }))
  };
}
function htmlText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function htmlAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function browserAsset(name) {
  const moduleDir = path9.dirname(fileURLToPath2(import.meta.url));
  const candidates = [
    path9.join(moduleDir, "browser", name),
    path9.resolve(moduleDir, "..", "dist", "browser", name),
    path9.resolve(moduleDir, "../../../plugins/codex-project-memory/dist/browser", name),
    path9.resolve(process.cwd(), "dist", "browser", name)
  ];
  const assetPath = candidates.find((candidate) => existsSync8(candidate));
  if (!assetPath) {
    throw new Error(`Browser asset ${name} is missing. Run pnpm build:browser first.`);
  }
  return readFileSync7(assetPath, "utf8");
}
function contentHash(value) {
  return createHash4("sha256").update(value).digest("base64");
}
function renderGraphHtml(projectName, graph, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), providedGuide, providedBrief) {
  const projectId = providedGuide?.projectId ?? graph.nodes[0]?.projectId ?? "unknown-project";
  const guide = providedGuide ?? analyzeKnowledgeGraph(projectId, projectName, graph, generatedAt, 12);
  const brief = providedBrief ?? buildProjectBrief(projectId, projectName, graph, guide, generatedAt, 12);
  const data = buildGraphViewData(projectName, graph, generatedAt, guide, brief);
  const css2 = browserAsset("graph-app.css").replaceAll("</style", "<\\/style");
  const script2 = browserAsset("graph-app.js").replaceAll("</script", "<\\/script");
  const csp = [
    "default-src 'none'",
    `style-src 'sha256-${contentHash(css2)}'`,
    `script-src 'sha256-${contentHash(script2)}'`,
    "img-src data:",
    "font-src 'none'",
    "connect-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "worker-src 'none'"
  ].join("; ");
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${htmlAttribute(csp)}">
<title>${htmlText(projectName)} \xB7 \u9879\u76EE\u8BB0\u5FC6</title>
<style>${css2}</style>
</head>
<body>
<div id="app"></div>
<template id="graph-data">${htmlText(JSON.stringify(data))}</template>
<script>${script2}</script>
</body>
</html>
`;
}

// ../../packages/project-memory-core/src/service.ts
var MAX_CANDIDATES = 20;
var MAX_UPDATE_CANDIDATES = 20;
var MAX_TITLE_LENGTH = 200;
var MAX_CONTENT_LENGTH = 5e3;
var MAX_SUMMARY_LENGTH = 300;
var MAX_TOPIC_LENGTH = 120;
var MAX_CITATIONS = 12;
var MAX_CITATION_LOCATOR_LENGTH = 240;
var MAX_CITATION_NOTE_LENGTH = 500;
var MAX_NARRATIVE_FIELD_LENGTH = 1600;
var MAX_OUTPUTS = 12;
var MAX_OUTPUT_LABEL_LENGTH = 240;
var MAX_TAGS = 20;
var MAX_TAG_LENGTH = 50;
var MAX_RELATION_CANDIDATES = 40;
var MAX_RELATION_RATIONALE_LENGTH = 1e3;
var MAX_GRAPH_NODES = 100;
var MAX_GRAPH_DEPTH = 5;
var MAX_PATH_DEPTH = 8;
var MAX_RECALL_LIMIT = 20;
var MAX_RECALL_RECOMMEND = 5;
var MAX_RETRIEVAL_BUDGET = 16e3;
var MAX_GET_MEMORY_IDS = 20;
var SYMMETRIC_RELATION_TYPES = /* @__PURE__ */ new Set(["related_to", "contradicts"]);
var RELATION_LABELS3 = {
  related_to: "\u76F8\u5173",
  observes: "\u6CE8\u610F\u5230",
  causes: "\u539F\u56E0",
  depends_on: "\u4F9D\u8D56",
  supports: "\u652F\u6301",
  contradicts: "\u77DB\u76FE",
  supersedes: "\u66FF\u4EE3",
  derived_from: "\u6765\u6E90\u4E8E"
};
function desktopHubBriefItem(memory, briefRole) {
  return {
    memoryId: memory.id,
    title: memory.title,
    displayTitle: buildMemoryDisplayTitle(memory),
    summary: memory.summary ?? memory.narrative?.conclusion ?? memory.content.slice(0, MAX_SUMMARY_LENGTH),
    topic: memory.topic,
    briefRole,
    roleSource: memory.briefRole ? "reviewed" : "inferred",
    stale: memory.stale,
    citationCount: memory.citations.length,
    updatedAt: memory.updatedAt,
    occurredAt: memory.narrative?.occurredAt ?? null,
    narrative: memory.narrative ?? null
  };
}
var ProjectMemoryService = class {
  constructor(store, dataDir) {
    this.store = store;
    this.dataDir = dataDir;
    this.denyPatterns = loadLocalConfig(dataDir).denyPatterns;
  }
  store;
  dataDir;
  denyPatterns;
  detectProject(inputPath) {
    let metadata;
    try {
      metadata = detectGitMetadata(inputPath);
    } catch (error) {
      throw new ProjectMemoryError("INVALID_INPUT", "Project path cannot be resolved.", {
        path: inputPath,
        cause: error instanceof Error ? error.message : String(error)
      });
    }
    const registeredProject = this.store.getProjectByPath(metadata.rootPath);
    const relocationCandidates = registeredProject ? [] : this.store.findRelocationCandidates(metadata.gitCommonDir, metadata.remoteUrl).filter((project) => project.primaryPath !== metadata.rootPath);
    return {
      requestedPath: inputPath,
      rootPath: metadata.rootPath,
      name: basename(metadata.rootPath),
      isGit: metadata.isGit,
      gitCommonDir: metadata.gitCommonDir,
      remoteUrl: metadata.remoteUrl,
      headCommit: metadata.headCommit,
      registeredProject: registeredProject ? this.store.getProject(registeredProject.id) : null,
      relocationCandidates
    };
  }
  registerProject(inputPath, name, relinkProjectId) {
    const detected = this.detectProject(inputPath);
    if (detected.registeredProject) {
      this.store.touchProject(
        detected.registeredProject.id,
        detected.rootPath,
        detected.headCommit
      );
      return this.store.getProject(detected.registeredProject.id);
    }
    if (detected.relocationCandidates.length > 0 && !relinkProjectId) {
      throw new ProjectMemoryError(
        "RELINK_CONFIRMATION_REQUIRED",
        "This path resembles an existing project. Confirm whether it should be relinked.",
        { candidates: detected.relocationCandidates }
      );
    }
    if (relinkProjectId && !detected.relocationCandidates.some((candidate) => candidate.id === relinkProjectId)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Relink target is not a detected candidate.", {
        relinkProjectId
      });
    }
    const projectName = (name ?? detected.name).trim();
    if (!projectName || projectName.length > 120) {
      throw new ProjectMemoryError("INVALID_INPUT", "Project name must be 1-120 characters.");
    }
    return this.store.registerProject({
      name: projectName,
      primaryPath: detected.rootPath,
      isGit: detected.isGit,
      gitCommonDir: detected.gitCommonDir,
      remoteUrl: detected.remoteUrl,
      headCommit: detected.headCommit,
      ...relinkProjectId ? { relinkProjectId } : {}
    });
  }
  projectStatus(projectId) {
    const project = this.store.requireProject(projectId);
    const memories = this.getContext(projectId, 1e3);
    let current = null;
    try {
      current = this.detectProject(project.primaryPath);
    } catch {
      current = null;
    }
    return {
      project: this.store.getProject(projectId),
      links: this.store.listLinks(projectId),
      pathAvailable: current !== null,
      currentDetection: current,
      pendingProposals: this.store.countPendingProposals(projectId),
      memoryCount: memories.length,
      lastMemoryUpdatedAt: memories[0]?.updatedAt ?? null
    };
  }
  linkProjects(sourceProjectId, targetProjectId) {
    this.store.linkProjects(sourceProjectId, targetProjectId);
    return { sourceProjectId, targetProjectId, access: "read" };
  }
  unlinkProjects(sourceProjectId, targetProjectId) {
    this.store.unlinkProjects(sourceProjectId, targetProjectId);
    return { sourceProjectId, targetProjectId, removed: true };
  }
  requireReadAccess(sourceProjectId, targetProjectId) {
    this.store.requireProject(sourceProjectId);
    this.store.requireProject(targetProjectId);
    if (!this.store.hasReadAccess(sourceProjectId, targetProjectId)) {
      throw new ProjectMemoryError(
        "LINK_REQUIRED",
        "A read-only project link is required before cross-project access.",
        { sourceProjectId, targetProjectId }
      );
    }
  }
  enrichStaleness(memory) {
    const storedCitations = memory.citations.length > 0 ? memory.citations : this.legacyCitation(memory);
    if (storedCitations.length === 0) return memory;
    const citations = storedCitations.map(
      (citation) => this.enrichCitation(memory.projectId, citation)
    );
    const staleCitation = citations.find((citation) => citation.stale);
    return {
      ...memory,
      citations,
      stale: Boolean(staleCitation),
      staleReason: staleCitation?.staleReason ?? null
    };
  }
  legacyCitation(memory) {
    if (!memory.sourceProjectId || !memory.sourcePath || !memory.sourceFileHash) return [];
    return [
      {
        sourceProjectId: memory.sourceProjectId,
        sourceProjectName: "",
        sourcePath: memory.sourcePath,
        role: "reference",
        locator: null,
        note: "\u7531\u65E7\u7248 sourcePath \u517C\u5BB9\u751F\u6210",
        sourceCommit: memory.sourceCommit,
        sourceFileHash: memory.sourceFileHash,
        stale: false,
        staleReason: null,
        accessible: true,
        fileUrl: null
      }
    ];
  }
  enrichCitation(projectId, citation) {
    const sourceProject = this.store.getProject(citation.sourceProjectId);
    if (!sourceProject) {
      return {
        ...citation,
        sourceProjectName: "\u672A\u77E5\u9879\u76EE",
        stale: true,
        staleReason: "source_project_missing",
        accessible: false,
        fileUrl: null
      };
    }
    if (!this.store.hasReadAccess(projectId, citation.sourceProjectId)) {
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale: true,
        staleReason: "source_project_link_missing",
        accessible: false,
        fileUrl: null
      };
    }
    try {
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const current = readProjectFile(
        metadata.rootPath,
        citation.sourcePath,
        metadata.headCommit,
        this.denyPatterns
      );
      const stale = current.fileHash !== citation.sourceFileHash;
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale,
        staleReason: stale ? "source_file_changed" : null,
        accessible: true,
        fileUrl: pathToFileURL2(path10.resolve(metadata.rootPath, current.path)).href
      };
    } catch {
      return {
        ...citation,
        sourceProjectName: sourceProject.name,
        stale: true,
        staleReason: "source_file_unavailable",
        accessible: true,
        fileUrl: null
      };
    }
  }
  getContext(projectId, limit = 30) {
    return this.store.getContext(projectId, limit).map((memory) => this.enrichStaleness(memory));
  }
  searchMemory(projectId, query, includeLinked = false, limit = 30) {
    this.store.requireProject(projectId);
    const projectIds = [projectId];
    if (includeLinked) {
      projectIds.push(...this.store.listLinks(projectId).map((project) => project.id));
    }
    return this.store.searchMemories(projectIds, query, limit).map((memory) => this.enrichStaleness(memory));
  }
  recallMemory(projectId, query, recent, includeLinked = false, limit = 8, recommend = 3, budgetTokens = 800) {
    this.store.requireProject(projectId);
    const normalizedQuery = query?.trim() ?? "";
    if (recent === Boolean(normalizedQuery)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Recall requires exactly one of --query TEXT or --recent true."
      );
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RECALL_LIMIT) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Recall limit must be between 1 and ${MAX_RECALL_LIMIT}.`
      );
    }
    if (!Number.isInteger(recommend) || recommend < 1 || recommend > MAX_RECALL_RECOMMEND) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Recall recommendation count must be between 1 and ${MAX_RECALL_RECOMMEND}.`
      );
    }
    this.validateRetrievalBudget(budgetTokens);
    const projectIds = [projectId];
    if (includeLinked) {
      projectIds.push(...this.store.listLinks(projectId).map((project) => project.id));
    }
    const memories = projectIds.flatMap((visibleProjectId) => this.store.getContext(visibleProjectId, 1e3)).map((memory) => this.enrichStaleness(memory));
    return buildRecallResult({
      currentProjectId: projectId,
      memories,
      relations: this.visibleRelations(projectId, includeLinked),
      mode: recent ? "recent" : "query",
      query: recent ? null : normalizedQuery,
      limit,
      recommend,
      budgetTokens
    });
  }
  getMemoriesById(projectId, memoryIds, includeLinked = false, budgetTokens = 1700) {
    this.store.requireProject(projectId);
    this.validateRetrievalBudget(budgetTokens);
    const uniqueIds = [...new Set(memoryIds.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0 || uniqueIds.length > MAX_GET_MEMORY_IDS) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Get requires between 1 and ${MAX_GET_MEMORY_IDS} unique memory IDs.`
      );
    }
    const memories = uniqueIds.map((memoryId) => {
      const memory = this.store.getMemory(memoryId);
      const accessible = memory && (memory.projectId === projectId || includeLinked && this.store.hasReadAccess(projectId, memory.projectId));
      if (!memory || !accessible) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Memory does not exist or is not accessible from this project.",
          { memoryId }
        );
      }
      return this.enrichStaleness(memory);
    });
    return buildGetResult(memories, budgetTokens);
  }
  validateRetrievalBudget(budgetTokens) {
    if (!Number.isInteger(budgetTokens) || budgetTokens < 1 || budgetTokens > MAX_RETRIEVAL_BUDGET) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Retrieval budget must be between 1 and ${MAX_RETRIEVAL_BUDGET} estimated tokens.`
      );
    }
  }
  prepareCitations(projectId, citations) {
    if (citations.length > MAX_CITATIONS) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `A memory can contain at most ${MAX_CITATIONS} citations.`
      );
    }
    const prepared = citations.map((citation) => {
      if (!CITATION_ROLES.includes(citation.role)) {
        throw new ProjectMemoryError("INVALID_INPUT", "Unsupported citation role.", {
          role: citation.role
        });
      }
      const locator = citation.locator?.trim() || null;
      const note = citation.note?.trim() || null;
      if (locator && locator.length > MAX_CITATION_LOCATOR_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Citation locator is too long.");
      }
      if (note && note.length > MAX_CITATION_NOTE_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Citation note is too long.");
      }
      assertNoSecret(locator ?? "", "citation locator");
      assertNoSecret(note ?? "", "citation note");
      const sourceProjectId = citation.sourceProjectId ?? projectId;
      const sourceProject = this.store.requireProject(sourceProjectId);
      this.requireReadAccess(projectId, sourceProjectId);
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const source = readProjectFile(
        metadata.rootPath,
        citation.sourcePath,
        metadata.headCommit,
        this.denyPatterns
      );
      return {
        sourceProjectId,
        sourcePath: source.path,
        role: citation.role,
        locator,
        note,
        sourceCommit: source.commit,
        sourceFileHash: source.fileHash
      };
    });
    const keys = prepared.map(
      (citation) => `${citation.sourceProjectId}:${citation.sourcePath}:${citation.role}:${citation.locator ?? ""}`
    );
    if (new Set(keys).size !== keys.length) {
      throw new ProjectMemoryError("INVALID_INPUT", "Duplicate memory citation.");
    }
    return prepared;
  }
  prepareNarrative(projectId, candidate, citations, required) {
    if (!candidate) {
      if (required) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "A non-reference memory with a brief role must include a complete narrative."
        );
      }
      return null;
    }
    const occurredAt = candidate.occurredAt?.trim();
    const fields = [
      candidate.reason,
      candidate.action,
      candidate.outcome,
      candidate.conclusion
    ].map((value) => value?.trim());
    const occurredAtTimestamp = occurredAt ? Date.parse(occurredAt) : Number.NaN;
    if (!occurredAt || Number.isNaN(occurredAtTimestamp) || fields.some((value) => !value || value.length > MAX_NARRATIVE_FIELD_LENGTH)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Narrative requires a valid occurredAt and concise reason, action, outcome, and conclusion."
      );
    }
    if (occurredAtTimestamp > Date.now()) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Narrative occurredAt cannot be in the future."
      );
    }
    assertNoSecret([occurredAt, ...fields].join(" "), "memory narrative");
    const outputs = candidate.outputs ?? [];
    if (outputs.length > MAX_OUTPUTS) {
      throw new ProjectMemoryError("INVALID_INPUT", "Too many narrative outputs.");
    }
    const seen = /* @__PURE__ */ new Set();
    const preparedOutputs = outputs.map((output) => {
      const sourceProjectId = output.sourceProjectId ?? projectId;
      const citation = citations.find(
        (item) => item.sourceProjectId === sourceProjectId && item.sourcePath === output.sourcePath
      );
      if (!citation) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every narrative output must point to a verified citation in the same memory.",
          { sourceProjectId, sourcePath: output.sourcePath }
        );
      }
      const label = output.label?.trim() || null;
      if (label && label.length > MAX_OUTPUT_LABEL_LENGTH) {
        throw new ProjectMemoryError("INVALID_INPUT", "Narrative output label is too long.");
      }
      assertNoSecret(label ?? "", "narrative output label");
      const key = `${citation.sourceProjectId}:${citation.sourcePath}`;
      if (seen.has(key)) {
        throw new ProjectMemoryError("INVALID_INPUT", "Duplicate narrative output.");
      }
      seen.add(key);
      return {
        sourceProjectId: citation.sourceProjectId,
        sourcePath: citation.sourcePath,
        role: citation.role,
        label
      };
    });
    return {
      occurredAt: new Date(occurredAtTimestamp).toISOString(),
      reason: fields[0],
      action: fields[1],
      outcome: fields[2],
      conclusion: fields[3],
      outputs: preparedOutputs
    };
  }
  prepareCandidate(projectId, candidate) {
    if (!MEMORY_KINDS.includes(candidate.kind)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory kind.", {
        kind: candidate.kind
      });
    }
    const title = candidate.title.trim();
    const content = candidate.content.trim();
    const summary = candidate.summary?.trim() || null;
    const topic = candidate.topic?.trim() || null;
    const briefRole = candidate.briefRole ?? null;
    const workUnitId = candidate.workUnitId?.trim() || null;
    const runId = candidate.runId?.trim() || null;
    const phase = candidate.phase ?? null;
    const sequence = candidate.sequence ?? null;
    if (briefRole && !BRIEF_ROLES.includes(briefRole)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported project brief role.", {
        briefRole
      });
    }
    if (phase && !MEMORY_PHASES.includes(phase)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory phase.", { phase });
    }
    if (sequence !== null && (!Number.isInteger(sequence) || sequence < 1)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory sequence must be a positive integer.");
    }
    for (const [value, label] of [
      [workUnitId, "work unit id"],
      [runId, "run id"]
    ]) {
      if (value && value.length > 200) {
        throw new ProjectMemoryError("INVALID_INPUT", `${label} is too long.`);
      }
    }
    const tags = [...new Set((candidate.tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
    if (!title || title.length > MAX_TITLE_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Title must be 1-${MAX_TITLE_LENGTH} characters.`
      );
    }
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Content must be 1-${MAX_CONTENT_LENGTH} characters.`
      );
    }
    if (summary && summary.length > MAX_SUMMARY_LENGTH) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory summary is too long.");
    }
    if (topic && topic.length > MAX_TOPIC_LENGTH) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory topic is too long.");
    }
    if (tags.length > MAX_TAGS || tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Too many tags or tag is too long.");
    }
    assertNoSecret(title, "memory title");
    assertNoSecret(content, "memory content");
    assertNoSecret(summary ?? "", "memory summary");
    assertNoSecret(topic ?? "", "memory topic");
    assertNoSecret(tags.join(" "), "memory tags");
    const ref = candidate.ref?.trim();
    if (ref && !/^[A-Za-z0-9._:-]{1,80}$/.test(ref)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory candidate ref must use 1-80 letters, numbers, dots, underscores, colons, or hyphens."
      );
    }
    const sourceProjectId = candidate.sourceProjectId ?? projectId;
    const sourceProject = this.store.requireProject(sourceProjectId);
    this.requireReadAccess(projectId, sourceProjectId);
    let sourceCommit = sourceProject.headCommit;
    let sourceFileHash = null;
    let sourcePath = null;
    if (candidate.sourcePath) {
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const source = readProjectFile(
        metadata.rootPath,
        candidate.sourcePath,
        metadata.headCommit,
        this.denyPatterns
      );
      sourceCommit = source.commit;
      sourceFileHash = source.fileHash;
      sourcePath = source.path;
    }
    const citations = this.prepareCitations(projectId, candidate.citations ?? []);
    const narrative = this.prepareNarrative(
      projectId,
      candidate.narrative,
      citations,
      briefRole !== null && briefRole !== "reference"
    );
    return {
      ...candidate,
      ...ref ? { ref } : {},
      title,
      summary,
      topic,
      briefRole,
      workUnitId,
      runId,
      phase,
      sequence,
      content,
      tags,
      sourceProjectId,
      sourcePath,
      sourceCommit,
      sourceFileHash,
      citations,
      narrative,
      confidence: candidate.confidence ?? "observed"
    };
  }
  prepareUpdateCandidate(projectId, candidate) {
    const memory = this.store.getMemory(candidate.memoryId);
    if (!memory || memory.projectId !== projectId) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory updates can target only an existing memory in the current project.",
        { memoryId: candidate.memoryId }
      );
    }
    if (candidate.summary === void 0 && candidate.topic === void 0 && candidate.briefRole === void 0 && candidate.workUnitId === void 0 && candidate.runId === void 0 && candidate.phase === void 0 && candidate.sequence === void 0 && candidate.narrative === void 0 && candidate.citations === void 0) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory update has no enrichment fields.");
    }
    const summary = candidate.summary?.trim();
    const topic = candidate.topic?.trim();
    const briefRole = candidate.briefRole;
    const workUnitId = candidate.workUnitId?.trim();
    const runId = candidate.runId?.trim();
    const phase = candidate.phase;
    const sequence = candidate.sequence;
    if (briefRole !== void 0 && !BRIEF_ROLES.includes(briefRole)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported project brief role.", {
        briefRole
      });
    }
    if (phase !== void 0 && !MEMORY_PHASES.includes(phase)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory phase.", { phase });
    }
    if (sequence !== void 0 && (!Number.isInteger(sequence) || sequence < 1)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory sequence must be a positive integer.");
    }
    if (workUnitId !== void 0 && (!workUnitId || workUnitId.length > 200)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Work unit id must be non-empty and concise.");
    }
    if (runId !== void 0 && (!runId || runId.length > 200)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Run id must be non-empty and concise.");
    }
    if (summary !== void 0 && (!summary || summary.length > MAX_SUMMARY_LENGTH)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Memory summary must be non-empty and concise."
      );
    }
    if (topic !== void 0 && (!topic || topic.length > MAX_TOPIC_LENGTH)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory topic must be non-empty and concise.");
    }
    assertNoSecret(summary ?? "", "memory summary");
    assertNoSecret(topic ?? "", "memory topic");
    const citations = candidate.citations !== void 0 ? this.prepareCitations(projectId, candidate.citations) : memory.citations.map((citation) => ({
      sourceProjectId: citation.sourceProjectId,
      sourcePath: citation.sourcePath,
      role: citation.role,
      locator: citation.locator,
      note: citation.note,
      sourceCommit: citation.sourceCommit,
      sourceFileHash: citation.sourceFileHash
    }));
    const narrative = candidate.narrative === void 0 ? void 0 : this.prepareNarrative(projectId, candidate.narrative, citations, false);
    return {
      memoryId: memory.id,
      ...summary !== void 0 ? { summary } : {},
      ...topic !== void 0 ? { topic } : {},
      ...briefRole !== void 0 ? { briefRole } : {},
      ...workUnitId !== void 0 ? { workUnitId } : {},
      ...runId !== void 0 ? { runId } : {},
      ...phase !== void 0 ? { phase } : {},
      ...sequence !== void 0 ? { sequence } : {},
      ...narrative !== void 0 ? { narrative } : {},
      ...candidate.citations !== void 0 ? { citations } : {}
    };
  }
  prepareRelationCandidate(projectId, candidateRefs, candidate) {
    if (!RELATION_TYPES.includes(candidate.type)) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported memory relation type.", {
        type: candidate.type
      });
    }
    const rationale = candidate.rationale.trim();
    if (!rationale || rationale.length > MAX_RELATION_RATIONALE_LENGTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Relation rationale must be 1-${MAX_RELATION_RATIONALE_LENGTH} characters.`
      );
    }
    assertNoSecret(rationale, "relation rationale");
    const endpointKey = (endpoint) => {
      const memoryId = "memoryId" in endpoint ? endpoint.memoryId : void 0;
      const candidateRef = "candidateRef" in endpoint ? endpoint.candidateRef : void 0;
      if (Boolean(memoryId) === Boolean(candidateRef)) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation endpoint must contain exactly one of memoryId or candidateRef."
        );
      }
      if (memoryId) {
        const memory = this.store.getMemory(memoryId);
        if (!memory) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "Relation memory endpoint does not exist.",
            {
              memoryId
            }
          );
        }
        this.requireReadAccess(projectId, memory.projectId);
        return `memory:${memory.id}`;
      }
      if (!candidateRefs.has(candidateRef)) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation candidateRef must match a unique memory candidate ref in the same proposal.",
          { candidateRef }
        );
      }
      return `candidate:${candidateRef}`;
    };
    const fromKey = endpointKey(candidate.from);
    const toKey = endpointKey(candidate.to);
    if (fromKey === toKey) {
      throw new ProjectMemoryError("INVALID_INPUT", "A memory cannot relate to itself.");
    }
    const endpointProjectId = (endpoint) => {
      if ("candidateRef" in endpoint && endpoint.candidateRef) return projectId;
      if (!("memoryId" in endpoint) || !endpoint.memoryId) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Relation endpoint must contain memoryId or candidateRef."
        );
      }
      return this.store.getMemory(endpoint.memoryId).projectId;
    };
    const fromProjectId = endpointProjectId(candidate.from);
    const toProjectId = endpointProjectId(candidate.to);
    if (fromProjectId !== projectId && toProjectId !== projectId) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "At least one relation endpoint must belong to the current project."
      );
    }
    return {
      ...candidate,
      rationale,
      confidence: candidate.confidence ?? "inferred"
    };
  }
  assertWorkUnitRelationCoverage(candidates, relations) {
    const groups = /* @__PURE__ */ new Map();
    for (const candidate of candidates) {
      if (!candidate.workUnitId || candidate.briefRole === "reference") continue;
      groups.set(candidate.workUnitId, [...groups.get(candidate.workUnitId) ?? [], candidate]);
    }
    const relatedRefs = /* @__PURE__ */ new Set();
    for (const relation of relations) {
      for (const endpoint of [relation.from, relation.to]) {
        if ("candidateRef" in endpoint && endpoint.candidateRef) {
          relatedRefs.add(endpoint.candidateRef);
        }
      }
    }
    for (const [workUnitId, events] of groups) {
      if (events.length < 2) continue;
      const missingRefs = events.filter((event) => !event.ref);
      if (missingRefs.length > 0) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every event in a multi-event work unit must define a candidate ref so relations can be reviewed.",
          { workUnitId, titles: missingRefs.map((event) => event.title) }
        );
      }
      const unconnected = events.filter((event) => !relatedRefs.has(event.ref));
      if (unconnected.length > 0) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Every event in a multi-event work unit must participate in at least one proposed relation.",
          { workUnitId, refs: unconnected.map((event) => event.ref) }
        );
      }
    }
  }
  proposeMemory(projectId, candidates, relations = [], updates = [], actor = { platform: "codex", adapterVersion: null }) {
    this.store.requireProject(projectId);
    const rawPlatform = actor.platform.trim();
    const platform = ["claude", "claude-code"].includes(rawPlatform.toLocaleLowerCase()) ? "claude" : rawPlatform;
    if (!platform || platform.length > 80) {
      throw new ProjectMemoryError("INVALID_INPUT", "Proposal actor platform is invalid.");
    }
    if (actor.adapterVersion !== null && actor.adapterVersion.length > 120) {
      throw new ProjectMemoryError("INVALID_INPUT", "Proposal adapter version is invalid.");
    }
    if (candidates.length + updates.length + relations.length === 0 || candidates.length > MAX_CANDIDATES || updates.length > MAX_UPDATE_CANDIDATES || relations.length > MAX_RELATION_CANDIDATES) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `A proposal must contain memory, update, or relation candidates, with at most ${MAX_CANDIDATES} memories, ${MAX_UPDATE_CANDIDATES} updates, and ${MAX_RELATION_CANDIDATES} relations.`
      );
    }
    const prepared = candidates.map((candidate) => this.prepareCandidate(projectId, candidate));
    const refs = prepared.map((candidate) => candidate.ref).filter((ref) => Boolean(ref));
    if (new Set(refs).size !== refs.length) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory candidate refs must be unique.");
    }
    const preparedRelations = relations.map(
      (candidate) => this.prepareRelationCandidate(projectId, new Set(refs), candidate)
    );
    this.assertWorkUnitRelationCoverage(prepared, preparedRelations);
    const preparedUpdates = updates.map(
      (candidate) => this.prepareUpdateCandidate(projectId, candidate)
    );
    return this.store.createProposal(projectId, prepared, preparedUpdates, preparedRelations, {
      platform,
      adapterVersion: actor.adapterVersion
    });
  }
  commitMemory(proposalId, acceptedItemIds, acceptedRelationIds = [], acceptedUpdateIds = [], refreshSources = false) {
    const proposal = this.store.getProposal(proposalId);
    if (!proposal) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId
      });
    }
    const checks = this.store.getProposalSourceChecks(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds
    );
    if (refreshSources) {
      const refreshedChecks = this.readCurrentProposalSources(
        proposalId,
        proposal.projectId,
        checks,
        true
      );
      this.store.refreshProposalSources(proposalId, refreshedChecks);
    } else {
      this.validateProposalSources(proposalId, proposal.projectId, checks);
    }
    const result = this.store.commitProposal(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds,
      acceptedRelationIds
    );
    return {
      ...result,
      memories: result.memories.map((memory) => this.enrichStaleness(memory)),
      updatedMemories: result.updatedMemories.map((memory) => this.enrichStaleness(memory))
    };
  }
  refreshProposalSources(proposalId, acceptedItemIds, acceptedUpdateIds) {
    const proposal = this.store.getProposal(proposalId);
    if (!proposal) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId
      });
    }
    const checks = this.store.getProposalSourceChecks(
      proposalId,
      acceptedItemIds,
      acceptedUpdateIds
    );
    const refreshedChecks = this.readCurrentProposalSources(
      proposalId,
      proposal.projectId,
      checks,
      true
    );
    return this.store.refreshProposalSources(proposalId, refreshedChecks);
  }
  validateProposalSources(proposalId, projectId, checks) {
    this.readCurrentProposalSources(proposalId, projectId, checks, false);
  }
  readCurrentProposalSources(proposalId, projectId, checks, allowChanges) {
    const refreshedChecks = [];
    for (const check of checks) {
      this.requireReadAccess(projectId, check.sourceProjectId);
      const sourceProject = this.store.requireProject(check.sourceProjectId);
      const metadata = detectGitMetadata(sourceProject.primaryPath);
      const current = readProjectFile(
        metadata.rootPath,
        check.sourcePath,
        metadata.headCommit,
        this.denyPatterns
      );
      if (!allowChanges && current.fileHash !== check.sourceFileHash) {
        throw new ProjectMemoryError(
          "STALE_SOURCE",
          "A proposal source changed after review was prepared.",
          { proposalId, itemId: check.itemId, sourcePath: check.sourcePath }
        );
      }
      refreshedChecks.push({ ...check, sourceFileHash: current.fileHash });
    }
    return refreshedChecks;
  }
  rejectMemory(proposalId) {
    return this.store.rejectProposal(proposalId);
  }
  requireGraphMemoryAccess(projectId, memoryId, includeLinked) {
    const memory = this.store.getMemory(memoryId);
    if (!memory) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory does not exist.", { memoryId });
    }
    if (memory.projectId !== projectId) {
      if (!includeLinked) {
        throw new ProjectMemoryError(
          "LINK_REQUIRED",
          "Use --include-linked true to access a linked-project memory.",
          { memoryId, projectId: memory.projectId }
        );
      }
      this.requireReadAccess(projectId, memory.projectId);
    }
    return this.enrichStaleness(memory);
  }
  visibleRelations(projectId, includeLinked) {
    const ownerProjectIds = includeLinked ? [projectId, ...this.store.listLinks(projectId).map((project) => project.id)] : [projectId];
    return ownerProjectIds.flatMap((ownerProjectId) => this.store.getRelations(ownerProjectId)).filter((relation) => {
      const foreignProjectIds = new Set(
        [relation.fromProjectId, relation.toProjectId].filter((id) => id !== projectId)
      );
      if (foreignProjectIds.size === 0) return true;
      if (!includeLinked) return false;
      return [...foreignProjectIds].every((id) => this.store.hasReadAccess(projectId, id));
    });
  }
  relationView(relation) {
    const fromMemory = this.store.getMemory(relation.fromMemoryId);
    const toMemory = this.store.getMemory(relation.toMemoryId);
    if (!fromMemory || !toMemory) return null;
    const enrichedFrom = this.enrichStaleness(fromMemory);
    const enrichedTo = this.enrichStaleness(toMemory);
    return {
      ...relation,
      fromMemory: enrichedFrom,
      toMemory: enrichedTo,
      suspended: false,
      stale: enrichedFrom.stale || enrichedTo.stale
    };
  }
  listMemoryRelations(projectId, memoryId, direction = "both", types = [], includeLinked = false) {
    const memory = this.requireGraphMemoryAccess(projectId, memoryId, includeLinked);
    if (types.some((type) => !RELATION_TYPES.includes(type))) {
      throw new ProjectMemoryError("INVALID_INPUT", "Unsupported relation type filter.", { types });
    }
    const selectedTypes = new Set(types);
    const relations = this.visibleRelations(projectId, includeLinked).filter((relation) => selectedTypes.size === 0 || selectedTypes.has(relation.type)).filter((relation) => {
      if (SYMMETRIC_RELATION_TYPES.has(relation.type)) {
        return relation.fromMemoryId === memoryId || relation.toMemoryId === memoryId;
      }
      if (direction === "out") return relation.fromMemoryId === memoryId;
      if (direction === "in") return relation.toMemoryId === memoryId;
      return relation.fromMemoryId === memoryId || relation.toMemoryId === memoryId;
    }).map((relation) => this.relationView(relation)).filter((relation) => Boolean(relation));
    return { memory, direction, relations };
  }
  findRelationPath(projectId, fromMemoryId, toMemoryId, maxDepth = 4, includeLinked = false) {
    if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > MAX_PATH_DEPTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Path max depth must be between 1 and ${MAX_PATH_DEPTH}.`
      );
    }
    const fromMemory = this.requireGraphMemoryAccess(projectId, fromMemoryId, includeLinked);
    const toMemory = this.requireGraphMemoryAccess(projectId, toMemoryId, includeLinked);
    const relations = this.visibleRelations(projectId, includeLinked);
    const adjacency = /* @__PURE__ */ new Map();
    const add = (from, nextId, relation) => {
      const entries = adjacency.get(from) ?? [];
      entries.push({ nextId, relation });
      adjacency.set(from, entries);
    };
    for (const relation of relations) {
      add(relation.fromMemoryId, relation.toMemoryId, relation);
      if (SYMMETRIC_RELATION_TYPES.has(relation.type)) {
        add(relation.toMemoryId, relation.fromMemoryId, relation);
      }
    }
    const queue = [
      { memoryId: fromMemoryId, depth: 0 }
    ];
    const visited = /* @__PURE__ */ new Set([fromMemoryId]);
    const previous = /* @__PURE__ */ new Map();
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.memoryId === toMemoryId) break;
      if (current.depth >= maxDepth) continue;
      for (const edge of adjacency.get(current.memoryId) ?? []) {
        if (visited.has(edge.nextId)) continue;
        visited.add(edge.nextId);
        previous.set(edge.nextId, { memoryId: current.memoryId, relation: edge.relation });
        queue.push({ memoryId: edge.nextId, depth: current.depth + 1 });
      }
    }
    if (!visited.has(toMemoryId)) {
      return { found: false, fromMemory, toMemory, nodes: [], relations: [] };
    }
    const memoryIds = [toMemoryId];
    const pathRelations = [];
    let cursor = toMemoryId;
    while (cursor !== fromMemoryId) {
      const step = previous.get(cursor);
      if (!step) break;
      pathRelations.push(step.relation);
      cursor = step.memoryId;
      memoryIds.push(cursor);
    }
    memoryIds.reverse();
    pathRelations.reverse();
    return {
      found: true,
      fromMemory,
      toMemory,
      nodes: memoryIds.map((id) => this.store.getMemory(id)).filter((memory) => Boolean(memory)).map((memory) => this.enrichStaleness(memory)),
      relations: pathRelations
    };
  }
  buildGraph(projectId, memoryId, depth = 1, includeLinked = false) {
    if (!Number.isInteger(depth) || depth < 1 || depth > MAX_GRAPH_DEPTH) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Graph depth must be between 1 and ${MAX_GRAPH_DEPTH}.`
      );
    }
    this.store.requireProject(projectId);
    const visibleRelations = this.visibleRelations(projectId, includeLinked);
    const selectedMemoryIds = /* @__PURE__ */ new Set();
    const selectedRelationIds = /* @__PURE__ */ new Set();
    const queue = [];
    if (memoryId) {
      this.requireGraphMemoryAccess(projectId, memoryId, includeLinked);
      selectedMemoryIds.add(memoryId);
      queue.push({ memoryId, depth: 0 });
    } else {
      for (const memory of this.store.getContext(projectId, MAX_GRAPH_NODES)) {
        selectedMemoryIds.add(memory.id);
        queue.push({ memoryId: memory.id, depth: 0 });
      }
    }
    while (queue.length > 0 && selectedMemoryIds.size < MAX_GRAPH_NODES) {
      const current = queue.shift();
      if (current.depth >= depth) continue;
      for (const relation of visibleRelations) {
        let nextId = null;
        if (relation.fromMemoryId === current.memoryId) nextId = relation.toMemoryId;
        else if (relation.toMemoryId === current.memoryId) nextId = relation.fromMemoryId;
        if (!nextId) continue;
        selectedRelationIds.add(relation.id);
        if (!selectedMemoryIds.has(nextId) && selectedMemoryIds.size < MAX_GRAPH_NODES) {
          selectedMemoryIds.add(nextId);
          queue.push({ memoryId: nextId, depth: current.depth + 1 });
        }
      }
    }
    if (!memoryId) {
      for (const relation of visibleRelations) {
        if (selectedMemoryIds.has(relation.fromMemoryId) && selectedMemoryIds.has(relation.toMemoryId)) {
          selectedRelationIds.add(relation.id);
        }
      }
    }
    const nodes = [...selectedMemoryIds].map((id) => this.store.getMemory(id)).filter((memory) => Boolean(memory)).map((memory) => this.enrichStaleness(memory));
    const nodeIds = new Set(nodes.map((memory) => memory.id));
    const relations = visibleRelations.filter(
      (relation) => selectedRelationIds.has(relation.id) && nodeIds.has(relation.fromMemoryId) && nodeIds.has(relation.toMemoryId)
    );
    return { nodes, relations };
  }
  renderGraphMermaid(graph) {
    const nodeId = (id) => `m_${id.replaceAll("-", "_")}`;
    const escapeLabel = (value) => value.replaceAll("\\", "\\\\").replaceAll('"', "'").replaceAll(/\r?\n/g, " ");
    const lines = ["graph TD"];
    for (const memory of graph.nodes) {
      const stale = memory.stale ? " [\u5DF2\u8FC7\u671F]" : "";
      lines.push(
        `  ${nodeId(memory.id)}["${escapeLabel(`${memory.projectName}: ${buildMemoryDisplayTitle(memory)}${stale}`)}"]`
      );
    }
    for (const relation of graph.relations) {
      const connector = SYMMETRIC_RELATION_TYPES.has(relation.type) ? "---" : "-->";
      lines.push(
        `  ${nodeId(relation.fromMemoryId)} ${connector}|${RELATION_LABELS3[relation.type]}| ${nodeId(relation.toMemoryId)}`
      );
    }
    return `${lines.join("\n")}
`;
  }
  renderGraphMarkdown(projectId, graph) {
    const project = this.store.requireProject(projectId);
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    return renderGraphMarkdown(project.name, graph, generatedAt, guide, brief);
  }
  buildGraphGuide(projectId, graph, limit = 12, generatedAt = (/* @__PURE__ */ new Date()).toISOString()) {
    const project = this.store.requireProject(projectId);
    return analyzeKnowledgeGraph(projectId, project.name, graph, generatedAt, limit);
  }
  buildProjectBrief(projectId, graph, limit = 12, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), providedGuide) {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_GRAPH_NODES) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        `Project brief limit must be between 1 and ${MAX_GRAPH_NODES}.`
      );
    }
    const project = this.store.requireProject(projectId);
    const guide = providedGuide ?? this.buildGraphGuide(projectId, graph, Math.min(limit, 12), generatedAt);
    return buildProjectBrief(projectId, project.name, graph, guide, generatedAt, limit);
  }
  buildProjectStory(projectId, graph, generatedAt = (/* @__PURE__ */ new Date()).toISOString()) {
    const projectGraph = graph ?? this.buildGraph(projectId, null, 1, false);
    const guide = this.buildGraphGuide(projectId, projectGraph, 12, generatedAt);
    const brief = this.buildProjectBrief(
      projectId,
      projectGraph,
      MAX_GRAPH_NODES,
      generatedAt,
      guide
    );
    const memoryById = new Map(projectGraph.nodes.map((memory) => [memory.id, memory]));
    const sentence = (relation) => {
      const fromMemory = memoryById.get(relation.fromMemoryId);
      const toMemory = memoryById.get(relation.toMemoryId);
      const from = `\u300A${fromMemory ? buildMemoryDisplayTitle(fromMemory) : "\u672A\u627E\u5230\u7684\u8BB0\u5F55"}\u300B`;
      const to = `\u300A${toMemory ? buildMemoryDisplayTitle(toMemory) : "\u672A\u627E\u5230\u7684\u8BB0\u5F55"}\u300B`;
      switch (relation.type) {
        case "observes":
          return `${from}\u5728\u6267\u884C\u8FC7\u7A0B\u4E2D\u6CE8\u610F\u5230${to}\u3002`;
        case "causes":
          return `${from}\u662F\u4FC3\u6210${to}\u7684\u539F\u56E0\u3002`;
        case "depends_on":
          return `${from}\u9700\u8981\u5148\u53C2\u8003${to}\u3002`;
        case "supports":
          return `${from}\u4E3A${to}\u63D0\u4F9B\u4E86\u652F\u6301\u3002`;
        case "contradicts":
          return `${from}\u4E0E${to}\u5B58\u5728\u4E0D\u4E00\u81F4\uFF0C\u9700\u8981\u91CD\u65B0\u6838\u5BF9\u3002`;
        case "supersedes":
          return `${from}\u66F4\u65B0\u5E76\u66FF\u4EE3\u4E86${to}\u3002`;
        case "derived_from":
          return `${from}\u662F\u6839\u636E${to}\u6574\u7406\u51FA\u6765\u7684\u3002`;
        default:
          return `${from}\u4E0E${to}\u8BB0\u5F55\u7684\u662F\u76F8\u4E92\u5173\u8054\u7684\u5DE5\u4F5C\u3002`;
      }
    };
    return {
      protocolVersion: 1,
      projectId,
      projectName: brief.projectName,
      generatedAt,
      overview: brief.handoff.coverage,
      startHere: brief.handoff.startHere,
      timeline: brief.handoff.history,
      currentConclusions: brief.currentConclusions,
      risks: brief.risks,
      nextSteps: brief.nextSteps,
      suggestions: brief.systemSuggestions,
      relations: projectGraph.relations.map((relation) => ({
        relationId: relation.id,
        fromMemoryId: relation.fromMemoryId,
        toMemoryId: relation.toMemoryId,
        sentence: sentence(relation),
        rationale: relation.rationale
      }))
    };
  }
  buildMemoryHub(regenerateProjectPages = false) {
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const pendingByProject = /* @__PURE__ */ new Map();
    for (const proposal of this.store.listProposals("pending")) {
      const existing = pendingByProject.get(proposal.projectId) ?? [];
      existing.push(proposal);
      pendingByProject.set(proposal.projectId, existing);
    }
    const projects = this.store.listProjects().map((project) => {
      const graph = this.buildGraph(project.id, null, 1, false);
      const brief = this.buildProjectBrief(project.id, graph, MAX_GRAPH_NODES, generatedAt);
      if (regenerateProjectPages) this.writeGraphHtml(project.id, graph);
      const latest = brief.handoff.history[0] ?? null;
      const pendingProposalCount = this.store.countPendingProposals(project.id);
      const pendingProposals = (pendingByProject.get(project.id) ?? []).slice(0, 4).map((proposal) => ({
        platform: proposal.actor.platform,
        createdAt: proposal.createdAt,
        summaries: [
          ...proposal.items.map((item) => buildMemoryDisplayTitle(item.candidate)),
          ...proposal.updateItems.map(
            (item) => `\u8865\u5168\uFF1A${(() => {
              const memory = graph.nodes.find(
                (candidate) => candidate.id === item.candidate.memoryId
              );
              return memory ? buildMemoryDisplayTitle(memory) : "\u5DF2\u6709\u8BB0\u5F55";
            })()}`
          ),
          ...proposal.relationItems.map(() => "\u53EF\u80FD\u6709\u5173\u7684\u8BB0\u5F55")
        ].slice(0, 4)
      }));
      const storyPath = pathToFileURL2(this.store.knowledgeGraphPath(project.id)).href;
      const searchText = graph.nodes.flatMap((memory) => [
        buildMemoryDisplayTitle(memory),
        memory.title,
        memory.summary ?? "",
        memory.narrative?.outcome ?? "",
        memory.narrative?.conclusion ?? "",
        ...memory.narrative?.outputs.map((output) => output.label ?? output.sourcePath) ?? [],
        ...memory.citations.map((citation) => citation.note ?? citation.sourcePath)
      ]).join(" ");
      return {
        projectId: project.id,
        name: project.name,
        primaryPath: project.primaryPath,
        overview: brief.handoff.coverage,
        latestActivityAt: latest?.occurredAt ?? latest?.updatedAt ?? null,
        latestActivityTitle: latest?.displayTitle ?? null,
        latestConclusion: brief.currentConclusions[0] ?? null,
        nextStep: brief.nextSteps[0] ?? null,
        risk: brief.risks[0] ?? null,
        memoryCount: brief.summary.memoryCount,
        staleCitationCount: brief.summary.staleCitationCount,
        pendingProposalCount,
        pendingProposals,
        needsAttention: pendingProposalCount > 0 || brief.summary.staleCitationCount > 0 || brief.risks.length > 0,
        storyPath,
        searchText
      };
    });
    const byRecent = [...projects].sort(
      (left, right) => (right.latestActivityAt ?? "").localeCompare(left.latestActivityAt ?? "") || left.name.localeCompare(right.name, "zh-CN")
    );
    const byName = [...projects].sort(
      (left, right) => left.name.localeCompare(right.name, "zh-CN")
    );
    return {
      protocolVersion: 1,
      generatedAt,
      storageHome: this.dataDir,
      summary: {
        projectCount: projects.length,
        memoryCount: projects.reduce((total, project) => total + project.memoryCount, 0),
        pendingProposalCount: projects.reduce(
          (total, project) => total + project.pendingProposalCount,
          0
        ),
        attentionProjectCount: projects.filter((project) => project.needsAttention).length
      },
      recentProjects: byRecent.slice(0, 6),
      attentionProjects: byRecent.filter((project) => project.needsAttention),
      pendingProjects: byRecent.filter((project) => project.pendingProposalCount > 0),
      projects: byName
    };
  }
  buildDesktopHubSnapshot() {
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const pendingByProject = /* @__PURE__ */ new Map();
    for (const proposal of this.store.listProposals("pending")) {
      const existing = pendingByProject.get(proposal.projectId) ?? [];
      existing.push(proposal);
      pendingByProject.set(proposal.projectId, existing);
    }
    const projects = this.store.listProjects().map((project) => {
      const memories = this.store.getContext(project.id, 1e3);
      const latest = memories[0] ?? null;
      const conclusion = memories.find((memory) => memory.briefRole === "conclusion") ?? memories.find((memory) => memory.kind === "decision") ?? null;
      const nextStep = memories.find((memory) => memory.briefRole === "next_step") ?? null;
      const risk = memories.find((memory) => memory.briefRole === "risk") ?? memories.find((memory) => memory.kind === "pitfall") ?? null;
      const pendingProposals = (pendingByProject.get(project.id) ?? []).slice(0, 4).map((proposal) => ({
        platform: proposal.actor.platform,
        createdAt: proposal.createdAt,
        summaries: [
          ...proposal.items.map((item) => item.candidate.title),
          ...proposal.updateItems.map(() => "\u8865\u5168\u5DF2\u6709\u8BB0\u5F55"),
          ...proposal.relationItems.map(() => "\u53EF\u80FD\u6709\u5173\u7684\u8BB0\u5F55")
        ].slice(0, 4)
      }));
      const pendingProposalCount = pendingByProject.get(project.id)?.length ?? 0;
      const staleCitationCount = memories.reduce(
        (total, memory) => total + memory.citations.filter((citation) => citation.stale).length,
        0
      );
      const overview = conclusion?.summary ?? conclusion?.narrative?.conclusion ?? latest?.summary ?? latest?.narrative?.outcome ?? (memories.length > 0 ? `\u5DF2\u4FDD\u5B58 ${memories.length} \u6761\u9879\u76EE\u8BB0\u5FC6\u3002` : "\u5DF2\u6CE8\u518C\uFF0C\u7B49\u5F85\u5F62\u6210\u9996\u6761\u8BB0\u5FC6\u3002");
      return {
        projectId: project.id,
        name: project.name,
        primaryPath: project.primaryPath,
        overview,
        latestActivityAt: latest?.narrative?.occurredAt ?? latest?.updatedAt ?? null,
        latestActivityTitle: latest ? buildMemoryDisplayTitle(latest) : null,
        latestConclusion: conclusion ? desktopHubBriefItem(conclusion, "conclusion") : null,
        nextStep: nextStep ? desktopHubBriefItem(nextStep, "next_step") : null,
        risk: risk ? desktopHubBriefItem(risk, "risk") : null,
        memoryCount: memories.length,
        staleCitationCount,
        pendingProposalCount,
        pendingProposals,
        needsAttention: pendingProposalCount > 0 || staleCitationCount > 0 || Boolean(risk),
        storyPath: pathToFileURL2(this.store.knowledgeGraphPath(project.id)).href,
        searchText: memories.flatMap((memory) => [
          buildMemoryDisplayTitle(memory),
          memory.title,
          memory.summary ?? "",
          memory.narrative?.outcome ?? "",
          memory.narrative?.conclusion ?? "",
          ...memory.narrative?.outputs.map((output) => output.label ?? output.sourcePath) ?? [],
          ...memory.citations.map((citation) => citation.note ?? citation.sourcePath)
        ]).join(" ")
      };
    });
    const byRecent = [...projects].sort(
      (left, right) => (right.latestActivityAt ?? "").localeCompare(left.latestActivityAt ?? "") || left.name.localeCompare(right.name, "zh-CN")
    );
    const hub = {
      protocolVersion: 1,
      generatedAt,
      storageHome: this.dataDir,
      summary: {
        projectCount: projects.length,
        memoryCount: projects.reduce((total, project) => total + project.memoryCount, 0),
        pendingProposalCount: projects.reduce(
          (total, project) => total + project.pendingProposalCount,
          0
        ),
        attentionProjectCount: projects.filter((project) => project.needsAttention).length
      },
      recentProjects: byRecent.slice(0, 6),
      attentionProjects: byRecent.filter((project) => project.needsAttention),
      pendingProjects: byRecent.filter((project) => project.pendingProposalCount > 0),
      projects: [...projects].sort((left, right) => left.name.localeCompare(right.name, "zh-CN"))
    };
    hub.platformProjects = buildDesktopPlatformInventory(
      discoverDesktopPlatformProjects(),
      this.store.listProjects(),
      hub.projects
    );
    return hub;
  }
  registerDesktopPlatformProject(platform, projectPath) {
    const resolvedPath = path10.resolve(projectPath);
    const candidate = discoverDesktopPlatformProjects().find(
      (project) => project.platform === platform && project.path === resolvedPath
    );
    if (!candidate) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "The selected platform project is no longer available for registration.",
        { platform, path: resolvedPath }
      );
    }
    this.registerProject(candidate.path, candidate.name);
    return this.buildDesktopHubSnapshot();
  }
  buildDesktopProjectView(projectId) {
    const project = this.store.requireProject(projectId);
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const graph = this.buildGraph(projectId, null, 1, false);
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    return buildGraphViewData(project.name, graph, generatedAt, guide, brief);
  }
  writeMemoryHub(regenerateProjectPages = true) {
    const hub = this.buildMemoryHub(regenerateProjectPages);
    const outputPath = this.store.writeMemoryHub(renderMemoryHubHtml(hub), resolveMemoryHubPath());
    return {
      format: "html",
      outputPath,
      generatedAt: hub.generatedAt,
      projectCount: hub.summary.projectCount,
      memoryCount: hub.summary.memoryCount,
      pendingProposalCount: hub.summary.pendingProposalCount
    };
  }
  writeGraphHtml(projectId, graph, outputPath) {
    const project = this.store.requireProject(projectId);
    const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const guide = this.buildGraphGuide(projectId, graph, 12, generatedAt);
    const brief = this.buildProjectBrief(projectId, graph, 12, generatedAt, guide);
    const html = renderGraphHtml(project.name, graph, generatedAt, guide, brief);
    const target = this.store.writeKnowledgeGraph(projectId, html, outputPath);
    return {
      format: "html",
      outputPath: target,
      generatedAt,
      nodeCount: graph.nodes.length,
      relationCount: graph.relations.length,
      relationSuggestionCount: guide.relationSuggestions.length,
      briefItemCount: brief.summary.memoryCount
    };
  }
  searchFiles(sourceProjectId, targetProjectId, query) {
    this.requireReadAccess(sourceProjectId, targetProjectId);
    const target = this.store.requireProject(targetProjectId);
    const metadata = detectGitMetadata(target.primaryPath);
    return {
      targetProject: target,
      query,
      results: searchProjectFiles(metadata.rootPath, query, metadata.headCommit, this.denyPatterns)
    };
  }
  readFile(sourceProjectId, targetProjectId, relativePath) {
    this.requireReadAccess(sourceProjectId, targetProjectId);
    const target = this.store.requireProject(targetProjectId);
    const metadata = detectGitMetadata(target.primaryPath);
    return {
      targetProject: target,
      file: readProjectFile(
        metadata.rootPath,
        relativePath,
        metadata.headCommit,
        this.denyPatterns
      )
    };
  }
  bindingSnippet(platform = "codex") {
    const normalized = platform.trim().toLocaleLowerCase();
    const instruction = normalized === "claude" || normalized === "claude-code" ? "Use the installed Talo Skill for substantial work in registered local projects. Detect the current project, recall task-relevant candidates, and get only recommended memories within the default token budget. Use story for the project timeline and hub for all registered projects. Propose durable updates with actor.platform set to claude, then resolve them through the shared review workflow." : normalized === "antigravity" ? "Before substantial work in a local workspace, use the global Talo Skill to detect the current project. If the project is registered, recall only task-relevant reviewed memories and get only the recommended memory IDs. If the project is not registered and the user did not explicitly ask about Talo, continue silently without registering or relinking it. Create reviewed proposals with actor.platform set to antigravity; never write memory files directly." : "Use the installed $project-memory Skill before substantial work: detect the current project, recall compact task-relevant candidates, and get only the recommended memories within the default token budget. Use story for the project timeline and hub for all registered projects. Before finishing durable work, create a reviewed proposal and resolve it through the shared review workflow. Treat linked projects as read-only references.";
    return {
      platform: normalized,
      beginMarker: "<!-- project-memory:start -->",
      endMarker: "<!-- project-memory:end -->",
      markdown: `<!-- project-memory:start -->
${instruction}
<!-- project-memory:end -->`
    };
  }
  exportProject(projectId) {
    const exported = this.store.exportProject(projectId);
    return { ...exported, memories: this.getContext(projectId, 1e3) };
  }
};

// ../../packages/project-memory-core/src/store.ts
import { createHash as createHash5, randomUUID } from "crypto";
import {
  appendFileSync,
  chmodSync as chmodSync6,
  existsSync as existsSync9,
  mkdirSync as mkdirSync5,
  readdirSync as readdirSync6,
  readFileSync as readFileSync8,
  renameSync as renameSync6,
  rmSync as rmSync4,
  statSync as statSync6,
  writeFileSync as writeFileSync6
} from "fs";
import path11 from "path";
var SCHEMA_VERSION = 1;
var MEMORY_SCHEMA_VERSION = 6;
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function ensurePrivateDirectory(directory) {
  mkdirSync5(directory, { recursive: true, mode: 448 });
  chmodSync6(directory, 448);
}
function writePrivateFile(filePath, content, hardenDirectory = true) {
  if (hardenDirectory) {
    ensurePrivateDirectory(path11.dirname(filePath));
  } else {
    mkdirSync5(path11.dirname(filePath), { recursive: true, mode: 448 });
  }
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync6(temporaryPath, content, { encoding: "utf8", mode: 384 });
    chmodSync6(temporaryPath, 384);
    renameSync6(temporaryPath, filePath);
    chmodSync6(filePath, 384);
  } finally {
    rmSync4(temporaryPath, { force: true });
  }
}
function writeJson(filePath, value) {
  writePrivateFile(filePath, `${JSON.stringify(value, null, 2)}
`);
}
function readJson(filePath) {
  try {
    return JSON.parse(readFileSync8(filePath, "utf8"));
  } catch (error) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Unable to read project memory state.", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}
function headingTitle(title) {
  return title.replaceAll(/\s+/g, " ").trim();
}
function memoryIdentityKey(title, content) {
  return `${title.trim().toLocaleLowerCase()}
${content.trim()}`;
}
function renderMemoryDocument(projectId, memories) {
  const metadata = {
    schemaVersion: MEMORY_SCHEMA_VERSION,
    projectId,
    memories: memories.map((memory) => ({
      id: memory.id,
      projectId: memory.projectId,
      kind: memory.kind,
      title: memory.title,
      summary: memory.summary,
      topic: memory.topic,
      briefRole: memory.briefRole,
      workUnitId: memory.workUnitId,
      runId: memory.runId,
      phase: memory.phase,
      sequence: memory.sequence,
      narrative: memory.narrative,
      tags: memory.tags,
      sourceProjectId: memory.sourceProjectId,
      sourcePath: memory.sourcePath,
      sourceCommit: memory.sourceCommit,
      sourceFileHash: memory.sourceFileHash,
      citations: memory.citations.map((citation) => ({
        sourceProjectId: citation.sourceProjectId,
        sourcePath: citation.sourcePath,
        role: citation.role,
        locator: citation.locator,
        note: citation.note,
        sourceCommit: citation.sourceCommit,
        sourceFileHash: citation.sourceFileHash
      })),
      submittedBy: memory.submittedBy ?? null,
      sourceProposalId: memory.sourceProposalId ?? null,
      confidence: memory.confidence,
      status: "active",
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt
    }))
  };
  const sections = memories.map(
    (memory) => `## [${memory.id}] ${headingTitle(memory.title)}

${memory.content.trim()}
`
  );
  return `---
${JSON.stringify(metadata, null, 2)}
---

# Talo

${sections.join("\n")}`;
}
function parseMemoryDocument(filePath, project) {
  if (!existsSync9(filePath)) {
    return [];
  }
  const text2 = readFileSync8(filePath, "utf8");
  const frontMatter = text2.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontMatter) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Project MEMORY.md has invalid front matter.", {
      path: filePath
    });
  }
  let metadata;
  try {
    metadata = JSON.parse(frontMatter[1] ?? "");
  } catch (error) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Project MEMORY.md metadata is invalid.", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error)
    });
  }
  if (![1, 2, 3, 4, 5, MEMORY_SCHEMA_VERSION].includes(metadata.schemaVersion) || metadata.projectId !== project.id) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Project MEMORY.md identity is invalid.", {
      path: filePath,
      projectId: project.id
    });
  }
  const bodyOffset = frontMatter[0].length;
  const body = text2.slice(bodyOffset);
  const headings = /* @__PURE__ */ new Map();
  const memoryIds = new Set(metadata.memories.map((memory) => memory.id));
  const matches = [...body.matchAll(/^## \[([0-9a-f-]+)\](?: .*)?$/gim)].filter(
    (match) => memoryIds.has(match[1] ?? "")
  );
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const id = match?.[1];
    if (!match || !id || match.index === void 0) {
      continue;
    }
    const lineEnd = body.indexOf("\n", match.index);
    const contentStart = lineEnd === -1 ? body.length : lineEnd + 1;
    const sectionEnd = matches[index + 1]?.index ?? body.length;
    headings.set(id, { contentStart, sectionEnd });
  }
  return metadata.memories.map((memory) => {
    const section2 = headings.get(memory.id);
    if (!section2) {
      throw new ProjectMemoryError(
        "STORAGE_ERROR",
        "Project MEMORY.md is missing a memory section.",
        {
          path: filePath,
          memoryId: memory.id
        }
      );
    }
    return {
      ...memory,
      summary: memory.summary ?? null,
      topic: memory.topic ?? null,
      briefRole: memory.briefRole ?? null,
      workUnitId: memory.workUnitId ?? null,
      runId: memory.runId ?? null,
      phase: memory.phase && MEMORY_PHASES.includes(memory.phase) ? memory.phase : null,
      sequence: typeof memory.sequence === "number" && Number.isInteger(memory.sequence) ? memory.sequence : null,
      narrative: memory.narrative ?? null,
      submittedBy: memory.submittedBy ?? null,
      sourceProposalId: memory.sourceProposalId ?? null,
      projectName: project.name,
      content: body.slice(section2.contentStart, section2.sectionEnd).trim(),
      citations: (memory.citations ?? []).map((citation) => ({
        ...citation,
        sourceProjectName: "",
        stale: false,
        staleReason: null,
        accessible: true,
        fileUrl: null
      })),
      stale: false,
      staleReason: null
    };
  });
}
function scoreMemory(memory, tokens) {
  const title = memory.title.toLocaleLowerCase();
  const tags = memory.tags.join(" ").toLocaleLowerCase();
  const content = memory.content.toLocaleLowerCase();
  return tokens.reduce((score, token) => {
    if (title.includes(token)) return score + 5;
    if (tags.includes(token)) return score + 3;
    if (content.includes(token)) return score + 1;
    return score;
  }, 0);
}
var SYMMETRIC_RELATION_TYPES2 = /* @__PURE__ */ new Set(["related_to", "contradicts"]);
function relationKey(type, fromMemoryId, toMemoryId) {
  if (SYMMETRIC_RELATION_TYPES2.has(type)) {
    const [left, right] = [fromMemoryId, toMemoryId].sort();
    return `${type}:${left}:${right}`;
  }
  return `${type}:${fromMemoryId}:${toMemoryId}`;
}
function memoryRevision(memory) {
  const stableMemory = {
    id: memory.id,
    projectId: memory.projectId,
    kind: memory.kind,
    title: memory.title,
    summary: memory.summary,
    topic: memory.topic,
    briefRole: memory.briefRole,
    workUnitId: memory.workUnitId,
    runId: memory.runId,
    phase: memory.phase,
    sequence: memory.sequence,
    narrative: memory.narrative,
    tags: memory.tags,
    sourceProjectId: memory.sourceProjectId,
    sourcePath: memory.sourcePath,
    sourceCommit: memory.sourceCommit,
    sourceFileHash: memory.sourceFileHash,
    citations: memory.citations.map((citation) => ({
      sourceProjectId: citation.sourceProjectId,
      sourcePath: citation.sourcePath,
      role: citation.role,
      locator: citation.locator,
      note: citation.note,
      sourceCommit: citation.sourceCommit,
      sourceFileHash: citation.sourceFileHash
    })),
    submittedBy: memory.submittedBy ?? null,
    sourceProposalId: memory.sourceProposalId ?? null,
    confidence: memory.confidence,
    status: memory.status,
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
    content: memory.content
  };
  return createHash5("sha256").update(JSON.stringify(stableMemory)).digest("hex");
}
function publicCitation(citation) {
  return {
    sourceProjectId: citation.sourceProjectId,
    sourcePath: citation.sourcePath,
    role: citation.role,
    ...citation.locator ? { locator: citation.locator } : {},
    ...citation.note ? { note: citation.note } : {}
  };
}
function publicNarrative(candidate) {
  return {
    occurredAt: candidate.occurredAt,
    reason: candidate.reason,
    action: candidate.action,
    outcome: candidate.outcome,
    conclusion: candidate.conclusion,
    outputs: candidate.outputs.map((output) => ({
      sourceProjectId: output.sourceProjectId,
      sourcePath: output.sourcePath,
      ...output.label ? { label: output.label } : {}
    }))
  };
}
function publicUpdateCandidate(candidate) {
  return {
    memoryId: candidate.memoryId,
    ...candidate.summary !== void 0 ? { summary: candidate.summary } : {},
    ...candidate.topic !== void 0 ? { topic: candidate.topic } : {},
    ...candidate.briefRole !== void 0 ? { briefRole: candidate.briefRole } : {},
    ...candidate.workUnitId !== void 0 ? { workUnitId: candidate.workUnitId } : {},
    ...candidate.runId !== void 0 ? { runId: candidate.runId } : {},
    ...candidate.phase !== void 0 ? { phase: candidate.phase } : {},
    ...candidate.sequence !== void 0 ? { sequence: candidate.sequence } : {},
    ...candidate.narrative !== void 0 ? { narrative: publicNarrative(candidate.narrative) } : {},
    ...candidate.citations !== void 0 ? { citations: candidate.citations.map(publicCitation) } : {}
  };
}
function publicProposal(proposal) {
  return {
    id: proposal.id,
    projectId: proposal.projectId,
    actor: proposal.actor ?? { platform: "legacy", adapterVersion: null },
    baseRevision: proposal.baseRevision ?? null,
    status: proposal.status,
    createdAt: proposal.createdAt,
    reviewedAt: proposal.reviewedAt,
    items: proposal.items.map((item) => ({
      id: item.id,
      proposalId: item.proposalId,
      status: item.status,
      candidate: {
        ...item.candidate.ref ? { ref: item.candidate.ref } : {},
        kind: item.candidate.kind,
        title: item.candidate.title,
        ...item.candidate.summary ? { summary: item.candidate.summary } : {},
        ...item.candidate.topic ? { topic: item.candidate.topic } : {},
        ...item.candidate.briefRole ? { briefRole: item.candidate.briefRole } : {},
        ...item.candidate.workUnitId ? { workUnitId: item.candidate.workUnitId } : {},
        ...item.candidate.runId ? { runId: item.candidate.runId } : {},
        ...item.candidate.phase ? { phase: item.candidate.phase } : {},
        ...item.candidate.sequence !== null ? { sequence: item.candidate.sequence } : {},
        ...item.candidate.narrative ? { narrative: publicNarrative(item.candidate.narrative) } : {},
        content: item.candidate.content,
        tags: item.candidate.tags,
        ...item.candidate.sourceProjectId ? { sourceProjectId: item.candidate.sourceProjectId } : {},
        ...item.candidate.sourcePath ? { sourcePath: item.candidate.sourcePath } : {},
        ...(item.candidate.citations ?? []).length > 0 ? { citations: (item.candidate.citations ?? []).map(publicCitation) } : {},
        confidence: item.candidate.confidence
      }
    })),
    updateItems: (proposal.updateItems ?? []).map((item) => ({
      id: item.id,
      proposalId: item.proposalId,
      status: item.status,
      rejectionReason: item.rejectionReason,
      candidate: publicUpdateCandidate(item.candidate)
    })),
    relationItems: (proposal.relationItems ?? []).map((item) => ({
      id: item.id,
      proposalId: item.proposalId,
      status: item.status,
      rejectionReason: item.rejectionReason,
      candidate: {
        from: item.candidate.from,
        to: item.candidate.to,
        type: item.candidate.type,
        rationale: item.candidate.rationale,
        confidence: item.candidate.confidence
      }
    }))
  };
}
var MemoryStore = class {
  storageRoot;
  registryPath;
  linksPath;
  projectsRoot;
  locksRoot;
  constructor(dataDir) {
    this.storageRoot = dataDir;
    this.registryPath = path11.join(dataDir, "registry.json");
    this.linksPath = path11.join(dataDir, "links.json");
    this.projectsRoot = path11.join(dataDir, "projects");
    this.locksRoot = path11.join(dataDir, "locks");
    ensurePrivateDirectory(this.projectsRoot);
    ensurePrivateDirectory(this.locksRoot);
    if (!existsSync9(this.registryPath)) {
      writeJson(this.registryPath, { schemaVersion: SCHEMA_VERSION, projects: [] });
    }
    if (!existsSync9(this.linksPath)) {
      writeJson(this.linksPath, { schemaVersion: SCHEMA_VERSION, links: [] });
    }
    this.readRegistry();
    this.readLinks();
  }
  close() {
  }
  acquireProjectLock(projectId) {
    const lockPath = path11.join(this.locksRoot, `${projectId}.lock`);
    const acquire = () => {
      try {
        mkdirSync5(lockPath, { mode: 448 });
        writePrivateFile(
          path11.join(lockPath, "owner.json"),
          `${JSON.stringify({ pid: process.pid, acquiredAt: now() }, null, 2)}
`,
          false
        );
      } catch (error) {
        const code = error.code;
        if (code !== "EEXIST") throw error;
        const age = Date.now() - statSync6(lockPath).mtimeMs;
        if (age > 5 * 60 * 1e3) {
          rmSync4(lockPath, { recursive: true, force: true });
          mkdirSync5(lockPath, { mode: 448 });
          writePrivateFile(
            path11.join(lockPath, "owner.json"),
            `${JSON.stringify({ pid: process.pid, acquiredAt: now(), recovered: true }, null, 2)}
`,
            false
          );
          return;
        }
        throw new ProjectMemoryError(
          "PROJECT_LOCKED",
          "This project memory is being changed by another process.",
          { projectId, lockPath }
        );
      }
    };
    acquire();
    return () => rmSync4(lockPath, { recursive: true, force: true });
  }
  projectRevision(projectId) {
    const hash2 = createHash5("sha256");
    for (const filePath of [
      this.memoryPath(projectId),
      this.relationsPath(projectId),
      this.linksPath
    ]) {
      hash2.update(path11.basename(filePath));
      hash2.update(existsSync9(filePath) ? readFileSync8(filePath) : Buffer.from("<missing>"));
    }
    return hash2.digest("hex");
  }
  projectDir(projectId) {
    return path11.join(this.projectsRoot, projectId);
  }
  projectPath(projectId) {
    return path11.join(this.projectDir(projectId), "project.json");
  }
  memoryPath(projectId) {
    return path11.join(this.projectDir(projectId), "MEMORY.md");
  }
  writeKnowledgeGraph(projectId, content, outputPath) {
    this.requireProject(projectId);
    const target = outputPath ? path11.resolve(outputPath) : path11.join(this.projectDir(projectId), "KNOWLEDGE_GRAPH.html");
    writePrivateFile(target, content, outputPath === void 0);
    return target;
  }
  knowledgeGraphPath(projectId) {
    this.requireProject(projectId);
    return path11.join(this.projectDir(projectId), "KNOWLEDGE_GRAPH.html");
  }
  writeMemoryHub(content, outputPath) {
    writePrivateFile(path11.resolve(outputPath), content);
    return path11.resolve(outputPath);
  }
  relationsPath(projectId) {
    return path11.join(this.projectDir(projectId), "RELATIONS.json");
  }
  proposalsDir(projectId) {
    return path11.join(this.projectDir(projectId), "proposals");
  }
  proposalPath(projectId, proposalId) {
    return path11.join(this.proposalsDir(projectId), `${proposalId}.json`);
  }
  auditPath(projectId) {
    return path11.join(this.projectDir(projectId), "audit.jsonl");
  }
  readRelationsDocument(projectId) {
    this.requireProject(projectId);
    const relationsPath = this.relationsPath(projectId);
    if (!existsSync9(relationsPath)) {
      return { schemaVersion: SCHEMA_VERSION, projectId, relations: [] };
    }
    const document = readJson(relationsPath);
    if (document.schemaVersion !== SCHEMA_VERSION || document.projectId !== projectId || !Array.isArray(document.relations)) {
      throw new ProjectMemoryError("STORAGE_ERROR", "Project relations schema is invalid.", {
        path: relationsPath,
        projectId
      });
    }
    return document;
  }
  writeRelationsDocument(document) {
    writeJson(this.relationsPath(document.projectId), document);
  }
  getRelations(projectId) {
    return this.readRelationsDocument(projectId).relations;
  }
  getAllRelations() {
    return this.readRegistry().projects.flatMap((entry) => this.getRelations(entry.id));
  }
  readRegistry() {
    const registry = readJson(this.registryPath);
    if (registry.schemaVersion !== SCHEMA_VERSION || !Array.isArray(registry.projects)) {
      throw new ProjectMemoryError("STORAGE_ERROR", "Project registry schema is invalid.", {
        path: this.registryPath
      });
    }
    return registry;
  }
  writeRegistry(registry) {
    writeJson(this.registryPath, registry);
  }
  readLinks() {
    const links = readJson(this.linksPath);
    if (links.schemaVersion !== SCHEMA_VERSION || !Array.isArray(links.links)) {
      throw new ProjectMemoryError("STORAGE_ERROR", "Project links schema is invalid.", {
        path: this.linksPath
      });
    }
    return links;
  }
  writeLinks(links) {
    writeJson(this.linksPath, links);
  }
  audit(eventType, projectId, subjectId, details) {
    if (!projectId) {
      return;
    }
    const event = { eventType, projectId, subjectId, details, createdAt: now() };
    const auditPath = this.auditPath(projectId);
    ensurePrivateDirectory(path11.dirname(auditPath));
    appendFileSync(auditPath, `${JSON.stringify(event)}
`, { encoding: "utf8", mode: 384 });
    chmodSync6(auditPath, 384);
  }
  getProject(projectId) {
    const projectPath = this.projectPath(projectId);
    return existsSync9(projectPath) ? readJson(projectPath) : null;
  }
  listProjects() {
    return this.readRegistry().projects.map((entry) => this.getProject(entry.id)).filter((project) => Boolean(project)).sort(
      (left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt) || left.name.localeCompare(right.name)
    );
  }
  getProjectByPath(canonicalPath) {
    const entry = this.readRegistry().projects.find(
      (project) => project.locations.some((location) => location.canonicalPath === canonicalPath)
    );
    return entry ? this.getProject(entry.id) : null;
  }
  findRelocationCandidates(gitCommonDir, remoteUrl) {
    if (!gitCommonDir && !remoteUrl) {
      return [];
    }
    return this.readRegistry().projects.map((entry) => this.getProject(entry.id)).filter((project) => Boolean(project)).filter(
      (project) => gitCommonDir !== null && project.gitCommonDir === gitCommonDir || remoteUrl !== null && project.remoteUrl === remoteUrl
    ).sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt));
  }
  registerProject(input) {
    const releaseLock = this.acquireProjectLock("registry");
    try {
      const existing = this.getProjectByPath(input.primaryPath);
      if (existing) {
        throw new ProjectMemoryError(
          "PROJECT_ALREADY_REGISTERED",
          "Project path is already registered.",
          { projectId: existing.id }
        );
      }
      const registry = this.readRegistry();
      const timestamp = now();
      if (input.relinkProjectId) {
        const project2 = this.getProject(input.relinkProjectId);
        const entry = registry.projects.find((candidate) => candidate.id === input.relinkProjectId);
        if (!project2 || !entry) {
          throw new ProjectMemoryError("PROJECT_NOT_REGISTERED", "Relink target does not exist.", {
            projectId: input.relinkProjectId
          });
        }
        const updated = {
          ...project2,
          name: input.name,
          primaryPath: input.primaryPath,
          isGit: input.isGit,
          gitCommonDir: input.gitCommonDir,
          remoteUrl: input.remoteUrl,
          headCommit: input.headCommit,
          updatedAt: timestamp,
          lastSeenAt: timestamp
        };
        entry.locations.push({
          canonicalPath: input.primaryPath,
          firstSeenAt: timestamp,
          lastSeenAt: timestamp
        });
        writeJson(this.projectPath(project2.id), updated);
        this.writeRegistry(registry);
        this.audit("project_relinked", project2.id, project2.id, { path: input.primaryPath });
        return updated;
      }
      const id = randomUUID();
      const project = {
        id,
        name: input.name,
        primaryPath: input.primaryPath,
        isGit: input.isGit,
        gitCommonDir: input.gitCommonDir,
        remoteUrl: input.remoteUrl,
        headCommit: input.headCommit,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastSeenAt: timestamp
      };
      ensurePrivateDirectory(this.proposalsDir(id));
      writeJson(this.projectPath(id), project);
      writePrivateFile(this.memoryPath(id), renderMemoryDocument(id, []));
      this.writeRelationsDocument({ schemaVersion: SCHEMA_VERSION, projectId: id, relations: [] });
      registry.projects.push({
        id,
        locations: [
          { canonicalPath: input.primaryPath, firstSeenAt: timestamp, lastSeenAt: timestamp }
        ]
      });
      this.writeRegistry(registry);
      this.audit("project_registered", id, id, { path: input.primaryPath });
      return project;
    } finally {
      releaseLock();
    }
  }
  touchProject(projectId, pathValue, headCommit) {
    const project = this.requireProject(projectId);
    const registry = this.readRegistry();
    const entry = registry.projects.find((candidate) => candidate.id === projectId);
    if (!entry) {
      throw new ProjectMemoryError("STORAGE_ERROR", "Project is missing from the registry.", {
        projectId
      });
    }
    const timestamp = now();
    const location = entry.locations.find((candidate) => candidate.canonicalPath === pathValue);
    if (location) {
      location.lastSeenAt = timestamp;
    } else {
      entry.locations.push({
        canonicalPath: pathValue,
        firstSeenAt: timestamp,
        lastSeenAt: timestamp
      });
    }
    writeJson(this.projectPath(projectId), {
      ...project,
      primaryPath: pathValue,
      headCommit,
      updatedAt: timestamp,
      lastSeenAt: timestamp
    });
    this.writeRegistry(registry);
  }
  linkProjects(sourceProjectId, targetProjectId) {
    const releaseLock = this.acquireProjectLock("links");
    try {
      if (sourceProjectId === targetProjectId) {
        throw new ProjectMemoryError("INVALID_INPUT", "A project cannot link to itself.");
      }
      this.requireProject(sourceProjectId);
      this.requireProject(targetProjectId);
      const links = this.readLinks();
      if (!links.links.some(
        (link) => link.sourceProjectId === sourceProjectId && link.targetProjectId === targetProjectId
      )) {
        links.links.push({ sourceProjectId, targetProjectId, access: "read", createdAt: now() });
        this.writeLinks(links);
      }
      this.audit("project_linked", sourceProjectId, targetProjectId, { access: "read" });
    } finally {
      releaseLock();
    }
  }
  unlinkProjects(sourceProjectId, targetProjectId) {
    const releaseLock = this.acquireProjectLock("links");
    try {
      const links = this.readLinks();
      links.links = links.links.filter(
        (link) => !(link.sourceProjectId === sourceProjectId && link.targetProjectId === targetProjectId)
      );
      this.writeLinks(links);
      this.audit("project_unlinked", sourceProjectId, targetProjectId, {});
    } finally {
      releaseLock();
    }
  }
  listLinks(sourceProjectId) {
    this.requireProject(sourceProjectId);
    return this.readLinks().links.filter((link) => link.sourceProjectId === sourceProjectId).map((link) => this.getProject(link.targetProjectId)).filter((project) => Boolean(project)).sort((left, right) => left.name.localeCompare(right.name));
  }
  hasReadAccess(sourceProjectId, targetProjectId) {
    if (sourceProjectId === targetProjectId) {
      return true;
    }
    return this.readLinks().links.some(
      (link) => link.sourceProjectId === sourceProjectId && link.targetProjectId === targetProjectId
    );
  }
  createProposal(projectId, candidates, updates = [], relations = [], actor = { platform: "codex", adapterVersion: null }) {
    this.requireProject(projectId);
    const releaseLock = this.acquireProjectLock(projectId);
    try {
      const proposalId = randomUUID();
      const baseMemorySnapshots = {};
      for (const update of updates) {
        const memory = this.getMemory(update.memoryId);
        if (memory) {
          baseMemorySnapshots[memory.id] = memoryRevision(memory);
        }
      }
      const proposal = {
        id: proposalId,
        projectId,
        actor,
        baseRevision: this.projectRevision(projectId),
        status: "pending",
        createdAt: now(),
        reviewedAt: null,
        items: candidates.map((candidate) => ({
          id: randomUUID(),
          proposalId,
          candidate,
          status: "pending"
        })),
        updateItems: updates.map((candidate) => ({
          id: randomUUID(),
          proposalId,
          candidate,
          status: "pending",
          rejectionReason: null
        })),
        relationItems: relations.map((candidate) => ({
          id: randomUUID(),
          proposalId,
          candidate,
          status: "pending",
          rejectionReason: null
        })),
        ...Object.keys(baseMemorySnapshots).length > 0 ? { baseMemorySnapshots } : {}
      };
      writeJson(this.proposalPath(projectId, proposalId), proposal);
      this.audit("memory_proposed", projectId, proposalId, {
        actor,
        baseRevision: proposal.baseRevision,
        itemCount: candidates.length,
        updateItemCount: updates.length,
        relationItemCount: relations.length
      });
      return publicProposal(proposal);
    } finally {
      releaseLock();
    }
  }
  findProposalPath(proposalId) {
    for (const entry of this.readRegistry().projects) {
      const proposalPath = this.proposalPath(entry.id, proposalId);
      if (existsSync9(proposalPath)) {
        return proposalPath;
      }
    }
    return null;
  }
  getProposal(proposalId, expectedItemIds) {
    const proposalPath = this.findProposalPath(proposalId);
    if (!proposalPath) {
      return null;
    }
    const proposal = readJson(proposalPath);
    if (expectedItemIds && proposal.items.some((item) => !expectedItemIds.includes(item.id))) {
      throw new ProjectMemoryError("STORAGE_ERROR", "Proposal items changed unexpectedly.");
    }
    return publicProposal(proposal);
  }
  getProposalSourceChecks(proposalId, acceptedItemIds, acceptedUpdateIds) {
    const proposalPath = this.findProposalPath(proposalId);
    if (!proposalPath) return [];
    const proposal = readJson(proposalPath);
    const accepted = new Set(acceptedItemIds);
    const acceptedUpdates = new Set(acceptedUpdateIds);
    const checks = [];
    const append = (itemId, citations) => {
      for (const citation of citations) {
        checks.push({
          itemId,
          sourceProjectId: citation.sourceProjectId,
          sourcePath: citation.sourcePath,
          sourceFileHash: citation.sourceFileHash
        });
      }
    };
    for (const item of proposal.items) {
      if (!accepted.has(item.id)) continue;
      if (item.candidate.sourceProjectId && item.candidate.sourcePath && item.candidate.sourceFileHash) {
        checks.push({
          itemId: item.id,
          sourceProjectId: item.candidate.sourceProjectId,
          sourcePath: item.candidate.sourcePath,
          sourceFileHash: item.candidate.sourceFileHash
        });
      }
      append(item.id, item.candidate.citations ?? []);
    }
    for (const item of proposal.updateItems ?? []) {
      if (acceptedUpdates.has(item.id)) append(item.id, item.candidate.citations ?? []);
    }
    return [
      ...new Map(
        checks.map((check) => [
          `${check.itemId}:${check.sourceProjectId}:${check.sourcePath}`,
          check
        ])
      ).values()
    ];
  }
  refreshProposalSources(proposalId, checks) {
    const proposalPath = this.findProposalPath(proposalId);
    const initialProposal = proposalPath ? readJson(proposalPath) : null;
    if (initialProposal?.status !== "pending" || !proposalPath) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId
      });
    }
    const releaseLock = this.acquireProjectLock(initialProposal.projectId);
    try {
      const proposal = readJson(proposalPath);
      if (proposal.status !== "pending") {
        throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
          proposalId
        });
      }
      const sourceHashes = /* @__PURE__ */ new Map();
      for (const check of checks) {
        const item = proposal.items.find((candidate) => candidate.id === check.itemId) ?? (proposal.updateItems ?? []).find((candidate) => candidate.id === check.itemId);
        if (!item) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "Proposal source item does not belong to the proposal.",
            { proposalId, itemId: check.itemId }
          );
        }
        const itemSources = sourceHashes.get(check.itemId) ?? /* @__PURE__ */ new Map();
        itemSources.set(`${check.sourceProjectId}:${check.sourcePath}`, check.sourceFileHash);
        sourceHashes.set(check.itemId, itemSources);
      }
      const sourcePaths = /* @__PURE__ */ new Set();
      const refreshCitations = (itemId, citations) => {
        if (!citations) return citations;
        const itemSources = sourceHashes.get(itemId);
        return citations.map((citation) => {
          const sourceHash = itemSources?.get(`${citation.sourceProjectId}:${citation.sourcePath}`);
          if (!sourceHash) return citation;
          sourcePaths.add(citation.sourcePath);
          return { ...citation, sourceFileHash: sourceHash };
        });
      };
      for (const item of proposal.items) {
        const itemSources = sourceHashes.get(item.id);
        if (!itemSources) continue;
        if (item.candidate.sourceProjectId && item.candidate.sourcePath) {
          const sourceHash = itemSources.get(
            `${item.candidate.sourceProjectId}:${item.candidate.sourcePath}`
          );
          if (sourceHash) {
            item.candidate.sourceFileHash = sourceHash;
            sourcePaths.add(item.candidate.sourcePath);
          }
        }
        item.candidate.citations = refreshCitations(item.id, item.candidate.citations) ?? [];
      }
      for (const item of proposal.updateItems ?? []) {
        if (!sourceHashes.has(item.id)) continue;
        item.candidate.citations = refreshCitations(item.id, item.candidate.citations);
      }
      if (sourcePaths.size > 0) {
        writeJson(proposalPath, proposal);
        this.audit("proposal_sources_refreshed", proposal.projectId, proposalId, {
          sourcePaths: [...sourcePaths]
        });
      }
      return { proposalId, sourcePaths: [...sourcePaths] };
    } finally {
      releaseLock();
    }
  }
  commitProposal(proposalId, acceptedItemIds, acceptedUpdateIds = [], acceptedRelationIds = []) {
    const proposalPath = this.findProposalPath(proposalId);
    const initialProposal = proposalPath ? readJson(proposalPath) : null;
    if (initialProposal?.status !== "pending" || !proposalPath) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId
      });
    }
    const releaseLock = this.acquireProjectLock(initialProposal.projectId);
    try {
      const proposal = readJson(proposalPath);
      if (proposal.status !== "pending") {
        throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
          proposalId
        });
      }
      const accepted = new Set(acceptedItemIds);
      const acceptedUpdates = new Set(acceptedUpdateIds);
      const acceptedRelations = new Set(acceptedRelationIds);
      const validIds = new Set(proposal.items.map((item) => item.id));
      const updateItems = proposal.updateItems ?? [];
      const validUpdateIds = new Set(updateItems.map((item) => item.id));
      const relationItems = proposal.relationItems ?? [];
      const validRelationIds = new Set(relationItems.map((item) => item.id));
      if (accepted.size + acceptedUpdates.size + acceptedRelations.size === 0 || [...accepted].some((id) => !validIds.has(id)) || [...acceptedUpdates].some((id) => !validUpdateIds.has(id)) || [...acceptedRelations].some((id) => !validRelationIds.has(id))) {
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Accepted memory, update, and relation item IDs must belong to the proposal.",
          { proposalId }
        );
      }
      const project = this.requireProject(proposal.projectId);
      const memories = this.getContext(project.id, 1e3);
      const existingKeys = new Set(
        memories.map(
          (memory) => `${memory.title.trim().toLocaleLowerCase()}
${memory.content.trim()}`
        )
      );
      for (const item of proposal.items) {
        if (!accepted.has(item.id)) continue;
        const key = `${item.candidate.title.trim().toLocaleLowerCase()}
${item.candidate.content.trim()}`;
        if (existingKeys.has(key)) {
          throw new ProjectMemoryError(
            "REVISION_CONFLICT",
            "An accepted memory now duplicates an existing memory. Review the proposal again.",
            { proposalId, itemId: item.id }
          );
        }
        existingKeys.add(key);
      }
      const currentRevision = this.projectRevision(proposal.projectId);
      const revisionChanged = Boolean(proposal.baseRevision) && proposal.baseRevision !== currentRevision;
      if (revisionChanged) {
        const baseMemorySnapshots = proposal.baseMemorySnapshots ?? {};
        for (const item of updateItems) {
          if (!acceptedUpdates.has(item.id)) continue;
          const memory = this.getMemory(item.candidate.memoryId);
          const expectedSnapshot = baseMemorySnapshots[item.candidate.memoryId];
          const targetChanged = !memory || (expectedSnapshot ? memoryRevision(memory) !== expectedSnapshot : memory.updatedAt > proposal.createdAt);
          if (targetChanged) {
            throw new ProjectMemoryError(
              "REVISION_CONFLICT",
              "An update target changed after this proposal was created. Review the affected item before committing.",
              {
                proposalId,
                itemId: item.id,
                memoryId: item.candidate.memoryId,
                reason: memory ? "update_target_changed" : "update_target_removed",
                expectedRevision: proposal.baseRevision,
                currentRevision
              }
            );
          }
          if (memory) {
            baseMemorySnapshots[memory.id] = memoryRevision(memory);
          }
        }
        const relationDocument2 = this.readRelationsDocument(project.id);
        const relationKeys2 = new Set(
          relationDocument2.relations.map(
            (relation) => relationKey(relation.type, relation.fromMemoryId, relation.toMemoryId)
          )
        );
        const existingRelationEndpoint = (endpoint) => {
          if (!("memoryId" in endpoint) || !endpoint.memoryId) return null;
          return this.getMemory(endpoint.memoryId);
        };
        for (const item of relationItems) {
          if (!acceptedRelations.has(item.id)) continue;
          const fromMemory = existingRelationEndpoint(item.candidate.from);
          const toMemory = existingRelationEndpoint(item.candidate.to);
          for (const [endpoint, memory] of [
            [item.candidate.from, fromMemory],
            [item.candidate.to, toMemory]
          ]) {
            if (!("memoryId" in endpoint)) continue;
            if (!memory) {
              throw new ProjectMemoryError(
                "REVISION_CONFLICT",
                "A relation endpoint was removed after this proposal was created. Review the relation before committing.",
                {
                  proposalId,
                  itemId: item.id,
                  memoryId: endpoint.memoryId,
                  reason: "relation_endpoint_removed",
                  expectedRevision: proposal.baseRevision,
                  currentRevision
                }
              );
            }
            if (memory.projectId !== project.id && !this.hasReadAccess(project.id, memory.projectId)) {
              throw new ProjectMemoryError(
                "REVISION_CONFLICT",
                "A relation endpoint is no longer accessible from this project. Review the relation before committing.",
                {
                  proposalId,
                  itemId: item.id,
                  memoryId: endpoint.memoryId,
                  reason: "relation_endpoint_inaccessible",
                  expectedRevision: proposal.baseRevision,
                  currentRevision
                }
              );
            }
          }
          if (fromMemory && toMemory) {
            const key = relationKey(item.candidate.type, fromMemory.id, toMemory.id);
            if (relationKeys2.has(key)) {
              throw new ProjectMemoryError(
                "REVISION_CONFLICT",
                "An accepted relation now duplicates an existing relation. Review the proposal again.",
                {
                  proposalId,
                  itemId: item.id,
                  reason: "duplicate_relation",
                  expectedRevision: proposal.baseRevision,
                  currentRevision
                }
              );
            }
          }
        }
        const previousRevision = proposal.baseRevision;
        proposal.baseRevision = currentRevision;
        if (Object.keys(baseMemorySnapshots).length > 0) {
          proposal.baseMemorySnapshots = baseMemorySnapshots;
        }
        writeJson(proposalPath, proposal);
        this.audit("proposal_rebased", project.id, proposalId, {
          previousRevision,
          currentRevision
        });
      }
      const reviewedAt = now();
      const created = [];
      const createdByRef = /* @__PURE__ */ new Map();
      for (const item of proposal.items) {
        if (!accepted.has(item.id)) {
          item.status = "rejected";
          continue;
        }
        const candidate = item.candidate;
        const memory = {
          id: randomUUID(),
          projectId: project.id,
          projectName: project.name,
          kind: candidate.kind,
          title: candidate.title,
          summary: candidate.summary ?? null,
          topic: candidate.topic ?? null,
          briefRole: candidate.briefRole ?? null,
          workUnitId: candidate.workUnitId ?? null,
          runId: candidate.runId ?? null,
          phase: candidate.phase ?? null,
          sequence: candidate.sequence ?? null,
          narrative: candidate.narrative ?? null,
          content: candidate.content,
          tags: candidate.tags,
          sourceProjectId: candidate.sourceProjectId,
          sourcePath: candidate.sourcePath,
          sourceCommit: candidate.sourceCommit,
          sourceFileHash: candidate.sourceFileHash,
          citations: (candidate.citations ?? []).map((citation) => ({
            ...citation,
            sourceProjectName: "",
            stale: false,
            staleReason: null,
            accessible: true,
            fileUrl: null
          })),
          submittedBy: proposal.actor,
          sourceProposalId: proposal.id,
          confidence: candidate.confidence,
          status: "active",
          createdAt: reviewedAt,
          updatedAt: reviewedAt,
          stale: false,
          staleReason: null
        };
        memories.push(memory);
        created.push(memory);
        if (candidate.ref) createdByRef.set(candidate.ref, memory);
        item.status = "accepted";
      }
      const updatedMemories = [];
      const rejectedUpdateItems = [];
      for (const item of updateItems) {
        if (!acceptedUpdates.has(item.id)) {
          item.status = "rejected";
          item.rejectionReason = "not_accepted";
          continue;
        }
        const memory = memories.find((candidate) => candidate.id === item.candidate.memoryId);
        if (!memory || memory.projectId !== project.id) {
          item.status = "rejected";
          item.rejectionReason = "memory_unavailable";
          rejectedUpdateItems.push({
            id: item.id,
            proposalId: item.proposalId,
            candidate: publicUpdateCandidate(item.candidate),
            status: "rejected",
            rejectionReason: item.rejectionReason
          });
          continue;
        }
        if (item.candidate.summary !== void 0) memory.summary = item.candidate.summary;
        if (item.candidate.topic !== void 0) memory.topic = item.candidate.topic;
        if (item.candidate.briefRole !== void 0) memory.briefRole = item.candidate.briefRole;
        if (item.candidate.workUnitId !== void 0) memory.workUnitId = item.candidate.workUnitId;
        if (item.candidate.runId !== void 0) memory.runId = item.candidate.runId;
        if (item.candidate.phase !== void 0) memory.phase = item.candidate.phase;
        if (item.candidate.sequence !== void 0) memory.sequence = item.candidate.sequence;
        if (item.candidate.narrative !== void 0) memory.narrative = item.candidate.narrative;
        if (item.candidate.citations !== void 0) {
          memory.citations = item.candidate.citations.map((citation) => ({
            ...citation,
            sourceProjectName: "",
            stale: false,
            staleReason: null,
            accessible: true,
            fileUrl: null
          }));
        }
        memory.updatedAt = reviewedAt;
        updatedMemories.push(memory);
        item.status = "accepted";
        item.rejectionReason = null;
      }
      const relationDocument = this.readRelationsDocument(project.id);
      const relationKeys = new Set(
        relationDocument.relations.map(
          (relation) => relationKey(relation.type, relation.fromMemoryId, relation.toMemoryId)
        )
      );
      const createdRelations = [];
      const rejectedRelationItems = [];
      const resolveEndpoint = (endpoint) => {
        if (endpoint.memoryId) return this.getMemory(endpoint.memoryId);
        if (!("candidateRef" in endpoint) || !endpoint.candidateRef) return null;
        return createdByRef.get(endpoint.candidateRef) ?? null;
      };
      for (const item of relationItems) {
        if (!acceptedRelations.has(item.id)) {
          item.status = "rejected";
          item.rejectionReason = "not_accepted";
          continue;
        }
        const fromMemory = resolveEndpoint(item.candidate.from);
        const toMemory = resolveEndpoint(item.candidate.to);
        let rejectionReason = null;
        if (!fromMemory || !toMemory) {
          rejectionReason = "endpoint_unavailable";
        } else if (fromMemory.id === toMemory.id) {
          rejectionReason = "self_relation";
        } else if (fromMemory.projectId !== project.id && toMemory.projectId !== project.id) {
          rejectionReason = "current_project_endpoint_required";
        } else {
          const foreignProjectIds = new Set(
            [fromMemory.projectId, toMemory.projectId].filter((id) => id !== project.id)
          );
          if ([...foreignProjectIds].some((id) => !this.hasReadAccess(project.id, id))) {
            rejectionReason = "project_link_required";
          }
        }
        const key = fromMemory && toMemory ? relationKey(item.candidate.type, fromMemory.id, toMemory.id) : null;
        if (!rejectionReason && key && relationKeys.has(key)) {
          rejectionReason = "duplicate_relation";
        }
        if (rejectionReason || !fromMemory || !toMemory || !key) {
          item.status = "rejected";
          item.rejectionReason = rejectionReason ?? "invalid_relation";
          rejectedRelationItems.push({
            id: item.id,
            proposalId: item.proposalId,
            candidate: item.candidate,
            status: item.status,
            rejectionReason: item.rejectionReason
          });
          continue;
        }
        const relation = {
          id: randomUUID(),
          ownerProjectId: project.id,
          fromMemoryId: fromMemory.id,
          fromProjectId: fromMemory.projectId,
          toMemoryId: toMemory.id,
          toProjectId: toMemory.projectId,
          type: item.candidate.type,
          rationale: item.candidate.rationale,
          confidence: item.candidate.confidence,
          sourceProposalId: proposalId,
          status: "active",
          createdAt: reviewedAt,
          updatedAt: reviewedAt
        };
        relationDocument.relations.push(relation);
        relationKeys.add(key);
        createdRelations.push(relation);
        item.status = "accepted";
        item.rejectionReason = null;
      }
      proposal.status = "accepted";
      proposal.reviewedAt = reviewedAt;
      writePrivateFile(this.memoryPath(project.id), renderMemoryDocument(project.id, memories));
      this.writeRelationsDocument(relationDocument);
      writeJson(proposalPath, proposal);
      this.audit("memory_committed", project.id, proposalId, {
        acceptedItemIds: [...accepted],
        memoryIds: created.map((memory) => memory.id),
        acceptedUpdateIds: [...acceptedUpdates],
        updatedMemoryIds: updatedMemories.map((memory) => memory.id),
        rejectedUpdateItemIds: rejectedUpdateItems.map((item) => item.id),
        acceptedRelationIds: [...acceptedRelations],
        relationIds: createdRelations.map((relation) => relation.id),
        rejectedRelationItemIds: rejectedRelationItems.map((item) => item.id)
      });
      return {
        memories: created,
        updatedMemories,
        relations: createdRelations,
        rejectedUpdateItems,
        rejectedRelationItems
      };
    } finally {
      releaseLock();
    }
  }
  rejectProposal(proposalId) {
    const proposalPath = this.findProposalPath(proposalId);
    const initialProposal = proposalPath ? readJson(proposalPath) : null;
    if (initialProposal?.status !== "pending" || !proposalPath) {
      throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
        proposalId
      });
    }
    const releaseLock = this.acquireProjectLock(initialProposal.projectId);
    try {
      const proposal = readJson(proposalPath);
      if (proposal.status !== "pending") {
        throw new ProjectMemoryError("PROPOSAL_NOT_PENDING", "Proposal is not pending.", {
          proposalId
        });
      }
      proposal.status = "rejected";
      proposal.reviewedAt = now();
      for (const item of proposal.items) {
        item.status = "rejected";
      }
      for (const item of proposal.updateItems ?? []) {
        item.status = "rejected";
        item.rejectionReason = "proposal_rejected";
      }
      for (const item of proposal.relationItems ?? []) {
        item.status = "rejected";
        item.rejectionReason = "proposal_rejected";
      }
      writeJson(proposalPath, proposal);
      this.audit("memory_rejected", proposal.projectId, proposalId, {});
      return publicProposal(proposal);
    } finally {
      releaseLock();
    }
  }
  getMemory(memoryId) {
    for (const entry of this.readRegistry().projects) {
      const memory = this.getContext(entry.id, 1e3).find((candidate) => candidate.id === memoryId);
      if (memory) {
        return memory;
      }
    }
    return null;
  }
  getContext(projectId, limit = 30) {
    const project = this.requireProject(projectId);
    return this.recoverMemorySubmissionMetadata(
      projectId,
      parseMemoryDocument(this.memoryPath(projectId), project)
    ).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, Math.min(Math.max(limit, 1), 1e3));
  }
  recoverMemorySubmissionMetadata(projectId, memories) {
    const unresolved = memories.filter((memory) => !memory.submittedBy || !memory.sourceProposalId);
    if (unresolved.length === 0) return memories;
    const candidatesByKey = /* @__PURE__ */ new Map();
    const directory = this.proposalsDir(projectId);
    if (existsSync9(directory)) {
      for (const file of readdirSync6(directory).filter((name) => name.endsWith(".json"))) {
        const proposal = readJson(path11.join(directory, file));
        for (const item of proposal.items) {
          if (item.status !== "accepted") continue;
          const key = memoryIdentityKey(item.candidate.title, item.candidate.content);
          const matches = candidatesByKey.get(key) ?? [];
          matches.push({
            actor: proposal.actor ?? { platform: "legacy", adapterVersion: null },
            sourceProposalId: proposal.id
          });
          candidatesByKey.set(key, matches);
        }
      }
    }
    return memories.map((memory) => {
      if (memory.submittedBy && memory.sourceProposalId) return memory;
      const matches = candidatesByKey.get(memoryIdentityKey(memory.title, memory.content)) ?? [];
      if (matches.length !== 1) {
        return {
          ...memory,
          submittedBy: memory.submittedBy ?? null,
          sourceProposalId: memory.sourceProposalId ?? null
        };
      }
      const match = matches[0];
      return {
        ...memory,
        submittedBy: memory.submittedBy ?? match?.actor ?? null,
        sourceProposalId: memory.sourceProposalId ?? match?.sourceProposalId ?? null
      };
    });
  }
  searchMemories(projectIds, query, limit = 30) {
    if (projectIds.length === 0) {
      return [];
    }
    const tokens = (query.match(/[\p{L}\p{N}_-]+/gu) ?? []).map(
      (token) => token.toLocaleLowerCase()
    );
    if (tokens.length === 0) {
      throw new ProjectMemoryError("INVALID_INPUT", "Memory search query cannot be empty.");
    }
    return projectIds.flatMap((projectId) => this.getContext(projectId, 1e3)).map((memory) => ({ memory, score: scoreMemory(memory, tokens) })).filter(({ memory }) => {
      const haystack = `${memory.title}
${memory.tags.join(" ")}
${memory.content}`.toLocaleLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }).sort(
      (left, right) => right.score - left.score || right.memory.updatedAt.localeCompare(left.memory.updatedAt)
    ).slice(0, Math.min(Math.max(limit, 1), 100)).map(({ memory }) => memory);
  }
  forgetMemories(projectId, memoryIds) {
    this.requireProject(projectId);
    const releaseLock = this.acquireProjectLock(projectId);
    try {
      const forgotten = new Set(memoryIds);
      const memories = this.getContext(projectId, 1e3);
      const retained = memories.filter((memory) => !forgotten.has(memory.id));
      const removed = memories.filter((memory) => forgotten.has(memory.id)).map((memory) => memory.id);
      writePrivateFile(this.memoryPath(projectId), renderMemoryDocument(projectId, retained));
      const removedSet = new Set(removed);
      for (const entry of this.readRegistry().projects) {
        const document = this.readRelationsDocument(entry.id);
        const removedRelations = document.relations.filter(
          (relation) => removedSet.has(relation.fromMemoryId) || removedSet.has(relation.toMemoryId)
        );
        if (removedRelations.length === 0) continue;
        document.relations = document.relations.filter(
          (relation) => !removedSet.has(relation.fromMemoryId) && !removedSet.has(relation.toMemoryId)
        );
        this.writeRelationsDocument(document);
        this.audit("relations_forgotten", entry.id, null, {
          relationIds: removedRelations.map((relation) => relation.id),
          causedByMemoryIds: removed
        });
      }
      this.audit("memory_forgotten", projectId, null, { memoryIds: removed });
      return removed;
    } finally {
      releaseLock();
    }
  }
  forgetRelations(projectId, relationIds) {
    const releaseLock = this.acquireProjectLock(projectId);
    try {
      const document = this.readRelationsDocument(projectId);
      const requested = new Set(relationIds);
      const removed = document.relations.filter((relation) => requested.has(relation.id)).map((relation) => relation.id);
      document.relations = document.relations.filter((relation) => !requested.has(relation.id));
      this.writeRelationsDocument(document);
      this.audit("relations_forgotten", projectId, null, { relationIds: removed });
      return removed;
    } finally {
      releaseLock();
    }
  }
  exportProject(projectId) {
    const project = this.requireProject(projectId);
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now(),
      project,
      links: this.listLinks(projectId),
      memories: this.getContext(projectId, 1e3),
      relations: this.getRelations(projectId)
    };
  }
  countPendingProposals(projectId) {
    this.requireProject(projectId);
    const directory = this.proposalsDir(projectId);
    if (!existsSync9(directory)) {
      return 0;
    }
    return readdirSync6(directory).filter((file) => file.endsWith(".json")).map((file) => readJson(path11.join(directory, file))).filter((proposal) => proposal.status === "pending").length;
  }
  listProposals(status) {
    return this.listProjects().flatMap((project) => {
      const directory = this.proposalsDir(project.id);
      if (!existsSync9(directory)) return [];
      return readdirSync6(directory).filter((file) => file.endsWith(".json")).map((file) => publicProposal(readJson(path11.join(directory, file))));
    }).filter((proposal) => !status || proposal.status === status).sort(
      (left, right) => right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id)
    );
  }
  doctor() {
    const errors = [];
    const warnings = [];
    let memories = 0;
    let relations = 0;
    let suspendedRelations = 0;
    let pendingProposals = 0;
    const registry = this.readRegistry();
    for (const entry of registry.projects) {
      try {
        this.requireProject(entry.id);
        memories += this.getContext(entry.id, 1e3).length;
        const projectRelations = this.getRelations(entry.id);
        relations += projectRelations.length;
        const keys = /* @__PURE__ */ new Set();
        for (const relation of projectRelations) {
          if (relation.ownerProjectId !== entry.id) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Relation ${relation.id} has an invalid owner project.`
            });
          }
          if (!RELATION_TYPES.includes(relation.type)) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Relation ${relation.id} has an invalid type.`
            });
            continue;
          }
          const key = relationKey(relation.type, relation.fromMemoryId, relation.toMemoryId);
          if (keys.has(key)) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Duplicate relation ${relation.id}.`
            });
          }
          keys.add(key);
          if (relation.fromMemoryId === relation.toMemoryId) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Self relation ${relation.id}.`
            });
          }
          const fromMemory = this.getMemory(relation.fromMemoryId);
          const toMemory = this.getMemory(relation.toMemoryId);
          if (!fromMemory || !toMemory) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Relation ${relation.id} has a missing endpoint.`
            });
          } else if (fromMemory.projectId !== relation.fromProjectId || toMemory.projectId !== relation.toProjectId) {
            errors.push({
              path: this.relationsPath(entry.id),
              message: `Relation ${relation.id} endpoint project metadata is inconsistent.`
            });
          }
          const foreignProjectIds = new Set(
            [relation.fromProjectId, relation.toProjectId].filter((id) => id !== entry.id)
          );
          if ([...foreignProjectIds].some((id) => !this.hasReadAccess(entry.id, id))) {
            suspendedRelations += 1;
            warnings.push({
              path: this.relationsPath(entry.id),
              message: `Relation ${relation.id} is suspended because a project link is missing.`
            });
          }
        }
        pendingProposals += this.countPendingProposals(entry.id);
      } catch (error) {
        errors.push({
          path: this.projectDir(entry.id),
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    this.readLinks();
    return {
      ok: errors.length === 0,
      integrity: errors.length === 0 ? ["ok"] : errors,
      warnings,
      storageRoot: this.storageRoot,
      storageFormat: "markdown-json",
      schemaVersion: SCHEMA_VERSION,
      memorySchemaVersion: MEMORY_SCHEMA_VERSION,
      nodeVersion: process.version,
      counts: {
        projects: registry.projects.length,
        memories,
        relations,
        suspendedRelations,
        pendingProposals
      }
    };
  }
  requireProject(projectId) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new ProjectMemoryError("PROJECT_NOT_REGISTERED", "Project is not registered.", {
        projectId
      });
    }
    return project;
  }
};

// ../../packages/project-memory-core/src/cli.ts
function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = /* @__PURE__ */ new Map();
  const positionals = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token?.startsWith("--")) {
      if (token) positionals.push(token);
      continue;
    }
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      options.set(token.slice(2), "true");
      continue;
    }
    options.set(token.slice(2), value);
    index += 1;
  }
  return { command, options, positionals };
}
function option(args, name, fallback) {
  const value = args.options.get(name) ?? fallback;
  if (value === void 0) {
    throw new ProjectMemoryError("INVALID_INPUT", `Missing required option --${name}.`);
  }
  return value;
}
function integerOption(args, name, fallback) {
  const value = Number(args.options.get(name) ?? fallback);
  if (!Number.isInteger(value) || value < 1) {
    throw new ProjectMemoryError("INVALID_INPUT", `--${name} must be a positive integer.`);
  }
  return value;
}
function listOption(args, name) {
  return (args.options.get(name) ?? "").split(",").map((value) => value.trim()).filter(Boolean);
}
function jsonInput(args) {
  const inline = args.options.get("json");
  const filePath = args.options.get("json-file");
  const raw = inline ?? (filePath ? readFileSync9(filePath, "utf8") : readFileSync9(0, "utf8"));
  if (!raw.trim()) {
    throw new ProjectMemoryError(
      "INVALID_INPUT",
      "Provide JSON with --json, --json-file, or stdin."
    );
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ProjectMemoryError("INVALID_INPUT", "Input JSON is invalid.", {
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}
function createService() {
  const dataDir = ensureDataDir(resolveDataDir());
  return new ProjectMemoryService(new MemoryStore(dataDir), dataDir);
}
function openLocalFile(filePath) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const commandArgs = process.platform === "win32" ? ["/c", "start", "", filePath] : [filePath];
  const result = spawnSync3(command, commandArgs, { stdio: "ignore" });
  if (result.status !== 0) {
    throw new ProjectMemoryError("STORAGE_ERROR", "Unable to open the local Talo view.", {
      path: filePath
    });
  }
}
function registeredProjectId(service, pathValue) {
  const detected = service.detectProject(pathValue);
  if (!detected.registeredProject) {
    throw new ProjectMemoryError("PROJECT_NOT_REGISTERED", "Project is not registered.", {
      rootPath: detected.rootPath,
      relocationCandidates: detected.relocationCandidates
    });
  }
  return detected.registeredProject.id;
}
function refreshProjectGraph(service, projectId) {
  try {
    const graph = service.buildGraph(projectId, null, 1, false);
    return { ok: true, ...service.writeGraphHtml(projectId, graph) };
  } catch (error) {
    return { ok: false, error: normalizeError(error) };
  }
}
function help() {
  return {
    name: "Talo",
    tagline: "Never start over.",
    usage: "talo <command> [options]",
    compatibilityUsage: "project-memory <command> [options]",
    graphView: "HTML opens with a project brief; use relationship trace and reading modes for deeper inspection.",
    commands: {
      detect: "detect [--path PATH]",
      register: "register [--path PATH] [--name NAME] [--relink-project-id ID]",
      status: "status [--path PATH]",
      load: "load [--path PATH] [--limit N]",
      search: "search --query TEXT [--path PATH] [--include-linked true] [--limit N]",
      recall: "recall (--query TEXT|--recent true) [--path PATH] [--include-linked true] [--limit N] [--recommend N] [--budget-tokens N]",
      get: "get --memory-ids ID,ID [--path PATH] [--include-linked true] [--budget-tokens N]",
      propose: "propose [--path PATH] [--json JSON|--json-file FILE|stdin]",
      commit: "commit --proposal-id ID [--accepted-item-ids ID,ID] [--accepted-update-ids ID,ID] [--accepted-relation-ids ID,ID] [--refresh-sources true]",
      reject: "reject --proposal-id ID",
      link: "link --source-project-id ID --target-project-id ID",
      unlink: "unlink --source-project-id ID --target-project-id ID",
      links: "links [--path PATH]",
      "search-files": "search-files --target-project-id ID --query TEXT [--path PATH]",
      "read-file": "read-file --target-project-id ID --relative-path PATH [--path PATH]",
      story: "story [--path PATH] [--format json|html] [--output PATH] [--open true]",
      hub: "hub [--format json|html] [--open true]",
      open: "open [--path PATH]",
      proposals: "proposals [--status pending|accepted|rejected]",
      capabilities: "capabilities [--platform NAME]",
      home: "home | home select --path PATH",
      "migrate-home": "migrate-home --from PATH --to PATH",
      shortcut: "shortcut install|remove",
      integration: "integration install|status|repair|remove codex|claude|antigravity",
      desktop: "desktop hub | desktop project --project-id ID | desktop integrations",
      relations: "relations --memory-id ID [--direction in|out|both] [--types CSV] [--include-linked true]",
      path: "path --from-memory-id ID --to-memory-id ID [--max-depth N] [--include-linked true]",
      graph: "graph [--memory-id ID] [--depth N] [--include-linked true] [--format json|mermaid|markdown|html] [--output PATH] [--open true]",
      guide: "guide [--path PATH] [--include-linked true] [--limit N]",
      brief: "brief [--path PATH] [--include-linked true] [--limit N]",
      export: "export [--path PATH]",
      forget: "forget --memory-ids ID,ID [--path PATH]",
      "forget-relations": "forget-relations --relation-ids ID,ID [--path PATH]",
      doctor: "doctor",
      binding: "binding"
    }
  };
}
function runCommand2(argv) {
  const args = parseArgs(argv);
  if (args.command === "help" || args.options.has("help")) {
    return help();
  }
  if (args.command === "home") {
    if (args.positionals[0] === "select") return selectDataDir(option(args, "path"));
    if (args.positionals.length > 0) {
      throw new ProjectMemoryError("INVALID_INPUT", "Use `home` or `home select --path PATH`.");
    }
    return inspectDataHomes();
  }
  if (args.command === "migrate-home") {
    return migrateDataDir(option(args, "from"), option(args, "to"));
  }
  if (args.command === "capabilities") {
    return {
      protocolVersion: 1,
      platform: args.options.get("platform") ?? "generic",
      commands: [
        "detect",
        "recall",
        "get",
        "brief",
        "story",
        "guide",
        "relations",
        "graph",
        "hub",
        "propose",
        "commit",
        "reject",
        "integration"
      ],
      storage: "local-markdown-json",
      networkRequired: false,
      mcpRequired: false,
      reviewModes: ["structured", "conversational", "shared-inbox"]
    };
  }
  if (args.command === "shortcut") {
    if (args.positionals[0] === "install") return installShortcut();
    if (args.positionals[0] === "remove") return removeShortcut();
    throw new ProjectMemoryError("INVALID_INPUT", "Use `shortcut install` or `shortcut remove`.");
  }
  if (args.command === "integration") {
    const action = args.positionals[0];
    const platform = args.positionals[1];
    if (!action || !["install", "status", "repair", "remove"].includes(action) || !platform || !["codex", "claude", "antigravity"].includes(platform)) {
      throw new ProjectMemoryError(
        "INVALID_INPUT",
        "Use `integration install|status|repair|remove codex|claude|antigravity`."
      );
    }
    if (action === "status") {
      if (platform === "antigravity" && args.options.get("legacy") === "true") {
        return antigravityIntegrationStatus();
      }
      return scanDesktopIntegrations({
        marketplaceRoot: args.options.get("marketplace-root") ?? null
      }).find((status) => status.platform === platform);
    }
    const marketplaceRoot = args.options.get("marketplace-root") ?? null;
    if (action === "install") {
      return installDesktopIntegration(platform, {
        marketplaceRoot,
        migrateExternal: args.options.get("migrate-external") === "true"
      });
    }
    if (action === "repair") {
      return repairDesktopIntegration(platform, {
        dataRoot: args.options.get("data-root")
      });
    }
    return removeDesktopIntegration(platform, { marketplaceRoot });
  }
  const service = createService();
  try {
    const pathValue = args.options.get("path") ?? process.cwd();
    switch (args.command) {
      case "desktop": {
        const action = args.positionals[0];
        if (action === "hub") return service.buildDesktopHubSnapshot();
        if (action === "register") {
          const platform = option(args, "platform");
          if (platform !== "codex" && platform !== "claude" && platform !== "antigravity") {
            throw new ProjectMemoryError(
              "INVALID_INPUT",
              "Platform must be codex, claude, or antigravity."
            );
          }
          return service.registerDesktopPlatformProject(platform, option(args, "path"));
        }
        if (action === "project") {
          return service.buildDesktopProjectView(option(args, "project-id"));
        }
        if (action === "integrations") {
          return scanDesktopIntegrations({
            marketplaceRoot: args.options.get("marketplace-root") ?? null
          });
        }
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Use `desktop hub`, `desktop register --platform PLATFORM --path PATH`, `desktop project --project-id ID`, or `desktop integrations`."
        );
      }
      case "detect":
        return service.detectProject(pathValue);
      case "register":
        return service.registerProject(
          pathValue,
          args.options.get("name"),
          args.options.get("relink-project-id")
        );
      case "status": {
        const detected = service.detectProject(pathValue);
        return detected.registeredProject ? service.projectStatus(detected.registeredProject.id) : { registered: false, detection: detected };
      }
      case "load":
        return {
          memories: service.getContext(
            registeredProjectId(service, pathValue),
            integerOption(args, "limit", 30)
          )
        };
      case "search":
        return {
          memories: service.searchMemory(
            registeredProjectId(service, pathValue),
            option(args, "query"),
            args.options.get("include-linked") === "true",
            integerOption(args, "limit", 30)
          )
        };
      case "recall":
        return service.recallMemory(
          registeredProjectId(service, pathValue),
          args.options.get("query") ?? null,
          args.options.get("recent") === "true",
          args.options.get("include-linked") === "true",
          integerOption(args, "limit", 8),
          integerOption(args, "recommend", 3),
          integerOption(args, "budget-tokens", 800)
        );
      case "get":
        return service.getMemoriesById(
          registeredProjectId(service, pathValue),
          listOption(args, "memory-ids"),
          args.options.get("include-linked") === "true",
          integerOption(args, "budget-tokens", 1700)
        );
      case "propose": {
        const input = jsonInput(args);
        const candidates = Array.isArray(input) ? input : input.candidates;
        const updates = Array.isArray(input) ? [] : input.updates;
        const relations = Array.isArray(input) ? [] : input.relations;
        const actor = Array.isArray(input) ? { platform: args.options.get("platform") ?? "generic", adapterVersion: null } : input.actor ?? {
          platform: args.options.get("platform") ?? "generic",
          adapterVersion: args.options.get("adapter-version") ?? null
        };
        if (candidates !== void 0 && !Array.isArray(candidates)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal candidates must be an array.");
        }
        if (relations !== void 0 && !Array.isArray(relations)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal relations must be an array.");
        }
        if (updates !== void 0 && !Array.isArray(updates)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Proposal updates must be an array.");
        }
        return service.proposeMemory(
          registeredProjectId(service, pathValue),
          candidates ?? [],
          relations ?? [],
          updates ?? [],
          actor
        );
      }
      case "commit": {
        const proposalId = option(args, "proposal-id");
        const proposal = service.store.getProposal(proposalId);
        const refreshSourcesOption = args.options.get("refresh-sources");
        if (refreshSourcesOption !== void 0 && !["true", "false"].includes(refreshSourcesOption)) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "The refresh-sources option must be true or false."
          );
        }
        const result = service.commitMemory(
          proposalId,
          listOption(args, "accepted-item-ids"),
          listOption(args, "accepted-relation-ids"),
          listOption(args, "accepted-update-ids"),
          refreshSourcesOption === "true"
        );
        return {
          ...result,
          viewRefresh: proposal ? refreshProjectGraph(service, proposal.projectId) : { ok: false, error: { message: "Proposal project was not found." } }
        };
      }
      case "reject":
        return service.rejectMemory(option(args, "proposal-id"));
      case "link":
        return service.linkProjects(
          option(args, "source-project-id"),
          option(args, "target-project-id")
        );
      case "unlink":
        return service.unlinkProjects(
          option(args, "source-project-id"),
          option(args, "target-project-id")
        );
      case "links":
        return {
          links: service.store.listLinks(registeredProjectId(service, pathValue))
        };
      case "search-files": {
        const sourceProjectId = registeredProjectId(service, pathValue);
        return service.searchFiles(
          sourceProjectId,
          option(args, "target-project-id"),
          option(args, "query")
        );
      }
      case "read-file": {
        const sourceProjectId = registeredProjectId(service, pathValue);
        return service.readFile(
          sourceProjectId,
          option(args, "target-project-id"),
          option(args, "relative-path")
        );
      }
      case "relations": {
        const direction = option(args, "direction", "both");
        if (!["in", "out", "both"].includes(direction)) {
          throw new ProjectMemoryError("INVALID_INPUT", "Direction must be in, out, or both.");
        }
        return service.listMemoryRelations(
          registeredProjectId(service, pathValue),
          option(args, "memory-id"),
          direction,
          listOption(args, "types"),
          args.options.get("include-linked") === "true"
        );
      }
      case "path":
        return service.findRelationPath(
          registeredProjectId(service, pathValue),
          option(args, "from-memory-id"),
          option(args, "to-memory-id"),
          integerOption(args, "max-depth", 4),
          args.options.get("include-linked") === "true"
        );
      case "guide": {
        const projectId = registeredProjectId(service, pathValue);
        const graph = service.buildGraph(
          projectId,
          null,
          1,
          args.options.get("include-linked") === "true"
        );
        return service.buildGraphGuide(projectId, graph, integerOption(args, "limit", 12));
      }
      case "brief": {
        const projectId = registeredProjectId(service, pathValue);
        const limit = integerOption(args, "limit", 12);
        const graph = service.buildGraph(
          projectId,
          null,
          1,
          args.options.get("include-linked") === "true"
        );
        return service.buildProjectBrief(projectId, graph, limit);
      }
      case "story": {
        const projectId = registeredProjectId(service, pathValue);
        const format = option(args, "format", "json");
        if (format === "json") return service.buildProjectStory(projectId);
        if (format === "html") {
          const graph = service.buildGraph(projectId, null, 1, false);
          const result = service.writeGraphHtml(projectId, graph, args.options.get("output"));
          if (args.options.get("open") === "true") openLocalFile(result.outputPath);
          return result;
        }
        throw new ProjectMemoryError("INVALID_INPUT", "Story format must be json or html.");
      }
      case "proposals": {
        const status = args.options.get("status");
        if (status && !["pending", "accepted", "rejected"].includes(status)) {
          throw new ProjectMemoryError(
            "INVALID_INPUT",
            "Proposal status must be pending, accepted, or rejected."
          );
        }
        return {
          proposals: service.store.listProposals(status)
        };
      }
      case "hub": {
        if (option(args, "format", "html") === "json") return service.buildMemoryHub(false);
        const result = service.writeMemoryHub(true);
        if (args.options.get("open") === "true") openLocalFile(result.outputPath);
        return result;
      }
      case "open": {
        if (args.options.has("path")) {
          const projectId = registeredProjectId(service, pathValue);
          const graph = service.buildGraph(projectId, null, 1, false);
          const result2 = service.writeGraphHtml(projectId, graph);
          openLocalFile(result2.outputPath);
          return result2;
        }
        const result = service.writeMemoryHub(true);
        openLocalFile(result.outputPath);
        return result;
      }
      case "graph": {
        const projectId = registeredProjectId(service, pathValue);
        const graph = service.buildGraph(
          projectId,
          args.options.get("memory-id") ?? null,
          integerOption(args, "depth", 1),
          args.options.get("include-linked") === "true"
        );
        const format = option(args, "format", "json");
        if (format === "json") return graph;
        if (format === "mermaid") return service.renderGraphMermaid(graph);
        if (format === "markdown") return service.renderGraphMarkdown(projectId, graph);
        if (format === "html") {
          const result = service.writeGraphHtml(projectId, graph, args.options.get("output"));
          if (args.options.get("open") === "true") {
            openLocalFile(result.outputPath);
          }
          return result;
        }
        throw new ProjectMemoryError(
          "INVALID_INPUT",
          "Graph format must be json, mermaid, markdown, or html."
        );
      }
      case "export":
        return service.exportProject(registeredProjectId(service, pathValue));
      case "forget":
        return {
          forgottenMemoryIds: service.store.forgetMemories(
            registeredProjectId(service, pathValue),
            option(args, "memory-ids").split(",").map((value) => value.trim()).filter(Boolean)
          )
        };
      case "forget-relations":
        return {
          forgottenRelationIds: service.store.forgetRelations(
            registeredProjectId(service, pathValue),
            listOption(args, "relation-ids")
          )
        };
      case "doctor":
        return service.store.doctor();
      case "binding":
        return service.bindingSnippet(args.options.get("platform") ?? "codex");
      default:
        throw new ProjectMemoryError("INVALID_INPUT", `Unknown command: ${args.command}`);
    }
  } finally {
    service.store.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL3(process.argv[1]).href) {
  try {
    const result = runCommand2(process.argv.slice(2));
    process.stdout.write(
      typeof result === "string" ? result : `${JSON.stringify(result, null, 2)}
`
    );
  } catch (error) {
    process.stderr.write(`${JSON.stringify(normalizeError(error), null, 2)}
`);
    process.exitCode = 1;
  }
}
export {
  runCommand2 as runCommand
};
