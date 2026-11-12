import { createEvidenceConfig } from "@automovie/evidence";
import { resolve } from "node:path";

/**
 * The short route's research studies and brief construction are checked; the
 * screenplay stages stay disabled until its complete draft exists.
 *
 * `skills` names the shared `.agents/skills` tree whose bundled contracts the answers cite: this project's own, or its workspace root's.
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
