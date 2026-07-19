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
 for(const [x,y] of [[CX,0],[WORLD_W,CY],[CX,WORLD_H],[0,CY]]){
  ctx.strokeStyle="#2b241a88";ctx.lineWidth=82;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.stroke();
  const pg=ctx.createLinearGradient(x,y,CX,CY);pg.addColorStop(0,"#806e4e");pg.addColorStop(.5,"#b19a68");pg.addColorStop(1,"#8c7651");
  ctx.strokeStyle=pg;ctx.lineWidth=66;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.stroke();
  ctx.strokeStyle="#d7c79a44";ctx.lineWidth=48;ctx.setLineDash([8,16]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(CX,CY);ctx.stroke();ctx.setLineDash([]);
 }
 ctx.restore();
}
function drawWorldDetails(){
 ctx.save();
 // Felsen und Blumen
 for(let i=0;i<125;i++){
  const x=(i*241+67)%WORLD_W,y=(i*173+101)%WORLD_H;
  if(Math.hypot(x-CX,y-CY)<WALL_R+55)continue;
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
  const a=(i*2.399963)%TAU,r=WALL_R+110+((i*137)%520);
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
 // Palisade
 for(const w of state.walls){
  const ratio=w.hp/w.maxHp,alive=w.hp>0;
  ctx.lineCap="round";
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
  if(ratio<.999){
   const bx=CX+Math.cos(w.am)*(WALL_R+32),by=CY+Math.sin(w.am)*(WALL_R+32),bw=42;
   ctx.fillStyle="#0e0908dd";ctx.fillRect(bx-bw/2,by-4,bw,7);
   ctx.fillStyle=ratio>.5?"#64bd60":ratio>.25?"#d2a13e":"#d14a43";ctx.fillRect(bx-bw/2+1,by-3,(bw-2)*Math.max(0,ratio),5);
  }
 }
 // vier Torhäuser
 for(const a of [-Math.PI/2,0,Math.PI/2,Math.PI])drawGatehouse(a);
 // acht Wachtürme an der Palisade
 for(let i=0;i<8;i++){
  const a=i/8*TAU+TAU/16,x=CX+Math.cos(a)*(WALL_R-3),y=CY+Math.sin(a)*(WALL_R-3);
  ctx.save();ctx.translate(x,y);ctx.fillStyle="#15100d77";ctx.beginPath();ctx.ellipse(6,8,24,12,0,0,TAU);ctx.fill();
  ctx.fillStyle="#654024";ctx.fillRect(-15,-10,30,28);ctx.fillStyle="#8b5a30";
  for(let k=-1;k<=1;k++)ctx.fillRect(k*10-4,-17,8,10);
  ctx.fillStyle="#183e68";ctx.beginPath();ctx.moveTo(-20,-10);ctx.lineTo(0,-27);ctx.lineTo(20,-10);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#d4b269";ctx.lineWidth=2;ctx.stroke();ctx.restore();
 }
 // Hauptburg, massiver und detaillierter
 ctx.fillStyle="#11141777";ctx.fillRect(CX-77,CY-65,164,150);
 const stone=ctx.createLinearGradient(CX-80,CY-80,CX+80,CY+85);
 stone.addColorStop(0,"#8f999b");stone.addColorStop(.55,"#596468");stone.addColorStop(1,"#353f43");
 ctx.fillStyle=stone;ctx.fillRect(CX-66,CY-61,132,126);
 ctx.strokeStyle="#222a2d";ctx.lineWidth=7;ctx.strokeRect(CX-66,CY-61,132,126);
 // zentrale Dachfläche
 ctx.fillStyle="#183e70";ctx.beginPath();ctx.moveTo(CX-71,CY-58);ctx.lineTo(CX,CY-94);ctx.lineTo(CX+71,CY-58);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#d4b15d";ctx.lineWidth=2;ctx.stroke();
 // Ecktürme
 for(const [ox,oy] of [[-58,-51],[58,-51],[-58,51],[58,51]]){
  ctx.fillStyle="#697579";ctx.fillRect(CX+ox-18,CY+oy-18,36,36);
  ctx.fillStyle="#173b67";ctx.beginPath();ctx.moveTo(CX+ox-23,CY+oy-18);ctx.lineTo(CX+ox,CY+oy-38);ctx.lineTo(CX+ox+23,CY+oy-18);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#cfad62";ctx.lineWidth=1.5;ctx.stroke();
 }
 // Steinfugen
 ctx.strokeStyle="#b7c0bd33";ctx.lineWidth=1.5;
 for(let y=-42;y<55;y+=19){ctx.beginPath();ctx.moveTo(CX-61,CY+y);ctx.lineTo(CX+61,CY+y);ctx.stroke()}
 // Tor
 ctx.fillStyle="#221810";ctx.fillRect(CX-14,CY+22,28,43);
 ctx.strokeStyle="#a47742";ctx.lineWidth=2;ctx.strokeRect(CX-14,CY+22,28,43);
 ctx.fillStyle="#d5a84f";ctx.beginPath();ctx.arc(CX+6,CY+44,2.4,0,TAU);ctx.fill();
 // Fahne
 ctx.strokeStyle="#3b291e";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(CX,CY-110);ctx.lineTo(CX,CY-72);ctx.stroke();
 ctx.fillStyle="#174a82";ctx.beginPath();ctx.moveTo(CX,CY-108);ctx.lineTo(CX+35,CY-98);ctx.lineTo(CX,CY-86);ctx.closePath();ctx.fill();
 ctx.fillStyle="#e2c56d";ctx.font="bold 12px serif";ctx.textAlign="center";ctx.fillText("♜",CX+13,CY-95);
 // Sichtbarer Lebensbalken der Hauptburg
 const castleHpRatio=Math.max(0,Math.min(1,state.hp/state.maxHp));
 const castleBarY=CY-142,castleBarW=156;
 ctx.fillStyle="#10100fe8";ctx.fillRect(CX-castleBarW/2-2,castleBarY-2,castleBarW+4,17);
 ctx.fillStyle=castleHpRatio>.60?"#66c161":castleHpRatio>.30?"#d4a341":"#d54b45";
 ctx.fillRect(CX-castleBarW/2,castleBarY,castleBarW*castleHpRatio,13);
 ctx.strokeStyle="#f3e5cfbb";ctx.lineWidth=1.5;ctx.strokeRect(CX-castleBarW/2-2,castleBarY-2,castleBarW+4,17);
 ctx.fillStyle="#fff8e8";ctx.font="bold 10px system-ui";ctx.textAlign="center";
 ctx.fillText(`BURG ${Math.ceil(state.hp)} / ${state.maxHp}`,CX,castleBarY+10);
 // Brunnen, Kisten, Fässer und kleine Figuren
 ctx.fillStyle="#596467";ctx.beginPath();ctx.arc(CX-105,CY+82,21,0,TAU);ctx.fill();ctx.strokeStyle="#b9c2bd";ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle="#2d586e";ctx.beginPath();ctx.arc(CX-105,CY+82,12,0,TAU);ctx.fill();
 for(const [ox,oy] of [[108,70],[126,80],[-128,-62]]){ctx.fillStyle="#744a29";ctx.fillRect(CX+ox-9,CY+oy-7,18,14);ctx.strokeStyle="#bd8748";ctx.lineWidth=2;ctx.strokeRect(CX+ox-9,CY+oy-7,18,14)}
 for(const [ox,oy] of [[95,-80],[-95,102]]){ctx.fillStyle="#5a3824";ctx.beginPath();ctx.ellipse(CX+ox,CY+oy,8,12,0,0,TAU);ctx.fill();ctx.strokeStyle="#aa7944";ctx.stroke()}
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
  const c=BUILD[buildMode],valid=c&&((c.kind==="tower"&&(s.type==="wall"||s.type==="castle"))||(c.kind==="inside"&&s.type==="inside"));
  if(!valid)continue;
  ctx.save();
  const pulse=.72+Math.sin(performance.now()*.006+s.x*.01)*.18;
  ctx.globalAlpha=pulse;ctx.shadowBlur=20;ctx.shadowColor="#ffe38a";
  ctx.fillStyle="#c39b4266";ctx.strokeStyle="#ffe9a2";ctx.lineWidth=3;
  const slotRadius=s.type==="castle"?20:s.type==="wall"?24:31;
  ctx.beginPath();ctx.arc(s.x,s.y,slotRadius,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fff3c277";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,Math.max(12,slotRadius-9),0,TAU);ctx.stroke();
  ctx.restore();
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
  else if(selected&&selected.kind==="building"&&selected.base.kind==="tower"&&selected.hp>0)drawRangeCircle(selected.slot.x,selected.slot.y,selected.range,"#72bfff");
  return;
 }
 for(const b of state.buildings){
  if(b.base.kind==="tower"&&b.hp>0)drawRangeCircle(b.slot.x,b.slot.y,b.range,b.key==="catapult"?"#c9a1ff":"#72bfff");
 }
 for(const u of state.units){
  if(u.hp>0)drawRangeCircle(u.x,u.y,u.range,"#8bd68d");
 }
}

function drawBuildings(){
 for(const b of state.buildings){
  const x=b.slot.x,y=b.slot.y;ctx.save();ctx.translate(x,y);
  const lv=b.level||1,isTower=b.base.kind==="tower";
  ctx.fillStyle="#07090788";ctx.beginPath();ctx.ellipse(8,20,35,15,0,0,TAU);ctx.fill();
  if(selected===b){ctx.strokeStyle="#ffe184";ctx.shadowBlur=22;ctx.shadowColor="#ffd665";ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,43,0,TAU);ctx.stroke();ctx.shadowBlur=0}
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
   if(b.key!=="lumber"){ctx.fillStyle="#594234";ctx.fillRect(17,-40,10,24);ctx.fillStyle="#c7bba9";ctx.globalAlpha=.22;ctx.beginPath();ctx.arc(23,-47,6,0,TAU);ctx.arc(28,-55,5,0,TAU);ctx.fill();ctx.globalAlpha=1}
   ctx.fillStyle="#291c14";ctx.fillRect(-8,2,16,24);ctx.fillStyle="#e4b85c";ctx.beginPath();ctx.arc(3,14,2,0,TAU);ctx.fill();
   ctx.fillStyle="#efd17a";ctx.fillRect(-21,-5,9,10);ctx.fillRect(12,-5,9,10);ctx.strokeStyle="#554021";ctx.lineWidth=1;ctx.strokeRect(-21,-5,9,10);ctx.strokeRect(12,-5,9,10);
   ctx.font="22px serif";ctx.textAlign="center";ctx.fillText(b.key==="house"?(lv>=2?"🏠":"⛺"):b.key==="lumber"?"🪵":b.key==="workshop"?"⚒":b.key==="market"?"🏪":"🛠",0,-1);
   // functional outdoor props
   if(b.key==="house"){
    if(lv<2){ctx.fillStyle="#d9c39a";ctx.beginPath();ctx.moveTo(-34,22);ctx.lineTo(0,-28);ctx.lineTo(34,22);ctx.closePath();ctx.fill();ctx.strokeStyle="#68452c";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#4a2d1d";ctx.fillRect(-5,4,10,18)}
    else{ctx.fillStyle="#6f4729";ctx.fillRect(28,9,15,13);ctx.strokeStyle="#c58b4a";ctx.strokeRect(28,9,15,13)}
   }else if(b.key==="lumber"){
    ctx.fillStyle="#6b4024";for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-35+i*7,18-(i%2)*3,5,0,TAU);ctx.fill();ctx.strokeStyle="#a66d39";ctx.stroke()}
    ctx.strokeStyle="#55351f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(29,20);ctx.lineTo(39,8);ctx.stroke();ctx.fillStyle="#92999a";ctx.fillRect(35,5,9,6);
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
  if(selected===u){ctx.strokeStyle="#ffe58a";ctx.shadowBlur=16;ctx.shadowColor="#ffe58a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,26,0,TAU);ctx.stroke();ctx.shadowBlur=0;if(unitCommandMode==="move"){ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(u.targetX-u.x,u.targetY-u.y);ctx.stroke();ctx.setLineDash([])}}
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
  ctx.fillStyle="#f2d36f";ctx.beginPath();ctx.arc(0,1,5,0,TAU);ctx.fill();ctx.fillStyle="#3e2d14";ctx.font="bold 7px sans-serif";ctx.textAlign="center";ctx.fillText(String(lv),0,3.5);
  const stats=u.upgradeStats||{},markers=[];if(stats.damage)markers.push("⚔");if(stats.health)markers.push("♥");if(stats.speed)markers.push("➤");if(stats.rate)markers.push("✦");markers.forEach((m,i)=>{const mx=(i-(markers.length-1)/2)*8;ctx.fillStyle="#13263a";ctx.beginPath();ctx.arc(mx,24,5.5,0,TAU);ctx.fill();ctx.fillStyle="#bfe8ff";ctx.font="bold 6px sans-serif";ctx.fillText(m,mx,26)});
  ctx.fillStyle="#130b0b";ctx.fillRect(-21,-33,42,7);ctx.fillStyle="#69c468";ctx.fillRect(-20,-32,40*Math.max(0,u.hp/u.maxHp),5);ctx.strokeStyle="#e5d9c844";ctx.strokeRect(-21,-33,42,7);const xpRatio=Math.max(0,Math.min(1,(u.xp||0)/(u.xpMax||65)));ctx.fillStyle="#07101e";ctx.fillRect(-21,-24,42,6);ctx.fillStyle=ready?"#69d0ff":"#348de4";ctx.fillRect(-20,-23,40*xpRatio,4);ctx.strokeStyle="#a7dfff55";ctx.strokeRect(-21,-24,42,6);if(ready){ctx.fillStyle="#dff7ff";ctx.font="bold 10px sans-serif";ctx.fillText("▲",0,-36)}ctx.restore();
 }
}
function drawCraftsmen(){
 for(const c of state.craftsmen){ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle="#0007";ctx.beginPath();ctx.ellipse(3,9,10,5,0,0,TAU);ctx.fill();ctx.fillStyle="#d9b184";ctx.beginPath();ctx.arc(0,-5,5,0,TAU);ctx.fill();ctx.fillStyle="#c69b36";ctx.fillRect(-6,-10,12,3);ctx.fillStyle="#4f6f89";ctx.fillRect(-6,0,12,12);ctx.strokeStyle="#6e4928";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(5,3);ctx.lineTo(11,-6);ctx.stroke();ctx.fillStyle="#b9bec0";ctx.fillRect(8,-9,8,5);ctx.restore()}
}

function drawEnemies(){
 const now=performance.now()*.006;
 for(const e of state.enemies){
  ctx.save();ctx.translate(e.x,e.y);
  const stride=Math.sin(now+(e.animSeed||0))*1.4;
  const visualClass=e.visualClass||(e.type==="boss"?"boss":["shield","berserker"].includes(e.type)?"special":"normal");
  const fallbackScale=visualClass==="boss"?1.5:visualClass==="special"?1.18:1;
  const visualScale=Number.isFinite(e.visualScale)?e.visualScale:fallbackScale;
  const isSpecial=visualClass==="special",isBoss=visualClass==="boss";
  ctx.scale(visualScale,visualScale);ctx.translate(0,stride*.25);
  // Bodenschatten und Größenklasse
  const shadowWidth=isBoss?1.58:isSpecial?1.46:1.35;
  ctx.fillStyle="#05060788";ctx.beginPath();ctx.ellipse(5,11,e.radius*shadowWidth,e.radius*(isBoss?.76:isSpecial?.71:.67),0,0,TAU);ctx.fill();
  if(isSpecial||isBoss){
   ctx.globalAlpha=isBoss?.22:.13;ctx.fillStyle=isBoss?"#d59a42":e.type==="berserker"?"#d73b32":"#7b98aa";
   ctx.beginPath();ctx.arc(0,0,e.radius+(isBoss?10:7)+Math.sin(now)*2,0,TAU);ctx.fill();ctx.globalAlpha=1;
  }
  // Beine, Stiefel und Fellrock
  ctx.strokeStyle="#3a281f";ctx.lineWidth=Math.max(3,e.radius*.28);ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-e.radius*.28,e.radius*.45);ctx.lineTo(-e.radius*.4,e.radius*.98+stride);ctx.moveTo(e.radius*.28,e.radius*.45);ctx.lineTo(e.radius*.42,e.radius*.98-stride);ctx.stroke();
  ctx.strokeStyle="#171719";ctx.lineWidth=Math.max(3,e.radius*.22);ctx.beginPath();ctx.moveTo(-e.radius*.48,e.radius*.98+stride);ctx.lineTo(-e.radius*.15,e.radius*.98+stride);ctx.moveTo(e.radius*.18,e.radius*.98-stride);ctx.lineTo(e.radius*.55,e.radius*.98-stride);ctx.stroke();
  ctx.fillStyle="#493525";ctx.beginPath();ctx.moveTo(-e.radius*.72,e.radius*.12);ctx.lineTo(e.radius*.72,e.radius*.12);ctx.lineTo(e.radius*.5,e.radius*.68);ctx.lineTo(-e.radius*.5,e.radius*.68);ctx.closePath();ctx.fill();
  // Körperpanzer mit Eisenclan-Rautenwappen
  const body=ctx.createLinearGradient(-e.radius,-e.radius,e.radius,e.radius);body.addColorStop(0,"#a9724c");body.addColorStop(.42,e.color);body.addColorStop(1,"#241719");ctx.fillStyle=body;ctx.beginPath();ctx.roundRect(-e.radius*.7,-e.radius*.5,e.radius*1.4,e.radius*1.25,e.radius*.34);ctx.fill();ctx.strokeStyle="#23191a";ctx.lineWidth=2.2;ctx.stroke();
  ctx.fillStyle="#24292d";ctx.beginPath();ctx.moveTo(0,-e.radius*.24);ctx.lineTo(e.radius*.27,e.radius*.08);ctx.lineTo(0,e.radius*.38);ctx.lineTo(-e.radius*.27,e.radius*.08);ctx.closePath();ctx.fill();ctx.strokeStyle="#aeb5b7";ctx.lineWidth=1;ctx.stroke();
  // Fellschultern
  ctx.fillStyle=e.type==="boss"?"#d4c5a9":"#9b8a72";for(const sx of [-1,1]){ctx.beginPath();ctx.arc(sx*e.radius*.62,-e.radius*.35,e.radius*.3,0,TAU);ctx.fill()}
  // Kopf und nordischer Eisenhelm
  ctx.fillStyle="#d6aa83";ctx.beginPath();ctx.arc(0,-e.radius*.72,Math.max(4,e.radius*.39),0,TAU);ctx.fill();
  ctx.fillStyle="#323a40";ctx.beginPath();ctx.arc(0,-e.radius*.82,e.radius*.43,Math.PI,TAU);ctx.lineTo(e.radius*.43,-e.radius*.62);ctx.lineTo(-e.radius*.43,-e.radius*.62);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#b7bec1";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,-e.radius*1.18);ctx.lineTo(0,-e.radius*.55);ctx.stroke();
  ctx.fillStyle="#eee4d2";ctx.beginPath();ctx.moveTo(-e.radius*.34,-e.radius*.95);ctx.lineTo(-e.radius*.65,-e.radius*1.16);ctx.lineTo(-e.radius*.48,-e.radius*.82);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(e.radius*.34,-e.radius*.95);ctx.lineTo(e.radius*.65,-e.radius*1.16);ctx.lineTo(e.radius*.48,-e.radius*.82);ctx.closePath();ctx.fill();
  // Bart und Augen
  ctx.fillStyle=e.type==="berserker"?"#6f1f1c":"#4b3024";ctx.beginPath();ctx.moveTo(-e.radius*.28,-e.radius*.62);ctx.lineTo(0,-e.radius*.3);ctx.lineTo(e.radius*.28,-e.radius*.62);ctx.closePath();ctx.fill();
  ctx.fillStyle="#f2d471";ctx.fillRect(-e.radius*.22,-e.radius*.8,2,2);ctx.fillRect(e.radius*.15,-e.radius*.8,2,2);
  // Einheitenspezifische Ausrüstung
  if(e.type==="shield"){
   ctx.fillStyle="#46515b";ctx.beginPath();ctx.moveTo(-e.radius*.45,-e.radius*.44);ctx.quadraticCurveTo(-e.radius*1.35,0,-e.radius*.55,e.radius*.82);ctx.quadraticCurveTo(-e.radius*.05,e.radius*.4,-e.radius*.45,-e.radius*.44);ctx.fill();ctx.strokeStyle="#c1c7c8";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#252b30";ctx.beginPath();ctx.arc(-e.radius*.67,e.radius*.08,e.radius*.18,0,TAU);ctx.fill();
  }else if(e.type==="runner"){
   ctx.fillStyle="#513024";ctx.beginPath();ctx.moveTo(-e.radius*.65,-e.radius*.25);ctx.lineTo(-e.radius*1.1,e.radius*.78);ctx.lineTo(e.radius*.1,e.radius*.55);ctx.closePath();ctx.fill();ctx.strokeStyle="#baa06e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.radius*.45,-e.radius*.15);ctx.lineTo(e.radius*1.05,-e.radius*.8);ctx.stroke();
  }else if(e.type==="spear"){
   ctx.strokeStyle="#654325";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(e.radius*.25,e.radius*.55);ctx.lineTo(e.radius*1.22,-e.radius*1.12);ctx.stroke();ctx.fillStyle="#c4cbcc";ctx.beginPath();ctx.moveTo(e.radius*1.22,-e.radius*1.12);ctx.lineTo(e.radius*.95,-e.radius*.93);ctx.lineTo(e.radius*1.18,-e.radius*.75);ctx.closePath();ctx.fill();
  }else{
   ctx.strokeStyle="#4a2f24";ctx.lineWidth=Math.max(3,e.radius*.22);ctx.beginPath();ctx.moveTo(e.radius*.28,e.radius*.18);ctx.lineTo(e.radius*1.05,-e.radius*.68);ctx.stroke();ctx.fillStyle=e.type==="boss"?"#d8b45d":"#adb5b7";ctx.beginPath();ctx.moveTo(e.radius*1.05,-e.radius*.68);ctx.lineTo(e.radius*.68,-e.radius*.61);ctx.lineTo(e.radius*.91,-e.radius*.31);ctx.closePath();ctx.fill();
  }
  if(e.type==="berserker"){ctx.strokeStyle="#cb3931";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.radius+4,0,TAU);ctx.stroke();ctx.fillStyle="#b92522";ctx.fillRect(-e.radius*.75,-2,e.radius*1.5,4)}
  if(e.type==="boss"){ctx.strokeStyle="#e2b75a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.radius+6,0,TAU);ctx.stroke();ctx.fillStyle="#d1a43c";for(let k=-1;k<=1;k++)ctx.fillRect(k*8-2,-e.radius-10,4,10);ctx.fillStyle="#8d2020";ctx.beginPath();ctx.moveTo(-e.radius*.8,-e.radius*.2);ctx.lineTo(-e.radius*1.25,e.radius*.9);ctx.lineTo(0,e.radius*.62);ctx.closePath();ctx.fill()}
  // Lebensleiste und Typmarke passend zur Größenklasse
  const barHeight=isBoss?10:isSpecial?8:7;
  const barGap=isBoss?23:isSpecial?21:19;
  const bw=Math.max(isBoss?50:isSpecial?42:34,e.radius*(isBoss?3.05:isSpecial?2.9:2.75));
  ctx.fillStyle="#160b0b";ctx.fillRect(-bw/2,-e.radius-barGap,bw,barHeight);
  ctx.fillStyle=e.hp/e.maxHp>.5?"#6ac265":e.hp/e.maxHp>.25?"#d4a541":"#d14945";
  ctx.fillRect(-bw/2+1,-e.radius-barGap+1,(bw-2)*Math.max(0,e.hp/e.maxHp),barHeight-2);
  ctx.strokeStyle=isBoss?"#f0c56a99":isSpecial?"#c9d9df77":"#f5dfca55";ctx.strokeRect(-bw/2,-e.radius-barGap,bw,barHeight);
  if(isBoss){ctx.fillStyle="#d8ac45";ctx.fillRect(-bw/2,-e.radius-barGap-3,bw,2)}
  if(zoom>=.58||isBoss){
   ctx.fillStyle="#f2dfba";ctx.font=`bold ${isBoss?11:isSpecial?9:8}px system-ui`;ctx.textAlign="center";
   ctx.fillText(e.name||"Eisenclan",0,-e.radius-barGap-5);
  }
  ctx.restore();
 }
}
function draw(){
 ctx.clearRect(0,0,vw,vh);ctx.save();ctx.translate(vw/2,vh/2);ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);
 drawGround();drawPaths();drawWorldDetails();drawCastle();drawSlots();drawRangeIndicators();drawBuildings();drawUnits();drawCraftsmen();
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
