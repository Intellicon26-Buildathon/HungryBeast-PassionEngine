// Domain types — mirror the planned Supabase schema so the mock layer
// can later be swapped for real DB rows + Gemini responses with no UI change.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Career {
  slug: string;
  title: string;
  area: string;
  blurb: string;
  description: string;
  durationMin: number;
  difficulty: Difficulty;
  skills: string[];
  accent: "brand" | "teal" | "accent" | "amber";
  available: boolean; // only the PM sim is fully functional for Gate 2
}

export interface ScenarioTask {
  id: string;
  index: number;
  title: string;
  // The manager's opening message for this task (role-play seed).
  brief: string;
  // Hint shown under the response box.
  hint: string;
  // Keywords the mock evaluator looks for (stand-in for a real rubric match).
  signals: string[];
}

export interface RubricCriterion {
  id: string;
  label: string;
  maxScore: number;
  anchors: string[]; // written anchors for transparency
}

export interface Scenario {
  slug: string;
  careerSlug: string;
  company: string;
  companyTag: string;
  role: string;
  managerName: string;
  managerTitle: string;
  mission: string;
  context: string;
  tasks: ScenarioTask[];
  rubric: RubricCriterion[];
  skills: { id: string; name: string }[];
  turnLimit: number;
}

export type Speaker = "manager" | "student" | "system";

export interface Turn {
  id: string;
  index: number;
  speaker: Speaker;
  content: string;
  taskId?: string;
  at: number;
}

export type SessionStatus = "active" | "completed" | "abandoned";

export interface Session {
  id: string;
  scenarioSlug: string;
  careerSlug: string;
  status: SessionStatus;
  currentTaskIndex: number;
  turns: Turn[];
  startedAt: number;
  completedAt?: number;
}

export interface CriterionScore {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: string;
  feedback: string;
}

export type SkillLevel = "emerging" | "developing" | "demonstrated";

export interface ObservedSkill {
  id: string;
  name: string;
  level: SkillLevel;
  evidence: string;
}

export interface Evaluation {
  sessionId: string;
  scenarioSlug: string;
  careerTitle: string;
  summary: string;
  criteria: CriterionScore[];
  observedSkills: ObservedSkill[];
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  limitations: string;
  createdAt: number;
}
