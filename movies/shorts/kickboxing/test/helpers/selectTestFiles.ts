/**
 * Select discovered test basenames with the repository runner's substring options.
 * Repeated --include and --exclude groups accept space-separated terms or one
 * equals-form term. Every term must match a discovered test. Include terms
 * select their union and exclude terms remove matches. Invalid or empty selections throw.
 * This pure step receives filenames and imports no test module.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Describes the argument forms, discovery inputs, matching policy and failure cases.
 * @evidence contracts/development/implementation.md#principled-implementation Parses include and exclude groups, checks each term against the discovered names, then filters those names by the requested inclusion and exclusion rules.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Option grammar, matched-term validation and selection are distinct steps. The harness owns discovery and execution.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Uses caller-supplied basenames and literal substring terms. Unknown or empty requests fail instead of selecting a hidden default.
 * @evidence contracts/development/implementation.md#efficient-algorithms Argument parsing is linear in argv. Term validation and selection visit names against the configured terms, with substring search cost depending on their lengths.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All validation and filtering within one call use the provided discovery list. The function stores no cross-run selection.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The temporary term groups live for one call. Only the selected name set is returned; no module or executor is opened.
 */
export function selectTestFiles(
  argv: readonly string[],
  names: readonly string[],
): Set<string> {
  const selection: { include: string[]; exclude: string[] } = {
    include: [],
    exclude: [],
  };
  let group: "include" | "exclude" | undefined;
  let count: number = 0;

  /** Refuse an option occurrence that collected no terms. */
  function finishGroup(): void {
    if (group !== undefined && count === 0)
      throw new Error(`--${group} requires at least one nonblank term.`);
  }

  /** Preserve each supplied substring after checking the option grammar. */
  function append(key: "include" | "exclude", value: string): void {
    if (value.trim().length === 0 || value.startsWith("-"))
      throw new Error(
        `--${key} requires a nonblank term, not ${JSON.stringify(value)}.`,
      );
    selection[key].push(value);
  }

  for (const argument of argv) {
    if (argument.startsWith("-")) {
      finishGroup();
      const option: RegExpExecArray | null =
        /^--(include|exclude)(?:=([\s\S]*))?$/u.exec(argument);
      if (option === null)
        throw new Error(`Unexpected argument ${JSON.stringify(argument)}.`);
      const key: "include" | "exclude" = option[1] as "include" | "exclude";
      if (option[2] !== undefined) {
        append(key, option[2]);
        group = undefined;
      } else {
        group = key;
        count = 0;
      }
    } else {
      if (group === undefined)
        throw new Error(`Unexpected argument ${JSON.stringify(argument)}.`);
      append(group, argument);
      ++count;
    }
  }
  finishGroup();

  for (const key of ["include", "exclude"] as const)
    for (const term of selection[key])
      if (!names.some((name: string): boolean => name.includes(term)))
        throw new Error(
          `--${key} term ${JSON.stringify(term)} matched no test.`,
        );

  const selected: Set<string> = new Set(
    names.filter(
      (name: string): boolean =>
        (selection.include.length === 0 ||
          selection.include.some((term: string): boolean =>
            name.includes(term),
          )) &&
        selection.exclude.every(
          (term: string): boolean => !name.includes(term),
        ),
    ),
  );
  if (selected.size === 0)
    throw new Error("The test selection matched nothing.");
  return selected;
}
