import { describe, expect, it } from "vitest";
import { CAREERS, getScenarioForCareer } from "@/lib/scenarios";
import { generateEvaluation } from "@/lib/mockAI";
import type { Session } from "@/lib/types";

describe("career simulations", () => {
  it("provides a complete playable scenario and work profile for every listed career", () => {
    expect(CAREERS.length).toBeGreaterThan(1);

    for (const career of CAREERS) {
      const scenario = getScenarioForCareer(career.slug);
      expect(career.available, career.title).toBe(true);
      expect(scenario, career.title).toBeDefined();
      expect(scenario?.tasks.length, career.title).toBeGreaterThanOrEqual(4);
      expect(scenario?.rubric.length, career.title).toBeGreaterThan(0);
      expect(scenario?.typicalWorkday, career.title).toBeTruthy();
      expect(scenario?.deliverables?.length, career.title).toBeGreaterThan(0);
      expect(scenario?.collaborators?.length, career.title).toBeGreaterThan(0);
      expect(scenario?.tradeoffs?.length, career.title).toBeGreaterThan(0);
    }
  });

  it("creates role-specific evidence reports without Product Manager-only advice", () => {
    for (const career of CAREERS) {
      const scenario = getScenarioForCareer(career.slug)!;
      const session: Session = {
        id: `test-${career.slug}`,
        careerSlug: career.slug,
        scenarioSlug: scenario.slug,
        status: "completed",
        currentTaskIndex: scenario.tasks.length - 1,
        startedAt: 0,
        turns: scenario.tasks.map((task, index) => ({
          id: `${task.id}-answer`,
          index,
          speaker: "student",
          taskId: task.id,
          content: `I would inspect ${task.signals.slice(0, 3).join(" ")} and verify the result with the team.`,
          at: index,
        })),
      };

      const report = generateEvaluation(scenario, session, career.title);
      expect(report.careerTitle).toBe(career.title);
      expect(report.scenarioSlug).toBe(scenario.slug);
      expect(report.criteria).toHaveLength(scenario.rubric.length);
      expect(report.observedSkills).toHaveLength(scenario.skills.length);
      expect(report.nextSteps.length).toBeGreaterThan(0);
      expect(report.summary).toContain(career.title);
      expect(report.nextSteps.join(" ")).not.toContain("Data Analyst simulation");
    }
  });
});
