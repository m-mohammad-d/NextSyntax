export enum TokenType {
  Number,
  Identifier,
  Equals,
  OpenParen,
  CloseParen,
  BinaryOperator,
  Let,
  EOF,
}
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};
export interface Token {
  value: string;
  type: TokenType;
}

function isalpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

function isint(src: string) {
  const c = src.charCodeAt(0);
  const bcunds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bcunds[0] && c <= bcunds[1];
}

function isskippablle(str: string) {
  return str === " " || str === "/n" || str === "/t";
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();

  const src = sourceCode.split("");
  //build each token until end of the file

  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else {
      // handle multiChar tokens

      //build number token
      if (isint(src[0])) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      } else if (isalpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }
        // check for reserved keyword
        const reserved = KEYWORDS[ident];
        if (reserved === undefined) {
          tokens.push(token(ident, TokenType.Identifier));
        } else {
          tokens.push(token(ident, reserved));
        }
      } else if (isskippablle(src[0])) {
        src.shift(); // skip the current char
      } else {
        console.log("Unreconized character found in source :" + src[0]);
        Deno.exit(1);
      }
    }
  }
  tokens.push({ type: TokenType.EOF , value : "EndOfFile"});
  return tokens;
}

const source = await Deno.readTextFile("./test.ns");

for (const token of tokenize(source)) {
  console.log(token);
}
