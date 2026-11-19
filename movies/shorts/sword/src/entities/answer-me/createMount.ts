import { createHorse, QuadrupedBody } from "@automovie/archetypes/animals";
import * as THREE from "three";
import { mountLeg } from "./mountLeg";
import { cord, joint, oval, skin, surface } from "./surfaces";

/** The three horses face +X from a grounded root. Their muzzles and bits travel with their heads. */
export function createMount(kind: "mare"|"grey"|"foal") {
  const foal = kind === "foal", grey = kind === "grey";
  const coat = grey ? 0x9e9b91 : foal ? 0xbc7848 : 0x985030;
  const mane = grey ? 0x353639 : foal ? 0xa46335 : 0x783b24;
  const leg = grey ? 0x514f51 : foal ? 0xc48a5e : 0x854429;
  const tack = grey ? 0x433024 : 0x694027;
  const root = new THREE.Group();
  root.name = kind;
  const size = grey ? 1.08 : foal ? 0.72 : 1;
  const figure = joint(root,"horse dimensions",0,0);
  figure.scale.set(size * (foal ? 0.84 : 1),size,size * (foal ? 0.8 : 1));
  const body = joint(figure,"back",0,0);
  const barrel = skin(body,"haunch, flank and shoulder",[
    [-1.02,1.22,0.075,0.085],[-0.94,1.25,0.205,0.21],[-0.77,1.25,0.315,0.303],
    [-0.57,1.24,0.325,0.315],[-0.32,1.218,0.298,0.288],[-0.03,1.21,0.32,0.31],
    [0.20,1.22,0.338,0.322],[0.41,1.27,0.304,0.277],[0.57,1.26,0.255,0.227],[0.68,1.23,0.14,0.125],
  ],coat,16);

  // A mottled coat follows the mesh itself, keeping markings under the saddle and lighting.
  if (grey) {
    const face = barrel.geometry.toNonIndexed();
    barrel.geometry.dispose();
    barrel.geometry = face;
    const pos = face.getAttribute("position");
    const colours = new Float32Array(pos.count * 3);
    for (let i = 0; i<pos.count;i+=3) {
      const index = Math.abs(Math.sin(i * 2.3751) * Math.cos(i * 0.282));
      const shade = new THREE.Color(index < 0.15 ? 0xbebbb0 : index > 0.64 ? 0x898981 : 0xa4a197);
      for(let j=0;j<3;j++) shade.toArray(colours,(i+j)*3);
    }
    face.setAttribute("color",new THREE.BufferAttribute(colours,3));
    const material = barrel.material as THREE.MeshStandardMaterial;
    material.color.setHex(0xffffff);
    material.vertexColors = true;
  }

  const neck = joint(body,"neck lowering from the withers",0.40,1.36);
  skin(neck,"rising neck",[
    [-0.13,0.09,0.13,0.13],[0.02,0.07,0.248,0.202],[0.17,0.18,0.254,0.17],
    [0.33,0.36,0.239,0.145],[0.48,0.51,0.192,0.114],[0.62,0.565,0.137,0.094],[0.71,0.565,0.08,0.069],
  ],coat);
  skin(neck,"crest mane",[
    [-0.12,0.235,0.04,0.055],[0.02,0.29,0.07,0.096],[0.18,0.409,0.093,0.088],
    [0.34,0.558,0.089,0.079],[0.5,0.666,0.074,0.069],[0.63,0.688,0.063,0.045],
  ],mane,9);
  const head = joint(neck,"poll",0.62,0.58);
  head.rotation.z = -0.69;
  skin(head,"cheek, bridge and muzzle",[
    [-0.11,-0.01,0.08,0.063],[-0.047,-0.015,0.159,0.116],[0.067,-0.02,0.188,0.142],
    [0.185,-0.022,0.144,0.126],[0.324,0.006,0.099,0.097],[0.447,0.005,0.092,0.09],[0.513,0.007,0.057,0.073],
  ],coat);
  oval(head,"soft muzzle",0.456,-0.015,0,0.078,0.089,0.092,grey ? 0x635e59 : foal ? 0x996347 : 0x79503c);
  const ears: THREE.Group[] = [];
  for (const sign of [-1,1]) {
    const ear = joint(head, "ear", -0.045,0.113, sign * 0.075);
    ear.rotation.set(sign*0.24,0,0.46,"YXZ");
    ears.push(ear);
    const pinna = surface(ear,"pointed pinna",new THREE.ConeGeometry(0.073,foal ? 0.24 : 0.194,7),coat);
    pinna.position.y = 0.082;
    pinna.scale.x = 0.6;
    oval(ear,"inner ear",0.029,0.077,0,0.012,0.057,0.028,mane);
    oval(head,"dark eyelid",0.094,0.067,sign * 0.122,0.036,0.032,0.019,0x493831);
    oval(head,"eye",0.105,0.069,sign * 0.136,0.022,0.021,0.012,0x1e1b17);
    oval(head,"eye catchlight",0.11,0.076,sign * 0.146,0.005,0.006,0.003,0xe8ddbd);
    oval(head,"nostril",0.483,0.016,sign * 0.079,0.032,0.017,0.009,0x4d3e35);
  }
  const forelock = oval(head,"forelock",0.035,0.15,0,0.118,0.069,0.077,mane);
  const lowerLip = oval(head,"lower lip",0.458,-0.073,0,0.059,0.025,0.069,coat);
  const mouth = oval(head,"mouth crease",0.464,-0.057,0,0.056,0.006,0.075,0x53352b);
  forelock.rotation.z = -0.36;
  if (foal) {
    const star = oval(head,"white forehead star",0.164,0.131,0,0.059,0.022,0.051,0xf7e9c8);
    star.rotation.z = -0.25;
  } else if (!grey) {
    const blaze = oval(head,"narrow blaze",0.264,0.104,0,0.126,0.014,0.021,0xe2ca9f);
    blaze.rotation.z = -0.25;
  }
  const muzzle = joint(head,"nose contact",0.528,-0.017);
  const bit = joint(head,"near bit ring",0.39,-0.045,0.103);
  const tail = joint(body,"tail dock",-0.90,1.37);
  for (const sign of [-1,0,1]) {
    const lock = skin(tail,"tapered tail lock",[
      [-0.38,-0.78,0.024,0.013],[-0.32,-0.59,0.095,0.050],[-0.26,-0.38,0.116,0.086],
      [-0.19,-0.18,0.126,0.087],[-0.085,-0.025,0.09,0.077],[0.015,0,0.061,0.048],
    ],mane,8);
    lock.position.z = sign * 0.039;
    lock.rotation.z = sign * 0.055;
    if (foal) lock.scale.set(0.78,0.63,0.64);
  }
  const seatY = 1.589;
  const hangingReins: ((hand?: THREE.Object3D, guide?: THREE.Vector3, clearance?: number)=>void)[] = [];
  if (!foal) {
    oval(body,"woven saddle cloth",-0.08,1.48,0,0.395,0.104,0.305,grey ? 0x56606a : 0xa17246);
    oval(body,"brown leather saddle",-0.08,1.543,0,0.285,0.079,0.237,tack);
    oval(body,"cantle",-0.30,1.58,0,0.068,0.088,0.184,tack);
    oval(body,"pommel",0.15,1.58,0,0.051,0.082,0.138,tack);
    for (const side of [-1,1]) {
      oval(body,"saddle skirt",-0.075,1.40,side*0.247,0.253,0.207,0.055,tack);
      cord(body,"stirrup leather",[[-0.04,1.55,side*.20],[-0.07,1.32,side*.322],[-0.10,1.00,side*.33]],0.014,0x493526);
      cord(body,"stirrup iron",[[-0.10,1.02,side*.33],[-0.155,0.93,side*.34],[-0.036,0.93,side*.34],[-0.10,1.02,side*.33]],0.012,0x807566);
      cord(head,"cheek strap",[[-0.06,0.14,side*.089],[0.1,0.015,side*.143],[0.389,-0.046,side*.102]],0.012,tack);
      cord(head,"noseband",[[0.37,0.096,0],[0.38,0.07,side*.081],[0.39,-0.044,side*.102],[0.39,-0.075,0]],0.015,tack);
      const spans = Array.from({length:6},()=>surface(body,"rein",new THREE.CylinderGeometry(0.009,0.009,1,5),tack));
      const start = new THREE.Vector3(), end = new THREE.Vector3(), middle = new THREE.Vector3();
      const direction = new THREE.Vector3(), previous = new THREE.Vector3(), next = new THREE.Vector3();
      const guideLocal = new THREE.Vector3();
      const up = new THREE.Vector3(0,1,0);
      hangingReins.push((hand?: THREE.Object3D, guide?: THREE.Vector3, clearance = 0):void=>{
        start.set(0.39,-0.045,side*0.103);
        body.worldToLocal(head.localToWorld(start));
        if(hand) body.worldToLocal(hand.getWorldPosition(end));
        else end.set(0.03,seatY,side*0.195);
        middle.copy(start).lerp(end,0.54);
        middle.y -= hand ? (end.y < 1.08 ? 0.34 : 0.12) : 0.12;
        middle.z += side*0.098;
        if (guide) middle.lerp(body.worldToLocal(guideLocal.copy(guide)),clearance);
        previous.copy(start);
        for (let i=0;i<spans.length;i++) {
          const t=(i+1)/spans.length, u=1-t;
          next.copy(start).multiplyScalar(u*u).addScaledVector(middle,2*u*t).addScaledVector(end,t*t);
          const span=spans[i]!;
          span.position.copy(previous).lerp(next,0.5);
          direction.subVectors(next,previous);
          span.scale.y=direction.length();
          span.quaternion.setFromUnitVectors(up,direction.normalize());
          previous.copy(next);
        }
      });
    }
    cord(body,"saddle loop",[[0.02,1.45,0.29],[0.04,1.37,0.347],[0.12,1.36,0.338],[0.14,1.44,0.294]],0.014,tack);
  }

  const rest = createHorse.rig({withersHeight:1.58,girth:createHorse.PROFILE.girth(1.58)});
  const legs = QuadrupedBody.LIMBS.map(limb=>mountLeg(figure,limb,rest.limbs[limb],coat,leg,kind==="mare" && limb==="leftHind"));
  function setReinHands(left?: THREE.Object3D, right?: THREE.Object3D, guide?: THREE.Vector3, clearance?: number):void {
    hangingReins[0]?.(left,guide,clearance);
    hangingReins[1]?.(right,guide,clearance);
  }
  /** The call opens the lip while keeping the nose contact point on the head. */
  function call(amount: number): void {
    lowerLip.position.y = -0.073 - 0.044*amount;
    mouth.scale.y = 0.006 + 0.031*amount;
    mouth.position.y = -0.057 - 0.020*amount;
  }
  /** Both pinnae swivel toward the call, with the nearer ear leading slightly. */
  function setEarTurn(angle: number):void {
    const turn = THREE.MathUtils.clamp(angle,-1.5,1.5);
    for (let i=0;i<ears.length;i++) {
      const side = i === 0 ? -1 : 1;
      ears[i]!.rotation.y = turn * (Math.sign(turn) === -side ? 1 : 0.77);
      ears[i]!.rotation.x = side*0.24 + turn*0.24;
      ears[i]!.rotation.z = 0.46 - Math.abs(turn)*0.24;
    }
  }
  /** Turn the face toward a point of attention without pivoting the body. */
  function lookAcross(angle: number): void {
    neck.rotation.y = angle * 0.60;
    head.rotation.y = angle * 0.40;
  }
  function pose(time: number, gait: number, headLower: number): void {
    const g = THREE.MathUtils.clamp(gait,0,1);
    const breath = Math.sin(time*2.14 + (grey ? 1.5 : 0));
    const beat = Math.sin(time*8.37);
    const bob = -0.022*g*(1-beat);
    body.position.y = bob;
    neck.rotation.z = -0.78 * THREE.MathUtils.clamp(headLower,-0.28,1.15) + beat*g*0.049 + breath*0.009;
    tail.rotation.z = -0.28*g + 0.06*Math.cos(time*4.6)*g;
    tail.rotation.x = 0.067*Math.sin(time*2.3);
    for (const animate of legs) animate(time,g,bob);
    setEarTurn(0);
    lookAcross(0);
    call(0);
    setReinHands();
  }
  pose(0,0,0);
  return {root,pose,seatHeight:seatY*size,muzzle,bit,setReinHands,setEarTurn,lookAcross,call};
}
