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
 getResearchedTowerStats,
 applyResearchToUnits,
 applyResearchToTowers,
 isResearchRequirementMet,
 getResearchBaseCost,
 getResearchCost,
 getAllResearchTechs
} from "./research.js";

import {
 getSupportProductionPerSecond,
 getTotalGoldPerSecond,
 getMarketLossPercent,
 getRepairBuildingBaseHpPerTick,
 getEmergencyWoodPerSecond,
 runEconomySupportTick
} from "./economy.js";

import {
 POPULATION_MODES,
 createPopulationState,
 ensurePopulationState,
 residentCapacityForHouse as getResidentCapacityForHouse,
 syncResidents as syncResidentState,
 totalResidents as getTotalResidents,
 assignedResidents as getAssignedResidents,
 displacedResidents as getDisplacedResidents,
 freeResidents as getFreeResidents,
 buildingHasWorker as hasBuildingWorker,
 buildingWorkerCount as getBuildingWorkerCount,
 buildingWorkforceEfficiency as getBuildingWorkforceEfficiency,
 workerCapacityForBuilding,
 workplaceGroupSummary,
 adjustWorkplaceWorkers,
 adjustWorkforceGroup,
 autoDistributeResidents,
 setPopulationReserve,
 releaseBuildingResidents as releaseResidentsFromBuilding
} from "./villagers.js";

import {
 getBuildRequirement,
 createEntityAt,
 upgradeEntity,
 sellEntity,
 getBuildingMaxLevel,
 getBuildingUpgradeCost,
 hasBuildingUpgradeEffect
} from "./buildings.js";

import {
 STONE_BUILDING_RESEARCH_ID,
 STONE_BUILDING_REPAIR_STONE_PER_TICK,
 getStoneBuildingUpgrade,
 isStoneBuilding,
 stoneBuildingDisplayName,
 stonePlunderDamageMultiplier,
 stoneResearchCostMultiplier,
 upgradeBuildingToStone
} from "./stone-buildings.js";

import {
 findNearestEnemy,
 findTowerTarget,
 getEffectiveEnemyArmor,
 getEffectiveEnemySpeed,
 getTowerCoverage,
 chooseAutomaticTarget,
 getTowerBehindWall,
 findNearestCastleTower,
 findNearestBlockingUnit,
 findNearestGuardTarget,
 getGuardMeleeReach,
 GUARD_DEFEND_RADIUS_BONUS,
 getGuardRadiusLimit,
 resolveGuardEnemyOverlap,
 isGuardTargetAllowed,
 resolveEnemySeparation,
 createProjectile,
 grantCombatExperience,
 applyTowerTalent,
 applyUnitTalentUpgrade
} from "./combat.js";

import {
 getWaveEnemyCount,
 getBaseWaveEnemyCount,
 getWaveTypeInfo,
 selectWaveEnemyType,
 createWaveEnemy,
 applyWaveAutoRepair,
 getTotalRepairDamage
} from "./game.js";

import { renderGameUI } from "./ui.js";
import { renderGameFrame } from "./render.js";
import { attachGameInput } from "./input.js";
import { saveGameState, loadGameState, deleteSaveGame, getSaveMetadata } from "./save.js";
import {
  beginSiegeAttack,
  ensureSiegePhase,
  getSiegeCampPositions,
  getSiegeReleasePoint,
  prepareSiegePhase,
  updateSiegePhase
} from "./siege.js";
import {
  WAR_COUNCIL_COMMANDS,
  activateWarCouncilCommand,
  createWarCouncilState,
  ensureWarCouncilState,
  getWarCouncilAnalysis,
  getWarCouncilCommand,
  getWarCouncilModifiers,
  resetWarCouncilForWave,
  selectWarCouncilCommand
} from "./war-council.js";
import {
  VETERAN_UNLOCK_LEVEL,
  chooseVeteranSpecialization,
  getVeteranModifiers,
  getVeteranOptions,
  getVeteranSpecialization,
  isEliteEnemy,
  isVeteranChoiceReady,
  veteranSpecializationLabel
} from "./specializations.js";
import {
  activateBonusObjective,
  ensureBonusObjectiveState,
  formatBonusReward,
  getBonusObjectiveView,
  registerBonusEnemyDeath,
  resetBonusObjectiveForWave,
  resolveBonusObjective,
  updateBonusObjective
} from "./bonus-objectives.js";
import {
  CAMPAIGN_FINAL_WAVE,
  continueCampaignInEndlessMode,
  createCampaignState,
  ensureCampaignState,
  finishCampaign,
  formatCampaignReward,
  getCampaignView,
  isCampaignChoiceRequired,
  isCampaignFinished,
  resolveCampaignWave
} from "./campaign.js";
import {
  ACTIVE_WORLD_ID,
  COMMANDER_ACTIVE_LIMIT,
  COMMANDER_PERKS,
  createWorldRunStats,
  formatStartBonuses,
  getActiveStartBonuses,
  getCommanderPointSummary,
  getWorldDefinition,
  getWorldMapView,
  loadWorldMapProfile,
  recordWorldRunWave,
  saveWorldMapProfile,
  selectWorldOnMap,
  syncWorldMapProfileFromSave,
  syncWorldMapProfileFromState,
  toggleCommanderPerk,
  unlockCommanderPerk
} from "./world-map.js";
import { FIXED_INNER_WALL_RADIUS, OUTER_WALL_OFFSET } from "./map-layout.js";
import {
  MIDDLE_WALL_SECTION_COUNT,
  MIDDLE_WALL_SEGMENT_COUNT,
  MIDDLE_WALL_WOOD_MAX_HP,
  MIDDLE_GATE_COUNT,
  isMiddleTowerSpotSegment,
  isOuterTowerSpotSegment,
  OUTER_WALL_SEGMENT_COUNT,
  OUTER_GATE_COUNT,
  createInnerWallSegments,
  createMiddleGates,
  createOuterWallSegments,
  createOuterGates,
  getBuiltMiddleGateCount,
  getBuiltMiddleWallSegmentCount,
  getBuiltOuterWallSegmentCount,
  getBuiltOuterGateCount,
  getInnerWallSegmentForPoint,
  getMiddleGateForPoint,
  getNearestMiddleGateIndexForAngle,
  getMiddleWallSectionIndexForSegment,
  getMiddleWallSegmentAngles,
  getMiddleWallSegmentName,
  getMiddleWallSegmentStatus,
  getMiddleFortificationUpgrade,
  upgradeMiddleFortification,
  getOuterWallSegmentIndexForAngle,
  getOuterGateForPoint,
  getOuterWallSegmentName,
  getOuterWallSegmentStatus,
  hitTestInnerWallSegment,
  hitTestMiddleGate,
  hitTestMiddleWallSegment,
  hitTestOuterWallSegment,
  hitTestOuterGate,
  initializeInnerWallSegments,
  initializeMiddleGates,
  initializeMiddleWallSegments,
  initializeOuterWallSegments,
  initializeOuterGates
} from "./fortifications.js";

// Fortress Commander – zentrale Initialisierung und Spielschleife.
// Fachlogik, Darstellung und Eingaben liegen in eigenständigen Modulen.

(()=>{
"use strict";
const GAME_VERSION="1.17.12";
const GAME_RELEASE_NAME="Forschungsfenster-Hotfix";

const SUPPORTS_STABLE_SMALL_VIEWPORT=Boolean(window.CSS?.supports?.("height: 100svh"));
let lastViewportWidth=Math.round(document.documentElement.clientWidth||window.innerWidth||0);
let lastViewportOrientation=window.matchMedia("(orientation: landscape)").matches?"landscape":"portrait";
function syncVisibleViewportHeight(force=false){
 // Die Breite bleibt immer bei 100 %. Eine festgeschriebene Pixelbreite kann
 // bei kleinen Chrome-Schwankungen horizontalen Ueberlauf erzeugen und den
 // HUD-Scrollstand zwischen zwei Positionen springen lassen.
 const width=Math.max(320,Math.round(document.documentElement.clientWidth||window.innerWidth||0));
 const orientation=window.matchMedia("(orientation: landscape)").matches?"landscape":"portrait";
 const viewportChanged=force||orientation!==lastViewportOrientation||Math.abs(width-lastViewportWidth)>=32;
 if(viewportChanged){
  lastViewportWidth=width;
  lastViewportOrientation=orientation;
 }
 document.documentElement.style.removeProperty("--app-width");
 if(SUPPORTS_STABLE_SMALL_VIEWPORT){
  document.documentElement.style.removeProperty("--app-height");
  return;
 }
 if(!viewportChanged)return;
 const height=Math.max(320,Math.round(document.documentElement.clientHeight||window.innerHeight||0));
 document.documentElement.style.setProperty("--app-height",`${height}px`);
}
syncVisibleViewportHeight(true);
window.addEventListener("resize",()=>syncVisibleViewportHeight(false),{passive:true});
window.addEventListener("orientationchange",()=>setTimeout(()=>syncVisibleViewportHeight(true),180),{passive:true});

const AUTOSAVE_INTERVAL_MS=60_000;
const ACTIVE_ENEMY_LIMIT=(window.matchMedia("(max-width: 900px)").matches||navigator.maxTouchPoints>0)?64:72;
const ENEMY_PULSE_INTERVAL=.11;
const ENEMY_PULSE_PAUSE=1.25;
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
const campaignMapScreen=document.getElementById("campaignMapScreen");
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
  syncVisibleViewportHeight();
  orientationPauseActive=false;
  paused=pausedBeforeOrientation||gameOver;
  last=performance.now();
  setTimeout(()=>resize(),80);
 }
}

let campaignMapHasLiveSession=false;
let worldMapProfile=loadWorldMapProfile();
let selectedCampaignWorldId=worldMapProfile.selectedWorldId||ACTIVE_WORLD_ID;

function beginGameSession(){
 syncVisibleViewportHeight();
 gameSessionStarted=true;
 requestPortraitLock();
 startScreen.classList.add("hidden");
 campaignMapScreen.classList.add("hidden");
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
function formatWorldMapDate(value){
 if(!value)return "Kein Spielstand";
 try{return new Intl.DateTimeFormat("de-DE",{dateStyle:"short",timeStyle:"short"}).format(new Date(value))}
 catch(_){return "Spielstand vorhanden"}
}
function persistWorldMapProfile(){
 worldMapProfile=saveWorldMapProfile(worldMapProfile);
 return worldMapProfile;
}
function syncWorldMapFromCurrentState(){
 worldMapProfile=syncWorldMapProfileFromState(worldMapProfile,state);
 persistWorldMapProfile();
}
function renderCampaignWorldMap(){
 const metadata=getSaveMetadata();
 worldMapProfile=syncWorldMapProfileFromSave(worldMapProfile,metadata);
 worldMapProfile=selectWorldOnMap(worldMapProfile,selectedCampaignWorldId);
 persistWorldMapProfile();
 const view=getWorldMapView(worldMapProfile,metadata);
 const world=view.worlds.find(item=>item.id===selectedCampaignWorldId)||view.worlds[0];
 document.querySelectorAll(".worldNode[data-world-id]").forEach(node=>node.classList.toggle("selected",node.dataset.worldId===world.id));
 document.getElementById("worldInfoIcon").textContent=world.icon;
 document.getElementById("worldInfoSubtitle").textContent=world.subtitle;
 document.getElementById("worldInfoName").textContent=world.name;
 document.getElementById("worldInfoDescription").textContent=world.description;
 document.getElementById("worldInfoFeature").textContent=world.feature;
 const status=document.getElementById("worldInfoStatus");
 const progressBlock=document.getElementById("worldProgressBlock");
 const rewardBlock=document.getElementById("worldRewardBlock");
 const construction=document.getElementById("worldConstructionNotice");
 const primary=document.getElementById("worldPrimaryBtn");
 const restart=document.getElementById("worldNewGameBtn");
 const sealCount=view.worlds[0].seals.filter(seal=>seal.earned).length;
 document.getElementById("campaignMapCommanderPoints").textContent=view.points.available;
 document.getElementById("campaignMapSealCount").textContent=sealCount;
 if(world.underConstruction){
  status.textContent="NOCH IM AUFBAU";status.classList.add("construction");
  progressBlock.classList.add("hidden");rewardBlock.classList.add("hidden");construction.classList.remove("hidden");
  primary.classList.add("hidden");restart.classList.add("hidden");
 }else{
  status.textContent=world.progress.completed?"ABGESCHLOSSEN":"SPIELBAR";status.classList.remove("construction");
  progressBlock.classList.remove("hidden");rewardBlock.classList.remove("hidden");construction.classList.add("hidden");
  primary.classList.remove("hidden");
  const hasSave=metadata?.valid===true;
  const live=campaignMapHasLiveSession&&gameSessionStarted;
  primary.textContent=live?"▶ Zur Festung":hasSave?"▶ Kampagne fortsetzen":"▶ Welt betreten";
  restart.classList.toggle("hidden",!hasSave&&!live);
  document.getElementById("worldProgressText").textContent=`${Math.min(32,world.progress.bestWave)} / 32 Wellen`;
  document.getElementById("worldProgressFill").style.width=`${Math.min(100,world.progress.bestWave/32*100)}%`;
  document.getElementById("worldBossCount").textContent=`${world.progress.bossesDefeated} / 4`;
  document.getElementById("worldSaveInfo").textContent=live?`Aktuelle Welle ${state.wave}`:hasSave?`Welle ${metadata.wave} · ${formatWorldMapDate(metadata.savedAt)}`:"Kein Spielstand";
  document.getElementById("worldSealRow").innerHTML=world.seals.map(seal=>`<div class="worldSeal ${seal.earned?"earned":""}" title="${seal.description}"><span>${seal.icon}</span><b>${seal.name.replace("Siegel des ","")}</b></div>`).join("");
  document.getElementById("worldBonusSuccess").textContent=world.progress.bonusObjectivesCompleted;
  document.getElementById("worldCommanderEarned").textContent=view.points.earned;
  document.getElementById("activeStartBonusText").textContent=formatStartBonuses(worldMapProfile);
 }
}
function commanderPerkHtml(perk,points){
 const unlocked=worldMapProfile.commander.unlockedPerks.includes(perk.id);
 const active=worldMapProfile.commander.activePerks.includes(perk.id);
 const canUnlock=points.available>=perk.cost;
 const action=active?"✓ Aktiv":unlocked?"Aktivieren":`Freischalten · ${perk.cost}⭐`;
 return `<article class="commanderPerk ${active?"active":""}"><div class="commanderPerkIcon">${perk.icon}</div><div class="commanderPerkText"><b>${perk.name}</b><small>${perk.description}</small></div><button type="button" class="commanderPerkAction ${active?"active":unlocked?"":"unlock"}" data-commander-perk="${perk.id}" ${!unlocked&&!canUnlock?"disabled":""}>${action}</button></article>`;
}
function renderCommanderCamp(){
 worldMapProfile=saveWorldMapProfile(worldMapProfile);
 const points=getCommanderPointSummary(worldMapProfile);
 document.getElementById("commanderPointsEarned").textContent=points.earned;
 document.getElementById("commanderPointsSpent").textContent=points.spent;
 document.getElementById("commanderPointsAvailable").textContent=points.available;
 document.getElementById("commanderActiveCount").textContent=worldMapProfile.commander.activePerks.length;
 document.getElementById("commanderPerkGrid").innerHTML=COMMANDER_PERKS.map(perk=>commanderPerkHtml(perk,points)).join("");
 document.getElementById("commanderActiveSummary").textContent=formatStartBonuses(worldMapProfile);
}
function openCommanderCamp(){
 renderCommanderCamp();
 const panel=document.getElementById("commanderCampPanel");panel.classList.remove("hidden");panel.style.pointerEvents="auto";
}
function closeCommanderCamp(){
 const panel=document.getElementById("commanderCampPanel");panel.classList.add("hidden");panel.style.pointerEvents="none";renderCampaignWorldMap();
}
function handleCommanderPerk(perkId){
 const unlocked=worldMapProfile.commander.unlockedPerks.includes(perkId);
 const result=unlocked?toggleCommanderPerk(worldMapProfile,perkId):unlockCommanderPerk(worldMapProfile,perkId);
 worldMapProfile=result.profile;
 if(!result.success){showToast(result.reason||"Vorteil kann nicht gewählt werden");renderCommanderCamp();return}
 if(!unlocked){
  worldMapProfile=saveWorldMapProfile(worldMapProfile);
  const activation=toggleCommanderPerk(worldMapProfile,perkId);
  if(activation.success)worldMapProfile=activation.profile;
 }
 persistWorldMapProfile();renderCommanderCamp();renderCampaignWorldMap();
}
function openCampaignMap(fromGame=false){
 if(fromGame&&state.inWave){showToast("Zur Kampagnenkarte geht es nur zwischen den Wellen");return false}
 if(fromGame){
  saveGame(true);
  campaignMapHasLiveSession=true;
  hidePauseMenu(false);
 }else campaignMapHasLiveSession=false;
 paused=true;state.supportTimer=0;last=performance.now();
 startScreen.classList.add("hidden");instructionsScreen.classList.add("hidden");campaignMapScreen.classList.remove("hidden");
 renderCampaignWorldMap();
 return true;
}
function closeCampaignMapToTitle(){
 campaignMapScreen.classList.add("hidden");startScreen.classList.remove("hidden");instructionsScreen.classList.add("hidden");
 paused=true;gameSessionStarted=false;campaignMapHasLiveSession=false;
}
function enterSelectedCampaignWorld(){
 const world=getWorldDefinition(selectedCampaignWorldId);
 if(world.status!=="playable"){renderCampaignWorldMap();return}
 const metadata=getSaveMetadata();
 const useLiveSession=campaignMapHasLiveSession&&gameSessionStarted;
 beginGameSession();
 campaignMapHasLiveSession=false;
 if(useLiveSession){paused=false;last=performance.now();updateUI();return}
 if(metadata?.valid){
  if(loadGame()){paused=false;last=performance.now();showToast(`🗺️ ${world.name} · Welle ${state.wave}`)}
 }else{
  reset();
  paused=false;last=performance.now();showToast(`🗺️ ${world.name} beginnt · ${formatStartBonuses(worldMapProfile)}`);updateUI();
 }
}
function startNewCampaignWorld(){
 const world=getWorldDefinition(selectedCampaignWorldId);
 if(world.status!=="playable")return;
 const metadata=getSaveMetadata();
 if((metadata?.valid||campaignMapHasLiveSession)&&!window.confirm("Die aktuelle Festung wirklich verwerfen und Welt 1 neu beginnen?"))return;
 if(metadata?.valid)deleteSaveGame();
 autosaveSuppressed=false;
 beginGameSession();
 campaignMapHasLiveSession=false;
 reset();
 syncWorldMapFromCurrentState();
}
let instructionsOpenedFrom="title";
function openInstructions(){
 instructionsOpenedFrom=!campaignMapScreen.classList.contains("hidden")?"map":startScreen.classList.contains("hidden")?"game":"title";
 startScreen.classList.add("hidden");campaignMapScreen.classList.add("hidden");instructionsScreen.classList.remove("hidden");
 instructionsScreen.style.pointerEvents="auto";
 const back=document.getElementById("instructionsBackBtn");if(back)back.textContent=instructionsOpenedFrom==="game"?"← Zurück zum Spiel":instructionsOpenedFrom==="map"?"← Zurück zur Kampagnenkarte":"← Zurück zum Startmenü";
 const book=instructionsScreen.querySelector(".instructionBook");if(book)book.scrollTop=0;
 renderBestiary();
 paused=true;
}
function returnToTitle(){
 instructionsScreen.classList.add("hidden");
 instructionsScreen.style.pointerEvents="none";
 if(instructionsOpenedFrom==="game"){
  startScreen.classList.add("hidden");campaignMapScreen.classList.add("hidden");
  if(!gameOver){paused=false;last=performance.now()}
  const menuButton=document.getElementById("navMenu");if(menuButton)menuButton.classList.remove("active");
  navMore?.classList.remove("active");closeMoreNav();
  updateUI();
 }else if(instructionsOpenedFrom==="map"){
  startScreen.classList.add("hidden");campaignMapScreen.classList.remove("hidden");paused=true;renderCampaignWorldMap();
 }else{
  campaignMapScreen.classList.add("hidden");startScreen.classList.remove("hidden");paused=true;gameSessionStarted=false;
 }
 instructionsOpenedFrom="title";
}
playHotspot.addEventListener("click",()=>openCampaignMap(false));
instructionsHotspot.addEventListener("click",openInstructions);
document.getElementById("campaignMapBackBtn").addEventListener("click",closeCampaignMapToTitle);
document.getElementById("campaignMapInstructionsBtn").addEventListener("click",openInstructions);
document.querySelectorAll(".worldNode[data-world-id]").forEach(node=>node.addEventListener("click",()=>{selectedCampaignWorldId=node.dataset.worldId;worldMapProfile=selectWorldOnMap(worldMapProfile,selectedCampaignWorldId);renderCampaignWorldMap()}));
document.getElementById("worldPrimaryBtn").addEventListener("click",enterSelectedCampaignWorld);
document.getElementById("worldNewGameBtn").addEventListener("click",startNewCampaignWorld);
document.getElementById("commanderCampBtn").addEventListener("click",openCommanderCamp);
document.getElementById("commanderCampCloseBtn").addEventListener("click",closeCommanderCamp);
document.getElementById("commanderCampPanel").addEventListener("click",e=>{const button=e.target.closest("[data-commander-perk]");if(button){e.preventDefault();handleCommanderPerk(button.dataset.commanderPerk);return}if(e.target.id==="commanderCampPanel")closeCommanderCamp()});
instructionsBackBtn.addEventListener("click",returnToTitle);
instructionsCloseBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();returnToTitle()});
instructionsScreen.addEventListener("click",e=>{if(e.target===instructionsScreen)returnToTitle()});

const canvas=document.getElementById("game"),ctx=canvas.getContext("2d"),wrap=document.getElementById("gameWrap");
const gameHeader=document.querySelector("#app > header");
function resetGameHeaderScroll(){if(gameHeader&&gameHeader.scrollLeft!==0)gameHeader.scrollLeft=0}
gameHeader?.addEventListener("scroll",resetGameHeaderScroll,{passive:true});
const ui={
 gold:document.getElementById("gold"),wood:document.getElementById("wood"),stone:document.getElementById("stone"),goldRate:document.getElementById("goldRate"),woodRate:document.getElementById("woodRate"),stoneRate:document.getElementById("stoneRate"),
 resourceOverviewBtn:document.getElementById("resourceOverviewBtn"),populationOverviewBtn:document.getElementById("populationOverviewBtn"),populationBusy:document.getElementById("populationBusy"),populationTotal:document.getElementById("populationTotal"),populationFree:document.getElementById("populationFree"),
 tacticsMenuBtn:document.getElementById("tacticsMenuBtn"),tacticsMenu:document.getElementById("tacticsMenu"),tacticsMenuIcon:document.getElementById("tacticsMenuIcon"),tacticsMenuBadge:document.getElementById("tacticsMenuBadge"),
 wave:document.getElementById("wave"),status:document.getElementById("waveStatus"),
 start:document.getElementById("startWaveBtn"),pause:document.getElementById("pauseBtn"),toast:document.getElementById("toast"),
 warCouncilBtn:document.getElementById("warCouncilBtn"),warCouncilIcon:document.getElementById("warCouncilIcon"),warCouncilLabel:document.getElementById("warCouncilLabel"),
 bonusObjectiveBtn:document.getElementById("bonusObjectiveBtn"),bonusObjectiveIcon:document.getElementById("bonusObjectiveIcon"),bonusObjectiveLabel:document.getElementById("bonusObjectiveLabel"),
 campaignBtn:document.getElementById("campaignProgressBtn"),campaignLabel:document.getElementById("campaignProgressLabel"),campaignBar:document.getElementById("campaignProgressFill"),
 selected:document.getElementById("selectedPanel"),levelDock:document.getElementById("levelUpDock"),upgrade:document.getElementById("upgradeBtn"),
 repairWall:document.getElementById("repairWallBtn"),craftsmanToggle:document.getElementById("craftsmanToggleBtn"),marketTrade:document.getElementById("marketTradeBtn"),statueOffering:document.getElementById("statueOfferingBtn"),sell:document.getElementById("sellBtn"),
 selectionHud:document.getElementById("selectionHud"),selectionText:document.getElementById("selectionText"),selectionPortrait:document.getElementById("selectionPortrait")
};
const TAU=Math.PI*2;
const WORLD_W=3000,WORLD_H=2200,CX=WORLD_W/2,CY=WORLD_H/2;
const SIEGE_CAMPS=getSiegeCampPositions({WORLD_W,WORLD_H});
const WALL_R=355,WALL_SEGMENTS=MIDDLE_WALL_SEGMENT_COUNT,WALL_MAX_HP=MIDDLE_WALL_WOOD_MAX_HP;
const OUTER_WALL_R=WALL_R+OUTER_WALL_OFFSET;
const ARCHER_ZONE_RADII={inner:Math.max(110,FIXED_INNER_WALL_RADIUS-18),middle:WALL_R-26,outer:OUTER_WALL_R-26};
const ARCHER_RETREAT_TRIGGER=104;
const ARCHER_SAFE_DISTANCE=122;
const ARCHER_MELEE_THREAT_TYPES=new Set(["raider","runner","shield","berserker","boss"]);
const HERO_OFFERING_TARGET=2000;
const HERO_AURA_RADIUS=155;
const STATUE_MORALE_DAMAGE_BONUS=.05;
const HERO_AURA_BONUS=.10;
const HERO_ABILITY_DURATION=10;
const HERO_ABILITY_COOLDOWN=60;
const HERO_ABILITY_DAMAGE_BONUS=.25;
const HERO_ABILITY_ARMOR_BONUS=.20;
const HERO_ABILITY_SPEED_BONUS=.15;
const HERO_ABILITY_SELF_ARMOR_BONUS=.30;
const HERO_ABILITY_TAUNT_RADIUS=190;
const GUARD_GATE_ARMOR_BONUS=.15;
const GUARD_GATE_DAMAGE_BONUS=.15;
const CATAPULT_ARMOR_BREAK=.20;
const CATAPULT_SLOW=.15;
const CATAPULT_DEBUFF_DURATION=4;
let warCouncilResumeAfterClose=false;
let bonusObjectiveResumeAfterClose=false;
let campaignResumeAfterClose=false;
let marketResumeAfterClose=false;
function warCouncilState(){return ensureWarCouncilState(state)}
function warCouncilActiveCommand(){return getWarCouncilCommand(warCouncilState().active)}
function warCouncilModifiers(){return getWarCouncilModifiers(state)}
function activeWaveModifier(key,fallback=1){
 if(!state.inWave)return fallback;
 const value=warCouncilModifiers()[key];
 return value===undefined?fallback:value;
}
function fortificationDamageMultiplier(){return activeWaveModifier("fortificationDamageTaken",1)}
function effectiveTowerRange(tower){return tower.range*activeWaveModifier("towerRange",1)*getVeteranModifiers(tower).rangeMultiplier}
function effectiveUnitRange(unit){return unit.range*(unit?.key==="soldier"?activeWaveModifier("archerRange",1):1)*getVeteranModifiers(unit).rangeMultiplier}
function effectiveAttackCooldown(entity){return Math.max(.16,entity.rate*getVeteranModifiers(entity).cooldownMultiplier)}
function heroAuraRadius(hero=getAndreas()){return HERO_AURA_RADIUS*getVeteranModifiers(hero).auraRadiusMultiplier}

function isMeleeHeroUnit(unit){return !!unit&&unit.kind==="unit"&&(unit.key==="guard"||unit.key==="hero")}
function unitDisplayName(unit){return unit?.key==="hero"?"Andreas, der große Held":unit?.key==="guard"?"Burgwache":"Bogenschütze"}
function unitZoneLabel(unit){
 if(!unit||unit.kind!=="unit")return "";
 if(isMeleeHeroUnit(unit)){
  if(unit.stance==="offense")return "Ausfall";
  return (unit.guardZone||"middle")==="outer"?"Äußerer Ring":"Burghalten";
 }
 const zone=unit.zoneMode||"middle";
 return zone==="inner"?"Innenring":zone==="outer"?"Außenring":"Mittelring";
}
function archerZoneRadius(unit){return ARCHER_ZONE_RADII[(unit&&unit.zoneMode)||"middle"]||ARCHER_ZONE_RADII.middle}
function nearestArcherMeleeThreat(unit,maxRange=ARCHER_RETREAT_TRIGGER){
 let best=null,bestDistance=maxRange;
 for(const enemy of state.enemies){
  if(!enemy||enemy.hp<=0||!ARCHER_MELEE_THREAT_TYPES.has(enemy.type)||!(enemy.phase==="inside"||enemy.phase==="core"))continue;
  const distance=Math.hypot(enemy.x-unit.x,enemy.y-unit.y);
  if(distance<bestDistance){bestDistance=distance;best=enemy}
 }
 return best;
}
function moveArcherAwayFromThreat(unit,threat,dt){
 if(!unit||!threat)return false;
 let dx=unit.x-threat.x,dy=unit.y-threat.y,d=Math.hypot(dx,dy);
 if(d<.001){dx=unit.x-CX;dy=unit.y-CY;d=Math.hypot(dx,dy)||1}
 const baseAngle=Math.atan2(dy,dx);
 const step=Math.max(1,effectiveUnitSpeed(unit)*dt*1.12);
 const minRadius=98,maxRadius=Math.max(minRadius+2,archerZoneRadius(unit)-4);
 const currentThreatDistance=Math.hypot(unit.x-threat.x,unit.y-threat.y);
 let bestX=unit.x,bestY=unit.y,bestScore=currentThreatDistance+Math.min(ARCHER_SAFE_DISTANCE,currentThreatDistance)*1.1;
 for(const offset of [0,-.42,.42,-.82,.82,-1.2,1.2]){
  let x=unit.x+Math.cos(baseAngle+offset)*step,y=unit.y+Math.sin(baseAngle+offset)*step;
  let radius=Math.hypot(x-CX,y-CY);
  if(radius>maxRadius){const a=Math.atan2(y-CY,x-CX);x=CX+Math.cos(a)*maxRadius;y=CY+Math.sin(a)*maxRadius;radius=maxRadius}
  if(radius<minRadius){const a=Math.atan2(y-CY,x-CX);x=CX+Math.cos(a)*minRadius;y=CY+Math.sin(a)*minRadius}
  const threatDistance=Math.hypot(x-threat.x,y-threat.y);
  const safetyBonus=Math.min(ARCHER_SAFE_DISTANCE,threatDistance)*1.1;
  const score=threatDistance+safetyBonus-Math.hypot(x-unit.x,y-unit.y)*.04;
  if(score>bestScore){bestScore=score;bestX=x;bestY=y}
 }
 unit.x=bestX;unit.y=bestY;unit.targetX=bestX;unit.targetY=bestY;unit.evadingMelee=true;
 return true;
}
function canPlaceMoveTarget(unit,x,y){
 const d=Math.hypot(x-CX,y-CY);
 if(!unit||unit.kind!=="unit")return false;
 if(isMeleeHeroUnit(unit)){
  if(unit.stance==="offense")return d<OUTER_WALL_R+250&&d>95;
  return d<(((unit.guardZone||"middle")==="outer"?OUTER_WALL_R:WALL_R)-10)&&d>95;
 }
 return d<archerZoneRadius(unit)&&d>95;
}
function getAndreas(){return state.units.find(unit=>unit.key==="hero"&&unit.hp>0)||null}
function hasActiveKriegerstatue(){return state.buildings.some(building=>building.key==="statue")}
function isInsideFortressArea(unit){return Math.hypot(unit.x-CX,unit.y-CY)<=OUTER_WALL_R+12}
function heroAbilityActive(hero=getAndreas()){return !!hero&&(Number(hero.heroAbilityTime)||0)>0}
function hasHeroAura(unit){
 const hero=getAndreas();
 return !!hero&&unit!==hero&&unit.hp>0&&Math.hypot(unit.x-hero.x,unit.y-hero.y)<=heroAuraRadius(hero);
}
function hasHeroAbilityBuff(unit){
 const hero=getAndreas();
 return heroAbilityActive(hero)&&unit!==hero&&unit.hp>0&&Math.hypot(unit.x-hero.x,unit.y-hero.y)<=heroAuraRadius(hero);
}
function effectiveUnitSpeed(unit){
 let multiplier=hasHeroAura(unit)?1+HERO_AURA_BONUS:1;
 if(hasHeroAbilityBuff(unit))multiplier*=1+HERO_ABILITY_SPEED_BONUS;
 multiplier*=activeWaveModifier("unitSpeed",1);
 const veteran=getVeteranModifiers(unit);
 multiplier*=veteran.speedMultiplier;
 if(unit?.stance==="offense")multiplier*=veteran.offenseSpeedMultiplier;
 return unit.speed*multiplier;
}
function unitNearIntactGate(unit){
 if(!unit||unit.key!=="guard"||unit.hp<=0)return false;
 const gates=[
  ...(state.middleGates||[]).map(gate=>({gate,radius:WALL_R})),
  ...(state.outerGates||[]).map(gate=>({gate,radius:OUTER_WALL_R}))
 ];
 return gates.some(({gate,radius})=>gate?.built&&gate.hp>0&&Math.hypot(unit.x-(CX+Math.cos(gate.angle)*radius),unit.y-(CY+Math.sin(gate.angle)*radius))<=92);
}
function effectiveUnitArmor(unit){
 let armor=(unit.armor||0)+(hasHeroAura(unit)?HERO_AURA_BONUS:0);
 if(hasHeroAbilityBuff(unit))armor+=HERO_ABILITY_ARMOR_BONUS;
 if(unit?.key==="hero"&&heroAbilityActive(unit))armor+=HERO_ABILITY_SELF_ARMOR_BONUS;
 const veteran=getVeteranModifiers(unit);
 armor+=veteran.armorDelta;
 if(unitNearIntactGate(unit)){armor+=GUARD_GATE_ARMOR_BONUS;armor+=veteran.nearGateArmorDelta}
 if(unit?.key==="guard")armor+=activeWaveModifier("guardArmorDelta",0);
 return Math.max(0,Math.min(.75,armor));
}
function unitDamageMultiplier(unit,enemy=null){
 let multiplier=1;
 if(hasActiveKriegerstatue()&&isInsideFortressArea(unit))multiplier*=1+STATUE_MORALE_DAMAGE_BONUS;
 if(hasHeroAura(unit))multiplier*=1+HERO_AURA_BONUS;
 if(hasHeroAbilityBuff(unit))multiplier*=1+HERO_ABILITY_DAMAGE_BONUS;
 if(unit?.key==="hero"&&enemy&&isEliteEnemy(enemy))multiplier*=1.35;
 if(unitNearIntactGate(unit))multiplier*=1+GUARD_GATE_DAMAGE_BONUS;
 const veteran=getVeteranModifiers(unit);
 multiplier*=veteran.damageMultiplier;
 if(enemy&&isEliteEnemy(enemy))multiplier*=veteran.eliteDamageMultiplier;
 if(unitNearIntactGate(unit))multiplier*=veteran.nearGateDamageMultiplier;
 if(unit?.stance==="offense")multiplier*=veteran.offenseDamageMultiplier;
 const unitDamageModifier=activeWaveModifier("unitDamage",1);
 if(!(unit?.key==="hero"&&warCouncilActiveCommand().key==="repairs"))multiplier*=unitDamageModifier;
 if(unit?.key==="soldier")multiplier*=activeWaveModifier("archerDamage",1);
 return multiplier;
}
function targetPriorityLabel(unit){
 const value=unit?.targetPriority||"nearest";
 return value==="fast"?"Schnelle Gegner":value==="strong"?"Stärkste Gegner":"Nächste Gegner";
}
function towerCounterText(tower){
 if(tower?.key==="archer")return "Stark gegen Plünderer und Clanspäher (+35 % Schaden) · schwach gegen schwere Rüstung";
 if(tower?.key==="crossbow")return "Durchdringt 50 % Rüstung · stark gegen Eisenschilde, Berserker und Häuptlinge";
 if(tower?.key==="catapult")return "Flächenschaden · 4 Sek. lang −20 % Rüstung und −15 % Tempo";
 return "";
}
const BUILD_COMBAT_INFO=Object.freeze({
 archer:{icon:"🏹",name:"Bogenturm",role:"Schneller Konterturm gegen leichte Massen",strong:"Plünderer und Clanspäher · +35 % Schaden",weak:"Schwere Rüstung und Schilddeckung",tip:"An Flanken und vor erwarteten Späherangriffen bauen. Gegen Eisenschilde durch Armbrust oder Katapult ergänzen."},
 crossbow:{icon:"🎯",name:"Armbrustturm",role:"Präzisionsturm gegen schwere Einzelziele",strong:"Eisenschilde, Blutberserker und Häuptlinge · 50 % Rüstungsdurchdringung",weak:"Langsame Schussfolge und große leichte Gruppen",tip:"Auf Schwerpunktfronten und bei Schildwall- oder Häuptlingsangriffen einsetzen."},
 catapult:{icon:"🪨",name:"Katapult",role:"Flächenkontrolle gegen dichte Formationen",strong:"Gegnergruppen · Rüstungsbruch und Verlangsamung für 4 Sekunden",weak:"Einzelne schnelle Gegner und lange Nachladezeit",tip:"Öffnet Schildformationen für Bogentürme und Armbrüste. Besonders stark vor Toren mit mehreren Reihen."},
 soldier:{icon:"🏹",name:"Bogenschütze",role:"Flexible mobile Fernkampfeinheit",strong:"Zielpriorität frei wählbar und automatische Distanz zu nahen Nahkämpfern",weak:"Speerträger und eingekesselte Positionen",tip:"In der Automatik weicht der Schütze nahen Nahkämpfern aus. Manuelle Bewegungsbefehle bleiben bewusst positionsgetreu."},
 guard:{icon:"🛡️",name:"Burgwache",role:"Blockierer und Torverteidiger",strong:"Nahe intakten Toren +15 % Schaden und +15 Prozentpunkte Rüstung",weak:"Speerjäger aus zweiter Reihe und große Gegnergruppen",tip:"Direkt hinter gefährdeten Toren oder Breschen positionieren. Bogenschützen gegen Speerjäger ergänzen."}
});
function buildCombatInfoHtml(key){
 const info=BUILD_COMBAT_INFO[key];if(!info)return '<div class="statsHint">Keine Kampfinformation verfügbar.</div>';
 return `<div class="combatInfoHero"><div class="combatInfoIcon">${info.icon}</div><div><h3>${info.name}</h3><p>${info.role}</p></div></div><div class="combatInfoGrid"><div class="combatInfoBlock"><h4>✅ Stark gegen</h4><p>${info.strong}</p></div><div class="combatInfoBlock"><h4>⚠ Schwächen</h4><p>${info.weak}</p></div></div><div class="combatInfoTip"><b>Taktischer Einsatz:</b> ${info.tip}</div>`;
}
function openBuildCombatInfo(key){
 const info=BUILD_COMBAT_INFO[key];if(!info)return;
 prepareStatsScreen();statsTitle.textContent=`${info.icon} ${info.name} – Kampfinfos`;statsContent.innerHTML=buildCombatInfoHtml(key);
}

function currentActionText(){
 if(unitCommandMode==="move"&&selected&&selected.kind==="unit")return `➜ Bewegungsziel für ${unitDisplayName(selected)} wählen`;
 if(buildMode){
  const btn=document.querySelector(`.buildBtn[data-build="${buildMode}"] .name`);
  return `🧱 ${btn?btn.textContent:buildMode} bauen · Bauplatz wählen`;
 }
 return "";
}
let vw=1000,vh=700,dpr=1,last=performance.now(),paused=true,gameOver=false;
const BASE_MIN_ZOOM=.18;
const CAMERA_OVERSCROLL_PX=120;
let zoom=.42,maxZoom=1.45,camX=CX,camY=CY;
let buildMode=null,selected=null,unitCommandMode=null,toastTimer=0;
let autosaveSuppressed=false,gameSessionStarted=false;
const BUILD={
 palisade:{name:"Holzpalisade",kind:"fortification",gold:0,wood:5,color:"#81512d"},
 gate:{name:"Holztor",kind:"fortification-gate",gold:0,wood:20,color:"#6f4528"},
 archer:{name:"Bogenturm",kind:"tower",gold:60,wood:20,hp:260,range:215,rate:.72,damage:17,speed:470,color:"#b98a4d",counter:"Leichte Gegner +35 % · schwach gegen Rüstung"},
 crossbow:{name:"Armbrustturm",kind:"tower",gold:95,wood:30,hp:320,range:265,rate:1.45,damage:46,speed:560,color:"#73513b",armorPenetration:.5,counter:"50 % Rüstungsdurchdringung · stark gegen Elite"},
 catapult:{name:"Katapult",kind:"tower",gold:140,wood:55,hp:390,range:315,rate:2.45,damage:58,speed:330,splash:62,color:"#5b554c",armorBreakAmount:.20,slowAmount:.15,debuffDuration:4,counter:"Fläche · Rüstungsbruch und Verlangsamung"},
 soldier:{name:"Bogenschütze",kind:"unit",gold:55,wood:10,hp:145,damage:15,range:120,rate:.85,speed:82,color:"#416a93"},
 guard:{name:"Burgwache",kind:"unit",gold:120,wood:10,hp:180,damage:24,range:30,rate:.78,speed:68,armor:.25,color:"#72583b"},
 house:{name:"Zeltlager",kind:"inside",gold:65,wood:20,hp:240,color:"#9b7651"},
 lumber:{name:"Holzfäller",kind:"inside",gold:70,wood:0,hp:260,color:"#8c6c45"},
 quarry:{name:"Steinbruch",kind:"inside",gold:90,wood:25,hp:340,color:"#77736b"},
 workshop:{name:"Werkstatt",kind:"inside",gold:110,wood:40,hp:300,color:"#6b6b70"},
 repair:{name:"Handwerkerhaus",kind:"inside",gold:90,wood:35,hp:300,color:"#8b7063"},
 market:{name:"Marktplatz",kind:"inside",gold:150,wood:60,hp:280,color:"#8a6b3d"},
 statue:{name:"Kriegerstatue",kind:"inside",gold:45,wood:0,stone:15,hp:420,color:"#8f7958",slotRole:"statue",ritual:true},
 hero:{name:"Andreas, der große Held",kind:"unit",gold:0,wood:0,hp:650,damage:65,range:34,rate:1.05,speed:66,armor:.35,color:"#d4aa52",hero:true}
};
const state={gold:210,wood:105,stone:0,researchPoints:0,hp:1200,maxHp:1200,wave:1,inWave:false,toSpawn:0,spawnTimer:0,supportTimer:0,kills:0,nextUnitId:0,nextBuildingId:0,nextResidentId:0,nextEnemyId:0,
 enemies:[],projectiles:[],buildings:[],units:[],particles:[],walls:[],innerWalls:[],middleGates:[],outerWalls:[],outerGates:[],craftsmen:[],residents:[],population:createPopulationState(),siege:null,warCouncil:createWarCouncilState(1),bonusObjective:null,campaign:createCampaignState(1),worldRun:createWorldRunStats(),spawnQueue:[],repairActive:false,repairedHp:0,heroOffering:0,heroSummoned:false,heroFallen:false,research:{fortress_autoRepair:0,guard_hp:0,guard_armor:0,archer_damage:0,archer_range:0,archer_rate:0,tower_damage:0,tower_rate:0,tower_hp:0,craft_repair:0,craft_wood:0,craft_speed:0,stone_building:0}};
const wallSlots=[],insideSlots=[],castleSlots=[];

function initMap(){
 state.walls.length=0;state.innerWalls.length=0;state.middleGates.length=0;state.outerWalls.length=0;state.outerGates.length=0;wallSlots.length=0;insideSlots.length=0;castleSlots.length=0;
 for(let i=0;i<WALL_SEGMENTS;i++){
  const angles=getMiddleWallSegmentAngles(i,WALL_SEGMENTS);
  const {a0,a1,am}=angles;
  const quarterIndex=getMiddleWallSectionIndexForSegment(i,WALL_SEGMENTS);
  const segmentInQuarter=i%Math.max(1,WALL_SEGMENTS/MIDDLE_WALL_SECTION_COUNT);
  state.walls.push({kind:"wall",ring:"middle",i,quarterIndex,segmentInQuarter,name:getMiddleWallSegmentName(i,WALL_SEGMENTS),a0,a1,am,material:"wood",built:false,hp:0,maxHp:WALL_MAX_HP});
  const towerSpot=isMiddleTowerSpotSegment(i);
  wallSlots.push({
   type:"wall",ring:"middle",i,towerSpot,
   x:CX+Math.cos(am)*(WALL_R-4),
   y:CY+Math.sin(am)*(WALL_R-4),
   building:null
  });
 }
 state.innerWalls.push(...createInnerWallSegments());
 state.middleGates.push(...createMiddleGates());
 state.outerWalls.push(...createOuterWallSegments());
 state.outerGates.push(...createOuterGates());
 for(const wall of state.outerWalls){
  if(!isOuterTowerSpotSegment(wall.i))continue;
  wallSlots.push({
   type:"outer-wall",ring:"outer",i:wall.i,towerSpot:true,
   x:CX+Math.cos(wall.am)*(OUTER_WALL_R-4),
   y:CY+Math.sin(wall.am)*(OUTER_WALL_R-4),
   building:null
  });
 }
 const villageSlots=[
  [-190,-115],[150,-165],[-228,20],[225,55],
  [-190,155],[-75,245],[85,245],[245,-95],[-110,-245],[15,-235]
 ];
 for(const [ox,oy] of villageSlots){
  insideSlots.push({type:"inside",role:"support",x:CX+ox,y:CY+oy,building:null});
 }
 // Ein eigener Ehrenplatz für die Kriegerstatue. Normale Versorgungsgebäude
 // können diesen Platz nicht belegen.
 insideSlots.push({type:"inside",role:"statue",x:CX+205,y:CY+180,building:null});
 const castleCorners=[[-92,-92],[92,-92],[-92,92],[92,92]];
 castleCorners.forEach(([ox,oy],i)=>castleSlots.push({type:"castle",i,x:CX+ox,y:CY+oy,building:null}));
}
function effectiveMinZoom(){return BASE_MIN_ZOOM;}
function resize(){
 const r=wrap.getBoundingClientRect();vw=r.width;vh=r.height;dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);canvas.style.width=vw+"px";canvas.style.height=vh+"px";
 ctx.setTransform(dpr,0,0,dpr,0,0);
 zoom=Math.max(effectiveMinZoom(),Math.min(maxZoom,zoom));
 clampCamera();
}
function clampCamera(){
 const visibleW=vw/zoom,visibleH=vh/zoom;
 const overscroll=CAMERA_OVERSCROLL_PX/zoom;
 // Passt die vollständige Karte in eine Achse, bleibt sie dort sauber zentriert.
 // Bei höherem Zoom darf die Kameramitte bis knapp über den Kartenrand hinaus,
 // damit Randbereiche trotz HUD in die Bildschirmmitte gezogen werden können.
 camX=visibleW>=WORLD_W?CX:Math.max(-overscroll,Math.min(WORLD_W+overscroll,camX));
 camY=visibleH>=WORLD_H?CY:Math.max(-overscroll,Math.min(WORLD_H+overscroll,camY));
}
function setZoom(v,focusX=vw/2,focusY=vh/2){
 const before=screenToWorld(focusX,focusY);zoom=Math.max(effectiveMinZoom(),Math.min(maxZoom,v));
 const after=screenToWorld(focusX,focusY);camX+=before.x-after.x;camY+=before.y-after.y;clampCamera();
}
function centerCamera(){camX=CX;camY=CY;clampCamera();}
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
function displacedResidents(){return getDisplacedResidents(state)}
function freeResidents(){return getFreeResidents(state)}
function buildingHasWorker(building){return hasBuildingWorker(building)}
function buildingWorkerCount(building){return getBuildingWorkerCount(state,building)}
function buildingWorkforceEfficiency(building){return getBuildingWorkforceEfficiency(state,building)}
function populationState(){return ensurePopulationState(state)}
function releaseBuildingResidents(building,options){return releaseResidentsFromBuilding(state,building,options)}
const REPAIR_TICK_SECONDS=1;
const BASE_REPAIR_WOOD_PER_TICK=0.5;
function researchLevel(id){return getResearchLevel(state.research,id)}
function repairHpPerTick(building){return getRepairHpPerTick(state.research,getRepairBuildingBaseHpPerTick(building))*buildingWorkforceEfficiency(building)*activeWaveModifier("repairSpeed",1)}
function repairHpPerCraftsmanTick(building){const workers=Math.max(1,buildingWorkerCount(building));return repairHpPerTick(building)/workers}
function repairWoodPerTick(){return getRepairWoodPerTick(state.research,BASE_REPAIR_WOOD_PER_TICK)*activeWaveModifier("repairCost",1)}
function craftsmanMoveSpeed(){return getCraftsmanMoveSpeed(state.research)}
function fortressAutoRepairPercent(){return getFortressAutoRepairPercent(state.research)}
function researchedUnitStats(key){return getResearchedUnitStats(key,BUILD,state.research)}
function researchedTowerStats(key){return getResearchedTowerStats(key,BUILD,state.research)}
function applyResearchToExistingUnits(techId,oldLevel,newLevel){return applyResearchToUnits(state.units,techId,oldLevel,newLevel)}
function applyResearchToExistingTowers(techId,oldLevel,newLevel){return applyResearchToTowers(state.buildings,techId,oldLevel,newLevel)}

function applyAutomaticWaveRepair(){return warCouncilModifiers().autoRepairAllowed===false?0:applyWaveAutoRepair(state,fortressAutoRepairPercent())}
function totalRepairDamage(){return getTotalRepairDamage(state)}

let activeResearchTab="fortress";
function researchRequirementMet(tech){return isResearchRequirementMet(tech,state.research)&&(!tech.minWave||state.wave>=tech.minWave)}
function researchBaseCost(tech){return getResearchBaseCost(tech,state.research)}
function workshopStaffCostMultiplier(){
 const workshop=workshopBuilding();
 if(!workshop)return 1;
 const workers=buildingWorkerCount(workshop);
 const staffMultiplier=workers<=0?1.25:workers===1?1.10:workers===2?1:workers===3?.90:.85;
 return staffMultiplier*stoneResearchCostMultiplier(workshop);
}
function researchCost(tech){return Math.max(1,Math.ceil(getResearchCost(tech,state.research,globalResearchMultiplier(tech.id))*workshopStaffCostMultiplier()))}
let workshopPausedBefore=false;
function openWorkshopPanel(){
 if(!state.buildings.some(b=>b.key==="workshop"))return showToast("Zuerst eine Werkstatt bauen");
 hideRepairDecision();
 workshopPausedBefore=paused;
 paused=true;last=performance.now();
 const panel=document.getElementById("workshopPanel");
 panel.style.removeProperty("display");
 panel.style.removeProperty("visibility");
 panel.style.removeProperty("pointer-events");
 panel.classList.remove("hidden");
 renderWorkshop();
}
function closeWorkshopPanel(resume=true){
 const panel=document.getElementById("workshopPanel");
 panel.classList.add("hidden");
 panel.style.removeProperty("display");
 panel.style.removeProperty("visibility");
 panel.style.removeProperty("pointer-events");
 if(resume&&!gameOver&&!workshopPausedBefore){paused=false;last=performance.now()}
 updateUI();
}
function renderWorkshop(){
 const tabs=document.getElementById("workshopTabs"),tree=document.getElementById("techTree"),points=document.getElementById("workshopPointsValue");
 points.textContent=Math.floor(state.researchPoints||0);
 tabs.innerHTML=RESEARCH_TABS.map(t=>`<button type="button" class="workshopTab ${t.id===activeResearchTab?"active":""}" data-research-tab="${t.id}">${t.label}</button>`).join("");
 const tab=RESEARCH_TABS.find(t=>t.id===activeResearchTab),techs=RESEARCH_TECHS[activeResearchTab]||[];
 const globalPct=Math.round(globalResearchIncreaseRate()*100),workshopLv=workshopBuildingLevel(),totalLevels=workshopLevels();
 const workshop=workshopBuilding(),staff=workshop?buildingWorkerCount(workshop):0,staffCap=workshop?workerCapacityForBuilding(workshop):0,staffModifier=Math.round((workshopStaffCostMultiplier()-1)*100);
 tree.innerHTML=`<p class="techTreeIntro">${tab.intro}<br><b>Globale Forschungsskalierung:</b> Jede erforschte Stufe erhöht die Kosten aller anderen Technologien um ${globalPct} %. Werkstatt Stufe ${workshopLv}/5 · insgesamt ${totalLevels} Forschungsstufen.<br><b>Werkstattpersonal:</b> ${staff}/${staffCap} · ${staffModifier===0?"normale Kosten":staffModifier>0?`+${staffModifier} % Kosten`:`${staffModifier} % Kosten`}.</p><div class="techTrack">${techs.map(tech=>{
  const lv=state.research[tech.id]||0,maxed=lv>=tech.max,unlocked=researchRequirementMet(tech),cost=researchCost(tech),canBuy=unlocked&&!maxed&&(state.researchPoints||0)>=cost;
  const pips=Array.from({length:tech.max},(_,i)=>`<span class="techPip ${i<lv?"on":""}"></span>`).join("");
  const value=tech.values?`${lv?tech.values[lv-1]:"0 %"}`:`Stufe ${lv}/${tech.max}`;
  const nextValue=tech.values&&lv<tech.max?tech.values[lv]:null;
  const requirement=tech.requires?Object.values(RESEARCH_TECHS).flat().find(t=>t.id===tech.requires):null;
  const baseCost=researchBaseCost(tech),globalAdded=Math.max(0,cost-baseCost);
  const lockedReason=tech.minWave&&state.wave<tech.minWave?`Verfügbar ab Welle ${tech.minWave}.`:`Benötigt zuerst: ${requirement?.name||"vorherige Technologie"}.`;
  const tooltip=maxed?`${tech.name} ist vollständig erforscht.`:!unlocked?lockedReason:`Nächste Stufe kostet ${cost} Forschungspunkte (${baseCost} Basis${globalAdded?` + ${globalAdded} global`:""}). Wirkung tritt sofort ein.`;
  const label=maxed?"✓ MAX":!unlocked?"🔒 Gesperrt":`🔬 ${cost} erforschen`;
  return `<article class="techNode ${!unlocked?"locked":""} ${maxed?"maxed":""} ${canBuy?"available":""}" data-tooltip="${tooltip}"><div class="techIcon" aria-hidden="true">${tech.icon}</div><div><h3>${tech.name}</h3><p>${tech.desc}</p><span class="techEffect">Aktuell: ${value}${nextValue?` <span class="techNext">→ ${nextValue}</span>`:""}</span><div class="techLevel" aria-label="Stufe ${lv} von ${tech.max}">${pips}</div></div><button type="button" class="techBuy" data-tech="${tech.id}" data-tooltip="${tooltip}" ${canBuy?"":"disabled"}>${label}</button></article>`
 }).join("")}</div>`;
}
function buyResearch(techId){
 const tech=Object.values(RESEARCH_TECHS).flat().find(t=>t.id===techId);if(!tech)return;
 const lv=state.research[tech.id]||0;if(lv>=tech.max)return showToast("Technologie bereits maximiert");
 if(!researchRequirementMet(tech))return showToast(tech.minWave&&state.wave<tech.minWave?`Verfügbar ab Welle ${tech.minWave}`:"Vorherige Technologie zuerst erforschen");
 const cost=researchCost(tech);if((state.researchPoints||0)<cost)return showToast("Nicht genug Forschungspunkte");
 state.researchPoints-=cost;state.research[tech.id]=lv+1;applyResearchToExistingUnits(tech.id,lv,lv+1);applyResearchToExistingTowers(tech.id,lv,lv+1);showToast(`${tech.name}: Stufe ${lv+1} · andere Forschungen +${Math.round(globalResearchIncreaseRate()*100)} %`);renderWorkshop();updateUI();saveGame(true);
}
document.getElementById("workshopResearchBtn").addEventListener("click",openWorkshopPanel);
document.getElementById("workshopCloseBtn").addEventListener("click",()=>closeWorkshopPanel(true));
document.getElementById("workshopPanel").addEventListener("click",e=>{if(e.target.id==="workshopPanel")closeWorkshopPanel(true)});
document.getElementById("workshopTabs").addEventListener("click",e=>{const b=e.target.closest("[data-research-tab]");if(!b)return;activeResearchTab=b.dataset.researchTab;renderWorkshop()});
document.getElementById("techTree").addEventListener("click",e=>{const b=e.target.closest("[data-tech]");if(b)buyResearch(b.dataset.tech)});
document.getElementById("statueOfferingCloseBtn").addEventListener("click",()=>closeStatueOfferingPanel(true));
document.getElementById("statueOfferingPanel").addEventListener("click",e=>{
 const donate=e.target.closest("[data-offering-resource]");
 if(donate){e.preventDefault();donateToStatue(donate.dataset.offeringResource,donate.dataset.offeringAmount);return}
 if(e.target.id==="statueOfferingPanel")closeStatueOfferingPanel(true);
});


let statueOfferingPausedBefore=false;
let heroSummonNoticeTimer=0;
function showHeroSummonNotice(){
 const notice=document.getElementById("heroSummonNotice");
 if(!notice)return;
 notice.classList.remove("hidden");
 clearTimeout(heroSummonNoticeTimer);
 heroSummonNoticeTimer=setTimeout(()=>notice.classList.add("hidden"),4200);
}
function summonAndreas(){
 if(state.heroSummoned)return getAndreas();
 const statue=state.buildings.find(building=>building.key==="statue");
 if(!statue)return null;
 const blueprint=BUILD.hero;
 const dx=CX-statue.slot.x,dy=CY-statue.slot.y,d=Math.max(1,Math.hypot(dx,dy));
 const x=statue.slot.x+dx/d*76,y=statue.slot.y+dy/d*76;
 const hero={
  kind:"unit",uid:++state.nextUnitId,key:"hero",base:blueprint,name:"Andreas, der große Held",isHero:true,
  x,y,targetX:x,targetY:y,homeX:x,homeY:y,
  hp:blueprint.hp,maxHp:blueprint.hp,damage:blueprint.damage,range:blueprint.range,rate:blueprint.rate,speed:blueprint.speed,armor:blueprint.armor,
  stance:"defend",guardZone:"outer",retreating:false,level:1,expLevel:1,xp:0,xpMax:100,pendingUpgrades:0,
  upgradeStats:{damage:0,health:0,speed:0,rate:0,range:0},specialization:null,attackCd:0,retargetCd:0,controlMode:"auto",targetPriority:null,autoTarget:null,
  heroAbilityTime:0,heroAbilityCooldown:0,investedGold:0,investedWood:0,investedStone:0
 };
 state.units.push(hero);
 state.heroOffering=HERO_OFFERING_TARGET;
 state.heroSummoned=true;
 state.heroFallen=false;
 selected=hero;buildMode=null;unitCommandMode=null;
 burst(x,y,"#ffd76e",36);
 showHeroSummonNotice();
 showToast("Andreas, der große Held, kämpft nun für die Festung!");
 return hero;
}
function activateHeroAbility(){
 const hero=selected?.key==="hero"?selected:getAndreas();
 if(!hero||hero.hp<=0)return showToast("Andreas ist nicht kampfbereit");
 if(gameOver||paused)return showToast("Der Ruf kann nur im laufenden Kampf eingesetzt werden");
 if(!state.inWave)return showToast("Ruf des Helden ist nur während eines Angriffs verfügbar");
 if(heroAbilityActive(hero))return showToast("Ruf des Helden ist bereits aktiv");
 const cooldown=Math.max(0,Number(hero.heroAbilityCooldown)||0);
 if(cooldown>0)return showToast(`Ruf des Helden in ${Math.ceil(cooldown)} Sekunden bereit`);
 hero.heroAbilityTime=HERO_ABILITY_DURATION;
 hero.heroAbilityCooldown=HERO_ABILITY_COOLDOWN*getVeteranModifiers(hero).heroCooldownMultiplier;
 hero.autoTarget=null;hero.retargetCd=0;
 burst(hero.x,hero.y,"#ffe173",42);
 burst(hero.x,hero.y,"#b32638",22);
 showToast('„Für die Festung!“ – Ruf des Helden ist aktiv');
 return true;
}
function renderStatueOfferingPanel(){
 const progress=Math.max(0,Math.min(HERO_OFFERING_TARGET,Number(state.heroOffering)||0));
 const remaining=Math.max(0,HERO_OFFERING_TARGET-progress);
 const value=document.getElementById("offeringProgressValue"),fill=document.getElementById("offeringProgressFill"),remainingText=document.getElementById("offeringRemainingText"),grid=document.getElementById("offeringResourceGrid"),status=document.getElementById("offeringStatus");
 if(value)value.textContent=progress.toLocaleString("de-DE");
 if(fill)fill.style.width=`${progress/HERO_OFFERING_TARGET*100}%`;
 if(remainingText)remainingText.textContent=remaining?`Noch ${remaining.toLocaleString("de-DE")} Opferpunkte benötigt.`:"Das Ritual wurde vollendet.";
 const resources=[
  {key:"gold",icon:"🪙",name:"Gold",value:Math.floor(state.gold)},
  {key:"wood",icon:"🪵",name:"Holz",value:Math.floor(state.wood)},
  {key:"stone",icon:"🪨",name:"Stein",value:Math.floor(state.stone)}
 ];
 if(grid)grid.innerHTML=resources.map(resource=>{
  const locked=state.heroSummoned||remaining<=0||resource.value<=0;
  const buttons=[50,100,250].map(amount=>`<button type="button" data-offering-resource="${resource.key}" data-offering-amount="${amount}" ${locked||resource.value<amount?"disabled":""}>+${amount}</button>`).join("");
  return `<article class="offeringResource"><div class="offeringResourceHead"><span>${resource.icon}</span><div><b>${resource.name}</b><small>Vorrat: ${resource.value.toLocaleString("de-DE")}</small></div></div><div class="offeringButtons">${buttons}<button class="offeringMax" type="button" data-offering-resource="${resource.key}" data-offering-amount="max" ${locked?"disabled":""}>Maximum spenden</button></div></article>`;
 }).join("");
 if(status){
  status.classList.toggle("complete",state.heroSummoned);
  status.textContent=state.heroSummoned
   ?state.heroFallen?"Andreas wurde bereits beschworen und ist im Kampf gefallen.":"Andreas, der große Held, wurde beschworen und kämpft für die Festung."
   :"Die Opfergaben sind unwiderruflich. 1 Gold, 1 Holz oder 1 Stein entsprechen jeweils 1 Opferpunkt.";
 }
}
function openStatueOfferingPanel(){
 if(!state.buildings.some(building=>building.key==="statue"))return showToast("Zuerst die Kriegerstatue errichten");
 const panel=document.getElementById("statueOfferingPanel");if(!panel)return;
 statueOfferingPausedBefore=paused;paused=true;last=performance.now();
 renderStatueOfferingPanel();panel.classList.remove("hidden");panel.style.display="grid";panel.style.visibility="visible";panel.style.pointerEvents="auto";
 updateUI();
}
function closeStatueOfferingPanel(resume=true){
 const panel=document.getElementById("statueOfferingPanel");if(panel){panel.classList.add("hidden");panel.style.display="none";panel.style.visibility="hidden";panel.style.pointerEvents="none"}
 if(resume&&!gameOver){paused=statueOfferingPausedBefore;last=performance.now()}
 updateUI();
}
function donateToStatue(resource,requestedAmount){
 if(state.heroSummoned)return showToast("Andreas wurde bereits beschworen");
 if(!["gold","wood","stone"].includes(resource))return false;
 const remaining=Math.max(0,HERO_OFFERING_TARGET-(Number(state.heroOffering)||0));
 const available=Math.max(0,Math.floor(Number(state[resource])||0));
 const requested=requestedAmount==="max"?available:Math.max(0,Math.floor(Number(requestedAmount)||0));
 const amount=Math.min(remaining,available,requested);
 if(amount<=0){showToast("Keine passende Opfergabe verfügbar");return false}
 state[resource]-=amount;state.heroOffering=(Number(state.heroOffering)||0)+amount;
 burst(CX+205,CY+180,"#f4bd55",Math.min(24,6+Math.ceil(amount/50)));
 if(state.heroOffering>=HERO_OFFERING_TARGET)summonAndreas();
 else showToast(`${amount} ${resource==="gold"?"Gold":resource==="wood"?"Holz":"Stein"} geopfert`);
 renderStatueOfferingPanel();updateUI();
 if(!state.inWave)saveGame(true);
 return true;
}


function formatSaveDate(value){
 if(!value)return "unbekannt";
 try{return new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))}
 catch(_){return new Date(value).toLocaleString("de-DE")}
}
function refreshSaveStatus(){
 const box=document.getElementById("saveStatus");
 const save=document.getElementById("saveGameBtn");
 const load=document.getElementById("loadGameBtn");
 const del=document.getElementById("deleteSaveBtn");
 const metadata=getSaveMetadata();

 if(save){
  save.disabled=state.inWave||gameOver;
  save.textContent="💾 Spiel speichern";
  save.title=state.inWave?"Speichern ist nur zwischen den Wellen möglich":"Spielstand lokal in diesem Browser speichern";
 }
 if(load){
  load.disabled=!metadata?.valid;
  load.textContent="📂 Spiel laden";
  load.title=metadata?.valid?"Zuletzt gespeicherten Spielstand laden":"Kein gültiger Speicherstand vorhanden";
 }
 if(del){
  del.disabled=!metadata;
  del.textContent="🗑 Speicherstand löschen";
  del.title=metadata?"Lokalen Speicherstand unwiderruflich löschen":"Kein Speicherstand vorhanden";
 }
 if(!box)return;

 if(state.inWave){
  box.className="saveStatus warn";
  box.textContent="Speichern und Autosave sind nur zwischen den Wellen möglich.";
 }else if(metadata?.valid){
  const label=metadata.saveType==="auto"?"Letzter Autosave":"Letzter Spielstand";
  const version=metadata.gameVersion?` · v${metadata.gameVersion}`:"";
  box.className="saveStatus good";
  box.textContent=`${label}: ${formatSaveDate(metadata.savedAt)} · Welle ${metadata.wave}${version} · Autosave alle 60 s`;
 }else if(metadata){
  box.className="saveStatus warn";
  box.textContent="Ein vorhandener Speicherstand ist ungültig oder veraltet. Autosave ist aktiv.";
 }else if(autosaveSuppressed){
  box.className="saveStatus warn";
  box.textContent="Speicherstand gelöscht · Autosave bis zum nächsten manuellen Speichern pausiert.";
 }else{
  box.className="saveStatus";
  box.textContent="Noch kein lokaler Spielstand vorhanden · Autosave alle 60 s.";
 }
}
function saveGame(silent=false){
 if(silent&&(autosaveSuppressed||!gameSessionStarted||!startScreen.classList.contains("hidden")))return false;
 if(state.inWave||gameOver){
  if(!silent){
   showToast("Speichern ist nur zwischen den Wellen möglich");
   refreshSaveStatus();
  }
  return false;
 }
 try{
  saveGameState({
   state,gameVersion:GAME_VERSION,saveType:silent?"auto":"manual",
   wallSlots,insideSlots,castleSlots,
   view:{zoom,camX,camY}
  });
  syncWorldMapFromCurrentState();
  if(!silent)autosaveSuppressed=false;
  refreshSaveStatus();
  if(!silent)showToast("Spiel gespeichert");
  return true;
 }catch(error){
  console.error(silent?"Autosave fehlgeschlagen:":"Speichern fehlgeschlagen:",error);
  if(!silent)showToast("Spielstand konnte nicht gespeichert werden");
  refreshSaveStatus();
  return false;
 }
}
function loadGame(){
 try{
  const loaded=loadGameState({state,BUILD,wallSlots,insideSlots,castleSlots});
  hideRepairDecision();hideEndScreen();hideCampaignVictoryScreen();closeEnemyInfo(false);
  selected=null;buildMode=null;unitCommandMode=null;gameOver=false;paused=true;autosaveSuppressed=false;
  syncResidents();assignCraftsmen();ensureCurrentSiege();
  const sameMapVersion=/^1\.(15|16|17)\./.test(String(loaded.gameVersion||""));
  if(!sameMapVersion){
   const shiftX=CX-1200,shiftY=CY-850;
   for(const unit of state.units){
    for(const key of ["x","targetX","homeX"])if(Number.isFinite(unit[key]))unit[key]+=shiftX;
    for(const key of ["y","targetY","homeY"])if(Number.isFinite(unit[key]))unit[key]+=shiftY;
   }
  }
  camX=sameMapVersion&&Number.isFinite(loaded.view.camX)?loaded.view.camX:CX;
  camY=sameMapVersion&&Number.isFinite(loaded.view.camY)?loaded.view.camY:CY;
  setZoom(sameMapVersion&&Number.isFinite(loaded.view.zoom)?loaded.view.zoom:.42);
  clampCamera();last=performance.now();lastDockSignature="";
  syncWorldMapFromCurrentState();
  refreshSaveStatus();updateUI();
  if(isCampaignChoiceRequired(state))showCampaignVictoryScreen(false);
  else if(isCampaignFinished(state))showCampaignVictoryScreen(true);
  showToast(`Spielstand geladen · Welle ${loaded.wave}`);
  return true;
 }catch(error){
  console.error("Laden fehlgeschlagen:",error);
  showToast("Spielstand konnte nicht geladen werden");
  refreshSaveStatus();
  return false;
 }
}
function deleteSave(){
 const metadata=getSaveMetadata();
 if(!metadata){
  showToast("Kein Speicherstand vorhanden");
  refreshSaveStatus();
  return false;
 }
 const confirmed=window.confirm(
  "Lokalen Speicherstand wirklich löschen?\n\nDie aktuelle Partie bleibt geöffnet, kann danach aber nicht mehr geladen werden."
 );
 if(!confirmed)return false;
 try{
  deleteSaveGame();
  autosaveSuppressed=true;
  refreshSaveStatus();
  showToast("Speicherstand gelöscht");
  return true;
 }catch(error){
  console.error("Löschen fehlgeschlagen:",error);
  showToast("Speicherstand konnte nicht gelöscht werden");
  refreshSaveStatus();
  return false;
 }
}



function updateWarCouncilHud(){
 const button=ui.warCouncilBtn;if(!button)return;
 const council=warCouncilState();
 const key=state.inWave?council.active:council.selected;
 const command=getWarCouncilCommand(key);
 button.classList.toggle("isActive",key!=="none");
 button.classList.toggle("isLocked",state.inWave||council.locked);
 button.hidden=gameOver;
 if(ui.warCouncilIcon)ui.warCouncilIcon.textContent=command.icon;
 if(ui.warCouncilLabel)ui.warCouncilLabel.textContent=state.inWave?command.shortLabel:key==="none"?"Kriegsrat":command.shortLabel;
 button.title=state.inWave?`${command.label} ist für diese Welle aktiv`:`Kriegsrat öffnen · aktuell ${command.label}`;
}
function warCouncilCommandHtml(command,council,analysis){
 const selected=council.selected===command.key;
 const recommended=analysis.recommended.includes(command.key);
 const locked=state.inWave||council.locked;
 return `<button type="button" class="warCommand${selected?" selected":""}${recommended?" recommended":""}" data-war-command="${command.key}" ${locked?"disabled":""}>
  <span class="warCommandIcon">${command.icon}</span><span class="warCommandText"><b>${command.label}</b><small class="warBenefit">${command.benefit}</small><small class="warDrawback">${command.drawback}</small><em>${command.use}</em></span>${recommended?'<span class="warRecommended">EMPFOHLEN</span>':""}${selected?'<span class="warSelected">GEWÄHLT</span>':""}
 </button>`;
}
function renderWarCouncilPanel(){
 const panel=document.getElementById("warCouncilPanel");if(!panel)return;
 const council=warCouncilState(),analysis=getWarCouncilAnalysis(state),command=getWarCouncilCommand(state.inWave?council.active:council.selected);
 document.getElementById("warCouncilWave").textContent=`Welle ${state.wave} · ${analysis.waveType.icon} ${analysis.waveType.label}`;
 document.getElementById("warCouncilEnemySummary").textContent=analysis.enemies;
 document.getElementById("warCouncilFront").textContent=analysis.front;
 document.getElementById("warCouncilRecommendation").textContent=`Empfehlung: ${analysis.recommendationText}`;
 document.getElementById("warCouncilCommandGrid").innerHTML=Object.values(WAR_COUNCIL_COMMANDS).map(item=>warCouncilCommandHtml(item,council,analysis)).join("");
 const status=document.getElementById("warCouncilStatus");
 status.textContent=state.inWave||council.locked?`${command.icon} ${command.label} ist für diese Welle festgelegt.`:`${command.icon} Gewählt: ${command.label}. Bleibt vorgemerkt, bis du den Befehl änderst.`;
 status.classList.toggle("locked",state.inWave||council.locked);
}
function openWarCouncilPanel(){
 const panel=document.getElementById("warCouncilPanel");if(!panel||gameOver)return;
 closeTacticsMenu();
 ensureCurrentSiege();warCouncilResumeAfterClose=!paused&&!gameOver;paused=true;state.supportTimer=0;
 renderWarCouncilPanel();panel.classList.remove("hidden");panel.style.display="grid";panel.style.visibility="visible";panel.style.pointerEvents="auto";updateWarCouncilHud();
}
function closeWarCouncilPanel(resume=true){
 const panel=document.getElementById("warCouncilPanel");if(panel){panel.classList.add("hidden");panel.style.display="none";panel.style.visibility="hidden";panel.style.pointerEvents="none"}
 if(resume&&warCouncilResumeAfterClose&&!gameOver){paused=false;last=performance.now()}
 warCouncilResumeAfterClose=false;updateWarCouncilHud();
}
function chooseWarCouncilCommand(key){
 if(!selectWarCouncilCommand(state,key)){showToast("Der Festungsbefehl ist für diese Welle bereits festgelegt");return}
 const command=getWarCouncilCommand(key);updateWarCouncilHud();saveGame(true);closeWarCouncilPanel(true);showToast(`${command.icon} ${command.label} bleibt aktiv, bis du ihn änderst`);
}

function bonusObjectiveStatusLabel(status){
 return status==="success"?"ERFÜLLT":status==="failed"?"VERFEHLT":status==="active"?"LÄUFT":"BEREIT";
}
function updateBonusObjectiveHud(){
 const button=ui.bonusObjectiveBtn;if(!button)return;
 const view=getBonusObjectiveView(state),status=view.objective.status;
 button.hidden=gameOver;
 button.classList.toggle("isActive",status==="active");
 button.classList.toggle("isSuccess",status==="success");
 button.classList.toggle("isFailed",status==="failed");
 if(ui.bonusObjectiveIcon)ui.bonusObjectiveIcon.textContent=view.definition.icon;
 if(ui.bonusObjectiveLabel)ui.bonusObjectiveLabel.textContent=status==="failed"?"Verfehlt":status==="success"?"Erfüllt":view.definition.shortLabel;
 button.title=`${view.definition.title} · ${view.progress} · Belohnung: ${view.rewardText}`;
}
function renderBonusObjectivePanel(){
 const view=getBonusObjectiveView(state),status=view.objective.status;
 const statusBox=document.getElementById("bonusObjectiveStatus");
 document.getElementById("bonusObjectivePanelIcon").textContent=view.definition.icon;
 document.getElementById("bonusObjectiveTitle").textContent=view.definition.title;
 document.getElementById("bonusObjectiveWave").textContent=`Welle ${view.objective.wave}`;
 document.getElementById("bonusObjectiveDescription").textContent=view.definition.description;
 document.getElementById("bonusObjectiveProgress").textContent=view.progress;
 document.getElementById("bonusObjectiveReward").textContent=view.rewardText||"Keine Belohnung";
 statusBox.textContent=status==="failed"?`✖ ${view.objective.failedReason||"Bonusziel verfehlt"}`:status==="success"?`✓ ${view.definition.successText}`:status==="active"?"Das Bonusziel wird während des laufenden Angriffs überwacht.":"Freiwilliges Ziel: Ein Fehlschlag beendet die Partie nicht.";
 statusBox.dataset.status=status;
 document.getElementById("bonusObjectiveStateBadge").textContent=bonusObjectiveStatusLabel(status);
}
function openBonusObjectivePanel(){
 const panel=document.getElementById("bonusObjectivePanel");if(!panel||gameOver)return;
 closeTacticsMenu();
 ensureCurrentSiege();bonusObjectiveResumeAfterClose=!paused&&!gameOver;paused=true;state.supportTimer=0;
 renderBonusObjectivePanel();panel.classList.remove("hidden");panel.style.display="grid";panel.style.visibility="visible";panel.style.pointerEvents="auto";updateBonusObjectiveHud();
}
function closeBonusObjectivePanel(resume=true){
 const panel=document.getElementById("bonusObjectivePanel");if(panel){panel.classList.add("hidden");panel.style.display="none";panel.style.visibility="hidden";panel.style.pointerEvents="none"}
 if(resume&&bonusObjectiveResumeAfterClose&&!gameOver){paused=false;last=performance.now()}
 bonusObjectiveResumeAfterClose=false;updateBonusObjectiveHud();
}
function applyBonusObjectiveRewards(result){
 if(!result?.success)return {summary:"",repaired:0};
 const reward=result.reward||{};
 state.gold+=(Number(reward.gold)||0);
 state.wood+=(Number(reward.wood)||0);
 state.stone+=(Number(reward.stone)||0);
 state.researchPoints=(state.researchPoints||0)+(Number(reward.researchPoints)||0);
 let repaired=0;
 if((Number(reward.repairPercent)||0)>0)repaired=applyWaveAutoRepair(state,Number(reward.repairPercent));
 if((Number(reward.heroXp)||0)>0){const hero=getAndreas();if(hero)grantCombatXp(hero,Number(reward.heroXp))}
 return {summary:formatBonusReward(reward),repaired};
}

function applyCampaignMilestoneReward(reward){
 if(!reward)return {summary:"",repaired:0};
 state.gold+=(Number(reward.gold)||0);
 state.wood+=(Number(reward.wood)||0);
 state.stone+=(Number(reward.stone)||0);
 state.researchPoints=(state.researchPoints||0)+(Number(reward.researchPoints)||0);
 let repaired=0;
 if((Number(reward.repairPercent)||0)>0)repaired=applyWaveAutoRepair(state,Number(reward.repairPercent));
 return {summary:formatCampaignReward(reward),repaired};
}
function updateCampaignHud(){
 const view=getCampaignView(state),button=ui.campaignBtn;
 if(!button)return;
 button.hidden=gameOver&&!isCampaignFinished(state);
 button.classList.toggle("isEndless",view.campaign.mode==="endless");
 button.classList.toggle("isComplete",view.campaign.completed===true);
 button.classList.toggle("needsChoice",view.campaign.victoryPending===true);
 if(ui.campaignLabel)ui.campaignLabel.textContent=view.campaign.mode==="endless"?`Endlos ${view.endlessWave}`:view.campaign.mode==="completed"?"Abgeschlossen":`${view.completed}/${view.total}`;
 if(ui.campaignBar)ui.campaignBar.style.width=`${Math.max(0,Math.min(100,view.progress*100))}%`;
 button.title=view.campaign.mode==="endless"?`Endlosmodus · Welle ${state.wave}`:`Kampagne · ${view.completed} von ${view.total} Wellen geschafft`;
}
function campaignMilestoneHtml(item){
 const reward=formatCampaignReward(item.reward);
 return `<article class="campaignMilestone ${item.completed?"completed":""} ${item.current?"current":""}"><span class="campaignMilestoneIcon">${item.icon}</span><div><small>WELLE ${item.wave}</small><b>${item.title}</b><p>${item.description}</p><em>${reward}</em></div><strong>${item.completed?"✓":item.current?"JETZT":""}</strong></article>`;
}
function renderCampaignPanel(){
 const view=getCampaignView(state);
 document.getElementById("campaignModeLabel").textContent=view.modeLabel;
 document.getElementById("campaignWaveProgress").textContent=view.campaign.mode==="endless"?`Endloswelle ${view.endlessWave} · Gesamtwelle ${state.wave}`:`${view.completed} von ${view.total} Wellen geschafft`;
 document.getElementById("campaignPanelProgressFill").style.width=`${Math.max(0,Math.min(100,view.progress*100))}%`;
 document.getElementById("campaignMilestoneGrid").innerHTML=view.milestones.map(campaignMilestoneHtml).join("");
 const next=document.getElementById("campaignNextObjective");
 if(view.campaign.mode==="endless")next.textContent=`♾️ Endlosmodus aktiv. Jede achte Welle führt ein stärkerer Endlos-Häuptling an.`;
 else if(view.campaign.mode==="completed")next.textContent="🏆 Die Kampagne wurde erfolgreich abgeschlossen.";
 else if(view.campaign.victoryPending)next.textContent="🏆 Der Kriegsherr ist besiegt. Entscheide über das weitere Schicksal der Festung.";
 else if(view.nextMilestone)next.textContent=`Nächster Meilenstein: ${view.nextMilestone.icon} Welle ${view.nextMilestone.wave} – ${view.nextMilestone.title}`;
 else next.textContent="Die letzte Schlacht steht bevor.";
}
function openCampaignPanel(){
 const panel=document.getElementById("campaignPanel");if(!panel)return;
 campaignResumeAfterClose=!paused&&!gameOver&&!isCampaignChoiceRequired(state);paused=true;state.supportTimer=0;
 renderCampaignPanel();panel.classList.remove("hidden");panel.style.display="grid";panel.style.visibility="visible";panel.style.pointerEvents="auto";updateCampaignHud();
}
function closeCampaignPanel(resume=true){
 const panel=document.getElementById("campaignPanel");if(panel){panel.classList.add("hidden");panel.style.display="none";panel.style.visibility="hidden";panel.style.pointerEvents="none"}
 if(resume&&campaignResumeAfterClose&&!gameOver&&!isCampaignChoiceRequired(state)){paused=false;last=performance.now()}
 campaignResumeAfterClose=false;updateCampaignHud();
}
function campaignVictoryStatsHtml(){
 const view=getCampaignView(state);
 return `<div class="endStat"><span>Wellen geschafft</span><b>${Math.max(CAMPAIGN_FINAL_WAVE,view.campaign.highestCompletedWave)}</b></div><div class="endStat"><span>Gegner besiegt</span><b>${state.kills}</b></div><div class="endStat"><span>Festungsleben</span><b>${Math.round(state.hp)} / ${Math.round(state.maxHp)}</b></div><div class="endStat"><span>Meilensteine</span><b>${view.campaign.milestoneRewardsClaimed.length} / 4</b></div><div class="endStat"><span>Gold übrig</span><b>${Math.floor(state.gold)}</b></div><div class="endStat"><span>Stein übrig</span><b>${Math.floor(state.stone)}</b></div>`;
}
function showCampaignVictoryScreen(finalized=false){
 const screen=document.getElementById("campaignVictoryScreen");if(!screen)return;
 paused=true;state.supportTimer=0;last=performance.now();
 document.getElementById("campaignVictoryStats").innerHTML=campaignVictoryStatsHtml();
 document.getElementById("campaignVictoryChoice").classList.toggle("hidden",finalized);
 document.getElementById("campaignVictoryFinal").classList.toggle("hidden",!finalized);
 screen.classList.remove("hidden");screen.style.display="grid";screen.style.pointerEvents="auto";
}
function hideCampaignVictoryScreen(){const screen=document.getElementById("campaignVictoryScreen");if(screen){screen.classList.add("hidden");screen.style.display="none";screen.style.pointerEvents="none"}}
function continueIntoEndlessMode(){
 continueCampaignInEndlessMode(state);hideCampaignVictoryScreen();gameOver=false;paused=false;last=performance.now();
 ensureWarCouncilState(state);ensureBonusObjectiveState(state);prepareSiegePhase(state,siegeContext());
 showToast(`♾️ Endlosmodus beginnt mit Welle ${state.wave}`);saveGame(true);updateUI();
}
function completeCampaignRun(){
 finishCampaign(state);gameOver=false;paused=true;state.siege=null;state.spawnQueue=[];showCampaignVictoryScreen(true);saveGame(true);updateCampaignHud();
}

function veteranOptionHtml(option,activeId,locked){
 const active=activeId===option.id;
 return `<button type="button" class="veteranOption ${active?"selected":""}" data-veteran-choice="${option.id}" ${locked?"disabled":""}><span class="veteranOptionIcon">${option.icon}</span><span class="veteranOptionText"><b>${option.name}</b><small>${option.role}</small><em class="veteranBenefit">✓ ${option.benefit}</em><em class="veteranDrawback">⚠ ${option.drawback}</em></span>${active?'<span class="veteranSelected">GEWÄHLT</span>':""}</button>`;
}
function renderVeteranPanel(){
 if(!veteranPanel||!veteranPanelEntity)return;
 const entity=veteranPanelEntity,options=getVeteranOptions(entity),active=getVeteranSpecialization(entity);
 const name=entity.kind==="unit"?unitDisplayName(entity):entity.base?.name||entity.key;
 veteranEntitySummary.innerHTML=`<span>${entity.kind==="unit"?(entity.key==="hero"?"👑":entity.key==="guard"?"🛡️":"🏹"):"🏰"}</span><div><b>${name}</b><small>EXP-Stufe ${entity.expLevel||1} · Auswahl ab Stufe ${VETERAN_UNLOCK_LEVEL}</small></div>`;
 const locked=Boolean(active)||(Number(entity.expLevel)||1)<VETERAN_UNLOCK_LEVEL;
 veteranOptionGrid.innerHTML=options.map(option=>veteranOptionHtml(option,active?.id||"",locked)).join("");
 veteranStatus.textContent=active?`${active.icon} ${active.name} ist dauerhaft aktiv.`:locked?`Noch EXP-Stufe ${VETERAN_UNLOCK_LEVEL} erreichen.`:"Wähle genau einen dauerhaften Veteranenpfad. Diese Entscheidung kann nicht rückgängig gemacht werden.";
 veteranStatus.classList.toggle("locked",locked);
}
function openVeteranPanel(entity=selected){
 if(!entity||!getVeteranOptions(entity).length)return;
 veteranPanelEntity=entity;veteranResumeAfterClose=!paused&&!gameOver;paused=true;state.supportTimer=0;
 renderVeteranPanel();veteranPanel.classList.remove("hidden");veteranPanel.style.display="grid";veteranPanel.style.visibility="visible";veteranPanel.style.pointerEvents="auto";
}
function closeVeteranPanel(resume=true){
 if(veteranPanel){veteranPanel.classList.add("hidden");veteranPanel.style.display="none";veteranPanel.style.visibility="hidden";veteranPanel.style.pointerEvents="none"}
 veteranPanelEntity=null;if(resume&&veteranResumeAfterClose&&!gameOver){paused=false;last=performance.now()}veteranResumeAfterClose=false;updateUI();
}
function selectVeteranPath(id){
 if(!veteranPanelEntity)return;
 const chosen=chooseVeteranSpecialization(veteranPanelEntity,id);
 if(!chosen){showToast("Veteranenpfad kann nicht gewählt werden");return}
 burst(veteranPanelEntity.slot?.x??veteranPanelEntity.x,veteranPanelEntity.slot?.y??veteranPanelEntity.y,"#ffd867",24);
 lastDockSignature="";showToast(`⭐ ${chosen.name} gewählt`);renderVeteranPanel();updateSelectionHud();
 if(!state.inWave)saveGame(true);
 setTimeout(()=>closeVeteranPanel(true),280);
}

function updateUI(){
 const result=renderGameUI({
  state,ui,BUILD,WALL_SEGMENTS,MIDDLE_WALL_SEGMENT_COUNT,MIDDLE_GATE_COUNT,OUTER_WALL_SEGMENT_COUNT,OUTER_GATE_COUNT,selected,buildMode,paused,gameOver,
  builtMiddleWallSegments:()=>getBuiltMiddleWallSegmentCount(state),
  builtMiddleGates:()=>getBuiltMiddleGateCount(state),
  builtOuterWallSegments:()=>getBuiltOuterWallSegmentCount(state),
  builtOuterGates:()=>getBuiltOuterGateCount(state),
  navResearch,navResearchBadge,totalGoldPerSecond,
  totalWoodPerSecond,totalStonePerSecond,syncResidents,assignedResidents,totalResidents,freeResidents,
  waveCount,buildRequirement,residentCapacityForHouse,buildingHasWorker,buildingWorkerCount,buildingWorkforceEfficiency,workerCapacityForBuilding,
  supportProductionPerSecond,repairHpPerTick,workshopLevels,
  globalResearchIncreaseRate,marketLossPercent,buildingUpgradePreview,
  getBuildingUpgradeCost,getBuildingMaxLevel,hasBuildingUpgradeEffect,getStoneBuildingUpgrade,HERO_OFFERING_TARGET
 });
 updateWarCouncilHud();
 updateBonusObjectiveHud();
 updateCampaignHud();
 updateTacticsDock();
 if(navMoreBadge){
  navMoreBadge.textContent=Math.floor(state.researchPoints||0);
  navMoreBadge.classList.toggle("isEmpty",Math.floor(state.researchPoints||0)<=0);
 }
 resetGameHeaderScroll();
 return result;
}

function buildRequirement(key){return getBuildRequirement(state,key)}

function isPanelVisible(id){const el=document.getElementById(id);return !!(el&&!el.classList.contains("hidden"));}
function isMoreNavOpen(){return Boolean(moreNavMenu&&!moreNavMenu.classList.contains("hidden")&&window.matchMedia("(max-width: 700px)").matches)}
function closeMoreNav(){
 if(!moreNavMenu||!navMore)return;
 moreNavMenu.classList.add("hidden");
 moreNavMenu.style.removeProperty("display");
 moreNavMenu.style.removeProperty("visibility");
 navMore.setAttribute("aria-expanded","false");
 navMore.classList.remove("menuOpen");
}
function openMoreNav(){
 if(!moreNavMenu||!navMore||!window.matchMedia("(max-width: 700px)").matches)return;
 closeTacticsMenu();
 moreNavMenu.style.removeProperty("display");
 moreNavMenu.style.removeProperty("visibility");
 moreNavMenu.classList.remove("hidden");
 navMore.setAttribute("aria-expanded","true");
 navMore.classList.add("menuOpen");
}
function isTacticsMenuOpen(){return Boolean(ui.tacticsMenu&&!ui.tacticsMenu.classList.contains("hidden"))}
function closeTacticsMenu(){
 if(!ui.tacticsMenu||!ui.tacticsMenuBtn)return;
 ui.tacticsMenu.classList.add("hidden");
 ui.tacticsMenuBtn.setAttribute("aria-expanded","false");
 ui.tacticsMenuBtn.classList.remove("menuOpen");
}
function openTacticsMenu(){
 if(!ui.tacticsMenu||!ui.tacticsMenuBtn||gameOver)return;
 closeMoreNav();
 ui.tacticsMenu.classList.remove("hidden");
 ui.tacticsMenuBtn.setAttribute("aria-expanded","true");
 ui.tacticsMenuBtn.classList.add("menuOpen");
}
function updateTacticsDock(){
 if(!ui.tacticsMenuBtn)return;
 const bonus=getBonusObjectiveView(state);
 const bonusStatus=bonus.objective.status;
 const campaign=getCampaignView(state);
 ui.tacticsMenuBtn.hidden=gameOver;
 if(gameOver)closeTacticsMenu();
 ui.tacticsMenuBtn.classList.toggle("hasAlert",bonusStatus==="active"||bonusStatus==="success"||isCampaignChoiceRequired(state));
 if(ui.tacticsMenuIcon)ui.tacticsMenuIcon.textContent=isCampaignChoiceRequired(state)?"🏆":bonusStatus==="active"?bonus.definition.icon:"🧭";
 if(ui.tacticsMenuBadge){
  const badge=isCampaignChoiceRequired(state)?"Wahl":bonusStatus==="active"?"Ziel":campaign.campaign.mode==="endless"?`∞${campaign.endlessWave}`:`${campaign.completed}/${campaign.total}`;
  ui.tacticsMenuBadge.textContent=badge;
 }
}
function isBlockingPanelOpen(){
 return ["testResourcePanel","statsScreen","workshopPanel","marketPanel","statueOfferingPanel","warCouncilPanel","bonusObjectivePanel","campaignPanel","veteranPanel","enemyInfoOverlay","pauseMenu","instructionsScreen","repairDecision","campaignVictoryScreen","commanderCampPanel"].some(isPanelVisible);
}
function closeTopBlockingPanel(){
 if(isTacticsMenuOpen()){closeTacticsMenu();return "Taktikmenü geschlossen"}
 if(isMoreNavOpen()){closeMoreNav();return "Mehr-Menü geschlossen"}
 if(isPanelVisible("testResourcePanel")){closeTestResourcePanel();return "Testfenster geschlossen"}
 if(isPanelVisible("enemyInfoOverlay")){closeEnemyInfo(true);return "Fenster geschlossen"}
 if(isPanelVisible("marketPanel")){closeMarketPanel();return "Fenster geschlossen"}
 if(isPanelVisible("statueOfferingPanel")){closeStatueOfferingPanel(true);return "Opfergaben geschlossen"}
 if(isPanelVisible("warCouncilPanel")){closeWarCouncilPanel(true);return "Kriegsrat geschlossen"}
 if(isPanelVisible("bonusObjectivePanel")){closeBonusObjectivePanel(true);return "Bonusziel geschlossen"}
 if(isPanelVisible("commanderCampPanel")){closeCommanderCamp();return "Kommandantenlager geschlossen"}
 if(isPanelVisible("campaignPanel")){closeCampaignPanel(true);return "Kampagnenübersicht geschlossen"}
 if(isPanelVisible("veteranPanel")){closeVeteranPanel(true);return "Veteranenwahl geschlossen"}
 if(isPanelVisible("workshopPanel")){closeWorkshopPanel(true);return "Fenster geschlossen"}
 if(isPanelVisible("statsScreen")){closeStats();return "Fenster geschlossen"}
 if(isPanelVisible("pauseMenu")){hidePauseMenu(true);return "Pause geschlossen"}
 if(isPanelVisible("instructionsScreen")){returnToTitle();return "Anleitung geschlossen"}
 if(isPanelVisible("repairDecision")){hideRepairDecision();return "Hinweis geschlossen"}
 return "";
}
function closeAllBlockingPanels(){
 closeMoreNav();closeTacticsMenu();
 hideRepairDecision();
 ["statsScreen","workshopPanel","marketPanel","statueOfferingPanel","warCouncilPanel","bonusObjectivePanel","campaignPanel","veteranPanel","enemyInfoOverlay","pauseMenu"].forEach(id=>{
  const el=document.getElementById(id);
  if(!el||!el.classList.contains("hidden"))return;
  el.style.removeProperty("display");
  el.style.removeProperty("visibility");
  el.style.pointerEvents="none";
 });
 const ins=document.getElementById("instructionsScreen");
 if(ins&&ins.classList.contains("hidden"))ins.style.pointerEvents="none";
}
function cancelActiveAction(source=""){
 const panelMessage=closeTopBlockingPanel();
 if(panelMessage){showToast(panelMessage);return true}
 if(unitCommandMode){unitCommandMode=null;showToast("Bewegungsbefehl abgebrochen");return true}
 if(buildMode){buildMode=null;showToast("Baumodus beendet");return true}
 if(selected){selected=null;showToast("Auswahl aufgehoben");return true}
 return false;
}
function cycleUnitZone(unit){
 if(!unit||unit.kind!=="unit")return;
 if(isMeleeHeroUnit(unit)){
  unit.retreating=false;unit.autoTarget=null;unit.stance="defend";
  unit.guardZone=(unit.guardZone||"middle")==="middle"?"outer":"middle";
  showToast(unit.guardZone==="outer"?`${unitDisplayName(unit)} hält bis zum äußeren Ring`:`${unitDisplayName(unit)} hält bis zur mittleren Mauer`);
  return;
 }
 const next={inner:"middle",middle:"outer",outer:"inner"};
 unit.zoneMode=next[unit.zoneMode||"middle"];
 unit.controlMode="auto";unit.autoTarget=null;unit.retargetCd=0;unitCommandMode=null;
 showToast(`Bogenschütze hält jetzt den ${unitZoneLabel(unit)}`);
}

function siegeContext(){return {getWaveEnemyCount,getBaseWaveEnemyCount,selectWaveEnemyType}}
function ensureCurrentSiege(){
 ensureCampaignState(state);ensureWarCouncilState(state);ensureBonusObjectiveState(state);
 if(isCampaignChoiceRequired(state)||isCampaignFinished(state))return null;
 return ensureSiegePhase(state,siegeContext());
}
function startWave(){
 if(isCampaignChoiceRequired(state)){showCampaignVictoryScreen(false);return false}
 if(isCampaignFinished(state)){showCampaignVictoryScreen(true);return false}
 ensureCurrentSiege();
 const command=activateWarCouncilCommand(state);
 const release=beginSiegeAttack(state,{
  gameOver,assignCraftsmen,hideRepairDecision,showToast,
  setPaused:value=>{paused=value},
  setBuildMode:value=>{buildMode=value},
  setSelected:value=>{selected=value}
 });
 if(!release){state.warCouncil.locked=false;state.warCouncil.active="none";return false}
 activateBonusObjective(state,{fullyGathered:release.reinforcements.length===0});
 closeWarCouncilPanel(false);
 closeBonusObjectivePanel(false);
 if(command.key!=="none")showToast(`${command.icon} ${command.label} ist für Welle ${state.wave} aktiv`);
 if(state.bonusObjective?.status==="failed")showToast(`🎯 Bonusziel verfehlt: ${state.bonusObjective.failedReason}`);
 updateBonusObjectiveHud();
 return true;
}
function spawnEnemy(forcedType=null,spawnPoint=null,approachGateIndex=null,modifiers=null){
 const enemy=createWaveEnemy(state,{WORLD_W,WORLD_H,TAU,enemyStatsFor,discoverEnemy,forcedType,spawnPoint,modifiers});
 if(enemy&&spawnPoint){
  enemy.approachGateIndex=Number.isInteger(approachGateIndex)
   ?approachGateIndex
   :getNearestMiddleGateIndexForAngle(Math.atan2(spawnPoint.y-CY,spawnPoint.x-CX));
 }
 return enemy;
}
function spawnQueuedEnemy(entry){
 if(!entry)return spawnEnemy();
 if(typeof entry==="string")return spawnEnemy(entry);
 const campIndex=Math.max(0,Math.min(SIEGE_CAMPS.length-1,Number(entry.camp)||0));
 const camp=SIEGE_CAMPS[campIndex];
 const point=getSiegeReleasePoint(entry,Math.max(0,Number(entry.orderInCamp)||0),SIEGE_CAMPS);
 const enemy=spawnEnemy(String(entry.type||"raider"),point,camp?.gateIndex,{
  powerScale:entry.powerScale,
  rewardScale:entry.rewardScale
 });
 if(enemy&&entry.campaignRole){
  enemy.campaignRole=String(entry.campaignRole);
  if(entry.campaignName)enemy.name=String(entry.campaignName);
  enemy.visualScale=(Number(enemy.visualScale)||1)*Math.max(.8,Number(entry.visualScale)||1);
 }
 return enemy;
}
function getSpawnDelay(entry,nextEntry){
 if(!nextEntry)return ENEMY_PULSE_INTERVAL;
 return Number(nextEntry.pulseIndex)!==Number(entry?.pulseIndex)
  ?ENEMY_PULSE_PAUSE
  :ENEMY_PULSE_INTERVAL+Math.random()*.035;
}
function enemyAssaultKey(enemy){
 if(!enemy)return "";
 if(enemy.phase==="outer"){
  if(Number.isInteger(enemy.approachGateIndex))return `og:${enemy.approachGateIndex}`;
  if(Number.isInteger(enemy.outerWallIndex))return `ow:${enemy.outerWallIndex}`;
 }
 if(enemy.phase==="outside"){
  if(Number.isInteger(enemy.approachGateIndex))return `mg:${enemy.approachGateIndex}`;
  if(Number.isInteger(enemy.wallIndex))return `mw:${enemy.wallIndex}`;
 }
 if(enemy.phase==="inside"||enemy.phase==="core")return enemy.assaultKey||"";
 return enemy.assaultKey||"";
}
function assaultFormationPoint(enemy,angle,targetRadius,key,frontLimit){
 enemy.assaultKey=key;
 const peers=state.enemies
  .filter(candidate=>candidate.hp>0&&(candidate===enemy||enemyAssaultKey(candidate)===key))
  .sort((a,b)=>(Number(a.eid)||0)-(Number(b.eid)||0));
 const rank=Math.max(0,peers.indexOf(enemy));
 const limit=Math.max(1,frontLimit);
 const inFront=rank<limit;
 const queueIndex=inFront?rank:rank-limit;
 const row=inFront?0:1+Math.floor(queueIndex/limit);
 const slot=inFront?rank:queueIndex%limit;
 const spacing=Math.max(14,Math.min(20,(Number(enemy.radius)||12)*1.05));
 const tangentOffset=(slot-(limit-1)/2)*spacing;
 const radialOffset=row*Math.max(22,(Number(enemy.radius)||12)*1.55);
 const rx=Math.cos(angle),ry=Math.sin(angle),tx=-ry,ty=rx;
 enemy.queueWaiting=!inFront;
 return {
  x:CX+rx*(targetRadius+radialOffset)+tx*tangentOffset,
  y:CY+ry*(targetRadius+radialOffset)+ty*tangentOffset,
  canAttack:inFront,
  row,
  rank
 };
}
function moveEnemyToward(enemy,x,y,dt){
 const dx=x-enemy.x,dy=y-enemy.y,d=Math.hypot(dx,dy);
 if(d<=.001)return d;
 const effectiveSpeed=getEffectiveEnemySpeed(enemy);
 const speed=enemy.queueWaiting?effectiveSpeed*.82:effectiveSpeed;
 const step=Math.min(d,speed*dt);
 enemy.x+=dx/d*step;enemy.y+=dy/d*step;
 return d;
}
function enemyIsEnraged(enemy){return enemy?.type==="berserker"&&enemy.hp>0&&enemy.hp<=enemy.maxHp*.5}
function enemyAttackInterval(enemy){
 let multiplier=enemyIsEnraged(enemy)?.70:1;
 if((Number(enemy?.moraleBreakTime)||0)>0)multiplier*=1.2;
 return Math.max(.22,(Number(enemy?.attackRate)||1)*multiplier);
}
function enemyAttackDamage(enemy){
 let multiplier=enemyIsEnraged(enemy)?1.3:1;
 if(enemy?.bossAura)multiplier*=1.15;
 if((Number(enemy?.moraleBreakTime)||0)>0)multiplier*=.8;
 return Math.max(0,(Number(enemy?.damage)||0)*multiplier);
}
function refreshEnemyAbilityStates(dt){
 const active=state.enemies.filter(enemy=>enemy&&enemy.hp>0);
 for(const enemy of active){enemy.bossAura=false;enemy.shieldProtected=false;enemy.moraleBreakTime=Math.max(0,(Number(enemy.moraleBreakTime)||0)-dt)}
 for(const boss of active.filter(enemy=>enemy.type==="boss"))for(const ally of active){if(ally!==boss&&Math.hypot(ally.x-boss.x,ally.y-boss.y)<=165)ally.bossAura=true}
 for(const shield of active.filter(enemy=>enemy.type==="shield"&&(Number(enemy.armorBreakTime)||0)<=0))for(const ally of active){if(ally!==shield&&Math.hypot(ally.x-shield.x,ally.y-shield.y)<=76)ally.shieldProtected=true}
}
function angularDistance(a,b){let d=Math.abs(a-b)%(Math.PI*2);return d>Math.PI?Math.PI*2-d:d}
function weakestGateIndex(enemy,gates){
 if(!gates?.length)return null;const angle=Math.atan2(enemy.y-CY,enemy.x-CX);let best=null,bestScore=Infinity;
 for(const gate of gates){const ratio=!gate?.built||gate.hp<=0?-1:gate.hp/Math.max(1,gate.maxHp);const score=ratio*3+angularDistance(angle,gate.angle)*.28;if(score<bestScore){bestScore=score;best=gate.i}}
 return best;
}
function updateRunnerWeakPoint(enemy,dt){
 if(enemy?.type!=="runner")return;enemy.scoutRetargetCd=(Number(enemy.scoutRetargetCd)||0)-dt;if(enemy.scoutRetargetCd>0)return;
 const gates=enemy.phase==="outer"?state.outerGates:enemy.phase==="outside"?state.middleGates:null;if(!gates)return;
 const target=weakestGateIndex(enemy,gates);if(Number.isInteger(target)){enemy.approachGateIndex=target;enemy.scoutTargetGateIndex=target}enemy.scoutRetargetCd=1.35;
}
function nearestRaidBuilding(enemy,maxRange=190){
 let best=null,bestDistance=maxRange;for(const building of state.buildings){if(building.hp<=0||building.base.kind==="tower"||building.base.decorative||building.key==="statue")continue;const d=Math.hypot(building.slot.x-enemy.x,building.slot.y-enemy.y);if(d<bestDistance){bestDistance=d;best=building}}return best;
}
function earlyLumberProtectionMultiplier(building){
 if(building?.key!=="lumber"||state.wave>6)return 1;
 const intactLumber=state.buildings.filter(candidate=>candidate.key==="lumber"&&candidate.hp>0).length;
 // Der letzte Holzfäller verliert in den ersten sechs Wellen nicht sofort die
 // gesamte Wirtschaft. Ein zweiter Holzfäller hebt den Anfängerschutz auf.
 return intactLumber <= 1 ? 0.55 : 1;
}
function attackRaidBuilding(enemy,building,dt){
 if(!building)return false;const dx=building.slot.x-enemy.x,dy=building.slot.y-enemy.y,d=Math.max(1,Math.hypot(dx,dy));
 if(d<=40+(Number(enemy.radius)||12)){if(enemy.attackCd<=0){enemy.attackCd=enemyAttackInterval(enemy);enemy.attackAnim=.22;const stone=isStoneBuilding(building),supplyProtection=earlyLumberProtectionMultiplier(building);building.hp=Math.max(0,building.hp-enemyAttackDamage(enemy)*stonePlunderDamageMultiplier(building)*supplyProtection);burst(building.slot.x,building.slot.y,stone?"#aeb5b8":"#b56b32",7);if(building.hp<=0)showToast(`${buildingDisplayName(building)} wurde geplündert!`)}}else{const speed=getEffectiveEnemySpeed(enemy);enemy.x+=dx/d*speed*dt;enemy.y+=dy/d*speed*dt}return true;
}
function applyBossDeathShock(boss){
 let affected=0;for(const enemy of state.enemies){if(enemy===boss||enemy.hp<=0)continue;if(Math.hypot(enemy.x-boss.x,enemy.y-boss.y)<=190){enemy.moraleBreakTime=Math.max(Number(enemy.moraleBreakTime)||0,4);affected++}}
 if(affected)showToast(`Der Häuptling fällt – ${affected} Gegner verlieren ihren Kampfgeist!`);
}
function reapplyPopulationProfile(){
 const population=populationState();
 if(state.inWave||population.mode==="manual")return false;
 return autoDistributeResidents(state,population.mode,{assignCraftsmen});
}
function createAt(x,y,key){
 const created=createEntityAt(x,y,key,{
  state,BUILD,CX,CY,WALL_R,OUTER_WALL_R,wallSlots,castleSlots,insideSlots,
  researchedUnitStats,researchedTowerStats,syncResidents,showToast,
  setBuildMode:value=>{buildMode=value},
  setSelected:value=>{selected=value}
 });
 if(created&&BUILD[key]?.kind==="inside")reapplyPopulationProfile();
 return created;
}
function upgradeSelected(){
 const upgradedEntity=selected;
 const fortificationUpgrade=getMiddleFortificationUpgrade(selected);
 let upgraded=false;
 if(fortificationUpgrade.eligible){
  upgraded=upgradeMiddleFortification(selected,{
   state,showToast,
   setSelected:value=>{selected=value}
  });
 }else{
  const stoneUpgrade=getStoneBuildingUpgrade(selected,state);
  if(stoneUpgrade.supported&&!stoneUpgrade.upgraded&&stoneUpgrade.levelReady){
   if(!stoneUpgrade.canUpgrade){showToast(stoneUpgrade.reason);return false}
   const result=upgradeBuildingToStone(selected,state);
   upgraded=result.ok;
   if(upgraded){
    syncResidents();
    assignCraftsmen();
    showToast(`${result.definition.label} fertig: ${result.definition.description}`);
   }
  }else upgraded=upgradeEntity(selected,{state,syncResidents,showToast,globalResearchIncreaseRate});
 }
 if(upgraded&&upgradedEntity?.kind==="building"&&upgradedEntity.base?.kind!=="tower")reapplyPopulationProfile();
 return upgraded;
}
function sellSelected(){
 if(selected?.kind==="unit"&&selected.key==="hero")return showToast("Andreas kann nicht verkauft werden");
 if(selected?.kind==="building"&&selected.key==="statue"&&((state.heroOffering||0)>0||state.heroSummoned))return showToast("Die Kriegerstatue ist durch das Ritual gebunden");
 const soldEntity=selected;
 const sold=sellEntity(selected,{
  state,syncResidents,releaseBuildingResidents,showToast,
  setSelected:value=>{selected=value}
 });
 if(sold&&soldEntity?.kind==="building"&&soldEntity.base?.kind!=="tower")reapplyPopulationProfile();
 return sold;
}
let residentAssignmentBusy=false;
function setBuildingResident(building,delta=1){
 if(residentAssignmentBusy)return false;
 residentAssignmentBusy=true;
 try{
  const changed=adjustWorkplaceWorkers(state,building,delta,{assignCraftsmen,showToast});
  updateUI();
  return changed;
 }finally{residentAssignmentBusy=false}
}
function repairSelectedWall(){
 if(!selected||selected.kind!=="building")return;
 if(workerCapacityForBuilding(selected)>0){openPopulationDetails();return}
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
function isTowerOperational(building){
 if(!building||building.base?.kind!=="tower"||building.hp<=0)return false;
 if(building.slot?.type!=="wall"&&building.slot?.type!=="outer-wall")return true;
 const support=building.slot.type==="outer-wall"
  ?state.outerWalls[building.slot.i]
  :state.walls[building.slot.i];
 return Boolean(support?.built&&support.hp>0);
}
function towerCoverage(enemy){return getTowerCoverage(state.buildings.filter(isTowerOperational),enemy)}
function chooseAutoTarget(unit){
 return chooseAutomaticTarget(unit,{
  enemies:state.enemies,units:state.units,
  buildings:state.buildings.filter(building=>building.base?.kind!=="tower"||isTowerOperational(building)),
  centerX:CX,centerY:CY
 });
}
function towerBehindWall(index){return getTowerBehindWall(wallSlots,index)}
function nearestCastleTower(enemy){return findNearestCastleTower(state.buildings,enemy)}
function heroSharesEnemyDefenseZone(enemy,hero){
 if(!enemy||!hero)return false;
 const heroRadius=Math.hypot(hero.x-CX,hero.y-CY);
 if(enemy.phase==="inside")return heroRadius>=FIXED_INNER_WALL_RADIUS+18&&heroRadius<=WALL_R-18;
 if(enemy.phase==="core")return heroRadius<FIXED_INNER_WALL_RADIUS+18;
 return false;
}
function nearestBlockingUnit(enemy,maxRange=58){
 const hero=getAndreas();
 if(heroAbilityActive(hero)&&heroSharesEnemyDefenseZone(enemy,hero)&&Math.hypot(enemy.x-hero.x,enemy.y-hero.y)<=maxRange)return hero;
 return findNearestBlockingUnit(state.units,enemy,{centerX:CX,centerY:CY,wallRadius:WALL_R,maxRange});
}
function nearestGateDefender(enemy,gate,radius){
 if(!enemy||!gate)return null;
 const gx=CX+Math.cos(gate.angle)*radius,gy=CY+Math.sin(gate.angle)*radius;
 let best=null,bestDistance=68;
 for(const unit of state.units){
  if(unit?.key!=="guard"||unit.hp<=0)continue;
  if(Math.hypot(unit.x-gx,unit.y-gy)>96)continue;
  const distance=Math.hypot(unit.x-enemy.x,unit.y-enemy.y);
  if(distance<bestDistance){bestDistance=distance;best=unit}
 }
 return best;
}
function enemyAttackDefender(enemy,defender,damageFactor=.6){
 if(!defender)return false;
 if(enemy.attackCd<=0){enemy.attackCd=enemyAttackInterval(enemy);enemy.attackAnim=.22;defender.hp-=enemyAttackDamage(enemy)*damageFactor*(1-effectiveUnitArmor(defender));burst(defender.x,defender.y,"#b84640",4)}
 return true;
}
function handleHeroTaunt(enemy,dt){
 const hero=getAndreas();
 if(!heroAbilityActive(hero)||hero.hp<=0||!heroSharesEnemyDefenseZone(enemy,hero))return false;
 const dx=hero.x-enemy.x,dy=hero.y-enemy.y,d=Math.max(1,Math.hypot(dx,dy));
 if(d>HERO_ABILITY_TAUNT_RADIUS)return false;
 const reach=Math.max(44,(Number(enemy.radius)||12)+31);
 if(d<=reach){
  if(enemy.attackCd<=0){enemy.attackCd=enemyAttackInterval(enemy);enemy.attackAnim=.22;hero.hp-=enemyAttackDamage(enemy)*.6*(1-effectiveUnitArmor(hero));burst(hero.x,hero.y,"#b84640",5)}
 }else{const speed=getEffectiveEnemySpeed(enemy);enemy.x+=dx/d*speed*dt;enemy.y+=dy/d*speed*dt}
 return true;
}
function shoot(from,target,damage,speed,splash=0,color="#f0d176",effects=null){
 return createProjectile(state.projectiles,from,target,damage,speed,splash,color,effects);
}
function applyProjectileEffects(enemy,projectile){
 if(!enemy||!projectile)return;
 if(projectile.armorBreakDuration>0&&projectile.armorBreakAmount>0){
  enemy.armorBreakAmount=Math.max(Number(enemy.armorBreakAmount)||0,projectile.armorBreakAmount);
  enemy.armorBreakTime=Math.max(Number(enemy.armorBreakTime)||0,projectile.armorBreakDuration);
 }
 if(projectile.slowDuration>0&&projectile.slowAmount>0){
  enemy.slowAmount=Math.max(Number(enemy.slowAmount)||0,projectile.slowAmount);
  enemy.slowTime=Math.max(Number(enemy.slowTime)||0,projectile.slowDuration);
 }
}
function projectileDamage(projectile,enemy,multiplier=1){
 const penetration=Math.max(0,Math.min(1,Number(projectile.armorPenetration)||0));
 const armor=Math.max(0,getEffectiveEnemyArmor(enemy)*(1-penetration));
 const shieldReduction=enemy?.shieldProtected?Math.max(0,.28-penetration*.32):0;
 return Math.max(0,projectile.damage*multiplier*(1-armor)*(1-shieldReduction));
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
 return getSupportProductionPerSecond(building,buildingHasWorker)*activeWaveModifier("production",1);
}
function supportProductionAtLevel(building,level){
 return getSupportProductionPerSecond({...building,level},()=>true);
}
function workshopResearchIncreaseRateForLevel(level){
 return [0,.30,.25,.20,.15,.10][Math.max(1,Math.min(5,Number(level)||1))];
}
function deNumber(value,digits=2){
 return Number(value||0).toFixed(digits).replace(".",",");
}
function buildingUpgradePreview(building){
 if(!building||building.kind!=="building"||!hasBuildingUpgradeEffect(building))return null;
 const level=Math.max(1,Number(building.level)||1),maxLevel=getBuildingMaxLevel(building);
 if(level>=maxLevel)return {maxed:true,label:"Maximalstufe erreicht",current:"",next:"",summary:"Keine weitere wirksame Gebäudestufe verfügbar."};
 const nextLevel=level+1,nextBuilding={...building,level:nextLevel};
 if(building.key==="house"){
  const currentResidents=residentCapacityForHouse(building),nextResidents=residentCapacityForHouse(nextBuilding);
  return {maxed:false,label:"Bewohner & Einkommen",current:`${currentResidents} Plätze · ${deNumber(currentResidents*.18)} Gold/Sek.`,next:`${nextResidents} Plätze · ${deNumber(nextResidents*.18)} Gold/Sek.`,summary:`Bewohnerplätze ${currentResidents} → ${nextResidents} · Goldproduktion ${deNumber(currentResidents*.18)} → ${deNumber(nextResidents*.18)}/Sek.`};
 }
 if(building.key==="lumber"){
  const current=supportProductionAtLevel(building,level),next=supportProductionAtLevel(building,nextLevel);
  return {maxed:false,label:"Holzproduktion",current:`${deNumber(current)} Holz/Sek.`,next:`${deNumber(next)} Holz/Sek.`,summary:`Holzproduktion ${deNumber(current)} → ${deNumber(next)}/Sek.`};
 }
 if(building.key==="quarry"){
  const current=supportProductionAtLevel(building,level),next=supportProductionAtLevel(building,nextLevel);
  return {maxed:false,label:"Steinproduktion",current:`${deNumber(current)} Stein/Sek.`,next:`${deNumber(next)} Stein/Sek.`,summary:`Steinproduktion ${deNumber(current)} → ${deNumber(next)}/Sek.`};
 }
 if(building.key==="repair"){
  const current=repairHpPerTick(building),next=repairHpPerTick(nextBuilding);
  return {maxed:false,label:"Reparaturleistung",current:`${deNumber(current,1)} HP/Takt`,next:`${deNumber(next,1)} HP/Takt`,summary:`Reparaturleistung ${deNumber(current,1)} → ${deNumber(next,1)} HP/Takt · Holzbedarf bleibt ${deNumber(repairWoodPerTick(),2)}`};
 }
 if(building.key==="market"){
  const currentGold=supportProductionAtLevel(building,level),nextGold=supportProductionAtLevel(building,nextLevel),currentLoss=marketLossPercent(building),nextLoss=marketLossPercent(nextBuilding);
  return {maxed:false,label:"Handel & Einkommen",current:`${deNumber(currentGold)} Gold/Sek. · ${currentLoss}% Verlust`,next:`${deNumber(nextGold)} Gold/Sek. · ${nextLoss}% Verlust`,summary:`Goldproduktion ${deNumber(currentGold)} → ${deNumber(nextGold)}/Sek. · Handelsverlust ${currentLoss}% → ${nextLoss}%`};
 }
 if(building.key==="workshop"){
  const current=Math.round(workshopResearchIncreaseRateForLevel(level)*100),next=Math.round(workshopResearchIncreaseRateForLevel(nextLevel)*100);
  return {maxed:false,label:"Forschungskosten",current:`${current}% Aufschlag`,next:`${next}% Aufschlag`,summary:`Globaler Forschungsaufschlag ${current}% → ${next}% je fremder Forschungsstufe`};
 }
 return null;
}
function totalGoldPerSecond(){
 return getTotalGoldPerSecond(state,{syncResidents,residentCapacityForHouse,buildingHasWorker})*activeWaveModifier("production",1);
}
function marketLossPercent(building){return Math.max(5,getMarketLossPercent(building)+activeWaveModifier("marketLossDelta",0))}
function marketOutput(amount,building){return Math.floor(amount*(1-marketLossPercent(building)/100))}
function runSupportTick(){
 return runEconomySupportTick(state,{paused,gameOver,syncResidents,residentCapacityForHouse,buildingHasWorker,productionMultiplier:activeWaveModifier("production",1)});
}
function repairTargetInfo(target){
 if(!target)throw new Error("Ungültiges Reparaturziel");
 if(target.kind==="castle")return {x:CX,y:CY-12,need:()=>state.maxHp-state.hp,apply:v=>state.hp=Math.min(state.maxHp,state.hp+v)};
 // Mauersegmente besitzen historisch kein kind-Feld. Deshalb zusätzlich an Winkel/HP erkennen.
 if(target.kind==="wall"||(Number.isFinite(target.am)&&Number.isFinite(target.hp)&&Number.isFinite(target.maxHp))){
  const radius=target.ring==="inner"?FIXED_INNER_WALL_RADIUS:target.ring==="outer"?OUTER_WALL_R:WALL_R;
  return {x:CX+Math.cos(target.am)*radius,y:CY+Math.sin(target.am)*radius,need:()=>target.maxHp-target.hp,apply:v=>target.hp=Math.min(target.maxHp,target.hp+v)};
 }
 if(target.slot)return {x:target.slot.x,y:target.slot.y,need:()=>target.maxHp-target.hp,apply:v=>target.hp=Math.min(target.maxHp,target.hp+v)};
 throw new Error("Reparaturziel ohne Position");
}
function damagedRepairTargets(){
 const list=[];
 if(state.hp<state.maxHp)list.push({kind:"castle"});
 list.push(...[...state.outerWalls,...state.outerGates,...state.walls,...state.innerWalls,...state.middleGates].filter(w=>w.built&&w.hp<w.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp));
 list.push(...state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0&&b.hp<b.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp));
 list.push(...state.buildings.filter(b=>b.base.kind!=="tower"&&!b.base.decorative&&b.key!=="statue"&&b.hp>0&&b.hp<b.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp));
 return list;
}
function assignCraftsmen(){
 // Jeder zugewiesene Bewohner eines Handwerkerhauses wird als eigener
 // Handwerker dargestellt. Die Gesamtleistung des Hauses wird auf das Team
 // aufgeteilt, damit mehrere Figuren nicht unkontrolliert mehrfachen Schaden
 // reparieren.
 const repairHomes=new Map(state.buildings.filter(b=>b&&b.key==="repair"&&b.slot).map(home=>[home.bid,home]));
 const assignments=state.residents.filter(r=>r.job==="craftsman"&&repairHomes.has(r.workplaceId));
 const wanted=new Map(assignments.map(resident=>[resident.id,repairHomes.get(resident.workplaceId)]));
 state.craftsmen=state.craftsmen.filter(c=>c&&wanted.has(c.residentId));
 for(const c of state.craftsmen){
  const home=wanted.get(c.residentId);
  c.home=home;c.homeId=home.bid;
  if(!Number.isFinite(c.x)||!Number.isFinite(c.y)){c.x=home.slot.x;c.y=home.slot.y}
 }
 for(const [residentId,home] of wanted){
  if(state.craftsmen.some(c=>c.residentId===residentId))continue;
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
 const repairable=targets.filter(t=>!isStoneBuilding(t)||state.stone>=STONE_BUILDING_REPAIR_STONE_PER_TICK);
 if(!repairable.length){sendCraftsmanHome(c);return false}
 const available=repairable.filter(t=>!occupied.has(t));
 const pool=available.length?available:repairable;
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
   const stoneRepairCost=isStoneBuilding(c.target)?STONE_BUILDING_REPAIR_STONE_PER_TICK:0;
   if(state.wood<repairWoodPerTick()||state.stone<stoneRepairCost){c.repairTimer=0;c.mode="waiting";goHome(c);continue}
   c.repairTimer-=REPAIR_TICK_SECONDS;
   state.wood=Math.max(0,state.wood-repairWoodPerTick());
   state.stone=Math.max(0,state.stone-stoneRepairCost);
   const repaired=Math.min(repairHpPerCraftsmanTick(c.home),Math.max(0,info.need()));
   info.apply(repaired);state.repairedHp+=repaired;
   burst(info.x,info.y,"#e7c36b",2);
  }
 }
}
function hideRepairDecision(){const p=document.getElementById("repairDecision");if(p){p.classList.add("hidden");p.style.pointerEvents="none"}}

function update(dt){
 if(gameOver)return;
 if(paused)return;
 const activeHero=getAndreas();
 if(activeHero){
  activeHero.heroAbilityTime=Math.max(0,(Number(activeHero.heroAbilityTime)||0)-dt);
  activeHero.heroAbilityCooldown=Math.max(0,(Number(activeHero.heroAbilityCooldown)||0)-dt);
 }
 if(!state.inWave){ensureCurrentSiege();updateSiegePhase(state,dt)}
 if(state.inWave){
  state.supportTimer=(state.supportTimer||0)+dt;
  while(state.supportTimer>=1){state.supportTimer-=1;runSupportTick()}
 }else state.supportTimer=0;
 updateCraftsmen(dt)
 if(state.inWave){
  state.spawnTimer-=dt;
  if(state.toSpawn>0&&state.spawnTimer<=0){
   if(state.enemies.length>=ACTIVE_ENEMY_LIMIT){
    state.spawnTimer=.28;
   }else{
    const queuedEnemy=state.spawnQueue.shift()||null;
    spawnQueuedEnemy(queuedEnemy);
    state.toSpawn=Math.max(0,state.spawnQueue.length);
    state.spawnTimer=getSpawnDelay(queuedEnemy,state.spawnQueue[0]||null);
   }
  }
 }
 refreshEnemyAbilityStates(dt);
 const bonus=1;
 for(const b of state.buildings){
  if(!isTowerOperational(b))continue;
  b.cooldown-=dt;
  const e=findTowerTarget(state.enemies,b,effectiveTowerRange(b));
  if(e&&b.cooldown<=0){
   const veteran=getVeteranModifiers(b);
   b.cooldown=effectiveAttackCooldown(b)*activeWaveModifier("towerCooldown",1);
   let damage=b.damage*bonus*activeWaveModifier("towerDamage",1)*veteran.damageMultiplier;
   let effects=null;
   let splash=b.splash*veteran.splashMultiplier;
   if(b.key==="archer"&&(e.type==="raider"||e.type==="runner"))damage*=1.35;
   if(isEliteEnemy(e))damage*=veteran.eliteDamageMultiplier;
   if(e.maxHp>0&&e.hp/e.maxHp<=.4)damage*=veteran.lowHealthDamageMultiplier;
   if(b.key==="crossbow")effects={armorPenetration:veteran.armorPenetration??.5};
   if(b.key==="catapult")effects={armorBreakAmount:veteran.armorBreakAmount??CATAPULT_ARMOR_BREAK,armorBreakDuration:CATAPULT_DEBUFF_DURATION,slowAmount:veteran.slowAmount??CATAPULT_SLOW,slowDuration:CATAPULT_DEBUFF_DURATION,primaryTargetMultiplier:veteran.primaryTargetMultiplier};
   shoot(b,e,damage,b.speed,splash,b.key==="catapult"?"#493d30":"#f0d176",effects);
  }
 }
 for(const u of state.units){
  if(u.hp<=0)continue;
  const wasEvadingMelee=Boolean(u.evadingMelee);u.evadingMelee=false;
  u.attackCd-=dt;u.retargetCd=(u.retargetCd||0)-dt;
  if(isMeleeHeroUnit(u)){
   // Burgwachen halten ein gültiges Nahkampfziel fest, rücken bis zur
   // Kontaktreichweite vor und suchen nach einem besiegten Ziel sofort neu.
   if(u.retreating){
    u.autoTarget=null;
    const dx=u.homeX-u.x,dy=u.homeY-u.y,d=Math.hypot(dx,dy);
    if(d>4){const step=Math.min(d,effectiveUnitSpeed(u)*dt);u.x+=dx/d*step;u.y+=dy/d*step}
    else{
     u.x=u.homeX;u.y=u.homeY;
     u.retreatTimer=Math.max(0,(u.retreatTimer||0)-dt);
     if(u.retreatTimer<=0){u.retreating=false;u.retargetCd=0}
    }
    continue;
   }

   const targetInvalid=!u.autoTarget||u.autoTarget.hp<=0||!state.enemies.includes(u.autoTarget)||!isGuardTargetAllowed(u,u.autoTarget,{centerX:CX,centerY:CY,wallRadius:WALL_R});
   if(targetInvalid||u.retargetCd<=0){
    u.autoTarget=findNearestGuardTarget(u,state.enemies,{centerX:CX,centerY:CY,wallRadius:WALL_R});
    u.retargetCd=.18;
   }
   const target=u.autoTarget;

   if(target){
    resolveGuardEnemyOverlap(u,target,{centerX:CX,centerY:CY,wallRadius:WALL_R});
    const dx=target.x-u.x,dy=target.y-u.y,d=Math.max(1,Math.hypot(dx,dy));
    const meleeReach=getGuardMeleeReach(u,target);
    if(d<=meleeReach){
     if(u.attackCd<=0){
      u.attackAngle=Math.atan2(target.y-u.y,target.x-u.x);
      u.attackCd=effectiveAttackCooldown(u);
      const dealt=u.damage*unitDamageMultiplier(u,target)*(1-getEffectiveEnemyArmor(target));target.hp-=dealt;target.lastHitEntity=u;
      grantCombatXp(u,Math.min(7,dealt*.075));burst(target.x,target.y,"#f2cf82",7);
     }
    }else{
     const stopDistance=Math.max(10,meleeReach-4);
     const travel=Math.max(0,d-stopDistance);
     const step=Math.min(travel,effectiveUnitSpeed(u)*dt);let nx=u.x+dx/d*step,ny=u.y+dy/d*step;
     const nr=Math.hypot(nx-CX,ny-CY);
     const defendLimit=getGuardRadiusLimit(u,WALL_R);
     if(u.stance!=="offense"&&nr>defendLimit){const a=Math.atan2(ny-CY,nx-CX);nx=CX+Math.cos(a)*(defendLimit-2);ny=CY+Math.sin(a)*(defendLimit-2)}
     if(u.stance==="offense"&&nr>WALL_R+330){const a=Math.atan2(ny-CY,nx-CX);nx=CX+Math.cos(a)*(WALL_R+328);ny=CY+Math.sin(a)*(WALL_R+328)}
     u.x=nx;u.y=ny;
    }
   }else{
    const tx=u.stance==="defend"?u.homeX:u.targetX,ty=u.stance==="defend"?u.homeY:u.targetY;
    const dx=tx-u.x,dy=ty-u.y,d=Math.hypot(dx,dy);if(d>4){const step=Math.min(d,effectiveUnitSpeed(u)*dt);u.x+=dx/d*step;u.y+=dy/d*step}
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
   const distance=t?Math.hypot(t.x-u.x,t.y-u.y):Infinity;
   if(t&&distance<=effectiveUnitRange(u)&&u.attackCd<=0){u.attackAngle=Math.atan2(t.y-u.y,t.x-u.x);u.attackCd=effectiveAttackCooldown(u);shoot(u,t,u.damage*unitDamageMultiplier(u,t)*bonus,480,0,"#bfe0ff")}
   const meleeThreat=nearestArcherMeleeThreat(u,wasEvadingMelee?ARCHER_SAFE_DISTANCE:ARCHER_RETREAT_TRIGGER);
   if(meleeThreat){moveArcherAwayFromThreat(u,meleeThreat,dt);continue}
   if(t&&distance>effectiveUnitRange(u)){
    const dx=t.x-u.x,dy=t.y-u.y,d=Math.max(1,distance);
    const moveSpeed=effectiveUnitSpeed(u);const desiredX=u.x+dx/d*moveSpeed*dt,desiredY=u.y+dy/d*moveSpeed*dt;
    const dc=Math.hypot(desiredX-CX,desiredY-CY);
    const zoneR=archerZoneRadius(u);
    if(dc<zoneR&&dc>92){u.x=desiredX;u.y=desiredY}
    else{
     const a=Math.atan2(t.y-CY,t.x-CX),r=zoneR-4;
     u.targetX=CX+Math.cos(a)*r;u.targetY=CY+Math.sin(a)*r;
     const mdx=u.targetX-u.x,mdy=u.targetY-u.y,md=Math.hypot(mdx,mdy);
     if(md>4){const step=Math.min(md,effectiveUnitSpeed(u)*dt);u.x+=mdx/md*step;u.y+=mdy/md*step}
    }
   }
  }else{
   u.autoTarget=null;
   const e=nearestEnemy(u.x,u.y,effectiveUnitRange(u));
   if(e){
    if(u.attackCd<=0){u.attackAngle=Math.atan2(e.y-u.y,e.x-u.x);u.attackCd=effectiveAttackCooldown(u);shoot(u,e,u.damage*unitDamageMultiplier(u,e)*bonus,480,0,"#bfe0ff")}
   }else{
    const dx=u.targetX-u.x,dy=u.targetY-u.y,d=Math.hypot(dx,dy);
    if(d>4){
      const step=Math.min(d,effectiveUnitSpeed(u)*dt);
      let nx=u.x+dx/d*step,ny=u.y+dy/d*step;
      const zoneR=archerZoneRadius(u);
      const nd=Math.hypot(nx-CX,ny-CY);
      if(nd>zoneR){const a=Math.atan2(ny-CY,nx-CX);nx=CX+Math.cos(a)*(zoneR-2);ny=CY+Math.sin(a)*(zoneR-2)}
      u.x=nx;u.y=ny;
    }
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
      const primaryMultiplier=e===p.target?(Number(p.primaryTargetMultiplier)||1):1;
      const dealt=projectileDamage(p,e,Math.max(0,1-sd/(p.splash*1.7))*primaryMultiplier);
      e.hp-=dealt;applyProjectileEffects(e,p);
      if(p.owner){e.lastHitEntity=p.owner;grantCombatXp(p.owner,Math.min(5,dealt*.045))}
     }
    }
    burst(p.target.x,p.target.y,"#7e6a50",14);
   }else{
    const dealt=projectileDamage(p,p.target,Number(p.primaryTargetMultiplier)||1);
    p.target.hp-=dealt;applyProjectileEffects(p.target,p);
    if(p.owner){p.target.lastHitEntity=p.owner;grantCombatXp(p.owner,Math.min(6,dealt*.06))}
    burst(p.target.x,p.target.y,p.color,3);
   }
   p.dead=true;
  }
  else{p.x+=dx/d*p.speed*dt;p.y+=dy/d*p.speed*dt}
 }
 state.projectiles=state.projectiles.filter(p=>!p.dead);

 for(const e of state.enemies){
  e.queueWaiting=false;e.assaultKey="";e.secondRowAttack=false;
  updateRunnerWeakPoint(e,dt);
  e.armorBreakTime=Math.max(0,(Number(e.armorBreakTime)||0)-dt);
  e.slowTime=Math.max(0,(Number(e.slowTime)||0)-dt);
  e.attackCd-=dt;
  if(e.attackAnim>0)e.attackAnim=Math.max(0,e.attackAnim-dt);
  const dx=CX-e.x,dy=CY-e.y,dCenter=Math.max(1,Math.hypot(dx,dy));
  if(e.phase==="outer"){
   const outerGate=Number.isInteger(e.approachGateIndex)
    ?state.outerGates[e.approachGateIndex]||null
    :getOuterGateForPoint(state,e.x,e.y,{CX,CY});
   const targetR=OUTER_WALL_R+e.radius+4;
   if(outerGate){
    e.outerGateIndex=outerGate.i;e.outerWallIndex=null;
    const baseX=CX+Math.cos(outerGate.angle)*targetR,baseY=CY+Math.sin(outerGate.angle)*targetR;
    if(!outerGate.built||outerGate.hp<=0){
     const d=moveEnemyToward(e,baseX,baseY,dt);if(d<5)e.phase="outside";
    }else{
     const gateDefender=nearestGateDefender(e,outerGate,OUTER_WALL_R);
     if(gateDefender){enemyAttackDefender(e,gateDefender)}else{
      const assault=assaultFormationPoint(e,outerGate.angle,targetR,`og:${outerGate.i}`,6);
      const d=moveEnemyToward(e,assault.x,assault.y,dt);
      if(d<5&&assault.canAttack&&e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;const gateDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.35);
       outerGate.hp=Math.max(0,outerGate.hp-gateDamage*fortificationDamageMultiplier());burst(baseX,baseY,"#775039",6);if(outerGate.hp<=0)showToast(`Das ${outerGate.name} wurde durchbrochen!`)}
     }
    }
   }else{
    const wi=getOuterWallSegmentIndexForAngle(Math.atan2(e.y-CY,e.x-CX),state.outerWalls.length);
    const wall=getOuterWallSegmentStatus(state,wi);
    e.outerWallIndex=wi;e.outerGateIndex=null;
    const wallAngle=Number.isFinite(wall?.am)?wall.am:Math.atan2(e.y-CY,e.x-CX);
    const baseX=CX+Math.cos(wallAngle)*targetR,baseY=CY+Math.sin(wallAngle)*targetR;
    if(!wall||!wall.built||wall.hp<=0){
     const d=moveEnemyToward(e,baseX,baseY,dt);if(d<5)e.phase="outside";
    }else{
     const assault=assaultFormationPoint(e,wallAngle,targetR,`ow:${wi}`,4);
     const d=moveEnemyToward(e,assault.x,assault.y,dt);
     if(d<5&&assault.canAttack&&e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;const wallDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.25);
      wall.hp=Math.max(0,wall.hp-wallDamage*fortificationDamageMultiplier());burst(baseX,baseY,"#8a5d3c",5);if(wall.hp<=0)showToast(`Bresche in äußerer Palisade: ${wall.name||getOuterWallSegmentName(wi,state.outerWalls.length)}!`)}
    }
   }
  }else if(e.phase==="outside"){
   const gate=Number.isInteger(e.approachGateIndex)
    ?state.middleGates[e.approachGateIndex]||null
    :getMiddleGateForPoint(state,e.x,e.y,{CX,CY});
   const targetR=WALL_R+e.radius+4;
   if(gate){
    e.middleGateIndex=gate.i;e.wallIndex=null;
    const baseX=CX+Math.cos(gate.angle)*targetR,baseY=CY+Math.sin(gate.angle)*targetR;
    if(!gate.built||gate.hp<=0){
     const d=moveEnemyToward(e,baseX,baseY,dt);if(d<5)e.phase="inside";
    }else{
     const gateDefender=nearestGateDefender(e,gate,WALL_R);
     if(gateDefender){enemyAttackDefender(e,gateDefender)}else{
      const assault=assaultFormationPoint(e,gate.angle,targetR,`mg:${gate.i}`,6);
      const d=moveEnemyToward(e,assault.x,assault.y,dt);
      if(d<5&&assault.canAttack&&e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;const gateDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.35);
       gate.hp=Math.max(0,gate.hp-gateDamage*fortificationDamageMultiplier());burst(baseX,baseY,"#8c5734",6);if(gate.hp<=0)showToast(`Das ${gate.name} wurde durchbrochen!`)}
     }
    }
   }else{
    const wi=angleIndex(e.x,e.y),wall=state.walls[wi];e.wallIndex=wi;e.middleGateIndex=null;
    const wallAngle=Number.isFinite(wall?.am)?wall.am:Math.atan2(e.y-CY,e.x-CX);
    const baseX=CX+Math.cos(wallAngle)*targetR,baseY=CY+Math.sin(wallAngle)*targetR;
    if(!wall.built||wall.hp<=0){e.phase="inside"}
    else{
     const assault=assaultFormationPoint(e,wallAngle,targetR,`mw:${wi}`,4);
     const d=moveEnemyToward(e,assault.x,assault.y,dt);
     if(d<5&&assault.canAttack&&e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;const wallDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.25);
      wall.hp=Math.max(0,wall.hp-wallDamage*fortificationDamageMultiplier());burst(baseX,baseY,"#9c6a3d",5);if(wall.hp<=0)showToast(`Bresche in mittlerer Palisade: ${wall.name||getMiddleWallSegmentName(wi,state.walls.length)}!`)}
    }
   }
  }else if(e.phase==="inside"){
   const tauntedByHero=handleHeroTaunt(e,dt);
   const tower=towerBehindWall(e.wallIndex);
   const spearDefender=!tauntedByHero&&e.type==="spear"?nearestBlockingUnit(e,112):null;
   const blockingUnit=tauntedByHero?null:nearestBlockingUnit(e,62);
   const raidTarget=!tauntedByHero&&e.type==="raider"?nearestRaidBuilding(e):null;
   const innerWall=getInnerWallSegmentForPoint(state,e.x,e.y,{CX,CY});
   e.innerWallIndex=innerWall?.i??null;
   if(tauntedByHero){
    // Ruf des Helden lenkt nahe Feinde auf Andreas, ohne Mauern zu überspringen.
   }else if(spearDefender){
    e.secondRowAttack=true;enemyAttackDefender(e,spearDefender,.48);
   }else if(blockingUnit){
    enemyAttackDefender(e,blockingUnit);
   }else if(raidTarget){
    attackRaidBuilding(e,raidTarget,dt);
   }else if(tower){
    const tdx=tower.slot.x-e.x,tdy=tower.slot.y-e.y,td=Math.max(1,Math.hypot(tdx,tdy));
    if(td<38+e.radius){
     if(e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;tower.hp-=enemyAttackDamage(e);burst(tower.slot.x,tower.slot.y,"#b67a45",6)}
    }else{const speed=getEffectiveEnemySpeed(e);e.x+=tdx/td*speed*dt;e.y+=tdy/td*speed*dt}
   }else if(!innerWall||innerWall.hp<=0){
    e.phase="core";
   }else{
    const targetR=FIXED_INNER_WALL_RADIUS+e.radius+5;
    const assault=assaultFormationPoint(e,innerWall.am,targetR,`iw:${innerWall.i}`,5);
    const d=moveEnemyToward(e,assault.x,assault.y,dt);
    if(d<5&&assault.canAttack&&e.attackCd<=0){
     e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;
     const wallDamage=enemyAttackDamage(e)*(["shield","berserker","boss"].includes(e.type)?1:.3);
     innerWall.hp=Math.max(0,innerWall.hp-wallDamage*fortificationDamageMultiplier());
     const tx=CX+Math.cos(innerWall.am)*targetR,ty=CY+Math.sin(innerWall.am)*targetR;
     burst(tx,ty,"#9b8b70",5);
     if(innerWall.hp<=0)showToast(`Bresche im inneren Mauerring: ${innerWall.name}!`);
    }
   }
  }else{
   const tauntedByHero=handleHeroTaunt(e,dt);
   const castleTower=nearestCastleTower(e);
   const spearDefender=!tauntedByHero&&e.type==="spear"?nearestBlockingUnit(e,112):null;
   const blockingUnit=tauntedByHero?null:nearestBlockingUnit(e,62);
   const raidTarget=!tauntedByHero&&e.type==="raider"?nearestRaidBuilding(e):null;
   if(tauntedByHero){
    // Andreas bindet nahe Feinde während seiner aktiven Fähigkeit.
   }else if(spearDefender){
    e.secondRowAttack=true;enemyAttackDefender(e,spearDefender,.48);
   }else if(blockingUnit){
    enemyAttackDefender(e,blockingUnit);
   }else if(raidTarget){
    attackRaidBuilding(e,raidTarget,dt);
   }else if(castleTower){
    const cdx=castleTower.slot.x-e.x,cdy=castleTower.slot.y-e.y,cd=Math.max(1,Math.hypot(cdx,cdy));
    if(cd<38+e.radius){
     if(e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;castleTower.hp-=enemyAttackDamage(e);burst(castleTower.slot.x,castleTower.slot.y,"#b67a45",6)}
    }else{const speed=getEffectiveEnemySpeed(e);e.x+=cdx/cd*speed*dt;e.y+=cdy/cd*speed*dt}
   }else{
    // Der Angriffswinkel wird beim ersten Erreichen der Kernzone fixiert.
   // Wuerde er aus der laufend veraenderten Position neu berechnet, wuerde der
   // seitliche Formationsversatz das Angriffsziel staendig mitdrehen und die
   // Gegner koennten die Festung endlos umkreisen, ohne zuzuschlagen.
   if(!Number.isFinite(e.coreAssaultAngle))e.coreAssaultAngle=Math.atan2(e.y-CY,e.x-CX);
   const assault=assaultFormationPoint(e,e.coreAssaultAngle,44,"core",8);
    const d=moveEnemyToward(e,assault.x,assault.y,dt);
    if(d<5&&assault.canAttack&&e.attackCd<=0){e.attackCd=enemyAttackInterval(e);e.attackAnim=.22;state.hp-=enemyAttackDamage(e);burst(CX,CY,e.color,8)}
   }
  }
 }
 resolveEnemySeparation(state.enemies,dt);
 for(const e of state.enemies)if(e.hp<=0&&!e.dead){
  e.dead=true;if(e.type==="boss"){registerBonusEnemyDeath(state,e);applyBossDeathShock(e)}state.gold+=e.reward;state.kills++;
  if(e.lastHitEntity){const baseXp=e.type==="boss"?55:e.type==="shield"?22:e.type==="runner"?13:16;grantCombatXp(e.lastHitEntity,baseXp*Math.max(.15,Number(e.xpScale)||1))}
  burst(e.x,e.y,e.color,8)
 }
 state.enemies=state.enemies.filter(e=>!e.dead);
 let supportBuildingDestroyed=false,lumberBuildingDestroyed=false;
 state.buildings=state.buildings.filter(b=>{
  if(b.hp<=0){
   burst(b.slot.x,b.slot.y,b.base.kind==="tower"?"#8c6543":"#9b5b35",16);
   b.slot.building=null;
   if(b.base.kind!=="tower"){
    releaseBuildingResidents(b,{displaced:state.inWave===true});
    supportBuildingDestroyed=true;if(b.key==="lumber")lumberBuildingDestroyed=true;
    state.craftsmen=state.craftsmen.filter(c=>c.home!==b&&c.homeId!==b.bid);
   }
   if(selected===b)selected=null;
   return false;
  }
  return true;
 });
 if(supportBuildingDestroyed){syncResidents();assignCraftsmen()}
 if(lumberBuildingDestroyed&&!state.buildings.some(b=>b.key==="lumber"&&b.hp>0))showToast("🪵 Holzfäller verloren – Burg-Sammeltrupp liefert Notfallholz bis 70");
 state.units=state.units.filter(u=>{if(u.hp<=0){burst(u.x,u.y,u.key==="hero"?"#ffd76e":"#47739c",u.key==="hero"?24:10);if(u.key==="hero"&&!state.heroFallen){state.heroFallen=true;showToast("Andreas, der große Held, ist im Kampf gefallen")};if(selected===u)selected=null;return false}return true});
 if(state.inWave){
  const objectiveStatusBefore=state.bonusObjective?.status;
  updateBonusObjective(state,dt);
  if(objectiveStatusBefore!=="failed"&&state.bonusObjective?.status==="failed")showToast(`🎯 Bonusziel verfehlt: ${state.bonusObjective.failedReason}`);
 }
 if(state.hp<=0&&!gameOver){state.hp=0;gameOver=true;state.inWave=false;paused=true;showEndScreen()}
 if(state.inWave&&state.toSpawn===0&&state.enemies.length===0){
  state.inWave=false;state.supportTimer=0;paused=false;last=performance.now();
  syncResidents();
  const population=populationState();
  if(population.mode!=="manual")autoDistributeResidents(state,population.mode,{assignCraftsmen});
  else assignCraftsmen();
  const completedWave=state.wave;
  const gold=30+completedWave*5;
  const rp=Math.min(9,2+Math.ceil(completedWave/4)+(completedWave%8===0?2:0));
  state.gold+=gold;state.researchPoints=(state.researchPoints||0)+rp;
  const waveHero=getAndreas();if(waveHero)waveHero.heroAbilityTime=0;
  const completedCommand=warCouncilActiveCommand();
  const bonusResult=resolveBonusObjective(state);
  const autoRepaired=applyAutomaticWaveRepair();
  const bonusApplied=applyBonusObjectiveRewards(bonusResult);
  const bonusText=bonusResult.success
   ?` · 🎯 ${bonusResult.definition.title}: ${bonusApplied.summary}`
   :` · 🎯 ${bonusResult.definition.title} verfehlt`;
  const campaignResult=resolveCampaignWave(state,completedWave);
  recordWorldRunWave(state,completedWave,{bonusSuccess:bonusResult.success,bossWave:Boolean(campaignResult.milestone),heroAlive:Boolean(getAndreas())});
  syncWorldMapFromCurrentState();
  const campaignApplied=applyCampaignMilestoneReward(campaignResult.reward);
  const campaignText=campaignResult.milestone&&campaignApplied.summary?` · ${campaignResult.milestone.icon} ${campaignResult.milestone.title}: ${campaignApplied.summary}`:"";
  state.wave++;
  resetWarCouncilForWave(state,state.wave);
  resetBonusObjectiveForWave(state,state.wave);
  state.repairActive=false;
  state.spawnQueue=[];
  for(const c of state.craftsmen)sendCraftsmanHome(c);
  if(campaignResult.victory){
   state.siege=null;paused=true;last=performance.now();
   showToast(`🏆 Kampagne gewonnen! Der Kriegsherr der Eisenclans ist besiegt.${campaignText}`);
   hideRepairDecision();saveGame(true);showCampaignVictoryScreen(false);updateCampaignHud();
  }else{
   prepareSiegePhase(state,siegeContext());
   const nextWaveType=getWaveTypeInfo(state.wave,state.siege?.waveType);
   showToast(`Welle geschafft: +${gold} Gold · +${rp} Forschung${autoRepaired>0?` · +${Math.round(autoRepaired)} HP automatisch repariert`:completedCommand.key==="stockpile"?" · keine Autoreparatur":""}${bonusText}${campaignText} · ${nextWaveType.icon} ${nextWaveType.label}`);
   hideRepairDecision();saveGame(true);
  }
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
 const readyUnits=state.units.filter(u=>u.hp>0&&((u.pendingUpgrades||0)>0||isVeteranChoiceReady(u)));
 const readyTowers=state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0&&((b.pendingUpgrades||0)>0||isVeteranChoiceReady(b)));
 const signature=[
  ...readyUnits.map(u=>`u:${u.uid}:${u.pendingUpgrades}:${u.expLevel}:${u.specialization||"ready"}`),
  ...readyTowers.map(b=>{const slots=b.slot.type==="castle"?castleSlots:wallSlots;return `t:${b.slot.type}:${slots.indexOf(b.slot)}:${b.key}:${b.pendingUpgrades}:${b.expLevel}:${b.specialization||"ready"}`})
 ].join("|");
 if(signature===lastDockSignature)return;
 lastDockSignature=signature;
 ui.levelDock.innerHTML=[
  ...readyUnits.map(u=>`<button class="levelCard" data-kind="unit" data-id="${u.uid}" title="Einheiten-Aufwertung">
   <span class="spark"></span><span class="portrait">${u.key==="hero"?'<img src="assets/ui/andreas-portrait.webp" alt="">':u.key==="guard"?"🛡️":"🏹"}</span><span class="badge">${isVeteranChoiceReady(u)?"★":u.pendingUpgrades}</span><span class="lvl">${isVeteranChoiceReady(u)?"Pfad bereit":`Stufe ${u.expLevel}`}</span>
  </button>`),
  ...readyTowers.map(b=>{const slots=b.slot.type==="castle"?castleSlots:wallSlots;return `<button class="levelCard" data-kind="tower" data-slot-type="${b.slot.type}" data-slot="${slots.indexOf(b.slot)}" title="${b.base.name}-Aufwertung">
   <span class="spark"></span><span class="portrait">🏰</span><span class="badge">${isVeteranChoiceReady(b)?"★":b.pendingUpgrades}</span><span class="lvl">${isVeteranChoiceReady(b)?"Pfad bereit":`Stufe ${b.expLevel}`}</span>
  </button>`})
 ].join("");
}
function focusUpgradeEntity(card){
 closeStats();hideRepairDecision();let entity=null;
 if(card.dataset.kind==="unit")entity=state.units.find(u=>u.uid===Number(card.dataset.id)&&u.hp>0);
 if(card.dataset.kind==="tower"){
  const slotType=card.dataset.slotType||"castle";
  const slots=slotType==="castle"?castleSlots:wallSlots;
  const slot=slots[Number(card.dataset.slot)];
  entity=state.buildings.find(b=>b.base.kind==="tower"&&b.slot===slot&&b.hp>0);
 }
 if(!entity){
  lastDockSignature="";
  renderLevelUpDock();
  return;
 }
 selected=entity;buildMode=null;unitCommandMode=null;
 updateSelectionHud();
 const name=entity.kind==="unit"?unitDisplayName(entity):entity.base.name;
 if(isVeteranChoiceReady(entity)){openVeteranPanel(entity);showToast(`${name}: Veteranenpfad wählen`)}
 else{selectionTalentBar.classList.remove("hidden");showToast(`${name}: Aufwertung auswählen`)}
}

function speedLabel(v){return v>=58?"Sehr schnell":v>=44?"Schnell":v>=33?"Mittel":v>=25?"Langsam":"Sehr langsam"}
function armorLabel(v){const p=Math.round((v||0)*100);return p?`${p} % Schadensreduktion`:"Keine"}
function renderBestiary(){
 const grid=document.getElementById("bestiaryGrid"),progress=document.getElementById("bestiaryProgress");if(!grid)return;
 const entries=Object.entries(ENEMY_CODEX);if(progress)progress.textContent=`${entries.filter(([k])=>discoveredEnemies.has(k)).length} / ${entries.length} entdeckt`;
 grid.innerHTML=entries.map(([type,d])=>{const unlocked=discoveredEnemies.has(type);if(!unlocked)return `<article class="bestiaryEntry locked"><div class="bestiaryEntryHead"><div class="bestiaryIcon">?</div><div><h4>???</h4><small>Noch nicht entdeckt</small></div></div><div class="bestiaryLockedText">Begegne diesem Gegner im Kampf.</div></article>`;const st=enemyStatsFor(type,d.unlockWave);return `<article class="bestiaryEntry"><div class="bestiaryEntryHead"><div class="bestiaryIcon">${d.icon}</div><div><h4>${d.name}</h4><small>Ab Welle ${d.unlockWave}${d.boss?" · Boss":""}</small></div></div><p>${d.lore}</p><div class="bestiaryMiniStats"><span>❤️ Basis ${Math.round(st.hp)}</span><span>⚔ ${st.damage}</span><span>🛡 ${armorLabel(st.armor)}</span><span>➤ ${speedLabel(st.speed)}</span></div><div class="guideTip"><b>Fähigkeit:</b> ${d.ability||d.strength}</div><div class="guideTip"><b>Konter:</b> ${d.counter||d.weakness}</div></article>`}).join("");
}
function openEnemyInfo(e){
 if(!e||e.dead)return;discoverEnemy(e.type);const overlay=document.getElementById("enemyInfoOverlay");const codex=ENEMY_CODEX[e.type]||{};
 document.getElementById("enemyInfoPortrait").textContent=codex.icon||"⚔";document.getElementById("enemyInfoName").textContent=e.name;document.getElementById("enemyInfoClan").textContent=`${e.clan||"Eisenclans"} · Welle ${state.wave}`;
 const roleTag=document.getElementById("enemyBossTag");roleTag.textContent=codex.role||(codex.boss?"BOSS":"KRIEGER");roleTag.hidden=false;roleTag.classList.toggle("isBoss",!!codex.boss);roleTag.classList.toggle("isElite",codex.role==="ELITE");
 document.getElementById("enemyHpText").textContent=`Leben ${Math.max(0,Math.ceil(e.hp))} / ${Math.ceil(e.maxHp)}`;document.getElementById("enemyHpFill").style.width=`${Math.max(0,Math.min(100,e.hp/e.maxHp*100))}%`;
 const activeAbility=e.type==="berserker"&&enemyIsEnraged(e)?"Raserei aktiv":e.bossAura?"Häuptlingsaura aktiv":e.shieldProtected?"Schilddeckung aktiv":(e.moraleBreakTime||0)>0?"Moral gebrochen":codex.ability||codex.strength||"–";
 document.getElementById("enemyStatsGrid").innerHTML=`<div class="enemyStatTile"><span>Schaden</span><b>⚔ ${Math.round(enemyAttackDamage(e))}</b></div><div class="enemyStatTile"><span>Rüstung</span><b>🛡 ${armorLabel(getEffectiveEnemyArmor(e))}</b></div><div class="enemyStatTile"><span>Geschwindigkeit</span><b>➤ ${speedLabel(getEffectiveEnemySpeed(e))}</b></div><div class="enemyStatTile"><span>Angriffstakt</span><b>⏱ ${enemyAttackInterval(e).toFixed(2)} s</b></div><div class="enemyStatTile"><span>Fähigkeit</span><b>${activeAbility}</b></div><div class="enemyStatTile"><span>Empfohlener Konter</span><b>${codex.weakness||"–"}</b></div>`;
 document.getElementById("enemyInfoLore").innerHTML=`${codex.lore||"Krieger der Eisenclans."}<br><br><b>Konter:</b> ${codex.counter||codex.weakness||"–"}`;overlay.classList.remove("hidden");paused=true;last=performance.now();
}
function closeEnemyInfo(resume=true){const o=document.getElementById("enemyInfoOverlay");if(o)o.classList.add("hidden");if(resume&&!gameOver){paused=false;last=performance.now()}}
function pickAt(x,y){
 let best=null,bd=34;
 for(const u of state.units){const d=Math.hypot(x-u.x,y-u.y);if(d<Math.max(24,bd)){bd=d;best=u}}
 for(const b of state.buildings){const d=Math.hypot(x-b.slot.x,y-b.slot.y);if(d<bd){bd=d;best=b}}
 for(const e of state.enemies){if(e.dead)continue;const d=Math.hypot(x-e.x,y-e.y),visualRadius=e.radius*(Number.isFinite(e.visualScale)?e.visualScale:1);if(d<Math.max(bd,visualRadius+10)){bd=d;best=e}}
 const innerHit=hitTestInnerWallSegment(x,y,{CX,CY,radius:FIXED_INNER_WALL_RADIUS,tolerance:24});
 if(!best&&innerHit){
  const wall=state.innerWalls[innerHit.index];
  if(wall)best=wall;
 }
 const gateHit=hitTestMiddleGate(x,y,{CX,CY,WALL_R,tolerance:34});
 if(!best&&gateHit){
  const gate=state.middleGates[gateHit.gateIndex];
  if(gate?.built)best=gate;
 }
 const middleHit=hitTestMiddleWallSegment(x,y,{CX,CY,WALL_R,segmentCount:state.walls.length,tolerance:30});
 if(!best&&middleHit){
  const wall=getMiddleWallSegmentStatus(state,middleHit.segmentIndex);
  if(wall?.built){best=wall}
 }
 const outerGateHit=hitTestOuterGate(x,y,{CX,CY,radius:OUTER_WALL_R,tolerance:38});
 if(!best&&outerGateHit){
  const gate=state.outerGates[outerGateHit.gateIndex];
  if(gate?.built)best=gate;
 }
 const outerHit=hitTestOuterWallSegment(x,y,{CX,CY,radius:OUTER_WALL_R,segmentCount:state.outerWalls.length,tolerance:28});
 if(!best&&outerHit){
  const wall=getOuterWallSegmentStatus(state,outerHit.segmentIndex);
  if(wall?.built){best=wall}
 }
 return best;
}
function hitTestWallTowerSpot(x,y){
 let best=null,bestDistance=34;
 for(const slot of wallSlots){
  if(slot.towerSpot!==true||slot.building)continue;
  const distance=Math.hypot(x-slot.x,y-slot.y);
  if(distance<bestDistance){bestDistance=distance;best=slot}
 }
 return best?{type:best.type==="outer-wall"?"outer-tower":"middle-tower",slot:best}:null;
}
function showFutureLayoutHint(hit){
 if(!hit)return false;
 const messages={
  "middle-wall":"Mittlere Holzpalisade: im Baumenü auswählen und dieses Segment für 5 Holz errichten.",
  "middle-gate":"Mittleres Holztor: im Baumenü auswählen und diesen Torplatz für 20 Holz schließen.",
  "outer-wall":"Holzpalisade auswählen und dieses Außensegment für 5 Holz errichten.",
  "outer-gate":"Holztor auswählen und diesen äußeren Torplatz für 20 Holz schließen.",
  "middle-tower":hit.slot&&state.walls[hit.slot.i]?.built&&state.walls[hit.slot.i]?.hp>0
   ? "Mittlerer Mauerturmplatz: Wähle einen Turm im Baumenü."
   : "Dieser mittlere Mauerturmplatz benötigt ein intaktes Holz- oder Steinsegment.",
  "outer-tower":hit.slot&&state.outerWalls[hit.slot.i]?.built&&state.outerWalls[hit.slot.i]?.hp>0
   ? "Äußerer Mauerturmplatz: Wähle einen Turm im Baumenü."
   : "Dieser äußere Mauerturmplatz benötigt ein intaktes Holz- oder Steinsegment."
 };
 const text=messages[hit.type];
 if(!text)return false;
 showToast(text);
 return true;
}
function worldTap(x,y){
 if(gameOver)return;
 const futureHit=hitTestWallTowerSpot(x,y)
  ||hitTestMiddleGate(x,y,{CX,CY,WALL_R})
  ||hitTestMiddleWallSegment(x,y,{CX,CY,WALL_R,segmentCount:state.walls.length})
  ||hitTestOuterGate(x,y,{CX,CY,radius:OUTER_WALL_R})
  ||hitTestOuterWallSegment(x,y,{CX,CY,radius:OUTER_WALL_R,segmentCount:state.outerWalls.length});
 if(buildMode){
  const created=createAt(x,y,buildMode);
  if(!created)showFutureLayoutHint(futureHit);
  return;
 }
 if(selected&&selected.kind==="unit"&&unitCommandMode==="move"){
  if(canPlaceMoveTarget(selected,x,y)){
   selected.controlMode="manual";selected.autoTarget=null;selected.targetX=x;selected.targetY=y;selected.moveMarkerUntil=performance.now()+5000;unitCommandMode=null;
   showToast("Bewegungsbefehl gesetzt");return;
  }
  showToast(isMeleeHeroUnit(selected)?"Ziel liegt außerhalb des erlaubten Einsatzbereichs":"Ziel liegt außerhalb des gewählten Bereichs");return;
 }
 const picked=pickAt(x,y);
 if(picked&&picked.kind==="enemy"){openEnemyInfo(picked);selected=null;unitCommandMode=null;return}
 if(picked){selected=picked;unitCommandMode=null;return}
 if(showFutureLayoutHint(futureHit)){selected=null;unitCommandMode=null;return}
 selected=null;unitCommandMode=null;
}

function showPauseMenu(){
 const menu=document.getElementById("pauseMenu"),confirmBox=document.getElementById("pauseRestartConfirm");
 if(!menu)return;
 paused=true;state.supportTimer=0;last=performance.now();
 if(confirmBox)confirmBox.classList.add("hidden");
 menu.style.removeProperty("display");
 menu.style.removeProperty("visibility");
 menu.style.pointerEvents="auto";
 menu.classList.remove("hidden");
 refreshSaveStatus();
 updateUI();
}
function hidePauseMenu(resume=false){
 const menu=document.getElementById("pauseMenu"),confirmBox=document.getElementById("pauseRestartConfirm");
 if(menu){
  menu.classList.add("hidden");
  menu.style.removeProperty("display");
  menu.style.removeProperty("visibility");
  menu.style.pointerEvents="none";
 }
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
 const startBonuses=getActiveStartBonuses(worldMapProfile);
 state.gold=210+startBonuses.gold;state.wood=105+startBonuses.wood;state.stone=startBonuses.stone;state.researchPoints=startBonuses.researchPoints;state.research={fortress_autoRepair:0,guard_hp:0,guard_armor:0,archer_damage:0,archer_range:0,archer_rate:0,craft_repair:0,craft_wood:0,craft_speed:0,stone_building:0};state.hp=state.maxHp=1200;state.wave=1;state.inWave=false;state.toSpawn=0;state.spawnTimer=0;state.spawnQueue=[];state.siege=null;state.kills=0;state.nextEnemyId=0;state.nextResidentId=0;state.population=createPopulationState();state.heroOffering=startBonuses.heroOffering;state.heroSummoned=false;state.heroFallen=false;state.warCouncil=createWarCouncilState(1);state.bonusObjective=null;state.campaign=createCampaignState(1);state.worldRun=createWorldRunStats();
 state.enemies=[];state.projectiles=[];state.buildings=[];state.units=[];state.particles=[];state.craftsmen=[];state.residents=[];state.repairActive=false;state.repairedHp=0;state.supportTimer=0;hideRepairDecision();hideEndScreen();hideCampaignVictoryScreen();hidePauseMenu(false);closeEnemyInfo(false);for(const s of [...wallSlots,...insideSlots,...castleSlots])s.building=null;initializeMiddleWallSegments(state.walls,{built:false});initializeMiddleGates(state.middleGates,{built:false});initializeOuterWallSegments(state.outerWalls,{built:false});initializeOuterGates(state.outerGates,{built:false});initializeInnerWallSegments(state.innerWalls,{fullHealth:true});
 selected=null;buildMode=null;unitCommandMode=null;paused=false;gameOver=false;camX=CX;camY=CY;setZoom(.42);ensureCurrentSiege();syncWorldMapFromCurrentState();showToast("Neue Belagerung beginnt");
}

document.querySelectorAll(".buildBtn").forEach(b=>b.addEventListener("click",e=>{if(e.target.closest(".buildInfoBtn"))return;hideRepairDecision();const k=b.dataset.build;buildMode=buildMode===k?null:k;selected=null;unitCommandMode=null;centerBuildTrayCard(b)}));
document.querySelectorAll(".buildInfoBtn").forEach(info=>{
 const open=e=>{e.preventDefault();e.stopPropagation();buildMode=null;selected=null;unitCommandMode=null;openBuildCombatInfo(info.dataset.buildInfo)};
 info.addEventListener("click",open);info.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")open(e)});
});
document.getElementById("enemyInfoClose").addEventListener("click",()=>closeEnemyInfo(true));
document.getElementById("enemyInfoOverlay").addEventListener("click",e=>{if(e.target.id==="enemyInfoOverlay")closeEnemyInfo(true)});
renderBestiary();refreshSaveStatus();renderCampaignWorldMap();
window.setInterval(()=>saveGame(true),AUTOSAVE_INTERVAL_MS);
let lastBackgroundSaveAt=0;
function saveBeforeBackground(){
 const now=Date.now();
 if(now-lastBackgroundSaveAt<750)return;
 lastBackgroundSaveAt=now;
 if(!state.inWave&&!gameOver)saveGame(true);
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)saveBeforeBackground()});
window.addEventListener("pagehide",saveBeforeBackground);
document.getElementById("marketTradeBtn").addEventListener("click",openMarketPanel);
document.getElementById("statueOfferingBtn").addEventListener("click",openStatueOfferingPanel);
ui.tacticsMenuBtn?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();if(isTacticsMenuOpen())closeTacticsMenu();else openTacticsMenu()});
ui.tacticsMenu?.addEventListener("click",event=>event.stopPropagation());
ui.warCouncilBtn.addEventListener("click",openWarCouncilPanel);
document.getElementById("warCouncilCloseBtn").addEventListener("click",()=>closeWarCouncilPanel(true));
document.getElementById("warCouncilPanel").addEventListener("click",e=>{const command=e.target.closest("[data-war-command]");if(command){e.preventDefault();chooseWarCouncilCommand(command.dataset.warCommand);return}if(e.target.id==="warCouncilPanel")closeWarCouncilPanel(true)});
ui.bonusObjectiveBtn.addEventListener("click",openBonusObjectivePanel);
document.getElementById("bonusObjectiveCloseBtn").addEventListener("click",()=>closeBonusObjectivePanel(true));
document.getElementById("bonusObjectivePanel").addEventListener("click",e=>{if(e.target.id==="bonusObjectivePanel")closeBonusObjectivePanel(true)});
ui.campaignBtn.addEventListener("click",openCampaignPanel);
document.getElementById("campaignPanelCloseBtn").addEventListener("click",()=>closeCampaignPanel(true));
document.getElementById("campaignPanel").addEventListener("click",e=>{if(e.target.id==="campaignPanel")closeCampaignPanel(true)});
document.getElementById("campaignContinueEndlessBtn").addEventListener("click",continueIntoEndlessMode);
document.getElementById("campaignFinishBtn").addEventListener("click",completeCampaignRun);
document.getElementById("campaignNewGameBtn").addEventListener("click",reset);
document.getElementById("veteranCloseBtn").addEventListener("click",()=>closeVeteranPanel(true));
document.getElementById("veteranPanel").addEventListener("click",e=>{const choice=e.target.closest("[data-veteran-choice]");if(choice){e.preventDefault();selectVeteranPath(choice.dataset.veteranChoice);return}if(e.target.id==="veteranPanel")closeVeteranPanel(true)});
document.getElementById("marketCloseBtn").addEventListener("click",closeMarketPanel);
document.getElementById("marketTradeGrid").addEventListener("click",e=>{const b=e.target.closest("[data-trade]");if(b)executeMarketTrade(b.dataset.trade,Number(b.dataset.amount))});

ui.start.onclick=startWave;ui.pause.onclick=()=>{
 if(gameOver)return;
 if(paused){
  if(isPanelVisible("pauseMenu"))hidePauseMenu(true);
  else{paused=false;last=performance.now();showToast("Spiel fortgesetzt");updateUI()}
 }else showPauseMenu();
};ui.upgrade.onclick=upgradeSelected;ui.sell.onclick=sellSelected;ui.repairWall.onclick=repairSelectedWall;ui.craftsmanToggle.onclick=toggleCraftsmanWork;
document.getElementById("repairInfoCloseBtn").onclick=e=>{e.preventDefault();e.stopPropagation();hideRepairDecision();last=performance.now();updateUI()};
document.getElementById("restartGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();reset()};
document.getElementById("resumeGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();hidePauseMenu(true)};
document.getElementById("saveGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();saveGame(false)};
document.getElementById("loadGameBtn").onclick=e=>{e.preventDefault();e.stopPropagation();loadGame()};
document.getElementById("returnCampaignMapBtn").onclick=e=>{e.preventDefault();e.stopPropagation();openCampaignMap(true)};
document.getElementById("deleteSaveBtn").onclick=e=>{e.preventDefault();e.stopPropagation();deleteSave()};
document.getElementById("pauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();document.getElementById("pauseRestartConfirm").classList.remove("hidden")};
document.getElementById("cancelPauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();document.getElementById("pauseRestartConfirm").classList.add("hidden")};
document.getElementById("confirmPauseRestartBtn").onclick=e=>{e.preventDefault();e.stopPropagation();reset()};
attachGameInput({
 canvas,
 startScreen,
 campaignMapScreen,
 instructionsScreen,
 getZoom:()=>zoom,
 setZoom,
 getCamera:()=>({x:camX,y:camY}),
 setCamera:(x,y)=>{camX=x;camY=y},
 centerCamera,
 clampCamera,
 screenToWorld,
 worldTap,
 getBuildMode:()=>buildMode,
 getSelected:()=>selected,
 clearSelectionModes:()=>{buildMode=null;selected=null;unitCommandMode=null},
 cancelAction:cancelActiveAction,
 hasBlockingPanelOpen:isBlockingPanelOpen,
 isPaused:()=>paused,
 setPaused:value=>{paused=value},
 isGameOver:()=>gameOver,
 setLastFrameTime:value=>{last=value},
 showToast,
 startWave,
 showPauseMenu,
 hidePauseMenu,
 resetGame:reset,
 enterGame:()=>openCampaignMap(false),
 returnToTitle,
 handleOrientationChange,
 isPhoneLandscape,
 resizeCanvas:resize
});

ui.levelDock.addEventListener("click",e=>{const card=e.target.closest(".levelCard");if(card)focusUpgradeEntity(card)});

const buildTray=document.getElementById("buildTray");
const buildTrayPrev=document.getElementById("buildTrayPrev");
const buildTrayNext=document.getElementById("buildTrayNext");
const buildTrayEdgeLeft=document.getElementById("buildTrayEdgeLeft");
const buildTrayEdgeRight=document.getElementById("buildTrayEdgeRight");
const navButtons=[...document.querySelectorAll(".navBtn[data-tab]")];
const navResearch=document.getElementById("navResearch"),navResearchBadge=document.getElementById("navResearchBadge");
const navUpgrade=document.getElementById("navUpgrade");
const navStats=document.getElementById("navStats");
const navMenu=document.getElementById("navMenu");
const navMore=document.getElementById("navMore");
const navMoreBadge=document.getElementById("navMoreBadge");
const moreNavMenu=document.getElementById("moreNavMenu");
const statsScreen=document.getElementById("statsScreen");
const statsContent=document.getElementById("statsContent");
const statsTitle=document.getElementById("statsTitle");
const statsCloseBtn=document.getElementById("statsCloseBtn");
const testResourcePanel=document.getElementById("testResourcePanel");
const testResourceCloseBtn=document.getElementById("testResourceCloseBtn");
const selectionMoveBtn=document.getElementById("selectionMoveBtn");
const selectionAutoBtn=document.getElementById("selectionAutoBtn");
const selectionPriorityBtn=document.getElementById("selectionPriorityBtn");
const selectionModeBtn=document.getElementById("selectionModeBtn");
const selectionOffenseBtn=document.getElementById("selectionOffenseBtn");
const selectionHeroAbilityBtn=document.getElementById("selectionHeroAbilityBtn");
const selectionUpgradeBtn=document.getElementById("selectionUpgradeBtn");
const selectionDetailsBtn=document.getElementById("selectionDetailsBtn");
const selectionRangeBtn=document.getElementById("selectionRangeBtn");
const selectionTalentBar=document.getElementById("selectionTalentBar");
const selectionCollapseBtn=document.getElementById("selectionCollapseBtn");
const activeModeBanner=document.getElementById("activeModeBanner");
const activeModeText=document.getElementById("activeModeText");
const activeModeCancelBtn=document.getElementById("activeModeCancelBtn");
const veteranPanel=document.getElementById("veteranPanel");
const veteranEntitySummary=document.getElementById("veteranEntitySummary");
const veteranOptionGrid=document.getElementById("veteranOptionGrid");
const veteranStatus=document.getElementById("veteranStatus");
let veteranPanelEntity=null;
let veteranResumeAfterClose=false;
let selectionHudCollapsed=false;
let rangeDisplayMode=0; // 0=Aus, 1=Auswahl, 2=Alle


function fmt(v,d=0){return Number(v||0).toFixed(d)}
function pctDelta(base,current){if(!base)return "—";const p=(current/base-1)*100;return `${p>=0?"+":""}${p.toFixed(0)}%`}
function statRow(label,base,current,next){return `<div class="statRow"><div class="label">${label}</div><div class="base">${base}</div><div class="current">${current}</div><div class="gain">${next}</div></div>`}
function veteranStatsHtml(entity){
 const selectedPath=getVeteranSpecialization(entity),options=getVeteranOptions(entity);
 if(!options.length)return "";
 if(selectedPath)return `<div class="statsSection veteranStatsSection"><h3>⭐ Veteranenpfad</h3><div class="veteranChosen"><span>${selectedPath.icon}</span><div><b>${selectedPath.name}</b><small>${selectedPath.role}</small><p><strong>Vorteil:</strong> ${selectedPath.benefit}<br><strong>Nachteil:</strong> ${selectedPath.drawback}</p></div></div></div>`;
 if((Number(entity.expLevel)||1)>=VETERAN_UNLOCK_LEVEL)return `<div class="statsSection veteranStatsSection"><h3>⭐ Veteranenpfad bereit</h3><div class="statsHint">Ab EXP-Stufe ${VETERAN_UNLOCK_LEVEL} wird einmalig einer von zwei dauerhaften Wegen gewählt. Die Entscheidung kann nicht rückgängig gemacht werden.</div><div class="buildingActionBar"><button type="button" class="primary wide" data-open-veteran>Veteranenpfad wählen</button></div></div>`;
 return `<div class="statsHint">⭐ Veteranen-Spezialisierung wird auf EXP-Stufe ${VETERAN_UNLOCK_LEVEL} freigeschaltet.</div>`;
}
function unitStatsHtml(u){
 const base=u.base,ups=u.upgradeStats||{},rateNext=Math.max(.24,u.rate*.84);
 const heroBanner=u.key==="hero"?`<div class="heroStatsBanner"><img src="assets/ui/andreas-portrait.webp" alt="Andreas"><div><small>LEGENDÄRER FESTUNGSHELD</small><h3>Andreas, der große Held</h3><p>Elitebonus +35 % · Dauerhafte Sammelruf-Aura +10 % · Aktiver „Ruf des Helden“: 10 Sek. lang +25 % Schaden, +20 % Rüstung und +15 % Tempo. Auf EXP-Stufe 3 erhält Andreas einen eigenen Heldenpfad.</p></div></div>`:"";
 return `${heroBanner}<div class="statsSummary">
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
 ${u.key==="soldier"?`<div class="statsHint">🎯 Zielpriorität: <b>${targetPriorityLabel(u)}</b>. In der Automatik hält der Bogenschütze selbstständig Abstand zu nahen Nahkämpfern; manuelle Positionen bleiben unverändert.</div>`:u.key==="guard"?`<div class="statsHint">🚪 Torwächter: In der Nähe eines intakten Tores erhält die Burgwache +15 % Schaden und +15 Prozentpunkte Rüstung und hält anrückende Feinde auf.</div>`:""}
 ${veteranStatsHtml(u)}
 <div class="statsSection"><h3>Nächste Aufwertung</h3><div class="upgradeGrid">
 <div class="upgradeCard"><b>⚔ Schaden</b><small>${fmt(u.damage)} → ${fmt(u.damage*1.24)}<br>+24% Angriffsschaden</small><div class="level">Bisher: ${ups.damage||0}×</div></div>
 <div class="upgradeCard"><b>♥ Leben</b><small>${fmt(u.maxHp)} → ${fmt(u.maxHp*1.28)}<br>+28% Leben und Heilung</small><div class="level">Bisher: ${ups.health||0}×</div></div>
 <div class="upgradeCard"><b>➤ Tempo</b><small>${fmt(u.speed)} → ${fmt(u.speed*1.16)}<br>+16% Bewegungstempo</small><div class="level">Bisher: ${ups.speed||0}×</div></div>
 <div class="upgradeCard"><b>✦ Feuerrate</b><small>${fmt(1/u.rate,2)} → ${fmt(1/rateNext,2)} Schüsse/Sek.<br>−16% Nachladezeit</small><div class="level">Bisher: ${ups.rate||0}×</div></div>
 <div class="upgradeCard"><b>◎ Reichweite</b><small>${fmt(u.range)} → ${fmt(u.range*1.12)}<br>+12% Angriffsreichweite</small><div class="level">Bisher: ${ups.range||0}×</div></div>
 </div></div>`;
}
function buildingDisplayName(b){
 const woodenName=b.key==="house"?(b.level>=2?"Holzhaus":"Zeltlager"):b.base.name;
 return stoneBuildingDisplayName(b,woodenName);
}
function stoneUpgradeCostText(upgrade){
 const c=upgrade?.cost||{};
 return `${c.gold||0} Gold · ${c.wood||0} Holz · ${c.stone||0} Stein · ${c.research||0} Forschung`;
}
function stoneUpgradeButtonText(upgrade){
 if(!upgrade?.supported)return "Keine Steinaufwertung";
 if(upgrade.upgraded)return "✓ Steingebäude";
 if(!upgrade.levelReady)return `Zuerst Stufe ${upgrade.definition.requiredLevel}`;
 if(!upgrade.waveReady)return "Nach Welle 8 verfügbar";
 if(!upgrade.researchReady)return "Steinbaukunst erforschen";
 return `🏛️ Ausbauen · ${upgrade.cost.stone} Stein / ${upgrade.cost.research} Forschung`;
}
function buildingProductionInfo(b){
 const active=state.inWave&&!paused&&!gameOver;
 if(b.key==="house")return {label:"Goldproduktion",value:`+${(residentCapacityForHouse(b)*.18).toFixed(2)} Gold/Sek.`,state:active?"läuft":"nur in aktiver Welle"};
 if(b.key==="lumber")return {label:"Holzproduktion",value:`+${supportProductionPerSecond(b).toFixed(2)} Holz/Sek.`,state:buildingHasWorker(b)?`${Math.round(buildingWorkforceEfficiency(b)*100)} % · ${active?"läuft":"wartet"}`:"kein Bewohner"};
 if(b.key==="quarry")return {label:"Steinproduktion",value:`+${supportProductionPerSecond(b).toFixed(2)} Stein/Sek.`,state:buildingHasWorker(b)?`${Math.round(buildingWorkforceEfficiency(b)*100)} % · ${active?"läuft":"wartet"}`:"kein Bewohner"};
 if(b.key==="repair")return {label:"Reparaturleistung",value:`+${repairHpPerTick(b).toFixed(1).replace(".",",")} HP/Takt · −${repairWoodPerTick().toFixed(2).replace(".",",")} Holz`,state:!buildingHasWorker(b)?"kein Bewohner":b.repairEnabled===false?"gestoppt":`${Math.round(buildingWorkforceEfficiency(b)*100)} % · ${active?"bereit":"wartet"}`};
 if(b.key==="market")return {label:"Goldproduktion",value:`+${supportProductionPerSecond(b).toFixed(2)} Gold/Sek.`,state:buildingHasWorker(b)?`${Math.round(buildingWorkforceEfficiency(b)*100)} % · ${active?"läuft":"wartet"}`:"kein Bewohner"};
 if(b.key==="workshop"){const mod=Math.round((workshopStaffCostMultiplier()-1)*100);return {label:"Forschung",value:`${workshopLevels()} Stufen`,state:`${buildingWorkerCount(b)}/${workerCapacityForBuilding(b)} Bewohner · ${mod===0?"normale Kosten":mod>0?`+${mod} % Kosten`:`${mod} % Kosten`}`};}
 return {label:"Produktion",value:"—",state:"—"};
}
function buildingStatsHtml(b){
 const base=b.base,isTower=base.kind==="tower",level=b.level||1;
 if(b.key==="statue"){
  const progress=Math.max(0,Math.min(HERO_OFFERING_TARGET,Number(state.heroOffering)||0)),remaining=Math.max(0,HERO_OFFERING_TARGET-progress);
  const heroStatus=state.heroSummoned?(state.heroFallen?"Andreas ist gefallen":"Andreas kämpft für die Festung"):`Noch ${remaining.toLocaleString("de-DE")} Opferpunkte`;
  return `<div class="buildingOverview"><div class="statTile"><span>Bauwerk</span><b>Kriegerstatue</b></div><div class="statTile"><span>Festungsmoral</span><b>+5 % Einheitenschaden</b></div><div class="statTile"><span>Opfergaben</span><b>${progress.toLocaleString("de-DE")} / ${HERO_OFFERING_TARGET.toLocaleString("de-DE")}</b></div><div class="statTile"><span>Heldenstatus</span><b>${heroStatus}</b></div></div><div class="statsHint">Gold, Holz und Stein zählen jeweils 1:1 als Opferpunkte. Bei 2.000 Punkten wird Andreas einmalig beschworen. Seine Sammelruf-Aura stärkt verbündete Einheiten in der Nähe.</div><div class="buildingActionBar"><button type="button" data-building-offering="${b.bid}" class="primary wide">🔥 Opfergaben öffnen</button></div>`;
 }
 if(base.decorative)return `<div class="buildingOverview"><div class="statTile"><span>Bauwerk</span><b>${buildingDisplayName(b)}</b></div><div class="statTile"><span>Funktion</span><b>Noch ohne Aufgabe</b></div><div class="statTile"><span>Standort</span><b>Eigener Ehrenplatz</b></div></div>`;
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
 <div class="statsSection"><h3>Kampfwerte</h3><div class="statRow header"><div>Wert</div><div>Grundwert</div><div>Aktuell</div><div>Änderung</div></div>${rows}</div>
 <div class="statsHint">⚔ ${towerCounterText(b)}</div>${veteranStatsHtml(b)}<div class="statsHint">Türme werden nicht direkt mit Gold oder Holz verbessert. Individuelle Aufwertungen erfolgen über Kampf-EXP; globale Turmforschung folgt in einem eigenen Schritt.</div>`;
 const prod=buildingProductionInfo(b),workerNeeded=workerCapacityForBuilding(b)>0,workerText=workerNeeded?`${buildingWorkerCount(b)} / ${workerCapacityForBuilding(b)} zugewiesen · ${Math.round(buildingWorkforceEfficiency(b)*100)} %`:b.key==="house"?`${residentCapacityForHouse(b)} Bewohnerplätze`:"Kein Arbeitsplatz";
 const cost=getBuildingUpgradeCost(b),g=cost.gold,w=cost.wood,maxLevel=cost.maxLevel,canUpgrade=!cost.maxed&&state.gold>=g&&state.wood>=w,preview=buildingUpgradePreview(b);
 const stoneUpgrade=getStoneBuildingUpgrade(b,state);
 const stoneSection=stoneUpgrade.supported?`<div class="statsSection stoneBuildingSection"><h3>🏛️ Steinbau</h3><div class="upgradeCard ${stoneUpgrade.upgraded?"stoneComplete":""}"><b>${stoneUpgrade.upgraded?buildingDisplayName(b):stoneUpgrade.definition.label}</b><small>${stoneUpgrade.definition.description}<br>${stoneUpgrade.upgraded?`Fertiggestellt in Welle ${b.stoneBuiltAtWave||"?"} · Plündererschaden −25 % statt +40 % · Reparatur kostet zusätzlich ${STONE_BUILDING_REPAIR_STONE_PER_TICK.toFixed(1).replace(".",",")} Stein/Takt`:`Voraussetzung: Stufe ${stoneUpgrade.definition.requiredLevel}, Welle 9 und Steinbaukunst.<br>Kosten: ${stoneUpgradeCostText(stoneUpgrade)}${stoneUpgrade.reason?`<br><em>${stoneUpgrade.reason}</em>`:""}`}</small></div></div>`:"";
 return `<div class="buildingOverview">
  <div class="statTile"><span>Gebäude</span><b>${buildingDisplayName(b)}</b></div>
  <div class="statTile"><span>Stufe</span><b>${level} / ${maxLevel}</b></div>
  <div class="statTile"><span>Bewohner</span><b>${workerText}</b></div>
  <div class="statTile"><span>${prod.label}</span><b>${prod.value}</b><small class="${prod.state.includes("läuft")?"productionLive":"productionStopped"}">${prod.state}</small></div>
 </div>
 <div class="statsSection"><h3>Gebäudewerte</h3><div class="statRow header"><div>Wert</div><div>Grundwert</div><div>Aktuell</div><div>Änderung</div></div>${rows}</div>
 ${b.key==="market"?`<div class="statsHint">Handelsverlust: ${marketLossPercent(b)} %. Höhere Marktplatzstufen verbessern Produktion und Tauschrate.</div>`:""}
 ${b.key==="workshop"?`<div class="statsHint">Öffne die Forschung über die Werkstatt. Verfügbar: 🔬 ${Math.floor(state.researchPoints||0)} · Erforschte Stufen: ${workshopLevels()}</div>`:""}
 ${preview?`<div class="statsSection"><h3>${preview.maxed?"Gebäude vollständig ausgebaut":`Nächste Stufe ${level+1}`}</h3><div class="upgradeCard"><b>${preview.label}</b><small>${preview.summary}</small></div></div>`:""}
 ${stoneSection}
 <div class="buildingActionBar">
  ${workerNeeded?`<button type="button" data-building-worker="${b.bid}" class="primary">👥 Arbeitsverteilung öffnen</button>`:""}
  ${b.key==="repair"&&buildingHasWorker(b)?`<button type="button" data-building-repair="${b.bid}">${b.repairEnabled===false?"Arbeit starten":"Arbeit stoppen"}</button>`:""}
  ${b.key==="market"?`<button type="button" data-building-market="${b.bid}">Handel öffnen</button>`:""}
  <button type="button" data-building-upgrade="${b.bid}" class="primary wide" ${canUpgrade?"":"disabled"}>${b.level>=maxLevel?"Maximalstufe erreicht":`Aufwerten · ${g} Gold / ${w} Holz`}</button>
  ${stoneUpgrade.supported&&!stoneUpgrade.upgraded?`<button type="button" data-building-stone-upgrade="${b.bid}" class="stoneUpgradeButton wide" ${stoneUpgrade.canUpgrade?"":"disabled"}>${stoneUpgradeButtonText(stoneUpgrade)}</button>`:stoneUpgrade.upgraded?`<button type="button" class="stoneUpgradeButton wide" disabled>✓ ${buildingDisplayName(b)}</button>`:""}
 </div>`;
}
function wallStatsHtml(w){
 const percent=w.maxHp?Math.ceil(w.hp/w.maxHp*100):0;
 const fallback=w.kind==="gate"?"Tor":w.ring==="outer"?"Äußere Palisade":w.ring==="inner"?"Innerer Mauerring":"Mittlere Palisade";
 const upgrade=getMiddleFortificationUpgrade(w);
 const material=upgrade.eligible?(upgrade.upgraded?"Stein":"Holz"):(w.ring==="inner"?"Stein":"Holz");
 const hint=w.ring==="inner"
  ?"Der feste innere Mauerring schützt die Holzfestung als letzte Verteidigungslinie. Beschädigte Segmente werden von Handwerkern repariert."
  :upgrade.upgraded
   ?"Diese Befestigung wurde mit Stein verstärkt. Wird sie vollständig zerstört, erfolgt ein späterer Wiederaufbau zunächst wieder aus Holz."
   :`Während der Belagerungsphase kann diese Befestigung für ${upgrade.cost} Stein ausgebaut werden. Der aktuelle Schadensanteil bleibt dabei erhalten.`;
 return `<div class="statsSummary"><div class="statTile"><span>${w.kind==="gate"?"Tor":"Segment"}</span><b>${w.name||fallback}</b></div><div class="statTile"><span>Material</span><b>${material}</b></div><div class="statTile"><span>Zustand</span><b>${percent}%</b></div><div class="statTile"><span>Leben</span><b>${Math.ceil(w.hp)} / ${Math.ceil(w.maxHp)}</b></div></div><div class="statsHint">${hint}</div>`;
}
function overviewStatsHtml(){
 const units=state.units.filter(u=>u.hp>0),towers=state.buildings.filter(b=>b.base.kind==="tower"&&b.hp>0),open=units.reduce((s,u)=>s+(u.pendingUpgrades||0),0)+towers.reduce((s,b)=>s+(b.pendingUpgrades||0),0);
 const avg=units.length?units.reduce((s,u)=>s+(u.expLevel||1),0)/units.length:0,totalDamage=units.reduce((s,u)=>s+u.damage,0)+towers.reduce((s,b)=>s+b.damage,0);
 return `<div class="statsSummary"><div class="statTile"><span>Einheiten</span><b>${units.length}</b></div><div class="statTile"><span>Türme</span><b>${towers.length}</b></div><div class="statTile"><span>Offene Punkte</span><b>${open}</b></div></div>
 <div class="statsSection"><h3>Festungsübersicht</h3>
 <div class="rosterItem"><div class="rosterIcon">⚔️</div><div><b>Gesamtschaden pro Salve</b><small>Aktive Einheiten und Türme</small></div><div class="rosterBadge">${Math.round(totalDamage)}</div></div>
 <div class="rosterItem"><div class="rosterIcon">⭐</div><div><b>Durchschnittsstufe</b><small>Lebende Bodeneinheiten</small></div><div class="rosterBadge">${avg.toFixed(1)}</div></div>
 <div class="rosterItem"><div class="rosterIcon">☠️</div><div><b>Besiegte Gegner</b><small>Gesamter Spielstand</small></div><div class="rosterBadge">${state.kills}</div></div>
 <div class="rosterItem"><div class="rosterIcon">🌊</div><div><b>Aktuelle Welle</b><small>${state.inWave?"Angriff läuft":"Belagerungsphase"}</small></div><div class="rosterBadge">${state.wave}</div></div></div>
 <div class="statsSection"><h3>Einheitenübersicht</h3>${units.length?units.map(u=>`<div class="rosterItem ${u.key==="hero"?"heroRosterItem":""}" data-unit-stat="${u.uid}"><div class="rosterIcon">${u.key==="hero"?'<img class="heroMiniPortrait" src="assets/ui/andreas-portrait.webp" alt="">':u.key==="guard"?"🛡️":"🏹"}</div><div><b>${unitDisplayName(u)} Stufe ${u.expLevel||1}</b><small>Schaden ${Math.round(u.damage)} · Leben ${Math.ceil(u.hp)}/${Math.ceil(u.maxHp)} · EXP ${Math.floor(u.xp)}/${u.xpMax}</small></div><div class="rosterBadge">${u.pendingUpgrades||0} P</div></div>`).join(""):'<div class="statsHint">Noch keine Bodeneinheiten gebaut.</div>'}</div>
 <div class="statsSection"><h3>Turmübersicht</h3>${towers.length?towers.map(b=>`<div class="rosterItem"><div class="rosterIcon">🏰</div><div><b>${b.base.name} · EXP-Stufe ${b.expLevel||1}</b><small>Schaden ${Math.round(b.damage)} · Reichweite ${Math.round(b.range)} · EXP ${Math.floor(b.xp||0)}/${b.xpMax||90}</small></div><div class="rosterBadge">${b.pendingUpgrades||0} P</div></div>`).join(""):'<div class="statsHint">Noch keine Verteidigungstürme gebaut.</div>'}</div>`;
}

function totalWoodPerSecond(){
 return state.buildings.filter(b=>b.key==="lumber").reduce((sum,b)=>sum+supportProductionPerSecond(b),0)+getEmergencyWoodPerSecond(state);
}
function totalStonePerSecond(){
 return state.buildings.filter(b=>b.key==="quarry").reduce((sum,b)=>sum+supportProductionPerSecond(b),0);
}
function resourceDetailsHtml(){
 syncResidents();
 const lumberjacks=state.buildings.filter(b=>b.key==="lumber");
 const quarries=state.buildings.filter(b=>b.key==="quarry");
 const houses=state.buildings.filter(b=>b.key==="house");
 const rate=totalWoodPerSecond();
 const stoneRate=totalStonePerSecond();
 const goldRate=totalGoldPerSecond();
 const nextWaveReward=30+state.wave*5;
 const woodRows=lumberjacks.length?lumberjacks.map((b,i)=>{const workers=buildingWorkerCount(b),capacity=workerCapacityForBuilding(b),efficiency=Math.round(buildingWorkforceEfficiency(b)*100);return `
  <div class="rosterItem"><div class="rosterIcon">🪵</div><div><b>Holzfäller ${i+1} · Stufe ${b.level||1}</b>
  <small>${workers?`${workers}/${capacity} Bewohner · ${efficiency} % Leistung · ${supportProductionPerSecond(b).toFixed(2)} Holz pro Sekunde im Kampf`:`0/${capacity} Bewohner · Produktion steht`}</small></div><div class="rosterBadge">${workers?`+${supportProductionPerSecond(b).toFixed(2)}/s`:"0 %"}</div></div>`}).join("")
  :`<div class="statsHint warning">Kein intakter Holzfäller. Der Burg-Sammeltrupp liefert im Kampf +${getEmergencyWoodPerSecond(state).toFixed(2)} Holz/Sek. bis zu einem Vorrat von 70 Holz.</div>`;
 const stoneRows=quarries.length?quarries.map((b,i)=>{const workers=buildingWorkerCount(b),capacity=workerCapacityForBuilding(b),efficiency=Math.round(buildingWorkforceEfficiency(b)*100);return `
  <div class="rosterItem"><div class="rosterIcon">🪨</div><div><b>Steinbruch ${i+1} · Stufe ${b.level||1}</b>
  <small>${workers?`${workers}/${capacity} Bewohner · ${efficiency} % Leistung · ${supportProductionPerSecond(b).toFixed(2)} Stein pro Sekunde im Kampf`:`0/${capacity} Bewohner · Produktion steht`}</small></div><div class="rosterBadge">${workers?`+${supportProductionPerSecond(b).toFixed(2)}/s`:"0 %"}</div></div>`}).join("")
  :`<div class="statsHint">Noch kein Steinbruch gebaut. Stein wird später für Mauern, Tore und schwere Festungsbauten benötigt.</div>`;
 return `<div class="statsSummary">
  <div class="statTile"><span>🪙 Gold</span><b>${Math.floor(state.gold)}</b></div>
  <div class="statTile"><span>🪵 Holz</span><b>${state.wood.toFixed(1)}</b></div>
  <div class="statTile"><span>🪨 Stein</span><b>${state.stone.toFixed(1)}</b></div>
  <div class="statTile researchSummaryTile"><span>🔬 Forschung</span><b>${Math.floor(state.researchPoints||0)}</b></div>
  <div class="statTile"><span>👥 Bewohner</span><b>${assignedResidents()}/${totalResidents()}</b></div>
  <div class="statTile"><span>Gold im Kampf</span><b>+${goldRate.toFixed(2)}/s</b></div>
  <div class="statTile"><span>Holz im Kampf</span><b>+${rate.toFixed(2)}/s</b></div>
  <div class="statTile"><span>Stein im Kampf</span><b>+${stoneRate.toFixed(2)}/s</b></div>
  <button type="button" class="statTile testResourceTile" data-open-test-resources><span>🧪 Testressourcen</span><b>Auswahl öffnen</b><small>Nur zum Testen</small></button>
 </div>
 <div class="statsSection"><h3>🪙 Goldwirtschaft</h3>
  <div class="rosterItem"><div class="rosterIcon">⚔</div><div><b>Besiegte Gegner</b><small>Gegner geben beim Besiegen Gold.</small></div><div class="rosterBadge">${state.kills}</div></div>
  <div class="rosterItem"><div class="rosterIcon">🌊</div><div><b>Nächste Wellenbelohnung</b><small>Nach vollständigem Sieg über die aktuelle Welle.</small></div><div class="rosterBadge">+${nextWaveReward}</div></div>
  <div class="statsHint">Wohnhäuser erzeugen während aktiver Wellen Gold. Der Ertrag richtet sich nach ihrer Einwohnerzahl.</div>
 </div>
 <div class="statsSection"><h3>👥 Bevölkerung</h3>${houses.length?houses.map((h,i)=>`<div class="rosterItem"><div class="rosterIcon">${h.level>=2?"🏠":"⛺"}</div><div><b>${h.level>=2?"Holzhaus":"Zeltlager"} ${i+1}</b><small>${residentCapacityForHouse(h)} Bewohner · +${(residentCapacityForHouse(h)*.18).toFixed(2)} Gold/Sek. im Kampf</small></div><div class="rosterBadge">${residentCapacityForHouse(h)} 👥</div></div>`).join(""):'<div class="statsHint">Noch kein Wohnhaus gebaut.</div>'}</div>
 <div class="statsSection"><h3>🔬 Forschung</h3><div class="rosterItem"><div class="rosterIcon">⚒️</div><div><b>${state.buildings.some(b=>b.key==="workshop")?"Werkstatt betriebsbereit":"Werkstatt fehlt"}</b><small>Forschungspunkte erhältst du nach erfolgreich abgeschlossenen Wellen.</small></div><div class="rosterBadge">${workshopLevels()} Stufen</div></div>${state.buildings.some(b=>b.key==="workshop")?`<button type="button" class="workshopOpenAction" data-open-workshop>Werkstatt & Forschung öffnen</button>`:`<div class="statsHint">Baue eine Werkstatt, um Technologien freizuschalten.</div>`}</div>
 <div class="statsSection"><h3>🪵 Holzversorgung</h3>${woodRows}</div>
 <div class="statsSection"><h3>🪨 Steinversorgung</h3>${stoneRows}</div>
 <div class="statsHint">Holz- und Steinproduktion laufen ausschließlich während einer aktiven, nicht pausierten Kampfwelle. Reparaturen verbrauchen Holz pro Reparatur-Takt. Stein wird in dieser Übergangsversion bereits gesammelt und später für Mauern, Tore und Festungsausbau verwendet.</div>`;
}
function residentJobLabel(r){return r.job==="lumberjack"?"Holzfäller":r.job==="stonecutter"?"Steinmetz":r.job==="craftsman"?"Handwerker":r.job==="researcher"?"Werkstatt":r.job==="merchant"?"Händler":r.job?"Arbeiter":"Frei"}
function workplaceLabel(b){return b.key==="lumber"?"Holzfäller":b.key==="quarry"?"Steinbruch":b.key==="repair"?"Handwerkerhaus":b.key==="market"?"Marktplatz":"Werkstatt"}
function workplaceIcon(b){return b.key==="lumber"?"🪵":b.key==="quarry"?"🪨":b.key==="repair"?"👷":b.key==="market"?"🏪":"⚒️"}
function populationGroupOutput(key,summary){
 if(!summary||!summary.buildings.length)return "Noch nicht gebaut";
 if(key==="lumber")return `+${summary.buildings.reduce((sum,b)=>sum+supportProductionPerSecond(b),0).toFixed(2)} Holz/Sek.`;
 if(key==="quarry")return `+${summary.buildings.reduce((sum,b)=>sum+supportProductionPerSecond(b),0).toFixed(2)} Stein/Sek.`;
 if(key==="repair")return `+${summary.buildings.reduce((sum,b)=>sum+repairHpPerTick(b),0).toFixed(1).replace(".",",")} HP/Takt`;
 if(key==="market")return `+${summary.buildings.reduce((sum,b)=>sum+supportProductionPerSecond(b),0).toFixed(2)} Gold/Sek.`;
 if(key==="workshop"){
  const modifier=Math.round((workshopStaffCostMultiplier()-1)*100);
  return modifier===0?"Normale Forschungskosten":modifier>0?`+${modifier} % Forschungskosten`:`${modifier} % Forschungskosten`;
 }
 return "—";
}
function populationDetailsHtml(){
 syncResidents();
 const population=populationState();
 const locked=state.inWave;
 const total=totalResidents(),assigned=assignedResidents(),free=freeResidents(),displaced=displacedResidents();
 const modes=Object.values(POPULATION_MODES).map(mode=>`<button type="button" class="populationModeBtn ${population.mode===mode.key?"active":""}" data-pop-mode="${mode.key}" ${locked?"disabled":""}><span>${mode.icon}</span><b>${mode.label}</b><small>${mode.description}</small></button>`).join("");
 const groupKeys=["lumber","quarry","repair","workshop","market"];
 const groupRows=groupKeys.map(key=>{
  const summary=workplaceGroupSummary(state,key);
  const hasBuildings=Boolean(summary?.buildings.length);
  const percent=Math.round((summary?.efficiency||0)*100);
  const addDisabled=locked||!hasBuildings||summary.workers>=summary.capacity||free<=population.reserve;
  const removeDisabled=locked||!hasBuildings||summary.workers<=0;
  return `<div class="populationGroup ${!hasBuildings?"unbuilt":""}">
   <div class="populationGroupIcon">${summary?.icon||"🏭"}</div>
   <div class="populationGroupMain"><div class="populationGroupTitle"><b>${summary?.label||key}</b><span>${summary?.workers||0} / ${summary?.capacity||0}</span></div><small>${hasBuildings?`${summary.buildings.length} Gebäude · Leistung ${percent} % · ${populationGroupOutput(key,summary)}`:"Noch kein passendes Gebäude errichtet"}</small><div class="populationEfficiency"><span style="width:${Math.min(100,percent)}%"></span></div></div>
   <div class="populationStepper"><button type="button" data-pop-job="${key}" data-pop-delta="-1" ${removeDisabled?"disabled":""} aria-label="Bewohner abziehen">−</button><button type="button" data-pop-job="${key}" data-pop-delta="1" ${addDisabled?"disabled":""} aria-label="Bewohner zuweisen">+</button></div>
  </div>`;
 }).join("");
 const jobCounts=[
  ["🪵","Holzfäller","lumberjack"],["🪨","Steinmetze","stonecutter"],["👷","Handwerker","craftsman"],["⚒️","Werkstatt","researcher"],["🏪","Händler","merchant"]
 ].map(([icon,label,job])=>`<div class="populationMiniRow"><span>${icon} ${label}</span><b>${state.residents.filter(r=>r.job===job&&r.workplaceId).length}</b></div>`).join("");
 const soldierCount=state.units.filter(u=>u.key==="soldier").length,guardCount=state.units.filter(u=>u.key==="guard").length,heroCount=state.units.filter(u=>u.key==="hero").length;
 return `<div class="populationHero"><div><small>ZENTRALE VERWALTUNG</small><h3>👥 Bevölkerung 2.0</h3><p>Verteile Bewohner gezielt auf Wirtschaft, Reparatur und Forschung. Änderungen sind nur zwischen Angriffswellen möglich.</p></div><div class="populationLock ${locked?"locked":"open"}">${locked?"🔒 Angriff läuft":"✓ Zuteilung offen"}</div></div>
 <div class="statsSummary populationSummary"><div class="statTile"><span>Gesamt</span><b>${total}</b></div><div class="statTile"><span>Beschäftigt</span><b>${assigned}</b></div><div class="statTile"><span>Frei</span><b>${free}</b></div><div class="statTile"><span>Mindestreserve</span><b>${population.reserve}</b></div>${displaced?`<div class="statTile populationDisplaced"><span>Geflohen</span><b>${displaced}</b></div>`:""}</div>
 <div class="statsSection"><h3>⚙️ Verteilungsmodus</h3><div class="populationModes">${modes}</div><div class="populationControlRow"><div><b>Mindestreserve</b><small>Diese Bewohner bleiben für Neubauten und Notfälle frei.</small></div><div class="populationReserve"><button type="button" data-pop-reserve="-1" ${locked||population.reserve<=0?"disabled":""}>−</button><b>${population.reserve}</b><button type="button" data-pop-reserve="1" ${locked||population.reserve>=total?"disabled":""}>+</button></div></div>${population.mode!=="manual"?`<button type="button" class="populationRedistribute" data-pop-redistribute ${locked?"disabled":""}>↻ ${POPULATION_MODES[population.mode].label} neu verteilen</button>`:""}</div>
 <div class="statsSection"><h3>🏭 Arbeitsplätze</h3><div class="populationGroups">${groupRows}</div><div class="statsHint">Leistung je Gebäude: 1 Bewohner = 45 %, 2 = 75 %, 3 = 100 %, 4 = 120 %. Manuelle Änderungen schalten automatisch auf „Manuell“.</div></div>
 <div class="populationColumns"><div class="statsSection"><h3>🧑‍🏭 Zivile Berufe</h3>${jobCounts}</div><div class="statsSection"><h3>⚔️ Militär</h3><div class="populationMiniRow"><span>🏹 Bogenschützen</span><b>${soldierCount}</b></div><div class="populationMiniRow"><span>🛡️ Burgwachen</span><b>${guardCount}</b></div><div class="populationMiniRow"><span>👑 Andreas</span><b>${heroCount}</b></div><div class="statsHint">Militäreinheiten werden getrennt von den Bewohnern geführt und belegen keine Arbeitsplätze.</div></div></div>
 ${displaced?`<div class="statsHint warning">${displaced} Bewohner sind nach der Zerstörung ihres Arbeitsplatzes geflohen. Nach Ende der Welle kehren sie als freie Bewohner zurück.</div>`:""}`;
}
function openMarketPanel(){
 if(!selected||selected.kind!=="building"||selected.key!=="market")return;
 const panel=document.getElementById("marketPanel"),grid=document.getElementById("marketTradeGrid");
 if(!panel||!grid)return;
 if(panel.classList.contains("hidden"))marketResumeAfterClose=!paused&&!gameOver;
 document.getElementById("marketGoldValue").textContent=Math.floor(state.gold);document.getElementById("marketWoodValue").textContent=Math.floor(state.wood);
 document.getElementById("marketRateText").textContent=`Stufe ${selected.level}: ${marketLossPercent(selected)}% Handelsabschlag. Goldproduktion ${supportProductionPerSecond(selected).toFixed(2)}/Sek. im Kampf.`;
 grid.innerHTML=[25,50,100].map(a=>`<button type="button" data-trade="wood-gold" data-amount="${a}">🪵 ${a} → 🪙 ${marketOutput(a,selected)}</button><button type="button" data-trade="gold-wood" data-amount="${a}">🪙 ${a} → 🪵 ${marketOutput(a,selected)}</button>`).join("");
 panel.classList.remove("hidden");panel.style.display="grid";panel.style.visibility="visible";panel.style.pointerEvents="auto";
 paused=true;state.supportTimer=0;last=performance.now();updateUI();
}
function closeMarketPanel(resume=true){
 const panel=document.getElementById("marketPanel");
 if(panel){panel.classList.add("hidden");panel.style.display="none";panel.style.visibility="hidden";panel.style.pointerEvents="none"}
 if(resume&&marketResumeAfterClose&&!gameOver)paused=false;
 marketResumeAfterClose=false;last=performance.now();updateUI();
}
function executeMarketTrade(type,amount){
 if(!selected||selected.key!=="market")return;const out=marketOutput(amount,selected);
 if(type==="wood-gold"){if(state.wood<amount)return showToast("Nicht genug Holz");state.wood-=amount;state.gold+=out;showToast(`${amount} Holz gegen ${out} Gold getauscht`)}
 else{if(state.gold<amount)return showToast("Nicht genug Gold");state.gold-=amount;state.wood+=out;showToast(`${amount} Gold gegen ${out} Holz getauscht`)}
 openMarketPanel();updateUI();
}
function prepareStatsScreen(){hideRepairDecision();statsScreen.classList.remove("hidden");statsScreen.style.display="flex";statsScreen.style.pointerEvents="auto";statsScreen.style.visibility="visible"}
function openPopulationDetails(){prepareStatsScreen();statsTitle.textContent="Bevölkerung & Arbeitsverteilung";statsContent.innerHTML=populationDetailsHtml()}
function refreshPopulationDetails(){statsContent.innerHTML=populationDetailsHtml();updateUI()}
function changePopulationGroup(key,delta){
 const changed=adjustWorkforceGroup(state,key,delta,{assignCraftsmen,showToast});
 if(changed){saveGame(true);refreshPopulationDetails()}
}
function choosePopulationMode(mode){
 if(mode==="manual"){
  if(state.inWave)return showToast("Arbeitsverteilung ist während eines Angriffs gesperrt");
  populationState().mode="manual";showToast("Manuelle Arbeitsverteilung aktiv");saveGame(true);refreshPopulationDetails();return;
 }
 if(autoDistributeResidents(state,mode,{assignCraftsmen,showToast})){saveGame(true);refreshPopulationDetails()}
}
function changePopulationReserve(delta){
 const population=populationState();
 if(setPopulationReserve(state,population.reserve+delta,{assignCraftsmen,showToast,redistribute:true})){saveGame(true);refreshPopulationDetails()}
}
function redistributePopulation(){
 const mode=populationState().mode;
 if(mode==="manual")return showToast("Wähle zuerst einen automatischen Verteilungsmodus");
 if(autoDistributeResidents(state,mode,{assignCraftsmen,showToast})){saveGame(true);refreshPopulationDetails()}
}
function openTestResourcePanel(){
 testResourcePanel.classList.remove("hidden");
}
function closeTestResourcePanel(){
 testResourcePanel.classList.add("hidden");
}
function grantTestResource(type){
 const grants={
  gold:{label:"Gold",icon:"🪙",apply:()=>state.gold+=500},
  wood:{label:"Holz",icon:"🪵",apply:()=>state.wood+=500},
  stone:{label:"Stein",icon:"🪨",apply:()=>state.stone+=500},
  research:{label:"Forschung",icon:"🔬",apply:()=>state.researchPoints=(state.researchPoints||0)+500}
 };
 const grant=grants[type];
 if(!grant)return;
 grant.apply();
 closeTestResourcePanel();
 updateUI();
 statsContent.innerHTML=resourceDetailsHtml();
 saveGame(true);
 showToast(`🧪 Test: +500 ${grant.label}`);
}

function openResourceDetails(){
 prepareStatsScreen();
 statsTitle.textContent="Rohstoffübersicht";
 statsContent.innerHTML=resourceDetailsHtml();
}

function upgradeEntityCost(entity){
 if(!entity)return {gold:0,wood:0,maxed:true,max:1};
 // Einheiten, Türme und Zierbauten werden nicht direkt mit Gold oder Holz verbessert.
 if(entity.kind==="unit"||entity.kind==="building"&&(entity.base?.kind==="tower"||entity.base?.decorative))return {gold:0,wood:0,maxed:true,max:1};
 if(entity.kind==="building"){
  const cost=getBuildingUpgradeCost(entity);
  return {gold:cost.gold,wood:cost.wood,maxed:cost.maxed,max:cost.maxLevel};
 }
 return {gold:0,wood:0,maxed:true,max:1};
}
function upgradeEntityName(entity){return entity.kind==="unit"?unitDisplayName(entity):buildingDisplayName(entity)}
function upgradeEntityIcon(entity){if(entity.kind==="building"&&isStoneBuilding(entity))return "🏛️";if(entity.kind==="unit")return entity.key==="hero"?'<img class="heroMiniPortrait" src="assets/ui/andreas-portrait.webp" alt="">':entity.key==="guard"?"🛡️":"🏹";return {archer:"🏹",crossbow:"🎯",catapult:"🪨",house:entity.level>=2?"🏠":"⛺",lumber:"🪵",quarry:"🪨",statue:"🗿",workshop:"⚒️",repair:"👷",market:"🏪"}[entity.key]||"🏰"}
function upgradeVeteranText(entity){const path=getVeteranSpecialization(entity);return path?` · ${path.icon} ${path.name}`:isVeteranChoiceReady(entity)?" · ⭐ Veteranenpfad bereit":""}
function allResearchTechs(){return getAllResearchTechs()}
function activeGlobalBonuses(){
 const bonuses=[];
 const guardHp=researchLevel("guard_hp")*8,guardArmor=researchLevel("guard_armor")*2.5,archerDamage=researchLevel("archer_damage")*7,archerRange=researchLevel("archer_range")*6,archerRate=researchLevel("archer_rate")*5,towerDamage=researchLevel("tower_damage")*8,towerRate=researchLevel("tower_rate")*5,towerHp=researchLevel("tower_hp")*10,craftRepair=researchLevel("craft_repair")*12,craftWood=researchLevel("craft_wood")*7,craftSpeed=researchLevel("craft_speed")*8;
 if(guardHp)bonuses.push(`🛡 Wachen-Leben +${guardHp}%`);if(guardArmor)bonuses.push(`🛡 Wachen-Rüstung +${guardArmor}%`);if(archerDamage)bonuses.push(`🏹 Schützen-Schaden +${archerDamage}%`);if(archerRange)bonuses.push(`◎ Schützen-Reichweite +${archerRange}%`);if(archerRate)bonuses.push(`✦ Schützen-Tempo +${archerRate}%`);if(towerDamage)bonuses.push(`🎯 Turm-Schaden +${towerDamage}%`);if(towerRate)bonuses.push(`⚙ Turm-Nachladezeit −${towerRate}%`);if(towerHp)bonuses.push(`🧱 Turm-Leben +${towerHp}%`);if(craftRepair)bonuses.push(`🔨 Reparatur +${craftRepair}%`);if(craftWood)bonuses.push(`🪵 Holzbedarf −${craftWood}%`);if(craftSpeed)bonuses.push(`➤ Handwerker-Tempo +${craftSpeed}%`);
 const auto=researchLevel("fortress_autoRepair");if(auto)bonuses.push(`🏰 Wellenreparatur ${[10,15,20,25,30][auto-1]}%`);
 if(researchLevel(STONE_BUILDING_RESEARCH_ID))bonuses.push("🏛️ Steinbaukunst freigeschaltet");
 if(hasActiveKriegerstatue())bonuses.push("🗿 Festungsmoral +5% Einheitenschaden");
 if(getAndreas())bonuses.push("👑 Andreas-Aura +10% Schaden, Rüstung und Tempo");
 return bonuses;
}
function upgradeRecommendation(){
 const workshop=state.buildings.find(b=>b.key==="workshop");
 const statue=state.buildings.find(b=>b.key==="statue");
 if(statue&&!state.heroSummoned)return `Die Kriegerstatue benötigt noch ${Math.max(0,HERO_OFFERING_TARGET-(state.heroOffering||0)).toLocaleString("de-DE")} Opferpunkte, um Andreas zu beschwören.`;
 if(!workshop)return "Baue eine Werkstatt, um globale Technologien und die Forschungskosten-Skalierung freizuschalten.";
 if(workshop.level<5&&workshopLevels()>=3)return `Werkstatt auf Stufe ${workshop.level+1} ausbauen: Der globale Forschungsaufschlag sinkt danach auf ${[30,25,20,15,10][workshop.level]} % je fremder Forschungsstufe.`;
 if(freeResidents()===0)return "Deine Bevölkerung ist vollständig beschäftigt. Baue ein weiteres Zeltlager oder verbessere eines zum Holzhaus.";
 const damaged=totalRepairDamage();if(damaged>250)return `Die Festung hat ${Math.ceil(damaged)} Schadenspunkte. Handwerker- und Reparaturforschung haben aktuell hohe Priorität.`;
 const veteranReady=[...state.units,...state.buildings.filter(b=>b.base.kind==="tower")].filter(isVeteranChoiceReady).length;if(veteranReady)return `${veteranReady} Veteranenpfad${veteranReady===1?" ist":"e sind"} bereit. Die gold markierten Einheiten oder Türme benötigen eine dauerhafte Entscheidung.`;
 const ready=[...state.units,...state.buildings.filter(b=>b.base.kind==="tower")].filter(x=>(x.pendingUpgrades||0)>0).length;if(ready)return `${ready} EXP-Aufwertung${ready===1?" ist":"en sind"} bereit. Wähle die blau markierten Einheiten oder Türme auf dem Spielfeld.`;
 const stoneCandidates=state.buildings.map(b=>getStoneBuildingUpgrade(b,state)).filter(u=>u.supported&&!u.upgraded&&u.levelReady);
 const stoneReady=stoneCandidates.filter(u=>u.canUpgrade).length;if(stoneReady)return `${stoneReady} Steingebäude${stoneReady===1?" kann":" können"} jetzt ausgebaut werden. Stein bleibt dadurch eine Entscheidung zwischen Wirtschaft und Mauern.`;
 if(state.wave>=9&&!researchLevel(STONE_BUILDING_RESEARCH_ID)&&state.buildings.some(b=>b.key==="workshop"))return "Erforsche Steinbaukunst in der Werkstatt, um vollständig entwickelte Versorgungsgebäude dauerhaft zu verstärken.";
 const affordable=state.buildings.filter(e=>{const c=upgradeEntityCost(e);return !c.maxed&&state.gold>=c.gold&&state.wood>=c.wood}).length;if(affordable)return `${affordable} reguläre Gebäudeaufwertung${affordable===1?" ist":"en sind"} mit deinen aktuellen Rohstoffen sofort bezahlbar.`;
 return "Sammle Gold und Holz in der nächsten Welle. Einheiten und Türme entwickeln sich über EXP; priorisiere Versorgungsgebäude nach Engpass.";
}
function upgradeCenterHtml(){
 const workshop=state.buildings.find(b=>b.key==="workshop");
 const upgradable=state.buildings.filter(entity=>{
  const regular=upgradeEntityCost(entity);
  const stone=getStoneBuildingUpgrade(entity,state);
  return !regular.maxed||(stone.supported&&!stone.upgraded&&stone.levelReady);
 });
 const affordable=upgradable.filter(entity=>{
  const regular=upgradeEntityCost(entity);
  if(!regular.maxed&&state.gold>=regular.gold&&state.wood>=regular.wood)return true;
  return getStoneBuildingUpgrade(entity,state).canUpgrade;
 });
 const buildingRows=state.buildings.length?state.buildings.map(b=>{
  const isTower=b.base.kind==="tower";
  if(b.key==="statue"){
   const progress=Math.max(0,Math.min(HERO_OFFERING_TARGET,Number(state.heroOffering)||0));
   return `<div class="upgradeCenterCard"><div class="upgradeCenterIcon">🗿</div><div><b>Kriegerstatue</b><small>Festungsmoral +5 % Schaden · Opfergaben ${progress.toLocaleString("de-DE")} / ${HERO_OFFERING_TARGET.toLocaleString("de-DE")}${state.heroSummoned?" · Andreas wurde beschworen":""}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="building:${b.bid}">Ansehen</button><button type="button" data-building-offering="${b.bid}">🔥 Opfergaben</button></div></div>`;
  }
  if(b.base.decorative)return `<div class="upgradeCenterCard"><div class="upgradeCenterIcon">${upgradeEntityIcon(b)}</div><div><b>${upgradeEntityName(b)}</b><small>Zierbauwerk auf eigenem Ehrenplatz.</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="building:${b.bid}">Ansehen</button><button type="button" disabled>Keine Aufwertung</button></div></div>`;
  if(isTower)return `<div class="upgradeCenterCard"><div class="upgradeCenterIcon">${upgradeEntityIcon(b)}</div><div><b>${upgradeEntityName(b)} · EXP-Stufe ${b.expLevel||1}</b><small>EXP ${Math.floor(b.xp||0)}/${Math.floor(b.xpMax||90)} · Schaden ${Math.round(b.damage)} · Reichweite ${Math.round(b.range)}${b.pendingUpgrades?` · ${b.pendingUpgrades} EXP-Aufwertung bereit`:" · Aufwertung über EXP oder Forschung"}${upgradeVeteranText(b)}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="building:${b.bid}">${isVeteranChoiceReady(b)?"⭐ Pfad wählen":b.pendingUpgrades?"EXP wählen":"Ansehen"}</button><button type="button" disabled>${isVeteranChoiceReady(b)?"⭐ Veteranenpfad":b.pendingUpgrades?"✦ Aufwertung bereit":"✦ EXP / Forschung"}</button></div></div>`;

  const regular=upgradeEntityCost(b);
  const preview=buildingUpgradePreview(b);
  const regularCan=!regular.maxed&&state.gold>=regular.gold&&state.wood>=regular.wood;
  const stone=getStoneBuildingUpgrade(b,state);
  const stoneText=stone.upgraded
   ?`${stone.definition.description} · Plündererschaden deutlich reduziert.`
   :stone.levelReady
    ?`${stone.definition.description} · ${stone.reason||stoneUpgradeCostText(stone)}`
    :preview?.summary||`Zuerst Stufe ${stone.definition?.requiredLevel||regular.max} erreichen.`;
  const action= !regular.maxed
   ?`<button type="button" data-upgrade-buy="building:${b.bid}" ${regularCan?"":"disabled"}>⬆ ${regular.gold} 🪙${regular.wood?` · ${regular.wood} 🪵`:""}</button>`
   :stone.upgraded
    ?`<button type="button" disabled>✓ Steingebäude</button>`
    :stone.supported&&stone.levelReady
     ?`<button type="button" data-upgrade-buy="building:${b.bid}" ${stone.canUpgrade?"":"disabled"}>${stoneUpgradeButtonText(stone)}</button>`
     :`<button type="button" disabled>✓ Holz-Maximum</button>`;
  return `<div class="upgradeCenterCard ${stone.upgraded?"stoneUpgradeCard":""}"><div class="upgradeCenterIcon">${stone.upgraded?"🏛️":upgradeEntityIcon(b)}</div><div><b>${upgradeEntityName(b)} · Stufe ${b.level||1}</b><small>${stoneText}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="building:${b.bid}">Ansehen</button>${action}</div></div>`;
 }).join(""):'<div class="statsHint">Noch keine Gebäude errichtet.</div>';
 const unitRows=state.units.length?state.units.map(u=>`<div class="upgradeCenterCard"><div class="upgradeCenterIcon">${upgradeEntityIcon(u)}</div><div><b>${upgradeEntityName(u)} · Erfahrungsstufe ${u.expLevel||1}</b><small>EXP ${Math.floor(u.xp||0)}/${Math.floor(u.xpMax||65)} · Schaden ${Math.round(u.damage)} · Leben ${Math.round(u.maxHp)}${u.pendingUpgrades?` · ${u.pendingUpgrades} EXP-Aufwertung bereit`:" · Aufwertung nur durch EXP oder Forschung"}${upgradeVeteranText(u)}</small></div><div class="upgradeCenterActions"><button type="button" class="viewOnly" data-upgrade-focus="unit:${u.uid}">${isVeteranChoiceReady(u)?"⭐ Pfad wählen":u.pendingUpgrades?"EXP wählen":"Ansehen"}</button><button type="button" disabled>${isVeteranChoiceReady(u)?"⭐ Veteranenpfad":u.pendingUpgrades?"✦ Aufwertung bereit":"✦ EXP / Forschung"}</button></div></div>`).join(""):'<div class="statsHint">Noch keine mobilen Einheiten ausgebildet.</div>';
 const research=allResearchTechs().map(t=>`<div class="researchCenterItem"><b>${t.icon} ${t.name}</b><small>${t.desc}</small><div class="level">Stufe ${researchLevel(t.id)}/${t.max}${researchLevel(t.id)<t.max?` · nächste Kosten ${researchCost(t)} 🔬`:" · MAX"}</div></div>`).join("");
 const bonuses=activeGlobalBonuses();
 return `<div class="upgradeCenter"><div class="upgradeHero"><h3>🔱 Upgrade-Zentrale</h3><p>Alle regulären Aufwertungen, Steinbauten, Veteranenfortschritte, Forschungen und globalen Verstärkungen dieser Partie an einem Ort.</p><div class="upgradeSummaryGrid"><div class="upgradeSummaryTile"><span>Gebäude aufwertbar</span><b>${upgradable.length}</b></div><div class="upgradeSummaryTile"><span>Sofort bezahlbar</span><b>${affordable.length}</b></div><div class="upgradeSummaryTile"><span>Steingebäude</span><b>${state.buildings.filter(isStoneBuilding).length}</b></div><div class="upgradeSummaryTile"><span>Forschungspunkte</span><b>${Math.floor(state.researchPoints||0)} 🔬</b></div></div></div><div class="statsSection"><h3>⚒️ Werkstatt</h3><div class="upgradeCenterCard"><div class="upgradeCenterIcon">⚒️</div><div><b>${workshop?`${buildingDisplayName(workshop)} Stufe ${workshop.level}/5`:"Noch keine Werkstatt"}</b><small>${workshop?`Jede fremde Forschungsstufe erhöht Kosten aktuell um ${Math.round(globalResearchIncreaseRate()*100)} %. Personal und Steinwerkstatt verändern den Endpreis.`:"Errichte eine Werkstatt, um den Forschungsbaum zu öffnen."}</small></div><div class="upgradeCenterActions">${workshop?'<button type="button" data-open-workshop>🔬 Forschung öffnen</button>':'<button type="button" disabled>Gesperrt</button>'}</div></div></div><div class="statsSection"><h3>🏰 Gebäude & Türme</h3>${buildingRows}</div><div class="statsSection"><h3>⚔️ Einheiten-Upgrades</h3>${unitRows}</div><div class="statsSection"><h3>🔬 Forschungsübersicht</h3><div class="researchCenterGrid">${research}</div></div><div class="statsSection"><h3>📈 Aktive globale Boni</h3><div class="bonusPills">${bonuses.length?bonuses.map(x=>`<span class="bonusPill">${x}</span>`).join(""):'<span class="statsHint">Noch keine globalen Forschungen aktiv.</span>'}</div></div><div class="statsSection"><h3>⭐ Empfehlung</h3><div class="recommendationCard">${upgradeRecommendation()}</div></div></div>`;
}
function findUpgradeEntity(ref){const [kind,idRaw]=String(ref||"").split(":");const id=Number(idRaw);return kind==="building"?state.buildings.find(b=>b.bid===id):kind==="unit"?state.units.find(u=>u.uid===id):null}
function openUpgradeCenter(){prepareStatsScreen();statsTitle.textContent="Upgrade-Zentrale";statsContent.innerHTML=upgradeCenterHtml()}

function openStats(target=selected){
 prepareStatsScreen();
 if(target&&target.kind==="unit"){statsTitle.textContent="Einheitenwerte";statsContent.innerHTML=unitStatsHtml(target)}
 else if(target&&target.kind==="building"){statsTitle.textContent=buildingDisplayName(target);statsContent.innerHTML=buildingStatsHtml(target)}
 else if(target&&(target.kind==="gate"||target.kind==="wall-section"||target.kind==="wall")&&target.maxHp){statsTitle.textContent=target.kind==="gate"?"Torwerte":target.ring==="inner"?"Innerer Mauerring":"Palisadenwerte";statsContent.innerHTML=wallStatsHtml(target)}
 else{statsTitle.textContent="Festungsstatistiken";statsContent.innerHTML=overviewStatsHtml()}
}
function closeStats(){statsScreen.classList.add("hidden");statsScreen.style.pointerEvents="none";statsScreen.style.visibility="hidden";statsScreen.style.display="none";last=performance.now();updateUI()}

const BUILD_TRAY_SCROLL_KEY="fortressCommander.buildTrayScroll.v1";
let activeBuildTab="towers";
let buildTrayScrollPositions={towers:0,units:0,support:0};
let buildTraySaveTimer=0;
try{
 const stored=JSON.parse(localStorage.getItem(BUILD_TRAY_SCROLL_KEY)||"null");
 if(stored&&typeof stored==="object"){
  for(const key of Object.keys(buildTrayScrollPositions)){
   if(Number.isFinite(Number(stored[key])))buildTrayScrollPositions[key]=Math.max(0,Number(stored[key]));
  }
 }
}catch{}
function persistBuildTrayScroll(){
 clearTimeout(buildTraySaveTimer);
 buildTraySaveTimer=setTimeout(()=>{
  try{localStorage.setItem(BUILD_TRAY_SCROLL_KEY,JSON.stringify(buildTrayScrollPositions))}catch{}
 },120);
}
function rememberBuildTrayScroll(){
 if(!buildTray||!activeBuildTab)return;
 buildTrayScrollPositions[activeBuildTab]=Math.max(0,buildTray.scrollLeft||0);
 persistBuildTrayScroll();
}
function updateBuildTrayIndicators(){
 if(!buildTray)return;
 const maxScroll=Math.max(0,buildTray.scrollWidth-buildTray.clientWidth);
 const canLeft=buildTray.scrollLeft>4;
 const canRight=buildTray.scrollLeft<maxScroll-4;
 buildTrayPrev?.classList.toggle("trayControlHidden",!canLeft);
 buildTrayNext?.classList.toggle("trayControlHidden",!canRight);
 buildTrayEdgeLeft?.classList.toggle("visible",canLeft);
 buildTrayEdgeRight?.classList.toggle("visible",canRight);
}
function restoreBuildTrayScroll(tab){
 requestAnimationFrame(()=>{
  const maxScroll=Math.max(0,buildTray.scrollWidth-buildTray.clientWidth);
  buildTray.scrollLeft=Math.min(maxScroll,Math.max(0,buildTrayScrollPositions[tab]||0));
  updateBuildTrayIndicators();
 });
}
function centerBuildTrayCard(card){
 if(!buildTray||!card||card.style.display==="none")return;
 const target=card.offsetLeft-(buildTray.clientWidth-card.offsetWidth)/2;
 buildTray.scrollTo({left:Math.max(0,target),behavior:"smooth"});
}
function clearNavActionState(){
 document.querySelectorAll("#bottomNav .navBtn").forEach(b=>{if(!b.dataset.tab)b.classList.remove("active")});
}
function activateSecondaryNav(button){
 clearNavActionState();navButtons.forEach(b=>b.classList.remove("active"));button?.classList.add("active");
 if(window.matchMedia("(max-width: 700px)").matches)navMore?.classList.add("active");
 closeMoreNav();
}
function setBuildTab(tab){
 rememberBuildTrayScroll();
 closeAllBlockingPanels();clearNavActionState();
 activeBuildTab=tab;
 navButtons.forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 const cards=[...document.querySelectorAll(".buildBtn")];
 cards.forEach(card=>card.style.display=card.dataset.group===tab?"block":"none");
 restoreBuildTrayScroll(tab);
}
navButtons.forEach(btn=>btn.addEventListener("click",()=>setBuildTab(btn.dataset.tab)));
navUpgrade.addEventListener("click",()=>{rememberBuildTrayScroll();activateSecondaryNav(navUpgrade);openUpgradeCenter()});
navStats.addEventListener("click",()=>{rememberBuildTrayScroll();activateSecondaryNav(navStats);openStats()});
navResearch.addEventListener("click",()=>{rememberBuildTrayScroll();activateSecondaryNav(navResearch);openWorkshopPanel()});
navMore?.addEventListener("click",event=>{
 event.preventDefault();event.stopPropagation();
 if(isMoreNavOpen())closeMoreNav();else openMoreNav();
});
moreNavMenu?.addEventListener("click",event=>event.stopPropagation());
document.addEventListener("pointerdown",event=>{
 if(isMoreNavOpen()&&!moreNavMenu.contains(event.target)&&!navMore.contains(event.target))closeMoreNav();
 if(isTacticsMenuOpen()&&!ui.tacticsMenu.contains(event.target)&&!ui.tacticsMenuBtn.contains(event.target))closeTacticsMenu();
});
buildTray?.addEventListener("scroll",()=>{rememberBuildTrayScroll();updateBuildTrayIndicators()},{passive:true});
buildTrayPrev?.addEventListener("click",()=>buildTray.scrollBy({left:-Math.max(170,buildTray.clientWidth*.72),behavior:"smooth"}));
buildTrayNext?.addEventListener("click",()=>buildTray.scrollBy({left:Math.max(170,buildTray.clientWidth*.72),behavior:"smooth"}));
window.addEventListener("resize",()=>requestAnimationFrame(updateBuildTrayIndicators));
statsCloseBtn.addEventListener("click",closeStats);
testResourceCloseBtn.addEventListener("click",closeTestResourcePanel);
testResourcePanel.addEventListener("click",e=>{
 const grant=e.target.closest("[data-test-resource]");
 if(grant){e.preventDefault();grantTestResource(grant.dataset.testResource);return}
 if(e.target===testResourcePanel)closeTestResourcePanel();
});
ui.resourceOverviewBtn.addEventListener("click",openResourceDetails);
ui.populationOverviewBtn.addEventListener("click",openPopulationDetails);
statsContent.addEventListener("click",e=>{
 const openTestResources=e.target.closest("[data-open-test-resources]");
 if(openTestResources){e.preventDefault();e.stopPropagation();openTestResourcePanel();return}
 const buyUpgrade=e.target.closest("[data-upgrade-buy]");
 if(buyUpgrade){e.preventDefault();e.stopPropagation();const entity=findUpgradeEntity(buyUpgrade.dataset.upgradeBuy);if(entity?.kind==="building"){selected=entity;upgradeSelected();updateUI();statsContent.innerHTML=upgradeCenterHtml()}return}
 const focusUpgrade=e.target.closest("[data-upgrade-focus]");
 if(focusUpgrade){e.preventDefault();e.stopPropagation();const entity=findUpgradeEntity(focusUpgrade.dataset.upgradeFocus);if(entity){selected=entity;closeStats();camX=entity.x;camY=entity.y;clampCamera();updateUI();showToast(`${upgradeEntityName(entity)} ausgewählt`)}return}
 const openWorkshop=e.target.closest("[data-open-workshop]");if(openWorkshop){e.preventDefault();e.stopPropagation();closeStats();openWorkshopPanel();return}
 const popMode=e.target.closest("[data-pop-mode]");
 if(popMode){e.preventDefault();e.stopPropagation();choosePopulationMode(popMode.dataset.popMode);return}
 const popReserve=e.target.closest("[data-pop-reserve]");
 if(popReserve){e.preventDefault();e.stopPropagation();changePopulationReserve(Number(popReserve.dataset.popReserve));return}
 const popJob=e.target.closest("[data-pop-job]");
 if(popJob){e.preventDefault();e.stopPropagation();changePopulationGroup(popJob.dataset.popJob,Number(popJob.dataset.popDelta));return}
 const popRedistribute=e.target.closest("[data-pop-redistribute]");
 if(popRedistribute){e.preventDefault();e.stopPropagation();redistributePopulation();return}
 const worker=e.target.closest("[data-building-worker]");
 if(worker){e.preventDefault();e.stopPropagation();openPopulationDetails();return}
 const repair=e.target.closest("[data-building-repair]");
 if(repair){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(repair.dataset.buildingRepair));if(b){selected=b;toggleCraftsmanWork();openStats(b)}return}
 const offering=e.target.closest("[data-building-offering]");
 if(offering){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(offering.dataset.buildingOffering));if(b){selected=b;closeStats();openStatueOfferingPanel()}return}
 const market=e.target.closest("[data-building-market]");
 if(market){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(market.dataset.buildingMarket));if(b){selected=b;closeStats();openMarketPanel()}return}
 const stoneUpgradeButton=e.target.closest("[data-building-stone-upgrade]");
 if(stoneUpgradeButton){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(stoneUpgradeButton.dataset.buildingStoneUpgrade));if(b){selected=b;upgradeSelected();openStats(b);updateUI();saveGame(true)}return}
 const upgrade=e.target.closest("[data-building-upgrade]");
 if(upgrade){e.preventDefault();e.stopPropagation();const b=state.buildings.find(x=>x.bid===Number(upgrade.dataset.buildingUpgrade));if(b){selected=b;upgradeSelected();openStats(b);updateUI()}return}
});
statsScreen.addEventListener("click",e=>{if(e.target===statsScreen)closeStats()});
selectionCollapseBtn?.addEventListener("click",event=>{
 event.preventDefault();event.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 selectionHudCollapsed=!selectionHudCollapsed;
 updateSelectionHud();
});
selectionMoveBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 selected.controlMode="manual";
 selected.retreating=false;
 selected.autoTarget=null;
 unitCommandMode="move";
 selectionTalentBar.classList.add("hidden");
 showToast("Zielposition auf der Karte antippen");
});
selectionAutoBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 if(isMeleeHeroUnit(selected)){
  selected.stance="defend";
  selected.guardZone="middle";
  selected.retreating=false;
  selected.controlMode="auto";
  selected.autoTarget=null;
  unitCommandMode=null;
  showToast(`${unitDisplayName(selected)} hält bis zur mittleren Mauer`);
  return;
 }
 selected.controlMode=selected.controlMode==="auto"?"manual":"auto";
 selected.autoTarget=null;selected.retargetCd=0;unitCommandMode=null;
 selectionTalentBar.classList.add("hidden");
 showToast(selected.controlMode==="auto"?"Automatik aktiviert":"Automatik deaktiviert");
});
selectionPriorityBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit"||selected.key!=="soldier")return;
 const order={nearest:"fast",fast:"strong",strong:"nearest"};
 selected.targetPriority=order[selected.targetPriority||"nearest"];
 selected.controlMode="auto";selected.autoTarget=null;selected.retargetCd=0;unitCommandMode=null;
 showToast(`Zielpriorität: ${targetPriorityLabel(selected)}`);
});
selectionModeBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||selected.kind!=="unit")return;
 if(isMeleeHeroUnit(selected)){
  selected.stance="defend";
  selected.guardZone="outer";
  selected.retreating=false;
  selected.controlMode="auto";
  selected.autoTarget=null;
  unitCommandMode=null;
  showToast(`${unitDisplayName(selected)} hält bis zum äußeren Ring`);
  return;
 }
 cycleUnitZone(selected);
 selectionTalentBar.classList.add("hidden");
});
selectionOffenseBtn.addEventListener("click",e=>{
 e.stopPropagation();
 if(!selected||!isMeleeHeroUnit(selected))return;
 selected.stance="offense";
 selected.retreating=false;
 selected.controlMode="auto";
 selected.autoTarget=null;
 unitCommandMode=null;
 showToast(`Ausfall: ${unitDisplayName(selected)} greift auch außerhalb an`);
});
selectionHeroAbilityBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();activateHeroAbility()});
if(activeModeCancelBtn)activeModeCancelBtn.addEventListener("click",()=>cancelActiveAction("button"));
selectionUpgradeBtn.addEventListener("click",e=>{
 e.preventDefault();e.stopPropagation();closeStats();hideRepairDecision();
 if(!selected)return;
 if(isVeteranChoiceReady(selected)){openVeteranPanel(selected);return}
 if(getMiddleFortificationUpgrade(selected).eligible){
  upgradeSelected();
  return;
 }
 // Normale Gebäudeaufwertung: auf Mobilgeräten direkt über die Auswahlleiste erreichbar.
 if(selected.kind==="building"&&selected.base.kind!=="tower"&&!selected.base.decorative){
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
statsContent.addEventListener("click",e=>{
 const veteran=e.target.closest("[data-open-veteran]");
 if(veteran&&selected){e.preventDefault();e.stopPropagation();closeStats();openVeteranPanel(selected);return}
 const row=e.target.closest("[data-unit-stat]");if(!row)return;const u=state.units.find(x=>x.uid===Number(row.dataset.unitStat));if(u){selected=u;openStats(u)}
});
navMenu.addEventListener("click",()=>{
 rememberBuildTrayScroll();activateSecondaryNav(navMenu);openInstructions();
});
setBuildTab("towers");

function updateActionBanner(){
 const text=currentActionText();
 if(!activeModeBanner)return;
 if(text){activeModeText.textContent=text;activeModeBanner.classList.remove("hidden")}
 else activeModeBanner.classList.add("hidden");
}

function updateSelectionHud(){
 if(!selected){
  ui.selectionHud.classList.remove("show","unitCollapsed");
  selectionTalentBar.classList.add("hidden");
  if(selectionCollapseBtn)selectionCollapseBtn.hidden=true;
  return;
 }
 ui.selectionHud.classList.add("show");
 let icon="🏰",name="Auswahl",details="";
 const isUnit=selected.kind==="unit";
 if(selectionCollapseBtn){
  selectionCollapseBtn.hidden=!isUnit;
  selectionCollapseBtn.setAttribute("aria-expanded",String(!(isUnit&&selectionHudCollapsed)));
  selectionCollapseBtn.setAttribute("aria-label",selectionHudCollapsed?"Einheitenfenster erweitern":"Einheitenfenster minimieren");
  selectionCollapseBtn.textContent=selectionHudCollapsed?"⌃":"⌄";
 }
 ui.selectionHud.classList.toggle("unitCollapsed",isUnit&&selectionHudCollapsed);
 if(isUnit){
  icon=selected.key==="hero"?"👑":selected.key==="guard"?"🛡️":"🏹";name=`${unitDisplayName(selected)} · Stufe ${selected.expLevel||1}`;
  const abilityStatus=selected.key==="hero"?(heroAbilityActive(selected)?` · 📯 Ruf aktiv ${Math.ceil(selected.heroAbilityTime)}s`:(Number(selected.heroAbilityCooldown)||0)>0?` · ⏳ Ruf ${Math.ceil(selected.heroAbilityCooldown)}s`:" · 📯 Ruf bereit"):"";
  const tacticalStatus=selected.key==="soldier"?` · 🎯 ${targetPriorityLabel(selected)}${selected.evadingMelee?" · 🦶 Abstand halten":""}`:selected.key==="guard"&&unitNearIntactGate(selected)?" · 🚪 Torbonus aktiv":"";
  const veteranStatusText=isVeteranChoiceReady(selected)?" · ⭐ Veteranenpfad bereit":getVeteranSpecialization(selected)?` · ${veteranSpecializationLabel(selected)}`:"";
  details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · ${isMeleeHeroUnit(selected)?`🛡️ ${Math.round(effectiveUnitArmor(selected)*100)}% · ${selected.retreating?"Rückzug":unitZoneLabel(selected)} · `:`📍 ${unitZoneLabel(selected)} · `}🔵 ${Math.floor(selected.xp||0)}/${Math.floor(selected.xpMax||65)} EXP${selected.key==="hero"?" · ✨ Sammelruf-Aura":""}${tacticalStatus}${veteranStatusText}${abilityStatus}`;
 }else if(selected.kind==="building"){
  if(selected.key==="statue"){
   const progress=Math.max(0,Math.min(HERO_OFFERING_TARGET,Number(state.heroOffering)||0));
   icon="🗿";name="Kriegerstatue";
   details=`🔥 ${progress.toLocaleString("de-DE")} / ${HERO_OFFERING_TARGET.toLocaleString("de-DE")} Opferpunkte · ${state.heroSummoned?(state.heroFallen?"Andreas gefallen":"Andreas im Kampf"):"+5 % Festungsmoral"}`;
  }else{
   icon=selected.base.kind==="tower"?"🏰":selected.base.decorative?"🗿":isStoneBuilding(selected)?"🏛️":"🏠";
   name=selected.base.decorative
    ?(selected.base.name||selected.key)
    :selected.base.kind==="tower"
     ?`${selected.base.name||selected.key} · EXP-Stufe ${selected.expLevel||1}`
     :`${selected.key==="house"?(selected.level>=2?"Holzhaus":"Zeltlager"):(selected.base.name||selected.key)} · Stufe ${selected.level||1}`;
   details=selected.base.decorative
    ?"Zierbauwerk"
    :selected.base.kind==="tower"
    ?`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · 🔵 ${Math.floor(selected.xp||0)}/${Math.floor(selected.xpMax||90)} EXP${isVeteranChoiceReady(selected)?" · ⭐ Veteranenpfad bereit":getVeteranSpecialization(selected)?` · ${veteranSpecializationLabel(selected)}`:""}`
    :selected.key==="house"?`👥 ${residentCapacityForHouse(selected)} Bewohner · 🪙 +${(residentCapacityForHouse(selected)*.18).toFixed(2)}/Sek.`
    :selected.key==="lumber"?`👥 ${buildingWorkerCount(selected)}/${workerCapacityForBuilding(selected)} · ${Math.round(buildingWorkforceEfficiency(selected)*100)} % · 🪵 ${supportProductionPerSecond(selected).toFixed(2)}/Sek.`
    :selected.key==="quarry"?`👥 ${buildingWorkerCount(selected)}/${workerCapacityForBuilding(selected)} · ${Math.round(buildingWorkforceEfficiency(selected)*100)} % · 🪨 ${supportProductionPerSecond(selected).toFixed(2)}/Sek.`
    :selected.key==="repair"?`👥 ${buildingWorkerCount(selected)}/${workerCapacityForBuilding(selected)} · 👷 ${selected.repairEnabled===false?"gestoppt":`${Math.round(buildingWorkforceEfficiency(selected)*100)} %`}`
    :selected.key==="workshop"?`👥 ${buildingWorkerCount(selected)}/${workerCapacityForBuilding(selected)} · ⚒️ Forschung · 🔬 ${Math.floor(state.researchPoints||0)}`
    :selected.key==="market"?`👥 ${buildingWorkerCount(selected)}/${workerCapacityForBuilding(selected)} · 🪙 ${supportProductionPerSecond(selected).toFixed(2)}/Sek.`
    :"Versorgungsgebäude";
   if(selected.base.kind!=="tower"&&!selected.base.decorative)details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · ${isStoneBuilding(selected)?"🏛️ Steinbau · ":"🪵 Holzbau · "}${details}`;
  }
 }else if(selected.kind==="gate"){
  const stone=selected.material==="stone";
  icon=stone?"🏛️":"🚪";name=`${stone?"Steintor":"Holztor"} · ${selected.name||"Tor"}`;details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · ${selected.hp<=0?"zerstört":selected.ring==="middle"?"mittlerer Ring":"äußerer Ring"}`;
 }else if(selected.kind==="wall-section"||selected.kind==="wall"){
  const inner=selected.ring==="inner",stone=selected.material==="stone";
  icon=stone?"🏛️":"🧱";name=inner?`Innerer Mauerring · ${selected.name||`Segment ${(selected.i||0)+1}`}`:`${stone?"Steinmauer":"Palisade"} ${selected.name||""}`.trim();details=`❤️ ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · ${selected.hp<=0||selected.destroyed?"zerstört":stone?"Stein":"Holz"}`;
 }
 const heroSelected=isUnit&&selected.key==="hero";
 ui.selectionHud.classList.toggle("heroSelection",heroSelected);
 ui.selectionPortrait.classList.toggle("heroPortrait",heroSelected);
 if(heroSelected)ui.selectionPortrait.innerHTML='<img src="assets/ui/andreas-portrait.webp" alt="">';
 else ui.selectionPortrait.textContent=icon;
 ui.selectionText.innerHTML=`<b>${name}</b><span>${details}</span>`;
 selectionMoveBtn.classList.toggle("hidden",!isUnit);
 selectionAutoBtn.classList.toggle("hidden",!isUnit);
 selectionModeBtn.classList.toggle("hidden",!isUnit);
 selectionOffenseBtn.classList.toggle("hidden",!(isUnit&&isMeleeHeroUnit(selected)));
 selectionHeroAbilityBtn.classList.toggle("hidden",!heroSelected);
 if(heroSelected){
  const abilityTime=Math.max(0,Number(selected.heroAbilityTime)||0),cooldown=Math.max(0,Number(selected.heroAbilityCooldown)||0);
  const active=abilityTime>0,ready=state.inWave&&!paused&&!gameOver&&!active&&cooldown<=0;
  selectionHeroAbilityBtn.disabled=!ready;
  selectionHeroAbilityBtn.classList.toggle("abilityActive",active);
  selectionHeroAbilityBtn.classList.toggle("abilityCooldown",!active&&cooldown>0);
  selectionHeroAbilityBtn.querySelector("span").textContent=active?"✨":cooldown>0?"⏳":"📯";
  selectionHeroAbilityBtn.querySelector("small").textContent=active?`Ruf aktiv · ${Math.ceil(abilityTime)}s`:cooldown>0?`Bereit · ${Math.ceil(cooldown)}s`:state.inWave?"Ruf des Helden":"Nur im Angriff";
  selectionHeroAbilityBtn.title=active?"Ruf des Helden ist aktiv":cooldown>0?`Noch ${Math.ceil(cooldown)} Sekunden Abklingzeit`:"Ruf des Helden aktivieren";
 }else{selectionHeroAbilityBtn.classList.remove("abilityActive","abilityCooldown");selectionHeroAbilityBtn.disabled=true}
 const canShowRange=isUnit||(selected.kind==="building"&&selected.base.kind==="tower");
 selectionRangeBtn.classList.toggle("hidden",!canShowRange);
 const isNormalBuilding=selected.kind==="building"&&selected.base.kind!=="tower"&&!selected.base.decorative&&hasBuildingUpgradeEffect(selected);
 const normalBuildingCost=isNormalBuilding?getBuildingUpgradeCost(selected):null;
 const normalBuildingCanUpgrade=isNormalBuilding&&!normalBuildingCost.maxed;
 const stoneBuildingUpgrade=isNormalBuilding?getStoneBuildingUpgrade(selected,state):{supported:false};
 const stoneBuildingCanBeShown=stoneBuildingUpgrade.supported&&!stoneBuildingUpgrade.upgraded&&stoneBuildingUpgrade.levelReady;
 const xpUpgradeReady=(isUnit||(selected.kind==="building"&&selected.base.kind==="tower"))&&(selected.pendingUpgrades||0)>0;
 const veteranChoiceReady=isVeteranChoiceReady(selected);
 const fortificationUpgrade=getMiddleFortificationUpgrade(selected);
 const canOfferStoneUpgrade=fortificationUpgrade.eligible&&!fortificationUpgrade.upgraded&&selected.built&&selected.hp>0;
 selectionUpgradeBtn.classList.toggle("hidden",!(normalBuildingCanUpgrade||stoneBuildingCanBeShown||xpUpgradeReady||veteranChoiceReady||canOfferStoneUpgrade));
 if(veteranChoiceReady){
  selectionUpgradeBtn.querySelector("span").textContent="⭐";
  selectionUpgradeBtn.querySelector("small").textContent="Veteranenpfad";
  selectionUpgradeBtn.disabled=false;
 }else if(canOfferStoneUpgrade){
  selectionUpgradeBtn.querySelector("span").textContent="🪨";
  selectionUpgradeBtn.querySelector("small").textContent=`Zu ${fortificationUpgrade.label} · ${fortificationUpgrade.cost}🪨`;
  selectionUpgradeBtn.disabled=state.inWave||state.stone<fortificationUpgrade.cost;
 }else if(stoneBuildingCanBeShown){
  selectionUpgradeBtn.querySelector("span").textContent="🏛️";
  selectionUpgradeBtn.querySelector("small").textContent=stoneUpgradeButtonText(stoneBuildingUpgrade);
  selectionUpgradeBtn.disabled=!stoneBuildingUpgrade.canUpgrade;
  selectionUpgradeBtn.title=stoneBuildingUpgrade.reason||stoneBuildingUpgrade.definition.description;
 }else if(normalBuildingCanUpgrade){
  const g=normalBuildingCost.gold,w=normalBuildingCost.wood,preview=buildingUpgradePreview(selected);
  selectionUpgradeBtn.querySelector("span").textContent="⬆";
  selectionUpgradeBtn.querySelector("small").textContent=selected.key==="house"?`Zum Holzhaus · ${g}🪙 ${w}🪵`:`${preview?.label||"Aufwerten"} · ${g}🪙 ${w}🪵`;
  selectionUpgradeBtn.disabled=state.gold<g||state.wood<w;
  selectionUpgradeBtn.title="Gebäudestufe erhöhen";
 }else{
  selectionUpgradeBtn.querySelector("span").textContent="✦";
  selectionUpgradeBtn.querySelector("small").textContent="EXP-Aufwertung";
  selectionUpgradeBtn.disabled=false;
 }
 selectionMoveBtn.classList.toggle("moveActive",isUnit&&unitCommandMode==="move");
 selectionMoveBtn.classList.toggle("cancelActive",isUnit&&unitCommandMode==="move");
 const isGuard=isUnit&&isMeleeHeroUnit(selected);
 selectionMoveBtn.querySelector("span").textContent="➜";
 selectionMoveBtn.querySelector("small").textContent="Bewegen";
 if(isGuard){
  const middleActive=selected.stance!=="offense"&&(selected.guardZone||"middle")==="middle";
  const outerActive=selected.stance!=="offense"&&(selected.guardZone||"middle")==="outer";
  const offenseActive=selected.stance==="offense";
  selectionAutoBtn.classList.add("autoCommand");
  selectionModeBtn.classList.add("autoCommand");
  selectionOffenseBtn.classList.add("autoCommand");
  selectionAutoBtn.classList.toggle("active",middleActive);
  selectionModeBtn.classList.toggle("active",outerActive);
  selectionOffenseBtn.classList.toggle("active",offenseActive);
  selectionAutoBtn.querySelector("span").textContent="🏰";
  selectionAutoBtn.querySelector("small").textContent="Burghalten";
  selectionModeBtn.classList.add("modeActive");
  selectionModeBtn.querySelector("span").textContent="🛡️";
  selectionModeBtn.querySelector("small").textContent="Äußerer Ring";
  selectionOffenseBtn.querySelector("span").textContent="⚔️";
  selectionOffenseBtn.querySelector("small").textContent="Ausfall";
 }else{
  selectionAutoBtn.classList.remove("autoCommand");
  selectionModeBtn.classList.remove("autoCommand");
  selectionAutoBtn.classList.toggle("active",isUnit&&selected.controlMode==="auto");
  selectionAutoBtn.querySelector("span").textContent=isUnit&&selected.controlMode==="auto"?"🎯":"🛡️";
  selectionAutoBtn.querySelector("small").textContent=isUnit&&selected.controlMode==="auto"?"Automatik an":"Automatik aus";
  selectionModeBtn.classList.toggle("modeActive",isUnit);
  selectionModeBtn.querySelector("span").textContent=selected.zoneMode==="inner"?"◉":selected.zoneMode==="outer"?"◎":"◌";
  selectionModeBtn.querySelector("small").textContent=unitZoneLabel(selected);
 }
 const showPriority=isUnit&&selected.key==="soldier";
 selectionPriorityBtn.classList.toggle("hidden",!showPriority);
 if(showPriority){
  const value=selected.targetPriority||"nearest";
  selectionPriorityBtn.querySelector("span").textContent=value==="fast"?"⚡":value==="strong"?"💪":"🎯";
  selectionPriorityBtn.querySelector("small").textContent=targetPriorityLabel(selected);
  selectionPriorityBtn.classList.add("active");
 }
 const rangeLabels=["Aus","Auswahl","Alle"],rangeIcons=["◌","◎","◉"];
 selectionRangeBtn.querySelector("span").textContent=rangeIcons[rangeDisplayMode];
 selectionRangeBtn.querySelector("small").textContent=`Reichweite: ${rangeLabels[rangeDisplayMode]}`;
 selectionRangeBtn.classList.toggle("active",rangeDisplayMode>0);
 const updateTalentButton=(btn,t,counts)=>{
  btn.classList.toggle("hidden",!t);
  if(!t)return;
  btn.dataset.talent=t.id;
  btn.querySelector("b").textContent=t.icon;
  btn.querySelector("small").textContent=t.label;
  const count=Math.max(0,Number(counts?.[t.id]||0));
  let badge=btn.querySelector(".talentCount");
  if(!badge){badge=document.createElement("span");badge.className="talentCount";btn.prepend(badge)}
  badge.textContent=`★ ${count}`;
  badge.setAttribute("aria-label",`Bisher ${count} ${count===1?"Aufwertung":"Aufwertungen"}`);
 };
 if(isUnit){
  const labels=[
   {id:"damage",icon:"⚔",label:"+24% Schaden"},
   {id:"health",icon:"♥",label:"+28% Leben"},
   {id:"speed",icon:"➤",label:"+16% Tempo"},
   {id:"rate",icon:"✦",label:"−16% Laden"},
   {id:"range",icon:"◎",label:"+12% Reichweite"}
  ];
  const counts=selected.upgradeStats||{};
  [...selectionTalentBar.querySelectorAll("[data-talent]")].forEach((btn,i)=>updateTalentButton(btn,labels[i],counts));
 }else if(selected.kind==="building"&&selected.base.kind==="tower"){
  const labels=[
   {id:"damage",icon:"⚔",label:"+20% Schaden"},
   {id:"range",icon:"◎",label:"+10% Reichweite"},
   {id:"rate",icon:"✦",label:"−12% Laden"},
   {id:"health",icon:"♥",label:"+22% Leben"}
  ];
  const counts=selected.expUpgradeStats||{};
  [...selectionTalentBar.querySelectorAll("[data-talent]")].forEach((btn,i)=>updateTalentButton(btn,labels[i],counts));
 }else selectionTalentBar.classList.add("hidden");
}



let gameFrameTimer=null;
let gameFrameRequest=null;
function cancelScheduledGameFrame(){
 if(gameFrameTimer!==null){clearTimeout(gameFrameTimer);gameFrameTimer=null}
 if(gameFrameRequest!==null){cancelAnimationFrame(gameFrameRequest);gameFrameRequest=null}
}
function scheduleGameFrame(delay=0){
 if(gameFrameTimer!==null||gameFrameRequest!==null)return;
 if(delay>0){
  gameFrameTimer=window.setTimeout(()=>{gameFrameTimer=null;loop(performance.now())},delay);
 }else{
  gameFrameRequest=requestAnimationFrame(now=>{gameFrameRequest=null;loop(now)});
 }
}
function nextFrameDelay(){
 if(document.hidden)return 1000;
 if(paused||isBlockingPanelOpen())return 125;
 return 0;
}
function loop(now){
 if(document.hidden){last=now;scheduleGameFrame(nextFrameDelay());return}
 const dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;
 try{update(dt);draw();renderLevelUpDock();updateSelectionHud();updateActionBanner();updateUI()}
 catch(err){console.error("Spielschleife abgefangen:",err);closeAllBlockingPanels();canvas.style.pointerEvents="auto";showToast("Darstellungsfehler abgefangen – Spiel läuft weiter")}
 scheduleGameFrame(nextFrameDelay());
}
document.addEventListener("visibilitychange",()=>{
 cancelScheduledGameFrame();
 last=performance.now();
 scheduleGameFrame(document.hidden?1000:0);
});
try{
 initMap();
 ensureCurrentSiege();
 handleOrientationChange();
 if(!isPhoneLandscape())resize();
 setZoom(.48);
 draw();
 updateUI();
}catch(err){
 console.error("Start-Hotfix:",err);
 try{initMap();ensureCurrentSiege();resize();draw();updateUI()}catch(_){}
}
scheduleGameFrame();
})();

