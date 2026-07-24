import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const render=fs.readFileSync(path.join(root,"js","render.js"),"utf8");
const main=fs.readFileSync(path.join(root,"js","main.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(root,"service-worker.js"),"utf8");
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

for(const text of [
 "function getUnitMotion(",
 "function drawArcherAttackEffect(",
 "function drawGuardAttackEffect(",
 "function drawHeroAbilityWeaponGlow(",
 "function updateHitReaction(",
 "function drawHitReactionEffect(",
 "function drawDeathAnimations(",
 "function drawProjectileVisual(",
 "function updateCombatVisualTracking(",
 "attackVisualVariant",
 "globalCompositeOperation=\"screen\""
])requireText(render,text,"Animationsdarstellung fehlt");

for(const text of [
 'const GAME_VERSION="1.18.9"',
 'attackVisualVariant=(Number(u.attackVisualVariant)||0)+1'
])requireText(main,text,"Kampfanimationssignal fehlt");

requireText(html,"v1.18.9","HTML-Version fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.9"',"PWA-Cacheversion fehlt");

const attackSignals=(main.match(/attackVisualVariant=\(Number\(u\.attackVisualVariant\)\|\|0\)\+1/g)||[]).length;
if(attackSignals<3)failures.push(`Nur ${attackSignals} Angriffssignale gefunden; erwartet sind mindestens 3`);

if(failures.length){
 console.error("Animationsprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log("Animationsprüfung erfolgreich: Bogenschuss, Schwerthieb, Heldeneffekt, Trefferreaktion, Schildblock, Lauf-, Todes- und Projektilanimation bestätigt.");
