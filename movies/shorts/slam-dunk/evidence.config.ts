import { createEvidenceConfig } from "@automovie/evidence";

export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  narrative: {
    mode: "short",
    construction: { brief: "disabled", screenplay: "disabled" },
  },
});
