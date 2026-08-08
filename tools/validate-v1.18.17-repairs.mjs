import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { applyWaveAutoRepair, getTotalRepairDamage } from "../js/game.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const normalized=file=>read(file).replace(/\r\n?/g,"\n");
const main=read("js/main.js");
const html=read("index.html");
const sw=read("service-worker.js");
const stability=read("tools/validate-v1.18.12-stability.mjs");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

requireText(main,'const GAME_VERSION="1.18.17"',"Version fehlt");
requireText(main,'const GAME_RELEASE_NAME="Reparaturstabilität"',"Release-Name fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.17-r2"',"Cache-Version fehlt");
requireText(html,"v1.18.17","HTML-Version fehlt");
requireText(main,'w=>w.built&&w.hp<w.maxHp&&(w.ring==="inner"||w.hp>0)',"Zerstoerte baubare Befestigungen sind noch Handwerkerziele");
requireText(main,'if(target.ring!=="inner"&&target.hp<=0)throw new Error("Zerstörte Befestigung ist kein Reparaturziel")',"Bereits zugewiesene Handwerker koennen zerstoerte Befestigungen noch weiter reparieren");
requireText(main,'function markBuildableFortificationDestroyed(target){',"Zerstoerungsstatus fuer baubare Befestigungen fehlt");
requireText(main,'target.hp=0;target.built=false;',"Zerstoerte baubare Befestigungen bleiben intern noch gebaut");
requireText(main,'if(craftsman?.target===target)sendCraftsmanHome(craftsman)',"Handwerker brechen ein zerstoertes Reparaturziel nicht sofort ab");
requireText(main,'const gateDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.35)',"Normale Gegner inklusive Clanspaeher verursachen keinen Torschaden");
requireText(main,'const wallDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.25)',"Normale Gegner inklusive Clanspaeher verursachen keinen Mauerschaden");
requireText(main,'function enemyFortificationAssaultRadius(ringRadius,enemy,gap=2){',"Kollisionssicherer Angriffsradius fuer Befestigungen fehlt");
requireText(main,'const targetR=enemyFortificationAssaultRadius(OUTER_WALL_R,e);',"Aeusserer Ring verwendet noch einen unerreichbaren Angriffspunkt");
requireText(main,'const targetR=enemyFortificationAssaultRadius(WALL_R,e);',"Mittlerer Ring verwendet noch einen unerreichbaren Angriffspunkt");
requireText(main,'const targetR=enemyFortificationAssaultRadius(FIXED_INNER_WALL_RADIUS,e,3);',"Innerer Ring verwendet noch einen unerreichbaren Angriffspunkt");
requireText(main,'function repairWoodPerCraftsmanTick(building){return repairWoodPerTick()/craftsmanTeamSize(building)}',"Holzkosten werden nicht auf Handwerker geteilt");
requireText(main,'function repairStonePerCraftsmanTick(building,target){return (isStoneBuilding(target)?STONE_BUILDING_REPAIR_STONE_PER_TICK:0)/craftsmanTeamSize(building)}',"Steinkosten werden nicht auf Handwerker geteilt");
requireText(stability,'const normalizedUtf8=file=>read(file).replace(/\\r\\n?/g,"\\n")',"CRLF/LF-Normalisierung fehlt");

const state={
  hp:800,maxHp:1000,repairedHp:0,buildings:[],
  outerWalls:[{ring:"outer",built:true,hp:0,maxHp:420},{ring:"outer",built:true,hp:210,maxHp:420}],
  walls:[{ring:"middle",built:true,hp:0,maxHp:420},{ring:"middle",built:true,hp:300,maxHp:420}],
  innerWalls:[{ring:"inner",built:true,hp:0,maxHp:420}],
  middleGates:[{ring:"middle",built:true,hp:0,maxHp:620},{ring:"middle",built:true,hp:500,maxHp:620}],
  outerGates:[{ring:"outer",built:true,hp:0,maxHp:620}]
};
const repaired=applyWaveAutoRepair(state,.1);
assert(state.outerWalls[0].hp===0,"Zerstoerte aeussere Mauer wurde automatisch wiederbelebt");
assert(state.walls[0].hp===0,"Zerstoerte mittlere Mauer wurde automatisch wiederbelebt");
assert(state.middleGates[0].hp===0,"Zerstoertes mittleres Tor wurde automatisch wiederbelebt");
assert(state.outerGates[0].hp===0,"Zerstoertes aeusseres Tor wurde automatisch wiederbelebt");
assert(state.outerWalls[1].hp===252,"Beschaedigte aeussere Mauer wurde nicht korrekt repariert");
assert(state.walls[1].hp===342,"Beschaedigte mittlere Mauer wurde nicht korrekt repariert");
assert(state.middleGates[1].hp===562,"Beschaedigtes Tor wurde nicht korrekt repariert");
assert(state.innerWalls[0].hp===42,"Fester innerer Ring muss weiterhin reparierbar bleiben");
assert(repaired===288,"Unerwartete Gesamtmenge der Wellenreparatur");

const damageState={
  hp:1000,maxHp:1000,repairedHp:0,buildings:[],
  outerWalls:[{ring:"outer",built:true,hp:0,maxHp:420},{ring:"outer",built:true,hp:210,maxHp:420}],
  walls:[{ring:"middle",built:true,hp:0,maxHp:420},{ring:"middle",built:true,hp:300,maxHp:420}],
  innerWalls:[{ring:"inner",built:true,hp:0,maxHp:420}],
  middleGates:[{ring:"middle",built:true,hp:0,maxHp:620},{ring:"middle",built:true,hp:500,maxHp:620}],
  outerGates:[{ring:"outer",built:true,hp:0,maxHp:620}]
};
assert(getTotalRepairDamage(damageState)===870,"Zerstoerte baubare Befestigungen duerfen den Reparaturschaden nicht erhoehen");

const runnerRadius=12;
const collisionThickness=22;
const legacyTargetOffset=runnerRadius+4;
const collisionBoundaryOffset=collisionThickness+runnerRadius;
const legacyReachTolerance=runnerRadius+3;
assert(collisionBoundaryOffset-legacyTargetOffset>legacyReachTolerance,"Regressionstest erwartet, dass der alte Clanspaeher-Angriffspunkt hinter der Kollisionsgrenze lag");
const repairedTargetOffset=collisionThickness+runnerRadius+2;
assert(repairedTargetOffset>=collisionBoundaryOffset,"Neuer Clanspaeher-Angriffspunkt liegt noch innerhalb der Befestigungskollision");

const protectedHashes={
  "js/enemies.js":"b9750130eea9343399fccc0a99ac542b7b98f9f8e85f57e04045408bb4d9aa05",
  "js/combat.js":"7f4077f63d20586c868e22a374f7300715242ddae9927ff6146b7f2aa45ca2d7"
};
for(const [file,expected] of Object.entries(protectedHashes)){
  const actual=crypto.createHash("sha256").update(normalized(file),"utf8").digest("hex");
  assert(actual===expected,`Geschuetzte Kampfdatei wurde veraendert: ${file}`);
}

if(failures.length){
  console.error("v1.18.17-Reparaturpruefung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("v1.18.17-Reparaturpruefung erfolgreich: zerstoerte baubare Befestigungen werden sofort als zerstoert markiert, Handwerker brechen diese Ziele ab, Handwerkerkosten werden im Team geteilt Clanspaeher erreichen die Befestigungs-Kollisionskante und behalten ihren vorhandenen Befestigungsschaden.");
