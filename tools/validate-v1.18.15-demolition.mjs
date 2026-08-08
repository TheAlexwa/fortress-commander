import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const main = read("js/main.js");
const ui = read("js/ui.js");
const html = read("index.html");
const sw = read("service-worker.js");
const failures = [];
const requireText = (content, text, message) => { if (!content.includes(text)) failures.push(message); };

requireText(main, 'const GAME_VERSION="1.18.16"', "Spielversion fehlt");
requireText(main, 'const GAME_RELEASE_NAME="Update-Details & Anleitung"', "Release-Name fehlt");
requireText(html, "v1.18.16", "HTML-Version fehlt");
requireText(sw, 'CACHE_NAME="fortress-commander-v1.18.16"', "Cacheversion fehlt");

for (const marker of [
  "function demolitionInvestment(entity)",
  "function demolitionRefund(entity)",
  "Math.floor(invested.gold*.5)",
  "Math.floor(invested.wood*.5)",
  "Math.floor(invested.stone*.5)",
  "function canDemolish(entity)",
  'if(state.inWave)return {ok:false,reason:"Abriss ist nur zwischen den Angriffswellen möglich"}',
  'entity.ring==="inner"',
  "wallTowerOnFortification(entity)",
  "function demolishSelected()",
  "window.confirm(`",
  "releaseBuildingResidents(entity,{displaced:false})",
  "state.craftsmen=state.craftsmen.filter",
  "entity.slot.building=null",
  "entity.built=false;entity.hp=0;entity.material=\"wood\"",
  "for(const enemy of state.enemies)enemy._routeRecheck=true"
]) requireText(main, marker, `Abrisslogik fehlt: ${marker}`);

for (const marker of [
  'ui.sell.textContent = "Abreißen · 50 %"',
  "Abriss: 50 % zurück",
  "configureDemolition(selected)",
  "configureDemolition(building)"
]) requireText(ui, marker, `Abriss-UI fehlt: ${marker}`);

for (const marker of [
  "MIDDLE_WALL_BUILD_WOOD",
  "MIDDLE_WALL_STONE_COST",
  "MIDDLE_GATE_BUILD_WOOD",
  "MIDDLE_GATE_STONE_COST",
  "OUTER_WALL_BUILD_WOOD",
  "OUTER_WALL_STONE_COST",
  "OUTER_GATE_BUILD_WOOD",
  "OUTER_GATE_STONE_COST"
]) requireText(main, marker, `Befestigungsinvestition fehlt: ${marker}`);

for (const protectedValue of [
  'soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82',
  'guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25',
  'hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35'
]) requireText(main, protectedValue, `Geschützter Einheitenwert verändert: ${protectedValue}`);

for (const marker of [
  'id="selectionDemolishBtn"',
  'class="selectionAction demolitionAction hidden"'
]) requireText(html, marker, `Sichtbarer Abrissbutton fehlt: ${marker}`);

for (const marker of [
  'const selectionDemolishBtn=document.getElementById("selectionDemolishBtn")',
  'selectionDemolishBtn.addEventListener("click"',
  'selectionDemolishBtn.classList.toggle("hidden",!showDemolition)',
  'details+=` · 🔨 ${refundText} zurück`'
]) requireText(main, marker, `Abrissbutton-Verkabelung fehlt: ${marker}`);

if (failures.length) {
  console.error("v1.18.16-Abrisspruefung fehlgeschlagen:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("v1.18.16-Abrisspruefung erfolgreich: 50-Prozent-Rueckerstattung, Bestaetigung, Gebaeude/Tuerme/Mauern/Tore, Schutzregeln und unveraenderte Kampfwerte bestaetigt.");
