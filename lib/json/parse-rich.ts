import {
  parse as jsoncParse,
  printParseErrorCode,
  type ParseError,
  type ParseErrorCode,
} from "jsonc-parser";

export type RichError = {
  message: string;
  line: number;
  column: number;
  offset: number;
  length: number;
  lineText: string;
};

export type RichParseResult =
  | { ok: true; value: unknown }
  | { ok: false; errors: RichError[] };

export function parseRich(
  input: string,
  options: { tolerant?: boolean } = {},
): RichParseResult {
  if (input.trim() === "") {
    return { ok: true, value: undefined };
  }

  const tolerant = options.tolerant ?? false;
  const errors: ParseError[] = [];
  const value = jsoncParse(input, errors, {
    allowTrailingComma: tolerant,
    disallowComments: !tolerant,
  });

  if (errors.length === 0) {
    return { ok: true, value };
  }

  return {
    ok: false,
    errors: errors.map((e) => {
      const { line, column, lineText } = offsetToLineCol(input, e.offset);
      return {
        offset: e.offset,
        length: e.length,
        line,
        column,
        lineText,
        message: humanMessage(e.error),
      };
    }),
  };
}

const errorMessages: Record<string, string> = {
  PropertyNameExpected: "Expected a property name (a string in quotes).",
  ValueExpected: "Expected a value.",
  ColonExpected: "Missing colon between key and value.",
  CommaExpected: "Missing comma between items.",
  CloseBraceExpected: "Missing closing brace } for object.",
  CloseBracketExpected: "Missing closing bracket ] for array.",
  EndOfFileExpected: "Unexpected content after the end of the JSON value.",
  InvalidSymbol: "Invalid symbol.",
  InvalidNumberFormat: "Invalid number format.",
  UnexpectedEndOfString: "String is missing its closing quote.",
  UnexpectedEndOfNumber: "Number ended unexpectedly.",
  InvalidUnicode: "Invalid Unicode escape sequence.",
  InvalidEscapeCharacter: "Invalid escape character in string.",
  InvalidCharacter: "Unexpected character.",
  InvalidCommentToken: "Comments aren't allowed in JSON.",
  UnexpectedEndOfComment: "Unterminated comment.",
};

function humanMessage(code: ParseErrorCode): string {
  const name = printParseErrorCode(code);
  return errorMessages[name] ?? "Invalid JSON.";
}

function offsetToLineCol(
  input: string,
  offset: number,
): { line: number; column: number; lineText: string } {
  const safeOffset = Math.max(0, Math.min(offset, input.length));
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < safeOffset; i++) {
    if (input.charCodeAt(i) === 10 /* \n */) {
      line++;
      lineStart = i + 1;
    }
  }
  let lineEnd = input.indexOf("\n", lineStart);
  if (lineEnd === -1) lineEnd = input.length;
  return {
    line,
    column: safeOffset - lineStart + 1,
    lineText: input.slice(lineStart, lineEnd),
  };
}
