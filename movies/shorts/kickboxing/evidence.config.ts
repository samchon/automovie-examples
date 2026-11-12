import { createEvidenceConfig } from "@automovie/evidence";

/** The default project checks source and tests without selecting a narrative, against the workspace root's skills. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
});
