import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useChores } from "../chores/ChoresContext";

const JAR_DRAW_ANIM_MS = 480;

export function HomePage() {
  const { chores, removeChore } = useChores();
  const [picked, setPicked] = useState<string | null>(null);
  const [jarDrew, setJarDrew] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const jarAnimTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (picked !== null && !chores.includes(picked)) {
      setPicked(null);
    }
  }, [chores, picked]);

  useEffect(() => {
    return () => {
      if (jarAnimTimerRef.current !== null) window.clearTimeout(jarAnimTimerRef.current);
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  function triggerJarDrawAnim() {
    if (jarAnimTimerRef.current !== null) window.clearTimeout(jarAnimTimerRef.current);
    setJarDrew(true);
    jarAnimTimerRef.current = window.setTimeout(() => {
      setJarDrew(false);
      jarAnimTimerRef.current = null;
    }, JAR_DRAW_ANIM_MS);
  }

  function drawChore() {
    setFeedbackMessage(null);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (chores.length === 0) {
      setPicked(null);
      return;
    }
    triggerJarDrawAnim();
    const i = Math.floor(Math.random() * chores.length);
    setPicked(chores[i] ?? null);
  }

  function markDone() {
    if (picked === null) return;
    const willBeEmpty = chores.length <= 1;
    removeChore(picked);
    setPicked(null);
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    setFeedbackMessage(
      willBeEmpty
        ? "Last one done—jar is empty. Tap + to add more chores."
        : "Removed from jar.",
    );
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackMessage(null);
      feedbackTimerRef.current = null;
    }, 3200);
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
          className={`jar-button${jarDrew ? " jar-button--drew" : ""}`}
          onClick={drawChore}
          aria-label="Draw a random chore from the jar"
        >
          <img
            src="/jar-with-handle-256.png"
            alt=""
            className="jar-image"
            width={256}
            height={256}
            draggable={false}
          />
        </button>

        <section className="chore-result" aria-live="polite">
          {chores.length === 0 ? (
            <p className="chore-placeholder">
              Nothing to draw right now. Use the <strong>+</strong> button (top right) to add
              chores and refill the jar.
            </p>
          ) : picked ? (
            <div className="draw-result">
              <p className="chore-text">{picked}</p>
              <div className="draw-actions">
                <button type="button" className="primary-button draw-done" onClick={markDone}>
                  Done with this chore
                </button>
              </div>
            </div>
          ) : feedbackMessage ? (
            <p className="home-feedback" role="status" aria-live="polite">
              {feedbackMessage}
            </p>
          ) : (
            <p className="chore-placeholder">Tap the jar above to pick a chore.</p>
          )}
        </section>
      </main>
    </div>
  );
}
