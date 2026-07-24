import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const main=read("js/main.js");
const audio=read("js/audio.js");
const html=read("index.html");
const sw=read("service-worker.js");
const licenses=read("assets/audio/LICENSES.md");
const failures=[];
const effectFiles=[
 "arrow-shot.mp3","build-place.mp3","melee-hit.mp3","repair.mp3","siege-impact.mp3","tower-shot.mp3",
 "ui-click.mp3","ui-close.mp3","ui-error.mp3","upgrade-complete.mp3","wave-horn.mp3","wave-victory.mp3"
];
const longFiles=[
 "music-menu.mp3","music-build.mp3","music-battle.mp3","music-boss.mp3","music-defeat.mp3",
 "ambience-castle.mp3","ambience-blacksmith.mp3","ambience-wind.mp3"
];
const requiredFiles=[...effectFiles,...longFiles];
for(const file of requiredFiles){
 const relative=`assets/audio/${file}`;
 const full=path.join(root,relative);
 if(!fs.existsSync(full))failures.push(`Audiodatei fehlt: ${relative}`);
 else if(fs.statSync(full).size<2000)failures.push(`Audiodatei ist auffällig klein: ${relative}`);
 if(!sw.includes(`'./${relative}'`))failures.push(`Audiodatei fehlt im Offline-Cache: ${relative}`);
 if(!licenses.includes(`\`${file}\``))failures.push(`Audiodatei fehlt in der Lizenzübersicht: ${file}`);
}
for(const text of [
 'initializeAudio()',
 'playSound("waveHorn"',
 'playSound("waveVictory"',
 'playSound("buildPlace"',
 'playSound("upgradeComplete"',
 'playSound("repair"',
 'playSound("arrowShot"',
 'from?.key==="archer"',
 'from?.key==="soldier"',
 'playSound("meleeHit"',
 'playSound("towerShot"',
 'playSound("siegeImpact"',
 'updateAudioScene(audioSceneSnapshot())',
 'enemy.type==="boss"',
 'music="defeat"',
 'workshopPanelOpen'
])if(!main.includes(text))failures.push(`Audio-Ereignis oder Szenensteuerung fehlt: ${text}`);
for(const text of [
 'id="soundToggleBtn"','id="navSound"','id="audioSettingsSection"','id="audioMasterVolume"',
 'id="audioMusicVolume"','id="audioAmbienceVolume"','id="audioEffectsVolume"','id="audioUiVolume"',
 'id="audioMuteToggle"','id="audioTestMusicBtn"','id="audioTestAmbienceBtn"'
])if(!html.includes(text))failures.push(`Audio-Oberfläche fehlt: ${text}`);
for(const text of [
 "AUDIO_PREFERENCES_KEY","MUSIC_DEFINITIONS","AMBIENCE_DEFINITIONS","musicChannels","maxVoices","GLOBAL_LIMIT",
 "visibilitychange","preloadAudio","toggleAudioMute","setMusicState","setAmbienceState","updateAudioScene",
 "pauseLongAudio","resumeLongAudio","stopAllLongAudio","linearRampToValueAtTime"
])if(!audio.includes(text))failures.push(`Audioengine-Funktion fehlt: ${text}`);
for(const key of ["menu","build","battle","boss","defeat"])if(!audio.includes(`${key}:{file:`))failures.push(`Musikdefinition fehlt: ${key}`);
for(const key of ["castle","blacksmith","wind"])if(!audio.includes(`${key}:{file:`))failures.push(`Atmosphärendefinition fehlt: ${key}`);
if(!licenses.includes("Nicht aus dem ZIP feststellbar"))failures.push("Fehlende Lizenzangaben der neuen Dateien sind nicht transparent gekennzeichnet");
if(!sw.includes('CACHE_NAME="fortress-commander-v1.18.4"'))failures.push("Service-Worker-Cacheversion ist nicht v1.18.4");
if(failures.length){console.error("Audio-Prüfung fehlgeschlagen:\n- "+failures.join("\n- "));process.exit(1)}
console.log(`Audio-Prüfung erfolgreich: ${requiredFiles.length} Dateien, fünf Musikzustände, drei Atmosphärenkanäle, Lautstärkesteuerung und Offline-Cache bestätigt.`);
