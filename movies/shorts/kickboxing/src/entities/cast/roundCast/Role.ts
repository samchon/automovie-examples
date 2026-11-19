/**
 * Identifies a commissioned performer within this production. Cast, blocking and ringside props use the same keys.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The role key identifies an individual within the production and is shared by the cast and staging.
 * @evidence contracts/development/design.md#principled-representation The closed union admits only the ten signed roles and makes the cast and pose tables exhaustive.
 * @evidence contracts/development/design.md#minimal-and-owned-surface This production owns the role keys used by its pose table, cast and prop placements.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The union admits the full commissioned cast and carries no test-only or nullable placeholder.
 * @evidence contracts/development/entities.md#settings-realization Its ten keys identify the ten subjects in docs/body/brief/cast and connect each to a scene placement. The entity table and performance tracks carry their visible traits.
 * @evidence contracts/development/entities.md#object-shape This type identifies a subject. It owns neither actor objects nor timing.
 * @evidence contracts/development/entities.md#controls-and-source The same fixed key addresses the brief-backed casting row, all sampled pose controls and the displayed figure's scene name.
 */
export type Role = 'owen' | 'marek' | 'daniel' | 'pavel' | 'ivo' | 'jo' | 'ed' | 'maya' | 'ruth' | 'alan';
