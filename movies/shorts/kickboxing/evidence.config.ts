import { createEvidenceConfig } from "@automovie/evidence";
import { resolve } from "node:path";

/**
 * The short route's research and narrative stages over the default source and test checks.
 *
 * `skills` names the shared `.agents/skills` tree whose bundled contracts the answers cite: this project's own, or its workspace root's. Each narrative stage is enabled only when its complete draft is ready.
 */
export default createEvidenceConfig({
  location: import.meta.dirname,
  skills: resolve(import.meta.dirname, "../../../.agents/skills"),
  research: "evidence",
  narrative: {
    mode: "short",
    construction: { brief: "evidence" },
  },
});
