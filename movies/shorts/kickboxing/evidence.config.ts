import { createEvidenceConfig } from "@automovie/evidence";

/** The short route's brief and screenplay construction and the research they draw on, with source and tests, against the workspace root's skills. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  narrative: {
    mode: "short",
    construction: { brief: "evidence", screenplay: "evidence" },
    naturalness: { screenplay: "evidence" },
  },
  research: "evidence",
});
