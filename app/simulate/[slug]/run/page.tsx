"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import {
  Send, Check, CheckCircle, Refresh, Target, ArrowRight, Close, Bulb, Briefcase,
} from "@/components/icons";
import { getCareer, getScenarioForCareer } from "@/lib/scenarios";
import {
  getSession, createSession, addTurn, saveSession, saveEvaluation,
} from "@/lib/store";
import { generateManagerReply, generateEvaluation } from "@/lib/mockAI";
import type { Session, Scenario, Turn } from "@/lib/types";

type Phase = "idle" | "thinking" | "awaiting" | "error" | "ready_to_finish" | "evaluating";

export default function RunPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const career = getCareer(params.slug);
  const scenario = career ? getScenarioForCareer(career.slug) : undefined;

  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [railOpen, setRailOpen] = useState(false);
  const [forceError, setForceError] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const pendingAnswer = useRef<string | null>(null);

  // ── Load or create the session, seed the first manager message ──
  useEffect(() => {
    if (!scenario || !career) return;
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get("session");
    let s = id ? getSession(id) : undefined;
    if (!s) s = createSession(scenario.slug, career.slug);

    if (s.turns.length === 0) {
      s = addTurn(s, "system", `You've joined ${scenario.company} as ${scenario.role}.`);
      s = addTurn(s, "manager", scenario.tasks[0].brief, scenario.tasks[0].id);
    }
    setSession(s);
    setPhase(s.status === "completed" ? "ready_to_finish" : "awaiting");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-scroll
  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.turns.length, phase]);

  const currentTask = scenario?.tasks[session?.currentTaskIndex ?? 0];

  const runManagerReply = useCallback(
    (answer: string, taskIndex: number) => {
      if (!scenario || !session) return;
      setPhase("thinking");
      pendingAnswer.current = answer;

      window.setTimeout(() => {
        // Simulated provider failure → recoverable retry state.
        if (forceError) {
          setForceError(false);
          setPhase("error");
          return;
        }
        let s = getSession(session.id)!;
        const task = scenario.tasks[taskIndex];
        const ack = generateManagerReply(scenario, task, answer, s.turns.length);
        s = addTurn(s, "manager", ack);

        const isLast = taskIndex >= scenario.tasks.length - 1;
        if (!isLast) {
          const next = scenario.tasks[taskIndex + 1];
          s = { ...s, currentTaskIndex: taskIndex + 1 };
          saveSession(s);
          s = addTurn(s, "manager", next.brief, next.id);
          setSession(s);
          setPhase("awaiting");
        } else {
          s = addTurn(
            s,
            "manager",
            "That's everything I needed. Great work holding a clear head on this — let's wrap up and see how it went."
          );
          setSession(s);
          setPhase("ready_to_finish");
        }
        pendingAnswer.current = null;
      }, 1100 + Math.random() * 700);
    },
    [scenario, session, forceError]
  );

  const submit = () => {
    if (!scenario || !session || !currentTask) return;
    const answer = input.trim();
    if (answer.length < 2 || phase === "thinking") return;
    const taskIndex = session.currentTaskIndex;
    const s = addTurn(session, "student", answer, currentTask.id);
    setSession(s);
    setInput("");
    runManagerReply(answer, taskIndex);
  };

  const retry = () => {
    if (pendingAnswer.current == null || !session) return;
    runManagerReply(pendingAnswer.current, session.currentTaskIndex);
  };

  const finish = () => {
    if (!scenario || !session || !career) return;
    setPhase("evaluating");
    window.setTimeout(() => {
      let s = getSession(session.id)!;
      s = { ...s, status: "completed", completedAt: Date.now() };
      saveSession(s);
      const ev = generateEvaluation(scenario, s, career.title);
      saveEvaluation(ev);
      router.push(`/evaluation/${s.id}`);
    }, 1600);
  };

  if (!career || !scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-work-bg text-work-text">
        <div className="text-center">
          <p>This simulation isn&apos;t available.</p>
          <Link href="/careers" className="btn btn-primary btn-md mt-4">Back to careers</Link>
        </div>
      </div>
    );
  }

  const totalTasks = scenario.tasks.length;
  const complete = phase === "ready_to_finish" || phase === "evaluating" || session?.status === "completed";
  const effectiveIndex = complete ? totalTasks : session?.currentTaskIndex ?? 0;
  const progressPct = Math.round((effectiveIndex / totalTasks) * 100);
  const taskNumber = Math.min((session?.currentTaskIndex ?? 0) + 1, totalTasks);

  return (
    <div className="flex h-screen flex-col bg-work-bg text-work-text">
      {/* ── Top company bar ── */}
      <header className="flex items-center justify-between border-b border-work-line bg-work-panel px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Briefcase width={18} height={18} />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-work-text">{scenario.company}</p>
            <p className="text-[0.7rem] text-work-muted">{scenario.role} · your first day</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-[0.72rem] text-work-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Workspace connected
          </div>
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 rounded-full border border-work-line px-3 py-1.5 text-xs font-medium text-work-muted transition hover:text-work-text"
          >
            <Close width={14} height={14} /> Exit
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Task rail ── */}
        <TaskRail
          scenario={scenario}
          currentIndex={effectiveIndex}
          progressPct={progressPct}
          open={railOpen}
          onClose={() => setRailOpen(false)}
        />

        {/* ── Conversation ── */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* current task banner */}
          <div className="flex items-center gap-3 border-b border-work-line bg-work-panel/60 px-4 py-3 sm:px-8">
            <button
              onClick={() => setRailOpen(true)}
              className="rounded-lg border border-work-line px-2.5 py-1.5 text-xs text-work-muted lg:hidden"
            >
              Tasks
            </button>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-work-muted">
                {complete ? "Complete" : `Task ${taskNumber} of ${totalTasks}`}
              </p>
              <p className="truncate text-sm font-semibold text-work-text">
                {complete ? "All tasks complete" : currentTask?.title}
              </p>
            </div>
          </div>

          {/* stream */}
          <div ref={streamRef} className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-2xl space-y-5">
              {session?.turns.map((t) => (
                <Bubble key={t.id} turn={t} manager={scenario.managerName} />
              ))}
              {phase === "thinking" && <Typing name={scenario.managerName} />}
              {phase === "error" && <ErrorCard onRetry={retry} />}
              {phase === "evaluating" && <Evaluating />}
              {phase === "ready_to_finish" && (
                <div className="animate-fade-up rounded-2xl border border-teal/30 bg-teal/[0.08] p-5 text-center">
                  <CheckCircle className="mx-auto text-teal" width={28} height={28} />
                  <p className="mt-2 font-semibold text-work-text">Simulation complete</p>
                  <p className="mt-1 text-sm text-work-muted">
                    Ready to see your evidence-based evaluation?
                  </p>
                  <button onClick={finish} className="btn btn-accent btn-lg mx-auto mt-4">
                    Finish &amp; get my evaluation <ArrowRight width={18} height={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* composer */}
          {(phase === "awaiting" || phase === "thinking" || phase === "error") && currentTask && (
            <div className="border-t border-work-line bg-work-panel px-4 py-4 sm:px-8">
              <div className="mx-auto max-w-2xl">
                <div className="mb-2 flex items-center gap-2 text-[0.72rem] text-work-muted">
                  <Bulb width={14} height={14} className="text-amber" />
                  <span>{currentTask.hint}</span>
                </div>
                <div className="rounded-2xl border border-work-line bg-work-panel2 focus-within:border-brand-500">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                    }}
                    rows={3}
                    maxLength={3000}
                    placeholder={`Reply to ${scenario.managerName.split(" ")[0]}…`}
                    className="w-full resize-none bg-transparent px-4 py-3 text-sm text-work-text placeholder:text-work-muted/70 focus:outline-none"
                  />
                  <div className="flex items-center justify-between px-3 pb-3">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[0.68rem] text-work-muted/80">
                      <input
                        type="checkbox"
                        checked={forceError}
                        onChange={(e) => setForceError(e.target.checked)}
                        className="h-3 w-3 rounded border-work-line"
                      />
                      Demo: drop next AI reply (to show retry)
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.68rem] text-work-muted/70">{input.length}/3000</span>
                      <button
                        onClick={submit}
                        disabled={input.trim().length < 2 || phase === "thinking"}
                        className="btn btn-primary btn-sm"
                      >
                        {phase === "thinking" ? "Sending…" : <>Send <Send width={15} height={15} /></>}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-center text-[0.66rem] text-work-muted/60">
                  Press ⌘/Ctrl + Enter to send · This is practice — don&apos;t share
                  sensitive personal info
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Task rail ─────────────────────────────────────────────────────
function TaskRail({
  scenario, currentIndex, progressPct, open, onClose,
}: {
  scenario: Scenario; currentIndex: number; progressPct: number; open: boolean; onClose: () => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-work-line bg-work-panel p-5 transition-transform lg:static lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-work-text">Tasks</span>
          <button onClick={onClose} className="text-work-muted"><Close width={18} height={18} /></button>
        </div>

        <div className="mt-2 flex items-center gap-2 lg:mt-0">
          <LogoMark size={24} />
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-work-muted">
            Mission progress
          </span>
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-work-panel2">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1.5 text-[0.7rem] text-work-muted">{progressPct}% complete</p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-work-panel2 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            {scenario.managerName.split(" ").map((w) => w[0]).join("")}
          </span>
          <div>
            <p className="text-sm font-semibold text-work-text">{scenario.managerName}</p>
            <p className="flex items-center gap-1.5 text-[0.68rem] text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Online
            </p>
          </div>
        </div>

        <ol className="mt-6 space-y-1">
          {scenario.tasks.map((t) => {
            const state = t.index < currentIndex ? "done" : t.index === currentIndex ? "active" : "todo";
            return (
              <li
                key={t.id}
                className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
                  state === "active" ? "bg-brand-500/15 text-work-text" : "text-work-muted"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                    state === "done"
                      ? "bg-teal text-work-bg"
                      : state === "active"
                      ? "bg-brand-500 text-white"
                      : "border border-work-line text-work-muted"
                  }`}
                >
                  {state === "done" ? <Check width={12} height={12} /> : t.index + 1}
                </span>
                <span className={state === "active" ? "font-semibold" : ""}>{t.title}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-xl border border-work-line p-3 text-[0.72rem] leading-relaxed text-work-muted">
          <Target width={14} height={14} className="mb-1 text-amber" />
          Skills watched: {scenario.skills.map((s) => s.name).join(", ")}.
        </div>
      </aside>
    </>
  );
}

// ── Chat bubbles ──────────────────────────────────────────────────
function Bubble({ turn, manager }: { turn: Turn; manager: string }) {
  if (turn.speaker === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-work-panel2 px-3 py-1 text-[0.7rem] text-work-muted">
          {turn.content}
        </span>
      </div>
    );
  }
  const isStudent = turn.speaker === "student";
  return (
    <div className={`flex animate-fade-up gap-3 ${isStudent ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold ${
          isStudent ? "bg-work-panel2 text-work-text" : "bg-brand-500 text-white"
        }`}
      >
        {isStudent ? "You" : manager.split(" ").map((w) => w[0]).join("")}
      </span>
      <div className={`max-w-[85%] ${isStudent ? "text-right" : ""}`}>
        <p className="mb-1 text-[0.68rem] font-medium text-work-muted">
          {isStudent ? "You" : manager}
        </p>
        <div
          className={`inline-block whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isStudent
              ? "rounded-tr-sm bg-brand-500 text-white"
              : "rounded-tl-sm bg-work-panel2 text-work-text"
          }`}
        >
          {turn.content}
        </div>
      </div>
    </div>
  );
}

function Typing({ name }: { name: string }) {
  return (
    <div className="flex animate-fade-in gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[0.7rem] font-bold text-white">
        {name.split(" ").map((w) => w[0]).join("")}
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-work-panel2 px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot" />
        <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot [animation-delay:400ms]" />
      </div>
    </div>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="animate-fade-up rounded-2xl border border-accent/40 bg-accent/[0.08] p-4">
      <p className="text-sm font-semibold text-work-text">Couldn&apos;t reach the AI just now</p>
      <p className="mt-1 text-sm text-work-muted">
        The response didn&apos;t come through. Your answer is safe — nothing was
        lost. Try again.
      </p>
      <button onClick={onRetry} className="btn btn-outline btn-sm mt-3 border-work-line text-work-text hover:bg-white/5">
        <Refresh width={15} height={15} /> Retry
      </button>
    </div>
  );
}

function Evaluating() {
  return (
    <div className="animate-fade-in rounded-2xl border border-work-line bg-work-panel2 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-work-line border-t-brand-500" />
      </div>
      <p className="mt-3 font-semibold text-work-text">Evaluating your work…</p>
      <p className="mt-1 text-sm text-work-muted">
        Scoring your responses against the rubric and gathering evidence.
      </p>
    </div>
  );
}
