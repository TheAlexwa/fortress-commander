import {
 ENEMY_CODEX,
 enemyStatsFor,
 loadDiscoveredEnemies,
 persistDiscoveredEnemies
} from "./enemies.js";

import {
 RESEARCH_TABS,
 RESEARCH_TECHS,
 getResearchLevel,
 getRepairHpPerTick,
 getRepairWoodPerTick,
 getCraftsmanMoveSpeed,
 getFortressAutoRepairPercent,
 getResearchedUnitStats,
 applyResearchToUnits,
 isResearchRequirementMet,
 getResearchBaseCost,
 getResearchCost,
 getAllResearchTechs
} from "./research.js";

import {
 getSupportProductionPerSecond,
 getTotalGoldPerSecond,
 getMarketLossPercent,
 getMarketOutput,
 runEconomySupportTick
} from "./economy.js";

import {
 residentCapacityForHouse as getResidentCapacityForHouse,
 syncResidents as syncResidentState,
 totalResidents as getTotalResidents,
 assignedResidents as getAssignedResidents,
 freeResidents as getFreeResidents,
 buildingHasWorker as hasBuildingWorker,
 toggleBuildingResident
} from "./villagers.js";

import {
 getBuildRequirement,
 createEntityAt,
 upgradeEntity,
 sellEntity
} from "./buildings.js";

import {
 findNearestEnemy,
 getTowerCoverage,
 chooseAutomaticTarget,
 getTowerBehindWall,
 findNearestCastleTower,
 findNearestBlockingUnit,
 createProjectile,
 grantCombatExperience,
 applyTowerTalent,
 applyUnitTalentUpgrade
} from "./combat.js";

import {
 getWaveEnemyCount,
 beginWave,
 createWaveEnemy,
 applyWaveAutoRepair,
 getTotalRepairDamage
} from "./game.js";

import { renderGameUI } from "./ui.js";
import { renderGameFrame } from "./render.js";
import { attachGameInput } from "./input.js";

// Fortress Commander – zentrale Initialisierung und Spielschleife.
// Fachlogik, Darstellung und Eingaben liegen in eigenständigen Modulen.

(()=>{
"use strict";
const GAME_VERSION="1.12.0";
const GAME_RELEASE_NAME="Modularisierung abgeschlossen";
const discoveredEnemies=loadDiscoveredEnemies();
function discoverEnemy(type){
 if(!ENEMY_CODEX[type]||discoveredEnemies.has(type))return;
 discoveredEnemies.add(type);
 persistDiscoveredEnemies(discoveredEnemies);
 renderBestiary();
 showToast(`Bestiarium: ${ENEMY_CODEX[type].name} entdeckt`);
}

document.documentElement.dataset.gameVersion=GAME_VERSION;
const gameVersionBadge=document.getElementById("gameVersionBadge");
const instructionVersion=document.getElementById("instructionVersion");
if(gameVersionBadge)gameVersionBadge.textContent=`v${GAME_VERSION}`;
if(instructionVersion)instructionVersion.textContent=`Anleitung · Version ${GAME_VERSION} – ${GAME_RELEASE_NAME}`;
const startScreen=document.getElementById("startScreen");
const instructionsScreen=document.getElementById("instructionsScreen");
const playHotspot=document.getElementById("playHotspot");
const instructionsHotspot=document.getElementById("instructionsHotspot");
const instructionsBackBtn=document.getElementById("instructionsBackBtn");
const instructionsCloseBtn=document.getElementById("instructionsCloseBtn");
const orientationGuard=document.getElementById("orientationGuard");
let orientationPauseActive=false;
let pausedBeforeOrientation=true;
function isPhoneLandscape(){return window.matchMedia("(orientation: landscape)").matches&&window.innerHeight<=700}
async function requestPortraitLock(){
 try{
  if(screen.orientation&&typeof screen.orientation.lock==="function")await screen.orientation.lock("portrait-primary");
 }catch(_){/* Browser ohne erlaubte Orientation-Lock-API: Schutzansicht übernimmt. */}
}
function handleOrientationChange(){
 const blocked=isPhoneLandscape();
 document.body.classList.toggle("orientationBlocked",blocked);
 if(orientationGuard)orientationGuard.style.display=blocked?"grid":"none";
 if(blocked){
  if(!orientationPauseActive){pausedBeforeOrientation=paused;orientationPauseActive=true}
  paused=true;
  if(typeof state!=="undefined")state.supportTimer=0;
  last=performance.now();
 }else if(orientationPauseActive){
  orientationPauseActive=false;
  paused=pausedBeforeOrientation||gameOver;
  last=performance.now();
  setTimeout(()=>resize(),80);
 }
}

function enterGame(){
 requestPortraitLock();
 startScreen.classList.add("hidden");
 instructionsScreen.classList.add("hidden");
 paused=false;
 last=performance.now();
 const recoverCanvas=()=>{
  handleOrientationChange();
  if(!isPhoneLandscape()){
   resize();
   if(canvas.width<2||canvas.height<2){
    canvas.width=Math.max(2,Math.floor(innerWidth*(devicePixelRatio||1)));
    canvas.height=Math.max(2,Math.floor(innerHeight*.65*(devicePixelRatio||1)));
    canvas.style.width="100%";canvas.style.height="100%";
    ctx.setTransform(Math.min(2,devicePixelRatio||1),0,0,Math.min(2,devicePixelRatio||1),0,0);
   }
   draw();updateUI();
  }
 };
 requestAnimationFrame(recoverCanvas);
 setTimeout(recoverCanvas,180);
}
let instructionsOpenedFromGame=false;
function openInstructions(){
 instructionsOpenedFromGame=startScreen.classList.contains("hidden");
 startScreen.classList.add("hidden");
 instructionsScreen.classList.remove("hidden");
 instructionsScreen.style.pointerEvents="auto";
 const back=document.getElementById("instructionsBackBtn");if(back)back.textContent=instructionsOpenedFromGame?"← Zurück zum Spiel":"← Zurück zum Startmenü";
 const book=instructionsScreen.querySelector(".instructionBook");if(book)book.scrollTop=0;
 renderBestiary();
 paused=true;
}
function returnToTitle(){
 instructionsScreen.classList.add("hidden");
 instructionsScreen.style.pointerEvents="none";
 if(instructionsOpenedFromGame){
  startScreen.classList.add("hidden");instructionsOpenedFromGame=false;
  if(!gameOver){paused=false;last=performance.now()}
  const menuButton=document.getElementById("navMenu");if(menuButton)menuButton.classList.remove("active");
  updateUI();
 }else{startScreen.classList.remove("hidden");paused=true}
}
playHotspot.addEventListener("click",enterGame);
instructionsHotspot.addEventListener("click",openInstructions);
instructionsBackBtn.addEventListener("click",returnToTitle);
instructionsCloseBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();returnToTitle()});
instructionsScreen.addEventListener("click",e=>{if(e.target===instructionsScreen)returnToTitle()});

const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),wrap=document.getElementById("gameWrap");
const ui={
 gold:document.getElementById("gold"),wood:document.getElementById("wood"),goldRate:document.getElementById("goldRate"),woodRate:document.getElementById("woodRate"),
 resourceOverviewBtn:document.getElementById("resourceOverviewBtn"),populationOverviewBtn:document.getElementById("populationOverviewBtn"),populationBusy:document.getElementById("populationBusy"),populationTotal:document.getElementById("populationTotal"),populationFree:document.getElementById("populationFree"),hp:document.getElementById("hp"),
 wallInfo:document.getElementById("wallInfo"),wave:document.getElementById("wave"),status:document.getElementById("waveStatus"),
 start:document.getElementById("startWaveBtn"),pause:document.getElementById("pauseBtn"),toast:document.getElementById("toast"),
 selected:document.getElementById("selectedPanel"),levelDock:document.getElementById("levelUpDock"),upgrade:document.getElementById("upgradeBtn"),
 repairWall:document.getElementById("repairWallBtn"),craftsmanToggle:document.getElementById("craftsmanToggleBtn"),marketTrade:document.getElementById("marketTradeBtn"),sell:document.getElementById("sellBtn"),
 zoomOut:document.getElementById("zoomOutBtn"),zoomIn:document.getElementById("zoomInBtn"),zoomLabel:document.getElementById("zoomLabel"),
 selectionHud:document.getElementById("selectionHud"),selectionText:document.getElementById("selectionText"),selectionPortrait:document.getElementById("selectionPortrait")
};
const TAU=Math.PI*2;
const WORLD_W=2400,WORLD_H=1700,CX=WORLD_W/2,CY=WORLD_H/2;
const WALL_R=355,WALL_SEGMENTS=24,WALL_MAX_HP=420;
let vw=1000,vh=700,dpr=1,last=performance.now(),paused=true,gameOver=false;
let zoom=.48,minZoom=.15,maxZoom=1.45,camX=CX,camY=CY;
let buildMode=null,selected=null,unitCommandMode=null,toastTimer=0;
const BUILD={
 archer:{name:"Bogenturm",kind:"tower",gold:60,wood:20,hp:260,range:215,rate:.72,damage:17,speed:470,color:"#b98a4d"},
 crossbow:{name:"Armbrustturm",kind:"tower",gold:95,wood:30,hp:320,range:265,rate:1.45,damage:46,speed:560,color:"#73513b"},
 catapult:{name:"Katapult",kind:"tower",gold:140,wood:55,hp:390,range:315,rate:2.45,damage:58,speed:330,splash:62,color:"#5b554c"},
 soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82,color:"#416a93"},
 guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25,color:"#72583b"},
 house:{name:"Zeltlager",kind:"inside",gold:65,wood:20,color:"#9b7651"},
 lumber:{name:"Holzfäller",kind:"inside",gold:70,wood:0,color:"#8c6c45"},
 workshop:{name:"Werkstatt",kind:"inside",gold:110,wood:40,color:"#6b6b70"},
 repair:{name:"Handwerkerhaus",kind:"inside",gold:90,wood:35,color:"#8b7063"},
 market:{name:"Marktplatz",kind:"inside",gold:150,wood:60,color:"#8a6b3d"}
};
const state={gold:210,wood:105,researchPoints:0,hp:1200,maxHp:1200,wave:1,inWave:false,toSpawn:0,spawnTimer:0,supportTimer:0,kills:0,nextUnitId:0,nextBuildingId:0,nextResidentId:0,
 enemies:[],projectiles:[],buildings:[],units:[],particles:[],walls:[],craftsmen:[],residents:[],repairActive:false,repairedHp:0,research:{fortress_autoRepair:0,guard_hp:0,guard_armor:0,archer_damage:0,archer_range:0,archer_rate:0,craft_repair:0,craft_wood:0,craft_speed:0}};
const wallSlots=[],insideSlots=[],castleSlots=[];

function initMap(){
 state.walls.length=0;wallSlots.length=0;insideSlots.length=0;castleSlots.length=0;
 for(let i=0;i<WALL_SEGMENTS;i++){
  const a0=-Math.PI/2+i*TAU/WALL_SEGMENTS,a1=-Math.PI/2+(i+1)*TAU/WALL_SEGMENTS,am=(a0+a1)/2;
  state.walls.push({i,a0,a1,am,hp:WALL_MAX_HP,maxHp:WALL_MAX_HP});
  wallSlots.push({type:"wall",i,x:CX+Math.cos(am)*(WALL_R-48),y:CY+Math.sin(am)*(WALL_R-48),building:null});
 }
 const gap=112,coords=[[-1.5,-1],[-.5,-1],[.5,-1],[1.5,-1],[-1.5,0],[1.5,0],[-1.5,1],[-.5,1],[.5,1],[1.5,1]];
 for(const [gx,gy] of coords)insideSlots.push({type:"inside",x:CX+gx*gap,y:CY+gy*gap,building:null});
 const castleCorners=[[-58,-51],[58,-51],[-58,51],[58,51]];
 castleCorners.forEach(([ox,oy],i)=>castleSlots.push({type:"castle",i,x:CX+ox,y:CY+oy,building:null}));
}
function resize(){
 const r=wrap.getBoundingClientRect();vw=r.width;vh=r.height;dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);canvas.style.width=vw+"px";canvas.style.height=vh+"px";
 ctx.setTransform(dpr,0,0,dpr,0,0);
}
function clampCamera(){
 const halfW=vw/(2*zoom),halfH=vh/(2*zoom);
 camX=Math.max(halfW,Math.min(WORLD_W-halfW,camX));camY=Math.max(halfH,Math.min(WORLD_H-halfH,camY));
}
function setZoom(v,focusX=vw/2,focusY=vh/2){
 const before=screenToWorld(focusX,focusY);zoom=Math.max(minZoom,Math.min(maxZoom,v));
 const after=screenToWorld(focusX,focusY);camX+=before.x-after.x;camY+=before.y-after.y;clampCamera();
 ui.zoomLabel.textContent=Math.round(zoom*100)+"%";
}
function screenToWorld(x,y){return{x:camX+(x-vw/2)/zoom,y:camY+(y-vh/2)/zoom}}
function showToast(t){ui.toast.textContent=t;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1900)}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function angleIndex(x,y){
 let a=Math.atan2(y-CY,x-CX);if(a< -Math.PI/2)a+=TAU;
 return Math.max(0,Math.min(WALL_SEGMENTS-1,Math.floor((a+Math.PI/2)/(TAU/WALL_SEGMENTS))));
}
function waveCount(w){return getWaveEnemyCount(w)}
function workshopLevels(){return Object.values(state.research||{}).reduce((sum,level)=>sum+level,0)}
function workshopBuilding(){return state.buildings.find(b=>b.key==="workshop")||null}
function workshopBuildingLevel(){return Math.max(1,Math.min(5,Number(workshopBuilding()?.level||1)))}
function globalResearchIncreaseRate(){return [0,.30,.25,.20,.15,.10][workshopBuildingLevel()]}
function otherResearchLevels(techId){return Object.entries(state.research||{}).reduce((sum,[id,level])=>sum+(id===techId?0:Number(level)||0),0)}
function globalResearchMultiplier(techId){return 1+otherResearchLevels(techId)*globalResearchIncreaseRate()}
function residentCapacityForHouse(house){return getResidentCapacityForHouse(house)}
function syncResidents(){return syncResidentState(state)}
function totalResidents(){return getTotalResidents(state)}
function assignedResidents(){return getAssignedResidents(state)}
function freeResidents(){return getFreeResidents(state)}
function buildingHasWorker(building){return hasBuildingWorker(building)}
const REPAIR_TICK_SECONDS=1;
const BASE_REPAIR_HP_PER_TICK=16;
const BASE_REPAIR_WOOD_PER_TICK=0.5;
function researchLevel(id){return getResearchLevel(state.research,id)}
function repairHpPerTick(){return getRepairHpPerTick(state.research,BASE_REPAIR_HP_PER_TICK)}
function repairWoodPerTick(){return getRepairWoodPerTick(state.research,BASE_REPAIR_WOOD_PER_TICK)}
function craftsmanMoveSpeed(){return getCraftsmanMoveSpeed(state.research)}
function fortressAutoRepairPercent(){return getFortressAutoRepairPercent(state.research)}
function researchedUnitStats(key){return getResearchedUnitStats(key,BUILD,state.research)}
function applyResearchToExistingUnits(techId,oldLevel,newLevel){return applyResearchToUnits(state.units,techId,oldLevel,newLevel)}

function applyAutomaticWaveRepair(){return applyWaveAutoRepair(state,fortressAutoRepairPercent())}
function totalRepairDamage(){return getTotalRepairDamage(state)}

let activeResearchTab="fortress";
function researchRequirementMet(tech){return isResearchRequirementMet(tech,state.research)}
function researchBaseCost(tech){return getResearchBaseCost(tech,state.research)}
function researchCost(tech){return getResearchCost(tech,state.research,globalResearchMultiplier(tech.id))}
function openWorkshopPanel(){
 if(!state.buildings.some(b=>b.key==="workshop"))return showToast("Zuerst eine Werkstatt bauen");
 hideRepairDecision();paused=true;last=performance.now();
 document.getElementById("workshopPanel").classList.remove("hidden");renderWorkshop();
}
function closeWorkshopPanel(resume=true){document.getElementById("workshopPanel").classList.add("hidden");if(resume&&!gameOver){paused=false;last=performance.now()}updateUI()}
function renderWorkshop(){
 const tabs=document.getElementById("workshopTabs"),tree=document.getElementById("techTree"),points=document.getElementById("workshopPointsValue");
 points.textContent=Math.floor(state.researchPoints||0);
 tabs.innerHTML=RESEARCH_TABS.map(t=>`<button type="button" class="workshopTab ${t.id===activeResearchTab?"active":""}" data-research-tab="${t.id}">${t.label}</button>`).join("");
 const tab=RESEARCH_TABS.find(t=>t.id===activeResearchTab),techs=RESEARCH_TECHS[activeResearchTab]||[];
 const globalPct=Math.round(globalResearchIncreaseRate()*100),workshopLv=workshopBuildingLevel(),totalLevels=workshopLevels();
 tree.innerHTML=`<p class="techTreeIntro">${tab.intro}<br><b>Globale Forschungsskalierung:</b> Jede erforschte Stufe erhöht die Kosten aller anderen Technologien um ${globalPct} %. Werkstatt Stufe ${workshopLv}/5 · insgesamt ${totalLevels} Forschungsstufen.</p><div class="techTrack">${techs.map(tech=>{
  const lv=state.research[tech.id]||0,maxed=lv>=tech.max,unlocked=researchRequirementMet(tech),cost=researchCost(tech),canBuy=unlocked&&!maxed&&(state.researchPoints||0)>=cost;
  const pips=Array.from({length:tech.max},(_,i)=>`<span class="techPip ${i<lv?"on":""}"></span>`).join("");
  const value=tech.values?`${lv?tech.values[lv-1]:"0 %"}`:`Stufe ${lv}/${tech.max}`;
  const nextValue=tech.values&&lv<tech.max?tech.values[lv]:null;
  const requirement=tech.requires?Object.values(RESEARCH_TECHS).flat().find(t=>t.id===tech.requires):null;
  const baseCost=researchBaseCost(tech),globalAdded=Math.max(0,cost-baseCost);
  const tooltip=maxed?`${tech.name} ist vollständig erforscht.`:!unlocked?`Benötigt zuerst: ${requirement?.name||"vorherige Technologie"}.`:`Nächste Stufe kostet ${cost} Forschungspunkte (${baseCost} Basis${globalAdded?` + ${globalAdded} global`:""}). Wirkung tritt sofort ein.`;
  const label=maxed?"✓ MAX":!unlocked?"🔒 Gesperrt":`🔬 ${cost} erforschen`;
  return `<article class="techNode ${!unlocked?"locked":""} ${maxed?"maxed":""} ${canBuy?"available":""}" data-tooltip="${tooltip}"><div class="techIcon" aria-hidden="true">${tech.icon}</div><div><h3>${tech.name}</h3><p>${tech.desc}</p><span class="techEffect">Aktuell: ${value}${nextValue?` <span class="techNext">→ ${nextValue}</span>`:""}</span><div class="techLevel" aria-label="Stufe ${lv} von ${tech.max}">${pips}</div></div><button type="button" class="techBuy" data-tech="${tech.id}" data-tooltip="${tooltip}" ${canBuy?"":"disabled"}>${label}</button></article>`
 }).join("")}</div>`;
}
function buyResearch(techId){
 const tech=Object.values(RESEARCH_TECHS).flat().find(t=>t.id===techId);if(!tech)return;
 const lv=state.research[tech.id]||0;if(lv>=tech.max)return showToast("Technologie bereits maximiert");
 if(!researchRequirementMet(tech))return showToast("Vorherige Technologie zuerst erforschen");
 const cost=researchCost(tech);if((state.researchPoints||0)<cost)return showToast("Nicht genug Forschungspunkte");
 state.researchPoints-=cost;state.research[tech.id]=lv+1;applyResearchToExistingUnits(tech.id,lv,lv+1);showToast(`${tech.name}: Stufe ${lv+1} · andere Forschungen +${Math.round(globalResearchIncreaseRate()*100)} %`);renderWorkshop();updateUI();saveGame(true);
}
document.getElementById("workshopResearchBtn").addEventListener("click",openWorkshopPanel);
document.getElementById("workshopCloseBtn").addEventListener("click",()=>closeWorkshopPanel(true));
document.getElementById("workshopPanel").addEventListener("click",e=>{if(e.target.id==="workshopPanel")closeWorkshopPanel(true)});
document.getElementById("workshopTabs").addEventListener("click",e=>{const b=e.target.closest("[data-research-tab]");if(!b)return;activeResearchTab=b.dataset.researchTab;renderWorkshop()});
document.getElementById("techTree").addEventListener("click",e=>{const b=e.target.closest("[data-tech]");if(b)buyResearch(b.dataset.tech)});


function refreshSaveStatus(){
 const box=document.getElementById("saveStatus");
 const load=document.getElementById("loadGameBtn");
 const del=document.getElementById("deleteSaveBtn");
 if(load)load.disabled=true;
 if(del)del.disabled=true;
 if(box){box.className="saveStatus warn";box.textContent="Speichern und Laden sind vorübergehend deaktiviert."}
}
function saveGame(silent=false){if(!silent)showToast("Speichern ist vorübergehend deaktiviert");return false}
function loadGame(){showToast("Laden ist vorübergehend deaktiviert");return false}
function deleteSave(){showToast("Es gibt keinen aktiven Spielstand")}



function updateUI(){
 return renderGameUI({
  state,ui,BUILD,WALL_SEGMENTS,selected,buildMode,paused,gameOver,
  navResearch,navResearchBadge,closeAllBlockingPanels,totalGoldPerSecond,
  totalWoodPerSecond,syncResidents,assignedResidents,totalResidents,freeResidents,
  waveCount,buildRequirement,residentCapacityForHouse,buildingHasWorker,
  supportProductionPerSecond,repairHpPerTick,workshopLevels,
  globalResearchIncreaseRate,marketLossPercent
 });
}

function buildRequirement(key){return getBuildRequirement(state,key)}

function closeAllBlockingPanels(){
 hideRepairDecision();
 const stats=document.getElementById("statsScreen");
 if(stats&&stats.classList.contains("hidden")){stats.style.display="none";stats.style.pointerEvents="none";stats.style.visibility="hidden"}
 const ins=document.getElementById("instructionsScreen");
 if(ins&&ins.classList.contains("hidden"))ins.style.pointerEvents="none";
}

function startWave(){
 return beginWave(state,{
  gameOver,assignCraftsmen,hideRepairDecision,showToast,
  setPaused:value=>{paused=value},
  setBuildMode:value=>{buildMode=value},
  setSelected:value=>{selected=value}
 });
}
function spawnEnemy(){
 return createWaveEnemy(state,{WORLD_W,WORLD_H,TAU,enemyStatsFor,discoverEnemy});
}
function createAt(x,y,key){
 return createEntityAt(x,y,key,{
  state,BUILD,CX,CY,WALL_R,wallSlots,castleSlots,insideSlots,
  researchedUnitStats,syncResidents,showToast,
  setBuildMode:value=>{buildMode=value},
  setSelected:value=>{selected=value}
 });
}
function upgradeSelected(){
 return upgradeEntity(selected,{state,syncResidents,showToast,globalResearchIncreaseRate});
}
function sellSelected(){
 return sellEntity(selected,{
  state,syncResidents,showToast,
  setSelected:value=>{selected=value}
 });
}
let residentAssignmentBusy=false;
function setBuildingResident(building){
 if(residentAssignmentBusy)return false;
 residentAssignmentBusy=true;
 try{
  const changed=toggleBuildingResident(state,building,{assignCraftsmen,showToast});
  updateUI();
  return changed;
 }finally{residentAssignmentBusy=false}
}
function repairSelectedWall(){
 if(!selected||selected.kind!=="building")return;
 setBuildingResident(selected);
}
function toggleCraftsmanWork(){
 if(!selected||selected.kind!=="building"||selected.key!=="repair"||!buildingHasWorker(selected))return;
 selected.repairEnabled=selected.repairEnabled===false;
 for(const c of state.craftsmen)if(c.home===selected||c.homeId===selected.bid)sendCraftsmanHome(c);
 showToast(selected.repairEnabled?"Handwerker arbeitet wieder":"Handwerkerarbeit gestoppt");
 updateUI();
}
function combatCallbacks(){
 return {burst,isSelected:entity=>selected===entity,showToast};
}
function nearestEnemy(x,y,range){return findNearestEnemy(state.enemies,x,y,range)}
function towerCoverage(enemy){return getTowerCoverage(state.buildings,enemy)}
function chooseAutoTarget(unit){
 return chooseAutomaticTarget(unit,{enemies:state.enemies,units:state.units,buildings:state.buildings,centerX:CX,centerY:CY});
}
function towerBehindWall(index){return getTowerBehindWall(wallSlots,index)}
function nearestCastleTower(enemy){return findNearestCastleTower(state.buildings,enemy)}
function nearestBlockingUnit(enemy,maxRange=58){
 return findNearestBlockingUnit(state.units,enemy,{centerX:CX,centerY:CY,wallRadius:WALL_R,maxRange});
}
function shoot(from,target,damage,speed,splash=0,color="#f0d176"){
 return createProjectile(state.projectiles,from,target,damage,speed,splash,color);
}
function grantCombatXp(owner,amount){return grantCombatExperience(owner,amount,combatCallbacks())}
function applyTowerExpTalent(tower,type){return applyTowerTalent(tower,type,combatCallbacks())}
function applyUnitTalent(unit,type){
 const changed=applyUnitTalentUpgrade(unit,type,combatCallbacks());
 if(changed)unitCommandMode=null;
 return changed;
}
function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=20+Math.random()*80;state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.5,color,size:1+Math.random()*3})}}


function supportProductionPerSecond(building){
 return getSupportProductionPerSecond(building,buildingHasWorker);
}
function totalGoldPerSecond(){
 return getTotalGoldPerSecond(state,{syncResidents,residentCapacityForHouse,buildingHasWorker});
}
function marketLossPercent(building){return getMarketLossPercent(building)}
function marketOutput(amount,building){return getMarketOutput(amount,building)}
function runSupportTick(){
 return runEconomySupportTick(state,{paused,gameOver,syncResidents,residentCapacityForHouse,buildingHasWorker});
}
function repairTargetInfo(target){
 if(!target)throw new Error("Ungültiges Reparaturziel");
 if(target.kind==="castle")return {x:CX,y:CY-12,need:()=>state.maxHp-state.hp,apply:v=>state.hp=Math.min(state.maxHp,state.hp+v)};
 // Mauersegmente besitzen historisch kein kind-Feld. Deshalb zusätzlich an Winkel/HP erkennen.
 if(target.kind==="wall"||(Number.isFinite(target.am)&&Number.isFinite(target.hp)&&Number.isFinite(target.maxHp))){
  return {x:CX+Math.cos(target.am)*WALL_R,y:CY+Math.sin(target.am)*WALL_R,need:()=>target.maxHp-target.hp,apply:v=>target.hp=Math.min(target.maxHp,target.hp+v)};
 }
 if(target.slot)return {x:target.slot.x,y:target.slot.y,need:()=>target.maxHp-target.hp,apply:v=>target.hp=Math.min(target.maxHp,target.hp+v)};
 throw new Error("Reparaturziel ohne Position");
}
function damagedRepairTargets(){
 const list=[];
 if(state.hp<state.maxHp)list.push({kind:"castle"});
 list.push(...state.walls.filter(w=>w.hp<w.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp));
 list.push(...state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0&&b.hp<b.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp));
 return list;
}
function assignCraftsmen(){
 // Genau ein sichtbarer Handwerker pro gültig besetztem Handwerkerhaus.
 const homes=state.buildings.filter(b=>b&&b.key==="repair"&&b.slot&&b.residentId&&buildingHasWorker(b));
 const wanted=new Map(homes.map(home=>[home.residentId,home]));
 state.craftsmen=state.craftsmen.filter(c=>c&&wanted.has(c.residentId));
 for(const c of state.craftsmen){
  const home=wanted.get(c.residentId);
  c.home=home;c.homeId=home.bid;
  if(!Number.isFinite(c.x)||!Number.isFinite(c.y)){c.x=home.slot.x;c.y=home.slot.y}
 }
 for(const [residentId,home] of wanted){
  if(state.craftsmen.some(c=>c.residentId===residentId))continue;
  const resident=state.residents.find(r=>r.id===residentId&&r.job==="craftsman"&&r.workplaceId===home.bid);
  if(!resident)continue;
  state.craftsmen.push({x:home.slot.x,y:home.slot.y,home,target:null,mode:"idle",repairTimer:0,job:"craftsman",residentId,homeId:home.bid});
 }
}
function moveCraftsman(c,x,y,dt){
 const dx=x-c.x,dy=y-c.y,d=Math.hypot(dx,dy);
 if(d<=4){c.x=x;c.y=y;return true}
 const step=Math.min(d,craftsmanMoveSpeed()*dt);c.x+=dx/d*step;c.y+=dy/d*step;return false;
}
function sendCraftsmanHome(c){c.target=null;c.mode="returning";c.repairTimer=0}
function chooseCraftsmanTarget(c){
 const targets=damagedRepairTargets();
 if(!targets.length){sendCraftsmanHome(c);return false}
 const occupied=new Set(state.craftsmen.filter(o=>o!==c&&o.target).map(o=>o.target));
 const available=targets.filter(t=>!occupied.has(t));
 const pool=available.length?available:targets;
 pool.sort((a,b)=>{
  const ai=repairTargetInfo(a),bi=repairTargetInfo(b);
  return Math.hypot(ai.x-c.x,ai.y-c.y)-Math.hypot(bi.x-c.x,bi.y-c.y);
 });
 c.target=pool[0];c.mode="outbound";c.repairTimer=0;return true;
}
function updateCraftsmen(dt){
 assignCraftsmen();
 const goHome=c=>{
  if(!c||!c.home||!c.home.slot)return;
  sendCraftsmanHome(c);
  moveCraftsman(c,c.home.slot.x,c.home.slot.y,dt);
  if(dist(c,c.home.slot)<5)c.mode="idle";
 };
 // In Bauphase und in echter Pause bleibt der Handwerker am Handwerkerhaus.
 if(!state.inWave){state.repairActive=false;state.craftsmen.forEach(goHome);return}
 const activeCraftsmen=state.craftsmen.filter(c=>c.home&&c.home.repairEnabled!==false);
 state.repairActive=totalRepairDamage()>.01&&activeCraftsmen.length>0;
 if(!state.repairActive){state.craftsmen.forEach(goHome);return}
 for(const c of state.craftsmen){
  if(!c.home||!c.home.slot){c.target=null;continue}
  if(c.home.repairEnabled===false){goHome(c);continue}
  let targetValid=false;
  if(c.target){
   try{targetValid=repairTargetInfo(c.target).need()>.01}catch(_){targetValid=false}
  }
  if(!targetValid)chooseCraftsmanTarget(c);
  if(!c.target){goHome(c);continue}
  let info;
  try{info=repairTargetInfo(c.target)}catch(_){c.target=null;goHome(c);continue}
  if(!Number.isFinite(info.x)||!Number.isFinite(info.y)){c.target=null;goHome(c);continue}
  if(!moveCraftsman(c,info.x,info.y,dt))continue;
  c.mode="repairing";c.repairTimer=(c.repairTimer||0)+dt;
  if(c.repairTimer>=REPAIR_TICK_SECONDS&&info.need()>.01){
   if(state.wood<repairWoodPerTick()){c.repairTimer=0;c.mode="waiting";goHome(c);continue}
   c.repairTimer-=REPAIR_TICK_SECONDS;
   state.wood=Math.max(0,state.wood-repairWoodPerTick());
   const repaired=Math.min(repairHpPerTick(),Math.max(0,info.need()));
   info.apply(repaired);state.repairedHp+=repaired;
   burst(info.x,info.y,"#e7c36b",2);
  }
 }
}
function hideRepairDecision(){const p=document.getElementById("repairDecision");if(p){p.classList.add("hidden");p.style.pointerEvents="none"}}

function update(dt){
 if(gameOver)return;
 if(paused)return;
 if(state.inWave){
  state.supportTimer=(state.supportTimer||0)+dt;
  while(state.supportTimer>=1){state.supportTimer-=1;runSupportTick()}
 }else state.supportTimer=0;
 updateCraftsmen(dt)
 if(state.inWave){state.spawnTimer-=dt;if(state.toSpawn>0&&state.spawnTimer<=0){spawnEnemy();state.toSpawn--;state.spawnTimer=Math.max(.18,.88-state.wave*.024)}}
 const bonus=1;
 for(const b of state.buildings){
  if(b.base.kind!=="tower"||b.slot.type==="wall"&&state.walls[b.slot.i].hp<=0)continue;
  b.cooldown-=dt;const e=nearestEnemy(b.slot.x,b.slot.y,b.range);if(e&&b.cooldown<=0){b.cooldown=b.rate;shoot(b,e,b.damage*bonus,b.speed,b.splash,b.key==="catapult"?"#493d30":"#f0d176")}
 }
 for(const u of state.units){
  if(u.hp<=0)continue;
  u.attackCd-=dt;u.retargetCd=(u.retargetCd||0)-dt;
  if(u.key==="guard"){
   const hpRatio=u.hp/Math.max(1,u.maxHp);
   if(hpRatio<.30)u.retreating=true;
   if(u.retreating&&hpRatio>.72)u.retreating=false;
   let target=null;
   if(!u.retreating){
    let best=Infinity;
    for(const e of state.enemies){
     if(e.hp<=0)continue;
     const er=Math.hypot(e.x-CX,e.y-CY);
     if(u.stance==="defend"&&e.phase!=="inside")continue;
     if(u.stance==="offense"&&er>WALL_R+330)continue;
     const d=Math.hypot(e.x-u.x,e.y-u.y);
     if(d<best){best=d;target=e}
    }
   }
   if(target){
    const dx=target.x-u.x,dy=target.y-u.y,d=Math.max(1,Math.hypot(dx,dy));
    if(d<=u.range+(target.radius||12)+5){
     if(u.attackCd<=0){
      u.attackCd=u.rate;
      const dealt=u.damage*(1-(target.armor||0));target.hp-=dealt;target.lastHitEntity=u;
      grantCombatXp(u,Math.min(7,dealt*.075));burst(target.x,target.y,"#f2cf82",6);
     }
    }else{
     const step=Math.min(d,u.speed*dt);let nx=u.x+dx/d*step,ny=u.y+dy/d*step;
     const nr=Math.hypot(nx-CX,ny-CY);
     if(u.stance==="defend"&&nr>WALL_R-18){const a=Math.atan2(ny-CY,nx-CX);nx=CX+Math.cos(a)*(WALL_R-20);ny=CY+Math.sin(a)*(WALL_R-20)}
     if(u.stance==="offense"&&nr>WALL_R+330){const a=Math.atan2(ny-CY,nx-CX);nx=CX+Math.cos(a)*(WALL_R+328);ny=CY+Math.sin(a)*(WALL_R+328)}
     u.x=nx;u.y=ny;
    }
   }else{
    const tx=u.retreating?u.homeX:(u.stance==="defend"?u.homeX:u.targetX),ty=u.retreating?u.homeY:(u.stance==="defend"?u.homeY:u.targetY);
    const dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);if(d>4){const step=Math.min(d,u.speed*dt);u.x+=dx/d*step;u.y+=dy/d*step}
   }
   continue;
  }
  if(u.controlMode==="auto"){
   const targetInvalid=!u.autoTarget||u.autoTarget.hp<=0||!state.enemies.includes(u.autoTarget);
   const currentCover=u.autoTarget?towerCoverage(u.autoTarget).coverage:0;
   if(targetInvalid||u.retargetCd<=0||currentCover>=2){
    u.autoTarget=chooseAutoTarget(u);
    u.retargetCd=.38+Math.random()*.22;
   }
   const t=u.autoTarget;
   if(t){
    const distance=Math.hypot(t.x-u.x,t.y-u.y);
    if(distance<=u.range){
     if(u.attackCd<=0){u.attackCd=u.rate;shoot(u,t,u.damage*bonus,480,0,"#bfe0ff")}
    }else{
     const dx=t.x-u.x,dy=t.y-u.y,d=Math.max(1,distance);
     const desiredX=u.x+dx/d*u.speed*dt,desiredY=u.y+dy/d*u.speed*dt;
     const dc=Math.hypot(desiredX-CX,desiredY-CY);
     if(dc<WALL_R-24&&dc>92){u.x=desiredX;u.y=desiredY}
     else{
      const a=Math.atan2(t.y-CY,t.x-CX),r=WALL_R-28;
      u.targetX=CX+Math.cos(a)*r;u.targetY=CY+Math.sin(a)*r;
      const mdx=u.targetX-u.x,mdy=u.targetY-u.y,md=Math.hypot(mdx,mdy);
      if(md>4){const step=Math.min(md,u.speed*dt);u.x+=mdx/md*step;u.y+=mdy/md*step}
     }
    }
   }
  }else{
   u.autoTarget=null;
   const e=nearestEnemy(u.x,u.y,u.range);
   if(e){
    if(u.attackCd<=0){u.attackCd=u.rate;shoot(u,e,u.damage*bonus,480,0,"#bfe0ff")}
   }else{
    const dx=u.targetX-u.x,dy=u.targetY-u.y,d=Math.hypot(dx,dy);
    if(d>4){const step=Math.min(d,u.speed*dt);u.x+=dx/d*step;u.y+=dy/d*step}
   }
  }
 }
 for(const p of state.projectiles){
  if(!p.target||p.target.hp<=0){p.dead=true;continue}const dx=p.target.x-p.x,dy=p.target.y-p.y,d=Math.hypot(dx,dy);
  if(d<p.speed*dt+(p.target.radius||10)){
   if(p.splash){
    for(const e of state.enemies){
     const sd=Math.hypot(e.x-p.target.x,e.y-p.target.y);
     if(sd<p.splash){
      const dealt=Math.max(0,p.damage*(1-sd/(p.splash*1.7))*(1-(e.armor||0)));
      e.hp-=dealt;
      if(p.owner){e.lastHitEntity=p.owner;grantCombatXp(p.owner,Math.min(5,dealt*.045))}
     }
    }
    burst(p.target.x,p.target.y,"#7e6a50",14);
   }else{
    const dealt=p.damage*(1-(p.target.armor||0));
    p.target.hp-=dealt;
    if(p.owner){p.target.lastHitEntity=p.owner;grantCombatXp(p.owner,Math.min(6,dealt*.06))}
    burst(p.target.x,p.target.y,p.color,3);
   }
   p.dead=true;
  }
  else{p.x+=dx/d*p.speed*dt;p.y+=dy/d*p.speed*dt}
 }
 state.projectiles=state.projectiles.filter(p=>!p.dead);

 for(const e of state.enemies){
  e.attackCd-=dt;const dx=CX-e.x,dy=CY-e.y,dCenter=Math.hypot(dx,dy);
  if(e.phase==="outside"){
   const wi=angleIndex(e.x,e.y),wall=state.walls[wi];e.wallIndex=wi;
   const targetR=WALL_R+e.radius+4,tx=CX+(e.x-CX)/dCenter*targetR,ty=CY+(e.y-CY)/dCenter*targetR;
   const d=Math.hypot(tx-e.x,ty-e.y);
   if(wall.hp<=0){e.phase="inside"}
   else if(d<5){if(e.attackCd<=0){e.attackCd=e.attackRate;const wallDamage=e.damage*(["shield","berserker","boss"].includes(e.type)?1:.25);
    wall.hp=Math.max(0,wall.hp-wallDamage);burst(tx,ty,"#9c6a3d",5);if(wall.hp<=0)showToast(`Bresche in Mauerabschnitt ${wi+1}!`)}}
   else{e.x+=(tx-e.x)/d*e.speed*dt;e.y+=(ty-e.y)/d*e.speed*dt}
  }else{
   const tower=towerBehindWall(e.wallIndex);
   const castleTower=nearestCastleTower(e);
   const blockingUnit=nearestBlockingUnit(e,62);
   if(blockingUnit){
    if(e.attackCd<=0){e.attackCd=e.attackRate;blockingUnit.hp-=e.damage*.6*(1-(blockingUnit.armor||0));burst(blockingUnit.x,blockingUnit.y,"#b84640",4)}
   }else if(tower){
    const tdx=tower.slot.x-e.x,tdy=tower.slot.y-e.y,td=Math.hypot(tdx,tdy);
    if(td<38+e.radius){
     if(e.attackCd<=0){e.attackCd=e.attackRate;tower.hp-=e.damage;burst(tower.slot.x,tower.slot.y,"#b67a45",6)}
    }else{
     e.x+=tdx/td*e.speed*dt;e.y+=tdy/td*e.speed*dt;
    }
   }else if(castleTower){
    const cdx=castleTower.slot.x-e.x,cdy=castleTower.slot.y-e.y,cd=Math.hypot(cdx,cdy);
    if(cd<38+e.radius){
     if(e.attackCd<=0){e.attackCd=e.attackRate;castleTower.hp-=e.damage;burst(castleTower.slot.x,castleTower.slot.y,"#b67a45",6)}
    }else{
     e.x+=cdx/cd*e.speed*dt;e.y+=cdy/cd*e.speed*dt;
    }
   }else if(dCenter<46){
    if(e.attackCd<=0){e.attackCd=e.attackRate;state.hp-=e.damage;burst(CX,CY,e.color,8)}
   }else{
    e.x+=dx/dCenter*e.speed*dt;e.y+=dy/dCenter*e.speed*dt;
   }
  }
 }
 for(const e of state.enemies)if(e.hp<=0&&!e.dead){e.dead=true;state.gold+=e.reward;state.kills++;if(e.lastHitEntity)grantCombatXp(e.lastHitEntity,e.type==="boss"?55:e.type==="shield"?22:e.type==="runner"?13:16);burst(e.x,e.y,e.color,8)}
 state.enemies=state.enemies.filter(e=>!e.dead);
 state.buildings=state.buildings.filter(b=>{
  if(b.base.kind==="tower"&&b.hp<=0){
   burst(b.slot.x,b.slot.y,"#8c6543",16);
   b.slot.building=null;
   if(selected===b)selected=null;
   return false;
  }
  return true;
 });
 state.units=state.units.filter(u=>{if(u.hp<=0){burst(u.x,u.y,"#47739c",10);if(selected===u)selected=null;return false}return true});
 if(state.hp<=0&&!gameOver){state.hp=0;gameOver=true;state.inWave=false;paused=true;showEndScreen()}
 if(state.inWave&&state.toSpawn===0&&state.enemies.length===0){
  state.inWave=false;state.supportTimer=0;paused=false;last=performance.now();const completedWave=state.wave,gold=30+completedWave*5,rp=Math.min(9,2+Math.ceil(completedWave/4)+(completedWave%8===0?2:0));state.gold+=gold;state.researchPoints=(state.researchPoints||0)+rp;
  const autoRepaired=applyAutomaticWaveRepair();
  state.wave++;
  state.repairActive=false;
  for(const c of state.craftsmen)sendCraftsmanHome(c);
  showToast(`Welle geschafft: +${gold} Gold · +${rp} Forschung${autoRepaired>0?` · +${Math.round(autoRepaired)} HP automatisch repariert`:""}`);hideRepairDecision();saveGame(true);
 }
 for(const p of state.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96}
 state.particles=state.particles.filter(p=>p.life>0);
}
function draw() {
 renderGameFrame({
  ctx, state, BUILD, wallSlots, insideSlots, castleSlots, selected, buildMode, rangeDisplayMode, unitCommandMode, paused, gameOver,
  zoom, vw, vh, camX, camY, WORLD_W, WORLD_H, CX, CY, WALL_R, TAU
 });
}
let lastDockSignature="";
function renderLevelUpDock(){
 if(!ui.levelDock)return;
 const readyUnits=state.units.filter(u=>u.hp>0&&(u.pendingUpgrades||0)>0);
 const readyTowers=state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0&&(b.pendingUpgrades||0)>0);
 const signature=[
  ...readyUnits.map(u=>`u:${u.uid}:${u.pendingUpgrades}:${u.expLevel}`),
  ...readyTowers.map(b=>`t:${b.slot.i}:${b.key}:${b.pendingUpgrades}:${b.expLevel}`)
 ].join("|");
 if(signature===lastDockSignature)return;
 lastDockSignature=signature;
 ui.levelDock.innerHTML=[
  ...readyUnits.map(u=>`<button class="levelCard" data-kind="unit" data-id="${u.uid}" title="Einheiten-Aufwertung">
   <span class="spark"></span><span class="portrait">${u.key==="guard"?"🛡️":"🏹"}</span><span class="badge">${u.pendingUpgrades}</span><span class="lvl">Stufe ${u.expLevel}</span>
  </button>`),
  ...readyTowers.map(b=>`<button class="levelCard" data-kind="tower" data-slot="${b.slot.i}" title="${b.base.name}-Aufwertung">
   <span class="spark"></span><span class="portrait">🏰</span><span class="badge">${b.pendingUpgrades}</span><span class="lvl">Stufe ${b.expLevel}</span>
  </button>`)
 ].join("");
}
function focusUpgradeEntity(card){
 closeStats();hideRepairDecision();let entity=null;
 if(card.dataset.kind==="unit")entity=state.units.find(u=>u.uid===Number(card.dataset.id)&&u.hp>0);
 if(card.dataset.kind==="tower")entity=state.buildings.find(b=>b.base.kind==="tower"&&b.slot.i===Number(card.dataset.slot)&&b.hp>0);
 if(!entity)return;
 selected=entity;buildMode=null;unitCommandMode=null;
 camX=entity.kind==="unit"?entity.x:entity.slot.x;
 camY=entity.kind==="unit"?entity.y:entity.slot.y;
 showToast("EXP-Aufwertung auswählen");
}

function speedLabel(v){return v>=58?"Sehr schnell":v>=44?"Schnell":v>=33?"Mittel":v>=25?"Langsam":"Sehr langsam"}
function armorLabel(v){const p=Math.round((v||0)*100);return p?`${p} % Schadensreduktion`:"Keine"}
function renderBestiary(){const grid=document.getElementById("bestiaryGrid"),progress=document.getElementById("bestiaryProgress");if(!grid)return;const entries=Object.entries(ENEMY_CODEX);if(progress)progress.textContent=`${entries.filter(([k])=>discoveredEnemies.has(k)).length} / ${entries.length} entdeckt`;grid.innerHTML=entries.map(([type,d])=>{const unlocked=discoveredEnemies.has(type);if(!unlocked)return `<article class="bestiaryEntry locked"><div class="bestiaryEntryHead"><div class="bestiaryIcon">?</div><div><h4>???</h4><small>Noch nicht entdeckt</small></div></div><div class="bestiaryLockedText">Begegne diesem Gegner im Kampf.</div></article>`;const st=enemyStatsFor(type,d.unlockWave);return `<article class="bestiaryEntry"><div class="bestiaryEntryHead"><div class="bestiaryIcon">${d.icon}</div><div><h4>${d.name}</h4><small>Ab Welle ${d.unlockWave}${d.boss?" · Boss":""}</small></div></div><p>${d.lore}</p><div class="bestiaryMiniStats"><span>❤️ Basis ${Math.round(st.hp)}</span><span>⚔ ${st.damage}</span><span>🛡 ${armorLabel(st.armor)}</span><span>🪙 ${st.reward}</span><span>➤ ${speedLabel(st.speed)}</span><span>⏱ ${st.attackRate.toFixed(2)} s</span></div></article>`}).join("")}
function openEnemyInfo(e){if(!e||e.dead)return;discoverEnemy(e.type);const overlay=document.getElementById("enemyInfoOverlay");document.getElementById("enemyInfoPortrait").textContent=ENEMY_CODEX[e.type]?.icon||"⚔";document.getElementById("enemyInfoName").textContent=e.name;document.getElementById("enemyInfoClan").textContent=`${e.clan||"Eisenclans"} · Welle ${state.wave}`;const roleTag=document.getElementById("enemyBossTag"),codex=ENEMY_CODEX[e.type]||{};roleTag.textContent=codex.role||(codex.boss?"BOSS":"KRIEGER");roleTag.hidden=false;roleTag.classList.toggle("isBoss",!!codex.boss);roleTag.classList.toggle("isElite",codex.role==="ELITE");document.getElementById("enemyHpText").textContent=`Leben ${Math.max(0,Math.ceil(e.hp))} / ${Math.ceil(e.maxHp)}`;document.getElementById("enemyHpFill").style.width=`${Math.max(0,Math.min(100,e.hp/e.maxHp*100))}%`;document.getElementById("enemyStatsGrid").innerHTML=`<div class="enemyStatTile"><span>Schaden</span><b>⚔ ${Math.round(e.damage)}</b></div><div class="enemyStatTile"><span>Rüstung</span><b>🛡 ${armorLabel(e.armor)}</b></div><div class="enemyStatTile"><span>Geschwindigkeit</span><b>➤ ${speedLabel(e.speed)} (${e.speed.toFixed(1)})</b></div><div class="enemyStatTile"><span>Angriffstakt</span><b>⏱ ${e.attackRate.toFixed(2)} s</b></div><div class="enemyStatTile"><span>Goldbelohnung</span><b>🪙 ${e.reward}</b></div><div class="enemyStatTile"><span>Besonderheit</span><b>${ENEMY_CODEX[e.type]?.strength||"–"}</b></div>`;document.getElementById("enemyInfoLore").textContent=ENEMY_CODEX[e.type]?.lore||"Krieger der Eisenclans.";overlay.classList.remove("hidden");paused=true;last=performance.now()}
function closeEnemyInfo(resume=true){const o=document.getElementById("enemyInfoOverlay");if(o)o.classList.add("hidden");if(resume&&!gameOver){paused=false;last=performance.now()}}
function pickAt(x,y){
 let best=null,bd=32;
 for(const e of state.enemies){if(e.dead)continue;const d=Math.hypot(x-e.x,y-e.y);if(d<Math.max(bd,e.radius+12)){bd=d;best=e}}
 for(const u of state.units){const d=Math.hypot(x-u.x,y-u.y);if(d<bd){bd=d;best=u}}
 for(const b of state.buildings){const d=Math.hypot(x-b.slot.x,y-b.slot.y);if(d<bd){bd=d;best=b}}
 for(const w of state.walls){const px=CX+Math.cos(w.am)*WALL_R,py=CY+Math.sin(w.am)*WALL_R,d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=w;best.kind="wall"}}
 return best;
}
function worldTap(x,y){
 if(gameOver)return;
 if(buildMode){createAt(x,y,buildMode);return}
 if(selected&&selected.kind==="unit"&&unitCommandMode==="move"){
  const d=Math.hypot(x-CX,y-CY);
  if(d<WALL_R-25&&d>95){
   selected.controlMode="manual";selected.autoTarget=null;selected.targetX=x;selected.targetY=y;unitCommandMode=null;
   showToast("Bewegungsbefehl gesetzt");return;
  }
  showToast("Ziel muss hinter der Mauer liegen");return;
 }
 const picked=pickAt(x,y);
 if(picked&&picked.kind==="enemy"){openEnemyInfo(picked);selected=null;unitCommandMode=null;return}
 selected=picked;unitCommandMode=null;
}

function showPauseMenu(){
 const menu=document.getElementById("pauseMenu"),confirmBox=document.getElementById("pauseRestartConfirm");
 if(!menu)return;
 paused=true;state.supportTimer=0;last=performance.now();
 if(confirmBox)confirmBox.classList.add("hidden");
 menu.classList.remove("hidden");menu.style.pointerEvents="auto";refreshSaveStatus();
 updateUI();
}
function hidePauseMenu(resume=false){
 const menu=document.getElementById("pauseMenu"),confirmBox=document.getElementById("pauseRestartConfirm");
 if(menu){menu.classList.add("hidden");menu.style.pointerEvents="none"}
 if(confirmBox)confirmBox.classList.add("hidden");
 if(resume&&!gameOver){paused=false;last=performance.now();showToast("Spiel fortgesetzt")}
 updateUI();
}
function showEndScreen(){
 hidePauseMenu(false);
 const screen=document.getElementById("endScreen"),box=document.getElementById("endStats");
 if(!screen||!box)return;
 const completed=Math.max(0,state.wave-1);
 box.innerHTML=`<div class="endStat"><span>Wellen geschafft</span><b>${completed}</b></div><div class="endStat"><span>Gegner besiegt</span><b>${state.kills}</b></div><div class="endStat"><span>Reparierte HP</span><b>${Math.round(state.repairedHp||0)}</b></div><div class="endStat"><span>Gebäude erhalten</span><b>${state.buildings.length}</b></div><div class="endStat"><span>Gold übrig</span><b>${Math.floor(state.gold)}</b></div><div class="endStat"><span>Holz übrig</span><b>${Math.floor(state.wood)}</b></div>`;
 screen.classList.remove("hidden");screen.style.pointerEvents="auto";
}
function hideEndScreen(){const screen=document.getElementById("endScreen");if(screen){screen.classList.add("hidden");screen.style.pointerEvents="none"}}
function reset(){
 state.gold=210;state.wood=105;state.researchPoints=0;state.research={fortress_autoRepair:0,guard_hp:0,guard_armor:0,archer_damage:0,archer_range:0,archer_rate:0,craft_repair:0,craft_wood:0,craft_speed:0};state.hp=state.maxHp=1200;state.wave=1;state.inWave=false;state.toSpawn=0;state.spawnTimer=0;state.kills=0;
 state.enemies=[];state.projectiles=[];state.buildings=[];state.units=[];state.particles=[];state.craftsmen=[];state.repairActive=false;state.repairedHp=0;state.supportTimer=0;hideRepairDecision();hideEndScreen();hidePauseMenu(false);closeEnemyInfo(false);for(const s of [...wallSlots,...insideSlots,...castleSlots])s.building=null;for(const w of state.walls)w.hp=w.maxHp;
 selected=null;buildMode=null;unitCommandMode=null;paused=false;gameOver=false;camX=CX;camY=CY;setZoom(.48);showToast("Neues Spiel");
}

document.querySelectorAll(".buildBtn").forEach(b=>b.addEventListener("click",()=>{hideRepairDecision();const k=b.dataset.build;buildMode=buildMode===k?null:k;selected=null;unitCommandMode=null}));
document.getElementById("enemyInfoClose").addEventListener("click",()=>closeEnemyInfo(true));
document.getElementById("enemyInfoOverlay").addEventListener("click",e=>{if(e.target.id==="enemyInfoOverlay")closeEnemyInfo(true)});
renderBestiary();refreshSaveStatus();
document.getElementById("marketTradeBtn").addEventListener("click",openMarketPanel);
document.getElementById("marketCloseBtn").addEventListener("click",closeMarketPanel);
document.getElementById("marketTradeGrid").addEventListener("click",e=>{const b=e.target.closest("[data-trade]");if(b)executeMarketTrade(b.dataset.trade,Number(b.dataset.amount))});

ui.start.onclick=startWave;ui.pause.onclick=()=>{if(gameOver)return;showPauseMenu()};ui.upgrade.onclick=upgradeSelected;ui.sell.onclick=sellSelected;ui.repairWall.onclick=repairSelectedWall;ui.craftsmanToggle.onclick=toggleCraftsmanWork;
document.getElementById("repairInfoCloseBtn").onclick=e=>{e.preventDefault();e.stopPropagation();hideRepairDecision();last=performance.now();updateUI()};
document.getElementById("restartGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();reset()};
document.getElementById("resumeGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();hidePauseMenu(true)};
document.getElementById("saveGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();saveGame(false)};
document.getElementById("loadGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();loadGame()};
document.getElementById("deleteSaveBtn").onclick=e=>{e.preventDefault();e.stopPropagation();deleteSave()};
document.getElementById("pauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();document.getElementById("pauseRestartConfirm").classList.remove("hidden")};
document.getElementById("cancelPauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();document.getElementById("pauseRestartConfirm").classList.add("hidden")};
document.getElementById("confirmPauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();reset()};
ui.zoomOut.onclick=()=>setZoom(zoom-.1);ui.zoomIn.onclick=()=>setZoom(zoom+.1);
attachGameInput({
 canvas,
 startScreen,
 instructionsScreen,
 getZoom:()=>zoom,
 setZoom,
 getCamera:()=>({x:camX,y:camY}),
 setCamera:(x,y)=>{camX=x;camY=y},
 clampCamera,
 screenToWorld,
 worldTap,
 getBuildMode:()=>buildMode,
 getSelected:()=>selected,
 clearSelectionModes:()=>{buildMode=null;selected=null;unitCommandMode=null},
 isPaused:()=>paused,
 setPaused:value=>{paused=value},
 isGameOver:()=>gameOver,
 setLastFrameTime:value=>{last=value},
 showToast,
 startWave,
 showPauseMenu,
 hidePauseMenu,
 resetGame:reset,
 enterGame,
 returnToTitle,
 handleOrientationChange,
 isPhoneLandscape,
 resizeCanvas:resize
});

ui.levelDock.addEventListener("click",e=>{const card=e.target.closest(".levelCard");if(card)focusUpgradeEntity(card)});

const buildTray=document.getElementById("buildTray");
const navButtons=[...document.querySelectorAll(".navBtn[data-tab]")];
const navResearch=document.getElementById("navResearch"),navResearchBadge=document.getElementById("navResearchBadge");
const navUpgrade=document.getElementById("navUpgrade");
const navStats=document.getElementById("navStats");
const navMenu=document.getElementById("navMenu");
const statsScreen=document.getElementById("statsScreen");
const statsContent=document.getElementById("statsContent");
const statsTitle=document.getElementById("statsTitle");
const statsCloseBtn=document.getElementById("statsCloseBtn");
const selectionMoveBtn=document.getElementById("selectionMoveBtn");
const selectionAutoBtn=document.getElementById("selectionAutoBtn");
const selectionUpgradeBtn=document.getElementById("selectionUpgradeBtn");
const selectionDetailsBtn=document.getElementById("selectionDetailsBtn");
const selectionRangeBtn=document.getElementById("selectionRangeBtn");
const selectionTalentBar=document.getElementById("selectionTalentBar");
let rangeDisplayMode=0; // 0=Aus, 1=Auswahl, 2=Alle


function fmt(v,d=0){return Number(v||0).toFixed(d)}
function pctDelta(base,current){if(!base)return "—";const p=(current/base-1)*100;return `${p>=0?"+":""}${p.toFixed(0)}%`}
function statRow(label,base,current,next){return `<div class="statRow"><div class="label">${label}</div><div class="base">${base}</div><div class="current">${current}</div><div class="gain">${next}</div></div>`}
function unitStatsHtml(u){
 const base=u.base,ups=u.upgradeStats||{},rateNext=Math.max(.24,u.rate*.84);
 return `<div class="statsSummary">
 <div class="statTile"><span>Erfahrungsstufe</span><b>${u.expLevel||1}</b></div>
 <div class="statTile"><span>Offene Punkte</span><b>${u.pendingUpgrades||0}</b></div>
 <div class="statTile"><span>Erfahrung</span><b>${Math.floor(u.xp||0)}/${Math.floor(u.xpMax||65)}</b></div></div>
 <div class="statsSection"><h3>Grundwerte und aktuelle Werte</h3>
 <div class="statRow header"><div>Wert</div><div>Grundwert</div><div>Aktuell</div><div>Änderung</div></div>
 ${statRow("Schaden",fmt(base.damage),fmt(u.damage),pctDelta(base.damage,u.damage))}
 ${statRow("Max. Leben",fmt(base.hp),fmt(u.maxHp),pctDelta(base.hp,u.maxHp))}
 ${statRow("Tempo",fmt(base.speed),fmt(u.speed),pctDelta(base.speed,u.speed))}
 ${statRow("Reichweite",fmt(base.range),fmt(u.range),pctDelta(base.range,u.range))}
 ${statRow("Schüsse/Sek.",fmt(1/base.rate,2),fmt(1/u.rate,2),pctDelta(1/base.rate,1/u.rate))}</div>
 <div class="statsSection"><h3>Nächste Aufwertung</h3><div class="upgradeGrid">
 <div class="upgradeCard"><b>⚔ Schaden</b><small>${fmt(u.damage)} → ${fmt(u.damage*1.24)}<br>+24% Angriffsschaden</small><div class="level">Bisher: ${ups.damage||0}×</div></div>
 <div class="upgradeCard"><b>♥ Leben</b><small>${fmt(u.maxHp)} → ${fmt(u.maxHp*1.28)}<br>+28% Leben und Heilung</small><div class="level">Bisher: ${ups.health||0}×</div></div>
 <div class="upgradeCard"><b>➤ Tempo</b><small>${fmt(u.speed)} → ${fmt(u.speed*1.16)}<br>+16% Bewegungstempo</small><div class="level">Bisher: ${ups.speed||0}×</div></div>
 <div class="upgradeCard"><b>✦ Feuerrate</b><small>${fmt(1/u.rate,2)} → ${fmt(1/rateNext,2)} Schüsse/Sek.<br>−16% Nachladezeit</small><div class="level">Bisher: ${ups.rate||0}×</div></div>
 <div class="upgradeCard"><b>◎ Reichweite</b><small>${fmt(u.range)} → ${fmt(u.range*1.12)}<br>+12% Angriffsreichweite</small><div class="level">Bisher: ${ups.range||0}×</div></div>
 </div></div>`;
}
function buildingDisplayName(b){return b.key==="house"?(b.level>=2?"Holzhaus":"Zeltlager"):b.base.name}
function buildingProductionInfo(b){
 const active=state.inWave&&!paused&&!gameOver;
 if(b.key==="house")return {label:"Goldproduktion",value:`+${(residentCapacityForHouse(b)*.18).toFixed(2)} Gold/Sek.`,state:active?"läuft":"nur in aktiver Welle"};
 if(b.key==="lumber")return {label:"Holzproduktion",value:`+${supportProductionPerSecond(b).toFixed(2)} Holz/Sek.`,state:buildingHasWorker(b)?(active?"läuft":"wartet auf Welle"):"kein Bewohner"};
 if(b.key==="repair")return {label:"Reparaturleistung",value:`+${repairHpPerTick().toFixed(1).replace(".",",")} HP/Takt · −${repairWoodPerTick().toFixed(2).replace(".",",")} Holz`,state:!buildingHasWorker(b)?"kein Bewohner":b.repairEnabled===false?"gestoppt":active?"läuft bei Schaden":"wartet"};
 if(b.key==="market")return {label:"Goldproduktion",value:`+${supportProductionPerSecond(b).toFixed(2)} Gold/Sek.`,state:buildingHasWorker(b)?(active?"läuft":"wartet auf Welle"):"kein Bewohner"};
 if(b.key==="workshop")return {label:"Forschung",value:`${workshopLevels()} Stufen`,state:`🔬 ${Math.floor(state.researchPoints||0)} verfügbar`};
 return {label:"Produktion",value:"—",state:"—"};
}
function buildingStatsHtml(b){
 const base=b.base,isTower=base.kind==="tower",level=b.level||1;
 let rows=isTower?
 `${statRow("Schaden",fmt(base.damage),fmt(b.damage),pctDelta(base.damage,b.damage))}
 ${statRow("Reichweite",fmt(base.range),fmt(b.range),pctDelta(base.range,b.range))}
 ${statRow("Schüsse/Sek.",fmt(1/base.rate,2),fmt(1/b.rate,2),pctDelta(1/base.rate,1/b.rate))}
 ${statRow("Max. Leben",fmt(base.hp),fmt(b.maxHp),pctDelta(base.hp,b.maxHp))}
 ${b.splash?statRow("Flächenradius",fmt(base.splash),fmt(b.splash),pctDelta(base.splash,b.splash)):""}`:
 statRow("Gebäudestufe","1",level,`+${Math.max(0,level-1)}`);
 if(isTower)return `<div class="statsSummary">
 <div class="statTile"><span>EXP-Stufe</span><b>${b.expLevel||1}</b></div>
 <div class="statTile"><span>EXP</span><b>${Math.floor(b.xp||0)}/${Math.floor(b.xpMax||90)}</b></div>
 <div class="statTile"><span>Offene Punkte</span><b>${b.pendingUpgrades||0}</b></div></div>
 <div class="statsSection"><h3>Kampfwerte</h3><div class="statRow header"><div>Wert</div><div>Grundwert</div><div>Aktuell</div><div>Änderung</div></div>${rows}</div>`;
 const prod=buildingProductionInfo(b),workerNeeded=["lumber","repair","market"].includes(b.key),workerText=workerNeeded?(buildingHasWorker(b)?"1 / 1 zugewiesen":"0 / 1 zugewiesen"):b.key==="house"?`${residentCapacityForHouse(b)} Bewohnerplätze`:"Kein Arbeitsplatz";
 const g=Math.floor(b.base.gold*(.65+b.level*.45)),w=Math.floor(b.base.wood*(.45+b.level*.3));
 const maxLevel=b.key==="house"?2:b.key==="market"?3:5,canUpgrade=b.level<maxLevel&&state.gold>=g&&state.wood>=w;
 return `<div class="buildingOverview">
  <div class="statTile"><span>Gebäude</span><b>${buildingDisplayName(b)}</b></div>
  <div class="statTile"><span>Stufe</span><b>${level} / ${maxLevel}</b></div>
  <div class="statTile"><span>Bewohner</span><b>${workerText}</b></div>
  <div class="statTile"><span>${prod.label}</span><b>${prod.value}</b><small class="${prod.state.includes("läuft")?"productionLive":"productionStopped"}">${prod.state}</small></div>
 </div>
 <div class="statsSection"><h3>Gebäudewerte</h3><div class="statRow header"><div>Wert</div><div>Grundwert</div><div>Aktuell</div><div>Änderung</div></div>${rows}</div>
 ${b.key==="market"?`<div class="statsHint">Handelsverlust: ${marketLossPercent(b)} %. Höhere Marktplatzstufen verbessern Produktion und Tauschrate.</div>`:""}
 ${b.key==="workshop"?`<div class="statsHint">Öffne die Forschung über die Werkstatt. Verfügbar: 🔬 ${Math.floor(state.researchPoints||0)} · Erforschte Stufen: ${workshopLevels()}</div>`:""}
 <div class="buildingActionBar">
  ${workerNeeded?`<button type="button" data-building-worker="${b.bid}" class="${buildingHasWorker(b)?"danger":"primary"}">${buildingHasWorker(b)?"Bewohner abziehen":"Bewohner zuweisen"}</button>`:""}
  ${b.key==="repair"&&buildingHasWorker(b)?`<button type="button" data-building-repair="${b.bid}">${b.repairEnabled===false?"Arbeit starten":"Arbeit stoppen"}</button>`:""}
  ${b.key==="market"?`<button type="button" data-building-market="${b.bid}">Handel öffnen</button>`:""}
  <button type="button" data-building-upgrade="${b.bid}" class="primary wide" ${canUpgrade?"":"disabled"}>${b.level>=maxLevel?"Maximalstufe erreicht":`Aufwerten · ${g} Gold / ${w} Holz`}</button>
 </div>`;
}
function wallStatsHtml(w){
 return `<div class="statsSummary"><div class="statTile"><span>Zustand</span><b>${Math.ceil(w.hp/w.maxHp*100)}%</b></div><div class="statTile"><span>Leben</span><b>${Math.ceil(w.hp)}</b></div><div class="statTile"><span>Maximum</span><b>${Math.ceil(w.maxHp)}</b></div></div><div class="statsHint">Dieser Palisadenabschnitt schützt den dahinterliegenden Turm. Nach einem Durchbruch greifen Feinde zuerst den Turm, dann blockierende Einheiten und schließlich die Burg an.</div>`;
}
function overviewStatsHtml(){
 const units=state.units.filter(u=>u.hp>0),towers=state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0),open=units.reduce((s,u)=>s+(u.pendingUpgrades||0),0)+towers.reduce((s,b)=>s+(b.pendingUpgrades||0),0);
 const avg=units.length?units.reduce((s,u)=>s+(u.expLevel||1),0)/units.length:0,totalDamage=units.reduce((s,u)=>s+u.damage,0)+towers.reduce((s,b)=>s+b.damage,0);
 return `<div class="statsSummary"><div class="statTile"><span>Einheiten</span><b>${units.length}</b></div><div class="statTile"><span>Türme</span><b>${towers.length}</b></div><div class="statTile"><span>Offene Punkte</span><b>${open}</b></div></div>
 <div class="statsSection"><h3>Festungsübersicht</h3>
 <div class="rosterItem"><div class="rosterIcon">⚔️</div><div><b>Gesamtschaden pro Salve</b><small>Aktive Einheiten und Türme</small></div><div class="rosterBadge">${Math.round(totalDamage)}</div></div>
 <div class="rosterItem"><div class="rosterIcon">⭐</div><div><b>Durchschnittsstufe</b><small>Lebende Bodeneinheiten</small></div><div class="rosterBadge">${avg.toFixed(1)}</div></div>
 <div class="rosterItem"><div class="rosterIcon">☠️</div><div><b>Besiegte Gegner</b><small>Gesamter Spielstand</small></div><div class="rosterBadge">${state.kills}</div></div>
 <div class="rosterItem"><div class="rosterIcon">🌊</div><div><b>Aktuelle Welle</b><small>${state.inWave?"Angriff läuft":"Vorbereitung"}</small></div><div class="rosterBadge">${state.wave}</div></div></div>
 <div class="statsSection"><h3>Einheitenübersicht</h3>${units.length?units.map(u=>`<div class="rosterItem" data-unit-stat="${u.uid}"><div class="rosterIcon">🏹</div><div><b>Bogenschütze Stufe ${u.expLevel||1}</b><small>Schaden ${Math.round(u.damage)} · Leben ${Math.ceil(u.hp)}/${Math.ceil(u.maxHp)} · EXP ${Math.floor(u.xp)}/${u.xpMax}</small></div><div class="rosterBadge">${u.pendingUpgrades||0} P</div></div>`).join(""):'<div class="statsHint">Noch keine Bodeneinheiten gebaut.</div>'}</div>
 <div class="statsSection"><h3>Turmübersicht</h3>${towers.length?towers.map(b=>`<div class="rosterItem"><div class="rosterIcon">🏰</div><div><b>${b.base.name} · EXP-Stufe ${b.expLevel||1}</b><small>Schaden ${Math.round(b.damage)} · Reichweite ${Math.round(b.range)} · EXP ${Math.floor(b.xp||0)}/${b.xpMax||90}</small></div><div class="rosterBadge">${b.pendingUpgrades||0} P</div></div>`).join(""):'<div class="statsHint">Noch keine Verteidigungstürme gebaut.</div>'}</div>`;
}

function totalWoodPerSecond(){
 return state.buildings.filter(b=>b.key==="lumber").reduce((sum,b)=>sum+supportProductionPerSecond(b),0);
}
function resourceDetailsHtml(){
 syncResidents();
 const lumberjacks=state.buildings.filter(b=>b.key==="lumber");
 const houses=state.buildings.filter(b=>b.key==="house");
 const rate=totalWoodPerSecond();
 const goldRate=totalGoldPerSecond();
 const nextWaveReward=30+state.wave*5;
 const woodRows=lumberjacks.length?lumberjacks.map((b,i)=>`
  <div class="rosterItem"><div class="rosterIcon">🪵</div><div><b>Holzfäller ${i+1} · Stufe ${b.level||1}</b>
  <small>${buildingHasWorker(b)?`${supportProductionPerSecond(b).toFixed(2)} Holz pro Sekunde im Kampf`:`Kein Bewohner zugewiesen`}</small></div><div class="rosterBadge">${buildingHasWorker(b)?`+${supportProductionPerSecond(b).toFixed(2)}/s`:"frei"}</div></div>`).join("")
  :`<div class="statsHint">Noch kein Holzfäller gebaut. Ohne Holzfäller gibt es keine laufende Holzproduktion.</div>`;
 return `<div class="statsSummary">
  <div class="statTile"><span>🪙 Gold</span><b>${Math.floor(state.gold)}</b></div>
  <div class="statTile"><span>🪵 Holz</span><b>${state.wood.toFixed(1)}</b></div>
  <div class="statTile researchSummaryTile"><span>🔬 Forschung</span><b>${Math.floor(state.researchPoints||0)}</b></div>
  <div class="statTile"><span>👥 Bewohner</span><b>${assignedResidents()}/${totalResidents()}</b></div>
  <div class="statTile"><span>Gold im Kampf</span><b>+${goldRate.toFixed(2)}/s</b></div>
  <div class="statTile"><span>Holz im Kampf</span><b>+${rate.toFixed(2)}/s</b></div>
 </div>
 <div class="statsSection"><h3>🪙 Goldwirtschaft</h3>
  <div class="rosterItem"><div class="rosterIcon">⚔</div><div><b>Besiegte Gegner</b><small>Gegner geben beim Besiegen Gold.</small></div><div class="rosterBadge">${state.kills}</div></div>
  <div class="rosterItem"><div class="rosterIcon">🌊</div><div><b>Nächste Wellenbelohnung</b><small>Nach vollständigem Sieg über die aktuelle Welle.</small></div><div class="rosterBadge">+${nextWaveReward}</div></div>
  <div class="statsHint">Wohnhäuser erzeugen während aktiver Wellen Gold. Der Ertrag richtet sich nach ihrer Einwohnerzahl.</div>
 </div>
 <div class="statsSection"><h3>👥 Bevölkerung</h3>${houses.length?houses.map((h,i)=>`<div class="rosterItem"><div class="rosterIcon">${h.level>=2?"🏠":"⛺"}</div><div><b>${h.level>=2?"Holzhaus":"Zeltlager"} ${i+1}</b><small>${residentCapacityForHouse(h)} Bewohner · +${(residentCapacityForHouse(h)*.18).toFixed(2)} Gold/Sek. im Kampf</small></div><div class="rosterBadge">${residentCapacityForHouse(h)} 👥</div></div>`).join(""):'<div class="statsHint">Noch kein Wohnhaus gebaut.</div>'}</div>
 <div class="statsSection"><h3>🔬 Forschung</h3><div class="rosterItem"><div class="rosterIcon">⚒️</div><div><b>${state.buildings.some(b=>b.key==="workshop")?"Werkstatt betriebsbereit":"Werkstatt fehlt"}</b><small>Forschungspunkte erhältst du nach erfolgreich abgeschlossenen Wellen.</small></div><div class="rosterBadge">${workshopLevels()} Stufen</div></div>${state.buildings.some(b=>b.key==="workshop")?`<button type="button" class="workshopOpenAction" data-open-workshop>Werkstatt & Forschung öffnen</button>`:`<div class="statsHint">Baue eine Werkstatt, um Technologien freizuschalten.</div>`}</div>
 <div class="statsSection"><h3>🪵 Holzversorgung</h3>${woodRows}</div>
 <div class="statsHint">Holzproduktion läuft ausschließlich während einer aktiven, nicht pausierten Kampfwelle. Reparaturen verbrauchen Holz pro Reparatur-Takt.</div>`;
}
function residentJobLabel(r){return r.job==="lumberjack"?"Holzfäller":r.job==="craftsman"?"Handwerker":r.job==="merchant"?"Händler":r.job?"Arbeiter":"Frei"}
function workplaceLabel(b){return b.key==="lumber"?"Holzfäller":b.key==="repair"?"Handwerkerhaus":b.key==="market"?"Marktplatz":"Werkstatt"}
function workplaceIcon(b){return b.key==="lumber"?"🪵":b.key==="repair"?"👷":b.key==="market"?"🏪":"⚒️"}
function populationDetailsHtml(){
 syncResidents();
 const residents=[...state.residents];
 const workplaces=state.buildings.filter(b=>["lumber","repair","market"].includes(b.key));
 const residentRows=residents.length?residents.map((r,i)=>{const home=state.buildings.find(h=>h.bid===r.homeId);return `<div class="rosterItem"><div class="rosterIcon">${r.job==="craftsman"?"👷":r.job==="lumberjack"?"🧑‍🌾":r.job==="merchant"?"🧑‍💼":r.job?"🧑‍🔧":"🙂"}</div><div><b>Bewohner ${i+1}</b><small>${home?(home.level>=2?"Holzhaus":"Zeltlager"):"Ohne Unterkunft"} · ${residentJobLabel(r)}</small></div><div class="residentState ${r.workplaceId?"busy":"free"}">${r.workplaceId?"arbeitet":"frei"}</div></div>`}).join(""):'<div class="statsHint">Baue zuerst ein Zeltlager, um Bewohner zu erhalten.</div>';
 const workRows=workplaces.length?workplaces.map(b=>`<div class="populationWorkplace"><div class="workIcon">${workplaceIcon(b)}</div><div><b>${workplaceLabel(b)} · Stufe ${b.level||1}</b><small>${b.residentId?"Ein Bewohner arbeitet hier.":"Arbeitsplatz ist frei."}</small></div><button type="button" data-pop-workplace="${b.bid}" class="${b.residentId?"danger":"primary"}">${b.residentId?"Abziehen":"Zuweisen"}</button></div>`).join(""):'<div class="statsHint">Noch keine Versorgungsgebäude mit Arbeitsplätzen gebaut.</div>';
 return `<div class="statsSummary"><div class="statTile"><span>Bewohner gesamt</span><b>${totalResidents()}</b></div><div class="statTile"><span>Arbeiten</span><b>${assignedResidents()}</b></div><div class="statTile"><span>Frei</span><b>${freeResidents()}</b></div></div><div class="statsSection"><h3>👥 Bewohner</h3>${residentRows}</div><div class="statsSection"><h3>🏭 Arbeitsplätze zuweisen</h3><div class="populationActions">${workRows}</div></div><div class="statsHint">Ein Bewohner im Handwerkerhaus erscheint als sichtbarer Handwerker. Während einer aktiven Angriffswelle läuft er zu beschädigten Mauern, Türmen und zur Burg und repariert pro Sekunde 16 HP für 0,5 Holz.</div>`;
}
function openMarketPanel(){
 if(!selected||selected.kind!=="building"||selected.key!=="market")return;
 const panel=document.getElementById("marketPanel"),grid=document.getElementById("marketTradeGrid");
 document.getElementById("marketGoldValue").textContent=Math.floor(state.gold);document.getElementById("marketWoodValue").textContent=Math.floor(state.wood);
 document.getElementById("marketRateText").textContent=`Stufe ${selected.level}: ${marketLossPercent(selected)}% Handelsabschlag. Goldproduktion ${supportProductionPerSecond(selected).toFixed(2)}/Sek. im Kampf.`;
 grid.innerHTML=[25,50,100].map(a=>`<button type="button" data-trade="wood-gold" data-amount="${a}">🪵 ${a} → 🪙 ${marketOutput(a,selected)}</button><button type="button" data-trade="gold-wood" data-amount="${a}">🪙 ${a} → 🪵 ${marketOutput(a,selected)}</button>`).join("");
 panel.classList.remove("hidden");paused=true;
}
function closeMarketPanel(){document.getElementById("marketPanel").classList.add("hidden");if(!gameOver)paused=false;last=performance.now()}
function executeMarketTrade(type,amount){
 if(!selected||selected.key!=="market")return;const out=marketOutput(amount,selected);
 if(type==="wood-gold"){if(state.wood<amount)return showToast("Nicht genug Holz");state.wood-=amount;state.gold+=out;showToast(`${amount} Holz gegen ${out} Gold getauscht`)}
 else{if(state.gold<amount)return showToast("Nicht genug Gold");state.gold-=amount;state.wood+=out;showToast(`${amount} Gold gegen ${out} Holz getauscht`)}
 openMarketPanel();updateUI();
}
function prepareStatsScreen(){hideRepairDecision();statsScreen.classList.remove("hidden");statsScreen.style.display="flex";statsScreen.style.pointerEvents="auto";statsScreen.style.visibility="visible"}
function openPopulationDetails(){prepareStatsScreen();statsTitle.textContent="Bewohner & Arbeit";statsContent.innerHTML=populationDetailsHtml()}
function toggleWorkplaceResident(bid){
 const b=state.buildings.find(x=>x.bid===bid);
 if(!b)return;
 const changed=setBuildingResident(b);
 if(changed){
  // Das Zuweisungsfenster wird nach der Aktion vollständig geschlossen, damit kein unsichtbares Overlay Eingaben blockiert.
  closeStats();
  requestAnimationFrame(()=>{closeAllBlockingPanels();canvas.style.pointerEvents="auto";last=performance.now()});
 }
}
function openResourceDetails(){
 prepareStatsScreen();
 statsTitle.textContent="Rohstoffübersicht";
 statsContent.innerHTML=resourceDetailsHtml();
}

function upgradeEntityCost(entity){
 if(!entity)return {gold:0,wood:0,maxed:true};
 if(entity.kind==="unit")return {gold:55*(entity.level||1),wood:0,maxed:(entity.level||1)>=5};
 if(entity.kind==="building"){
  const max=entity.key==="house"?2:entity.key==="market"?3:5;
  return {gold:Math.floor(entity.base.gold*(.65+(entity.level||1)*.45)),wood:Math.floor(entity.base.wood*(.45+(entity.level||1)*.3)),maxed:(entity.level||1)>=max,max};
 }
 return {gold:0,wood:0,maxed:true};
}
function upgradeEntityName(entity){return entity.kind==="unit"?(entity.key==="guard"?"Burgwache":"Bogenschütze"):buildingDisplayName(entity)}
function upgradeEntityIcon(entity){if(entity.kind==="unit")return entity.key==="guard"?"🛡️":"🏹";return {archer:"🏹",crossbow:"🎯",catapult:"🪨",house:entity.level>=2?"🏠":"⛺",lumber:"🪵",workshop:"⚒️",repair:"👷",market:"🏪"}[entity.key]||"🏰"}
function allResearchTechs(){return getAllResearchTechs()}
function activeGlobalBonuses(){
 const bonuses=[];
 const guardHp=researchLevel("guard_hp")*8,guardArmor=researchLevel("guard_armor")*2.5,archerDamage=researchLevel("archer_damage")*7,archerRange=researchLevel("archer_range")*6,archerRate=researchLevel("archer_rate")*5,craftRepair=researchLevel("craft_repair")*12,craftWood=researchLevel("craft_wood")*7,craftSpeed=researchLevel("craft_speed")*8;
 if(guardHp)bonuses.push(`🛡 Wachen-Leben +${guardHp}%`);if(guardArmor)bonuses.push(`🛡 Wachen-Rüstung +${guardArmor}%`);if(archerDamage)bonuses.push(`🏹 Schützen-Schaden +${archerDamage}%`);if(archerRange)bonuses.push(`◎ Schützen-Reichweite +${archerRange}%`);if(archerRate)bonuses.push(`✦ Schützen-Tempo +${archerRate}%`);if(craftRepair)bonuses.push(`🔨 Reparatur +${craftRepair}%`);if(craftWood)bonuses.push(`🪵 Holzbedarf −${craftWood}%`);if(craftSpeed)bonuses.push(`➤ Handwerker-Tempo +${craftSpeed}%`);
 const auto=researchLevel("fortress_autoRepair");if(auto)bonuses.push(`🏰 Wellenreparatur ${[10,15,20,25,30][auto-1]}%`);
 return bonuses;
}
function upgradeRecommendation(){
 const workshop=state.buildings.find(b=>b.key==="workshop");
 if(!workshop)return "Baue eine Werkstatt, um globale Technologien und die Forschungskosten-Skalierung freizuschalten.";
 if(workshop.level<5&&workshopLevels()>=3)return `Werkstatt auf Stufe ${workshop.level+1} ausbauen: Der globale Forschungsaufschlag sinkt danach auf ${[30,25,20,15,10][workshop.level]} % je fremder Forschungsstufe.`;
 if(freeResidents()===0)return "Deine Bevölkerung ist vollständig beschäftigt. Baue ein weiteres Zeltlager oder verbessere eines zum Holzhaus.";
 const damaged=totalRepairDamage();if(damaged>250)return `Die Festung hat ${Math.ceil(damaged)} Schadenspunkte. Handwerker- und Reparaturforschung haben aktuell hohe Priorität.`;
 const ready=[...state.units,...state.buildings.filter(b=>b.base.kind==="tower")].filter(x=>(x.pendingUpgrades||0)>0).length;if(ready)return `${ready} Veteranen-Aufwertung${ready===1?" ist":"en sind"} bereit. Wähle die markierten Einheiten oder Türme auf dem Spielfeld.`;
 const affordable=[...state.units,...state.buildings].filter(e=>{const c=upgradeEntityCost(e);return !c.maxed&&state.gold>=c.gold&&state.wood>=c.wood}).length;if(affordable)return `${affordable} reguläre Aufwertung${affordable===1?" ist":"en sind"} mit deinen aktuellen Rohstoffen sofort bezahlbar.`;
 return "Sammle Gold und Holz in der nächsten Welle. Priorisiere anschließend Werkstatt, Türme und Wohnraum nach Engpass.";
}
function upgradeCenterHtml(){
 const workshop=state.buildings.find(b=>b.key==="workshop"),entities=[...state.buildings,...state.units],upgradable=entities.filter(e=>!upgradeEntityCost(e).maxed),affordable=upgradable.filter(e=>{const c=upgradeEntityCost(e);return state.gold>=c.gold&&state.wood>=c.wood});
 const buildingRows=state.buildings.length?state.buildings.map(b=>{const c=upgradeEntityCost(b),can=!c.maxed&&state.gold>=c.gold&&state.wood>=c.wood;return `<div class="upgradeCenterCard"><div class="upgradeCenterIcon">${upgradeEntityIcon(b)}</div><div><b>${upgradeEntityName(b)} · Stufe ${b.level||1}</b><small>${b.key==="workshop"?`Globaler Forschungsaufschlag: ${Math.round(globalResearchIncreaseRate()*100)} % je fremder Stufe.`:b.base.kind==="tower"?`Schaden ${Math.round(b.damage)} · Reichweite ${Math.round(b.range)} · Leben ${Math.round(b.maxHp)}`:`Versorgungsgebäude · investiert ${Math.floor(b.investedGold||0)} Gold / ${Math.floor(b.investedWood||0)} Holz`}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="building:${b.bid}">Ansehen</button><button type="button" data-upgrade-buy="building:${b.bid}" ${can?"":"disabled"}>${c.maxed?"✓ MAX":`⬆ ${c.gold} 🪙${c.wood?` · ${c.wood} 🪵`:""}`}</button></div></div>`}).join(""):'<div class="statsHint">Noch keine Gebäude errichtet.</div>';
 const unitRows=state.units.length?state.units.map(u=>{const c=upgradeEntityCost(u),can=!c.maxed&&state.gold>=c.gold;return `<div class="upgradeCenterCard"><div class="upgradeCenterIcon">${upgradeEntityIcon(u)}</div><div><b>${upgradeEntityName(u)} · Stufe ${u.level||1}</b><small>Erfahrung ${u.expLevel||1} · Schaden ${Math.round(u.damage)} · Leben ${Math.round(u.maxHp)}${u.pendingUpgrades?` · ${u.pendingUpgrades} Veteranenwahl bereit`:""}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="unit:${u.uid}">Ansehen</button><button type="button" data-upgrade-buy="unit:${u.uid}" ${can?"":"disabled"}>${c.maxed?"✓ MAX":`⬆ ${c.gold} 🪙`}</button></div></div>`}).join(""):'<div class="statsHint">Noch keine mobilen Einheiten ausgebildet.</div>';
 const research=allResearchTechs().map(t=>`<div class="researchCenterItem"><b>${t.icon} ${t.name}</b><small>${t.desc}</small><div class="level">Stufe ${researchLevel(t.id)}/${t.max}${researchLevel(t.id)<t.max?` · nächste Kosten ${researchCost(t)} 🔬`:" · MAX"}</div></div>`).join("");
 const bonuses=activeGlobalBonuses();
 return `<div class="upgradeHero"><h3>🔱 Upgrade-Zentrale</h3><p>Alle regulären Aufwertungen, Veteranenfortschritte, Forschungen und globalen Verstärkungen dieser Partie an einem Ort.</p><div class="upgradeSummaryGrid"><div class="upgradeSummaryTile"><span>Aufwertbar</span><b>${upgradable.length}</b></div><div class="upgradeSummaryTile"><span>Sofort bezahlbar</span><b>${affordable.length}</b></div><div class="upgradeSummaryTile"><span>Forschungsstufen</span><b>${workshopLevels()}</b></div><div class="upgradeSummaryTile"><span>Forschungspunkte</span><b>${Math.floor(state.researchPoints||0)} 🔬</b></div></div></div><div class="statsSection"><h3>⚒️ Werkstatt</h3><div class="upgradeCenterCard"><div class="upgradeCenterIcon">⚒️</div><div><b>${workshop?`Werkstatt Stufe ${workshop.level}/5`:"Noch keine Werkstatt"}</b><small>${workshop?`Jede fremde Forschungsstufe erhöht Kosten aktuell um ${Math.round(globalResearchIncreaseRate()*100)} %. Insgesamt ${workshopLevels()} erforschte Stufen.`:"Errichte eine Werkstatt, um den Forschungsbaum zu öffnen."}</small></div><div class="upgradeCenterActions">${workshop?'<button type="button" data-open-workshop>🔬 Forschung öffnen</button>':'<button type="button" disabled>Gesperrt</button>'}</div></div></div><div class="statsSection"><h3>🏰 Gebäude-Upgrades</h3>${buildingRows}</div><div class="statsSection"><h3>⚔️ Einheiten-Upgrades</h3>${unitRows}</div><div class="statsSection"><h3>🔬 Forschungsübersicht</h3><div class="researchCenterGrid">${research}</div></div><div class="statsSection"><h3>📈 Aktive globale Boni</h3><div class="bonusPills">${bonuses.length?bonuses.map(x=>`<span class="bonusPill">${x}</span>`).join(""):'<span class="statsHint">Noch keine globalen Forschungen aktiv.</span>'}</div></div><div class="statsSection"><h3>⭐ Empfehlung</h3><div class="recommendationCard">${upgradeRecommendation()}</div></div>`;
}
function findUpgradeEntity(ref){const [kind,idRaw]=String(ref||"").split(":");const id=Number(idRaw);return kind==="building"?state.buildings.find(b=>b.bid===id):kind==="unit"?state.units.find(u=>u.uid===id):null}
function openUpgradeCenter(){prepareStatsScreen();statsTitle.textContent="Upgrade-Zentrale";statsContent.innerHTML=upgradeCenterHtml()}

function openStats(target=selected){
 prepareStatsScreen();
 if(target&&target.kind==="unit"){statsTitle.textContent="Einheitenwerte";statsContent.innerHTML=unitStatsHtml(target)}
 else if(target&&target.kind==="building"){statsTitle.textContent=buildingDisplayName(target);statsContent.innerHTML=buildingStatsHtml(target)}
 else if(target&&typeof target.index==="number"&&target.maxHp){statsTitle.textContent="Palisadenwerte";statsContent.innerHTML=wallStatsHtml(target)}
 else{statsTitle.textContent="Festungsstatistiken";statsContent.innerHTML=overviewStatsHtml()}
}
function closeStats(){statsScreen.classList.add("hidden");statsScreen.style.pointerEvents="none";statsScreen.style.visibility="hidden";statsScreen.style.display="none";last=performance.now();updateUI()}

function clearNavActionState(){
 document.querySelectorAll("#bottomNav .navBtn").forEach(b=>{if(!b.dataset.tab)b.classList.remove("active")});
}
function setBuildTab(tab){
 closeAllBlockingPanels();clearNavActionState();
 navButtons.forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 const cards=[...document.querySelectorAll(".buildBtn")];
 cards.forEach(card=>card.style.display=card.dataset.group===tab?"block":"none");
 buildTray.scrollTo({left:0,behavior:"smooth"});
}
navButtons.forEach(btn=>btn.addEventListener("click",()=>setBuildTab(btn.dataset.tab)));
navUpgrade.addEventListener("click",()=>{
 clearNavActionState();navButtons.forEach(b=>b.classList.remove("active"));navUpgrade.classList.add("active");openUpgradeCenter();
});
navStats.addEventListener("click",()=>{clearNavActionState();navButtons.forEach(b=>b.classList.remove("active"));navStats.classList.add("active");openStats()});
navResearch.addEventListener("click",()=>{clearNavActionState();navButtons.forEach(b=>b.classList.remove("active"));navResearch.classList.add("active");openWorkshopPanel()});
statsCloseBtn.addEventListener("click",closeStats);
ui.resourceOverviewBtn.addEventListener("click",openResourceDetails);
ui.populationOverviewBtn.addEventListener("click",openPopulationDetails);
statsContent.addEventListener("click",e=>{
 const buyUpgrade=e.target.closest("[data-upgrade-buy]");
 if(buyUpgrade){e.preventDefault();e.stopPropagation();const entity=findUpgradeEntity(buyUpgrade.dataset.upgradeBuy);if(entity){selected=entity;upgradeSelected();updateUI();statsContent.innerHTML=upgradeCenterHtml()}return}
 const focusUpgrade=e.target.closest("[data-upgrade-focus]");
 if(focusUpgrade){e.preventDefault();e.stopPropagation();const entity=findUpgradeEntity(focusUpgrade.dataset.upgradeFocus);if(entity){selected=entity;closeStats();camX=entity.x;camY=entity.y;clampCamera();updateUI();showToast(`${upgradeEntityName(entity)} ausgewählt`)}return}
 const openWorkshop=e.target.closest("[data-open-workshop]");if(openWorkshop){e.preventDefault();e.stopPropagation();closeStats();openWorkshopPanel();return}
 const pop=e.target.closest("[data-pop-workplace]");
 if(pop){e.preventDefault();e.stopPropagation();pop.disabled=true;toggleWorkplaceResident(Number(pop.dataset.popWorkplace));return}
 const worker=e.target.closest("[data-building-worker]");
 if(worker){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(worker.dataset.buildingWorker));if(b){selected=b;setBuildingResident(b);openStats(b);updateUI()}return}
 const repair=e.target.closest("[data-building-repair]");
 if(repair){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(repair.dataset.buildingRepair));if(b){selected=b;toggleCraftsmanWork();openStats(b)}return}
 const market=e.target.closest("[data-building-market]");
 if(market){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(market.dataset.buildingMarket));if(b){selected=b;closeStats();openMarketPanel()}return}
 const upgrade=e.target.closest("[data-building-upgrade]");
 if(upgrade){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(upgrade.dataset.buildingUpgrade));if(b){selected=b;upgradeSelected();openStats(b);updateUI()}return}
});
statsScreen.addEventListener("click",e=>{if(e.target===statsScreen)closeStats()});
selectionMoveBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 if(selected.key==="guard"){selected.retreating=true;selected.autoTarget=null;unitCommandMode=null;showToast("Burgwache zieht sich zum Wachpunkt zurück");return}
 selected.controlMode="manual";selected.autoTarget=null;unitCommandMode="move";
 selectionTalentBar.classList.add("hidden");
 showToast("Zielposition auf der Karte antippen");
});
selectionAutoBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 if(selected.key==="guard"){selected.stance=selected.stance==="offense"?"defend":"offense";selected.retreating=false;selected.autoTarget=null;unitCommandMode=null;showToast(selected.stance==="offense"?"Ausfall: Burgwache kämpft außerhalb":"Burg halten: Burgwache bleibt innerhalb");return}
 selected.controlMode=selected.controlMode==="auto"?"manual":"auto";
 selected.autoTarget=null;selected.retargetCd=0;unitCommandMode=null;
 selectionTalentBar.classList.add("hidden");
 showToast(selected.controlMode==="auto"?"Automatik aktiviert":"Automatik deaktiviert");
});
selectionUpgradeBtn.addEventListener("click",e=>{
 e.preventDefault();e.stopPropagation();closeStats();hideRepairDecision();
 if(!selected)return;
 // Normale Gebäudeaufwertung: auf Mobilgeräten direkt über die Auswahlleiste erreichbar.
 if(selected.kind==="building"&&selected.base.kind!=="tower"){
  const before=selected.level||1;
  upgradeSelected();
  if(selected&&selected.key==="house"&&(selected.level||1)>before){
   syncResidents();
   showToast("Holzhaus fertig: 4 Bewohner und höhere Goldproduktion");
  }
  return;
 }
 if((selected.pendingUpgrades||0)<=0)return;
 const allowed=selected.kind==="unit"||(selected.kind==="building"&&selected.base.kind==="tower");
 if(!allowed)return;
 selectionTalentBar.classList.toggle("hidden");
});
selectionDetailsBtn.addEventListener("click",e=>{
 e.stopPropagation();
 openStats(selected);
});
selectionRangeBtn.addEventListener("click",e=>{
 e.stopPropagation();
 rangeDisplayMode=(rangeDisplayMode+1)%3;
 const labels=["Aus","Auswahl","Alle"];
 const icons=["◌","◎","◉"];
 selectionRangeBtn.querySelector("span").textContent=icons[rangeDisplayMode];
 selectionRangeBtn.querySelector("small").textContent=`Reichweite: ${labels[rangeDisplayMode]}`;
 selectionRangeBtn.classList.toggle("active",rangeDisplayMode>0);
 showToast(`Reichweitenanzeige: ${labels[rangeDisplayMode]}`);
});
selectionTalentBar.addEventListener("click",e=>{
 e.preventDefault();e.stopPropagation();hideRepairDecision();
 const btn=e.target.closest("[data-talent]");
 if(!btn||!selected)return;
 if(selected.kind==="unit")applyUnitTalent(selected,btn.dataset.talent);
 else if(selected.kind==="building"&&selected.base.kind==="tower")applyTowerExpTalent(selected,btn.dataset.talent);
 else return;
 if((selected.pendingUpgrades||0)<=0)selectionTalentBar.classList.add("hidden");
});
statsContent.addEventListener("click",e=>{const row=e.target.closest("[data-unit-stat]");if(!row)return;const u=state.units.find(x=>x.uid===Number(row.dataset.unitStat));if(u){selected=u;openStats(u)}});
navMenu.addEventListener("click",()=>{
 clearNavActionState();navButtons.forEach(b=>b.classList.remove("active"));navMenu.classList.add("active");
 openInstructions();
});
setBuildTab("towers");

function updateSelectionHud(){
 if(!selected){
  ui.selectionHud.classList.remove("show");
  selectionTalentBar.classList.add("hidden");
  return;
 }
 ui.selectionHud.classList.add("show");
 let icon="🏰",name="Auswahl",details="";
 const isUnit=selected.kind==="unit";
 if(isUnit){
  icon=selected.key==="guard"?"🛡️":"🏹";name=`${selected.key==="guard"?"Burgwache":"Bogenschütze"} · Stufe ${selected.expLevel||1}`;
  details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · ${selected.key==="guard"?`🛡️ ${Math.round((selected.armor||0)*100)}% · ${selected.retreating?"Rückzug":selected.stance==="offense"?"Ausfall":"Burg halten"} · `:""}🔵 ${Math.floor(selected.xp||0)}/${Math.floor(selected.xpMax||65)} EXP`;
 }else if(selected.kind==="building"){
  icon=selected.base.kind==="tower"?"🏰":"🏠";
  name=`${selected.key==="house"?(selected.level>=2?"Holzhaus":"Zeltlager"):(selected.base.name||selected.key)} · Stufe ${selected.level||1}`;
  details=selected.base.kind==="tower"
   ?`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · 🔵 ${Math.floor(selected.xp||0)}/${Math.floor(selected.xpMax||90)} EXP`
   :selected.key==="house"?`👥 ${residentCapacityForHouse(selected)} Bewohner · 🪙 +${(residentCapacityForHouse(selected)*.18).toFixed(2)}/Sek.`
   :selected.key==="lumber"?`👤 ${buildingHasWorker(selected)?"besetzt":"frei"} · 🪵 ${supportProductionPerSecond(selected).toFixed(2)}/Sek.`
   :selected.key==="repair"?`👤 ${buildingHasWorker(selected)?"besetzt":"frei"} · 👷 ${selected.repairEnabled===false?"gestoppt":"aktiv"}`
   :selected.key==="workshop"?`⚒️ Forschung · 🔬 ${Math.floor(state.researchPoints||0)} · ${workshopLevels()} Stufen`
   :"Versorgungsgebäude";
 }else if(selected.kind==="wall"||typeof selected.index==="number"){
  icon="🧱";name="Palisadenabschnitt";details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)}`;
 }
 ui.selectionPortrait.textContent=icon;
 ui.selectionText.innerHTML=`<b>${name}</b><br>${details}`;
 selectionMoveBtn.classList.toggle("hidden",!isUnit);
 selectionAutoBtn.classList.toggle("hidden",!isUnit);
 const canShowRange=isUnit||(selected.kind==="building"&&selected.base.kind==="tower");
 selectionRangeBtn.classList.toggle("hidden",!canShowRange);
 const isNormalBuilding=selected.kind==="building"&&selected.base.kind!=="tower";
 const normalBuildingCanUpgrade=isNormalBuilding&&(selected.level||1)<(selected.key==="house"?2:5);
 const xpUpgradeReady=(isUnit||(selected.kind==="building"&&selected.base.kind==="tower"))&&(selected.pendingUpgrades||0)>0;
 selectionUpgradeBtn.classList.toggle("hidden",!(normalBuildingCanUpgrade||xpUpgradeReady));
 if(normalBuildingCanUpgrade){
  const g=Math.floor(selected.base.gold*(.65+(selected.level||1)*.45));
  const w=Math.floor(selected.base.wood*(.45+(selected.level||1)*.3));
  selectionUpgradeBtn.querySelector("span").textContent="⬆";
  selectionUpgradeBtn.querySelector("small").textContent=selected.key==="house"?`Zum Holzhaus · ${g}🪙 ${w}🪵`:`Aufwerten · ${g}🪙 ${w}🪵`;
  selectionUpgradeBtn.disabled=state.gold<g||state.wood<w;
 }else{
  selectionUpgradeBtn.querySelector("span").textContent="✦";
  selectionUpgradeBtn.querySelector("small").textContent="EXP-Aufwertung";
  selectionUpgradeBtn.disabled=false;
 }
 selectionMoveBtn.classList.toggle("moveActive",isUnit&&unitCommandMode==="move");
 const isGuard=isUnit&&selected.key==="guard";
 selectionMoveBtn.querySelector("span").textContent=isGuard?"↩":"➜";
 selectionMoveBtn.querySelector("small").textContent=isGuard?"Zurückziehen":"Bewegen";
 selectionAutoBtn.classList.toggle("active",isGuard?selected.stance==="offense":isUnit&&selected.controlMode==="auto");
 selectionAutoBtn.querySelector("span").textContent=isGuard?(selected.stance==="offense"?"⚔️":"🛡️"):(isUnit&&selected.controlMode==="auto"?"🎯":"🛡️");
 selectionAutoBtn.querySelector("small").textContent=isGuard?(selected.stance==="offense"?"Ausfall":"Burg halten"):(isUnit&&selected.controlMode==="auto"?"Automatik an":"Automatik aus");
 const rangeLabels=["Aus","Auswahl","Alle"],rangeIcons=["◌","◎","◉"];
 selectionRangeBtn.querySelector("span").textContent=rangeIcons[rangeDisplayMode];
 selectionRangeBtn.querySelector("small").textContent=`Reichweite: ${rangeLabels[rangeDisplayMode]}`;
 selectionRangeBtn.classList.toggle("active",rangeDisplayMode>0);
 if(isUnit){
  const labels=[
   {id:"damage",icon:"⚔",label:"+24% Schaden"},
   {id:"health",icon:"♥",label:"+28% Leben"},
   {id:"speed",icon:"➤",label:"+16% Tempo"},
   {id:"rate",icon:"✦",label:"−16% Laden"},
   {id:"range",icon:"◎",label:"+12% Reichweite"}
  ];
  [...selectionTalentBar.querySelectorAll("[data-talent]")].forEach((btn,i)=>{
   const t=labels[i];btn.classList.toggle("hidden",!t);
   if(t){btn.dataset.talent=t.id;btn.querySelector("b").textContent=t.icon;btn.querySelector("small").textContent=t.label}
  });
 }else if(selected.kind==="building"&&selected.base.kind==="tower"){
  const labels=[
   {id:"damage",icon:"⚔",label:"+20% Schaden"},
   {id:"range",icon:"◎",label:"+10% Reichweite"},
   {id:"rate",icon:"✦",label:"−12% Laden"},
   {id:"health",icon:"♥",label:"+22% Leben"}
  ];
  [...selectionTalentBar.querySelectorAll("[data-talent]")].forEach((btn,i)=>{
   const t=labels[i];btn.classList.toggle("hidden",!t);
   if(t){btn.dataset.talent=t.id;btn.querySelector("b").textContent=t.icon;btn.querySelector("small").textContent=t.label}
  });
 }else selectionTalentBar.classList.add("hidden");
}



function loop(now){
 const dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;
 try{update(dt);draw();renderLevelUpDock();updateSelectionHud();updateUI()}
 catch(err){console.error("Spielschleife abgefangen:",err);closeAllBlockingPanels();canvas.style.pointerEvents="auto";showToast("Darstellungsfehler abgefangen – Spiel läuft weiter")}
 requestAnimationFrame(loop)
}
try{
 initMap();
 handleOrientationChange();
 if(!isPhoneLandscape())resize();
 setZoom(.48);
 draw();
 updateUI();
}catch(err){
 console.error("Start-Hotfix:",err);
 try{initMap();resize();draw();updateUI()}catch(_){}
}
requestAnimationFrame(loop);
})();

(function disableSaveAndLoadUI(){
 const save=document.getElementById("saveGameBtn");
 const load=document.getElementById("loadGameBtn");
 const del=document.getElementById("deleteSaveBtn");
 const cont=document.getElementById("continueGameBtn")||document.getElementById("continueBtn");
 if(save){save.disabled=true;save.textContent="Speichern aus";save.title="Vorübergehend deaktiviert"}
 if(load){load.disabled=true;load.textContent="Laden aus";load.title="Vorübergehend deaktiviert"}
 if(del){del.disabled=true;del.textContent="Kein Spielstand";del.title="Vorübergehend deaktiviert"}
 if(cont)cont.style.display="none";
 const status=document.getElementById("saveStatus");
 if(status){status.className="saveStatus warn";status.textContent="Speichern und Laden sind vorübergehend deaktiviert."}
})();
