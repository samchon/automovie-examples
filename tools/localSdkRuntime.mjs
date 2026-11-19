import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";

const manifests = new Map();

// A production test runs against the local release built by the SDK checkout.
// Resolve normally first so nested dependencies retain their own package versions.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const result = nextResolve(specifier, context);
    if (!specifier.startsWith("@automovie/")) return result;

    const [, name, ...subpath] = specifier.split("/");
    const root = new URL(`../../packages/${name}/`, import.meta.url);
    if (!result.url.startsWith(root.href)) return result;

    let manifest = manifests.get(name);
    if (manifest === undefined) {
      manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
      manifests.set(name, manifest);
    }
    const entry = subpath.length ? `./${subpath.join("/")}` : ".";
    const source = manifest?.exports?.[entry];
    if (typeof source !== "string" || !source.startsWith("./")) return result;
    if (result.url !== new URL(source, root).href) return result;

    const published = manifest?.publishConfig?.exports?.[entry];
    let target = published;
    if (published && typeof published === "object" && !Array.isArray(published)) {
      const condition = Object.keys(published).find(
        (key) => key === "default" || context.conditions.includes(key),
      );
      target = condition === undefined ? undefined : published[condition];
    }
    if (typeof target !== "string" || !target.startsWith("./")) return result;
    const url = new URL(target, root).href;
    if (url === result.url || !url.startsWith(root.href)) return result;
    return { url, shortCircuit: true };
  },
});
