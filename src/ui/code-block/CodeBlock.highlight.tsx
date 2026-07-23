import type { JSX } from "react";

const KEYWORDS = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
  "function", "if", "import", "in", "instanceof", "let", "new", "null", "return",
  "super", "switch", "this", "throw", "true", "try", "typeof", "undefined", "var",
  "void", "while", "with", "yield", "async", "await", "of", "from", "as", "type",
  "interface", "implements", "namespace", "abstract", "static", "private",
  "protected", "public", "readonly", "get", "set", "keyof", "infer", "never",
  "any", "unknown", "boolean", "string", "number", "symbol", "object",
]);

export interface Token { text: string; className: string; }

function skipWs(code: string, i: number) { let j = i; while (j < code.length && /\s/.test(code[j])) j++; return j; }

export function tokenizeJsTs(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    if (code[i] === "/" && code[i + 1] === "/") { let j = i; while (j < code.length && code[j] !== "\n") j++; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "/" && code[i + 1] === "*") { let j = i + 2; while (j < code.length && !(code[j] === "*" && code[j + 1] === "/")) j++; j += 2; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "`") { let j = i + 1; while (j < code.length && code[j] !== "`") { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === "." && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i;
      if (code[j] === "0" && /[xX]/.test(code[j + 1] || "")) { j += 2; while (j < code.length && /[0-9a-fA-F]/.test(code[j])) j++; }
      else if (code[j] === "0" && /[bB]/.test(code[j + 1] || "")) { j += 2; while (j < code.length && /[01]/.test(code[j])) j++; }
      else { while (j < code.length && /[0-9.eE+\-_]/.test(code[j])) j++; }
      tokens.push({ text: code.slice(i, j), className: "number" }); i = j; continue;
    }
    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({ text: word, className: KEYWORDS.has(word) ? "keyword" : /^[A-Z]/.test(word) ? "type" : "identifier" });
      i = j; continue;
    }
    // Multi-char operators
    const multiChar = ["===", "!==", "==", "!=", "<=", ">=", "&&", "||", "??", "=>", "++", "--", "**", "+=", "-=", "*=", "/=", "%=", "<<", ">>", "..."];
    let matched = false;
    for (const op of multiChar) { if (code.startsWith(op, i)) { tokens.push({ text: op, className: "operator" }); i += op.length; matched = true; break; } }
    if (matched) continue;
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

export function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    if (code[i] === '"') {
      let j = i + 1; while (j < code.length && code[j] !== '"') { if (code[j] === "\\") j++; j++; } j++;
      tokens.push({ text: code.slice(i, j), className: code.slice(j).trimStart().startsWith(":") ? "key" : "string" }); i = j; continue;
    }
    if (/[0-9]/.test(code[i]) || (code[i] === "-" && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i; if (code[j] === "-") j++; while (j < code.length && /[0-9.eE+\-]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: "number" }); i = j; continue;
    }
    const words = { true: 4, false: 5, null: 4 };
    for (const [w, len] of Object.entries(words)) { if (code.startsWith(w, i)) { tokens.push({ text: w, className: "keyword" }); i += len; break; } }
    if (i >= code.length || words[code[i] as keyof typeof words]) continue;
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

export function tokenizeBash(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  const add = (text: string, cls: string) => { if (text) tokens.push({ text, className: cls }); };
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let i = 0;
    while (i < line.length) {
      if (line[i] === "#") { add(line.slice(i), "comment"); i = line.length; continue; }
      if (line[i] === '"' || line[i] === "'") { const q = line[i]; let j = i + 1; while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++; } j++; add(line.slice(i, j), "string"); i = j; continue; }
      if (line[i] === "$" && line[i + 1] === "{") { let j = i + 2, depth = 1; while (j < line.length && depth > 0) { if (line[j] === "{") depth++; if (line[j] === "}") depth--; j++; } add(line.slice(i, j), "keyword"); i = j; continue; }
      if (line[i] === "$" && /[a-zA-Z_]/.test(line[i + 1] || "")) { let j = i + 1; while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++; add(line.slice(i, j), "keyword"); i = j; continue; }
      add(line[i], "punctuation"); i++;
    }
    if (li < lines.length - 1) add("\n", "whitespace");
  }
  return tokens;
}

// ─── CSS ───
const CSS_PSEUDO = /:(?:active|after|before|checked|disabled|empty|enabled|first-child|first-letter|first-line|focus|hover|invalid|last-child|link|nth-child|nth-last-child|required|root|target|valid|visited)\b/;

export function tokenizeCss(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    if (code[i] === "/" && code[i + 1] === "*") { let j = i + 2; while (j < code.length && !(code[j] === "*" && code[j + 1] === "/")) j++; j += 2; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    if (/[0-9]/.test(code[i]) || (code[i] === "." && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i; while (j < code.length && /[0-9.eE%pxsvw]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: "number" }); i = j; continue;
    }
    if (code[i] === "@") { let j = i + 1; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: "keyword" }); i = j; continue; }
    if (code[i] === "#" || code[i] === "." && /[a-zA-Z0-9]/.test(code[i + 1] || "")) { let j = i + 1; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: "tag" }); i = j; continue; }
    if (CSS_PSEUDO.test(code.slice(i))) { const m = CSS_PSEUDO.exec(code.slice(i))!; tokens.push({ text: m[0], className: "type" }); i += m[0].length; continue; }
    if (/[a-zA-Z_-]/.test(code[i])) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      // Heuristic: word followed by ':' is a property, otherwise a selector/tag
      const after = code.slice(j).trimStart();
      tokens.push({ text: word, className: after.startsWith(":") ? "key" : "tag" });
      i = j; continue;
    }
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

// ─── HTML ───
export function tokenizeHtml(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (code.startsWith("<!--", i)) { let j = i + 4; while (j < code.length && !code.startsWith("-->", j)) j++; j += 3; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "<" && (code[i + 1] === "!" || code[i + 1] === "?")) { let j = i; while (j < code.length && code[j] !== ">") j++; j++; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "<" && code[i + 1] === "/") { tokens.push({ text: "</", className: "punctuation" }); i += 2; continue; }
    if (code[i] === "<") { tokens.push({ text: "<", className: "punctuation" }); i++;
      if (/[a-zA-Z]/.test(code[i] || "")) { let j = i; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: "tag" }); i = j; }
      continue;
    }
    if (code[i] === "/" && code[i + 1] === ">") { tokens.push({ text: "/>", className: "punctuation" }); i += 2; continue; }
    if (code[i] === ">") { tokens.push({ text: ">", className: "punctuation" }); i++; continue; }
    // Attribute value
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) j++; j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    // Attribute name
    if (/[a-zA-Z_]/.test(code[i])) { let j = i; while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({ text: word, className: code.slice(j).trimStart().startsWith("=") ? "key" : "identifier" });
      i = j; continue;
    }
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

// ─── Python ───
const PY_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "False", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "None", "nonlocal", "not",
  "or", "pass", "raise", "return", "True", "try", "while", "with", "yield",
]);

export function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === "#") { let j = i; while (j < code.length && code[j] !== "\n") j++; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    // Triple-quoted strings
    if (code.startsWith("'''", i) || code.startsWith('"""', i)) { const q = code.slice(i, i + 3); let j = i + 3; while (j < code.length && !code.startsWith(q, j)) j++; j += 3; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = i + 1; while (j < code.length && code[j] !== q) { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    // f-strings
    if (/[fF]/.test(code[i]) && (code[i + 1] === '"' || code[i + 1] === "'")) { const q = code[i + 1]; let j = i + 2; while (j < code.length && code[j] !== q) { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    if (/[0-9]/.test(code[i]) || (code[i] === "." && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i; if (code[j] === "0" && /[xXbB]/.test(code[j + 1] || "")) { j += 2; while (j < code.length && /[0-9a-fA-F_]/.test(code[j])) j++; } else { while (j < code.length && /[0-9.eE_jJ]/.test(code[j])) j++; }
      tokens.push({ text: code.slice(i, j), className: "number" }); i = j; continue;
    }
    // Decorator
    if (code[i] === "@") { let j = i + 1; while (j < code.length && /[a-zA-Z0-9_.]/.test(code[j])) j++; tokens.push({ text: code.slice(i, j), className: "type" }); i = j; continue; }
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({ text: word, className: PY_KEYWORDS.has(word) ? "keyword" : /^[A-Z]/.test(word) ? "type" : "identifier" });
      i = j; continue;
    }
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

// ─── YAML ───
export function tokenizeYaml(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let i = 0;
    // Leading indent
    if (/^\s+/.test(line)) { const m = line.match(/^\s+/)!; tokens.push({ text: m[0], className: "whitespace" }); i = m[0].length; }
    if (i >= line.length) { if (li < lines.length - 1) tokens.push({ text: "\n", className: "whitespace" }); continue; }
    if (line[i] === "#") { tokens.push({ text: line.slice(i), className: "comment" }); if (li < lines.length - 1) tokens.push({ text: "\n", className: "whitespace" }); continue; }
    if (line[i] === "-" && (line[i + 1] === " " || i + 1 >= line.length)) { tokens.push({ text: "-", className: "punctuation" }); i++; while (i < line.length && line[i] === " ") i++; }
    // Key (word before colon)
    if (/[a-zA-Z_"]/.test(line[i])) {
      if (line[i] === '"' || line[i] === "'") { const q = line[i]; let j = i + 1; while (j < line.length && line[j] !== q) j++; j++; tokens.push({ text: line.slice(i, j), className: "key" }); i = j; }
      else { let j = i; while (j < line.length && !/[:\s#]/.test(line[j])) j++; const word = line.slice(i, j); const after = line.slice(j).trimStart(); tokens.push({ text: word, className: after.startsWith(":") ? "key" : "string" }); i = j; }
      // Consume colon + space
      while (i < line.length && /[:\s]/.test(line[i])) { tokens.push({ text: line[i], className: line[i] === ":" ? "punctuation" : "whitespace" }); i++; }
      // Value
      if (i < line.length && line[i] !== "#") {
        if (line[i] === '"' || line[i] === "'") { const q = line[i]; let j = i + 1; while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++; } j++; tokens.push({ text: line.slice(i, j), className: "string" }); i = j; }
        else if (/true|false|yes|no|null|on|off/i.test(line.slice(i).split(/#|\s/)[0])) { const w = line.slice(i).split(/#|\s/)[0]; tokens.push({ text: w, className: "keyword" }); i += w.length; }
        else if (/[0-9]/.test(line[i]) || line[i] === "-") { let j = i; if (line[j] === "-") j++; while (j < line.length && /[0-9.eE]/.test(line[j])) j++; tokens.push({ text: line.slice(i, j), className: "number" }); i = j; }
        else { let j = i; while (j < line.length && line[j] !== "#") j++; tokens.push({ text: line.slice(i, j).trimEnd(), className: "string" }); i = j; }
      }
      if (i < line.length && line[i] === "#") tokens.push({ text: line.slice(i), className: "comment" });
      if (li < lines.length - 1) tokens.push({ text: "\n", className: "whitespace" });
      continue;
    }
    // Pipe / angle (block scalar indicators)
    if (line[i] === "|" || line[i] === ">") { tokens.push({ text: line[i], className: "operator" }); i++; }
    while (i < line.length) { tokens.push({ text: line[i], className: "punctuation" }); i++; }
    if (li < lines.length - 1) tokens.push({ text: "\n", className: "whitespace" });
  }
  return tokens;
}

// ─── SQL ───
const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "VIEW", "JOIN",
  "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "ON", "AS", "AND", "OR", "NOT",
  "NULL", "IS", "IN", "BETWEEN", "LIKE", "ORDER", "BY", "ASC", "DESC",
  "GROUP", "HAVING", "LIMIT", "OFFSET", "UNION", "ALL", "DISTINCT", "CASE",
  "WHEN", "THEN", "ELSE", "END", "EXISTS", "PRIMARY", "KEY", "FOREIGN",
  "REFERENCES", "CONSTRAINT", "DEFAULT", "CHECK", "INT", "INTEGER",
  "VARCHAR", "TEXT", "BOOLEAN", "FLOAT", "DOUBLE", "DECIMAL", "TIMESTAMP",
  "DATE", "TRUE", "FALSE", "COUNT", "SUM", "AVG", "MAX", "MIN", "TRUNCATE",
  "IF", "BEGIN", "COMMIT", "ROLLBACK", "GRANT", "REVOKE", "WITH", "RECURSIVE",
]);

export function tokenizeSql(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    if (/\s/.test(code[i])) { const j = skipWs(code, i); if (j > i) tokens.push({ text: code.slice(i, j), className: "whitespace" }); i = j; continue; }
    if (code[i] === "-" && code[i + 1] === "-") { let j = i; while (j < code.length && code[j] !== "\n") j++; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "/" && code[i + 1] === "*") { let j = i + 2; while (j < code.length && !(code[j] === "*" && code[j + 1] === "/")) j++; j += 2; tokens.push({ text: code.slice(i, j), className: "comment" }); i = j; continue; }
    if (code[i] === "'") { let j = i + 1; while (j < code.length && code[j] !== "'") { if (code[j] === "\\") j++; j++; } j++; tokens.push({ text: code.slice(i, j), className: "string" }); i = j; continue; }
    if (/[0-9]/.test(code[i]) || (code[i] === "." && /[0-9]/.test(code[i + 1] || ""))) {
      let j = i; while (j < code.length && /[0-9.eE]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), className: "number" }); i = j; continue;
    }
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({ text: word, className: SQL_KEYWORDS.has(word.toUpperCase()) ? "keyword" : "identifier" });
      i = j; continue;
    }
    tokens.push({ text: code[i], className: "punctuation" }); i++;
  }
  return tokens;
}

const TOKENIZERS: Record<string, (code: string) => Token[]> = {
  js: tokenizeJsTs, jsx: tokenizeJsTs, ts: tokenizeJsTs, tsx: tokenizeJsTs,
  javascript: tokenizeJsTs, typescript: tokenizeJsTs,
  json: tokenizeJson, tsconfig: tokenizeJson,
  bash: tokenizeBash, sh: tokenizeBash, shell: tokenizeBash,
  css: tokenizeCss, scss: tokenizeCss, less: tokenizeCss,
  html: tokenizeHtml, htm: tokenizeHtml, xml: tokenizeHtml,
  python: tokenizePython, py: tokenizePython,
  yaml: tokenizeYaml, yml: tokenizeYaml,
  sql: tokenizeSql, pgsql: tokenizeSql, mysql: tokenizeSql,
};

export function tokenize(code: string, language?: string): Token[] | null {
  const lang = language?.toLowerCase();
  if (!lang || !TOKENIZERS[lang]) return null;
  return TOKENIZERS[lang](code);
}

export function renderHighlighted(tokens: Token[]): JSX.Element {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.className === "whitespace" ? undefined : `hl-${t.className}`}>{t.text}</span>
      ))}
    </>
  );
}

/** Split flat tokens into per-line arrays, removing newline whitespace. */
export function splitTokensByLine(tokens: Token[]): Token[][] {
  const result: Token[][] = [];
  let current: Token[] = [];
  for (const t of tokens) {
    if (t.text === "\n") { result.push(current); current = []; continue; }
    if (t.text.includes("\n")) {
      const parts = t.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) { result.push(current); current = []; }
        if (parts[i]) current.push({ text: parts[i], className: t.className });
      }
    } else {
      current.push(t);
    }
  }
  if (current.length > 0) result.push(current);
  return result;
}

/** Render a single line of tokens. */
export function renderHighlightedLine(tokens: Token[]): JSX.Element {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.className === "whitespace" ? undefined : `hl-${t.className}`}>{t.text}</span>
      ))}
    </>
  );
}
