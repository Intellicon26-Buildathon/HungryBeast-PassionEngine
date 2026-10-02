import type { Career, Scenario } from "./types";

// ── Career catalogue ────────────────────────────────────────────────
// Only Product Manager is fully functional for Gate 2 (available: true).
// The rest are concept cards so the catalogue reads as a real product.

export const CAREERS: Career[] = [
  {
    slug: "product-manager",
    title: "Product Manager",
    area: "Technology · Product",
    blurb:
      "Own a real product problem. Investigate a retention drop and recommend what the team should do next.",
    description:
      "Product managers sit between users, engineers and the business. They decide what to build and why. In this simulation you step into a junior PM role at a growing tech company and work a live problem with your manager.",
    durationMin: 15,
    difficulty: "Beginner",
    skills: ["Problem framing", "Analytical thinking", "User empathy", "Communication"],
    accent: "brand",
    available: true,
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    area: "Technology · Data",
    blurb:
      "Turn messy numbers into a clear story a team can act on.",
    description:
      "Data analysts find the signal in the noise and help teams make decisions with evidence instead of guesses.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["Data reasoning", "Hypothesis testing", "Visualisation", "Communication"],
    accent: "teal",
    available: false,
  },
  {
    slug: "ux-designer",
    title: "UX Designer",
    area: "Design · Product",
    blurb:
      "Redesign a confusing flow so real people can finish the job they came to do.",
    description:
      "UX designers study how people actually behave and shape products that feel obvious to use.",
    durationMin: 20,
    difficulty: "Intermediate",
    skills: ["User empathy", "Flow design", "Critique", "Communication"],
    accent: "accent",
    available: false,
  },
  {
    slug: "software-engineer",
    title: "Software Engineer",
    area: "Technology · Engineering",
    blurb:
      "Scope a feature, weigh trade-offs and defend a technical recommendation.",
    description:
      "Engineers turn fuzzy requirements into working systems while balancing speed, risk and quality.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["Systems thinking", "Trade-off analysis", "Risk awareness", "Explanation"],
    accent: "amber",
    available: false,
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    area: "Business · Operations",
    blurb:
      "Diagnose an operations bottleneck and prioritise a practical fix.",
    description:
      "Business analysts map how work really flows and find the change that makes the biggest difference.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["Structured thinking", "Prioritisation", "Process analysis", "Communication"],
    accent: "brand",
    available: false,
  },
];

export function getCareer(slug: string): Career | undefined {
  return CAREERS.find((c) => c.slug === slug);
}

// ── The fully-working Product Manager scenario ──────────────────────
// Fictional company so the simulation is original and controlled.

export const PM_SCENARIO: Scenario = {
  slug: "pm-novatech-retention",
  careerSlug: "product-manager",
  company: "NovaTech",
  companyTag: "Consumer mobile · Series A · Colombo + remote",
  role: "Junior Product Manager",
  managerName: "Maya Perera",
  managerTitle: "Head of Product",
  mission:
    "NovaTech's mobile app has lost 18% of its returning users this quarter. Help the team figure out why — and what to do about it.",
  context:
    "You've just joined NovaTech, a consumer app that helps people track and split shared expenses. Growth looked healthy until last quarter, when 30-day retention dropped from 46% to 38% — an 18% relative fall. Leadership is nervous. Your manager, Maya, wants a clear head on the problem before anyone starts building fixes.",
  turnLimit: 5,
  skills: [
    { id: "problem_framing", name: "Problem framing" },
    { id: "analytical_thinking", name: "Analytical thinking" },
    { id: "user_empathy", name: "User empathy" },
    { id: "communication", name: "Communication" },
  ],
  rubric: [
    {
      id: "problem_framing",
      label: "Problem framing",
      maxScore: 5,
      anchors: [
        "0–1: Jumps to a solution with no problem definition.",
        "2–3: Defines the problem but misses scope or key unknowns.",
        "4–5: Frames the problem crisply, separates symptom from cause, states what's unknown.",
      ],
    },
    {
      id: "use_of_evidence",
      label: "Use of evidence & assumptions",
      maxScore: 5,
      anchors: [
        "0–1: Opinions only; no data named.",
        "2–3: Names some data but mixes fact and assumption.",
        "4–5: Specifies what data to look at and clearly labels assumptions as assumptions.",
      ],
    },
    {
      id: "user_empathy",
      label: "Consideration of user needs",
      maxScore: 5,
      anchors: [
        "0–1: Ignores the user entirely.",
        "2–3: Mentions users generally.",
        "4–5: Reasons about specific user segments and their likely experience.",
      ],
    },
    {
      id: "feasibility",
      label: "Feasibility of proposed action",
      maxScore: 5,
      anchors: [
        "0–1: No concrete next step, or an unrealistic one.",
        "2–3: A next step that is vague or very large.",
        "4–5: A small, testable next step with a clear success signal.",
      ],
    },
    {
      id: "communication",
      label: "Clarity of explanation",
      maxScore: 5,
      anchors: [
        "0–1: Hard to follow.",
        "2–3: Understandable but unstructured.",
        "4–5: Structured, concise, decision-ready.",
      ],
    },
  ],
  tasks: [
    {
      id: "investigate",
      index: 0,
      title: "Investigate the problem",
      brief:
        "Hi — glad you're here. Quick one before we spiral into fixes. Retention on the app dropped 18% last quarter and the room is already shouting ideas. Before we touch anything: what do you actually want to understand first? What questions would you ask to make sense of this drop?",
      hint: "Resist jumping to solutions. What would you need to KNOW before you'd trust any explanation?",
      signals: ["when", "which", "segment", "user", "data", "cohort", "what changed", "release", "onboarding", "why"],
    },
    {
      id: "data",
      index: 1,
      title: "Identify useful data",
      brief:
        "Good instincts. We do have data — I just need someone to tell me where to look. If I gave you access to our analytics, which specific numbers or signals would you pull to test your questions? And what would you be careful NOT to over-read?",
      hint: "Name concrete metrics or sources. Separate what's evidence from what's a guess.",
      signals: ["retention", "cohort", "funnel", "churn", "segment", "event", "survey", "session", "feature", "version", "crash", "support"],
    },
    {
      id: "hypotheses",
      index: 2,
      title: "Form hypotheses",
      brief:
        "Let's say the data's in front of you. Give me two or three plausible explanations for the drop — and be honest about which are evidence-backed and which are still assumptions. I'd rather have ranked guesses than one confident wrong answer.",
      hint: "2–3 hypotheses. Label each: evidence or assumption?",
      signals: ["because", "hypothesis", "maybe", "likely", "assume", "evidence", "onboarding", "competitor", "bug", "pricing", "notification"],
    },
    {
      id: "experiment",
      index: 3,
      title: "Recommend a next step",
      brief:
        "Pick the one hypothesis you'd chase first. What's the smallest experiment or investigation you'd run to test it — something we could do in a week or two — and how would we know if it worked?",
      hint: "Small and testable beats big and vague. What's the success signal?",
      signals: ["test", "experiment", "a/b", "measure", "week", "cohort", "metric", "success", "small", "pilot", "interview"],
    },
    {
      id: "communicate",
      index: 4,
      title: "Communicate the recommendation",
      brief:
        "Last thing. Leadership meeting is in an hour. Give me 3–4 sentences I could say in that room: what we think is happening, what we're going to do about it, and why. Make it decision-ready.",
      hint: "Tight, structured, honest about uncertainty. This is the part leaders remember.",
      signals: ["recommend", "propose", "because", "next", "we", "risk", "expect", "if", "measure", "decision"],
    },
  ],
};

export const SCENARIOS: Record<string, Scenario> = {
  [PM_SCENARIO.slug]: PM_SCENARIO,
};

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS[slug];
}

export function getScenarioForCareer(careerSlug: string): Scenario | undefined {
  return Object.values(SCENARIOS).find((s) => s.careerSlug === careerSlug);
}
