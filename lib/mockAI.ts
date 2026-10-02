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
  const bank = ACKS[task.id]?.[quality] ?? ["Noted — let's keep going."];
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
    const relTaskIds = CRITERION_TASKS[c.id] ?? [];
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

    const feedback =
      score >= 4
        ? positiveFeedback(c.id)
        : score >= 3
        ? growthFeedback(c.id)
        : gapFeedback(c.id);

    return { id: c.id, label: c.label, score, maxScore: c.maxScore, evidence, feedback };
  });

  const avgRatio =
    criteria.reduce((s, c) => s + c.score / c.maxScore, 0) / criteria.length;

  // Map each observed skill to the rubric criterion that best evidences it.
  const SKILL_TO_CRITERION: Record<string, string> = {
    problem_framing: "problem_framing",
    analytical_thinking: "use_of_evidence",
    user_empathy: "user_empathy",
    communication: "communication",
  };

  const observedSkills: ObservedSkill[] = scenario.skills.map((sk) => {
    const critId = SKILL_TO_CRITERION[sk.id] ?? sk.id;
    const match = criteria.find((c) => c.id === critId) ?? criteria[0];
    const level = levelFromScore(match.score, match.maxScore);
    return {
      id: sk.id,
      name: sk.name,
      level,
      evidence: match.evidence.replace(/^From your response: /, ""),
    };
  });

  const strengths = criteria
    .filter((c) => c.score >= 4)
    .map((c) => `${c.label}: ${positiveFeedback(c.id)}`)
    .slice(0, 3);
  if (strengths.length === 0) {
    strengths.push("You completed the full simulation and engaged with every task — that persistence counts.");
  }

  const improvements = criteria
    .filter((c) => c.score <= 3)
    .map((c) => `${c.label}: ${gapFeedback(c.id)}`)
    .slice(0, 3);
  if (improvements.length === 0) {
    improvements.push("Push for even more specificity — name exact numbers and name exact user segments.");
  }

  const summary = buildSummary(avgRatio, totalWords);

  return {
    sessionId: session.id,
    scenarioSlug: scenario.slug,
    careerTitle,
    summary,
    criteria,
    observedSkills,
    strengths,
    improvements,
    nextSteps: [
      "Practise breaking one broad problem into 3–4 smaller, answerable questions.",
      "Next time, label each claim as evidence or assumption before you commit to it.",
      "Try the Data Analyst simulation to strengthen how you reason with numbers.",
    ],
    limitations:
      "This is feedback on one simulation, generated from a fixed rubric — not a measure of your overall ability or a judgement about whether this career is right for you.",
    createdAt: Date.now(),
  };
}

function buildSummary(avgRatio: number, totalWords: number): string {
  if (avgRatio >= 0.72) {
    return "In this simulation you worked the problem like a product manager would — you slowed down, asked for evidence, and turned a vague retention drop into a focused, testable plan. Your thinking was structured and you were honest about uncertainty.";
  }
  if (avgRatio >= 0.5) {
    return "In this simulation you showed solid product instincts. You engaged with each task and reached a reasonable recommendation. The main opportunity is specificity — tying your reasoning to concrete data and sharper user segments.";
  }
  if (totalWords < 60) {
    return "In this simulation your answers were quite brief, so there's less evidence to reflect back. The flow is working — try it again and think out loud: the more of your reasoning you write, the more useful this feedback becomes.";
  }
  return "In this simulation you moved through the full problem and reached a recommendation. The biggest gains will come from framing the problem before solving it, and from grounding your ideas in specific evidence rather than general statements.";
}

function positiveFeedback(id: string): string {
  const m: Record<string, string> = {
    problem_framing: "you defined the problem before reaching for a solution.",
    use_of_evidence: "you pointed at specific data and separated fact from assumption.",
    user_empathy: "you reasoned about real user segments, not an average user.",
    feasibility: "your proposed next step was small and genuinely testable.",
    communication: "your explanation was structured and decision-ready.",
  };
  return m[id] ?? "clear, grounded thinking here.";
}
function growthFeedback(id: string): string {
  const m: Record<string, string> = {
    problem_framing: "you framed the problem but could sharpen what's known vs. unknown.",
    use_of_evidence: "you named some evidence — be explicit about which single number would change your mind.",
    user_empathy: "you mentioned users; name a specific segment and their likely experience.",
    feasibility: "your step is reasonable but could be smaller and more measurable.",
    communication: "clear enough — lead with the recommendation and trim the rest.",
  };
  return m[id] ?? "a solid attempt with room to go deeper.";
}
function gapFeedback(id: string): string {
  const m: Record<string, string> = {
    problem_framing: "try defining the problem and its unknowns before proposing anything.",
    use_of_evidence: "name concrete data you'd look at, and flag your assumptions as assumptions.",
    user_empathy: "bring the actual user in — which group is affected and how?",
    feasibility: "propose one small, testable next step with a clear success signal.",
    communication: "structure the answer: what's happening, what you'd do, and why.",
  };
  return m[id] ?? "add more detail and structure here.";
}
