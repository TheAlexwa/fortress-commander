import { getMiddleFortificationUpgrade } from "./fortifications.js";
import { getWaveTypeInfo } from "./game.js";
import { getSiegeCampPreview } from "./siege.js";

/**
 * Benutzeroberfläche von Fortress Commander.
 *
 * Dieses Modul rendert das zentrale HUD und das Auswahlfenster.
 * Der Spielzustand und spielabhängige Hilfsfunktionen werden von main.js
 * übergeben, damit ui.js keinen eigenen globalen Zustand benötigt.
 */

export function renderGameUI({
  state,
  ui,
  BUILD,
  WALL_SEGMENTS,
  MIDDLE_WALL_SEGMENT_COUNT,
  MIDDLE_GATE_COUNT,
  OUTER_WALL_SEGMENT_COUNT,
  OUTER_GATE_COUNT,
  builtMiddleWallSegments,
  builtMiddleGates,
  builtOuterWallSegments,
  builtOuterGates,
  selected,
  buildMode,
  paused,
  gameOver,
  navResearch,
  navResearchBadge,
  closeAllBlockingPanels,
  totalGoldPerSecond,
  totalWoodPerSecond,
  totalStonePerSecond,
  syncResidents,
  assignedResidents,
  totalResidents,
  freeResidents,
  waveCount,
  buildRequirement,
  residentCapacityForHouse,
  buildingHasWorker,
  supportProductionPerSecond,
  repairHpPerTick,
  workshopLevels,
  globalResearchIncreaseRate,
  marketLossPercent,
  buildingUpgradePreview,
  getBuildingUpgradeCost,
  getBuildingMaxLevel,
  hasBuildingUpgradeEffect,
  HERO_OFFERING_TARGET = 2000
}) {
  closeAllBlockingPanels();

  ui.gold.textContent = Math.floor(state.gold);
  ui.wood.textContent = Math.floor(state.wood);
  if (ui.stone) ui.stone.textContent = Math.floor(state.stone || 0);

  const hasWorkshop = state.buildings.some((building) => building.key === "workshop");
  if (navResearch) {
    navResearch.disabled = !hasWorkshop;
    navResearch.title = hasWorkshop
      ? "Werkstatt öffnen"
      : "Zuerst eine Werkstatt bauen";
  }
  if (navResearchBadge) {
    navResearchBadge.textContent = Math.floor(state.researchPoints || 0);
  }

  ui.goldRate.textContent = `+${totalGoldPerSecond().toFixed(2)}/Sek.`;
  ui.woodRate.textContent = `+${totalWoodPerSecond().toFixed(2)}/Sek.`;
  if (ui.stoneRate) ui.stoneRate.textContent = `+${totalStonePerSecond().toFixed(2)}/Sek.`;

  syncResidents();
  const busyResidents = assignedResidents();
  const residentTotal = totalResidents();
  const availableResidents = freeResidents();
  ui.populationBusy.textContent = busyResidents;
  ui.populationTotal.textContent = residentTotal;
  ui.populationFree.textContent = availableResidents > 0 ? "•" : "";
  ui.populationOverviewBtn.classList.toggle("hasFreeResidents", availableResidents > 0);
  ui.populationOverviewBtn.title = `${busyResidents} beschäftigt · ${availableResidents} frei · ${residentTotal} gesamt`;
  ui.populationOverviewBtn.setAttribute("aria-label", `Bewohnerübersicht öffnen: ${busyResidents} beschäftigt, ${availableResidents} frei, ${residentTotal} gesamt`);

  ui.wave.textContent = state.wave;
  const builtWallSegments = typeof builtMiddleWallSegments === "function"
    ? builtMiddleWallSegments()
    : 0;
  const builtGates = typeof builtMiddleGates === "function"
    ? builtMiddleGates()
    : 0;
  const builtOuterSegments = typeof builtOuterWallSegments === "function"
    ? builtOuterWallSegments()
    : 0;
  const builtOuterGateCount = typeof builtOuterGates === "function"
    ? builtOuterGates()
    : 0;
  const siege = state.siege;
  const siegeReady = !state.inWave && siege?.active ? Math.max(0, Number(siege.arrived) || 0) : 0;
  const siegeTotal = !state.inWave && siege?.active ? Math.max(0, Number(siege.total) || 0) : waveCount(state.wave);
  const siegeNotice = document.getElementById("siegePhaseNotice");
  const siegeNoticeTitle = document.getElementById("siegePhaseTitle");
  const siegeNoticeText = document.getElementById("siegePhaseText");
  const waveType = getWaveTypeInfo(state.wave, siege?.waveType);
  const counterRecommendation = {
    scoutRaid: "Empfohlen: Bogentürme und Bogenschützen mit Priorität ‚Schnelle Gegner‘.",
    shieldWall: "Empfohlen: Armbrusttürme und Katapulte gegen schwere Rüstung.",
    berserkerStorm: "Empfohlen: Armbrusttürme, Torwachen und Andreas an der Schwerpunktfront.",
    fourFront: "Empfohlen: gemischte Turmverteidigung an allen vier Toren.",
    bossAssault: "Empfohlen: Armbrusttürme, Katapult-Rüstungsbruch und Andreas gegen die Eskorte.",
    standard: "Empfohlen: ausgewogene Mischung aus Bogen-, Armbrust- und Katapulttürmen."
  }[waveType.key] || "";

  ui.start.disabled = state.inWave || gameOver;
  ui.start.textContent = state.inWave
    ? "⚔ Läuft"
    : gameOver
      ? "✖ Verloren"
      : "⚔ Angriff";
  ui.start.title = state.inWave
    ? `${waveType.label} läuft`
    : `${waveType.label}: Alle bereits versammelten Gegner greifen gemeinsam an; Nachzügler folgen als Verstärkung.`;
  ui.pause.textContent = paused ? "▶ Weiter" : "Ⅱ Pause";
  ui.status.textContent = gameOver
    ? "✖ Festung gefallen"
    : state.inWave
      ? `⚔ ${state.enemies.length + state.toSpawn} Gegner`
      : `⛺ ${siegeReady}/${siegeTotal} bereit`;

  if (siegeNotice) {
    const showSiegeNotice = !gameOver && !state.inWave && siege?.active;
    siegeNotice.classList.toggle("hidden", !showSiegeNotice);
    if (siegeNoticeTitle && showSiegeNotice) {
      siegeNoticeTitle.textContent = `${waveType.icon} ${waveType.label}`;
    }
    if (siegeNoticeText && showSiegeNotice) {
      const remaining = Math.max(0, siegeTotal - siegeReady);
      const campPreview = getSiegeCampPreview(siege);
      siegeNoticeText.textContent = siegeReady >= siegeTotal
        ? `${waveType.description} ${campPreview} · Alle Gegner bereit. ${counterRecommendation}`
        : `${waveType.description} ${campPreview} · ${remaining} Nachzügler. ${counterRecommendation}`;
    }
  }

  document.querySelectorAll(".buildBtn").forEach((button) => {
    const key = button.dataset.build;
    const config = BUILD[key];
    if (!config) return;

    button.classList.toggle("active", buildMode === key);
    const requirement = buildRequirement(key);
    const fortificationLocked =
      (config.kind === "fortification" || config.kind === "fortification-gate") && state.inWave;
    const fortificationComplete =
      (config.kind === "fortification" &&
        builtWallSegments >= MIDDLE_WALL_SEGMENT_COUNT &&
        builtOuterSegments >= OUTER_WALL_SEGMENT_COUNT) ||
      (config.kind === "fortification-gate" &&
        builtGates >= MIDDLE_GATE_COUNT &&
        builtOuterGateCount >= OUTER_GATE_COUNT);
    button.disabled =
      gameOver ||
      fortificationLocked ||
      fortificationComplete ||
      !requirement.ok ||
      state.gold < config.gold ||
      state.wood < config.wood ||
      state.stone < (config.stone || 0);
    button.classList.toggle("unlocked", requirement.ok);
    button.title = requirement.ok ? "" : requirement.reason;
  });

  ui.upgrade.disabled = true;
  ui.upgrade.style.display = "inline-block";
  ui.upgrade.textContent = "Verbessern";
  ui.sell.disabled = true;
  ui.repairWall.disabled = true;
  ui.repairWall.textContent = "Bewohner";
  ui.craftsmanToggle.style.display = "none";
  ui.marketTrade.style.display = "none";
  if (ui.statueOffering) ui.statueOffering.style.display = "none";

  const workshopResearchButton = document.getElementById("workshopResearchBtn");
  if (workshopResearchButton) workshopResearchButton.style.display = "none";

  if (!selected) {
    ui.selected.textContent = "Nichts ausgewählt";
    return;
  }

  if (selected.kind === "gate") {
    const destroyed = Number(selected.hp) <= 0;
    const ringLabel = selected.ring === "outer" ? "Äußerer Verteidigungsring" : "Mittlerer Verteidigungsring";
    const upgrade = getMiddleFortificationUpgrade(selected);
    const materialLabel = upgrade.upgraded ? "Steintor" : "Holztor";
    ui.selected.innerHTML = `<b>${selected.name}</b><br>Lebenspunkte: ${Math.ceil(selected.hp)} / ${selected.maxHp}<br>Status: ${destroyed ? "zerstört" : "errichtet"}<br>${ringLabel} · ${materialLabel}`;
    if (upgrade.eligible && !upgrade.upgraded && !destroyed && selected.built) {
      ui.upgrade.style.display = "inline-block";
      ui.upgrade.textContent = `Zu Steintor · ${upgrade.cost} 🪨`;
      ui.upgrade.disabled = state.inWave || state.stone < upgrade.cost;
    } else {
      ui.upgrade.style.display = "none";
    }
    return;
  }

  if (selected.kind === "wall-section" || selected.kind === "wall") {
    const inner = selected.ring === "inner";
    const label = selected.name ? ` ${selected.name}` : "";
    const destroyed = selected.destroyed || Number(selected.hp) <= 0;
    const stateLabel = destroyed ? "zerstört" : "errichtet";
    const upgrade = getMiddleFortificationUpgrade(selected);
    const title = inner
      ? (upgrade.upgraded ? "Innere Steinmauer" : "Innere Holzpalisade")
      : selected.ring === "outer"
        ? (upgrade.upgraded ? "Äußere Steinmauer" : "Äußere Holzpalisade")
        : upgrade.upgraded
          ? "Mittlere Steinmauer"
          : "Mittlere Holzpalisade";
    ui.selected.innerHTML = `<b>${title}${label}</b><br>Lebenspunkte: ${Math.ceil(selected.hp)} / ${selected.maxHp}<br>Status: ${stateLabel}`;
    if (upgrade.eligible && !upgrade.upgraded && !destroyed && selected.built) {
      ui.upgrade.style.display = "inline-block";
      ui.upgrade.textContent = `Zu Steinmauer · ${upgrade.cost} 🪨`;
      ui.upgrade.disabled = state.inWave || state.stone < upgrade.cost;
    } else {
      ui.upgrade.style.display = "none";
    }
    return;
  }

  if (selected.kind === "unit") {
    const melee = selected.key === "guard" || selected.key === "hero";
    const unitName = selected.key === "hero"
      ? "Andreas, der große Held"
      : selected.key === "guard" ? "Burgwache" : "Bogenschütze";
    const unitMode = melee
      ? selected.retreating
        ? "Rückzug"
        : selected.stance === "offense"
          ? "Ausfall"
          : selected.guardZone === "outer"
            ? "Äußerer Ring"
            : "Burg halten"
      : selected.controlMode === "auto"
        ? `Automatik · ${selected.zoneMode === "inner" ? "Innenring" : selected.zoneMode === "outer" ? "Außenring" : "Mittelring"}`
        : `Manuell · ${selected.zoneMode === "inner" ? "Innenring" : selected.zoneMode === "outer" ? "Außenring" : "Mittelring"}`;
    const heroInfo = selected.key === "hero"
      ? `<br>👑 Elitegegner: +35 % Schaden · Sammelruf-Aura: +10 % Schaden, Rüstung und Tempo<br>📯 Ruf des Helden: ${(Number(selected.heroAbilityTime) || 0) > 0 ? `aktiv · ${Math.ceil(selected.heroAbilityTime)} Sek.` : (Number(selected.heroAbilityCooldown) || 0) > 0 ? `Abklingzeit · ${Math.ceil(selected.heroAbilityCooldown)} Sek.` : "bereit"}<br>Aktiv: 10 Sek. · +25 % Schaden · +20 % Rüstung · +15 % Tempo · Andreas erhält +30 % Schadensreduktion`
      : "";

    const priorityInfo = selected.key === "soldier"
      ? `<br>🎯 Zielpriorität: ${selected.targetPriority === "fast" ? "Schnelle Gegner" : selected.targetPriority === "strong" ? "Stärkste Gegner" : "Nächste Gegner"}`
      : selected.key === "guard"
        ? `<br>🚪 Torwächter: +15 % Schaden und +15 % Rüstung nahe intaktem Tor`
        : "";
    ui.selected.innerHTML = `<b>${unitName} · Erfahrungsstufe ${selected.expLevel || 1}</b><br>HP ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · EXP ${Math.floor(selected.xp || 0)}/${Math.floor(selected.xpMax || 65)}<br>Schaden ${Math.round(selected.damage)} · Rüstung ${Math.round((selected.armor || 0) * 100)}% · Tempo ${Math.round(selected.speed)}<br>Modus: ${unitMode}${selected.pendingUpgrades ? ` · <b>${selected.pendingUpgrades} Aufwertung bereit</b>` : ""}${priorityInfo}${heroInfo}<br>Aufwertung: EXP-Auswahl oder Werkstatt-Forschung`;
    ui.upgrade.style.display = "none";
    ui.sell.disabled = selected.key === "hero";
    return;
  }

  const building = selected;

  if (building.key === "statue") {
    const progress = Math.max(0, Math.min(HERO_OFFERING_TARGET, Number(state.heroOffering) || 0));
    const remaining = Math.max(0, HERO_OFFERING_TARGET - progress);
    const heroState = state.heroSummoned
      ? state.heroFallen ? "Andreas ist im Kampf gefallen." : "Andreas kämpft für die Festung."
      : `Noch ${remaining.toLocaleString("de-DE")} Opferpunkte bis zur Beschwörung.`;
    ui.selected.innerHTML = `<b>Kriegerstatue</b><br>Festungsmoral: +5 % Einheitenschaden innerhalb der Festung<br>Opfergaben: ${progress.toLocaleString("de-DE")} / ${HERO_OFFERING_TARGET.toLocaleString("de-DE")}<br>${heroState}`;
    ui.upgrade.style.display = "none";
    if (ui.statueOffering) {
      ui.statueOffering.style.display = "inline-block";
      ui.statueOffering.textContent = state.heroSummoned ? "👑 Held gerufen" : "🔥 Opfergabe";
      ui.statueOffering.disabled = false;
    }
    ui.sell.disabled = progress > 0 || state.heroSummoned;
    return;
  }

  if (building.base.kind === "tower") {
    const supportingWall = building.slot?.type === "wall"
      ? state.walls?.[building.slot.i] || null
      : building.slot?.type === "outer-wall"
        ? state.outerWalls?.[building.slot.i] || null
        : null;
    const wallTowerReady = !supportingWall || (
      supportingWall.built &&
      supportingWall.hp > 0
    );
    const placementInfo = supportingWall
      ? `<br>Standort: ${building.slot.type === "outer-wall" ? "äußerer" : "mittlerer"} Mauerturmplatz · ${wallTowerReady ? "einsatzbereit" : "<b>inaktiv – intaktes Mauersegment nötig</b>"}`
      : "<br>Standort: Kernburg";
    const counterInfo = building.key === "archer"
      ? "Stark gegen Plünderer und Clanspäher (+35 %) · schwach gegen Rüstung"
      : building.key === "crossbow"
        ? "Durchdringt 50 % Rüstung · stark gegen Eisenschilde, Berserker und Häuptlinge"
        : "Flächenschaden · 4 Sek. Rüstungsbruch und Verlangsamung";
    ui.selected.innerHTML = `<b>${building.base.name} · EXP-Stufe ${building.expLevel || 1}</b><br>HP ${Math.ceil(building.hp)} / ${Math.ceil(building.maxHp)} · EXP ${Math.floor(building.xp || 0)}/${Math.floor(building.xpMax || 90)}<br>Schaden ${Math.round(building.damage)} · Reichweite ${Math.round(building.range)}${building.pendingUpgrades ? ` · <b>${building.pendingUpgrades} EXP-Aufwertung bereit</b>` : ""}${placementInfo}<br>⚔ ${counterInfo}<br>Aufwertung: nur über EXP und Forschung`;
    ui.upgrade.style.display = "none";
    ui.sell.disabled = false;
    return;
  }

  const upgradeCost = getBuildingUpgradeCost(building);
  const goldCost = upgradeCost.gold;
  const woodCost = upgradeCost.wood;
  const upgradePreview = buildingUpgradePreview(building);
  let supportInfo = "";

  if (building.key === "house") {
    const capacity = residentCapacityForHouse(building);
    supportInfo = `<br>Bewohner: ${capacity} · Gold: +${(capacity * 0.18).toFixed(2)}/Sek. im Kampf`;
  }
  if (building.key === "lumber") {
    supportInfo = `<br>Bewohner: ${buildingHasWorker(building) ? "zugewiesen" : "nicht zugewiesen"} · Produktion: ${supportProductionPerSecond(building).toFixed(2)} Holz/Sek.`;
  }
  if (building.key === "quarry") {
    supportInfo = `<br>Bewohner: ${buildingHasWorker(building) ? "zugewiesen" : "nicht zugewiesen"} · Produktion: ${supportProductionPerSecond(building).toFixed(2)} Stein/Sek.`;
  }
  if (building.key === "repair") {
    supportInfo = `<br>Bewohner: ${buildingHasWorker(building) ? "zugewiesen" : "nicht zugewiesen"} · Reparatur: ${repairHpPerTick(building).toFixed(1).replace(".", ",")} HP je Takt · ${building.repairEnabled === false ? "gestoppt" : "aktiv"}`;
  }
  if (building.key === "workshop") {
    supportInfo = `<br>Forschung: 🔬 ${Math.floor(state.researchPoints || 0)} · Technologiestufen: ${workshopLevels()}<br>Globaler Kostenanstieg je fremder Forschungsstufe: ${Math.round(globalResearchIncreaseRate() * 100)} %`;
    if (workshopResearchButton) workshopResearchButton.style.display = "inline-block";
  }
  if (building.key === "market") {
    supportInfo = `<br>Bewohner: ${buildingHasWorker(building) ? "zugewiesen" : "nicht zugewiesen"} · Gold: +${supportProductionPerSecond(building).toFixed(2)}/Sek. · Handelsverlust: ${marketLossPercent(building)}%`;
  }

  if (["lumber", "quarry", "repair", "market"].includes(building.key)) {
    ui.repairWall.disabled = false;
    ui.repairWall.textContent = buildingHasWorker(building) ? "Abziehen" : "Zuweisen";
  }
  if (building.key === "repair" && buildingHasWorker(building)) {
    ui.craftsmanToggle.style.display = "inline-block";
    ui.craftsmanToggle.textContent = building.repairEnabled === false
      ? "Arbeit starten"
      : "Arbeit stoppen";
  }
  if (building.key === "market") ui.marketTrade.style.display = "inline-block";

  const buildingName = building.key === "house"
    ? building.level >= 2 ? "Holzhaus" : "Zeltlager"
    : building.base.name;

  const upgradeInfo = upgradePreview
    ? upgradePreview.maxed
      ? `<br>${upgradePreview.summary}`
      : `<br>Nächste Stufe: ${upgradePreview.summary}<br>Upgrade: ${goldCost} Gold / ${woodCost} Holz`
    : "<br>Keine wirksame Gebäudeaufwertung verfügbar";
  ui.selected.innerHTML = `<b>${buildingName} Stufe ${building.level}</b>${supportInfo}${upgradeInfo}`;

  const maxLevel = getBuildingMaxLevel(building);
  ui.upgrade.disabled =
    !hasBuildingUpgradeEffect(building) ||
    building.level >= maxLevel ||
    state.gold < goldCost ||
    state.wood < woodCost;
  ui.sell.disabled = false;
}
