import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";

export function AddChorePage() {
  const { addChore } = useChores();
  const navigate = useNavigate();
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addChore(trimmed);
    setText("");
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
        <form className="add-form" onSubmit={handleSubmit}>
          <textarea
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
    </div>
  );
}
