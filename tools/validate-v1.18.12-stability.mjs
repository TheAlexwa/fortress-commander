import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  ENEMY_SIDESTEP_DURATION,
  GUARD_OVERLAP_MAX_STEP,
  resolveEnemySeparation,
  resolveGuardEnemyOverlap,
} from "../js/combat.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const main=read("js/main.js");
const combat=read("js/combat.js");
const html=read("index.html");
const sw=read("service-worker.js");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

for(const text of [
  'const GAME_VERSION="1.18.12"',
  'const GAME_RELEASE_NAME="Bewegungs- und Speicherstabilität"',
  'function safeEnemySpawnPoint(',
  'const safeRadius=OUTER_WALL_R+ENEMY_SAFE_SPAWN_PADDING',
  'function returnMeleeDefenderInsideLimit(',
  'function chooseArcherTargetInRange(',
  'const sameMapVersion=/^1\\.(15|16|17|18)\\./',
  'enemy._sidestepTime=Math.max(0,sidestepTime-Math.max(0,dt))',
  'enemy._separationOriginX=enemy.x',
  'resolveEntityStructureCollision(enemy,enemy._separationOriginX,enemy._separationOriginY)'
])requireText(main,text,"Stabilitaetslogik fehlt");

requireText(html,"v1.18.12","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.12"',"PWA-Cacheversion fehlt");

const spawnStart=main.indexOf("function safeEnemySpawnPoint(");
const spawnEnd=main.indexOf("function spawnEnemy(",spawnStart);
assert(spawnStart>=0&&spawnEnd>spawnStart,"Spawn-Sicherheitsfunktion kann nicht getestet werden");
if(spawnStart>=0&&spawnEnd>spawnStart){
  const spawnSource=main.slice(spawnStart,spawnEnd);
  const safeSpawn=new Function("CX","CY","OUTER_WALL_R","ENEMY_SAFE_SPAWN_PADDING",`${spawnSource};return safeEnemySpawnPoint;`)(1500,1100,590,110);
  const corrected=safeSpawn({x:1500,y:1100},1);
  const radius=Math.hypot(corrected.x-1500,corrected.y-1100);
  assert(Math.abs(radius-700)<1e-9,"Unsicherer Gegner-Startpunkt wurde nicht außerhalb des äußeren Rings korrigiert");
  const untouched=safeSpawn({x:1500,y:250},0);
  assert(untouched.x===1500&&untouched.y===250,"Bereits sicherer Gegner-Startpunkt wurde unnötig verschoben");
}
assert(!combat.includes("enemy.x += Math.cos(angle) * 4"),"Alte sichtbare Vier-Pixel-Versetzung ist noch vorhanden");
assert(!combat.includes("enemy.y += Math.sin(angle) * 4"),"Alte sichtbare Vier-Pixel-Versetzung ist noch vorhanden");

const stuck={eid:1,hp:100,radius:12,x:0,y:0,_progressX:0,_progressY:0,_stuckTime:1.8};
const distant={eid:2,hp:100,radius:12,x:200,y:0,_progressX:200,_progressY:0};
resolveEnemySeparation([stuck,distant],0.1,{interval:0,cellSize:52,maxPush:3.6});
assert(stuck.x===0&&stuck.y===0,"Feststeckender Gegner wurde weiterhin direkt versetzt");
assert(stuck._sidestepTime===ENEMY_SIDESTEP_DURATION,"Seitliches Ausweichen wurde nicht aktiviert");
assert(Math.abs(stuck._sidestepDirection)===1,"Seitliche Ausweichrichtung fehlt");

const guard={key:"guard",stance:"defend",guardZone:"middle",range:30,hp:180,x:10,y:0};
const enemy={hp:100,radius:12,x:0,y:0};
const beforeX=guard.x;
resolveGuardEnemyOverlap(guard,enemy,{centerX:0,centerY:0,wallRadius:355});
assert(guard.x-beforeX<=GUARD_OVERLAP_MAX_STEP+1e-9,"Burgwache wird bei Kollision zu weit versetzt");
assert(guard.x>beforeX,"Kollisionskorrektur der Burgwache fehlt");

const expectedHashes={
  "js/enemies.js":"e2c4ecd7f583af6f0a6a4caea213845efa948ce7e98b6d2a5dc48e761e7f49ea"
};
for(const [file,expected] of Object.entries(expectedHashes)){
  const actual=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex");
  assert(actual===expected,`Geschuetzte Kampfwertdatei wurde veraendert: ${file}`);
}

for(const text of [
  'soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82',
  'guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25',
  'hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35'
])requireText(main,text,"Einheiten-Kampfwert wurde veraendert");

if(failures.length){
  console.error("v1.18.12-Stabilitaetspruefung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("v1.18.12-Stabilitaetspruefung erfolgreich: sichere Spawns, sanfte Rueckfuehrung, seitliches Ausweichen, Bogenschuetzen-Zielwahl, Speicherpositionen und unveraenderte Kampfwerte bestaetigt.");
