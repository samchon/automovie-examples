import { createEvidenceConfig } from "@automovie/evidence";

/** Selects the live engineering checklists and preserves the completed short-route narrative record. */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: "../../../.agents/skills",
  development: { entities: "evidence", composition: "evidence" },
  claims: [
    {
      name: "test support functions",
      type: "typescript",
      files: ["test/helpers/**/*.ts"],
      symbol: "function",
      reference: {
        type: "markdown",
        root: "../../../.agents/skills",
        files: [
          "contracts/development/common.md",
          "contracts/development/implementation.md",
        ],
        symbol: "h2",
        checklist: true,
      },
    },
  ],
  narrative: {
    mode: "short",
    construction: { brief: "disabled", screenplay: "disabled" },
  },
});
