import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const normalized=file=>read(file).replace(/\r\n?/g,"\n");
const main=read("js/main.js");
const html=read("index.html");
const css=read("css/style.css");
const sw=read("service-worker.js");
const notes=JSON.parse(read("release-notes.json"));
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

requireText(main,'const GAME_VERSION="1.18.19"',"Version fehlt");
requireText(main,'const GAME_RELEASE_NAME="Mehrwelt-Speicherfundament"',"Release-Name fehlt");
requireText(html,"v1.18.19","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.19"',"Cache-Version fehlt");
assert(notes.version==="1.18.19","release-notes.json hat falsche Version");
assert(notes.title==="Mehrwelt-Speicherfundament","release-notes.json hat falschen Titel");
assert(notes.saveCompatible===true,"Save-Kompatibilitaet ist nicht bestaetigt");

for(const marker of [
  'id="marketStoneValue"',
  'Goldreserven einsetzen',
  'data-trade="gold-stone" data-amount="100"',
  'data-trade="gold-stone" data-amount="350"',
  'data-trade="gold-wood" data-amount="500"'
])requireText(html+main,marker,`Marktplatz-Erweiterung fehlt`);

for(const marker of [
  'else if(type==="gold-stone"){const goldCost=amount*15;',
  'state.gold-=goldCost;state.stone+=out;',
  'const stoneSmall=marketOutput(100,selected),stoneLarge=marketOutput(350,selected);',
  'if(!state.inWave)saveGame(true);'
])requireText(main,marker,`Marktlogik fehlt`);

for(const marker of [
  '.populationGroupTitle b{color:#f6f0dd',
  '.populationGroupMain small{display:block;color:#d5dfd8',
  '.marketSummary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))',
  '.marketSupplyWide{grid-column:1/-1}'
])requireText(css,marker,`UI-Kontrast/Marktlayout fehlt`);

const protectedHashes={
  "js/economy.js":"81917ffbecd531d91a1ff960eb4bfc69dc0d599295afb6ff3218f0fa579fbc53",
  "js/combat.js":"7f4077f63d20586c868e22a374f7300715242ddae9927ff6146b7f2aa45ca2d7",
  "js/enemies.js":"b9750130eea9343399fccc0a99ac542b7b98f9f8e85f57e04045408bb4d9aa05",
  "js/fortifications.js":"ce9f2dcaad7412cf63b85f616641e23e3f2ed57d1dd97f8059261b692bd55078",
  "data/buildings.json":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "data/enemies.json":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "data/units.json":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
};
for(const [file,expected] of Object.entries(protectedHashes)){
  const actual=crypto.createHash("sha256").update(normalized(file),"utf8").digest("hex");
  assert(actual===expected,`Geschuetzte Wirtschafts-/Kampfdatei wurde veraendert: ${file}`);
}

if(failures.length){
  console.error("v1.18.19-Marktplatzpruefung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("v1.18.19-Marktplatzpruefung erfolgreich: Gold-zu-Stein-Lieferungen, grosse Holzlieferung, bessere Arbeitsverteilungs-Lesbarkeit, Versionsstand und unveraenderte Wirtschafts-/Kampfdateien bestaetigt.");
