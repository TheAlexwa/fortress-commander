import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const main=fs.readFileSync(path.join(root,"js","main.js"),"utf8");
const css=fs.readFileSync(path.join(root,"css","style.css"),"utf8");
const expected=[
 "testResourcePanel","statsScreen","workshopPanel","marketPanel","statueOfferingPanel",
 "warCouncilPanel","bonusObjectivePanel","campaignPanel","veteranPanel","enemyInfoOverlay",
 "pauseMenu","instructionsScreen","repairDecision","commanderCampPanel","displaySettingsPanel"
];
const failures=[];
const requireText=(source,text,label)=>{if(!source.includes(text))failures.push(`${label}: ${text}`)};
for(const id of expected){
 requireText(html,`id="${id}"`,"HTML-Fenster fehlt");
 requireText(main,`case "${id}"`,"Schließen-Zuordnung fehlt");
}
for(const text of [
 'function openBlockingPanel(',
 'function closeBlockingPanel(',
 'function closeTopBlockingPanel(',
 'window.addEventListener("popstate"',
 'event.key==="Escape"',
 'panel.inert=!visible',
 'panelFocusBefore',
 'panelPauseBefore'
])requireText(main,text,"Fenstersteuerung fehlt");
for(const text of ["body.fcModalOpen",".fcPanelActive",".panelCornerClose"])requireText(css,text,"Fenster-CSS fehlt");
for(const text of ['id="marketCloseIconBtn"','id="pauseCloseBtn"','id="displaySettingsCloseBtn"','data-action="unit-overview"','id="troopOverviewBtn"'])requireText(html,text,"Schließen-Knopf oder Einheitenbuch fehlt");
for(const file of ["index.html","README.md","CHANGELOG.md","js/main.js"]){
 const content=fs.readFileSync(path.join(root,file),"utf8");
 requireText(content,"1.18.8",`Versionsangabe fehlt in ${file}`);
}
const forbidden=[
 /panel\.style\.display\s*=/,
 /panel\.style\.visibility\s*=/,
 /panel\.style\.pointerEvents\s*=/
];
for(const pattern of forbidden)if(pattern.test(main))failures.push(`Direkte Fenster-Sichtbarkeit gefunden: ${pattern}`);
if(failures.length){
 console.error("Fensterprüfung fehlgeschlagen:\n- "+failures.join("\n- "));
 process.exit(1);
}
console.log(`Fensterprüfung erfolgreich: ${expected.length} Dialoge, zentrale Steuerung, Einheitenbuch, Truppenanzeige und Version 1.18.8 bestätigt.`);
