import { createEvidenceConfig } from "@automovie/evidence";

/** Selects the short collection for the current stage of manuscript construction. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  narrative: {
    mode: "short",
    construction: { brief: "disabled", screenplay: "disabled" },
  },
});
