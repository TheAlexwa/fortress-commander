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
  selected,
  buildMode,
  paused,
  gameOver,
  navResearch,
  navResearchBadge,
  closeAllBlockingPanels,
  totalGoldPerSecond,
  totalWoodPerSecond,
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

  syncResidents();
  ui.populationBusy.textContent = assignedResidents();
  ui.populationTotal.textContent = totalResidents();
  ui.populationFree.textContent = `${freeResidents()} frei`;

  ui.hp.textContent = `${Math.ceil(state.hp)}/${state.maxHp}`;
  ui.wave.textContent = state.wave;
  const intactWalls = state.walls.filter((wall) => wall.hp > 0).length;
  ui.wallInfo.textContent = `${intactWalls}/${WALL_SEGMENTS}`;

  ui.start.disabled = state.inWave || gameOver;
  ui.start.textContent = state.inWave
    ? "⚔ Läuft"
    : gameOver
      ? "✖ Verloren"
      : "⚔ Start";
  ui.pause.textContent = paused ? "▶ Weiter" : "Ⅱ Pause";
  ui.status.textContent = gameOver
    ? "Burg gefallen"
    : state.inWave
      ? `${state.enemies.length + state.toSpawn} Eisenclan-Krieger`
      : `Bauphase · ${waveCount(state.wave)} Feinde`;

  document.querySelectorAll(".buildBtn").forEach((button) => {
    const key = button.dataset.build;
    const config = BUILD[key];
    if (!config) return;

    button.classList.toggle("active", buildMode === key);
    const requirement = buildRequirement(key);
    button.disabled =
      gameOver ||
      !requirement.ok ||
      state.gold < config.gold ||
      state.wood < config.wood;
    button.classList.toggle("unlocked", requirement.ok);
    button.title = requirement.ok ? "" : requirement.reason;
  });

  ui.upgrade.disabled = true;
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

  if (selected.kind === "wall") {
    ui.selected.innerHTML = `<b>Mauerabschnitt ${selected.i + 1}</b><br>Lebenspunkte: ${Math.ceil(selected.hp)} / ${selected.maxHp}`;
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

    ui.selected.innerHTML = `<b>${unitName} · Erfahrungsstufe ${selected.expLevel || 1}</b><br>HP ${Math.ceil(selected.hp)}/${Math.ceil(selected.maxHp)} · EXP ${Math.floor(selected.xp || 0)}/${Math.floor(selected.xpMax || 65)}<br>Schaden ${Math.round(selected.damage)} · Rüstung ${Math.round((selected.armor || 0) * 100)}% · Tempo ${Math.round(selected.speed)}<br>Modus: ${unitMode}${selected.pendingUpgrades ? ` · <b>${selected.pendingUpgrades} Aufwertung bereit</b>` : ""}`;
    ui.upgrade.disabled = selected.level >= 5 || state.gold < 55 * selected.level;
    ui.sell.disabled = false;
    return;
  }

  const building = selected;
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

  if (["lumber", "repair", "market"].includes(building.key)) {
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

  ui.selected.innerHTML = `<b>${buildingName} Stufe ${building.level}</b>${building.base.kind === "tower" ? `<br>HP ${Math.ceil(building.hp)} / ${Math.ceil(building.maxHp)}` : ""}${supportInfo}<br>Upgrade: ${goldCost} Gold / ${woodCost} Holz`;

  const maxLevel = building.key === "house" ? 2 : building.key === "market" ? 3 : 5;
  ui.upgrade.disabled =
    building.level >= maxLevel ||
    state.gold < goldCost ||
    state.wood < woodCost;
  ui.sell.disabled = false;
}
