import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const css=read("css/style.css");
const main=read("js/main.js");
const sw=read("service-worker.js");
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};
const mapRelative="assets/ui/campaign-map-v1.18.7.webp";
const mapPath=path.join(root,mapRelative);

if(!fs.existsSync(mapPath))failures.push(`Kartenbild fehlt: ${mapRelative}`);
else{
 const data=fs.readFileSync(mapPath);
 if(data.length<100_000)failures.push("Kartenbild ist auffällig klein");
 if(data.subarray(0,4).toString("ascii")!=="RIFF"||data.subarray(8,12).toString("ascii")!=="WEBP")failures.push("Kartenbild ist kein gültiger WebP-Container");
}

for(const [id,label] of [
 ["borderlands","Grenzmark"],
 ["mistwood","Nebelwald"],
 ["frozen-pass","Eispass"],
 ["scorched-plains","Brandland"],
 ["ironclan-heart","Eisenclan"]
]){
 requireText(html,`data-world-id="${id}"`,`Weltknoten fehlt`);
 requireText(html,`>${label}</small>`,`Weltname fehlt`);
}

for(const text of [
 'campaign-map-v1.18.7.webp',
 'aspect-ratio:4/3',
 '.worldMapPlayableBadge',
 '.fantasyWorldMap .worldNode.selected:before',
 '.buildBtn[data-group="units"] .buildInfoBtn',
 'right:-1px!important',
 'top:-1px!important'
])requireText(css,text,"Weltkarten- oder Info-CSS fehlt");

requireText(html,'class="worldMapPlayableBadge"',"Spielbar-Badge fehlt");

requireText(main,'const GAME_VERSION="1.18.9"',"Spielversion fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.9"',"Cacheversion fehlt");
requireText(sw,"'./assets/ui/campaign-map-v1.18.7.webp'","Kartenbild fehlt im Offline-Cache");

const nodeIds=[...html.matchAll(/class="worldNode[^\"]*"[^>]*data-world-id="([^"]+)"/g)].map(match=>match[1]);
const expectedNodes={
 "borderlands":"--world-x:17.58%;--world-y:74.63%;--world-ring:84%",
 "mistwood":"--world-x:40.99%;--world-y:48.94%;--world-ring:88%",
 "frozen-pass":"--world-x:58.32%;--world-y:20.12%;--world-ring:84%",
 "scorched-plains":"--world-x:60.05%;--world-y:76.29%;--world-ring:88%",
 "ironclan-heart":"--world-x:80.70%;--world-y:49.03%;--world-ring:93%"
};
for(const [id,style] of Object.entries(expectedNodes)){
 requireText(html,`data-world-id="${id}"`,`Weltknoten fehlt`);
 requireText(html,style,`Weltknoten ist nicht exakt ausgerichtet: ${id}`);
}
for(const key of ["soldier","guard"]){
 const match=html.match(new RegExp(`<span class="buildInfoBtn" data-build-info="${key}"[^>]*>([^<]*)<\/span>`));
 if(!match||match[1].trim()!=="")failures.push(`Info-Punkt ${key} enthält weiterhin ein doppeltes sichtbares Zeichen`);
}
for(const text of [
 'width:var(--world-ring,86%)',
 '.buildBtn[data-group="units"] .buildInfoBtn::after',
 'font-size:0!important',
 'right:2px',
 'top:2px'
])requireText(css,text,"Ausrichtungs-CSS fehlt");
if(nodeIds.length!==5)failures.push(`Erwartet werden 5 Weltknoten, gefunden: ${nodeIds.length}`);
if(new Set(nodeIds).size!==nodeIds.length)failures.push("Doppelte Weltknoten gefunden");

if(failures.length){
 console.error("Weltkartenprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log(`Weltkartenprüfung erfolgreich: ${nodeIds.length} Knoten, neues WebP-Kartenbild, pixelgenaue Hotspots, passende Ringgrößen und einzelner mobiler Info-Punkt bestätigt.`);
