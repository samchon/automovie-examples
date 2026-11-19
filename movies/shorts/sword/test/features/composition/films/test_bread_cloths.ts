import assert from "node:assert/strict";
import { Vector3 } from "three";
import { breadCloths } from "../../../../src/composition/films/bread-cloths";

/** Read the connected film scene across its five beats and seek back through the rescue. */
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
