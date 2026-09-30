"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { assessDeterministically } from "../game/assessment";
import { describeRobotState } from "../game/character";
import { chapterOne, vocabulary } from "../game/data/chapter-one";
import { exercises } from "../game/data/exercises";
import {
  advance,
  completeExercise,
  createInitialProgress,
  nextStage,
  placeFacility,
  recordMistake,
  stageOrder,
} from "../game/progression";
import { clearGame, loadGame, saveGame } from "../game/storage";
import type { Exercise, GameProgress } from "../game/types";

const exerciseByStage: Partial<Record<GameProgress["stage"], string>> = {
  "learn-salve": "salve",
  "terminal-aqua": "aqua",
  "terminal-valve": "valve",
  "terminal-flow": "flow",
};

const terminalCopy: Record<string, string[]> = {
  "terminal-aqua": ["SALVE, VIATOR.", "QUID DEEST?", "_"],
  "terminal-valve": ["AQUA DEEST.", "APERI VALVAM AQUAE.", "_"],
  repair: ["APERI VALVAM AQUAE.", "EXSPECTO…"],
  "terminal-flow": ["AQUA CURRIT.", "STATUS: BONVS"],
  "facility-unlocked": ["AQUA CURRIT.", "OFFICINA PARATA."],
  placement: ["AQUA CURRIT.", "LOCVM ELIGE."],
  epilogue: ["AQUA CURRIT.", "NOX VENIT."],
  complete: ["AQUA CURRIT.", "CAPITVLVM I PERFECTVM."],
};

export default function Home() {
  const [progress, setProgress] = useState<GameProgress>(() => createInitialProgress());
  const [hydrated, setHydrated] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [repairFeedback, setRepairFeedback] = useState("");

  useEffect(() => {
    setProgress(loadGame(window.localStorage));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGame(window.localStorage, progress);
  }, [hydrated, progress]);

  useEffect(() => {
    setAnswer("");
    setFeedback(null);
    setRepairFeedback("");
  }, [progress.stage]);

  const beat = chapterOne[progress.stage];
  const exerciseId = exerciseByStage[progress.stage];
  const exercise = exerciseId ? exercises[exerciseId] : null;
  const solved = exerciseId ? progress.completedExerciseIds.includes(exerciseId) : false;
  const robotState = describeRobotState(progress);
  const chapterPercent = Math.round((stageOrder.indexOf(progress.stage) / (stageOrder.length - 1)) * 100);
  const terminalLines = terminalCopy[progress.stage] ?? ["CUSTOS CENTRALIS", "DORMIT."];
  const placedCell = progress.facility.cell;

  const objective = useMemo(() => {
    if (progress.facility.status === "placed") return "Prepare for the arrivals";
    if (progress.facility.status === "unlocked") return "Place the water recycler";
    return "Restore the water recycler";
  }, [progress.facility.status]);

  function moveForward() {
    const upcoming = nextStage(progress.stage);
    setProgress((current) => advance(current, chapterOne[upcoming].mood));
  }

  function chooseIntro() {
    setProgress((current) => advance(current, "smug"));
  }

  function submitExercise(value: string, currentExercise: Exercise) {
    if (solved) return;
    const result = assessDeterministically(currentExercise, value);
    setFeedback({ correct: result.correct, text: result.feedback });
    if (result.correct) {
      setProgress((current) => completeExercise(current, currentExercise.id));
    } else {
      setProgress((current) => recordMistake(current, currentExercise.id));
    }
  }

  function submitTyped(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (exercise?.kind === "typed" && answer.trim()) submitExercise(answer, exercise);
  }

  function turnValve(kind: "oxygen" | "water" | "thermal") {
    if (kind !== "water") {
      setRepairFeedback(kind === "oxygen"
        ? "CRAS: That line contains the air you are currently using. Bold, but no."
        : "CRAS: Thermal loop. Useful if your ambition is warm, dry failure.");
      return;
    }
    setRepairFeedback("Valve open. The recycler shudders back to life.");
    window.setTimeout(() => setProgress((current) => advance(current, "pleased")), 450);
  }

  function restart() {
    if (!window.confirm("Restart Chapter I? Your current local progress will be cleared.")) return;
    setProgress(clearGame(window.localStorage));
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">A</span><strong>AD ASTRA</strong></div>
        <div className="chapter-label">CHAPTER I · AQUA <span>{chapterPercent}%</span></div>
        <div className="top-actions">
          <span className="save-state">● SAVED LOCALLY</span>
          <button className="icon-button" onClick={restart} aria-label="Restart chapter" title="Restart chapter">↻</button>
          <span className="sol">SOL 183 <b>18:42</b></span>
        </div>
      </header>

      <section className={`scene stage-${progress.stage}`} aria-label="Mars base at twilight">
        <div className="scene-shade" />
        <div className="status-chip"><span className="status-pip" /> HAB-01 · PRESSURE STABLE</div>

        <div className="scene-left-stack">
          <div className="mission-card">
            <span>PRIMARY OBJECTIVE</span>
            <strong>{objective}</strong>
            <small>Arrival window: 11 sols</small>
          </div>

          <section className={`terminal-mini ${beat.latinOnly ? "active" : ""}`} aria-label="Latin base computer terminal">
            <div className="terminal-head"><span>CUSTOS CENTRALIS</span><i>{beat.latinOnly ? "ACTIVVS" : "CONEXVS"}</i></div>
            <div className="terminal-screen">
              {terminalLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
            </div>
          </section>
        </div>

        <section className={`base-mini ${progress.stage === "placement" ? "expanded" : ""}`} aria-label="Base overview">
          <div className="base-mini-head"><span>▦ BASE OVERVIEW</span><b>{progress.facility.status.toUpperCase()}</b></div>
          <div className="map-grid">
            {[0, 1, 2, 3, 4, 5].map((cell) => {
              const habitat = cell === 0;
              const occupied = placedCell === cell;
              const placeable = progress.stage === "placement" && [1, 2, 4, 5].includes(cell);
              return (
                <button
                  key={cell}
                  className={`map-cell ${habitat ? "habitat" : ""} ${occupied ? "recycler" : ""} ${placeable ? "placeable" : ""}`}
                  disabled={!placeable}
                  aria-label={habitat ? "Habitat module" : occupied ? "Water recycler" : placeable ? `Place recycler on tile ${cell}` : `Empty foundation tile ${cell}`}
                  onClick={() => setProgress((current) => placeFacility(current, cell))}
                >
                  {habitat ? "HAB" : occupied ? "AQUA" : placeable ? "+" : "·"}
                </button>
              );
            })}
          </div>
          <div className="facility-row">
            <span aria-hidden="true">{progress.facility.status === "locked" ? "×" : "◈"}</span>
            <span>Water recycler</span><b>{progress.facility.status}</b>
          </div>
        </section>

        {progress.stage === "repair" && (
          <div className="valve-rack" aria-label="Recycler valve rack">
            <div className="rack-label">MANUAL VALVE ARRAY</div>
            <div className="valves">
              <button onClick={() => turnValve("oxygen")}><i className="valve oxygen" />O₂ LINE</button>
              <button onClick={() => turnValve("water")}><i className="valve water" />AQUA</button>
              <button onClick={() => turnValve("thermal")}><i className="valve thermal" />THERMAL</button>
            </div>
            {repairFeedback && <p className="rack-feedback">{repairFeedback}</p>}
          </div>
        )}

        {progress.stage === "complete" && (
          <div className="chapter-complete-badge"><b>✦</b><span>CHAPTER I COMPLETE</span><strong>4 Latin words learned · 1 facility restored</strong></div>
        )}
      </section>

      <section className="story-panel">
        <aside className={`robot-card mood-${robotState.mood}`}>
          <div className="robot-portrait" aria-label={`CRAS is ${robotState.label.toLowerCase()}`}>
            <div className="antenna" /><div className="robot-eye left" /><div className="robot-eye right" /><div className="robot-mouth" />
          </div>
          <div className="robot-meta"><span>COMPANION UNIT</span><strong>CRAS</strong><small>{robotState.label}</small><em>RAPPORT · {progress.robot.rapport}</em></div>
        </aside>

        <article className="dialogue-card" aria-live="polite">
          <div className={`speaker ${beat.latinOnly ? "computer" : ""}`}>{beat.speaker} / {beat.channel}</div>
          <p className={beat.latinOnly ? "latin-line" : ""}>{beat.text}</p>

          {progress.stage === "intro-choice" && (
            <div className="choice-row">
              <button onClick={chooseIntro}>Can we fix the recycler?</button>
              <button onClick={chooseIntro}>I object to the curriculum.</button>
            </div>
          )}

          {exercise && (
            <ExercisePanel
              exercise={exercise}
              answer={answer}
              setAnswer={setAnswer}
              feedback={feedback}
              solved={solved}
              onChoice={(value) => submitExercise(value, exercise)}
              onSubmit={submitTyped}
              onContinue={moveForward}
            />
          )}

          {!exercise && progress.stage !== "intro-choice" && progress.stage !== "repair" && progress.stage !== "placement" && (
            <button className="continue-button" onClick={progress.stage === "complete" ? restart : moveForward}>
              {progress.stage === "complete" ? "Replay chapter" : beat.action ?? "Continue"}
            </button>
          )}
        </article>

        <aside className="lexicon-card">
          <div className="lexicon-head"><span>LEXICON</span><strong>{progress.learnedWords.length} / {vocabulary.length}</strong></div>
          <div className="word-list">
            {vocabulary.map((word) => {
              const known = progress.learnedWords.includes(word.latin);
              return <div key={word.latin} className={known ? "known" : "unknown"}><b>{known ? word.latin : "••••••"}</b><span>{known ? word.english : "not yet understood"}</span></div>;
            })}
          </div>
          {progress.stage === "epilogue" && <p className="untranslated-note">UNTRANSLATED · archived for later</p>}
        </aside>
      </section>
    </main>
  );
}

function ExercisePanel({
  exercise,
  answer,
  setAnswer,
  feedback,
  solved,
  onChoice,
  onSubmit,
  onContinue,
}: {
  exercise: Exercise;
  answer: string;
  setAnswer: (value: string) => void;
  feedback: { correct: boolean; text: string } | null;
  solved: boolean;
  onChoice: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="exercise-panel">
      <div className="exercise-context">{exercise.context}</div>
      {exercise.kind === "choice" ? (
        <div className="choice-row">
          {exercise.options.map((option) => (
            <button key={option.id} disabled={solved} onClick={() => onChoice(option.id)}>{option.label}</button>
          ))}
        </div>
      ) : (
        <form className="typed-row" onSubmit={onSubmit}>
          <label htmlFor="translation">Your interpretation</label>
          <div><input id="translation" value={answer} disabled={solved} onChange={(event) => setAnswer(event.target.value)} placeholder="Type in English…" autoComplete="off" /><button disabled={solved || !answer.trim()}>Check</button></div>
        </form>
      )}
      {feedback && <div className={`feedback ${feedback.correct ? "correct" : "retry"}`}>{feedback.correct ? "✓" : "HINT"} {feedback.text}</div>}
      {solved && <button className="continue-button inline" onClick={onContinue}>Continue</button>}
    </div>
  );
}
