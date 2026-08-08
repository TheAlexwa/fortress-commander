import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const main=read("js/main.js");
const combat=read("js/combat.js");
const html=read("index.html");
const sw=read("service-worker.js");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};
const requireText=(source,text,message)=>assert(source.includes(text),`${message}: ${text}`);

for(const marker of [
  'const GAME_VERSION="1.18.15"',
  'const GAME_RELEASE_NAME="Abriss & Rückerstattung"',
  'function friendlyGateIndexAtAngle(',
  'function friendlyGateCrossing(',
  'function friendlyGateWaypoint(',
  'function moveFriendlyUnitToward(',
  'function selectEnemyAssaultRoute(',
  'function enemyReachedAssaultPoint(',
  'const spacing=Math.max(22,Math.min(46,radius*2+4))',
  'enemy[fields.cooldown]=3.6+((Number(enemy.eid)||0)%5)*.18',
  'enemy._routeRecheck = true',
  'const speed=enemy.queueWaiting?effectiveSpeed*.58:effectiveSpeed',
  'assaultFormationPoint(e,route.angle,targetR,`og:${route.index}`,4)',
  'assaultFormationPoint(e,route.angle,targetR,`mg:${route.index}`,4)'
])requireText(marker.includes("_routeRecheck")?combat:main,marker,"Tor- oder Routenlogik fehlt");

requireText(html,"v1.18.15","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.15-r1"',"PWA-Cacheversion fehlt");

function extractFunction(source,name){
  const start=source.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Funktion nicht gefunden: ${name}`);
  const brace=source.indexOf("{",start);
  let depth=0;
  for(let index=brace;index<source.length;index++){
    const char=source[index];
    if(char==="{")depth++;
    else if(char==="}"){
      depth--;
      if(depth===0)return source.slice(start,index+1);
    }
  }
  throw new Error(`Funktion unvollstaendig: ${name}`);
}

const cardinal=[-Math.PI/2,0,Math.PI/2,Math.PI];
const nearestGate=angle=>{
  let best=0,bestDistance=Infinity;
  cardinal.forEach((gateAngle,index)=>{
    let distance=Math.abs(angle-gateAngle)%(Math.PI*2);
    if(distance>Math.PI)distance=Math.PI*2-distance;
    if(distance<bestDistance){best=index;bestDistance=distance}
  });
  return best;
};

try{
  const context={
    Math,
    CX:0,CY:0,WALL_R:355,OUTER_WALL_R:590,RING_COLLISION_THICKNESS:22,
    state:{
      middleGates:cardinal.map((angle,index)=>({i:index,angle,built:true,hp:620,maxHp:620})),
      outerGates:cardinal.map((angle,index)=>({i:index,angle,built:true,hp:760,maxHp:760})),
      walls:[],outerWalls:[],enemies:[]
    },
    entityCollisionRadius:unit=>unit?.job==="craftsman"?10:unit?.key==="hero"?16:unit?.key==="guard"?14:12,
    getNearestMiddleGateIndexForAngle:nearestGate,
    getMiddleGateIndexForAngle:(angle,tolerance=.105)=>{
      const index=nearestGate(angle);
      let distance=Math.abs(angle-cardinal[index])%(Math.PI*2);
      if(distance>Math.PI)distance=Math.PI*2-distance;
      return distance<=tolerance?index:-1;
    },
    getOuterGateIndexForAngle:(angle,tolerance=.082)=>{
      const index=nearestGate(angle);
      let distance=Math.abs(angle-cardinal[index])%(Math.PI*2);
      if(distance>Math.PI)distance=Math.PI*2-distance;
      return distance<=tolerance?index:-1;
    }
  };
  vm.createContext(context);
  for(const name of ["canUseFriendlyGate","friendlyGateAngle","bestFriendlyGateIndex","friendlyGateCrossing","friendlyGateWaypoint"]){
    vm.runInContext(extractFunction(main,name),context);
  }
  const guard={kind:"unit",key:"guard",hp:180,x:0,y:-250};
  const first=context.friendlyGateWaypoint(guard,0,-470);
  assert(first.transit===true,"Außenringziel startet keinen Torweg");
  assert(Math.abs(first.x)<1e-6&&first.y<0,"Nordtor wird fuer nördliches Ziel nicht gewählt");
  guard.x=first.x;guard.y=first.y;
  const second=context.friendlyGateWaypoint(guard,0,-470);
  assert(guard._gateTransit?.stage==="cross","Torweg wechselt am Anlaufpunkt nicht in die Durchgangsphase");
  assert(Math.hypot(second.x,second.y)>355,"Toraustritt liegt nicht auf der anderen Seite der mittleren Mauer");
  const craftsman={job:"craftsman",x:0,y:-250};
  const craftsmanGate=context.friendlyGateWaypoint(craftsman,0,-470);
  assert(craftsmanGate.transit===true,"Handwerker startet keinen Weg durch das eigene Tor");
  assert(craftsman._gateTransit?.ring==="middle","Handwerker nutzt fuer ein Ziel ausserhalb des Mittelrings keinen mittleren Torweg");

  context.MIDDLE_GATE_HALF_ANGLE=.105;
  context.OUTER_GATE_HALF_ANGLE=.082;
  context.MIDDLE_WALL_SEGMENT_COUNT=20;
  context.OUTER_WALL_SEGMENT_COUNT=28;
  context.STRUCTURE_COLLISION_PADDING=6;
  context.getMiddleWallSegmentIndexForAngle=()=>0;
  context.getOuterWallSegmentIndexForAngle=()=>0;
  context.angleWithinArc=()=>true;
  context.state.walls=[{built:true,hp:420,a0:-2,a1:2}];
  context.state.outerWalls=[{built:true,hp:420,a0:-2,a1:2}];
  for(const name of ["canUseFriendlyGate","friendlyGateIndexAtAngle","isMiddleRingSolidAtAngle","resolveEntityAgainstRing"]){
    vm.runInContext(extractFunction(main,name),context);
  }
  const friendly={kind:"unit",key:"guard",hp:180,x:0,y:-340};
  context.resolveEntityAgainstRing(friendly,0,-315,355,context.isMiddleRingSolidAtAngle);
  assert(Math.abs(friendly.y+340)<1e-6,"Eigene Einheit wird am intakten Tor weiterhin von der Ringkollision blockiert");
  const attacker={kind:"enemy",hp:100,radius:14,x:0,y:-340};
  context.resolveEntityAgainstRing(attacker,0,-315,355,context.isMiddleRingSolidAtAngle);
  assert(Math.hypot(attacker.x,attacker.y)<330,"Gegner kann ein intaktes Tor ohne Angriff passieren");
}catch(error){
  failures.push(`Torweg-Simulation fehlgeschlagen: ${error.message}`);
}

try{
  const routeContext={
    Math,CX:0,CY:0,WALL_R:355,OUTER_WALL_R:590,
    angularDistance:null,
    state:{
      outerGates:cardinal.map((angle,index)=>({i:index,angle,built:true,hp:760,maxHp:760})),
      middleGates:cardinal.map((angle,index)=>({i:index,angle,built:true,hp:620,maxHp:620})),
      outerWalls:Array.from({length:8},(_,index)=>({i:index,am:-Math.PI+index*Math.PI/4,built:true,hp:420,maxHp:420})),
      walls:Array.from({length:8},(_,index)=>({i:index,am:-Math.PI+index*Math.PI/4,built:true,hp:420,maxHp:420})),
      enemies:[]
    }
  };
  vm.createContext(routeContext);
  for(const name of ["angularDistance","enemyRouteFields","enemyRouteCandidate","enemyRouteLoad","enemyRouteNearbyLoad","enemyRouteIsValid","selectEnemyAssaultRoute"]){
    vm.runInContext(extractFunction(main,name),routeContext);
  }
  const tested={eid:99,hp:100,phase:"outer",x:0,y:-760,approachGateIndex:0};
  routeContext.state.enemies=[tested];
  for(let index=0;index<10;index++)routeContext.state.enemies.push({eid:index+1,hp:100,phase:"outer",x:index-5,y:-600,outerRouteKind:"gate",outerRouteIndex:0});
  const distributed=routeContext.selectEnemyAssaultRoute(tested,"outer",0.1);
  assert(!(distributed.kind==="gate"&&distributed.index===0),"Überfülltes Nordtor wird trotz hoher Belegung weiter gewählt");

  routeContext.state.outerWalls[2].hp=0;
  tested.outerRouteCooldown=0;tested._routeRecheck=true;tested.x=590;tested.y=0;
  const breach=routeContext.selectEnemyAssaultRoute(tested,"outer",0.1);
  assert(breach.kind==="wall"&&breach.index===2,"Nahe offene Bresche wird nicht bevorzugt");
}catch(error){
  failures.push(`Belagerungsrouten-Simulation fehlgeschlagen: ${error.message}`);
}


try{
  const formationContext={Math,CX:0,CY:0,state:{enemies:[]},enemyAssaultKey:enemy=>enemy.assaultKey||""};
  vm.createContext(formationContext);
  for(const name of ["assaultFormationPoint","enemyReachedAssaultPoint"]){
    vm.runInContext(extractFunction(main,name),formationContext);
  }
  const shields=Array.from({length:4},(_,index)=>({eid:index+1,hp:200,type:"shield",radius:18,phase:"outer"}));
  formationContext.state.enemies=shields;
  const points=shields.map(enemy=>formationContext.assaultFormationPoint(enemy,-Math.PI/2,612,"og:0",4));
  for(let index=1;index<points.length;index++){
    assert(Math.hypot(points[index].x-points[index-1].x,points[index].y-points[index-1].y)>=39,"Eisenschilde erhalten weiterhin ueberlappende Frontplaetze");
  }
  assert(formationContext.enemyReachedAssaultPoint(shields[0],points[0],20)===true,"Eisenschild erreicht trotz Strukturkontakt keinen Angriffszustand");
  assert(formationContext.enemyReachedAssaultPoint(shields[0],{...points[0],canAttack:false},2)===false,"Wartende hintere Reihe darf angreifen");
}catch(error){
  failures.push(`Eisenschild-Angriffsformation fehlgeschlagen: ${error.message}`);
}

for(const forbidden of [
  "enemy.x += Math.cos(angle) * 4",
  "enemy.y += Math.sin(angle) * 4"
])assert(!combat.includes(forbidden),`Alte Teleportkorrektur ist wieder vorhanden: ${forbidden}`);

if(failures.length){
  console.error("v1.18.15-Torpruefung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("v1.18.15-Torpruefung erfolgreich: eigene Torpassage, mehrstufige Wegpunkte, dynamische Angriffsziele, Überlastungsmalus und Breschenwahl bestaetigt.");
