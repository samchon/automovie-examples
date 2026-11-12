import { createEvidenceConfig } from "@automovie/evidence";

/** The short route's brief construction and the research it draws on, with source and tests, against the workspace root's skills. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  narrative: {
    mode: "short",
    construction: { brief: "evidence" },
  },
  research: "evidence",
});
