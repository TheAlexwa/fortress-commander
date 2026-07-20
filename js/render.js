import { getSiegeCampCounts, getSiegeCampPositions } from "./siege.js";
import {
  FIXED_INNER_WALL_RADIUS,
  getFutureLayoutGeometry
} from "./map-layout.js";
import {
  MIDDLE_GATE_BUILD_WOOD,
  MIDDLE_GATE_COUNT,
  MIDDLE_WALL_SEGMENT_COUNT,
  OUTER_WALL_BUILD_WOOD,
  OUTER_WALL_SEGMENT_COUNT,
  OUTER_GATE_BUILD_WOOD,
  OUTER_GATE_COUNT
} from "./fortifications.js";

// Zentrale Canvas-Darstellung von Fortress Commander.
// Die Spielzustände bleiben in main.js; dieses Modul erhält nur die zum Zeichnen benötigten Referenzen.

let ctx;
let state;
let BUILD;
let wallSlots;
let insideSlots;
let castleSlots;
let selected;
let buildMode;
let rangeDisplayMode;
let unitCommandMode;
let paused;
let gameOver;
let zoom;
let vw;
let vh;
let camX;
let camY;
let WORLD_W;
let WORLD_H;
let CX;
let CY;
let WALL_R;
let TAU;

const UNIT_SPRITE_DEFS = {
  soldier: {
    idle: "assets/units/archer-idle.webp",
    walk: ["assets/units/archer-walk-1.webp", "assets/units/archer-walk-2.webp"],
    width: 40, height: 62, offsetY: -1
  },
  guard: {
    idle: "assets/units/guard-idle.webp",
    walk: ["assets/units/guard-walk-1.webp", "assets/units/guard-walk-2.webp"],
    width: 48, height: 62, offsetY: -1
  }
};

function loadUnitSprite(src){
 const image=new Image();
 image.decoding="async";
 image.src=src;
 return image;
}

const unitSprites = Object.fromEntries(
  Object.entries(UNIT_SPRITE_DEFS).map(([key, def]) => [key, {
    idle: loadUnitSprite(def.idle),
    walk: def.walk.map(loadUnitSprite),
    def
  }])
);
const unitMotionStates=new WeakMap();

export function renderGameFrame(environment) {
  ({
    ctx, state, BUILD, wallSlots, insideSlots, castleSlots, selected, buildMode, rangeDisplayMode, unitCommandMode, paused,
    gameOver, zoom, vw, vh, camX, camY, WORLD_W, WORLD_H, CX, CY, WALL_R, TAU
  } = environment);

  draw();
}

function drawGround(){
 const g=ctx.createRadialGradient(CX-160,CY-180,80,CX,CY,Math.max(WORLD_W,WORLD_H)*.72);
 g.addColorStop(0,"#728f4e");g.addColorStop(.46,"#4e713d");g.addColorStop(1,"#223d29");
 ctx.fillStyle=g;ctx.fillRect(0,0,WORLD_W,WORLD_H);
 ctx.save();
 for(let x=18;x<WORLD_W;x+=34)for(let y=16;y<WORLD_H;y+=32){
  const n=Math.sin(x*.087+y*.051),px=x+Math.sin(y*.11)*7,py=y+Math.cos(x*.073)*6;
  ctx.globalAlpha=.08+Math.abs(n)*.08;ctx.fillStyle=n>0?"#c6d47d":"#17351f";
  ctx.beginPath();ctx.ellipse(px,py,2.5+Math.abs(n)*2.4,1.1,Math.sin(x+y),0,TAU);ctx.fill();
 }
 // dunkler Waldrand
 const edge=170;
 const edgeGrad=ctx.createLinearGradient(0,0,edge,0);edgeGrad.addColorStop(0,"#102719");edgeGrad.addColorStop(1,"#10271900");
 ctx.globalAlpha=.85;ctx.fillStyle=edgeGrad;ctx.fillRect(0,0,edge,WORLD_H);
 ctx.save();ctx.translate(WORLD_W,0);ctx.scale(-1,1);ctx.fillStyle=edgeGrad;ctx.fillRect(0,0,edge,WORLD_H);ctx.restore();
 const vGrad=ctx.createLinearGradient(0,0,0,edge);vGrad.addColorStop(0,"#102719");vGrad.addColorStop(1,"#10271900");
 ctx.fillStyle=vGrad;ctx.fillRect(0,0,WORLD_W,edge);
 ctx.save();ctx.translate(0,WORLD_H);ctx.scale(1,-1);ctx.fillStyle=vGrad;ctx.fillRect(0,0,WORLD_W,edge);ctx.restore();
 ctx.restore();
}
function drawPaths(){
 ctx.save();ctx.lineCap="round";
 const routes=[
  {start:[CX,0],c1:[CX-55,CY-610],c2:[CX+55,CY-300]},
  {start:[WORLD_W,CY],c1:[CX+720,CY-60],c2:[CX+320,CY+52]},
  {start:[CX,WORLD_H],c1:[CX+70,CY+610],c2:[CX-45,CY+305]},
  {start:[0,CY],c1:[CX-720,CY+70],c2:[CX-320,CY-48]},
 ];
 for(const route of routes){
  const [sx,sy]=route.start,[c1x,c1y]=route.c1,[c2x,c2y]=route.c2;
  ctx.strokeStyle="#2b241a88";ctx.lineWidth=82;ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,CX,CY);ctx.stroke();
  const pg=ctx.createLinearGradient(sx,sy,CX,CY);pg.addColorStop(0,"#806e4e");pg.addColorStop(.5,"#b19a68");pg.addColorStop(1,"#8c7651");
  ctx.strokeStyle=pg;ctx.lineWidth=66;ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,CX,CY);ctx.stroke();
  ctx.strokeStyle="#d7c79a44";ctx.lineWidth=48;ctx.setLineDash([8,16]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,CX,CY);ctx.stroke();ctx.setLineDash([]);
 }
 // Dorfwege verbinden die organisch verteilten Bauplätze.
 for(const radius of [184,292]){
  ctx.strokeStyle="#2b241a66";ctx.lineWidth=38;ctx.beginPath();ctx.arc(CX,CY,radius,0,TAU);ctx.stroke();
  ctx.strokeStyle="#a99061";ctx.lineWidth=27;ctx.beginPath();ctx.arc(CX,CY,radius,0,TAU);ctx.stroke();
  ctx.strokeStyle="#d7c79a2d";ctx.lineWidth=18;ctx.setLineDash([7,13]);ctx.beginPath();ctx.arc(CX,CY,radius,0,TAU);ctx.stroke();ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawWorldDetails(){
 ctx.save();
 // Felsen und Blumen
 for(let i=0;i<125;i++){
  const x=(i*241+67)%WORLD_W,y=(i*173+101)%WORLD_H;
  if(Math.hypot(x-CX,y-CY)<WALL_R+285)continue;
  if(i%3===0){
   ctx.fillStyle="#3d493e";ctx.beginPath();ctx.ellipse(x+4,y+5,8+(i%5),4+(i%3),-.35,0,TAU);ctx.fill();
   ctx.fillStyle="#697366";ctx.beginPath();ctx.ellipse(x,y,6+(i%4),3+(i%2),-.35,0,TAU);ctx.fill();
   ctx.strokeStyle="#9ba39466";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-3,y-1);ctx.lineTo(x+3,y-2);ctx.stroke();
  }else{
   ctx.strokeStyle="#234e2d";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x-3,y-5);ctx.moveTo(x,y+5);ctx.lineTo(x+4,y-6);ctx.stroke();
   if(i%7===0){ctx.fillStyle=i%14===0?"#f5d66f":"#cc80bd";ctx.beginPath();ctx.arc(x+4,y-7,2.4,0,TAU);ctx.fill()}
  }
 }
 // dichter Nadelwald außerhalb der Burg
 for(let i=0;i<84;i++){
  const a=(i*2.399963)%TAU,r=WALL_R+305+((i*137)%360);
  const x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
  if(x<25||x>WORLD_W-25||y<25||y>WORLD_H-25)continue;
  const s=15+(i%6)*2;
  ctx.fillStyle="#111b16aa";ctx.beginPath();ctx.ellipse(x+6,y+10,s*.8,s*.35,0,0,TAU);ctx.fill();
  ctx.fillStyle="#3a281c";ctx.fillRect(x-3,y-2,6,s*.9);
  ctx.fillStyle="#183d27";ctx.beginPath();ctx.moveTo(x,y-s*1.5);ctx.lineTo(x-s,y+s*.45);ctx.lineTo(x+s,y+s*.45);ctx.closePath();ctx.fill();
  ctx.fillStyle="#28603a";ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x-s*.8,y+s*.2);ctx.lineTo(x+s*.8,y+s*.2);ctx.closePath();ctx.fill();
  ctx.fillStyle="#4f814a55";ctx.beginPath();ctx.moveTo(x-2,y-s*.82);ctx.lineTo(x-s*.45,y);ctx.lineTo(x+s*.15,y);ctx.closePath();ctx.fill();
 }
 // Banner entlang der Wege
 for(let i=0;i<8;i++){
  const a=i/8*TAU+TAU/16,r=WALL_R+82,x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
  ctx.strokeStyle="#4a3522";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(x,y-16);ctx.stroke();
  ctx.fillStyle="#1f4d7d";ctx.beginPath();ctx.moveTo(x,y-15);ctx.lineTo(x+12,y-11);ctx.lineTo(x,y-5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#e6c76a";ctx.font="bold 7px serif";ctx.fillText("♜",x+4,y-8);
 }
 ctx.restore();
}
function drawSiegeCamps(){
 const siege=state.siege;
 if(state.inWave||!siege?.active)return;
 const camps=getSiegeCampPositions({WORLD_W,WORLD_H});
 const counts=getSiegeCampCounts(siege);
 const now=performance.now();

 camps.forEach((camp,index)=>{
  const count=counts[index]||0;
  const tentCount=Math.min(3,1+Math.floor(count/5));
  ctx.save();ctx.translate(camp.x,camp.y);

  ctx.fillStyle="#17110baa";ctx.beginPath();ctx.ellipse(0,18,92,54,0,0,TAU);ctx.fill();
  ctx.strokeStyle=count?"#b54236aa":"#7b694f88";ctx.lineWidth=3;ctx.setLineDash([8,7]);ctx.beginPath();ctx.ellipse(0,18,98,60,0,0,TAU);ctx.stroke();ctx.setLineDash([]);

  // Zelte wachsen mit der Anzahl versammelter Gegner.
  for(let i=0;i<tentCount;i++){
   const ox=(i-1)*42+(tentCount===1?42:0),oy=i%2?18:-3;
   ctx.fillStyle=i===0?"#6e3d2d":"#78513a";
   ctx.beginPath();ctx.moveTo(ox-25,oy+25);ctx.lineTo(ox,oy-22);ctx.lineTo(ox+25,oy+25);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#c59b68";ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle="#241812";ctx.beginPath();ctx.moveTo(ox-6,oy+25);ctx.lineTo(ox,oy+4);ctx.lineTo(ox+6,oy+25);ctx.closePath();ctx.fill();
  }

  // Banner und Lagerfeuer.
  ctx.strokeStyle="#3b281d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-62,34);ctx.lineTo(-62,-42);ctx.stroke();
  ctx.fillStyle="#8f2f2b";ctx.beginPath();ctx.moveTo(-60,-40);ctx.lineTo(-22,-30);ctx.lineTo(-60,-16);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#d6b06a";ctx.lineWidth=1.5;ctx.stroke();

  const flame=3+Math.sin(now*.012+index)*2;
  ctx.fillStyle="#4a2c1d";ctx.beginPath();ctx.arc(0,46,15,0,TAU);ctx.fill();
  ctx.fillStyle="#e08a33";ctx.beginPath();ctx.moveTo(-8,48);ctx.quadraticCurveTo(-2,24-flame,2,42);ctx.quadraticCurveTo(8,26+flame,9,49);ctx.closePath();ctx.fill();
  ctx.fillStyle="#ffd06a";ctx.beginPath();ctx.moveTo(-3,47);ctx.quadraticCurveTo(1,34-flame,4,47);ctx.closePath();ctx.fill();

  // Kleine Silhouetten zeigen die wachsende Armee ohne aktive Gegnerobjekte.
  const visible=Math.min(8,count);
  for(let i=0;i<visible;i++){
   const a=(i/Math.max(1,visible))*TAU+index*.6;
   const rr=48+(i%2)*19;
   const x=Math.cos(a)*rr,y=Math.sin(a)*rr+20;
   ctx.fillStyle=i===0&&count>10?"#9b2f2b":"#373a39";
   ctx.beginPath();ctx.arc(x,y-7,5,0,TAU);ctx.fill();
   ctx.fillRect(x-4,y-2,8,12);
   ctx.strokeStyle="#8d7453";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+10,y-9);ctx.stroke();
  }

  ctx.fillStyle="#16110de8";ctx.strokeStyle="#d5b46b";ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-36,-78,72,28,8);ctx.fill();ctx.stroke();
  ctx.fillStyle="#fff0bd";ctx.textAlign="center";ctx.font="bold 15px system-ui";ctx.fillText(String(count),0,-59);
  ctx.fillStyle="#e6d4ad";ctx.font="bold 10px system-ui";ctx.fillText(camp.label,0,93);
  ctx.restore();
 });
}

function drawBlueprintArc(radius,a0,a1,width=24){
 ctx.save();
 ctx.strokeStyle="#f1dfaa55";ctx.lineWidth=width;ctx.lineCap="butt";ctx.setLineDash([24,14]);
 ctx.beginPath();ctx.arc(CX,CY,radius,a0,a1);ctx.stroke();
 ctx.strokeStyle="#fff1bd99";ctx.lineWidth=2;ctx.setLineDash([8,8]);
 ctx.beginPath();ctx.arc(CX,CY,radius,a0,a1);ctx.stroke();
 ctx.setLineDash([]);ctx.restore();
}
function drawBlueprintGate(radius,a,label){
 const x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
 ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
 ctx.fillStyle="#d6bf8250";ctx.strokeStyle="#fff0b6aa";ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
 ctx.fillRect(-42,-25,84,50);ctx.strokeRect(-42,-25,84,50);
 ctx.setLineDash([]);ctx.strokeStyle="#fff0b677";ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,10,17,Math.PI,TAU);ctx.stroke();
 ctx.fillStyle="#fff0bdcc";ctx.font="bold 10px system-ui";ctx.textAlign="center";ctx.fillText(label,0,-34);
 ctx.restore();
}
function drawWarriorStatue(statue){
 const {x,y}=statue;
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle="#211b146f";ctx.beginPath();ctx.ellipse(5,27,39,19,0,0,TAU);ctx.fill();
 ctx.fillStyle="#a38d64";ctx.beginPath();ctx.arc(0,18,27,0,TAU);ctx.fill();
 ctx.strokeStyle="#e3c98188";ctx.lineWidth=3;ctx.stroke();
 for(let i=0;i<8;i++){
  const a=i/8*TAU;ctx.strokeStyle="#64583f88";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*8,18+Math.sin(a)*8);ctx.lineTo(Math.cos(a)*25,18+Math.sin(a)*25);ctx.stroke();
 }
 ctx.fillStyle="#565b59";ctx.fillRect(-19,5,38,15);ctx.strokeStyle="#c9c3a9";ctx.lineWidth=2;ctx.strokeRect(-19,5,38,15);
 ctx.fillStyle="#777d78";ctx.fillRect(-13,-3,26,10);ctx.strokeStyle="#3f4543";ctx.strokeRect(-13,-3,26,10);
 ctx.fillStyle="#927447";ctx.fillRect(-6,-35,12,34);ctx.beginPath();ctx.arc(0,-44,9,0,TAU);ctx.fill();
 ctx.strokeStyle="#927447";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-2,-30);ctx.lineTo(-17,-13);ctx.moveTo(3,-29);ctx.lineTo(16,-20);ctx.stroke();
 ctx.fillStyle="#6d583a";ctx.strokeStyle="#d2b66f";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-18,-11,10,15,-.25,0,TAU);ctx.fill();ctx.stroke();
 ctx.strokeStyle="#d8c58c";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(15,-19);ctx.lineTo(27,-54);ctx.stroke();
 ctx.fillStyle="#efe1ae";ctx.beginPath();ctx.moveTo(28,-60);ctx.lineTo(22,-49);ctx.lineTo(32,-51);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#f0d98a77";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-44,10,0,TAU);ctx.stroke();
 ctx.fillStyle="#fff0bd";ctx.strokeStyle="#241a10";ctx.lineWidth=3;ctx.font="bold 10px system-ui";ctx.textAlign="center";ctx.strokeText("KRIEGERSTATUE",0,47);ctx.fillText("KRIEGERSTATUE",0,47);
 ctx.restore();
}
function drawFixedInnerWall(radius=FIXED_INNER_WALL_RADIUS){
 ctx.save();ctx.lineCap="round";
 const walls=Array.isArray(state.innerWalls)?state.innerWalls:[];
 for(const wall of walls){
  const ratio=Math.max(0,Math.min(1,wall.hp/Math.max(1,wall.maxHp)));
  const alive=wall.hp>0;
  const isSelected=selected===wall;
  ctx.strokeStyle="#17130f99";ctx.lineWidth=31;ctx.beginPath();ctx.arc(CX+3,CY+5,radius,wall.a0,wall.a1);ctx.stroke();
  ctx.strokeStyle=alive?(ratio>.55?"#766348":ratio>.25?"#735243":"#6b3935"):"#29231e";
  ctx.lineWidth=27;ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0,wall.a1);ctx.stroke();
  if(alive){
   const stones=5;
   for(let k=0;k<stones;k++){
    const a=wall.a0+(wall.a1-wall.a0)*(k+.5)/stones,x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
    ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
    ctx.fillStyle=k%2?(ratio>.4?"#9b8564":"#825b51"):(ratio>.4?"#806b50":"#70463f");
    ctx.fillRect(-9,-13,18,26);ctx.strokeStyle="#3e3429";ctx.lineWidth=1.3;ctx.strokeRect(-9,-13,18,26);
    ctx.fillStyle="#d0b98a66";ctx.fillRect(-7,-10,14,3);ctx.restore();
   }
   if(ratio<.65){
    const x=CX+Math.cos(wall.am)*radius,y=CY+Math.sin(wall.am)*radius;
    ctx.strokeStyle="#33201e";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-7,y-11);ctx.lineTo(x+2,y-1);ctx.lineTo(x-5,y+11);ctx.stroke();
   }
  }else{
   for(let k=-2;k<=2;k++){
    const a=wall.am+k*.045,r=radius+(k%2)*7;
    ctx.save();ctx.translate(CX+Math.cos(a)*r,CY+Math.sin(a)*r);ctx.rotate(a);
    ctx.fillStyle=k%2?"#665847":"#88745a";ctx.fillRect(-8,-5,16,10);ctx.restore();
   }
  }
  if(isSelected){
   ctx.strokeStyle="#ffe68a";ctx.shadowBlur=14;ctx.shadowColor="#ffe68a";ctx.lineWidth=4;
   ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0,wall.a1);ctx.stroke();ctx.shadowBlur=0;
  }
  if(ratio<.999){
   const bx=CX+Math.cos(wall.am)*(radius+31),by=CY+Math.sin(wall.am)*(radius+31),bw=38;
   ctx.fillStyle="#0e0908dd";ctx.fillRect(bx-bw/2,by-4,bw,7);
   ctx.fillStyle=ratio>.5?"#64bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(bx-bw/2+1,by-3,(bw-2)*ratio,5);
  }
 }
 // Vier feste Torhäuser schließen die Straßen zwischen den acht Segmenten.
 for(const a of [-Math.PI/2,0,Math.PI/2,Math.PI]){
  const x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
  ctx.fillStyle="#2e241b";ctx.fillRect(-18,-14,36,29);ctx.strokeStyle="#b99a68";ctx.lineWidth=2;ctx.strokeRect(-18,-14,36,29);
  ctx.fillStyle="#17130f";ctx.beginPath();ctx.roundRect(-9,-3,18,19,6);ctx.fill();
  ctx.strokeStyle="#7c5a35";ctx.lineWidth=2;for(let k=-5;k<=5;k+=5){ctx.beginPath();ctx.moveTo(k,-2);ctx.lineTo(k,14);ctx.stroke()}
  ctx.restore();
 }
 ctx.fillStyle="#e9d69dcc";ctx.font="bold 10px system-ui";ctx.textAlign="center";ctx.fillText("INNERER MAUERRING · 8 SEGMENTE",CX,CY-radius-28);
 ctx.restore();
}
function drawMiddleGate(gate){
 const a=gate.angle??gate.am??0,x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
 const stone=gate.material==="stone";
 ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
 if(!gate.built){
  ctx.fillStyle="#d6bf8238";ctx.strokeStyle="#ffe6a988";ctx.lineWidth=2.5;ctx.setLineDash([7,6]);
  ctx.fillRect(-34,-23,68,46);ctx.strokeRect(-34,-23,68,46);ctx.setLineDash([]);
  ctx.fillStyle="#fff0bdcc";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText(`HOLZTOR · ${MIDDLE_GATE_BUILD_WOOD} HOLZ`,0,-31);
 }else if(gate.hp>0){
  const ratio=Math.max(0,Math.min(1,gate.hp/Math.max(1,gate.maxHp)));
  if(stone){
   ctx.fillStyle="#171817b8";ctx.fillRect(-43,-31,86,63);
   ctx.fillStyle=ratio>.45?"#77776f":ratio>.2?"#68665f":"#5d514e";ctx.fillRect(-39,-27,78,55);
   ctx.strokeStyle="#c7c1a9";ctx.lineWidth=3;ctx.strokeRect(-39,-27,78,55);
   for(let row=0;row<3;row++)for(let col=-3;col<=3;col++){
    const ox=(row%2)*5;ctx.fillStyle=(row+col)%2?"#8c897f":"#6e6c65";
    ctx.fillRect(col*11-5+ox,-24+row*17,10,15);
   }
   ctx.fillStyle="#24231f";ctx.beginPath();ctx.moveTo(-15,27);ctx.lineTo(-15,3);ctx.quadraticCurveTo(0,-13,15,3);ctx.lineTo(15,27);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#b9b29c";ctx.lineWidth=2;ctx.stroke();
   for(let k=-3;k<=3;k++){ctx.fillStyle="#a5a094";ctx.fillRect(k*11-5,-36,10,12)}
   ctx.fillStyle="#314e71";ctx.beginPath();ctx.moveTo(-11,-27);ctx.lineTo(0,-43);ctx.lineTo(11,-27);ctx.closePath();ctx.fill();
  }else{
   ctx.fillStyle="#1b120caa";ctx.fillRect(-39,-27,78,55);
   ctx.fillStyle=ratio>.45?"#6f4528":ratio>.2?"#6f3427":"#64241f";ctx.fillRect(-35,-23,70,47);
   ctx.strokeStyle="#c18b4b";ctx.lineWidth=3;ctx.strokeRect(-35,-23,70,47);
   for(let k=-3;k<=3;k++){ctx.fillStyle=k%2?"#4e2e1c":"#82512d";ctx.fillRect(k*9-3,-19,7,39)}
   ctx.strokeStyle="#d8b568";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-32,0);ctx.lineTo(32,0);ctx.stroke();
   ctx.fillStyle="#233f65";ctx.beginPath();ctx.moveTo(-10,-23);ctx.lineTo(0,-37);ctx.lineTo(10,-23);ctx.closePath();ctx.fill();
  }
  if(ratio<.999){ctx.fillStyle="#110b09dd";ctx.fillRect(-28,35,56,7);ctx.fillStyle=ratio>.5?"#65bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(-27,36,54*ratio,5)}
 }else{
  ctx.fillStyle=stone?"#66645e":"#4b3424";for(let k=-3;k<=3;k++){ctx.save();ctx.translate(k*9,(k%2)*5);ctx.rotate((k%3-.8)*.24);ctx.fillRect(-6,-4,12,8);ctx.restore()}
  ctx.fillStyle="#e7c98dcc";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText("ZERSTÖRT",0,-25);
 }
 if(selected===gate){ctx.strokeStyle="#ffe68a";ctx.shadowBlur=14;ctx.shadowColor="#ffe68a";ctx.lineWidth=4;ctx.strokeRect(-45,-33,90,67);ctx.shadowBlur=0}
 ctx.restore();
}

function drawOuterGate(gate,radius){
 const a=gate.angle??gate.am??0,x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
 const stone=gate.material==="stone";
 ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
 if(!gate.built){
  ctx.fillStyle="#c7d7bf2b";ctx.strokeStyle="#e7f2d08f";ctx.lineWidth=2.5;ctx.setLineDash([7,6]);
  ctx.fillRect(-39,-25,78,50);ctx.strokeRect(-39,-25,78,50);ctx.setLineDash([]);
  ctx.fillStyle="#f5e8bacc";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText(`AUSSENTOR · ${OUTER_GATE_BUILD_WOOD} HOLZ`,0,-33);
 }else if(gate.hp>0){
  const ratio=Math.max(0,Math.min(1,gate.hp/Math.max(1,gate.maxHp)));
  if(stone){
   ctx.fillStyle="#141716bd";ctx.fillRect(-47,-34,94,69);
   ctx.fillStyle=ratio>.45?"#74776e":ratio>.2?"#676861":"#594e4d";ctx.fillRect(-43,-30,86,61);
   ctx.strokeStyle="#d0ccb6";ctx.lineWidth=3;ctx.strokeRect(-43,-30,86,61);
   for(let row=0;row<3;row++)for(let col=-4;col<=3;col++){
    const ox=(row%2)*5;ctx.fillStyle=(row+col)%2?"#8c8c82":"#6c6e67";
    ctx.fillRect(col*11+ox,-27+row*18,10,16);
   }
   ctx.fillStyle="#232520";ctx.beginPath();ctx.moveTo(-17,31);ctx.lineTo(-17,3);ctx.quadraticCurveTo(0,-17,17,3);ctx.lineTo(17,31);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#beb9a4";ctx.lineWidth=2;ctx.stroke();
   for(let k=-4;k<=4;k++){ctx.fillStyle="#aaa79b";ctx.fillRect(k*10-4,-41,9,13)}
   ctx.fillStyle="#48633f";ctx.beginPath();ctx.moveTo(-12,-30);ctx.lineTo(0,-48);ctx.lineTo(12,-30);ctx.closePath();ctx.fill();
  }else{
   ctx.fillStyle="#17110daa";ctx.fillRect(-43,-29,86,59);
   ctx.fillStyle=ratio>.45?"#5e432c":ratio>.2?"#633226":"#57221e";ctx.fillRect(-39,-25,78,51);
   ctx.strokeStyle="#b99257";ctx.lineWidth=3;ctx.strokeRect(-39,-25,78,51);
   for(let k=-4;k<=4;k++){ctx.fillStyle=k%2?"#47301f":"#765236";ctx.fillRect(k*8-3,-21,6,43)}
   ctx.strokeStyle="#d0b274";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(36,0);ctx.stroke();
   ctx.fillStyle="#4a633c";ctx.beginPath();ctx.moveTo(-11,-25);ctx.lineTo(0,-41);ctx.lineTo(11,-25);ctx.closePath();ctx.fill();
  }
  if(ratio<.999){ctx.fillStyle="#110b09dd";ctx.fillRect(-30,39,60,7);ctx.fillStyle=ratio>.5?"#65bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(-29,40,58*ratio,5)}
 }else{
  ctx.fillStyle=stone?"#686860":"#49372a";for(let k=-3;k<=3;k++){ctx.save();ctx.translate(k*10,(k%2)*5);ctx.rotate((k%3-.8)*.24);ctx.fillRect(-7,-4,14,8);ctx.restore()}
  ctx.fillStyle="#e7c98dcc";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText("ZERSTÖRT",0,-27);
 }
 if(selected===gate){ctx.strokeStyle="#ffe68a";ctx.shadowBlur=14;ctx.shadowColor="#ffe68a";ctx.lineWidth=4;ctx.strokeRect(-49,-36,98,73);ctx.shadowBlur=0}
 ctx.restore();
}

function drawOuterWallSegment(wall,radius){
 const ratio=Math.max(0,Math.min(1,wall.hp/Math.max(1,wall.maxHp)));
 const alive=wall.hp>0,stone=wall.material==="stone";
 ctx.save();ctx.lineCap="round";
 if(stone){
  ctx.strokeStyle="#141716b8";ctx.lineWidth=35;ctx.beginPath();ctx.arc(CX+4,CY+6,radius,wall.a0+.01,wall.a1-.01);ctx.stroke();
  ctx.strokeStyle=alive?(ratio>.5?"#72746c":ratio>.25?"#66665f":"#594d4b"):"#302e2b";ctx.lineWidth=31;ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0+.012,wall.a1-.012);ctx.stroke();
  if(alive){
   ctx.strokeStyle="#aaa799";ctx.lineWidth=17;ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0+.017,wall.a1-.017);ctx.stroke();
   for(let k=0;k<5;k++){
    const a=wall.a0+(wall.a1-wall.a0)*(k+.5)/5,x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
    ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
    ctx.fillStyle=k%2?"#85857d":"#99958a";ctx.fillRect(-7,-14,14,28);
    ctx.strokeStyle="#54544f";ctx.lineWidth=1.2;ctx.strokeRect(-7,-14,14,28);ctx.fillStyle="#beb7a3";ctx.fillRect(-6,-13,12,4);ctx.restore();
   }
   if(ratio<.68){
    const x=CX+Math.cos(wall.am)*radius,y=CY+Math.sin(wall.am)*radius;
    ctx.strokeStyle="#393331";ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-8,y-10);ctx.lineTo(x+2,y-1);ctx.lineTo(x-5,y+10);ctx.moveTo(x+2,y-1);ctx.lineTo(x+9,y+5);ctx.stroke();
   }
  }else{
   for(let k=-2;k<=2;k++){const a=wall.am+k*.032,r=radius+(k%2)*5;ctx.fillStyle=k%2?"#77746c":"#575650";ctx.fillRect(CX+Math.cos(a)*r-6,CY+Math.sin(a)*r-4,12,9)}
  }
 }else{
  ctx.strokeStyle="#17100baa";ctx.lineWidth=31;ctx.beginPath();ctx.arc(CX+4,CY+6,radius,wall.a0+.01,wall.a1-.01);ctx.stroke();
  ctx.strokeStyle=alive?(ratio>.5?"#5f452d":ratio>.25?"#663627":"#5d2923"):"#241b16";ctx.lineWidth=27;ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0+.012,wall.a1-.012);ctx.stroke();
  if(alive){
   for(let k=0;k<5;k++){
    const a=wall.a0+(wall.a1-wall.a0)*(k+.5)/5,x=CX+Math.cos(a)*radius,y=CY+Math.sin(a)*radius;
    ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
    ctx.fillStyle=ratio>.5?"#8b633b":"#7b4631";ctx.beginPath();ctx.moveTo(-3.5,11);ctx.lineTo(-4.5,-8);ctx.lineTo(0,-15);ctx.lineTo(4.5,-8);ctx.lineTo(3.5,11);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#39271c";ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle="#c58a4a88";ctx.fillRect(-1.5,-7,2,13);ctx.restore();
   }
  }else{
   for(let k=-2;k<=2;k++){const a=wall.am+k*.032,r=radius+(k%2)*5;ctx.fillStyle="#493426";ctx.fillRect(CX+Math.cos(a)*r-5,CY+Math.sin(a)*r-3,10,7)}
  }
 }
 if(selected===wall){ctx.strokeStyle="#ffe68a";ctx.shadowBlur=14;ctx.shadowColor="#ffe68a";ctx.lineWidth=4;ctx.beginPath();ctx.arc(CX,CY,radius,wall.a0,wall.a1);ctx.stroke();ctx.shadowBlur=0}
 if(ratio<.999){
  const bx=CX+Math.cos(wall.am)*(radius+29),by=CY+Math.sin(wall.am)*(radius+29),bw=34;
  ctx.fillStyle="#0e0908dd";ctx.fillRect(bx-bw/2,by-4,bw,7);ctx.fillStyle=ratio>.5?"#64bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(bx-bw/2+1,by-3,(bw-2)*ratio,5);
 }
 ctx.restore();
}

function wallTowerSupport(slot){
 if(slot?.type==="wall")return state.walls?.[slot.i]||null;
 if(slot?.type==="outer-wall")return state.outerWalls?.[slot.i]||null;
 return null;
}
function wallTowerSpotReady(slot){
 const wall=wallTowerSupport(slot);
 return Boolean(slot?.towerSpot&&wall?.built&&wall.hp>0);
}
function drawWallTowerSpots(){
 for(const slot of wallSlots){
  if(slot.towerSpot!==true)continue;
  const ready=wallTowerSpotReady(slot),occupied=Boolean(slot.building);
  ctx.save();ctx.translate(slot.x,slot.y);
  ctx.fillStyle="#11130f99";ctx.beginPath();ctx.arc(5,7,31,0,TAU);ctx.fill();
  ctx.fillStyle=ready?"#7f7e72":"#4c493f";ctx.strokeStyle=ready?"#d8cfaa":"#9d8c6e";ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,0,27,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle=ready?"#ece3bd":"#756b59";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();
  for(let i=0;i<8;i++){const a=i/8*TAU;ctx.fillStyle=ready?"#aaa592":"#666052";ctx.fillRect(Math.cos(a)*23-4,Math.sin(a)*23-4,8,8)}
  if(!occupied&&BUILD[buildMode]?.kind==="tower"){
   ctx.fillStyle=ready?"#fff1bd":"#d3bd91";ctx.font="bold 8px system-ui";ctx.textAlign="center";
   ctx.fillText(ready?"TURM":"MAUER NÖTIG",0,40);
  }
  ctx.restore();
 }
}
function drawFutureFortressLayout(){
 const layout=getFutureLayoutGeometry({CX,CY,WALL_R});
 ctx.save();
 // Dorf- und Versorgungsplätze liegen zwischen Kernburg und mittlerem Mauerring.
 for(const slot of insideSlots){
  if(slot.building)continue;
  const statueSlot=slot.role==="statue";
  ctx.fillStyle=statueSlot?"#d8b66d24":"#d8c79718";
  ctx.strokeStyle=statueSlot?"#ffe09a99":"#f2dfaa55";
  ctx.lineWidth=2;ctx.setLineDash(statueSlot?[5,5]:[8,7]);
  if(statueSlot){ctx.beginPath();ctx.arc(slot.x,slot.y,35,0,TAU);ctx.fill();ctx.stroke();}
  else{ctx.beginPath();ctx.roundRect(slot.x-38,slot.y-31,76,62,14);ctx.fill();ctx.stroke();}
  ctx.setLineDash([]);ctx.fillStyle=statueSlot?"#ffe8adcc":"#efe0b277";ctx.font="bold 9px system-ui";ctx.textAlign="center";
  ctx.fillText(statueSlot?"EHRENPLATZ":"BAUPLATZ",slot.x,slot.y+4);
 }
 drawFixedInnerWall(layout.fixedInnerRadius);
 // Zwanzig einzeln baubare Segmente der mittleren Holzpalisade.
 for(const wall of state.walls){
  if(wall.built&&wall.hp>0)continue;
  drawBlueprintArc(WALL_R,wall.a0+.018,wall.a1-.018,29);
 }
 ctx.fillStyle="#e8d19dcc";ctx.font="bold 10px system-ui";ctx.textAlign="center";
 ctx.fillText(`MITTLERER RING · ${MIDDLE_WALL_SEGMENT_COUNT} SEGMENTE · ${MIDDLE_GATE_COUNT} TORE`,CX,CY-WALL_R-30);
 for(const gate of state.middleGates||[])drawMiddleGate(gate);
 // Achtundzwanzig einzeln baubare Segmente der äußeren Holzpalisade.
 for(const wall of state.outerWalls||[]){
  if(wall.built)drawOuterWallSegment(wall,layout.outerRadius);
  else drawBlueprintArc(layout.outerRadius,wall.a0+.014,wall.a1-.014,23);
 }
 for(const gate of state.outerGates||[])drawOuterGate(gate,layout.outerRadius);
 drawWallTowerSpots();
 ctx.fillStyle="#f0dfb4cc";ctx.font="bold 12px system-ui";ctx.textAlign="center";
 ctx.fillText(`ÄUSSERER RING · ${OUTER_WALL_SEGMENT_COUNT} SEGMENTE · ${OUTER_GATE_COUNT} TORE`,CX,CY-layout.outerRadius-46);
 ctx.restore();
}
function drawGatehouse(a){
 const x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
 ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
 ctx.fillStyle="#15100c88";ctx.fillRect(-34,-15,68,38);
 ctx.fillStyle="#5a3822";ctx.fillRect(-30,-21,60,38);
 ctx.fillStyle="#83512d";for(let k=-2;k<=2;k++)ctx.fillRect(k*11-4,-28,8,12);
 ctx.fillStyle="#1c1713";ctx.fillRect(-11,-4,22,22);
 ctx.strokeStyle="#bd8a4b";ctx.lineWidth=2;ctx.strokeRect(-11,-4,22,22);
 ctx.fillStyle="#214f7c";ctx.fillRect(-7,-20,14,12);
 ctx.fillStyle="#e4c86b";ctx.font="bold 9px serif";ctx.textAlign="center";ctx.fillText("♜",0,-11);
 ctx.restore();
}
function drawCastle(){
 ctx.save();
 // Innenhof-Schatten
 ctx.fillStyle="#0d120d66";ctx.beginPath();ctx.arc(CX+13,CY+18,WALL_R+27,0,TAU);ctx.fill();
 // Innenhof
 const yard=ctx.createRadialGradient(CX-90,CY-110,25,CX,CY,WALL_R);
 yard.addColorStop(0,"#c7ad75");yard.addColorStop(.5,"#9c8255");yard.addColorStop(1,"#66563e");
 ctx.fillStyle=yard;ctx.beginPath();ctx.arc(CX,CY,WALL_R-24,0,TAU);ctx.fill();
 // unregelmäßige Pflasterstruktur
 ctx.globalAlpha=.18;
 for(let i=0;i<140;i++){
  const a=(i*2.399963)%TAU,r=45+((i*73)%(WALL_R-84)),x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
  ctx.fillStyle=i%3?"#d8c18e":"#4f4433";ctx.beginPath();ctx.ellipse(x,y,5+(i%4),3+(i%2),a,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 // Mittlerer Ring: Holzpalisaden können einzeln zu Steinmauern ausgebaut werden.
 for(const w of state.walls){
  if(!w.built)continue;
  const ratio=w.hp/w.maxHp,alive=w.hp>0,stone=w.material==="stone";
  ctx.lineCap="round";
  if(stone){
   ctx.strokeStyle="#171817bb";ctx.lineWidth=44;ctx.beginPath();ctx.arc(CX+5,CY+7,WALL_R,w.a0+.01,w.a1-.01);ctx.stroke();
   ctx.strokeStyle=alive?(ratio>.5?"#74736b":ratio>.25?"#69645e":"#5b4d4a"):"#302d2a";ctx.lineWidth=39;ctx.beginPath();ctx.arc(CX,CY,WALL_R,w.a0+.012,w.a1-.012);ctx.stroke();
   if(alive){
    ctx.strokeStyle="#aaa698";ctx.lineWidth=22;ctx.beginPath();ctx.arc(CX,CY,WALL_R,w.a0+.018,w.a1-.018);ctx.stroke();
    for(let k=0;k<6;k++){
     const a=w.a0+(w.a1-w.a0)*(k+.5)/6,x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
     ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
     ctx.fillStyle=k%2?"#85837b":"#9b978a";ctx.fillRect(-8,-16,16,32);
     ctx.strokeStyle="#55534e";ctx.lineWidth=1.3;ctx.strokeRect(-8,-16,16,32);
     ctx.fillStyle="#b9b3a0";ctx.fillRect(-7,-15,14,5);ctx.restore();
    }
    if(ratio<.7){
     const a=w.am,x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
     ctx.strokeStyle="#3b3432";ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(x-9,y-12);ctx.lineTo(x+2,y-2);ctx.lineTo(x-5,y+12);ctx.moveTo(x+2,y-2);ctx.lineTo(x+10,y+6);ctx.stroke();
    }
   }else{
    for(let k=-2;k<=2;k++){const a=w.am+k*.036,r=WALL_R+(k%2)*7;ctx.fillStyle=k%2?"#77736b":"#595650";ctx.fillRect(CX+Math.cos(a)*r-7,CY+Math.sin(a)*r-5,14,10)}
   }
  }else{
   ctx.strokeStyle="#17100baa";ctx.lineWidth=38;ctx.beginPath();ctx.arc(CX+5,CY+7,WALL_R,w.a0+.012,w.a1-.012);ctx.stroke();
   ctx.strokeStyle=alive?(ratio>.5?"#67401f":ratio>.25?"#743522":"#6d2822"):"#241b16";ctx.lineWidth=33;ctx.beginPath();ctx.arc(CX,CY,WALL_R,w.a0+.014,w.a1-.014);ctx.stroke();
   if(alive){
    for(let k=0;k<5;k++){
     const a=w.a0+(w.a1-w.a0)*(k+.5)/5,x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
     ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
     ctx.fillStyle=ratio>.5?"#9a6234":"#8a432e";ctx.beginPath();ctx.moveTo(-4,13);ctx.lineTo(-5,-9);ctx.lineTo(0,-17);ctx.lineTo(5,-9);ctx.lineTo(4,13);ctx.closePath();ctx.fill();
     ctx.strokeStyle="#3d2618";ctx.lineWidth=1.4;ctx.stroke();
     ctx.fillStyle="#d68d45aa";ctx.fillRect(-2,-8,2,15);ctx.restore();
    }
    if(ratio<.65){
     const a=w.am,x=CX+Math.cos(a)*WALL_R,y=CY+Math.sin(a)*WALL_R;
     ctx.strokeStyle="#2a1714";ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-8,y-10);ctx.lineTo(x+2,y);ctx.lineTo(x-6,y+11);ctx.stroke();
    }
   }else{
    for(let k=-2;k<=2;k++){const a=w.am+k*.035,r=WALL_R+(k%2)*6;ctx.fillStyle="#4a3021";ctx.fillRect(CX+Math.cos(a)*r-6,CY+Math.sin(a)*r-4,12,8)}
   }
  }
  if(selected===w){ctx.strokeStyle="#ffe68a";ctx.shadowBlur=14;ctx.shadowColor="#ffe68a";ctx.lineWidth=4;ctx.beginPath();ctx.arc(CX,CY,WALL_R,w.a0,w.a1);ctx.stroke();ctx.shadowBlur=0}
  if(ratio<.999){
   const bx=CX+Math.cos(w.am)*(WALL_R+34),by=CY+Math.sin(w.am)*(WALL_R+34),bw=42;
   ctx.fillStyle="#0e0908dd";ctx.fillRect(bx-bw/2,by-4,bw,7);
   ctx.fillStyle=ratio>.5?"#64bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(bx-bw/2+1,by-3,(bw-2)*Math.max(0,ratio),5);
  }
 }
 // Kleine Holzfestung als Zentrum des neuen Aufbausystems.
 ctx.fillStyle="#10100d77";ctx.beginPath();ctx.ellipse(CX+8,CY+43,92,40,0,0,TAU);ctx.fill();
 // niedrige Holzpalisade um den Kernbau
 for(let i=0;i<18;i++){
  const a=i/18*TAU,r=77,x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r*.72+10;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
  ctx.fillStyle=i%2?"#704526":"#87552d";
  ctx.beginPath();ctx.moveTo(-4,12);ctx.lineTo(-5,-12);ctx.lineTo(0,-20);ctx.lineTo(5,-12);ctx.lineTo(4,12);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#332116";ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
 }
 // Fundament und Hauptgebäude
 ctx.fillStyle="#4e3927";ctx.fillRect(CX-55,CY-40,110,92);
 const timber=ctx.createLinearGradient(CX-55,CY-40,CX+55,CY+52);
 timber.addColorStop(0,"#a66c36");timber.addColorStop(.5,"#754824");timber.addColorStop(1,"#4c301f");
 ctx.fillStyle=timber;ctx.fillRect(CX-49,CY-36,98,82);
 ctx.strokeStyle="#2d2018";ctx.lineWidth=5;ctx.strokeRect(CX-49,CY-36,98,82);
 // Fachwerk
 ctx.strokeStyle="#2f2016";ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(CX-46,CY-33);ctx.lineTo(CX+46,CY+43);ctx.moveTo(CX+46,CY-33);ctx.lineTo(CX-46,CY+43);ctx.moveTo(CX,CY-35);ctx.lineTo(CX,CY+45);ctx.stroke();
 // Holzdach
 const roof=ctx.createLinearGradient(CX-68,CY-78,CX+68,CY-28);
 roof.addColorStop(0,"#385f78");roof.addColorStop(.5,"#173d60");roof.addColorStop(1,"#102a43");
 ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(CX-66,CY-35);ctx.lineTo(CX,CY-79);ctx.lineTo(CX+66,CY-35);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#d1ae60";ctx.lineWidth=2.4;ctx.stroke();
 // kleines Tor und seitliche Stützen
 ctx.fillStyle="#21170f";ctx.fillRect(CX-13,CY+13,26,34);ctx.strokeStyle="#b57a3f";ctx.lineWidth=2;ctx.strokeRect(CX-13,CY+13,26,34);
 for(const ox of [-43,43]){
  ctx.fillStyle="#5b3921";ctx.fillRect(CX+ox-8,CY-45,16,84);
  ctx.fillStyle="#2f5672";ctx.beginPath();ctx.moveTo(CX+ox-14,CY-44);ctx.lineTo(CX+ox,CY-59);ctx.lineTo(CX+ox+14,CY-44);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#cba85e";ctx.lineWidth=1.5;ctx.stroke();
 }
 // Fahne der jungen Festung
 ctx.strokeStyle="#36261a";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(CX,CY-108);ctx.lineTo(CX,CY-72);ctx.stroke();
 ctx.fillStyle="#1d4e7b";ctx.beginPath();ctx.moveTo(CX,CY-106);ctx.lineTo(CX+34,CY-97);ctx.lineTo(CX,CY-85);ctx.closePath();ctx.fill();
 ctx.fillStyle="#e3c86d";ctx.font="bold 12px serif";ctx.textAlign="center";ctx.fillText("♜",CX+13,CY-94);
 // Sichtbarer Lebensbalken der Hauptburg
 const castleHpRatio=Math.max(0,Math.min(1,state.hp/state.maxHp));
 const castleBarY=CY-142,castleBarW=156;
 ctx.fillStyle="#10100fe8";ctx.fillRect(CX-castleBarW/2-2,castleBarY-2,castleBarW+4,17);
 ctx.fillStyle=castleHpRatio>.60?"#66c161":castleHpRatio>.30?"#d4a341":"#d54b45";
 ctx.fillRect(CX-castleBarW/2,castleBarY,castleBarW*castleHpRatio,13);
 ctx.strokeStyle="#f3e5cfbb";ctx.lineWidth=1.5;ctx.strokeRect(CX-castleBarW/2-2,castleBarY-2,castleBarW+4,17);
 ctx.fillStyle="#fff8e8";ctx.font="bold 10px system-ui";ctx.textAlign="center";
 ctx.fillText(`HOLZFESTUNG ${Math.ceil(state.hp)} / ${state.maxHp}`,CX,castleBarY+10);
 // Kisten, Fässer und kleine Versorgungsdetails am Festungshof.
 for(const [ox,oy] of [[-108,72],[-126,62],[112,-68]]){ctx.fillStyle="#744a29";ctx.fillRect(CX+ox-9,CY+oy-7,18,14);ctx.strokeStyle="#bd8748";ctx.lineWidth=2;ctx.strokeRect(CX+ox-9,CY+oy-7,18,14)}
 for(const [ox,oy] of [[-98,-78],[-114,94]]){ctx.fillStyle="#5a3824";ctx.beginPath();ctx.ellipse(CX+ox,CY+oy,8,12,0,0,TAU);ctx.fill();ctx.strokeStyle="#aa7944";ctx.stroke()}
 // Fackeln
 for(let i=0;i<10;i++){
  const a=i/10*TAU+.2,r=WALL_R-68,x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
  const flicker=.75+Math.sin(performance.now()*.012+i)*.25;
  ctx.globalAlpha=.17*flicker;ctx.fillStyle="#ff9e32";ctx.beginPath();ctx.arc(x,y,17,0,TAU);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle="#f5a83c";ctx.beginPath();ctx.moveTo(x,y-10);ctx.quadraticCurveTo(x-4,y-3,x,y+2);ctx.quadraticCurveTo(x+5,y-4,x,y-10);ctx.fill();
 }
 ctx.restore();
}
function drawSlots(){
 if(!buildMode)return;
 for(const s of [...wallSlots,...insideSlots,...castleSlots]){
  if(s.building)continue;
  const c=BUILD[buildMode];
  const wallTower=c?.kind==="tower"&&(s.type==="wall"||s.type==="outer-wall")&&s.towerSpot===true;
  const valid=c&&((c.kind==="tower"&&(s.type==="castle"||wallTower))||(c.kind==="inside"&&s.type==="inside"&&(c.slotRole==="statue"?s.role==="statue":s.role!=="statue")));
  if(!valid)continue;
  const wallReady=!wallTower||wallTowerSpotReady(s);
  ctx.save();
  const pulse=.72+Math.sin(performance.now()*.006+s.x*.01)*.18;
  ctx.globalAlpha=pulse;ctx.shadowBlur=20;ctx.shadowColor=wallReady?"#ffe38a":"#d76a55";
  ctx.fillStyle=wallReady?"#c39b4266":"#7d393355";ctx.strokeStyle=wallReady?"#ffe9a2":"#f1a18f";ctx.lineWidth=3;
  const slotRadius=s.type==="castle"?20:(s.type==="wall"||s.type==="outer-wall")?24:31;
  ctx.beginPath();ctx.arc(s.x,s.y,slotRadius,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fff3c277";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,Math.max(12,slotRadius-9),0,TAU);ctx.stroke();
  ctx.restore();
 }
 if(buildMode==="palisade"){
  for(const wall of state.walls){
   if(wall.built&&wall.hp>0)continue;
   ctx.save();ctx.globalAlpha=.72+Math.sin(performance.now()*.006+wall.i)*.16;
   ctx.strokeStyle="#ffe69a";ctx.shadowBlur=22;ctx.shadowColor="#ffcf5a";ctx.lineWidth=42;
   ctx.beginPath();ctx.arc(CX,CY,WALL_R,wall.a0+.012,wall.a1-.012);ctx.stroke();
   ctx.strokeStyle="#fff7c9";ctx.lineWidth=3;ctx.setLineDash([9,6]);ctx.beginPath();ctx.arc(CX,CY,WALL_R,wall.a0+.012,wall.a1-.012);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }
 }
 if(buildMode==="soldier"){
  ctx.save();ctx.strokeStyle="#a9ddff";ctx.shadowBlur=14;ctx.shadowColor="#6ac8ff";ctx.lineWidth=3;ctx.setLineDash([12,8]);
  ctx.beginPath();ctx.arc(CX,CY,WALL_R-34,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
 }
}

function drawRangeCircle(x,y,range,color){
 ctx.save();
 ctx.globalAlpha=.72;
 ctx.strokeStyle=color;
 ctx.lineWidth=Math.max(.8,1.35/zoom);
 ctx.setLineDash([Math.max(3,7/zoom),Math.max(3,6/zoom)]);
 ctx.beginPath();ctx.arc(x,y,range,0,TAU);ctx.stroke();
 ctx.setLineDash([]);
 ctx.globalAlpha=.08;
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,range,0,TAU);ctx.fill();
 ctx.restore();
}
function drawRangeIndicators(){
 if(rangeDisplayMode===0)return;
 const selectedOnly=rangeDisplayMode===1;
 if(selectedOnly){
  if(selected&&selected.kind==="unit"&&selected.hp>0)drawRangeCircle(selected.x,selected.y,selected.range,"#8bd68d");
  else if(selected&&selected.kind==="building"&&selected.base.kind==="tower"&&selected.hp>0&&((selected.slot.type!=="wall"&&selected.slot.type!=="outer-wall")||wallTowerSpotReady(selected.slot)))drawRangeCircle(selected.slot.x,selected.slot.y,selected.range,"#72bfff");
  return;
 }
 for(const b of state.buildings){
  if(b.base.kind==="tower"&&b.hp>0&&((b.slot.type!=="wall"&&b.slot.type!=="outer-wall")||wallTowerSpotReady(b.slot)))drawRangeCircle(b.slot.x,b.slot.y,b.range,b.key==="catapult"?"#c9a1ff":"#72bfff");
 }
 for(const u of state.units){
  if(u.hp>0)drawRangeCircle(u.x,u.y,u.range,"#8bd68d");
 }
}

function drawBuildings(){
 for(const b of state.buildings){
  const x=b.slot.x,y=b.slot.y;ctx.save();ctx.translate(x,y);
  const lv=b.level||1,isTower=b.base.kind==="tower";
  const inactiveWallTower=isTower&&(b.slot.type==="wall"||b.slot.type==="outer-wall")&&!wallTowerSpotReady(b.slot);
  ctx.fillStyle="#07090788";ctx.beginPath();ctx.ellipse(8,20,35,15,0,0,TAU);ctx.fill();
  if(selected===b){ctx.strokeStyle="#ffe184";ctx.shadowBlur=22;ctx.shadowColor="#ffd665";ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,43,0,TAU);ctx.stroke();ctx.shadowBlur=0}
  if(b.key==="statue"){
   ctx.restore();drawWarriorStatue({x,y});continue;
  }
  if(isTower){
   // stone circular base and timber frame
   ctx.fillStyle="#42413a";ctx.beginPath();ctx.ellipse(0,14,25,14,0,0,TAU);ctx.fill();ctx.strokeStyle="#89877b";ctx.lineWidth=3;ctx.stroke();
   ctx.fillStyle="#3c2b20";ctx.fillRect(-21,-8,42,38);
   ctx.strokeStyle="#b1783f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,28);ctx.lineTo(19,-7);ctx.moveTo(20,28);ctx.lineTo(-19,-7);ctx.stroke();
   ctx.strokeStyle="#251711";ctx.lineWidth=2;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*13,-7);ctx.lineTo(k*13,29);ctx.stroke()}
   // battlement platform
   ctx.fillStyle="#75502f";ctx.fillRect(-26,-11,52,9);
   for(let k=-2;k<=2;k++)ctx.fillRect(k*11-4,-21,8,13);
   // roof
   const roof=ctx.createLinearGradient(-28,-36,28,-6);roof.addColorStop(0,"#315f8e");roof.addColorStop(.5,"#163d69");roof.addColorStop(1,"#0a2544");
   ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(-29,-10);ctx.lineTo(0,-38);ctx.lineTo(29,-10);ctx.closePath();ctx.fill();ctx.strokeStyle="#d5ae5d";ctx.lineWidth=2.3;ctx.stroke();
   // detailed weapon
   if(b.key==="archer"){
    ctx.strokeStyle="#c09055";ctx.lineWidth=2.8;ctx.beginPath();ctx.arc(0,-10,14,-1.28,1.28);ctx.stroke();
    ctx.strokeStyle="#ead9b6";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(4,-24);ctx.lineTo(4,4);ctx.stroke();
    ctx.strokeStyle="#d8bf88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,-9);ctx.lineTo(17,-10);ctx.stroke();
   }else if(b.key==="crossbow"){
    ctx.strokeStyle="#a87742";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-16,-11);ctx.lineTo(16,-11);ctx.moveTo(0,-21);ctx.lineTo(0,1);ctx.stroke();
    ctx.strokeStyle="#e1d3b3";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-16,-11);ctx.quadraticCurveTo(0,-24,16,-11);ctx.stroke();
    ctx.fillStyle="#cdd5d7";ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(-5,-17);ctx.lineTo(5,-17);ctx.closePath();ctx.fill();
   }else{
    ctx.fillStyle="#30241d";ctx.fillRect(-17,-10,34,10);
    ctx.fillStyle="#747d80";ctx.beginPath();ctx.arc(0,-13,10,0,TAU);ctx.fill();ctx.strokeStyle="#d2d8d9";ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle="#6b4325";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(-21,14);ctx.moveTo(14,-3);ctx.lineTo(21,14);ctx.stroke();
   }
   // banners and lantern
   ctx.fillStyle="#164b80";ctx.fillRect(-29,-3,8,19);ctx.fillRect(21,-3,8,19);
   ctx.fillStyle="#e1c269";ctx.font="bold 7px serif";ctx.textAlign="center";ctx.fillText("♜",-25,9);ctx.fillText("♜",25,9);
   ctx.globalAlpha=.22;ctx.fillStyle="#ffaf42";ctx.beginPath();ctx.arc(0,12,10,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle="#ffcf6e";ctx.fillRect(-2,8,4,6);
   if(lv>=2){ctx.fillStyle="#d7b45d";ctx.beginPath();ctx.arc(0,-40,3+Math.min(5,lv),0,TAU);ctx.fill()}
   if(b.hp/b.maxHp<.7){ctx.strokeStyle="#20120e";ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-12,-4);ctx.lineTo(1,7);ctx.lineTo(-7,19);ctx.moveTo(9,-3);ctx.lineTo(3,10);ctx.stroke()}
   const hpRatio=Math.max(0,Math.min(1,b.hp/b.maxHp));
   ctx.fillStyle="#130b0b";ctx.fillRect(-26,34,52,7);
   ctx.fillStyle=hpRatio>.60?"#66c161":hpRatio>.30?"#d4a341":"#d54b45";
   ctx.fillRect(-25,35,50*hpRatio,5);
   ctx.strokeStyle="#f1dfcf66";ctx.lineWidth=1;ctx.strokeRect(-26,34,52,7);
   const txp=Math.max(0,Math.min(1,(b.xp||0)/(b.xpMax||90)));
   ctx.fillStyle="#07101e";ctx.fillRect(-26,43,52,6);
   ctx.fillStyle=(b.pendingUpgrades||0)>0?"#6bd3ff":"#348de4";ctx.fillRect(-25,44,50*txp,4);
   ctx.strokeStyle="#9edcff66";ctx.lineWidth=1;ctx.strokeRect(-26,43,52,6);
   if((b.pendingUpgrades||0)>0){
    ctx.fillStyle="#e2f8ff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("▲",0,59);
   }
   if(inactiveWallTower){
    ctx.fillStyle="#441914e8";ctx.strokeStyle="#ffc1aa";ctx.lineWidth=2;ctx.beginPath();ctx.arc(23,-37,10,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle="#fff2df";ctx.font="bold 13px system-ui";ctx.textAlign="center";ctx.fillText("!",23,-32);
   }
  }else{
   // masonry base
   ctx.fillStyle="#514435";ctx.beginPath();ctx.ellipse(0,22,33,11,0,0,TAU);ctx.fill();
   ctx.fillStyle="#65503b";ctx.fillRect(-30,-15,60,41);
   const wall=ctx.createLinearGradient(-28,-15,28,23);wall.addColorStop(0,"#b89262");wall.addColorStop(.48,b.base.color);wall.addColorStop(1,"#604a38");ctx.fillStyle=wall;ctx.fillRect(-26,-13,52,36);
   // timber framing
   ctx.strokeStyle="#4b2e1a";ctx.lineWidth=3;ctx.strokeRect(-26,-13,52,36);ctx.beginPath();ctx.moveTo(-25,-12);ctx.lineTo(25,22);ctx.moveTo(25,-12);ctx.lineTo(-25,22);ctx.moveTo(0,-12);ctx.lineTo(0,23);ctx.stroke();
   // tiled roof
   const rg=ctx.createLinearGradient(-38,-47,38,-12);rg.addColorStop(0,"#2f5d8b");rg.addColorStop(.52,"#153c69");rg.addColorStop(1,"#092746");ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(-38,-13);ctx.lineTo(0,-48);ctx.lineTo(38,-13);ctx.closePath();ctx.fill();ctx.strokeStyle="#d0aa5a";ctx.lineWidth=2.2;ctx.stroke();
   ctx.strokeStyle="#7291aa55";ctx.lineWidth=1;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*9,-17);ctx.lineTo(0,-46);ctx.stroke()}
   // chimney, windows, door
   if(!["lumber","quarry"].includes(b.key)){ctx.fillStyle="#594234";ctx.fillRect(17,-40,10,24);ctx.fillStyle="#c7bba9";ctx.globalAlpha=.22;ctx.beginPath();ctx.arc(23,-47,6,0,TAU);ctx.arc(28,-55,5,0,TAU);ctx.fill();ctx.globalAlpha=1}
   ctx.fillStyle="#291c14";ctx.fillRect(-8,2,16,24);ctx.fillStyle="#e4b85c";ctx.beginPath();ctx.arc(3,14,2,0,TAU);ctx.fill();
   ctx.fillStyle="#efd17a";ctx.fillRect(-21,-5,9,10);ctx.fillRect(12,-5,9,10);ctx.strokeStyle="#554021";ctx.lineWidth=1;ctx.strokeRect(-21,-5,9,10);ctx.strokeRect(12,-5,9,10);
   ctx.font="22px serif";ctx.textAlign="center";ctx.fillText(b.key==="house"?(lv>=2?"🏠":"⛺"):b.key==="lumber"?"🪵":b.key==="quarry"?"🪨":b.key==="workshop"?"⚒":b.key==="market"?"🏪":"🛠",0,-1);
   // functional outdoor props
   if(b.key==="house"){
    if(lv<2){ctx.fillStyle="#d9c39a";ctx.beginPath();ctx.moveTo(-34,22);ctx.lineTo(0,-28);ctx.lineTo(34,22);ctx.closePath();ctx.fill();ctx.strokeStyle="#68452c";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#4a2d1d";ctx.fillRect(-5,4,10,18)}
    else{ctx.fillStyle="#6f4729";ctx.fillRect(28,9,15,13);ctx.strokeStyle="#c58b4a";ctx.strokeRect(28,9,15,13)}
   }else if(b.key==="lumber"){
    ctx.fillStyle="#6b4024";for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-35+i*7,18-(i%2)*3,5,0,TAU);ctx.fill();ctx.strokeStyle="#a66d39";ctx.stroke()}
    ctx.strokeStyle="#55351f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(29,20);ctx.lineTo(39,8);ctx.stroke();ctx.fillStyle="#92999a";ctx.fillRect(35,5,9,6);
   }else if(b.key==="quarry"){
    ctx.fillStyle="#8a8c8d";for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(-34+i*8,18-(i%2)*5,5+(i%2),0,TAU);ctx.fill();ctx.strokeStyle="#c7c9c8";ctx.lineWidth=1;ctx.stroke()}
    ctx.strokeStyle="#5d4127";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,20);ctx.lineTo(41,4);ctx.stroke();ctx.strokeStyle="#b7bdc0";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(35,7);ctx.lineTo(44,14);ctx.stroke();
   }else if(b.key==="workshop"){
    ctx.fillStyle="#5d4027";ctx.fillRect(28,10,16,13);ctx.strokeStyle="#d1a35b";ctx.strokeRect(28,10,16,13);
    ctx.strokeStyle="#704925";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(31,7);ctx.lineTo(42,-5);ctx.stroke();ctx.fillStyle="#929a9c";ctx.fillRect(38,-8,11,7);
   }else{
    ctx.fillStyle="#725432";ctx.fillRect(28,7,15,14);ctx.strokeStyle="#d1a66a";ctx.strokeRect(28,7,15,14);
    ctx.fillStyle="#d7c49b";ctx.fillRect(31,10,9,3);ctx.fillRect(34,7,3,9);
   }
   if(lv>=2){ctx.fillStyle="#e3c36c";ctx.beginPath();ctx.arc(0,-50,3+Math.min(5,lv),0,TAU);ctx.fill()}
  }
  ctx.fillStyle="#ffe08a";ctx.font="bold 10px serif";ctx.textAlign="center";ctx.fillText("★".repeat(lv),0,42);ctx.restore();
 }
}
function drawUnits(){
 for(const u of state.units){
  ctx.save();ctx.translate(u.x,u.y);const auto=u.controlMode==="auto",ready=(u.pendingUpgrades||0)>0,lv=u.expLevel||1,bob=Math.sin(performance.now()*.004+(u.uid||0))*1.15;ctx.translate(0,bob);
  ctx.fillStyle="#06090d99";ctx.beginPath();ctx.ellipse(7,14,21,10,0,0,TAU);ctx.fill();ctx.globalAlpha=.25;ctx.fillStyle=auto?"#4ec982":"#4d9fe8";ctx.beginPath();ctx.arc(0,2,21,0,TAU);ctx.fill();ctx.globalAlpha=1;
  if(ready){ctx.strokeStyle="#63caff";ctx.shadowBlur=22;ctx.shadowColor="#5ac7ff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27+Math.sin(performance.now()*.007)*2,0,TAU);ctx.stroke();ctx.shadowBlur=0}
  if(selected===u){ctx.strokeStyle="#ffe58a";ctx.shadowBlur=16;ctx.shadowColor="#ffe58a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,26,0,TAU);ctx.stroke();ctx.shadowBlur=0}
  const showMoveMarker=Number.isFinite(u.targetX)&&Number.isFinite(u.targetY)&&((u.controlMode==="manual"&&Math.hypot(u.targetX-u.x,u.targetY-u.y)>8)||(u.moveMarkerUntil||0)>performance.now()||unitCommandMode==="move"&&selected===u);
  if(showMoveMarker){ctx.strokeStyle=selected===u?"#ffe58a":"#8fd2ff";ctx.lineWidth=2.5;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(u.targetX-u.x,u.targetY-u.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(u.targetX-u.x,u.targetY-u.y,12,0,TAU);ctx.stroke();ctx.fillStyle="#dff6ff";ctx.beginPath();ctx.arc(u.targetX-u.x,u.targetY-u.y,3.5,0,TAU);ctx.fill()}
  if(!drawUnitSprite(u)){
   ctx.strokeStyle="#46342a";ctx.lineWidth=5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-6,8);ctx.lineTo(-8,18);ctx.moveTo(6,8);ctx.lineTo(8,18);ctx.stroke();ctx.fillStyle="#7b858d";ctx.fillRect(-11,8,7,5);ctx.fillRect(4,8,7,5);ctx.strokeStyle="#171617";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,18);ctx.lineTo(-3,18);ctx.moveTo(5,18);ctx.lineTo(12,18);ctx.stroke();
   ctx.fillStyle=auto?"#295e42":"#263f68";ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(-15,15);ctx.lineTo(0,11);ctx.lineTo(15,15);ctx.lineTo(10,-4);ctx.closePath();ctx.fill();
   const armor=ctx.createLinearGradient(-12,-13,12,13);armor.addColorStop(0,auto?"#8bc29a":"#86b5dc");armor.addColorStop(.42,auto?"#4d8d65":"#527fa8");armor.addColorStop(1,"#273848");ctx.fillStyle=armor;ctx.beginPath();ctx.moveTo(-12,-6);ctx.quadraticCurveTo(-15,6,-10,13);ctx.lineTo(10,13);ctx.quadraticCurveTo(15,6,12,-6);ctx.closePath();ctx.fill();ctx.strokeStyle="#e0edf2";ctx.lineWidth=1.8;ctx.stroke();
   ctx.fillStyle="#afbbc1";ctx.globalAlpha=.72;ctx.fillRect(-9,-3,18,3);ctx.fillRect(-8,2,16,2);ctx.globalAlpha=1;ctx.fillStyle="#78858d";ctx.beginPath();ctx.arc(-11,-4,5,2.8,5.8);ctx.fill();ctx.beginPath();ctx.arc(11,-4,5,3.6,.35);ctx.fill();
   ctx.fillStyle="#3a251b";ctx.fillRect(-12,6,24,4);ctx.fillStyle="#d6ae55";ctx.fillRect(-2,6,4,4);ctx.fillStyle="#5c3a25";ctx.fillRect(-12,8,5,6);ctx.fillRect(7,8,5,6);
   ctx.fillStyle="#d9b48b";ctx.beginPath();ctx.arc(0,-13,7.5,0,TAU);ctx.fill();ctx.fillStyle="#4a3022";ctx.beginPath();ctx.arc(0,-15,7.2,Math.PI,TAU);ctx.fill();ctx.fillStyle="#69757d";ctx.beginPath();ctx.arc(0,-15,8.5,Math.PI,TAU);ctx.lineTo(8,-13);ctx.lineTo(-8,-13);ctx.closePath();ctx.fill();ctx.strokeStyle="#cbd3d6";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-8,-13);ctx.lineTo(8,-13);ctx.stroke();if(lv>=4){ctx.strokeStyle=lv>=8?"#ffd15a":"#c64e46";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-23);ctx.quadraticCurveTo(5,-29,9,-24);ctx.stroke()}
   ctx.fillStyle="#2b211c";ctx.fillRect(-4,-12,2,1.4);ctx.fillRect(2,-12,2,1.4);ctx.strokeStyle="#d3ab82";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-2);ctx.lineTo(-15,5);ctx.moveTo(10,-2);ctx.lineTo(17,-9);ctx.stroke();ctx.fillStyle="#6c4a32";ctx.fillRect(-17,1,5,8);
   ctx.strokeStyle="#7a4c27";ctx.lineWidth=3;ctx.beginPath();ctx.arc(15,-5,11,-1.4,1.4);ctx.stroke();ctx.strokeStyle="#f0dfbd";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(17,-16);ctx.lineTo(17,6);ctx.stroke();ctx.strokeStyle="#d8c18c";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(5,-4);ctx.lineTo(19,-5);ctx.stroke();ctx.fillStyle="#dfe6e8";ctx.beginPath();ctx.moveTo(19,-5);ctx.lineTo(15,-8);ctx.lineTo(16,-3);ctx.closePath();ctx.fill();
   ctx.fillStyle="#5a3824";ctx.fillRect(-16,-5,6,15);ctx.strokeStyle="#c5a46c";ctx.lineWidth=1.5;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-15+k*1.5,-5);ctx.lineTo(-18+k*1.5,-18);ctx.stroke()}
   if(u.key==="guard"){
    ctx.fillStyle="#59636a";ctx.beginPath();ctx.arc(-15,0,12,0,TAU);ctx.fill();ctx.strokeStyle="#d3c28d";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#263039";ctx.beginPath();ctx.arc(-15,0,4,0,TAU);ctx.fill();
    ctx.strokeStyle="#d7dce0";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(10,4);ctx.lineTo(23,-13);ctx.stroke();ctx.fillStyle="#eef2f3";ctx.beginPath();ctx.moveTo(23,-13);ctx.lineTo(18,-10);ctx.lineTo(22,-6);ctx.closePath();ctx.fill();
   }
  }
  ctx.fillStyle="#f2d36f";ctx.beginPath();ctx.arc(0,1,5,0,TAU);ctx.fill();ctx.fillStyle="#3e2d14";ctx.font="bold 7px sans-serif";ctx.textAlign="center";ctx.fillText(String(lv),0,3.5);
  const stats=u.upgradeStats||{},markers=[];if(stats.damage)markers.push("⚔");if(stats.health)markers.push("♥");if(stats.speed)markers.push("➤");if(stats.rate)markers.push("✦");markers.forEach((m,i)=>{const mx=(i-(markers.length-1)/2)*8;ctx.fillStyle="#13263a";ctx.beginPath();ctx.arc(mx,24,5.5,0,TAU);ctx.fill();ctx.fillStyle="#bfe8ff";ctx.font="bold 6px sans-serif";ctx.fillText(m,mx,26)});
  ctx.fillStyle="#130b0b";ctx.fillRect(-21,-33,42,7);ctx.fillStyle="#69c468";ctx.fillRect(-20,-32,40*Math.max(0,u.hp/u.maxHp),5);ctx.strokeStyle="#e5d9c844";ctx.strokeRect(-21,-33,42,7);const xpRatio=Math.max(0,Math.min(1,(u.xp||0)/(u.xpMax||65)));ctx.fillStyle="#07101e";ctx.fillRect(-21,-24,42,6);ctx.fillStyle=ready?"#69d0ff":"#348de4";ctx.fillRect(-20,-23,40*xpRatio,4);ctx.strokeStyle="#a7dfff55";ctx.strokeRect(-21,-24,42,6);if(ready){ctx.fillStyle="#dff7ff";ctx.font="bold 10px sans-serif";ctx.fillText("▲",0,-36)}ctx.restore();
 }
}

function isUnitMoving(unit){
 const previous=unitMotionStates.get(unit);
 const moving=!!previous&&Math.hypot(unit.x-previous.x,unit.y-previous.y)>.01;
 unitMotionStates.set(unit,{x:unit.x,y:unit.y});
 return moving;
}

function drawUnitSprite(unit){
 const sprite=unitSprites[unit.key];
 if(!sprite)return false;
 const moving=isUnitMoving(unit);
 const image=moving?sprite.walk[Math.floor(performance.now()/180)%sprite.walk.length]:sprite.idle;
 if(!image||!image.complete||!image.naturalWidth)return false;
 const {width,height,offsetY=0}=sprite.def;
 ctx.drawImage(image,-width/2,-height/2+offsetY,width,height);
 return true;
}
function drawCraftsmen(){
 for(const c of state.craftsmen){ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle="#0007";ctx.beginPath();ctx.ellipse(3,9,10,5,0,0,TAU);ctx.fill();ctx.fillStyle="#d9b184";ctx.beginPath();ctx.arc(0,-5,5,0,TAU);ctx.fill();ctx.fillStyle="#c69b36";ctx.fillRect(-6,-10,12,3);ctx.fillStyle="#4f6f89";ctx.fillRect(-6,0,12,12);ctx.strokeStyle="#6e4928";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(5,3);ctx.lineTo(11,-6);ctx.stroke();ctx.fillStyle="#b9bec0";ctx.fillRect(8,-9,8,5);ctx.restore()}
}

function getEnemyVisualProfile(enemy){
 const base={
  bodyTop:enemy.color||"#7b342d",
  bodyMid:enemy.color||"#7b342d",
  bodyBottom:"#211517",
  trim:"#d4b36e",
  metal:"#879196",
  leather:"#533629",
  cloth:"#5d4638",
  fur:"#8d7d69",
  skin:"#d2a27d",
  eyes:"#f1d06a",
  shoulder:1,
  weapon:"axe",
  shield:false,
  helm:"horned",
  beard:"#4a2f24",
  aura:null,
  cape:false,
  auraAlpha:.12,
  bodyWidth:1,
  bodyHeight:1,
  headScale:1,
  badge:"diamond",
  hornColor:"#eee4d2",
  banner:false,
  bannerColor:"#6d1f22",
  bannerTrim:"#d4b36e",
  eyeGlow:null,
  weaponScale:1,
  pauldronSpikes:false,
  crestColor:null
 };
 switch(enemy.type){
  case "runner":
   return {...base,bodyTop:"#b4693c",bodyMid:"#7c4728",bodyBottom:"#1f1415",trim:"#d4a054",metal:"#9eaab0",leather:"#6e4428",cloth:"#4c3b30",fur:"#685743",shoulder:.72,weapon:"dagger",helm:"hood",headScale:.92,bodyWidth:.88,bodyHeight:.9,badge:"strap",beard:"#533425"};
  case "spear":
   return {...base,bodyTop:"#69804e",bodyMid:"#4f6340",bodyBottom:"#1c2220",trim:"#d9cb8b",metal:"#b7c0c5",leather:"#6f492d",cloth:"#5b4a3d",fur:"#89755f",shoulder:1.02,weapon:"spear",helm:"crest",badge:"chevron",beard:"#4d3428"};
  case "shield":
   return {...base,bodyTop:"#657483",bodyMid:"#45525e",bodyBottom:"#151a1e",trim:"#d8c797",metal:"#c6ced2",leather:"#654329",cloth:"#51443a",fur:"#a69884",shoulder:1.22,weapon:"mace",shield:"tower",helm:"full",bodyWidth:1.08,bodyHeight:1.08,badge:"rivet",beard:"#40302a",aura:"#8ea7ba",auraAlpha:.15,banner:"split",bannerColor:"#465c72",bannerTrim:"#d8c797",eyeGlow:"#9dd7ff",weaponScale:1.08,pauldronSpikes:true,crestColor:"#d8c797"};
  case "berserker":
   return {...base,bodyTop:"#9d3a34",bodyMid:"#6f2322",bodyBottom:"#1b0f12",trim:"#f0b35c",metal:"#d4d8da",leather:"#6a3d27",cloth:"#5d2220",fur:"#8b5f4f",shoulder:1.05,weapon:"dualAxes",helm:"wild",bodyWidth:1.03,bodyHeight:.96,badge:"paint",beard:"#74211f",aura:"#c5342e",auraAlpha:.18,eyeGlow:"#ff7d63",weaponScale:1.12,pauldronSpikes:true,crestColor:"#e85f54"};
  case "boss":
   return {...base,bodyTop:"#5e3437",bodyMid:"#342022",bodyBottom:"#120b0d",trim:"#e1b85b",metal:"#d0d6d9",leather:"#643f2a",cloth:"#6f2424",fur:"#d2c1a1",shoulder:1.28,weapon:"greatAxe",shield:false,helm:"crown",bodyWidth:1.14,bodyHeight:1.14,headScale:1.08,badge:"crown",beard:"#6a352a",aura:"#ce9540",cape:true,auraAlpha:.26,banner:"war",bannerColor:"#5c1718",bannerTrim:"#e1b85b",eyeGlow:"#ffd36f",weaponScale:1.2,pauldronSpikes:true,crestColor:"#f3c96e"};
  default:
   return {...base,bodyTop:"#9b5b44",bodyMid:enemy.color||"#7b342d",bodyBottom:"#201416",trim:"#d3b06f",metal:"#9ea8ac",leather:"#6a4129",cloth:"#574234",fur:"#8f7a63",shoulder:.98,weapon:"axe",helm:"horned",badge:"diamond",beard:"#533326"};
 }
}

function drawEnemies(){
 const now=performance.now()*.006;
 for(const e of state.enemies){
  ctx.save();
  ctx.translate(e.x,e.y);
  const stride=Math.sin(now+(e.animSeed||0))*1.5;
  const visualClass=e.visualClass||(e.type==="boss"?"boss":["shield","berserker"].includes(e.type)?"special":"normal");
  const fallbackScale=visualClass==="boss"?1.5:visualClass==="special"?1.18:1;
  const visualScale=Number.isFinite(e.visualScale)?e.visualScale:fallbackScale;
  const isSpecial=visualClass==="special",isBoss=visualClass==="boss";
  const style=getEnemyVisualProfile(e);
  const r=e.radius;
  ctx.scale(visualScale,visualScale);
  ctx.translate(0,stride*.22);

  const auraRadius=r*(isBoss?1.7:isSpecial?1.45:1.2);
  ctx.fillStyle="#05060788";
  ctx.beginPath();ctx.ellipse(6,12,r*(isBoss?1.62:isSpecial?1.46:1.34),r*(isBoss?.78:isSpecial?.72:.66),0,0,TAU);ctx.fill();
  if(style.aura){
   ctx.globalAlpha=style.auraAlpha;
   ctx.fillStyle=style.aura;
   ctx.beginPath();ctx.arc(0,-r*.05,auraRadius+Math.sin(now+(e.animSeed||0))*2,0,TAU);ctx.fill();
   ctx.globalAlpha=1;
  }

  if(style.banner){
   ctx.strokeStyle="#4b2e23";
   ctx.lineWidth=2.6;
   ctx.beginPath();
   ctx.moveTo(-r*.18,-r*.52);
   ctx.lineTo(-r*.18,-r*1.55);
   ctx.stroke();
   ctx.fillStyle=style.bannerColor;
   ctx.beginPath();
   if(style.banner==="split"){
    ctx.moveTo(-r*.18,-r*1.5);
    ctx.lineTo(r*.52,-r*1.42);
    ctx.lineTo(r*.14,-r*.94);
    ctx.lineTo(r*.36,-r*.74);
    ctx.lineTo(-r*.18,-r*.86);
   }else{
    ctx.moveTo(-r*.18,-r*1.54);
    ctx.lineTo(r*.72,-r*1.4);
    ctx.lineTo(r*.2,-r*.74);
    ctx.lineTo(r*.48,-r*.56);
    ctx.lineTo(-r*.18,-r*.66);
   }
   ctx.closePath();
   ctx.fill();
   ctx.strokeStyle=style.bannerTrim;
   ctx.lineWidth=1.3;
   ctx.stroke();
   ctx.fillStyle=style.bannerTrim;
   ctx.fillRect(-r*.26,-r*1.62,r*.16,r*.12);
  }

  if(style.cape){
   const cape=ctx.createLinearGradient(-r,0,r,0);cape.addColorStop(0,"#421216");cape.addColorStop(.5,"#8b2726");cape.addColorStop(1,"#351015");
   ctx.fillStyle=cape;ctx.beginPath();ctx.moveTo(-r*.55,-r*.2);ctx.lineTo(-r*.98,r*.82);ctx.lineTo(0,r*.62);ctx.lineTo(r*.98,r*.82);ctx.lineTo(r*.55,-r*.2);ctx.closePath();ctx.fill();
   ctx.strokeStyle=style.trim;ctx.lineWidth=1.4;ctx.stroke();
  }

  // Beine und Unterkörper
  ctx.strokeStyle="#3b281f";
  ctx.lineWidth=Math.max(3,r*.28);
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(-r*.28,r*.44);
  ctx.lineTo(-r*.42,r*.98+stride);
  ctx.moveTo(r*.28,r*.44);
  ctx.lineTo(r*.42,r*.98-stride);
  ctx.stroke();
  ctx.strokeStyle="#171719";
  ctx.lineWidth=Math.max(3,r*.22);
  ctx.beginPath();
  ctx.moveTo(-r*.5,r*.98+stride);ctx.lineTo(-r*.16,r*.98+stride);
  ctx.moveTo(r*.18,r*.98-stride);ctx.lineTo(r*.57,r*.98-stride);
  ctx.stroke();
  ctx.fillStyle=style.cloth;
  ctx.beginPath();
  ctx.moveTo(-r*.74,r*.12);
  ctx.lineTo(r*.74,r*.12);
  ctx.lineTo(r*.5,r*.68);
  ctx.lineTo(-r*.5,r*.68);
  ctx.closePath();
  ctx.fill();

  // Torso
  const bodyGrad=ctx.createLinearGradient(-r,-r,r,r);
  bodyGrad.addColorStop(0,style.bodyTop);
  bodyGrad.addColorStop(.48,style.bodyMid);
  bodyGrad.addColorStop(1,style.bodyBottom);
  ctx.fillStyle=bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-r*.72*style.bodyWidth,-r*.54,r*1.44*style.bodyWidth,r*1.28*style.bodyHeight,r*.32);
  ctx.fill();
  ctx.strokeStyle="#221819";
  ctx.lineWidth=2.2;
  ctx.stroke();

  // Schulterfell und Schulterplatten
  for(const side of [-1,1]){
   ctx.fillStyle=style.fur;
   ctx.beginPath();ctx.arc(side*r*.62,-r*.34,r*.28*style.shoulder,0,TAU);ctx.fill();
   ctx.fillStyle=style.metal;
   ctx.beginPath();ctx.ellipse(side*r*.53,-r*.18,r*.18*style.shoulder,r*.12*style.shoulder,side*.28,0,TAU);ctx.fill();
   ctx.strokeStyle="#d9dee0";ctx.lineWidth=1;ctx.stroke();
   if(style.pauldronSpikes){
    ctx.fillStyle=style.trim;
    ctx.beginPath();ctx.moveTo(side*r*.42,-r*.34);ctx.lineTo(side*r*.58,-r*.62);ctx.lineTo(side*r*.66,-r*.3);ctx.closePath();ctx.fill();
   }
  }

  // Emblem / Brustdetail
  if(style.badge==="diamond"){
   ctx.fillStyle="#262b30";
   ctx.beginPath();ctx.moveTo(0,-r*.24);ctx.lineTo(r*.28,r*.06);ctx.lineTo(0,r*.36);ctx.lineTo(-r*.28,r*.06);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#adb4b7";ctx.lineWidth=1;ctx.stroke();
  }else if(style.badge==="chevron"){
   ctx.strokeStyle=style.trim;ctx.lineWidth=2.2;
   ctx.beginPath();ctx.moveTo(-r*.25,-r*.06);ctx.lineTo(0,r*.18);ctx.lineTo(r*.25,-r*.06);ctx.stroke();
  }else if(style.badge==="strap"){
   ctx.strokeStyle="#d7c18e";ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(-r*.42,-r*.26);ctx.lineTo(r*.26,r*.42);ctx.stroke();
   ctx.fillStyle="#70512d";ctx.beginPath();ctx.arc(-r*.08,r*.1,r*.08,0,TAU);ctx.fill();
  }else if(style.badge==="rivet"){
   ctx.fillStyle="#1f262b";ctx.fillRect(-r*.18,-r*.12,r*.36,r*.34);
   ctx.fillStyle="#d4b56c";for(const ox of [-1,1])for(const oy of [-1,1]){ctx.beginPath();ctx.arc(ox*r*.1,oy*r*.08+.03*r,r*.03,0,TAU);ctx.fill();}
  }else if(style.badge==="paint"){
   ctx.strokeStyle="#ebc6bd";ctx.lineWidth=2.3;
   ctx.beginPath();ctx.moveTo(-r*.2,-r*.14);ctx.lineTo(-r*.03,r*.2);ctx.moveTo(r*.2,-r*.14);ctx.lineTo(r*.03,r*.2);ctx.stroke();
  }else if(style.badge==="crown"){
   ctx.fillStyle="#2c2224";ctx.fillRect(-r*.22,-r*.1,r*.44,r*.38);
   ctx.fillStyle=style.trim;for(const ox of [-1,0,1])ctx.fillRect(ox*r*.11-r*.03,-r*.18,r*.06,r*.12);
  }

  // Kopf
  ctx.fillStyle=style.skin;
  ctx.beginPath();ctx.arc(0,-r*.72,Math.max(4,r*.38*style.headScale),0,TAU);ctx.fill();
  if(style.helm==="hood"){
   ctx.fillStyle="#6b4a2f";
   ctx.beginPath();ctx.arc(0,-r*.8,r*.45,Math.PI,TAU);ctx.lineTo(r*.26,-r*.46);ctx.lineTo(-r*.26,-r*.46);ctx.closePath();ctx.fill();
   ctx.fillStyle="#8a653f";ctx.beginPath();ctx.arc(0,-r*.8,r*.28,Math.PI,TAU);ctx.fill();
  }else if(style.helm==="crest"){
   ctx.fillStyle="#394249";
   ctx.beginPath();ctx.arc(0,-r*.82,r*.44,Math.PI,TAU);ctx.lineTo(r*.44,-r*.62);ctx.lineTo(-r*.44,-r*.62);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#c3cacf";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-r*1.2);ctx.lineTo(0,-r*.55);ctx.stroke();
   ctx.fillStyle="#d7cb8b";ctx.fillRect(-1.2,-r*1.16,2.4,r*.24);
  }else if(style.helm==="full"){
   ctx.fillStyle="#48535c";
   ctx.beginPath();ctx.arc(0,-r*.8,r*.48,Math.PI,TAU);ctx.lineTo(r*.38,-r*.36);ctx.lineTo(-r*.38,-r*.36);ctx.closePath();ctx.fill();
   ctx.fillStyle="#262d33";ctx.fillRect(-r*.28,-r*.76,r*.56,r*.18);
   ctx.strokeStyle="#c2c9cc";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-r*1.16);ctx.lineTo(0,-r*.35);ctx.stroke();
   if(style.crestColor){ctx.fillStyle=style.crestColor;ctx.fillRect(-r*.06,-r*1.14,r*.12,r*.16);}
  }else if(style.helm==="wild"){
   ctx.fillStyle="#6b1f1c";
   ctx.beginPath();ctx.arc(0,-r*.95,r*.28,Math.PI,TAU);ctx.lineTo(r*.28,-r*.75);ctx.lineTo(-r*.28,-r*.75);ctx.closePath();ctx.fill();
   ctx.fillStyle="#3b2a2d";ctx.beginPath();ctx.arc(0,-r*.78,r*.32,Math.PI,TAU);ctx.fill();
   if(style.crestColor){ctx.strokeStyle=style.crestColor;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(0,-r*1.08);ctx.lineTo(0,-r*.78);ctx.stroke();}
  }else if(style.helm==="crown"){
   ctx.fillStyle="#42484e";
   ctx.beginPath();ctx.arc(0,-r*.8,r*.49,Math.PI,TAU);ctx.lineTo(r*.46,-r*.58);ctx.lineTo(-r*.46,-r*.58);ctx.closePath();ctx.fill();
   ctx.fillStyle=style.trim;for(let k=-2;k<=2;k++)ctx.fillRect(k*r*.1-r*.03,-r*1.2,r*.06,r*.18-(Math.abs(k)%2)*r*.04);
   if(style.crestColor){ctx.strokeStyle=style.crestColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-r*1.24);ctx.lineTo(0,-r*.98);ctx.stroke();}
  }else{
   ctx.fillStyle="#343c41";
   ctx.beginPath();ctx.arc(0,-r*.82,r*.43,Math.PI,TAU);ctx.lineTo(r*.43,-r*.62);ctx.lineTo(-r*.43,-r*.62);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#bac0c3";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-r*1.18);ctx.lineTo(0,-r*.55);ctx.stroke();
   ctx.fillStyle=style.hornColor;
   ctx.beginPath();ctx.moveTo(-r*.34,-r*.95);ctx.lineTo(-r*.65,-r*1.16);ctx.lineTo(-r*.48,-r*.82);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(r*.34,-r*.95);ctx.lineTo(r*.65,-r*1.16);ctx.lineTo(r*.48,-r*.82);ctx.closePath();ctx.fill();
  }

  // Gesicht
  ctx.fillStyle=style.beard;
  if(e.type==="runner"){
   ctx.beginPath();ctx.moveTo(-r*.18,-r*.66);ctx.lineTo(0,-r*.48);ctx.lineTo(r*.18,-r*.66);ctx.closePath();ctx.fill();
  }else if(e.type==="berserker"){
   ctx.beginPath();ctx.moveTo(-r*.26,-r*.58);ctx.lineTo(0,-r*.18);ctx.lineTo(r*.26,-r*.58);ctx.closePath();ctx.fill();
  }else{
   ctx.beginPath();ctx.moveTo(-r*.28,-r*.62);ctx.lineTo(0,-r*.28);ctx.lineTo(r*.28,-r*.62);ctx.closePath();ctx.fill();
  }
  if(style.eyeGlow){
   ctx.fillStyle=style.eyeGlow;
   ctx.globalAlpha=.28;
   ctx.beginPath();ctx.arc(-r*.17,-r*.79,r*.09,0,TAU);ctx.fill();
   ctx.beginPath();ctx.arc(r*.18,-r*.79,r*.09,0,TAU);ctx.fill();
   ctx.globalAlpha=1;
  }
  ctx.fillStyle=style.eyeGlow||style.eyes;
  ctx.fillRect(-r*.2,-r*.8,2,2);
  ctx.fillRect(r*.15,-r*.8,2,2);
  if(e.type==="berserker"){
   ctx.strokeStyle="#f0a79d";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-r*.28,-r*.86);ctx.lineTo(-r*.08,-r*.9);ctx.moveTo(r*.08,-r*.9);ctx.lineTo(r*.28,-r*.86);ctx.stroke();
  }

  // Arme
  ctx.strokeStyle=style.skin;
  ctx.lineWidth=Math.max(3,r*.19);
  ctx.beginPath();
  ctx.moveTo(-r*.68,-r*.08);ctx.lineTo(-r*.98,r*.34);
  ctx.moveTo(r*.68,-r*.08);ctx.lineTo(r*.98,r*.18);
  ctx.stroke();

  // Waffen und eindeutige Ausrüstung pro Typ
  const ws=style.weaponScale||1;
  if(style.shield==="tower"){
   ctx.fillStyle="#4a5862";
   ctx.beginPath();ctx.moveTo(-r*.5,-r*.36);ctx.quadraticCurveTo(-r*1.4,0,-r*.62,r*.84);ctx.quadraticCurveTo(-r*.04,r*.42,-r*.5,-r*.36);ctx.fill();
   ctx.strokeStyle="#c5cdcf";ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle="#293037";ctx.beginPath();ctx.arc(-r*.73,r*.06,r*.16,0,TAU);ctx.fill();
   ctx.strokeStyle="#5f3f28";ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(r*.22,r*.46);ctx.lineTo(r*(.75+.2*ws),-r*(.38+.12*ws));ctx.stroke();
   ctx.fillStyle="#cdd2d5";ctx.beginPath();ctx.arc(r*.98,-r*.55,r*.12,0,TAU);ctx.fill();
  }else if(style.weapon==="dagger"){
   ctx.strokeStyle=style.leather;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.18,r*.08);ctx.lineTo(-r*(.58+.24*ws),r*(.48+.28*ws));ctx.stroke();
   ctx.fillStyle="#d0d5d7";ctx.beginPath();ctx.moveTo(-r*(.58+.24*ws),r*(.48+.28*ws));ctx.lineTo(-r*(.38+.18*ws),r*(.42+.24*ws));ctx.lineTo(-r*(.5+.16*ws),r*(.24+.2*ws));ctx.closePath();ctx.fill();
   ctx.strokeStyle="#b79d6c";ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(r*.48,-r*.18);ctx.lineTo(r*(.72+.26*ws),-r*(.5+.32*ws));ctx.stroke();
  }else if(style.weapon==="spear"){
   ctx.strokeStyle=style.leather;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(r*.15,r*.54);ctx.lineTo(r*(.95+.27*ws),-r*(.86+.3*ws));ctx.stroke();
   ctx.fillStyle="#cad1d3";ctx.beginPath();ctx.moveTo(r*(.95+.27*ws),-r*(.86+.3*ws));ctx.lineTo(r*(.7+.23*ws),-r*(.72+.24*ws));ctx.lineTo(r*(.9+.26*ws),-r*(.52+.24*ws));ctx.closePath();ctx.fill();
  }else if(style.weapon==="dualAxes"){
   for(const dir of [-1,1]){
    ctx.strokeStyle=style.leather;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(dir*r*.26,r*.18);ctx.lineTo(dir*r*(.7+.26*ws),-r*(.38+.24*ws));ctx.stroke();
    ctx.fillStyle="#d8dcde";ctx.beginPath();ctx.moveTo(dir*r*(.7+.26*ws),-r*(.38+.24*ws));ctx.lineTo(dir*r*(.44+.18*ws),-r*(.34+.21*ws));ctx.lineTo(dir*r*(.62+.22*ws),-r*(.12+.13*ws));ctx.closePath();ctx.fill();
   }
   ctx.strokeStyle="#c83530";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+4,0,TAU);ctx.stroke();
   ctx.fillStyle="#b92622";ctx.fillRect(-r*.72,-2,r*1.44,4);
  }else if(style.weapon==="greatAxe"){
   ctx.strokeStyle=style.leather;ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(r*.2,r*.5);ctx.lineTo(r*(.78+.34*ws),-r*(.48+.34*ws));ctx.stroke();
   ctx.fillStyle=style.trim;ctx.beginPath();ctx.moveTo(r*(.78+.34*ws),-r*(.48+.34*ws));ctx.lineTo(r*(.48+.2*ws),-r*(.44+.28*ws));ctx.lineTo(r*(.7+.24*ws),-r*(.12+.18*ws));ctx.closePath();ctx.fill();
   ctx.fillStyle="#8b1f20";ctx.beginPath();ctx.moveTo(-r*.82,-r*.18);ctx.lineTo(-r*1.3,r*.92);ctx.lineTo(0,r*.66);ctx.closePath();ctx.fill();
   ctx.strokeStyle=style.trim;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+6,0,TAU);ctx.stroke();
  }else if(style.weapon==="mace"){
   ctx.strokeStyle=style.leather;ctx.lineWidth=3.1;ctx.beginPath();ctx.moveTo(r*.18,r*.5);ctx.lineTo(r*(.62+.24*ws),-r*(.22+.2*ws));ctx.stroke();
   ctx.fillStyle="#c7cdcf";ctx.beginPath();ctx.arc(r*(.78+.18*ws),-r*(.43+.12*ws),r*(.08+.04*ws),0,TAU);ctx.fill();
  }else{
   ctx.strokeStyle=style.leather;ctx.lineWidth=Math.max(3,r*.22);ctx.beginPath();ctx.moveTo(r*.28,r*.18);ctx.lineTo(r*1.06,-r*.68);ctx.stroke();
   ctx.fillStyle="#b8bfc2";ctx.beginPath();ctx.moveTo(r*1.06,-r*.68);ctx.lineTo(r*.68,-r*.61);ctx.lineTo(r*.9,-r*.3);ctx.closePath();ctx.fill();
  }

  // Lebensleiste und Namensanzeige
  const barHeight=isBoss?10:isSpecial?8:7;
  const barGap=isBoss?23:isSpecial?21:19;
  const bw=Math.max(isBoss?50:isSpecial?42:34,r*(isBoss?3.05:isSpecial?2.9:2.75));
  ctx.fillStyle="#160b0b";ctx.fillRect(-bw/2,-r-barGap,bw,barHeight);
  ctx.fillStyle=e.hp/e.maxHp>.5?"#6ac265":e.hp/e.maxHp>.25?"#d4a541":"#d14945";
  ctx.fillRect(-bw/2+1,-r-barGap+1,(bw-2)*Math.max(0,e.hp/e.maxHp),barHeight-2);
  ctx.strokeStyle=isBoss?"#f0c56a99":isSpecial?"#c9d9df77":"#f5dfca55";ctx.strokeRect(-bw/2,-r-barGap,bw,barHeight);
  if(isBoss){ctx.fillStyle="#d8ac45";ctx.fillRect(-bw/2,-r-barGap-3,bw,2)}
  if(zoom>=.58||isBoss){
   ctx.fillStyle="#f2dfba";ctx.font=`bold ${isBoss?11:isSpecial?9:8}px system-ui`;ctx.textAlign="center";
   ctx.fillText(e.name||"Eisenclan",0,-r-barGap-5);
  }
  ctx.restore();
 }
}

function draw(){
 ctx.clearRect(0,0,vw,vh);
 // Bei starkem Herauszoomen bleibt der Bereich außerhalb der Welt grün statt schwarz.
 ctx.fillStyle="#1d3525";ctx.fillRect(0,0,vw,vh);
 ctx.save();ctx.translate(vw/2,vh/2);ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);
 drawGround();drawPaths();drawWorldDetails();drawSiegeCamps();drawCastle();drawFutureFortressLayout();drawSlots();drawRangeIndicators();drawBuildings();drawUnits();drawCraftsmen();
 for(const p of state.projectiles){ctx.save();ctx.translate(p.x,p.y);const t=p.target,ang=t?Math.atan2(t.y-p.y,t.x-p.x):0;ctx.rotate(ang);ctx.shadowBlur=14;ctx.shadowColor=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(2,p.radius*.7);ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(5,0);ctx.stroke();ctx.fillStyle="#eef6f8";ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(1,-3);ctx.lineTo(1,3);ctx.closePath();ctx.fill();ctx.restore()}
 drawEnemies();for(const p of state.particles){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.restore();
 const vg=ctx.createRadialGradient(vw*.5,vh*.45,Math.min(vw,vh)*.12,vw*.5,vh*.5,Math.max(vw,vh)*.72);vg.addColorStop(0,"#00000000");vg.addColorStop(.72,"#00000010");vg.addColorStop(1,"#00000068");ctx.fillStyle=vg;ctx.fillRect(0,0,vw,vh);
 if(paused&&!gameOver&&!state.repairActive)overlay("PAUSE","Tippe auf Weiter");if(gameOver)overlay("DIE BURG IST GEFALLEN",`Welle ${state.wave} · ${state.kills} Gegner · R zum Neustart`);
}

function overlay(a, b) {
  ctx.fillStyle = "#0009";
  ctx.fillRect(0, 0, vw, vh);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff0bd";
  ctx.font = `bold ${Math.max(27, Math.min(48, vw / 12))}px system-ui`;
  ctx.fillText(a, vw / 2, vh / 2 - 10);
  ctx.fillStyle = "#fff";
  ctx.font = "18px system-ui";
  ctx.fillText(b, vw / 2, vh / 2 + 28);
}
