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

for(const text of [
 'style="--world-x:17.8%;--world-y:74.0%"',
 'style="--world-x:39.7%;--world-y:46.2%"',
 'style="--world-x:56.9%;--world-y:18.1%"',
 'style="--world-x:58.9%;--world-y:74.2%"',
 'style="--world-x:78.2%;--world-y:46.0%"',
 'class="worldMapPlayableBadge"'
])requireText(html,text,"Kartenposition oder Spielbar-Badge fehlt");

requireText(main,'const GAME_VERSION="1.18.7"',"Spielversion fehlt");
requireText(sw,'CACHE_NAME="fortress-commander-v1.18.7"',"Cacheversion fehlt");
requireText(sw,"'./assets/ui/campaign-map-v1.18.7.webp'","Kartenbild fehlt im Offline-Cache");

const nodeIds=[...html.matchAll(/class="worldNode[^\"]*"[^>]*data-world-id="([^"]+)"/g)].map(match=>match[1]);
if(nodeIds.length!==5)failures.push(`Erwartet werden 5 Weltknoten, gefunden: ${nodeIds.length}`);
if(new Set(nodeIds).size!==nodeIds.length)failures.push("Doppelte Weltknoten gefunden");

if(failures.length){
 console.error("Weltkartenprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log(`Weltkartenprüfung erfolgreich: ${nodeIds.length} Knoten, neues WebP-Kartenbild, responsive Hotspots und mobiler Info-Punkt bestätigt.`);
