/// <reference types="vite/client" />

declare module "nspell" {
  type Buf = string | Uint8Array;

  export interface NSpell {
    correct(word: string): boolean;
    suggest(word: string): string[];
  }

  function nspell(aff: Buf, dic?: Buf): NSpell;
  export default nspell;
}
