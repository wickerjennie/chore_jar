import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";

export function AddChorePage() {
  const { addChore } = useChores();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [pendingChore, setPendingChore] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  const showAddAnother = pendingChore !== null;

  useEffect(() => {
    if (showAddAnother) {
      yesButtonRef.current?.focus();
    }
  }, [showAddAnother]);

  // Escape: dismiss “Add another?” without writing to storage; textarea text stays so the user can Save again.
  useEffect(() => {
    if (!showAddAnother) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setPendingChore(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAddAnother]);

  function openAddAnotherPrompt(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setPendingChore(trimmed);
  }

  function handleYes() {
    if (pendingChore === null) return;
    addChore(pendingChore);
    setText("");
    setPendingChore(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleNo() {
    if (pendingChore === null) return;
    addChore(pendingChore);
    setText("");
    setPendingChore(null);
    navigate("/");
  }

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
        <form className="add-form" onSubmit={openAddAnotherPrompt}>
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
            autoFocus
          />
          <button type="submit" className="primary-button" disabled={!text.trim()}>
            Save
          </button>
        </form>
      </main>

      {showAddAnother && (
        <div className="add-another-backdrop">
          <div
            className="add-another-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-another-title"
          >
            <h2 id="add-another-title" className="add-another-title">
              Add another?
            </h2>
            <div className="add-another-actions">
              <button
                ref={yesButtonRef}
                type="button"
                className="primary-button add-another-btn"
                onClick={handleYes}
              >
                Yes
              </button>
              <button type="button" className="secondary-button add-another-btn" onClick={handleNo}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
