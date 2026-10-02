"use client";

import { FormEvent, Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { assessAquaAnswer, terminalScaffold } from "../game/assessment";
import { robotAssets, robotMood } from "../game/character";
import { beatForStage, chapter01 } from "../game/content/chapter-01";
import { displayGloss, parseLatinMarkup } from "../game/language";
import {
  activateControl,
  advance,
  askAperiMeaning,
  canCompleteChapterReview,
  canVerifyChapterReview,
  chapterReviewCounts,
  completePrologue,
  completeChapterReview,
  createInitialProgress,
  recallAqua,
  recordTerminalError,
  requestReviewHelp,
  skipIntro,
  submitAquaHypothesis,
  submitName,
  updateLanguageLog,
  verifyChapterReview,
} from "../game/progression";
import { loadGame, saveGame } from "../game/storage";
import type { GameProgress, LanguageLogEntry, RobotMood } from "../game/types";

const terminalStages = new Set(["terminal-question", "terminal-correct", "terminal-aperi", "water-good"]);
const gatedNarrativeStages = new Set(["name-prompt", "aqua-guess", "chapter-review", "chapter-end"]);

export default function Home() {
  const [progress, setProgress] = useState<GameProgress>(() => createInitialProgress());
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [aquaGuess, setAquaGuess] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionHelp, setQuestionHelp] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [controlError, setControlError] = useState("");
  const [prologuePhaseIndex, setProloguePhaseIndex] = useState(0);
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
    if (progress.stage === "chapter-review") setLogOpen(true);
  }, [progress.stage]);

  useEffect(() => {
    if (progress.stage !== "crawl") return;
    const phase = chapter01.prologue.phases[prologuePhaseIndex];
    if (phase.id === "crawl") return;
    const timer = window.setTimeout(() => {
      if (prologuePhaseIndex === chapter01.prologue.phases.length - 1) {
        setProgress((current) => completePrologue(current));
      } else {
        setProloguePhaseIndex((current) => current + 1);
      }
    }, phase.durationMs);
    return () => window.clearTimeout(timer);
  }, [progress.stage, prologuePhaseIndex]);

  const mood = robotMood(progress);
  const beat = beatForStage(progress.stage);
  const beatText = beat?.text.replaceAll("{name}", progress.playerName || "Human") ?? "";
  const scaffold = useMemo(() => {
    if (!progress.lastTerminalError) return null;
    return terminalScaffold(progress.lastTerminalError, progress.terminalAttempts);
  }, [progress.lastTerminalError, progress.terminalAttempts]);

  function focusTerminal() {
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function submitTerminalAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = assessAquaAnswer(answer);
    if (result.correct) {
      setProgress((current) => recallAqua(current));
      setAnswer("");
      return;
    }
    setProgress((current) => recordTerminalError(current, result.kind === "english" ? "english" : "other"));
    setAnswer("");
    focusTerminal();
  }

  function submitPlayerName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProgress((current) => submitName(current, name));
    setName("");
  }

  function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProgress((current) => submitAquaHypothesis(current, aquaGuess));
    setAquaGuess("");
  }

  function chooseControl(control: "air" | "water" | "thermal") {
    if (control === "water") {
      setProgress((current) => activateControl(current, control));
      setControlError("");
      return;
    }
    setControlError(chapter01.terminal.controlErrors[control]);
  }

  if (progress.stage === "crawl") {
    const phase = chapter01.prologue.phases[prologuePhaseIndex];
    return (
      <main
        className={`crawl-screen prologue-${phase.id}`}
        style={phase.id === "impact" ? { animationDuration: `${phase.durationMs}ms` } : undefined}
      >
        {phase.id !== "impact" && phase.id !== "blackout" && (
          <button className="skip-crawl" onClick={() => setProgress((current) => skipIntro(current))}>{chapter01.crawl.skipLabel}</button>
        )}
        {phase.id !== "blackout" && phase.id !== "impact" && (
          <div className="crawl-window" aria-label="Chapter introduction">
            <div
              className="crawl-track"
              style={{ animationDuration: `${chapter01.crawl.durationMs}ms` }}
              onAnimationEnd={() => {
                if (phase.id === "crawl") setProloguePhaseIndex((current) => current + 1);
              }}
            >
              <h1>{chapter01.crawl.title}</h1>
              <div className="crawl-chapter">{chapter01.crawl.chapter}</div>
              {chapter01.crawl.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        )}
        {phase.message && <div className="prologue-alert" role="status">{phase.message}</div>}
      </main>
    );
  }

  if (progress.stage === "impact") {
    return (
      <main className="impact-screen">
        <h1>AD ASTRA</h1>
        <button onClick={() => setProgress((current) => advance(current))}>{chapter01.impact.action}</button>
      </main>
    );
  }

  let surface: ReactNode;
  if (terminalStages.has(progress.stage)) {
    surface = (
      <main className="terminal-stage">
        <section className="terminal-console" aria-label="Master Computer terminal">
          <header>{chapter01.terminal.heading}</header>

          {progress.stage === "terminal-question" && (
            <>
              <div className="terminal-copy">
                {chapter01.terminal.question.map((line) => <p key={line}><MarkedText text={line} /></p>)}
                {scaffold?.terminal && <p className="terminal-reject">{scaffold.terminal}</p>}
              </div>
              <form className="terminal-input" onSubmit={submitTerminalAnswer}>
                <span aria-hidden="true">&gt;</span>
                <input
                  ref={inputRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  aria-label={chapter01.terminal.inputLabel}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>
              <button className="quiet-action" onClick={() => { setQuestionHelp(true); focusTerminal(); }}>{chapter01.terminal.helpLabel}</button>
              {(questionHelp || scaffold) && (
                <CrasAside mood={scaffold ? "annoyed" : "neutral"}>
                  {scaffold?.cras ?? chapter01.terminal.helpResponse}
                </CrasAside>
              )}
            </>
          )}

          {progress.stage === "terminal-correct" && (
            <>
              <div className="terminal-copy terminal-success">
                {chapter01.terminal.correct.map((line) => <p key={line}><MarkedText text={line} /></p>)}
              </div>
              <CrasAside mood="amused"><MarkedText text={chapter01.terminal.correctResponse} /></CrasAside>
              <button className="terminal-continue" onClick={() => setProgress((current) => advance(current))}>{chapter01.continueLabel}</button>
            </>
          )}

          {progress.stage === "terminal-aperi" && (
            <>
              <div className="terminal-copy">
                {chapter01.terminal.command.map((line) => <p key={line}><MarkedText text={line} /></p>)}
              </div>
              {!progress.askedAperi ? (
                <button className="quiet-action" onClick={() => setProgress((current) => askAperiMeaning(current))}>{chapter01.terminal.aperiHelpLabel}</button>
              ) : (
                <CrasAside mood="neutral">{chapter01.terminal.aperiHelpResponse}</CrasAside>
              )}
              <div className="control-bank" aria-label="Habitat controls">
                {chapter01.terminal.controls.map((control) => (
                  <button key={control.id} onClick={() => chooseControl(control.id)}>
                    <span>{control.symbol}</span>{control.label}
                  </button>
                ))}
              </div>
              {controlError && <CrasAside mood="concerned">{controlError}</CrasAside>}
            </>
          )}

          {progress.stage === "water-good" && (
            <>
              <div className="terminal-copy terminal-success"><p><MarkedText text={chapter01.terminal.success} /></p></div>
              <button className="terminal-continue" onClick={() => setProgress((current) => advance(current))}>{chapter01.terminal.returnLabel}</button>
            </>
          )}
        </section>
      </main>
    );
  } else if (progress.stage === "chapter-end") {
    surface = (
      <main className="chapter-end-screen">
        <div>{chapter01.chapterEnd}</div>
      </main>
    );
  } else {
    surface = (
      <main className="narrative-stage">
        <section className={`habitat-visual ${progress.waterRestored ? "restored" : "damaged"}`} aria-label="Habitat interior">
          <div className="habitat-vignette" />
          <img
            className="water-system"
            src={progress.waterRestored ? "/assets/habitat/systems/water_on.png" : "/assets/habitat/systems/water_off.png"}
            alt={progress.waterRestored ? "Water recycler online" : "Water recycler offline"}
          />
          <img className="cras-figure" src={robotAssets[mood]} alt={`CRAS, ${mood}`} />
        </section>

        <section className="dialogue-surface" aria-live="polite">
          <div className="speaker-label">{beat?.speaker ?? "CRAS"}</div>
          <p className="dialogue-text"><MarkedText text={beatText} /></p>

          {progress.stage === "name-prompt" && (
            <form className="story-input" onSubmit={submitPlayerName}>
              <label htmlFor="player-name">{chapter01.name.label}</label>
              <div><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={chapter01.name.placeholder} maxLength={40} autoFocus /><button>{chapter01.name.submitLabel}</button></div>
            </form>
          )}

          {progress.stage === "aqua-guess" && (
            <form className="story-input" onSubmit={submitGuess}>
              <label htmlFor="aqua-guess">{chapter01.aquaGuess.label}</label>
              <div><input id="aqua-guess" value={aquaGuess} onChange={(event) => setAquaGuess(event.target.value)} placeholder={chapter01.aquaGuess.placeholder} autoFocus /><button>{chapter01.aquaGuess.submitLabel}</button></div>
            </form>
          )}

          {!gatedNarrativeStages.has(progress.stage) && (
            <button className="continue" onClick={() => setProgress((current) => advance(current))}>{chapter01.continueLabel}</button>
          )}
        </section>
      </main>
    );
  }

  const logUnlocked = Object.keys(progress.languageLog).length > 0;
  return (
    <>
      {surface}
      {logUnlocked && (
        <LanguageLogDrawer
          entries={Object.values(progress.languageLog)}
          open={logOpen}
          reviewMode={progress.stage === "chapter-review"}
          onOpen={() => setLogOpen(true)}
          onClose={() => setLogOpen(false)}
          onSave={(lemma, guess) => setProgress((current) => updateLanguageLog(current, lemma, guess))}
          onRequestHelp={(lemma) => setProgress((current) => requestReviewHelp(current, lemma))}
          onVerify={() => setProgress((current) => verifyChapterReview(current))}
          onContinue={() => { setProgress((current) => completeChapterReview(current)); setLogOpen(false); }}
        />
      )}
    </>
  );
}

function MarkedText({ text }: { text: string }) {
  return parseLatinMarkup(text).map((segment, index) => (
    <Fragment key={`${segment.lemma ?? "text"}-${index}`}>
      {segment.lemma ? <span className="latin-word" data-lemma={segment.lemma}>{segment.text}</span> : segment.text}
    </Fragment>
  ));
}

function CrasAside({ mood, children }: { mood: RobotMood; children: ReactNode }) {
  return (
    <aside className="cras-aside">
      <img src={robotAssets[mood]} alt="" />
      <div><strong>CRAS</strong><p>{children}</p></div>
    </aside>
  );
}

function LanguageLogDrawer({ entries, open, reviewMode, onOpen, onClose, onSave, onRequestHelp, onVerify, onContinue }: {
  entries: LanguageLogEntry[];
  open: boolean;
  reviewMode: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (lemma: string, guess: string) => void;
  onRequestHelp: (lemma: string) => void;
  onVerify: () => void;
  onContinue: () => void;
}) {
  const languageLog = Object.fromEntries(entries.map((entry) => [entry.lemma, entry]));
  const visibleEntries = reviewMode
    ? chapter01.languageLog.coreVocabulary
        .map((lemma) => languageLog[lemma])
        .filter((entry): entry is LanguageLogEntry => Boolean(entry))
    : entries;
  const counts = chapterReviewCounts(languageLog);
  const canVerify = canVerifyChapterReview(languageLog);
  const canContinue = canCompleteChapterReview(languageLog);
  const summary = chapter01.languageLog.reviewSummary;
  return (
    <>
      {!open && <button className="language-log-toggle" onClick={onOpen}>{chapter01.languageLog.button}</button>}
      {open && <button className="log-scrim" aria-label={chapter01.languageLog.close} onClick={reviewMode ? undefined : onClose} />}
      {open && <aside className="language-log-drawer open" aria-label={chapter01.languageLog.title}>
        <header>
          <div><span>{reviewMode ? chapter01.languageLog.reviewTitle : chapter01.languageLog.title}</span><small>{entries.length} WORDS</small></div>
          {!reviewMode && <button onClick={onClose}>{chapter01.languageLog.close}</button>}
        </header>
        {reviewMode && <p className="review-instruction">{chapter01.languageLog.reviewInstruction}</p>}
        {reviewMode && (
          <div className="review-summary" aria-live="polite">
            <span>{summary.discovered.replace("{count}", String(counts.discovered))}</span>
            <span>{summary.confirmed.replace("{count}", String(counts.confirmed))}</span>
            <span>{summary.revision.replace("{count}", String(counts.revision))}</span>
          </div>
        )}
        <div className="log-entries">
          {visibleEntries.length === 0 && <p>{chapter01.languageLog.empty}</p>}
          {visibleEntries.map((entry) => (
            <LogEntryRow
              key={entry.lemma}
              entry={entry}
              reviewMode={reviewMode}
              hints={chapter01.languageLog.crasHints[entry.lemma as keyof typeof chapter01.languageLog.crasHints]}
              onSave={onSave}
              onRequestHelp={onRequestHelp}
            />
          ))}
        </div>
        {reviewMode && (
          <div className="review-actions">
            <button className="review-verify" disabled={!canVerify || canContinue} onClick={onVerify}>{chapter01.languageLog.reviewVerify}</button>
            <button className="review-continue" disabled={!canContinue} onClick={onContinue}>{chapter01.languageLog.reviewContinue}</button>
          </div>
        )}
      </aside>}
    </>
  );
}

function LogEntryRow({ entry, reviewMode, hints, onSave, onRequestHelp }: {
  entry: LanguageLogEntry;
  reviewMode: boolean;
  hints?: readonly string[];
  onSave: (lemma: string, guess: string) => void;
  onRequestHelp: (lemma: string) => void;
}) {
  const [draft, setDraft] = useState(entry.playerGuess);
  useEffect(() => setDraft(entry.playerGuess), [entry.playerGuess]);
  const helpText = hints && entry.helpLevel > 0 ? hints[Math.min(entry.helpLevel, hints.length) - 1] : "";
  const closeFeedback = chapter01.languageLog.closeFeedback
    .replace("{lemma}", entry.lemma)
    .replace("{canonicalGloss}", entry.canonicalGloss);
  return (
    <form className={`log-entry status-${entry.status.toLowerCase()}`} onSubmit={(event) => { event.preventDefault(); onSave(entry.lemma, draft); }}>
      <div className="log-entry-heading"><strong>{entry.lemma}</strong><span>{chapter01.languageLog.statusLabels[entry.status]}</span></div>
      {entry.status === "CONFIRMED" ? (
        <div className="confirmed-gloss">{displayGloss(entry)}</div>
      ) : (
        <div className="log-entry-edit">
          <input
            value={draft}
            onChange={(event) => {
              const value = event.target.value;
              setDraft(value);
              if (reviewMode) onSave(entry.lemma, value);
            }}
            aria-label={`English guess for ${entry.lemma}`}
            placeholder={chapter01.languageLog.guessPlaceholder}
          />
          {!reviewMode && <button>{chapter01.languageLog.saveGuess}</button>}
        </div>
      )}
      {entry.status === "CONFIRMED" && entry.matchQuality === "close" && <p className="log-feedback">{closeFeedback}</p>}
      {reviewMode && entry.status !== "CONFIRMED" && hints && (
        <>
          <button
            type="button"
            className="log-hint-action"
            disabled={entry.helpLevel >= hints.length}
            onClick={() => onRequestHelp(entry.lemma)}
          >
            {entry.helpLevel >= hints.length ? chapter01.languageLog.meaningRevealed : chapter01.languageLog.askCras}
          </button>
          {helpText && <p className="log-hint"><strong>CRAS</strong>{helpText}</p>}
        </>
      )}
    </form>
  );
}
