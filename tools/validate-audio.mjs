import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const main=read("js/main.js");
const audio=read("js/audio.js");
const html=read("index.html");
const sw=read("service-worker.js");
const failures=[];
const requiredFiles=[
 "arrow-shot.mp3","build-place.mp3","melee-hit.mp3","repair.mp3","siege-impact.mp3","tower-shot.mp3",
 "ui-click.mp3","ui-close.mp3","ui-error.mp3","upgrade-complete.mp3","wave-horn.mp3","wave-victory.mp3"
];
for(const file of requiredFiles){
 const relative=`assets/audio/${file}`;
 const full=path.join(root,relative);
 if(!fs.existsSync(full))failures.push(`Audiodatei fehlt: ${relative}`);
 else if(fs.statSync(full).size<2000)failures.push(`Audiodatei ist auffällig klein: ${relative}`);
 if(!sw.includes(`'./${relative}'`))failures.push(`Audiodatei fehlt im Offline-Cache: ${relative}`);
}
for(const text of [
 'initializeAudio()',
 'playSound("waveHorn"',
 'playSound("waveVictory"',
 'playSound("buildPlace"',
 'playSound("upgradeComplete"',
 'playSound("repair"',
 'playSound("arrowShot"',
 'playSound("meleeHit"',
 'playSound("towerShot"',
 'playSound("siegeImpact"'
])if(!main.includes(text))failures.push(`Sound-Ereignis fehlt: ${text}`);
for(const text of [
 'id="soundToggleBtn"','id="navSound"','id="audioSettingsSection"','id="audioMasterVolume"',
 'id="audioEffectsVolume"','id="audioUiVolume"','id="audioMuteToggle"'
])if(!html.includes(text))failures.push(`Sound-Oberfläche fehlt: ${text}`);
for(const text of ["AUDIO_PREFERENCES_KEY","maxVoices","GLOBAL_LIMIT","visibilitychange","preloadAudio","toggleAudioMute"])
 if(!audio.includes(text))failures.push(`Soundengine-Funktion fehlt: ${text}`);
if(!fs.existsSync(path.join(root,"assets/audio/LICENSES.md")))failures.push("Audio-Lizenzübersicht fehlt");
if(failures.length){console.error("Audio-Prüfung fehlgeschlagen:\n- "+failures.join("\n- "));process.exit(1)}
console.log(`Audio-Prüfung erfolgreich: ${requiredFiles.length} Sounds, Lautstärkesteuerung, Stimmenbegrenzung und Offline-Cache bestätigt.`);
