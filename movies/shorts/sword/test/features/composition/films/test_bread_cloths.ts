import assert from "node:assert/strict";
import { Vector3 } from "three";
import { breadCloths } from "../../../../src/composition/films/bread-cloths";

/**
 * Verify the live Bread Cloths stage with authored times expressed in seconds.
 * Check the film format, cloths, shoe reseating, cap, seam, sack transfers,
 * bread portions and reverse seek. Release the stage after assertions.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment names the staged cases, film timebase and release obligation.
 * @evidence contracts/development/testing.md#execution-ownership The production's DynamicExecutor discovers the exported test_bread_cloths by its test_ prefix. The test constructs the public descriptor and scene in memory, seeks without a renderer, and disposes in finally. There are no child cases registered at runtime.
 * @evidence contracts/development/testing.md#behavioral-verification Check observable stage transforms and visibility for the separated and reseated shoe, fixed cap, opening tear, single then shared sack support, passing the cap and the final bread portions. A reverse seek checks that later poses cannot contaminate the earlier sack mark.
 * @evidence contracts/development/testing.md#independent-expectations The delivery profile supplies 1,440 frames and the 1280 by 720 raster. The screenplay supplies the open cloths, shoe staying at its mark until reseating, three loaves from the tear, handoff order and equal portions. The hand-set metre bounds distinguish near and far stage placement and allow numerical error for repeatability. They do not measure anatomy, timing fidelity at every frame or perceived contact.
 * @evidence contracts/development/testing.md#distinguishing-cases The test contrasts left shoe separated from the foot with reseated at the same ground mark, tear closed with tear open, support at Red Cap with the shared midpoint, and whole third loaf with two carried halves. It checks a reverse seek and leaves general input errors, adjacent-frame motion, and sound and rendered legibility outside its in-memory coverage.
 */
export async function test_bread_cloths():Promise<void> {
  const film=breadCloths();
  assert.equal(film.durationSeconds*film.fps,1440);
  assert.equal(film.width,1280);assert.equal(film.height,720);
  const stage=await film.create();
  const prop=(name:string)=>{
    const obj=stage.scene.getObjectByName(name);assert.ok(obj,name);return obj;
  };
  const pos=(name:string)=>prop(name).getWorldPosition(new Vector3());
  try {
    stage.seek(8);assert.ok(prop("Blue-edged cloth").visible);assert.ok(prop("Plain cloth").visible);
    stage.seek(20);const cap=pos("Brick-red cap");
    stage.seek(23.25);
    const looseShoe=pos("Loose left shoe");
    assert.ok(looseShoe.distanceTo(pos("Youngest's left foot"))>0.24);
    stage.seek(24.18);
    assert.ok(looseShoe.distanceTo(pos("Loose left shoe"))<1e-6);
    assert.ok(pos("Loose left shoe").distanceTo(pos("Youngest's left foot"))<0.06);
    stage.seek(30);assert.ok(cap.distanceTo(pos("Brick-red cap"))<1e-7);
    assert.ok(pos("Rye sack").y>pos("Red Cap").y+1.5);
    assert.equal(prop("Torn seam").visible,false);
    stage.seek(36.8);for(const i of [1,2,3])assert.ok(prop("Loaf "+i).visible);
    assert.equal(prop("Torn seam").visible,true);
    const before=pos("Rye sack");
    stage.seek(42.05);
    assert.ok(Math.abs(pos("Rye sack").x-pos("Red Cap").x)<0.32);
    assert.ok(Math.abs(pos("Rye sack").x-pos("Caller").x)>0.55);
    stage.seek(44);assert.ok(pos("Rye sack").y<before.y-0.60);
    stage.seek(45.75);
    const midpoint=(pos("Red Cap").x+pos("Caller").x)/2;
    assert.ok(Math.abs(pos("Rye sack").x-midpoint)<0.01);
    stage.seek(52);assert.ok(pos("Rye sack").x<cap.x);
    stage.seek(59.9);
    assert.ok(!prop("Loaf 3").visible);
    for(const [i,cloth] of [[1,"Blue-edged cloth"],[2,"Plain cloth"]] as const){
      const bundle=pos(cloth);
      assert.ok(pos("Loaf "+i).distanceTo(bundle)<0.29);
      assert.ok(pos("Half "+i).distanceTo(bundle)<0.30);
    }
    stage.seek(36.8);assert.ok(pos("Rye sack").distanceTo(before)<1e-8);
  }finally {stage.dispose();}
}
