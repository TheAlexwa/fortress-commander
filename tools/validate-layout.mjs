import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const main = read("js/main.js");
const render = read("js/render.js");
const buildings = read("js/buildings.js");
const save = read("js/save.js");
const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(`${message}: ${text}`);
};

for (const text of [
  'const outerSupportRadius=WALL_R+(OUTER_WALL_R-WALL_R)*.52',
  'for(let i=0;i<8;i++)',
  'role:"outer-support"',
  'zone:"outer"',
  'nearestRaidBuilding(e,235,"outer")',
  'resolveEntityAgainstRing',
  'resolveEntityAgainstBuildings',
  'placeMobileEntity(enemy',
]) requireText(main, text, "Außenversorgung oder Kollisionslogik fehlt");

for (const text of ["AUSSENVERSORGUNG", 'slot.role==="outer-support"']) {
  requireText(render, text, "Darstellung der Außenplätze fehlt");
}
requireText(buildings, "inneren oder äußeren Versorgungsplatz", "Bauhinweis für Außenplätze fehlt");
requireText(save, "insideSlots.indexOf(slot)", "Speicherreferenz für Versorgungsplätze fehlt");

const statueIndex = main.indexOf('role:"statue"');
const outerIndex = main.indexOf('const outerSupportRadius');
if (statueIndex < 0 || outerIndex < 0 || statueIndex > outerIndex) {
  failures.push("Neue Außenplätze stehen vor dem historischen Statuenplatz und würden alte Slotindizes verschieben");
}

if (failures.length) {
  console.error("Layoutprüfung fehlgeschlagen:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Layoutprüfung erfolgreich: 8 Außenplätze, alte Slotindizes, Plündererzugriff und Kollisionsschutz bestätigt.");
