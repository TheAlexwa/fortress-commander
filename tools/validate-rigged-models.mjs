import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const render=fs.readFileSync(path.join(root,"js","render.js"),"utf8");
const main=fs.readFileSync(path.join(root,"js","main.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(root,"service-worker.js"),"utf8");
const readme=fs.readFileSync(path.join(root,"README.md"),"utf8");
const changelog=fs.readFileSync(path.join(root,"CHANGELOG.md"),"utf8");
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

for(const text of [
  "const UNIT_RIG_DEFS = {",
  "function getRigPose(",
  "function drawRigPart(",
  "function drawRiggedUnitModel(",
  "function traceRigPolygon(",
  "function smoothPose(",
  'order:["leftLeg","rightLeg","torso","head","leftArm","rightArm"]',
  'setRigTransform(pose,"leftLeg"',
  'setRigTransform(pose,"rightLeg"',
  'setRigTransform(pose,"leftArm"',
  'setRigTransform(pose,"rightArm"',
  'if(unit.key==="soldier")',
  'const attackFacing=attack.active'
])requireText(render,text,"Gelenkmodelldarstellung fehlt");

for(const key of ["soldier","guard","hero"]){
  requireText(render,`${key}: {`,`Modell fehlt`);
}

const rigPartPivots=(render.match(/pivot:\[[^\]]+\],polygon:/g)||[]).length;
if(rigPartPivots!==18)failures.push(`Erwartet 18 Gelenkteile, gefunden ${rigPartPivots}`);

for(const file of [
  "assets/units/archer-idle.webp",
  "assets/units/guard-idle.webp",
  "assets/units/andreas-idle.webp"
]){
  if(!fs.existsSync(path.join(root,file)))failures.push(`Quellsprite fehlt: ${file}`);
}

for(const text of [
  'const GAME_VERSION="1.18.11"',
  'const GAME_RELEASE_NAME="Animierte Spielermodelle"'
])requireText(main,text,"Versionsangabe fehlt");
requireText(html,"v1.18.11","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.11"',"PWA-Cacheversion fehlt");
requireText(readme,"Kampfwerte, Reichweiten, Angriffsgeschwindigkeiten, Zielregeln, Kollisionen und Balance bleiben unverändert","README-Balancehinweis fehlt");
requireText(changelog,"validate-rigged-models.mjs","CHANGELOG-Prüfung fehlt");

const balanceChecks=[
  ['soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82',"Bogenschützenwerte verändert"],
  ['guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25',"Burgwachenwerte verändert"],
  ['hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35',"Andreas-Werte verändert"]
];
for(const [text,label] of balanceChecks)requireText(main,text,label);

if(failures.length){
  console.error("Gelenkmodellprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("Gelenkmodellprüfung erfolgreich: drei Spielermodelle, 18 bewegliche Körperteile, Lauf-, Fernkampf-, Nahkampf- und Trefferhaltungen bestätigt.");
