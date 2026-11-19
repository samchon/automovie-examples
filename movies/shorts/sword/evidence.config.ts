import { createEvidenceConfig } from "@automovie/evidence";

/** Selects the collection's entity and composition evidence with manuscript construction closed. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  development: { entities: "evidence", composition: "evidence" },
  narrative: {
    mode: "short",
    construction: { brief: "disabled", screenplay: "disabled" },
  },
});
