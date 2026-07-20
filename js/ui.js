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
  MIDDLE_WALL_SECTION_COUNT,
  builtMiddleWallSections,
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
  marketLossPercent
}) {
  closeAllBlockingPanels();

  ui.gold.textContent = Math.floor(state.gold);
  ui.wood.textContent = Math.floor(state.wood);
  if (ui.stone) ui.stone.textContent = Math.floor(state.stone || 0);

  const rpHud = document.getElementById("researchPoints");
  if (rpHud) rpHud.textContent = Math.floor(state.researchPoints || 0);

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
  ui.populationBusy.textContent = assignedResidents();
  ui.populationTotal.textContent = totalResidents();
  ui.populationFree.textContent = `${freeResidents()} frei`;

  ui.hp.textContent = `${Math.ceil(state.hp)}/${state.maxHp}`;
  ui.wave.textContent = state.wave;
  const builtWallSections = typeof builtMiddleWallSections === "function"
    ? builtMiddleWallSections()
    : 0;
  ui.wallInfo.textContent = `${builtWallSections}/${MIDDLE_WALL_SECTION_COUNT}`;
  ui.wallInfo.title = "Errichtete Abschnitte der mittleren Holzpalisade";

  const siege = state.siege;
  const siegeReady = !state.inWave && siege?.active ? Math.max(0, Number(siege.arrived) || 0) : 0;
  const siegeTotal = !state.inWave && siege?.active ? Math.max(0, Number(siege.total) || 0) : waveCount(state.wave);
  const siegeNotice = document.getElementById("siegePhaseNotice");
  const siegeNoticeText = document.getElementById("siegePhaseText");

  ui.start.disabled = state.inWave || gameOver;
  ui.start.textContent = state.inWave
    ? "⚔ Läuft"
    : gameOver
      ? "✖ Verloren"
      : "⚔ Angriff";
  ui.start.title = state.inWave
    ? "Angriff läuft"
    : "Alle bereits versammelten Gegner greifen gemeinsam an; Nachzügler folgen als Verstärkung.";
  ui.pause.textContent = paused ? "▶ Weiter" : "Ⅱ Pause";
  ui.status.textContent = gameOver
    ? "Burg gefallen"
    : state.inWave
      ? `${state.enemies.length + state.toSpawn} Eisenclan-Krieger`
      : `Belagerung · ${siegeReady}/${siegeTotal} bereit`;

  if (siegeNotice) {
    const showSiegeNotice = !gameOver && !state.inWave && siege?.active;
    siegeNotice.classList.toggle("hidden", !showSiegeNotice);
    if (siegeNoticeText && showSiegeNotice) {
      const remaining = Math.max(0, siegeTotal - siegeReady);
      siegeNoticeText.textContent = siegeReady >= siegeTotal
        ? `${siegeReady} Gegner stehen vollständig in den Außenlagern bereit. Ein Angriff löst alle Lager gleichzeitig aus.`
        : `${siegeReady} von ${siegeTotal} Gegnern sind eingetroffen · ${remaining} Nachzügler. Je länger du wartest, desto größer wird der erste Angriffspulk.`;
    }
  }

  document.querySelectorAll(".buildBtn").forEach((button) => {
    const key = button.dataset.build;
    const config = BUILD[key];
    if (!config) return;

    button.classList.toggle("active", buildMode === key);
    const requirement = buildRequirement(key);
    button.disabled =
      gameOver ||
      (config.kind === "fortification" && state.inWave) ||
      (config.kind === "fortification" && builtWallSections >= MIDDLE_WALL_SECTION_COUNT) ||
      !requirement.ok ||
      state.gold < config.gold ||
      state.wood < config.wood ||
      state.stone < (config.stone || 0);
    button.classList.toggle("unlocked", requirement.ok);
    button.title = requirement.ok ? "" : requirement.reason;
  });

  ui.upgrade.disabled = true;
  ui.upgrade.style.display = "inline-block";
  ui.sell.disabled = true;
  ui.repairWall.disabled = true;
  ui.repairWall.textContent = "Bewohner";
  ui.craftsmanToggle.style.display = "none";
  ui.marketTrade.style.display = "none";

  const workshopResearchButton = document.getElementById("workshopResearchBtn");
  if (workshopResearchButton) workshopResearchButton.style.display = "none";

  if (!selected) {
    ui.selected.textContent = "Nichts ausgewählt";
    return;
  }

  if (selected.kind === "wall-section" || selected.kind === "wall") {
    const inner = selected.ring === "inner";
    const label = selected.name ? ` ${selected.name}` : "";
    const destroyed = selected.destroyed || Number(selected.hp) <= 0;
    const stateLabel = destroyed ? "zerstört" : "errichtet";
    const title = inner ? "Innerer Mauerring" : "Holzpalisade";
    ui.selected.innerHTML = `<b>${title}${label}</b><br>Lebenspunkte: ${Math.ceil(selected.hp)} / ${selected.maxHp}<br>Status: ${stateLabel}`;
    return;
  }

  if (selected.kind === "unit") {
    const unitName = selected.key === "guard" ? "Burgwache" : "Bogenschütze";
    const unitMode = selected.key === "guard"
      ? selected.retreating
        ? "Rückzug"
        : selected.stance === "offense"
          ? "Ausfall"
          : "Burg halten"
      : selected.controlMode === "auto"
        ? "Automatik"
        : "Manuell";

    ui.selected.innerHTML = `<b>${unitName} · Erfahrungsstufe ${selected.expLevel || 1}</b><br>HP ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · EXP ${Math.floor(selected.xp || 0)}/${Math.floor(selected.xpMax || 65)}<br>Schaden ${Math.round(selected.damage)} · Rüstung ${Math.round((selected.armor || 0) * 100)}% · Tempo ${Math.round(selected.speed)}<br>Modus: ${unitMode}${selected.pendingUpgrades ? ` · <b>${selected.pendingUpgrades} Aufwertung bereit</b>` : ""}<br>Aufwertung: EXP-Auswahl oder Werkstatt-Forschung`;
    ui.upgrade.style.display = "none";
    ui.sell.disabled = false;
    return;
  }

  const building = selected;

  if (building.base.decorative) {
    ui.selected.innerHTML = `<b>${building.base.name}</b><br>Reines Zierbauwerk · derzeit ohne Funktion<br>Ein späteres Update gibt der Statue eine eigene Aufgabe.`;
    ui.upgrade.style.display = "none";
    ui.sell.disabled = false;
    return;
  }

  if (building.base.kind === "tower") {
    ui.selected.innerHTML = `<b>${building.base.name} · EXP-Stufe ${building.expLevel || 1}</b><br>HP ${Math.ceil(building.hp)} / ${Math.ceil(building.maxHp)} · EXP ${Math.floor(building.xp || 0)}/${Math.floor(building.xpMax || 90)}<br>Schaden ${Math.round(building.damage)} · Reichweite ${Math.round(building.range)}${building.pendingUpgrades ? ` · <b>${building.pendingUpgrades} EXP-Aufwertung bereit</b>` : ""}<br>Aufwertung: nur über EXP; Turmforschung folgt separat`;
    ui.upgrade.style.display = "none";
    ui.sell.disabled = false;
    return;
  }

  const goldCost = Math.floor(building.base.gold * (0.65 + building.level * 0.45));
  const woodCost = Math.floor(building.base.wood * (0.45 + building.level * 0.3));
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
    supportInfo = `<br>Bewohner: ${buildingHasWorker(building) ? "zugewiesen" : "nicht zugewiesen"} · Reparatur: ${repairHpPerTick().toFixed(1).replace(".", ",")} HP je Takt · ${building.repairEnabled === false ? "gestoppt" : "aktiv"}`;
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

  ui.selected.innerHTML = `<b>${buildingName} Stufe ${building.level}</b>${supportInfo}<br>Upgrade: ${goldCost} Gold / ${woodCost} Holz`;

  const maxLevel = building.key === "house" ? 2 : building.key === "market" ? 3 : 5;
  ui.upgrade.disabled =
    building.level >= maxLevel ||
    state.gold < goldCost ||
    state.wood < woodCost;
  ui.sell.disabled = false;
}
