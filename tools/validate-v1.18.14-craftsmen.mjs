import fs from "node:fs";

const main=fs.readFileSync("js/main.js","utf8");
const html=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("service-worker.js","utf8");
const failures=[];
const requireText=(source,text,message)=>{if(!source.includes(text))failures.push(message)};

requireText(main,'const GAME_VERSION="1.18.14"',"Spielversion fehlt");
requireText(main,'const GAME_RELEASE_NAME="Handwerker-Reparaturwege"',"Release-Name fehlt");
requireText(html,"v1.18.14","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.14"',"PWA-Cacheversion fehlt");

requireText(main,'function canUseFriendlyGate(entity)',"Freundliche Torfreigabe fehlt");
requireText(main,'entity.job==="craftsman"',"Handwerker sind nicht fuer eigene Tore freigegeben");
requireText(main,'function repairTargetInfo(target,craftsman=null)',"Handwerkerbezogene Reparaturzielberechnung fehlt");
requireText(main,'const contactRadius=radius+side*(RING_COLLISION_THICKNESS+workerRadius+6)',"Erreichbarer Mauer-/Tor-Reparaturpunkt fehlt");
requireText(main,'const clearance=buildingCollisionRadius(target)+workerRadius+STRUCTURE_COLLISION_PADDING+5',"Erreichbarer Gebaeude-/Turm-Reparaturpunkt fehlt");
requireText(main,'moveFriendlyUnitToward(c,x,y,dt,{speed:craftsmanMoveSpeed()})',"Handwerker nutzen keine Torweg-Navigation");
requireText(main,'...state.outerGates,...state.walls,...state.innerWalls,...state.middleGates',"Tore fehlen in der Reparaturzielliste");
requireText(main,'state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0&&b.hp<b.maxHp)',"Tuerme fehlen in der Reparaturzielliste");
requireText(main,'state.buildings.filter(b=>b.base.kind!=="tower"&&!b.base.decorative&&b.key!=="statue"&&b.hp>0&&b.hp<b.maxHp)',"Gebaeude fehlen in der Reparaturzielliste");

for(const forbidden of [
  'soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82',
  'guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25',
  'hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35'
]) requireText(main,forbidden,"Geschuetzter Kampfwert fehlt oder wurde veraendert");

if(failures.length){
  console.error("v1.18.14-Handwerkerpruefung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("v1.18.14-Handwerkerpruefung erfolgreich: eigene Torpassage, erreichbare Reparaturpunkte fuer Mauern, Tore, Tuerme und Gebaeude sowie unveraenderte Kampfwerte bestaetigt.");
