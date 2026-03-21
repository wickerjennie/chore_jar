import { useState } from "react";
import { Link } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";

export function HomePage() {
  const { chores } = useChores();
  const [picked, setPicked] = useState<string | null>(null);

  function drawChore() {
    if (chores.length === 0) {
      setPicked(null);
      return;
    }
    const i = Math.floor(Math.random() * chores.length);
    setPicked(chores[i] ?? null);
  }

  const count = chores.length;

  return (
    <div className="page home-page">
      <header className="top-bar">
        <h1 className="title">Chore Jar</h1>
        <Link to="/add" className="icon-button plus-link" aria-label="Add chore">
          <span className="plus-glyph" aria-hidden>
            +
          </span>
        </Link>
      </header>

      <p className="jar-status" role="status" aria-live="polite">
        {count === 0 ? (
          <span className="jar-status-line jar-status-line--empty">Jar is empty</span>
        ) : (
          <span className="jar-status-line">
            <span className="jar-badge">{count}</span>
            <span className="jar-status-label">
              {count === 1 ? "chore" : "chores"} in the jar
            </span>
          </span>
        )}
      </p>

      <main className="home-main">
        <button
          type="button"
          className="vase-button"
          onClick={drawChore}
          aria-label="Pick a random chore from the jar"
        >
          <img
            src="/vase-placeholder.svg"
            alt=""
            className="vase-image"
            width={140}
            height={234}
            draggable={false}
          />
        </button>

        <section className="chore-result" aria-live="polite">
          {chores.length === 0 ? (
            <p className="chore-placeholder">
              Nothing to draw right now. When you want more tasks, tap <strong>+</strong>{" "}
              to refill the jar.
            </p>
          ) : picked ? (
            <p className="chore-text">{picked}</p>
          ) : (
            <p className="chore-placeholder">Tap the vase to draw a chore.</p>
          )}
        </section>
      </main>
    </div>
  );
}
