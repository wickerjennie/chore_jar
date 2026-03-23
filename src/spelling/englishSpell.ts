import nspell from "nspell";
import type { NSpell as NSpellInstance } from "nspell";

function spellingDictionaryUrls(): { aff: string; dic: string } {
  const base = import.meta.env.BASE_URL;
  const root = base.endsWith("/") ? base : `${base}/`;
  return {
    aff: `${root}spelling-en/index.aff`,
    dic: `${root}spelling-en/index.dic`,
  };
}

let cached: NSpellInstance | null = null;
let loading: Promise<NSpellInstance> | null = null;

export function loadEnglishSpellchecker(): Promise<NSpellInstance> {
  if (cached) return Promise.resolve(cached);
  if (!loading) {
    loading = (async () => {
      try {
        const urls = spellingDictionaryUrls();
        const [affRes, dicRes] = await Promise.all([fetch(urls.aff), fetch(urls.dic)]);
        if (!affRes.ok || !dicRes.ok) {
          throw new Error("Could not load spelling dictionary");
        }
        const affData = new Uint8Array(await affRes.arrayBuffer());
        const dicData = new Uint8Array(await dicRes.arrayBuffer());
        cached = nspell(affData, dicData);
        return cached;
      } finally {
        loading = null;
      }
    })();
  }
  return loading;
}

export type SpellIssue = {
  /** Lowercase key for deduping */
  wordKey: string;
  /** First occurrence in text (preserves casing) */
  sample: string;
  suggestions: string[];
};

const WORD_RE = /\b[a-zA-Z]+(?:'[a-z]+)?\b/g;

function isCorrect(spell: NSpellInstance, word: string): boolean {
  if (spell.correct(word)) return true;
  const lower = word.toLowerCase();
  if (lower !== word && spell.correct(lower)) return true;
  return false;
}

function getSuggestions(spell: NSpellInstance, word: string): string[] {
  const a = spell.suggest(word);
  if (a.length > 0) return a.slice(0, 5);
  return spell.suggest(word.toLowerCase()).slice(0, 5);
}

const MAX_SCAN = 500;
const MAX_ISSUES = 24;

export function findSpellIssues(text: string, spell: NSpellInstance): SpellIssue[] {
  const byKey = new Map<string, SpellIssue>();
  let scans = 0;

  for (const m of text.matchAll(WORD_RE)) {
    if (++scans > MAX_SCAN) break;
    const word = m[0];
    const wordKey = word.toLowerCase();
    if (byKey.has(wordKey)) continue;
    if (isCorrect(spell, word)) continue;
    const suggestions = getSuggestions(spell, word);
    if (suggestions.length === 0) continue;
    byKey.set(wordKey, { wordKey, sample: word, suggestions });
    if (byKey.size >= MAX_ISSUES) break;
  }

  return [...byKey.values()];
}

export function applySuggestionToText(text: string, wrongSample: string, replacement: string): string {
  const escaped = wrongSample.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "gi");
  return text.replace(re, (match) => {
    if (match === match.toUpperCase() && match.length > 1) return replacement.toUpperCase();
    if (match[0] === match[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
    }
    return replacement.toLowerCase();
  });
}
