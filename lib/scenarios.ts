import type { Career, Scenario } from "./types";

// ── Playable career catalogue ───────────────────────────────────────

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
    slug: "frontend-developer",
    title: "Frontend Developer",
    area: "Technology · Web",
    blurb:
      "Build interfaces that are clear, fast and a pleasure to use across devices.",
    description:
      "Frontend developers turn designs and product thinking into interactive experiences using HTML, CSS and JavaScript frameworks.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["UI implementation", "User experience", "Performance", "Debugging"],
    accent: "teal",
    available: true,
  },
  {
    slug: "backend-developer",
    title: "Backend Developer",
    area: "Technology · Systems",
    blurb:
      "Design reliable APIs, services and data flows that power products behind the scenes.",
    description:
      "Backend developers build the systems that store data, enforce rules and deliver logic to user-facing experiences.",
    durationMin: 20,
    difficulty: "Intermediate",
    skills: ["API design", "Data modelling", "Reliability", "Security"],
    accent: "brand",
    available: true,
  },
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    area: "Technology · Product",
    blurb:
      "Ship end-to-end product features from interface to server and database.",
    description:
      "Full stack developers connect user experience and infrastructure so the whole product works as one system.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["Systems thinking", "API integration", "Product delivery", "Debugging"],
    accent: "amber",
    available: true,
  },
  {
    slug: "android-developer",
    title: "Android Developer",
    area: "Technology · Mobile",
    blurb:
      "Create mobile product experiences that feel native, responsive and trustworthy.",
    description:
      "Android developers build and maintain apps for the Android ecosystem, balancing user needs, operating system constraints and device diversity.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["Mobile UI", "Android patterns", "Performance", "Testing"],
    accent: "accent",
    available: true,
  },
  {
    slug: "ios-developer",
    title: "iOS Developer",
    area: "Technology · Mobile",
    blurb:
      "Craft polished experiences for Apple's ecosystem with strong product thinking.",
    description:
      "iOS developers design and ship mobile features for iPhone and iPad users with a focus on usability, platform conventions and quality.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["Swift", "Human interfaces", "App architecture", "Accessibility"],
    accent: "teal",
    available: true,
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    area: "Technology · Operations",
    blurb:
      "Keep services reliable, deployable and observable as teams grow.",
    description:
      "DevOps engineers connect software delivery, infrastructure and reliability so changes reach users safely and efficiently.",
    durationMin: 20,
    difficulty: "Advanced",
    skills: ["CI/CD", "Automation", "Monitoring", "Infrastructure"],
    accent: "brand",
    available: true,
  },
  {
    slug: "devsecops-engineer",
    title: "DevSecOps Engineer",
    area: "Technology · Security",
    blurb:
      "Make security part of the delivery pipeline rather than a final bottleneck.",
    description:
      "DevSecOps engineers help teams ship quickly without ignoring vulnerabilities, secrets, hardened configurations or compliance needs.",
    durationMin: 20,
    difficulty: "Advanced",
    skills: ["Security automation", "Threat awareness", "Compliance", "Risk management"],
    accent: "amber",
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
    available: true,
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    area: "Technology · Data",
    blurb:
      "Use statistical thinking and machine learning to answer high-value business questions.",
    description:
      "Data scientists build models, test hypotheses and help teams understand what patterns are actually important and reliable.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["Statistics", "Machine learning", "Experimentation", "Communication"],
    accent: "amber",
    available: true,
  },
  {
    slug: "data-engineer",
    title: "Data Engineer",
    area: "Technology · Data",
    blurb:
      "Build the pipelines, storage and trust layer that make analytics and AI possible.",
    description:
      "Data engineers turn messy raw sources into structured, dependable data products that downstream teams can rely on.",
    durationMin: 20,
    difficulty: "Advanced",
    skills: ["Data pipelines", "ETL", "Warehousing", "Reliability"],
    accent: "brand",
    available: true,
  },
  {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    area: "Technology · AI",
    blurb:
      "Take models from prototype to production with a sensible engineering workflow.",
    description:
      "Machine learning engineers bring together data, modeling, experimentation and product constraints to make AI useful in real systems.",
    durationMin: 24,
    difficulty: "Advanced",
    skills: ["Model evaluation", "ML systems", "Experimentation", "Deployment"],
    accent: "amber",
    available: true,
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    area: "Technology · AI",
    blurb:
      "Design prompts, workflows and tool integrations that make AI useful for real users.",
    description:
      "AI engineers turn emerging model capabilities into practical experiences, testing quality, safeguards and business value.",
    durationMin: 18,
    difficulty: "Intermediate",
    skills: ["Prompt design", "Evaluation", "AI workflows", "Product thinking"],
    accent: "accent",
    available: true,
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
    available: true,
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    area: "Design · Product",
    blurb:
      "Balance customer needs, business outcomes and the realities of shipping.",
    description:
      "Product designers work across research, interaction design and visual decisions to make better product experiences more likely.",
    durationMin: 20,
    difficulty: "Intermediate",
    skills: ["Design systems", "Research", "Interaction design", "Mockups"],
    accent: "teal",
    available: true,
  },
  {
    slug: "qa-engineer",
    title: "QA Engineer",
    area: "Technology · Quality",
    blurb:
      "Find the gaps between intent and reality before users do.",
    description:
      "QA engineers check whether systems behave as expected under real-world conditions and give teams clear, useful feedback.",
    durationMin: 16,
    difficulty: "Intermediate",
    skills: ["Test strategy", "Bug analysis", "Quality thinking", "Automation"],
    accent: "brand",
    available: true,
  },
  {
    slug: "software-architect",
    title: "Software Architect",
    area: "Technology · Engineering",
    blurb:
      "Shape the big decisions that keep a system flexible, secure and maintainable.",
    description:
      "Architects think beyond one feature and design the structure, trade-offs and standards that guide multiple teams over time.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["System design", "Trade-offs", "Standards", "Technical leadership"],
    accent: "amber",
    available: true,
  },
  {
    slug: "cybersecurity-engineer",
    title: "Cyber Security Engineer",
    area: "Technology · Security",
    blurb:
      "Protect systems, data and user trust before problems become incidents.",
    description:
      "Cyber security professionals design controls, detect risk and help teams reduce attack surface with practical security decisions.",
    durationMin: 20,
    difficulty: "Advanced",
    skills: ["Threat modeling", "Security controls", "Monitoring", "Risk reduction"],
    accent: "accent",
    available: true,
  },
  {
    slug: "technical-writer",
    title: "Technical Writer",
    area: "Business · Documentation",
    blurb:
      "Turn complex systems into clear guidance that people can actually use.",
    description:
      "Technical writers turn product knowledge into documentation that helps users and teams move faster with less confusion.",
    durationMin: 15,
    difficulty: "Beginner",
    skills: ["Clarity", "Structure", "Research", "Communication"],
    accent: "teal",
    available: true,
  },
  {
    slug: "game-developer",
    title: "Game Developer",
    area: "Technology · Creative",
    blurb:
      "Build interactive experiences where systems, art and gameplay all work together.",
    description:
      "Game developers balance mechanics, performance, tools and user delight to create engaging interactive worlds.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["Game systems", "Performance", "Iteration", "Creativity"],
    accent: "amber",
    available: true,
  },
  {
    slug: "blockchain-developer",
    title: "Blockchain Developer",
    area: "Technology · Web3",
    blurb:
      "Design secure, transparent systems around decentralised trust and ownership.",
    description:
      "Blockchain developers build smart contracts, protocols and product experiences that depend on distributed systems and clear incentives.",
    durationMin: 22,
    difficulty: "Advanced",
    skills: ["Protocols", "Security", "Distributed systems", "Smart contracts"],
    accent: "brand",
    available: true,
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
    available: true,
  },
  {
    slug: "seo-specialist",
    title: "SEO Specialist",
    area: "Business · Growth",
    blurb:
      "Improve how products and content are discovered through search and demand generation.",
    description:
      "SEO specialists connect product insights, content strategy and technical optimisation to improve visibility and quality of traffic.",
    durationMin: 16,
    difficulty: "Intermediate",
    skills: ["Content strategy", "Technical SEO", "Analysis", "Testing"],
    accent: "teal",
    available: true,
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
    available: true,
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
  typicalWorkday:
    "Clarify a customer or business problem, review product data and research, align with design and engineering, then make a clear scope and priority decision.",
  deliverables: ["Problem brief", "Prioritised experiment", "Decision update for the team"],
  collaborators: ["Product designer", "Software engineers", "Analytics partner"],
  tradeoffs: ["Customer value vs. delivery cost", "Fast learning vs. reliable evidence", "Short-term retention vs. long-term trust"],
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

interface CareerWorkCase {
  company: string;
  companyTag: string;
  managerName: string;
  managerTitle: string;
  mission: string;
  context: string;
  caseEvidence: string;
  decisionPrompt: string;
  typicalWorkday: string;
  deliverables: string[];
  collaborators: string[];
  tradeoffs: string[];
  signals: [string[], string[], string[], string[]];
}

const CAREER_WORK_CASES: Record<string, CareerWorkCase> = {
  "frontend-developer": {
    company: "HarborLearn",
    companyTag: "Fictional learning platform · Web product team",
    managerName: "Nimali Perera",
    managerTitle: "Frontend Lead",
    mission: "Fix a course-enrolment page that hides its main action on smaller screens.",
    context: "A student learning platform is preparing an enrolment change. On narrow phones, long course names push the confirmation button below an unclear scroll area. Your team has one day to propose a safe fix before a student pilot.",
    caseEvidence: "The bug report includes a 360-pixel viewport recording, one 320-pixel device with a translated course title, and a screenshot where the keyboard covers the final action. The visual design exists, but no acceptance criteria were written.",
    decisionPrompt: "Describe the UI change you would implement first. Explain how you would keep the page usable with long text, a visible keyboard, and keyboard-only navigation.",
    typicalWorkday: "Translate designs into responsive components, inspect browser behaviour, review pull requests, and work through accessibility and performance feedback.",
    deliverables: ["Responsive enrolment component", "Accessible interaction states", "Browser-tested change"],
    collaborators: ["Product designer", "Backend engineer", "Quality engineer"],
    tradeoffs: ["Visual fidelity vs. responsive resilience", "Fast patch vs. reusable component", "Mouse convenience vs. keyboard access"],
    signals: [["viewport", "keyboard", "acceptance", "user", "responsive", "requirement"], ["browser", "screen", "test", "accessibility", "device", "reproduce"], ["component", "layout", "css", "html", "keyboard", "responsive"], ["review", "test", "acceptance", "trade-off", "release", "measure"]],
  },
  "backend-developer": {
    company: "KitePay",
    companyTag: "Fictional payments service · API team",
    managerName: "Ravindu Silva",
    managerTitle: "Backend Lead",
    mission: "Stop a payment retry from creating duplicate invoices.",
    context: "A small payments service receives occasional duplicate invoice records when a mobile connection drops after checkout and the client retries. You have a staging trace and need to recommend a safe API-side change.",
    caseEvidence: "The trace shows two POST requests with the same order reference arriving 1.8 seconds apart. The handler inserts on every request, and the current database has a unique order reference constraint that returns an unhandled error.",
    decisionPrompt: "Propose the server and data-layer change you would make so retries return a safe, consistent result without charging twice.",
    typicalWorkday: "Build and review APIs, trace production-like requests, model data, and coordinate contracts with client engineers.",
    deliverables: ["Idempotent API behaviour", "Data constraint or transaction plan", "Regression tests"],
    collaborators: ["Mobile engineer", "Database engineer", "Payments operations"],
    tradeoffs: ["Retry convenience vs. duplicate side effects", "Correctness vs. throughput", "Useful errors vs. sensitive logs"],
    signals: [["request", "retry", "order", "requirement", "duplicate", "idempotent"], ["trace", "database", "transaction", "constraint", "log", "reproduce"], ["idempotency", "transaction", "unique", "api", "atomic", "response"], ["test", "rollback", "monitor", "client", "failure", "reconcile"]],
  },
  "full-stack-developer": {
    company: "ClassroomCloud",
    companyTag: "Fictional education service · Product engineering",
    managerName: "Ishara Fernando",
    managerTitle: "Engineering Lead",
    mission: "Make workshop seat reservations consistent from the booking screen to the database.",
    context: "Students sometimes see a seat as available on the booking page, but receive a rejection after submitting because another request reserved it first. The team needs an end-to-end fix that keeps both the interface and the server honest.",
    caseEvidence: "The browser reads availability before submission. Two users can submit at once. The API currently trusts the old availability value, while the database has no atomic reservation operation.",
    decisionPrompt: "Outline the smallest full-stack change you would ship. Show how the interface should respond to a conflict and how the server prevents overselling.",
    typicalWorkday: "Move between user interfaces, API contracts, and data behaviour while owning a feature through review and verification.",
    deliverables: ["Reservation API change", "Clear conflict state in the UI", "Concurrent-request test"],
    collaborators: ["Product manager", "UX designer", "Database owner"],
    tradeoffs: ["Fast feedback vs. stale client state", "Simple API vs. atomic reservation", "Optimistic UI vs. accurate availability"],
    signals: [["seat", "booking", "user", "requirement", "conflict", "availability"], ["api", "database", "concurrent", "request", "race", "test"], ["transaction", "atomic", "server", "interface", "conflict", "state"], ["end-to-end", "test", "error", "review", "monitor", "reconcile"]],
  },
  "android-developer": {
    company: "RouteMate",
    companyTag: "Fictional travel app · Android team",
    managerName: "Kavindu Jayasuriya",
    managerTitle: "Android Lead",
    mission: "Protect a traveller's unfinished booking when the app goes into the background.",
    context: "People on patchy mobile connections report losing their booking details after switching apps to check a message. The team wants a resilient Android flow that does not silently submit stale or sensitive data.",
    caseEvidence: "The current form stores draft values only in a screen-level state object. The activity can be recreated after memory pressure, and the network request has no visible retry state.",
    decisionPrompt: "Recommend how you would persist and restore a safe draft, handle lifecycle changes, and make retry behaviour clear without duplicating a booking.",
    typicalWorkday: "Build Android screens, handle lifecycle and device differences, connect app behaviour to APIs, and test on real or emulated devices.",
    deliverables: ["Lifecycle-safe booking draft", "Retry and error states", "Device and recreation tests"],
    collaborators: ["Backend engineer", "Product designer", "Mobile QA"],
    tradeoffs: ["Convenient persistence vs. data minimisation", "Retry speed vs. duplicate requests", "One device profile vs. broad Android support"],
    signals: [["lifecycle", "booking", "draft", "user", "requirement", "restore"], ["activity", "memory", "network", "recreate", "test", "state"], ["saved state", "database", "retry", "idempotent", "android", "restore"], ["device", "test", "privacy", "failure", "release", "monitor"]],
  },
  "ios-developer": {
    company: "GoodDay",
    companyTag: "Fictional wellbeing app · iOS team",
    managerName: "Anuki de Silva",
    managerTitle: "iOS Lead",
    mission: "Improve a reminder setup flow that asks for notification permission before explaining its value.",
    context: "A wellbeing app wants users to schedule medication reminders. The current screen requests notification access as soon as it opens, before people choose a time or understand what reminders do.",
    caseEvidence: "The permission prompt cannot be shown again after a user declines without a settings trip. The design has no denied-permission state, and the reminder schedule is stored separately from the permission result.",
    decisionPrompt: "Design the permission and recovery sequence you would implement. Explain how you would respect the user's choice and verify reminder scheduling.",
    typicalWorkday: "Build native iOS interactions, apply platform conventions, manage permissions and state, and review accessibility across supported devices.",
    deliverables: ["Permission timing change", "Denied and granted states", "Reminder scheduling tests"],
    collaborators: ["Product designer", "Mobile QA", "Privacy reviewer"],
    tradeoffs: ["Permission timing vs. informed choice", "Helpful reminders vs. user control", "Platform polish vs. broad compatibility"],
    signals: [["permission", "reminder", "user", "choice", "requirement", "schedule"], ["denied", "settings", "state", "notification", "test", "privacy"], ["ios", "permission", "schedule", "accessibility", "recover", "state"], ["device", "test", "privacy", "notification", "release", "feedback"]],
  },
  "devops-engineer": {
    company: "Northstar Tickets",
    companyTag: "Fictional ticketing service · Platform operations",
    managerName: "Sahan Wijesinghe",
    managerTitle: "Platform Lead",
    mission: "Reduce a slow, risky production rollback without bypassing release checks.",
    context: "A ticketing service sees brief outages during busy event launches. The latest rollback required several manual steps, and the on-call engineer had to locate the correct deployment by hand.",
    caseEvidence: "The release pipeline has build and test stages but no tested rollback job. Deployment identifiers are in separate logs, and the service health check only confirms that a process starts.",
    decisionPrompt: "Propose a safer deployment and rollback improvement. State what health signals should stop a rollout and how you would test recovery before relying on it.",
    typicalWorkday: "Automate build and release paths, improve service observability, support incident response, and help teams ship safely.",
    deliverables: ["Repeatable rollback path", "Release health checks", "Recovery runbook"],
    collaborators: ["Application engineers", "On-call support", "Security engineer"],
    tradeoffs: ["Release speed vs. blast radius", "Automation vs. manual control", "More checks vs. deployment friction"],
    signals: [["rollback", "release", "outage", "service", "requirement", "risk"], ["health", "logs", "deployment", "check", "incident", "metric"], ["pipeline", "rollback", "health check", "canary", "automation", "recovery"], ["runbook", "test", "alert", "on-call", "deploy", "review"]],
  },
  "devsecops-engineer": {
    company: "CivicStack",
    companyTag: "Fictional public service platform · Delivery security",
    managerName: "Tharushi Perera",
    managerTitle: "Security Engineering Lead",
    mission: "Triage a newly flagged dependency risk before a scheduled release.",
    context: "A service team has a release planned for tomorrow. An automated scanner flags a high-risk issue in a dependency, but the alert does not say whether the affected code path is reachable in this application.",
    caseEvidence: "The package is used by a web-facing service. A patched version is available, but its release notes mention a breaking configuration change. No owner has reviewed the exploitability or deployment plan.",
    decisionPrompt: "Set out a practical triage and remediation plan. Explain how you would validate impact, manage the upgrade risk, and keep the release decision auditable.",
    typicalWorkday: "Integrate security checks into delivery, help engineers fix findings, review secrets and dependencies, and make risk decisions traceable.",
    deliverables: ["Finding triage", "Tested dependency update or mitigation", "Documented release decision"],
    collaborators: ["Service owner", "Security operations", "Release manager"],
    tradeoffs: ["Risk reduction vs. breaking changes", "Release deadline vs. exposure", "Alert volume vs. actionable findings"],
    signals: [["dependency", "release", "risk", "scope", "owner", "impact"], ["scanner", "version", "reachable", "exploit", "release note", "evidence"], ["patch", "mitigation", "test", "security", "rollback", "upgrade"], ["audit", "decision", "monitor", "owner", "release", "verify"]],
  },
  "data-analyst": {
    company: "KitePay",
    companyTag: "Fictional payments service · Analytics",
    managerName: "Dinithi Amarasinghe",
    managerTitle: "Analytics Lead",
    mission: "Find out whether a checkout completion dip reflects user behaviour or broken event tracking.",
    context: "The payments team sees fewer completed checkouts in its weekly dashboard and is considering a redesign. Before that decision, your manager wants to know whether the drop is real and which customers are affected.",
    caseEvidence: "The dashboard shows a decline after a mobile app release. The checkout-start event volume stayed stable, but completion events also fell on an internal test account. A tracking change shipped in the same release.",
    decisionPrompt: "Describe the analysis you would run, the segments you would compare, and the caveat you would give before anyone interprets the dashboard as a product outcome.",
    typicalWorkday: "Clarify business questions, query and validate data, look for patterns, and explain findings in language decision-makers can use.",
    deliverables: ["Validated query or analysis", "Segment comparison", "Decision-ready chart and caveat"],
    collaborators: ["Product manager", "Data engineer", "Marketing analyst"],
    tradeoffs: ["Fast directional answer vs. verified data", "Overall average vs. segment detail", "Correlation vs. causal claim"],
    signals: [["checkout", "question", "user", "segment", "release", "metric"], ["event", "tracking", "account", "query", "validate", "data quality"], ["cohort", "compare", "funnel", "metric", "segment", "baseline"], ["chart", "caveat", "decision", "assumption", "audience", "recommend"]],
  },
  "data-scientist": {
    company: "RouteMate",
    companyTag: "Fictional travel app · Applied research",
    managerName: "Malith Senanayake",
    managerTitle: "Data Science Lead",
    mission: "Assess whether a cancellation-risk model is useful enough to guide support outreach.",
    context: "A travel team wants to contact customers likely to cancel a booking. A prototype model ranks risk, but a false alert can worry a customer and support capacity is limited.",
    caseEvidence: "The validation sample contains far fewer cancellations than non-cancellations. The prototype reports high accuracy, but no one has reviewed precision, recall, calibration, or performance across booking types.",
    decisionPrompt: "Recommend how you would evaluate the model against the actual support decision. Identify a baseline, the right error trade-off, and a safe pilot design.",
    typicalWorkday: "Frame a decision with partners, inspect data quality, compare statistical or model approaches, and communicate uncertainty and impact.",
    deliverables: ["Evaluation plan and baseline", "Error analysis by segment", "Bounded pilot recommendation"],
    collaborators: ["Data engineer", "Support lead", "Product manager"],
    tradeoffs: ["Missed cancellations vs. unnecessary outreach", "Model complexity vs. interpretability", "Offline performance vs. live usefulness"],
    signals: [["cancellation", "decision", "support", "segment", "baseline", "user"], ["imbalance", "precision", "recall", "calibration", "validation", "sample"], ["threshold", "baseline", "pilot", "error", "segment", "model"], ["uncertainty", "monitor", "pilot", "consent", "measure", "decision"]],
  },
  "data-engineer": {
    company: "HarborLearn",
    companyTag: "Fictional learning platform · Data platform",
    managerName: "Hasini Gunawardena",
    managerTitle: "Data Platform Lead",
    mission: "Repair a nightly lesson-activity pipeline that produces inconsistent learner counts.",
    context: "The learning team uses daily activity totals to plan tutor coverage. Counts sometimes change after the morning report is shared, so analysts have started exporting raw events by hand.",
    caseEvidence: "A source occasionally redelivers the same event after a timeout. The pipeline appends each delivery, and a late-arriving event can land after the daily table has been marked complete.",
    decisionPrompt: "Design a pipeline correction that handles replays and late data. Explain how you would make the output idempotent and show analysts when a partition is trustworthy.",
    typicalWorkday: "Build data ingestion and transformation jobs, manage schemas and late-arriving data, and make downstream datasets dependable.",
    deliverables: ["Replay-safe transformation", "Partition quality checks", "Recovery and backfill notes"],
    collaborators: ["Analytics team", "Source-service engineer", "Platform operations"],
    tradeoffs: ["Freshness vs. completeness", "Reprocessing cost vs. correctness", "Flexible schema vs. stable contracts"],
    signals: [["activity", "count", "downstream", "requirement", "late", "event"], ["duplicate", "replay", "partition", "schema", "source", "validate"], ["idempotent", "upsert", "watermark", "backfill", "deduplicate", "pipeline"], ["quality", "freshness", "alert", "recovery", "contract", "monitor"]],
  },
  "machine-learning-engineer": {
    company: "KitePay",
    companyTag: "Fictional payments service · Machine learning platform",
    managerName: "Shehan Wickramasinghe",
    managerTitle: "ML Platform Lead",
    mission: "Investigate a payment-risk model whose live results differ from offline evaluation.",
    context: "A risk team reports that a recently deployed model is sending more transactions for manual review than expected. The offline evaluation looked stable, so the team needs to locate the gap before changing thresholds.",
    caseEvidence: "Training features are built from a daily snapshot, while serving uses recent events. A feature name changed in one producer, and the monitoring dashboard tracks request latency but not feature distributions.",
    decisionPrompt: "Explain how you would compare training and serving data, contain risk while investigating, and decide whether to roll back or repair the feature pipeline.",
    typicalWorkday: "Package models for reliable serving, monitor data and model behaviour, coordinate releases, and make rollback paths testable.",
    deliverables: ["Training-serving comparison", "Feature monitoring", "Safe remediation or rollback"],
    collaborators: ["Data scientist", "Data engineer", "Risk operations"],
    tradeoffs: ["Review volume vs. missed fraud", "Fast rollback vs. degraded coverage", "Low latency vs. richer features"],
    signals: [["model", "review", "risk", "serving", "feature", "impact"], ["training", "serving", "distribution", "schema", "monitor", "drift"], ["rollback", "pipeline", "feature", "threshold", "contain", "reproduce"], ["latency", "monitor", "release", "owner", "rollback", "validate"]],
  },
  "ai-engineer": {
    company: "CivicStack",
    companyTag: "Fictional public service platform · AI product team",
    managerName: "Piumi Rajapaksha",
    managerTitle: "AI Engineering Lead",
    mission: "Reduce unsupported answers in an internal policy assistant.",
    context: "A staff assistant answers questions from a collection of public-service guidance. Reviewers found confident responses that combine outdated pages with current procedures, so the team needs a safer retrieval and evaluation plan.",
    caseEvidence: "The prototype adds retrieved text to a prompt but does not track source dates. There is no test set for unanswerable questions, and the interface presents every answer with the same confidence.",
    decisionPrompt: "Propose a retrieval and response workflow that makes source freshness visible, handles missing evidence, and can be evaluated before wider release.",
    typicalWorkday: "Connect models to tools and trusted data, build evaluation sets, set boundaries for unsupported answers, and monitor real use.",
    deliverables: ["Retrieval and freshness policy", "Unanswerable-question behaviour", "Evaluation and monitoring plan"],
    collaborators: ["Domain specialist", "Product designer", "Security reviewer"],
    tradeoffs: ["Coverage vs. groundedness", "Helpful detail vs. unsupported claims", "Freshness checks vs. response latency"],
    signals: [["policy", "source", "freshness", "user", "requirement", "answer"], ["retrieval", "date", "evidence", "unanswerable", "evaluation", "source"], ["citation", "refuse", "retrieve", "test set", "grounded", "workflow"], ["monitor", "review", "source", "release", "quality", "feedback"]],
  },
  "ux-designer": {
    company: "ClassroomCloud",
    companyTag: "Fictional education service · Research and design",
    managerName: "Nethmi Abeysekara",
    managerTitle: "UX Research Lead",
    mission: "Understand why students abandon a fee-payment form before the final confirmation.",
    context: "A college payment service has reports of students leaving partway through a fee-payment flow. The team is considering a shorter form, but does not yet know which step causes confusion.",
    caseEvidence: "Support messages mention unclear fee categories and uncertainty about whether a payment succeeded. The current flow has no progress indication, and analytics events were not named consistently.",
    decisionPrompt: "Plan a small research and design response. Explain who you would speak with, what you would observe, and how you would test a change without assuming all students behave alike.",
    typicalWorkday: "Study user needs, map journeys, prototype interactions, test assumptions, and explain design decisions with evidence.",
    deliverables: ["Research questions", "Journey or flow finding", "Testable prototype recommendation"],
    collaborators: ["Students", "Product manager", "Frontend engineer"],
    tradeoffs: ["Research speed vs. representative voices", "Shorter form vs. clear information", "Fewer steps vs. user confidence"],
    signals: [["student", "payment", "question", "journey", "assumption", "user"], ["support", "observe", "interview", "analytics", "step", "evidence"], ["prototype", "test", "flow", "fee", "accessibility", "confidence"], ["finding", "test", "participant", "decision", "limitation", "measure"]],
  },
  "product-designer": {
    company: "RouteMate",
    companyTag: "Fictional travel app · Product design",
    managerName: "Ayesha Mendis",
    managerTitle: "Design Lead",
    mission: "Make a changeable travel itinerary easier to scan and update on a phone.",
    context: "Travellers can add, move, and cancel stops in a day plan. The current screen treats every stop equally, and people miss changes when transport times shift.",
    caseEvidence: "Support feedback asks for clearer time and location context. The current prototype uses colour alone to show a changed stop, which is difficult to distinguish in bright light and for some colour-vision users.",
    decisionPrompt: "Describe a design direction that improves scanability and communicates changed plans with more than colour. Name the states you would prototype and how you would test them.",
    typicalWorkday: "Move from user evidence to interaction models and visual systems, align with engineering, and refine designs through critique and testing.",
    deliverables: ["Itinerary hierarchy", "Change and cancellation states", "Accessible interactive prototype"],
    collaborators: ["Travellers", "Product manager", "Mobile engineer"],
    tradeoffs: ["More context vs. screen space", "Visual emphasis vs. calm scanning", "Personalisation vs. consistency"],
    signals: [["traveller", "itinerary", "time", "priority", "user", "requirement"], ["feedback", "colour", "change", "state", "accessibility", "prototype"], ["hierarchy", "contrast", "label", "interaction", "state", "test"], ["prototype", "engineer", "accessibility", "feedback", "measure", "handoff"]],
  },
  "qa-engineer": {
    company: "KitePay",
    companyTag: "Fictional payments service · Quality engineering",
    managerName: "Chathura de Alwis",
    managerTitle: "Quality Engineering Lead",
    mission: "Find and prevent duplicate purchases when checkout is retried after a network timeout.",
    context: "A checkout update is ready for release, but a user can lose connection just after confirming a purchase. The client retries, and the team needs confidence that the customer and order history remain correct.",
    caseEvidence: "The happy path passes on a fast network. Existing tests do not simulate timeouts after server acceptance, repeated taps, or the same request arriving twice.",
    decisionPrompt: "Build a risk-based test plan. Include the failure timing you would reproduce, the expected order and payment state, and what should block release.",
    typicalWorkday: "Explore product behaviour, create risk-based tests, automate repeatable checks, and report failures with enough detail to reproduce them.",
    deliverables: ["Failure-mode matrix", "Automated retry regression", "Release recommendation"],
    collaborators: ["Frontend engineer", "Backend engineer", "Product owner"],
    tradeoffs: ["Test breadth vs. release time", "Automation effort vs. repeatability", "False alarms vs. missed regressions"],
    signals: [["checkout", "purchase", "risk", "user", "requirement", "release"], ["timeout", "retry", "network", "tap", "reproduce", "state"], ["idempotent", "test", "failure", "payment", "order", "assert"], ["blocker", "release", "severity", "reproduce", "regression", "evidence"]],
  },
  "software-architect": {
    company: "HarborLearn",
    companyTag: "Fictional learning platform · Architecture group",
    managerName: "Dilan Fernando",
    managerTitle: "Principal Engineer",
    mission: "Choose a safe boundary for separating course enrolment from a tightly coupled application.",
    context: "A learning platform's enrolment code shares database tables and release schedules with unrelated course pages. A new partner integration is increasing change risk, and leadership is asking whether the team should split a service.",
    caseEvidence: "The current application has one deployment, shared ownership, and limited integration tests around enrolment. The partner contract is still changing, and the team has no dedicated operations rotation for a new service.",
    decisionPrompt: "Recommend an architectural next step and a migration boundary. Explain what evidence you would gather, which risks matter, and how you would avoid an unnecessary distributed-systems rewrite.",
    typicalWorkday: "Clarify cross-team constraints, compare system boundaries and failure modes, document decisions, and guide incremental technical change.",
    deliverables: ["Decision record", "Boundary and dependency map", "Incremental migration plan"],
    collaborators: ["Service owners", "Security engineer", "Platform team"],
    tradeoffs: ["Team autonomy vs. operational overhead", "Service isolation vs. network failure", "Migration speed vs. reversibility"],
    signals: [["enrolment", "boundary", "partner", "ownership", "requirement", "risk"], ["dependency", "integration", "deployment", "failure", "test", "evidence"], ["migration", "modular", "service", "reversible", "contract", "incremental"], ["decision", "owner", "risk", "rollback", "operational", "review"]],
  },
  "cybersecurity-engineer": {
    company: "CivicStack",
    companyTag: "Fictional public service platform · Security operations",
    managerName: "Dinuka Perera",
    managerTitle: "Security Engineering Lead",
    mission: "Respond to a staging log that appears to contain an active access token.",
    context: "A developer notices a credential-like value in a shared staging log. The team must protect access, preserve useful evidence, and avoid turning an uncertain signal into an unsupported claim about a breach.",
    caseEvidence: "The log is accessible to the engineering group and was generated by a recent test. It is not yet known whether the value is valid, how long it was exposed, or whether it was used.",
    decisionPrompt: "Describe the first response steps in order. Explain how you would contain the credential, preserve evidence, assess scope, and communicate uncertainty to the incident owner.",
    typicalWorkday: "Review threats and controls, investigate security signals, work with engineers on remediation, and document decisions and residual risk.",
    deliverables: ["Credential containment", "Evidence-preserving investigation plan", "Scope and notification decision"],
    collaborators: ["Service owner", "Incident coordinator", "Identity administrator"],
    tradeoffs: ["Fast revocation vs. service interruption", "Evidence preservation vs. exposure duration", "Transparency vs. unverified conclusions"],
    signals: [["token", "credential", "scope", "owner", "exposure", "incident"], ["log", "valid", "access", "evidence", "timeline", "use"], ["revoke", "rotate", "contain", "preserve", "access", "investigate"], ["notify", "scope", "uncertainty", "incident", "monitor", "document"]],
  },
  "technical-writer": {
    company: "Northstar Tickets",
    companyTag: "Fictional ticketing service · Developer experience",
    managerName: "Kavisha Rodrigo",
    managerTitle: "Documentation Lead",
    mission: "Rewrite a setup guide that leaves new developers unable to run the service.",
    context: "New team members follow the repository setup page but get stuck before the first local health check. Engineers answer the same setup questions repeatedly, and the guide does not say which environment values are secrets.",
    caseEvidence: "The guide lists commands without expected output. It assumes a database is already running, uses one outdated variable name, and gives no recovery path for a failed migration.",
    decisionPrompt: "Outline the revised guide structure and the first verification step. Explain how you would confirm the instructions with a new developer and protect secret values.",
    typicalWorkday: "Interview subject-matter experts, test instructions, structure information around user tasks, and keep documentation aligned with product changes.",
    deliverables: ["Task-based setup guide", "Verified command examples", "Troubleshooting and secret-handling notes"],
    collaborators: ["New developer", "Service maintainer", "Security reviewer"],
    tradeoffs: ["Completeness vs. scanability", "Exact examples vs. environment differences", "Document detail vs. maintenance cost"],
    signals: [["developer", "setup", "task", "secret", "requirement", "health check"], ["command", "output", "migration", "variable", "verify", "troubleshoot"], ["structure", "example", "environment", "secret", "recovery", "test"], ["new developer", "review", "maintainer", "update", "feedback", "verify"]],
  },
  "game-developer": {
    company: "Fern Arcade",
    companyTag: "Fictional indie studio · Gameplay engineering",
    managerName: "Akila Jayawardena",
    managerTitle: "Gameplay Lead",
    mission: "Diagnose frame drops in a crowded level before the next playtest.",
    context: "A co-op game runs smoothly in an empty scene but stutters when many characters and effects appear together. The next playtest includes players on modest laptops, so the team needs a fix grounded in profiling.",
    caseEvidence: "The frame-time spike appears during a large group encounter. Several effects spawn at once, character updates run each frame, and the current capture contains no breakdown by CPU, GPU, or device.",
    decisionPrompt: "Explain how you would profile the scene, select one optimisation to test, and preserve gameplay readability while checking performance on the target devices.",
    typicalWorkday: "Implement and tune gameplay systems, profile across target hardware, review player feedback, and collaborate with art and design.",
    deliverables: ["Reproducible performance capture", "Scoped optimisation", "Playtest verification"],
    collaborators: ["Game designer", "Technical artist", "QA tester"],
    tradeoffs: ["Visual effects vs. frame stability", "Code complexity vs. measured gain", "High-end device polish vs. broad access"],
    signals: [["level", "player", "device", "playtest", "performance", "requirement"], ["profile", "frame time", "cpu", "gpu", "capture", "reproduce"], ["pool", "batch", "optimise", "effect", "gameplay", "measure"], ["device", "playtest", "readability", "frame", "regression", "verify"]],
  },
  "blockchain-developer": {
    company: "OpenHarbor",
    companyTag: "Fictional open-source marketplace · Smart contract team",
    managerName: "Ruwani Dias",
    managerTitle: "Protocol Engineer",
    mission: "Review an escrow refund path that can get stuck when a delivery deadline passes.",
    context: "A marketplace escrow contract releases funds after a delivery confirmation. A timeout path exists, but the team is unsure whether both the buyer and seller can trigger conflicting transitions.",
    caseEvidence: "The contract has separate confirm and refund functions. Tests cover each function alone, but not repeated calls, boundary timestamps, or a malicious caller attempting a state transition out of order.",
    decisionPrompt: "Map the contract states and propose the smallest safe change. Explain the invariants you would test and why deployment requires independent review.",
    typicalWorkday: "Specify contract states and invariants, implement and test on a local chain, review attack surfaces, and coordinate audited releases.",
    deliverables: ["State-transition model", "Invariant and adversarial tests", "Reviewed deployment plan"],
    collaborators: ["Protocol reviewer", "Marketplace product team", "Security auditor"],
    tradeoffs: ["Permissionless actions vs. abuse resistance", "Immutable deployment vs. upgrade flexibility", "Gas cost vs. defensive checks"],
    signals: [["escrow", "refund", "state", "caller", "deadline", "requirement"], ["transition", "timestamp", "repeated", "test", "invariant", "attack"], ["state machine", "invariant", "authorization", "atomic", "contract", "review"], ["audit", "deploy", "test", "rollback", "risk", "monitor"]],
  },
  "business-analyst": {
    company: "CivicStack",
    companyTag: "Fictional public service platform · Service operations",
    managerName: "Shenal Abeywickrama",
    managerTitle: "Operations Manager",
    mission: "Find where a permit-review process waits longest and recommend a practical first change.",
    context: "A public-service team receives complaints that permit applications take too long. Staff believe missing documents are the main cause, but managers want a process map before adding more reviewers.",
    caseEvidence: "Applications pass through intake, document review, and approval. Rework reasons are recorded inconsistently, and there is no shared definition for when a case is considered waiting versus actively reviewed.",
    decisionPrompt: "Identify the process evidence you would collect, how you would define the bottleneck, and one low-risk change to test with staff before recommending a larger redesign.",
    typicalWorkday: "Interview process owners, map handoffs and exceptions, analyse operational data, and translate findings into agreed requirements.",
    deliverables: ["Current-state process map", "Defined measures and assumptions", "Small pilot recommendation"],
    collaborators: ["Frontline staff", "Service owner", "Data analyst"],
    tradeoffs: ["Standard process vs. valid exceptions", "More measurement vs. staff workload", "Quick fix vs. durable policy change"],
    signals: [["application", "process", "staff", "requirement", "handoff", "exception"], ["waiting", "rework", "measure", "definition", "data", "interview"], ["bottleneck", "pilot", "process map", "low risk", "owner", "baseline"], ["assumption", "staff", "measure", "decision", "rollout", "feedback"]],
  },
  "seo-specialist": {
    company: "HarborLearn",
    companyTag: "Fictional learning platform · Organic growth",
    managerName: "Thilini Senaratne",
    managerTitle: "Search Lead",
    mission: "Investigate a drop in organic visits to a useful subject guide after a site update.",
    context: "A learning platform's guide still appears in search, but fewer visitors reach it after a navigation and metadata update. The team wants to understand the change before rewriting the article.",
    caseEvidence: "Search impressions are similar to the prior period, clicks have fallen, and a canonical tag was changed during the update. Mobile snippets truncate the new title, and no controlled comparison has been made.",
    decisionPrompt: "Prioritise the technical and content checks you would run. Explain how you would separate ranking, click-through, and tracking changes before recommending an edit.",
    typicalWorkday: "Audit discoverability, review search and site data, coordinate technical fixes, and improve content around user intent without promising rankings.",
    deliverables: ["Search diagnostics", "Technical/content issue list", "Measured optimisation test"],
    collaborators: ["Content editor", "Frontend engineer", "Analytics specialist"],
    tradeoffs: ["Click appeal vs. accurate titles", "Content change vs. technical correction", "Short-term traffic vs. durable relevance"],
    signals: [["guide", "search", "visitor", "intent", "update", "question"], ["impressions", "clicks", "canonical", "title", "tracking", "mobile"], ["technical", "content", "snippet", "test", "baseline", "intent"], ["measure", "ranking", "click through", "tracking", "editor", "verify"]],
  },
  "software-engineer": {
    company: "Northstar Tickets",
    companyTag: "Fictional ticketing service · Application engineering",
    managerName: "Gayan Perera",
    managerTitle: "Senior Software Engineer",
    mission: "Design a large event export that does not time out or exhaust application memory.",
    context: "Organisers need to download attendee records before an event. Small exports work, but larger events exceed the current request timeout and place unnecessary load on the web application.",
    caseEvidence: "The endpoint loads every attendee row into memory, builds one CSV string, and returns it in a single response. There is no export-size limit, background-job state, or audit record for who requested a file.",
    decisionPrompt: "Propose a design that handles large exports safely. Cover resource limits, access checks, the user-visible completion state, and how you would test the largest supported case.",
    typicalWorkday: "Turn requirements into maintainable software, review designs and code, test failure modes, and support the behaviour after release.",
    deliverables: ["Bounded export design", "Access and expiry rules", "Load and failure tests"],
    collaborators: ["Product manager", "Platform engineer", "Security reviewer"],
    tradeoffs: ["Immediate download vs. background processing", "Convenience vs. private file handling", "Maximum size vs. service stability"],
    signals: [["export", "attendee", "access", "requirement", "size", "user"], ["memory", "timeout", "limit", "audit", "request", "failure"], ["stream", "background", "queue", "expiry", "authorization", "resource"], ["load test", "access", "expiry", "monitor", "failure", "release"]],
  },
};

function makeCareerScenario(career: Career, workCase: CareerWorkCase): Scenario {
  const stageIds = ["scope", "evidence", "decision", "handoff"];
  const stages = [
    {
      id: stageIds[0],
      title: "Clarify the brief",
      prompt: `What would you clarify with the team before starting this work? Define the user or system affected and one result that would show the change helped.`,
      hint: "Clarify the affected user, constraints, and what success means before proposing a fix.",
    },
    {
      id: stageIds[1],
      title: "Review the evidence",
      prompt: `The case notes say: ${workCase.caseEvidence} Which evidence would you inspect first, what else would you verify, and what should remain an assumption for now?`,
      hint: "Use the case evidence. Separate what is known from what still needs checking.",
    },
    {
      id: stageIds[2],
      title: "Make a professional choice",
      prompt: `${workCase.decisionPrompt} The team must account for these trade-offs: ${workCase.tradeoffs.join("; ")}.`,
      hint: "Choose a feasible action, explain its trade-off, and name a way to test it.",
    },
    {
      id: stageIds[3],
      title: "Hand off a plan",
      prompt: `Give ${workCase.managerName} a concise handoff: your recommendation, the first deliverable, the main risk, and how the team should verify the result.`,
      hint: "Make the next action clear. Include an owner, a check, and a risk or limitation.",
    },
  ];

  return {
    slug: `${career.slug}-work-simulation`,
    careerSlug: career.slug,
    company: workCase.company,
    companyTag: workCase.companyTag,
    role: career.title,
    managerName: workCase.managerName,
    managerTitle: workCase.managerTitle,
    mission: workCase.mission,
    context: workCase.context,
    turnLimit: stages.length,
    skills: career.skills.map((name, index) => ({
      id: `${career.slug}-skill-${index + 1}`,
      name,
      criterionId: stageIds[index],
    })),
    rubric: stages.map((stage, index) => ({
      id: stage.id,
      label: career.skills[index] ?? stage.title,
      maxScore: 5,
      taskIds: [stage.id],
      anchors: [
        `0–1: The response does not yet show ${career.skills[index]?.toLowerCase() ?? stage.title.toLowerCase()} in this work context.`,
        `2–3: The response shows a useful start, but leaves important evidence, constraints, or next steps unclear.`,
        `4–5: The response applies ${career.skills[index]?.toLowerCase() ?? stage.title.toLowerCase()} to the case and gives the team a clear way to act or verify.`,
      ],
    })),
    tasks: stages.map((stage, index) => ({
      id: stage.id,
      index,
      title: stage.title,
      brief: `${index === 0 ? `Hi, welcome to ${workCase.company}. ${workCase.mission} ` : ""}${stage.prompt}`,
      hint: stage.hint,
      signals: workCase.signals[index],
    })),
    typicalWorkday: workCase.typicalWorkday,
    deliverables: workCase.deliverables,
    collaborators: workCase.collaborators,
    tradeoffs: workCase.tradeoffs,
  };
}

const CAREER_SCENARIOS = CAREERS.flatMap((career) => {
  const workCase = CAREER_WORK_CASES[career.slug];
  return workCase ? [makeCareerScenario(career, workCase)] : [];
});

export const SCENARIOS: Record<string, Scenario> = {
  [PM_SCENARIO.slug]: PM_SCENARIO,
  ...Object.fromEntries(CAREER_SCENARIOS.map((scenario) => [scenario.slug, scenario])),
};

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS[slug];
}

export function getScenarioForCareer(careerSlug: string): Scenario | undefined {
  return Object.values(SCENARIOS).find((s) => s.careerSlug === careerSlug);
}
