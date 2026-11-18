import * as THREE from "three";

/**
 * Broad overhead arena illumination for the coarse performance.
 *
 * The ceiling key and low hemisphere fill separate the bodies from the dark
 * arena without introducing another visible event. Intensities are artistic
 * exposure choices for this production, not measurements of a real arena.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the two motivated lights, their coarse inspection purpose and the artistic rather than measured intensities.
 * @evidence contracts/development/design.md#principled-representation One readonly set width determines the overhead key's placement; each mount owns separate Three light objects.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Exposes only a drawing factory for the commissioned overhead light.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No body geometry, action, hidden animation or per-frame lighting change.
 * @evidence contracts/development/entities.md#settings-realization Realizes the clean overhead arena light of docs/body/screenplay/kickboxing/010-the-round.md#p01; no light changes are added.
 * @evidence contracts/development/entities.md#object-shape Readonly construction inputs describe the light, while the caller explicitly owns its mounted projection.
 * @evidence contracts/development/entities.md#controls-and-source One definition serves catalog and film; it uses Three lights without external assets.
 */
export class ArenaLighting {
  /** Keep the key above the set whose canvas it illuminates. */
  public constructor(private readonly ringWidth: number) {}

  /**
   * Create the fixed key and fill without a playback clock.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Returns an owned light group and its cleanup, with no animated state.
   * @evidence contracts/development/implementation.md#principled-implementation Places a white directional key above the canvas and a hemisphere fill; both remain fixed throughout a mount.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Two light objects in one group.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Contains no motion, exposure automation or generated asset.
   * @evidence contracts/development/implementation.md#efficient-algorithms Constant construction and no per-frame work.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work One mounted group illuminates every frame.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller removes the group; these unshadowed lights allocate no owned shadow texture.
   * @evidence contracts/development/entities.md#settings-realization Displays the overhead light and dark surrounds decided in docs/body/screenplay/kickboxing/010-the-round.md#p01.
   * @evidence contracts/development/entities.md#object-shape The returned view objects have an explicit owner; creating them changes no light definition or performer.
   * @evidence contracts/development/entities.md#controls-and-source Reuses the same coarse key/fill for every catalog and film mount.
   */
  public drawing(): { object: THREE.Group; dispose: () => void } {
    const object: THREE.Group = new THREE.Group();
    object.name = "light/arena";
    const fill: THREE.HemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0x171d27,
      1.6,
    );
    const key: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(this.ringWidth / 4, this.ringWidth, this.ringWidth / 4);
    object.add(fill, key, key.target);
    return {
      object,
      dispose: (): void => {
        object.removeFromParent();
        object.clear();
      },
    };
  }
}
