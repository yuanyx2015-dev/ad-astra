"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { assessAquaAnswer, terminalScaffold } from "../game/assessment";
import { robotAssets, robotMood } from "../game/character";
import { beats, responseText } from "../game/data/chapter-one";
import { recentDialogueReview, terminalQuestion } from "../game/data/exercises";
import {
  activateControl,
  advance,
  askAperiMeaning,
  chooseAquaMeaning,
  chooseSalveReply,
  createInitialProgress,
  recallAqua,
  recordTerminalError,
} from "../game/progression";
import { loadGame, saveGame } from "../game/storage";
import type { GameProgress } from "../game/types";

const terminalStages = new Set(["terminal-question", "terminal-correct", "terminal-aperi", "water-good"]);

export default function Home() {
  const [progress, setProgress] = useState<GameProgress>(() => createInitialProgress());
  const [hydrated, setHydrated] = useState(false);
  const [answer, setAnswer] = useState("");
  const [questionHelp, setQuestionHelp] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [controlError, setControlError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProgress(loadGame(window.localStorage));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGame(window.localStorage, progress);
  }, [hydrated, progress]);

  useEffect(() => {
    if (progress.stage === "terminal-question") inputRef.current?.focus();
  }, [progress.stage]);

  const mood = robotMood(progress);
  const isTerminal = terminalStages.has(progress.stage);
  const beat = responseText(progress.stage, progress.aquaChoice, progress.salveChoice) ?? beats[progress.stage] ?? null;
  const scaffold = useMemo(() => {
    if (!progress.lastTerminalError) return null;
    return terminalScaffold(progress.lastTerminalError, progress.terminalAttempts);
  }, [progress.lastTerminalError, progress.terminalAttempts]);

  function focusInput() {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = assessAquaAnswer(answer);
    if (result.correct) {
      setProgress((current) => recallAqua(current));
      setAnswer("");
      return;
    }
    setProgress((current) => recordTerminalError(current, result.kind === "english" ? "english" : "other"));
    setAnswer("");
    focusInput();
  }

  function explainQuestion() {
    setQuestionHelp(true);
    focusInput();
  }

  function chooseControl(control: "air" | "water" | "thermal") {
    if (control === "water") {
      setProgress((current) => activateControl(current, control));
      setControlError("");
      return;
    }
    setControlError(control === "air" ? "That would open the habitat air line." : "That is the thermal bleed.");
  }

  if (progress.stage === "title") {
    return (
      <main className="title-screen">
        <div className="title-lockup">
          <h1>AD ASTRA</h1>
          <button onClick={() => setProgress((current) => advance(current))}>OPEN YOUR EYES</button>
        </div>
      </main>
    );
  }

  if (isTerminal) {
    return (
      <main className="terminal-stage">
        <section className="terminal-console" aria-label="CUSTOS CENTRALIS terminal">
          <header>{terminalQuestion.heading}</header>

          {progress.stage === "terminal-question" && (
            <>
              <div className="terminal-copy">
                <p>{terminalQuestion.greeting}</p>
                <p>{terminalQuestion.prompt}</p>
                {scaffold?.terminal && <p className="terminal-reject">{scaffold.terminal}</p>}
              </div>
              <form className="terminal-input" onSubmit={submitAnswer}>
                <span aria-hidden="true">&gt;</span>
                <input
                  ref={inputRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  aria-label="Latin answer"
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>
              <button className="quiet-action" onClick={explainQuestion}>What does this mean?</button>
              {(questionHelp || scaffold) && (
                <CrasAside mood={scaffold ? "annoyed" : "neutral"}>
                  {scaffold?.cras ?? "Quid deest? — What is missing?"}
                  {scaffold?.offerReview && (
                    <button className="review-button" onClick={() => { setReviewOpen(true); focusInput(); }}>Review recent dialogue</button>
                  )}
                </CrasAside>
              )}
              {reviewOpen && (
                <div className="review-panel" role="dialog" aria-label="Recent dialogue">
                  <div>{recentDialogueReview.map((line) => <p key={line}>{line}</p>)}</div>
                  <button onClick={() => { setReviewOpen(false); focusInput(); }}>Return to terminal</button>
                </div>
              )}
            </>
          )}

          {progress.stage === "terminal-correct" && (
            <>
              <div className="terminal-copy terminal-success"><p>AQUA.</p><p>RECTE.</p></div>
              <CrasAside mood="amused">Correct.<br />I was preparing a longer explanation.<br />This outcome is personally disappointing.</CrasAside>
              <button className="terminal-continue" onClick={() => setProgress((current) => advance(current))}>Continue</button>
            </>
          )}

          {progress.stage === "terminal-aperi" && (
            <>
              <div className="terminal-copy"><p>AQUA DEEST.</p><p>APERI.</p></div>
              {!progress.askedAperi ? (
                <button className="quiet-action" onClick={() => setProgress((current) => askAperiMeaning(current))}>What does “aperi” mean?</button>
              ) : (
                <CrasAside mood="neutral">Open.</CrasAside>
              )}
              <div className="control-bank" aria-label="Habitat controls">
                <button onClick={() => chooseControl("air")}><span>○</span>AIR LINE</button>
                <button onClick={() => chooseControl("water")}><span>◇</span>AQUA VALVE</button>
                <button onClick={() => chooseControl("thermal")}><span>△</span>THERMAL</button>
              </div>
              {controlError && <CrasAside mood="concerned">{controlError}</CrasAside>}
            </>
          )}

          {progress.stage === "water-good" && (
            <>
              <div className="terminal-copy terminal-success"><p>AQUA: BENE</p></div>
              <button className="terminal-continue" onClick={() => setProgress((current) => advance(current))}>Return to habitat</button>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="narrative-stage">
      <section className="habitat-visual" aria-label="Habitat interior">
        <div className="habitat-vignette" />
        <img className="cras-figure" src={robotAssets[mood]} alt={`CRAS, ${mood}`} />
      </section>

      <section className="dialogue-surface" aria-live="polite">
        <div className="speaker-label">{beat?.speaker ?? "CRAS"}</div>
        <p className="dialogue-text">{beat?.text}</p>

        {progress.stage === "aqua-choice" && (
          <div className="narrative-choices">
            <button onClick={() => setProgress((current) => chooseAquaMeaning(current, "system"))}>The water system?</button>
            <button onClick={() => setProgress((current) => chooseAquaMeaning(current, "unclear"))}>I still don&apos;t understand.</button>
          </div>
        )}

        {progress.stage === "salve-explain" && (
          <div className="narrative-choices">
            <button onClick={() => setProgress((current) => chooseSalveReply(current, "salve"))}>Salve.</button>
            <button onClick={() => setProgress((current) => chooseSalveReply(current, "hello"))}>Hello.</button>
          </div>
        )}

        {progress.stage !== "aqua-choice" && progress.stage !== "salve-explain" && progress.stage !== "final" && (
          <button className="continue" onClick={() => setProgress((current) => advance(current))}>Continue</button>
        )}
      </section>
    </main>
  );
}

function CrasAside({ mood, children }: { mood: "neutral" | "amused" | "concerned" | "annoyed"; children: React.ReactNode }) {
  return (
    <aside className="cras-aside">
      <img src={robotAssets[mood]} alt="" />
      <div><strong>CRAS</strong><p>{children}</p></div>
    </aside>
  );
}
