import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";
import type { NSpell } from "nspell";
import {
  applySuggestionToText,
  findSpellIssues,
  loadEnglishSpellchecker,
  type SpellIssue,
} from "../spelling/englishSpell";

const SPELL_DEBOUNCE_MS = 450;

export function AddChorePage() {
  const { addChore } = useChores();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [spell, setSpell] = useState<NSpell | null>(null);
  const [spellIssues, setSpellIssues] = useState<SpellIssue[]>([]);
  const [spellStatus, setSpellStatus] = useState<"loading" | "ready" | "error">("loading");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadEnglishSpellchecker()
      .then((s) => {
        if (!cancelled) {
          setSpell(s);
          setSpellStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setSpellStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!spell) return;
    const handle = window.setTimeout(() => {
      const trimmed = text.trim();
      setSpellIssues(trimmed ? findSpellIssues(text, spell) : []);
    }, SPELL_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [text, spell]);

  function applySuggestion(issue: SpellIssue, replacement: string) {
    setText((t) => applySuggestionToText(t, issue.sample, replacement));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function saveAndStay() {
    const trimmed = text.trim();
    if (!trimmed) return;
    addChore(trimmed);
    setText("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function saveAndHome() {
    const trimmed = text.trim();
    if (!trimmed) return;
    addChore(trimmed);
    setText("");
    navigate("/");
  }

  function preventSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const canSave = Boolean(text.trim());

  return (
    <div className="page add-page">
      <header className="top-bar">
        <Link to="/" className="text-link" aria-label="Back to home">
          ← Back
        </Link>
        <h1 className="title title-sm">Add chore</h1>
        <span className="top-bar-spacer" aria-hidden />
      </header>

      <main className="add-main">
        <form className="add-form" onSubmit={preventSubmit}>
          <textarea
            ref={textareaRef}
            id="chore-input"
            className="chore-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Empty the dishwasher"
            aria-label="What to add"
            rows={4}
            autoComplete="off"
            spellCheck
            autoFocus
          />
          {spellStatus === "loading" && (
            <p className="spell-status" aria-live="polite">
              Loading spelling suggestions…
            </p>
          )}
          {spellStatus === "error" && (
            <p className="spell-status spell-status--muted" role="status">
              Offline spelling dictionary could not be loaded. Your browser can still underline typos.
            </p>
          )}
          {spellStatus === "ready" && spellIssues.length > 0 && (
            <div
              className="spell-suggestions"
              role="region"
              aria-label="Spelling suggestions"
              aria-live="polite"
            >
              <p className="spell-suggestions-title">Tap a fix to replace in your text</p>
              <ul className="spell-issues">
                {spellIssues.map((issue) => (
                  <li key={issue.wordKey} className="spell-issue">
                    <span className="spell-issue-word">{issue.sample}</span>
                    <span className="spell-issue-sep" aria-hidden>
                      →
                    </span>
                    <span className="spell-suggestion-chips">
                      {issue.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="spell-suggestion-chip"
                          onClick={() => applySuggestion(issue, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="add-form-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!canSave}
              onClick={saveAndStay}
            >
              Save & add another
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={!canSave}
              onClick={saveAndHome}
            >
              Save & home
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
