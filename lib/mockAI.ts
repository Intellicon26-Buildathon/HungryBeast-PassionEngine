import type {
  Scenario,
  ScenarioTask,
  Session,
  Evaluation,
  CriterionScore,
  ObservedSkill,
  SkillLevel,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// MOCK AI LAYER
//
// This stands in for the two bounded Gemini agents described in the plan:
//   • Role-play agent  → generateManagerReply()
//   • Evaluation agent → generateEvaluation()
//
// It is intentionally deterministic and runs client-side so the whole
// flow is demonstrable with ZERO API keys. When real Gemini is wired in,
// these two functions become server-side calls returning the SAME shapes,
// and no UI code changes.
// ─────────────────────────────────────────────────────────────────────

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function countSignals(text: string, signals: string[]): number {
  const t = text.toLowerCase();
  let hits = 0;
  for (const s of signals) if (t.includes(s)) hits++;
  return hits;
}

function snippet(text: string, maxWords = 16): string {
  const clean = text.trim().replace(/\s+/g, " ");
  const ws = clean.split(" ");
  if (ws.length <= maxWords) return clean;
  return ws.slice(0, maxWords).join(" ") + "…";
}

type Quality = "strong" | "partial" | "thin";

function assessAnswer(answer: string, task: ScenarioTask): Quality {
  const wc = words(answer).length;
  const hits = countSignals(answer, task.signals);
  if (wc >= 45 && hits >= 3) return "strong";
  if (wc >= 18 && hits >= 1) return "partial";
  return "thin";
}

// A small library of contextual acknowledgements keyed by task + quality.
const ACKS: Record<string, Record<Quality, string[]>> = {
  investigate: {
    strong: [
      "That's exactly the reflex I want — questions before conclusions. You're already separating the symptom from the cause.",
      "Good. You're not rushing to a fix, you're trying to understand the shape of the problem first. That's rare and it matters.",
    ],
    partial: [
      "Decent start. You're asking some of the right things — I'd push you to be even more specific about *which* users and *when* the drop happened.",
    ],
    thin: [
      "Okay — but that's a bit quick. Before we fix anything, I really need to know what you'd want to understand first. Try naming an actual question you'd ask the data.",
    ],
  },
  data: {
    strong: [
      "Yes — concrete metrics, and you flagged what not to over-read. That's the difference between an analyst and someone who just likes charts.",
      "Strong. You named signals we can actually pull, and you're being careful about correlation vs. cause.",
    ],
    partial: [
      "Useful. You've pointed at some real data — try to be sharper on which single number would most change your mind.",
    ],
    thin: [
      "I need more than that. If I handed you our dashboards right now, what's the first number you'd open? Name something specific.",
    ],
  },
  hypotheses: {
    strong: [
      "Good — ranked, plausible, and you were honest about which are still guesses. I can work with this.",
      "That's a proper set of hypotheses. Labelling evidence vs. assumption is exactly what keeps us from chasing the loudest opinion in the room.",
    ],
    partial: [
      "You're onto something. Give me a clearer sense of which one you'd bet on, and why.",
    ],
    thin: [
      "I need a couple of real explanations here — even informed guesses. What *might* be causing the drop?",
    ],
  },
  experiment: {
    strong: [
      "That's the one. Small, testable, with a signal we'd actually see in a week or two. This is how we avoid building the wrong thing for a month.",
      "Love it — focused and measurable. If the signal moves, we learn something real either way.",
    ],
    partial: [
      "A reasonable step. Tighten it: what's the smallest version, and how exactly would we know it worked?",
    ],
    thin: [
      "That's too big or too vague to run quickly. What's the *smallest* thing we could try this week to test your idea?",
    ],
  },
  communicate: {
    strong: [
      "That's decision-ready. I could walk into that room and say it. Clear, honest about the uncertainty, and it points at an action.",
      "Perfect — tight and structured. That's the version leadership remembers.",
    ],
    partial: [
      "Close. I'd trim it and lead with the recommendation — but the substance is there.",
    ],
    thin: [
      "I can't take that into the room yet. Give me the short version: what's happening, what we'll do, and why.",
    ],
  },
};

const THEME_NOTES: { keys: string[]; note: string }[] = [
  { keys: ["segment", "cohort"], note: "I like that you're thinking in segments rather than one average number." },
  { keys: ["onboarding", "new user", "first"], note: "The onboarding angle is worth holding onto." },
  { keys: ["notification", "push", "email"], note: "Re-engagement channels are a fair thread to pull." },
  { keys: ["competitor", "pricing"], note: "External factors are worth naming, even if we can't control them." },
  { keys: ["bug", "crash", "version", "release"], note: "A regression after a release is the kind of thing we can check fast." },
  { keys: ["interview", "talk to users", "survey"], note: "Talking to actual users — most teams skip that and regret it." },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function generateManagerReply(
  scenario: Scenario,
  task: ScenarioTask,
  studentAnswer: string,
  turnSeed: number
): string {
  const quality = assessAnswer(studentAnswer, task);
  const bank = ACKS[task.id]?.[quality] ?? [
    quality === "strong"
      ? `That gives us a workable direction for this ${scenario.role} task. What would you verify first before we act?`
      : quality === "partial"
      ? `Useful start. For this ${scenario.role} task, make your next action more specific: ${task.hint}`
      : `I need a clearer response to this part of the work. ${task.hint}`,
  ];
  let reply = pick(bank, turnSeed);

  // Add one theme-aware line if we detect a relevant angle (strong/partial only).
  if (quality !== "thin") {
    const lower = studentAnswer.toLowerCase();
    const theme = THEME_NOTES.find((t) => t.keys.some((k) => lower.includes(k)));
    if (theme) reply += " " + theme.note;
  }

  return reply;
}

// ── Evaluation (stand-in for the evaluator agent) ───────────────────

function levelFromScore(score: number, max: number): SkillLevel {
  const ratio = score / max;
  if (ratio >= 0.72) return "demonstrated";
  if (ratio >= 0.45) return "developing";
  return "emerging";
}

function studentAnswers(session: Session): { taskId?: string; text: string }[] {
  return session.turns
    .filter((t) => t.speaker === "student")
    .map((t) => ({ taskId: t.taskId, text: t.content }));
}

// Map each rubric criterion to the tasks whose signals best test it.
const CRITERION_TASKS: Record<string, string[]> = {
  problem_framing: ["investigate", "hypotheses"],
  use_of_evidence: ["data", "hypotheses"],
  user_empathy: ["investigate", "data", "hypotheses"],
  feasibility: ["experiment"],
  communication: ["communicate", "experiment"],
};

export function generateEvaluation(
  scenario: Scenario,
  session: Session,
  careerTitle: string
): Evaluation {
  const answers = studentAnswers(session);
  const byTask = new Map(answers.map((a) => [a.taskId, a.text]));
  const allText = answers.map((a) => a.text).join(" ");
  const totalWords = words(allText).length;

  const criteria: CriterionScore[] = scenario.rubric.map((c) => {
    const relTaskIds = c.taskIds ?? CRITERION_TASKS[c.id] ?? [];
    const relTasks = scenario.tasks.filter((t) => relTaskIds.includes(t.id));

    let coverage = 0;
    let depth = 0;
    let bestEvidence = "";
    let bestHits = -1;

    for (const t of relTasks) {
      const ans = byTask.get(t.id) ?? "";
      const hits = countSignals(ans, t.signals);
      const wc = words(ans).length;
      coverage += Math.min(hits, 3);
      depth += Math.min(wc / 40, 1);
      if (hits > bestHits && ans.trim()) {
        bestHits = hits;
        bestEvidence = snippet(ans);
      }
    }

    const maxCoverage = relTasks.length * 3;
    const covRatio = maxCoverage ? coverage / maxCoverage : 0;
    const depthRatio = relTasks.length ? depth / relTasks.length : 0;
    const raw = 1 + covRatio * 2.6 + depthRatio * 1.6; // → roughly 1..5
    const score = Math.max(1, Math.min(c.maxScore, Math.round(raw)));

    const evidence = bestEvidence
      ? `From your response: "${bestEvidence}"`
      : "You didn't address this directly in your answers.";

    const anchorIndex = score >= 4 ? 2 : score >= 3 ? 1 : 0;
    const feedback = c.anchors[anchorIndex]?.replace(/^(?:0–1|2–3|4–5):\s*/, "") ??
      "Use the case evidence to make the next action more specific.";

    return { id: c.id, label: c.label, score, maxScore: c.maxScore, evidence, feedback };
  });

  const observedSkills: ObservedSkill[] = scenario.skills.map((sk) => {
    const critId = sk.criterionId ?? ({
      problem_framing: "problem_framing",
      analytical_thinking: "use_of_evidence",
      user_empathy: "user_empathy",
      communication: "communication",
    }[sk.id] ?? sk.id);
    const match = criteria.find((c) => c.id === critId) ?? criteria[0];
    const level = levelFromScore(match.score, match.maxScore);
    return {
      id: sk.id,
      name: sk.name,
      level,
      evidence: match.evidence.replace(/^From your response: /, ""),
    };
  });

  const rankedCriteria = [...criteria].sort(
    (left, right) => right.score / right.maxScore - left.score / left.maxScore
  );
  const strengths = rankedCriteria
    .filter((c) => c.score >= 4)
    .map((c) => `${c.label}: ${c.feedback}`)
    .slice(0, 3);
  if (strengths.length === 0) {
    strengths.push("You completed the scenario and left evidence across the assessed work.");
  }

  const improvements = [...rankedCriteria]
    .reverse()
    .filter((c) => c.score <= 3)
    .map((c) => `${c.label}: ${c.feedback}`)
    .slice(0, 3);
  if (improvements.length === 0) {
    improvements.push("Try the same workflow with a new constraint and compare the evidence you gather.");
  }

  const nextSteps = [...rankedCriteria]
    .reverse()
    .slice(0, 3)
    .map((criterion) => {
      const taskIds = scenario.rubric.find((item) => item.id === criterion.id)?.taskIds ??
        CRITERION_TASKS[criterion.id] ?? [];
      const task = scenario.tasks.find((item) => taskIds.includes(item.id));
      return task ? `${task.title}: ${task.hint}` : `${criterion.label}: ${criterion.feedback}`;
    });
  const summary = buildSummary(careerTitle, totalWords, rankedCriteria);

  return {
    sessionId: session.id,
    scenarioSlug: scenario.slug,
    careerTitle,
    summary,
    criteria,
    observedSkills,
    strengths,
    improvements,
    nextSteps,
    limitations:
      "This report reflects one fictional work scenario and a fixed, case-specific rubric. It is not a measure of your overall ability or a judgement about whether this career is right for you.",
    createdAt: Date.now(),
  };
}

function buildSummary(
  careerTitle: string,
  totalWords: number,
  rankedCriteria: CriterionScore[]
): string {
  const strongest = rankedCriteria[0]?.label ?? "the work";
  const nextFocus = rankedCriteria[rankedCriteria.length - 1]?.label ?? "your next step";
  const detail = totalWords < 60
    ? "Your answers were brief, so the report has less evidence to reflect."
    : `The report reflects ${totalWords} words from your saved responses.`;
  return `You completed a ${careerTitle} work simulation. ${strongest} was your strongest rubric area, while ${nextFocus} is a useful area to practise next. ${detail}`;
}
