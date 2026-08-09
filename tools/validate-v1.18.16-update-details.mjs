import fs from "node:fs";

const read=(file)=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const html=read("index.html");
const pwa=read("js/pwa.js");
const main=read("js/main.js");
const sw=read("service-worker.js");
const style=read("css/style.css");
const mobile=read("css/mobile.css");
const notes=JSON.parse(read("release-notes.json"));
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};

for(const marker of [
 'id="appUpdateDetailsBtn"',
 'id="appUpdateDetailsOverlay"',
 'id="appUpdateDetailsTitle"',
 'id="appUpdateDetailsVersion"',
 'id="appUpdateDetailsList"',
 'id="appUpdateDetailsNowBtn"'
])requireText(html,marker,"Update-Details-HTML fehlt");

for(const marker of [
 "function normalizeReleaseNotes",
 "function loadReleaseNotes",
 "function showUpdateDetails",
 "function hideUpdateDetails",
 "function applyWaitingUpdate",
 'new URL("../release-notes.json",import.meta.url)',
 'fetch(notesUrl,{cache:"no-store"})',
 'byId("appUpdateDetailsBtn")?.addEventListener("click",showUpdateDetails)',
 'byId("appUpdateDetailsNowBtn")?.addEventListener("click",applyWaitingUpdate)'
])requireText(pwa,marker,"Update-Details-Logik fehlt");

for(const marker of [".appUpdateDetailsOverlay",".appUpdateDetailsCard","#appUpdateDetailsBtn"])requireText(style,marker,"Update-Details-CSS fehlt");
for(const marker of ["#appUpdateDetailsBtn{grid-column:1/2}",".appUpdateDetailsActions{display:grid"])requireText(mobile,marker,"Mobile Update-Details-CSS fehlt");

requireText(sw,'CACHE_NAME="fortress-commander-v1.18.19"',"Cacheversion fehlt");
requireText(sw,"'./release-notes.json'","Release-Notes fehlen im App-Shell");
requireText(sw,'url.pathname.endsWith("/release-notes.json")',"Netzwerkzuerst-Regel fuer Release-Notes fehlt");
requireText(sw,'fetch(request,{cache:"no-store"})',"No-store-Abruf fuer Release-Notes fehlt");

if(notes.version!=="1.18.19")failures.push("release-notes.json hat falsche Version");
if(notes.title!=="Mehrwelt-Speicherfundament")failures.push("release-notes.json hat falschen Titel");
if(!Array.isArray(notes.changes)||notes.changes.length<5)failures.push("release-notes.json enthaelt zu wenige Aenderungen");
if(notes.saveCompatible!==true)failures.push("Spielstand-Kompatibilitaet ist nicht bestaetigt");

for(const marker of [
 "Updates &amp; Patchdetails",
 "Abriss &amp; Rückerstattung",
 "Eigene Torwege",
 "Burgwache &amp; Andreas",
 "dynamisch durch Tore, Breschen oder angreifbare Mauersegmente",
 "Überfüllte Wege werden gemieden",
 "maximal 72 Punkte erreichbar",
 "Burg, beschädigte Befestigungen, Türme und Versorgungsgebäude"
])requireText(html,marker,"Aktualisierte Anleitung fehlt");

for(const stale of [
 "Layout v1.15.1",
 "Zentrum des künftigen Aufbausystems",
 "Nord-, Ost-, Süd- und Westlager sind jeweils einem Festungstor zugeordnet",
 "höchstens sechs"
])if(html.includes(stale))failures.push(`Veralteter Anleitungstext noch vorhanden: ${stale}`);

for(const marker of [
 'const GAME_VERSION="1.18.19"',
 'const GAME_RELEASE_NAME="Mehrwelt-Speicherfundament"'
])requireText(main,marker,"v1.18.19 Versionsangabe fehlt");

for(const protectedValue of [
 'soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82',
 'guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25',
 'hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35'
])requireText(main,protectedValue,"Geschuetzter Einheitenwert veraendert");

if(failures.length){
 console.error("v1.18.19-Update-und-Anleitungspruefung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log("v1.18.19-Update-und-Anleitungspruefung erfolgreich: Patchdetails, netzwerkfrische Release-Notes, mobile Darstellung, aktualisierte Anleitung und unveraenderte Kampfwerte bestaetigt.");
