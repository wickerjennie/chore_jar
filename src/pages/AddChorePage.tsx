import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";

export function AddChorePage() {
  const { addChore } = useChores();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            lang="en"
            rows={4}
            autoComplete="off"
            spellCheck
            autoFocus
          />
          <div className="add-form-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!canSave}
              onClick={saveAndStay}
            >
              Save
            </button>
            <button
              type="button"
              className="add-form-home-link"
              disabled={!canSave}
              onClick={saveAndHome}
            >
              Save and go home
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
