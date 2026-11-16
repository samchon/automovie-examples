import { createEvidenceConfig } from "@automovie/evidence";

/** The short's story construction stages close when the completed review reaches its author. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  narrative: {
    mode: "short",
    construction: { brief: "disabled", screenplay: "disabled" },
  },
});
