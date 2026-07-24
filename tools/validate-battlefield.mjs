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
 "function drawTowerWeaponAnimation(",
 "function drawBuildingDamageEffects(",
 "function drawFortificationDamageEffect(",
 "function updateProjectileVisualTracking(",
 "function drawBattlefieldDecals(",
 "function drawImpactEffects(",
 "battlefieldDecals.length>34",
 "impactEffects.length>36",
 "cameraShakeUntil",
 "REDUCED_MOTION"
])requireText(render,text,"Schlachtfelddarstellung fehlt");

for(const text of [
 'const GAME_VERSION="1.18.10"',
 'const GAME_RELEASE_NAME="Türme, Schäden & Schlachtfeldfeedback"',
 'b.attackAngle=Math.atan2(e.y-b.slot.y,e.x-b.slot.x)',
 'b.attackVisualTime=b.key==="catapult"?.48:.34',
 'cameraEffects:saved?.cameraEffects!==false',
 'cameraEffects:displayPreferences.cameraEffects'
])requireText(main,text,"Visuelles Turm- oder Kamera-Signal fehlt");

for(const text of ['id="cameraEffectsToggle"','v1.18.10'])requireText(html,text,"Anzeigeoption oder Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.10"',"PWA-Cacheversion fehlt");
requireText(readme,"Kampfwerte, Reichweiten, Angriffsgeschwindigkeiten, Zielregeln und Balance bleiben unverändert","README-Balancehinweis fehlt");
requireText(changelog,"validate-battlefield.mjs","CHANGELOG-Prüfung fehlt");

const forbiddenMainChanges=[
 /const CATAPULT_ARMOR_BREAK\s*=\s*(?!\.20\b)/,
 /const CATAPULT_SLOW\s*=\s*(?!\.15\b)/,
 /archer:\{name:"Bogenturm",kind:"tower",gold:(?!60\b)/,
 /crossbow:\{name:"Armbrustturm",kind:"tower",gold:(?!95\b)/,
 /catapult:\{name:"Katapult",kind:"tower",gold:(?!140\b)/
];
for(const pattern of forbiddenMainChanges)if(pattern.test(main))failures.push(`Unerwartete Balanceänderung erkannt: ${pattern}`);

if(failures.length){
 console.error("Schlachtfeldprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log("Schlachtfeldprüfung erfolgreich: drei Turmanimationen, Schadensstufen, Einschläge, begrenzte Spuren und optionale Kameraeffekte bestätigt.");
