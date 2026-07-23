import { getWaveTypeInfo } from "./game.js";

export const WAR_COUNCIL_COMMANDS = Object.freeze({
  none: Object.freeze({
    key: "none",
    icon: "⚪",
    label: "Kein Sonderbefehl",
    shortLabel: "Neutral",
    benefit: "Keine Vorteile.",
    drawback: "Keine Nachteile.",
    use: "Ausgewogene oder frühe Wellen.",
    modifiers: Object.freeze({}),
  }),
  reinforce: Object.freeze({
    key: "reinforce",
    icon: "🛡️",
    label: "Mauern verstärken",
    shortLabel: "Mauern",
    benefit: "Mauern und Tore erleiden 25 % weniger Schaden. Reparaturholz −20 %.",
    drawback: "Gold-, Holz- und Steinproduktion −20 %.",
    use: "Schildwall, Häuptlingsangriff und gefährliche Hauptfronten.",
    modifiers: Object.freeze({ fortificationDamageTaken: 0.75, repairCost: 0.8, production: 0.8 }),
  }),
  combat: Object.freeze({
    key: "combat",
    icon: "⚔️",
    label: "Kampfbereitschaft",
    shortLabel: "Kampfbereit",
    benefit: "Einheitenschaden +15 %, Einheitentempo +10 %, Türme laden 10 % schneller.",
    drawback: "Gold-, Holz- und Steinproduktion −20 %.",
    use: "Späherangriffe, Berserkerstürme und akute Krisenfronten.",
    modifiers: Object.freeze({ unitDamage: 1.15, unitSpeed: 1.1, towerCooldown: 0.9, production: 0.8 }),
  }),
  stockpile: Object.freeze({
    key: "stockpile",
    icon: "📦",
    label: "Vorräte anhäufen",
    shortLabel: "Vorräte",
    benefit: "Gold-, Holz- und Steinproduktion +35 %. Handelsverlust am Markt −5 Prozentpunkte.",
    drawback: "Nach der Welle findet keine automatische Festungsreparatur statt.",
    use: "Leichtere Wellen und wirtschaftliche Vorbereitung auf spätere Bosse.",
    modifiers: Object.freeze({ production: 1.35, marketLossDelta: -5, autoRepairAllowed: false }),
  }),
  repairs: Object.freeze({
    key: "repairs",
    icon: "🔨",
    label: "Reparaturbereitschaft",
    shortLabel: "Reparatur",
    benefit: "Handwerker reparieren 30 % mehr HP pro Takt. Reparaturholz −15 %.",
    drawback: "Burgwachen und Bogenschützen verursachen 10 % weniger Schaden.",
    use: "Mehrere beschädigte Mauern oder ein angeschlagenes Tor.",
    modifiers: Object.freeze({ repairSpeed: 1.3, repairCost: 0.85, unitDamage: 0.9 }),
  }),
  ranged: Object.freeze({
    key: "ranged",
    icon: "🏹",
    label: "Fernkampfvorbereitung",
    shortLabel: "Fernkampf",
    benefit: "Türme und Bogenschützen erhalten +15 % Reichweite und +10 % Schaden.",
    drawback: "Burgwachen verlieren 10 Prozentpunkte Rüstung.",
    use: "Dichte Gegnergruppen, Speerjäger und Schildformationen.",
    modifiers: Object.freeze({ towerRange: 1.15, towerDamage: 1.1, archerRange: 1.15, archerDamage: 1.1, guardArmorDelta: -0.1 }),
  }),
});

const VALID_KEYS = new Set(Object.keys(WAR_COUNCIL_COMMANDS));
const ENEMY_LABELS = Object.freeze({
  raider: "Plünderer",
  runner: "Clanspäher",
  spear: "Speerjäger",
  shield: "Eisenschilde",
  berserker: "Blutberserker",
  boss: "Häuptling",
});
const FRONT_LABELS = Object.freeze(["Norden", "Osten", "Süden", "Westen"]);

export function normalizeWarCouncilKey(value) {
  return VALID_KEYS.has(value) ? value : "none";
}

export function createWarCouncilState(wave = 1) {
  return {
    wave: Math.max(1, Math.floor(Number(wave) || 1)),
    selected: "none",
    active: "none",
    locked: false,
  };
}

export function restoreWarCouncilState(saved, wave = 1) {
  const currentWave = Math.max(1, Math.floor(Number(wave) || 1));
  if (!saved || Number(saved.wave) !== currentWave) return createWarCouncilState(currentWave);
  return {
    wave: currentWave,
    selected: normalizeWarCouncilKey(saved.selected),
    active: normalizeWarCouncilKey(saved.active),
    locked: saved.locked === true,
  };
}

export function serializeWarCouncilState(value, wave = 1) {
  const restored = restoreWarCouncilState(value, wave);
  return { ...restored };
}

export function ensureWarCouncilState(state) {
  const wave = Math.max(1, Math.floor(Number(state?.wave) || 1));
  if (!state.warCouncil || Number(state.warCouncil.wave) !== wave) {
    state.warCouncil = createWarCouncilState(wave);
  } else {
    state.warCouncil.selected = normalizeWarCouncilKey(state.warCouncil.selected);
    state.warCouncil.active = normalizeWarCouncilKey(state.warCouncil.active);
    state.warCouncil.locked = state.warCouncil.locked === true;
  }
  return state.warCouncil;
}

export function getWarCouncilCommand(key) {
  return WAR_COUNCIL_COMMANDS[normalizeWarCouncilKey(key)];
}

export function selectWarCouncilCommand(state, key) {
  const council = ensureWarCouncilState(state);
  if (state.inWave || council.locked) return false;
  council.selected = normalizeWarCouncilKey(key);
  council.active = "none";
  return true;
}

export function activateWarCouncilCommand(state) {
  const council = ensureWarCouncilState(state);
  council.active = normalizeWarCouncilKey(council.selected);
  council.locked = true;
  return getWarCouncilCommand(council.active);
}

export function resetWarCouncilForWave(state, wave = state?.wave, { preserveSelection = true } = {}) {
  const previous = state?.warCouncil || null;
  const selected = preserveSelection
    ? normalizeWarCouncilKey(previous?.selected || previous?.active)
    : "none";
  state.warCouncil = createWarCouncilState(wave);
  state.warCouncil.selected = selected;
  return state.warCouncil;
}

export function getWarCouncilModifiers(state) {
  const council = ensureWarCouncilState(state);
  return getWarCouncilCommand(council.active).modifiers;
}

export function getWarCouncilAnalysis(state) {
  const siege = state?.siege;
  const waveType = getWaveTypeInfo(state?.wave, siege?.waveType);
  const typeCounts = {};
  for (const entry of siege?.planned || []) {
    const type = String(entry?.type || "raider");
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  const enemies = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${count} ${ENEMY_LABELS[type] || type}`)
    .join(" · ") || "Armee wird noch aufgeklärt";

  const campTotals = [0, 0, 0, 0];
  for (const entry of siege?.planned || []) {
    const camp = Math.max(0, Math.min(3, Math.floor(Number(entry?.camp) || 0)));
    campTotals[camp]++;
  }
  const dangerous = campTotals.reduce((best, score, index) => score > best.score ? { index, score } : best, { index: 0, score: -1 });
  const front = dangerous.score > 0 ? FRONT_LABELS[dangerous.index] : "Noch unbekannt";

  let recommended = ["none"];
  if (waveType.key === "scoutRaid") recommended = ["combat", "ranged"];
  else if (waveType.key === "shieldWall") recommended = ["reinforce", "ranged"];
  else if (waveType.key === "berserkerStorm") recommended = ["combat", "reinforce"];
  else if (waveType.key === "fourFront") recommended = ["reinforce", "combat"];
  else if (waveType.key === "bossAssault") recommended = ["reinforce", "combat"];
  else recommended = ["none", "stockpile"];

  const fortifications = [
    ...(state?.outerWalls || []),
    ...(state?.walls || []),
    ...(state?.innerWalls || []),
    ...(state?.middleGates || []),
    ...(state?.outerGates || []),
  ].filter((item) => item?.built && Number(item.maxHp) > 0);
  const damageRatio = fortifications.length
    ? fortifications.reduce((sum, item) => sum + Math.max(0, 1 - Number(item.hp) / Number(item.maxHp)), 0) / fortifications.length
    : 0;
  if (damageRatio >= 0.22) recommended = ["repairs", ...recommended.filter((key) => key !== "repairs")].slice(0, 2);

  return {
    waveType,
    enemies,
    front,
    total: Math.max(0, Number(siege?.total) || (siege?.planned?.length || 0)),
    recommended,
    recommendationText: recommended.map((key) => `${getWarCouncilCommand(key).icon} ${getWarCouncilCommand(key).label}`).join(" oder "),
  };
}
