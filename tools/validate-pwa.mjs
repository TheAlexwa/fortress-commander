import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const main=read("js/main.js");
const pwa=read("js/pwa.js");
const sw=read("service-worker.js");
const manifest=JSON.parse(read("manifest.webmanifest"));
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

for(const text of [
 'rel="manifest" href="manifest.webmanifest"',
 'id="appLaunchScreen"',
 'id="appUpdateBanner"',
 'id="startInstallAppBtn"',
 'id="navInstallApp"',
 'id="installAppSettingsBtn"'
])requireText(html,text,"PWA-HTML fehlt");
requireText(main,'initializePwa({version:GAME_VERSION})',"PWA-Initialisierung fehlt");
for(const text of ["beforeinstallprompt","appinstalled","navigator.serviceWorker.register","controllerchange","registration.update()"])
 requireText(pwa,text,"PWA-Logik fehlt");
for(const text of ['CACHE_NAME="fortress-commander-v1.18.6"','type==="SKIP_WAITING"','request.mode==="navigate"'])
 requireText(sw,text,"Service-Worker-Funktion fehlt");

if(manifest.name!=="Fortress Commander")failures.push("Manifest-Name ist falsch");
if(manifest.display!=="standalone")failures.push("Manifest-Display ist nicht standalone");
if(manifest.start_url!=="./?source=pwa")failures.push("Manifest-Start-URL ist falsch");
if(!Array.isArray(manifest.icons)||manifest.icons.length<5)failures.push("Manifest enthält zu wenige Icons");
for(const icon of manifest.icons||[]){
 const iconPath=path.join(root,icon.src);
 if(!fs.existsSync(iconPath))failures.push(`Manifest-Icon fehlt: ${icon.src}`);
 else if(fs.statSync(iconPath).size<500)failures.push(`Manifest-Icon ist auffällig klein: ${icon.src}`);
}
const shellBlock=sw.split("];",1)[0];
const shellPaths=[...shellBlock.matchAll(/'([^']+)'/g)].map(match=>match[1]);
for(const asset of shellPaths){
 const assetPath=path.join(root,asset.replace(/^\.\//,""));
 if(!fs.existsSync(assetPath))failures.push(`Cache-Datei fehlt: ${asset}`);
}
for(const required of ["./index.html","./manifest.webmanifest","./js/main.js","./js/pwa.js","./js/audio.js","./js/troops.js","./assets/icons/icon-512.png","./assets/audio/wave-horn.mp3","./assets/audio/music-menu.mp3","./assets/audio/ambience-wind.mp3"]){
 if(!shellPaths.includes(required))failures.push(`Kern-Datei fehlt im Cache: ${required}`);
}
if(failures.length){
 console.error("PWA-Prüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log(`PWA-Prüfung erfolgreich: ${manifest.icons.length} Manifest-Icons und ${shellPaths.length} Offline-Dateien bestätigt.`);
