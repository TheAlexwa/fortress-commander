/**
 * Freiwillige Bonusziele pro Welle.
 *
 * Ein Bonusziel verändert nie die Siegbedingung. Es wird zwischen den Wellen
 * angekündigt, beim Angriff aktiviert und am Wellenende ausgewertet.
 */

export const BONUS_OBJECTIVE_DEFINITIONS = Object.freeze({
  muster: Object.freeze({
    key: "muster",
    icon: "⛺",
    title: "Vollständige Musterung",
    shortLabel: "Musterung",
    description: "Starte den Angriff erst, wenn alle Gegner in den vier Belagerungslagern eingetroffen sind.",
    successText: "Die gesamte feindliche Armee war vor Angriffsbeginn sichtbar.",
  }),
  gates: Object.freeze({
    key: "gates",
    icon: "🚪",
    title: "Tore halten",
    shortLabel: "Tore halten",
    description: "Alle zu Angriffsbeginn intakten Tore müssen die Welle überstehen.",
    successText: "Keines der anfangs intakten Tore wurde zerstört.",
  }),
  fortress: Object.freeze({
    key: "fortress",
    icon: "🏰",
    title: "Festung unversehrt",
    shortLabel: "Unversehrt",
    description: "Die zentrale Holzfestung darf während dieser Welle keinen Schaden erleiden.",
    successText: "Die Angreifer haben die zentrale Festung nicht erreicht.",
  }),
  outer: Object.freeze({
    key: "outer",
    icon: "🧱",
    title: "Äußerer Ring hält",
    shortLabel: "Außenring",
    description: "Mindestens 75 % der zu Angriffsbeginn errichteten äußeren Palisadensegmente müssen stehen bleiben.",
    successText: "Der äußere Verteidigungsring hat dem Angriff standgehalten.",
  }),
  hero: Object.freeze({
    key: "hero",
    icon: "👑",
    title: "Held ohne Wanken",
    shortLabel: "Held schützen",
    description: "Andreas darf während der gesamten Welle nicht unter 50 % seiner maximalen Lebenspunkte fallen.",
    successText: "Andreas hat die Welle ohne schwere Verwundung überstanden.",
  }),
  boss: Object.freeze({
    key: "boss",
    icon: "⚔️",
    title: "Häuptling früh brechen",
    shortLabel: "Häuptling",
    description: "Besiege den Eisenclan-Häuptling, bevor er den inneren Mauerring durchbricht und die Kernzone erreicht.",
    successText: "Der Häuptling fiel noch vor der Kernzone.",
  }),
});

const ROTATION = Object.freeze(["muster", "gates", "fortress", "outer", "hero"]);
const VALID_STATUS = new Set(["available", "active", "success", "failed"]);

function livingHero(state) {
  return (state?.units || []).find((unit) => unit?.key === "hero" && unit.hp > 0) || null;
}

function builtGateRefs(state) {
  return [
    ...(state?.middleGates || []).map((gate, index) => ({ ring: "middle", index, gate })),
    ...(state?.outerGates || []).map((gate, index) => ({ ring: "outer", index, gate })),
  ].filter((entry) => entry.gate?.built && entry.gate.hp > 0);
}

function builtOuterRefs(state) {
  return (state?.outerWalls || [])
    .map((wall, index) => ({ index, wall }))
    .filter((entry) => entry.wall?.built && entry.wall.hp > 0);
}

function gateFromRef(state, reference) {
  const collection = reference?.ring === "outer" ? state?.outerGates : state?.middleGates;
  return collection?.[Number(reference?.index)] || null;
}

function isEligible(state, key, wave) {
  if (key === "boss") return Number(wave) % 8 === 0;
  if (key === "hero") return Boolean(livingHero(state));
  if (key === "outer") return builtOuterRefs(state).length >= 4;
  if (key === "gates") return builtGateRefs(state).length >= 1;
  return key === "muster" || key === "fortress";
}

function selectObjectiveKey(state, wave) {
  const currentWave = Math.max(1, Math.floor(Number(wave) || 1));
  if (isEligible(state, "boss", currentWave)) return "boss";

  const start = (currentWave - 1) % ROTATION.length;
  for (let offset = 0; offset < ROTATION.length; offset++) {
    const key = ROTATION[(start + offset) % ROTATION.length];
    if (isEligible(state, key, currentWave)) return key;
  }
  return "muster";
}

export function getBonusObjectiveDefinition(key) {
  return BONUS_OBJECTIVE_DEFINITIONS[key] || BONUS_OBJECTIVE_DEFINITIONS.muster;
}

export function getBonusObjectiveReward(key, wave) {
  const currentWave = Math.max(1, Math.floor(Number(wave) || 1));
  switch (key) {
    case "gates":
      return { stone: 5 + Math.ceil(currentWave / 4), repairPercent: 0.04 };
    case "fortress":
      return { gold: 15 + currentWave, researchPoints: 2 + Math.floor(currentWave / 8) };
    case "outer":
      return { wood: 30 + currentWave * 2, stone: 6 };
    case "hero":
      return { gold: 25 + currentWave * 2, heroXp: 35 + currentWave };
    case "boss":
      return {
        gold: 60 + currentWave * 3,
        stone: 12 + Math.floor(currentWave / 8) * 2,
        researchPoints: 4,
      };
    case "muster":
    default:
      return { gold: 18 + currentWave * 2, researchPoints: 1 };
  }
}

export function formatBonusReward(reward = {}) {
  return [
    reward.gold ? `+${Math.floor(reward.gold)} Gold` : "",
    reward.wood ? `+${Math.floor(reward.wood)} Holz` : "",
    reward.stone ? `+${Math.floor(reward.stone)} Stein` : "",
    reward.researchPoints ? `+${Math.floor(reward.researchPoints)} Forschung` : "",
    reward.heroXp ? `+${Math.floor(reward.heroXp)} Andreas-EXP` : "",
    reward.repairPercent ? `${Math.round(reward.repairPercent * 100)} % kostenlose Reparatur` : "",
  ].filter(Boolean).join(" · ");
}

export function createBonusObjectiveState(state, wave = state?.wave) {
  const currentWave = Math.max(1, Math.floor(Number(wave) || 1));
  return {
    wave: currentWave,
    key: selectObjectiveKey(state, currentWave),
    status: "available",
    failedReason: "",
    conditionMet: false,
    elapsed: 0,
    start: null,
  };
}

export function ensureBonusObjectiveState(state) {
  const currentWave = Math.max(1, Math.floor(Number(state?.wave) || 1));
  const current = state?.bonusObjective;
  if (
    !current ||
    Number(current.wave) !== currentWave ||
    !BONUS_OBJECTIVE_DEFINITIONS[current.key] ||
    !VALID_STATUS.has(current.status)
  ) {
    state.bonusObjective = createBonusObjectiveState(state, currentWave);
  }
  return state.bonusObjective;
}

export function resetBonusObjectiveForWave(state, wave = state?.wave) {
  state.bonusObjective = createBonusObjectiveState(state, wave);
  return state.bonusObjective;
}

export function serializeBonusObjectiveState(value, wave) {
  if (!value || Number(value.wave) !== Number(wave) || !BONUS_OBJECTIVE_DEFINITIONS[value.key]) return null;
  return {
    wave: Math.max(1, Math.floor(Number(value.wave) || 1)),
    key: value.key,
    status: value.status === "available" ? "available" : "available",
    failedReason: "",
    conditionMet: false,
    elapsed: 0,
    start: null,
  };
}

export function restoreBonusObjectiveState(saved, state, wave = state?.wave) {
  const currentWave = Math.max(1, Math.floor(Number(wave) || 1));
  if (
    saved &&
    Number(saved.wave) === currentWave &&
    BONUS_OBJECTIVE_DEFINITIONS[saved.key] &&
    isEligible(state, saved.key, currentWave)
  ) {
    return {
      wave: currentWave,
      key: saved.key,
      status: "available",
      failedReason: "",
      conditionMet: false,
      elapsed: 0,
      start: null,
    };
  }
  return createBonusObjectiveState(state, currentWave);
}

function failObjective(objective, reason) {
  if (!objective || objective.status === "failed" || objective.status === "success") return false;
  objective.status = "failed";
  objective.failedReason = String(reason || "Bonusziel verfehlt");
  return true;
}

export function activateBonusObjective(state, { fullyGathered = false } = {}) {
  const objective = ensureBonusObjectiveState(state);
  const hero = livingHero(state);
  const gateRefs = builtGateRefs(state);
  const outerRefs = builtOuterRefs(state);

  objective.status = "active";
  objective.failedReason = "";
  objective.conditionMet = false;
  objective.elapsed = 0;
  objective.start = {
    fortressHp: Number(state.hp) || 0,
    gateRefs: gateRefs.map(({ ring, index }) => ({ ring, index })),
    outerIndexes: outerRefs.map(({ index }) => index),
    outerRequired: Math.max(1, Math.ceil(outerRefs.length * 0.75)),
    heroUid: hero?.uid ?? null,
    fullyGathered: fullyGathered === true,
  };

  if (objective.key === "muster" && !fullyGathered) {
    failObjective(objective, "Der Angriff wurde vor dem Eintreffen aller Nachzügler ausgelöst.");
  }
  if (objective.key === "hero" && (!hero || hero.hp / Math.max(1, hero.maxHp) < 0.5)) {
    failObjective(objective, "Andreas startete die Welle bereits unter 50 % Lebenspunkten.");
  }
  return objective;
}

export function updateBonusObjective(state, dt = 0) {
  const objective = ensureBonusObjectiveState(state);
  if (objective.status !== "active") return null;
  objective.elapsed += Math.max(0, Number(dt) || 0);

  if (objective.key === "gates") {
    const refs = objective.start?.gateRefs || [];
    if (refs.some((reference) => {
      const gate = gateFromRef(state, reference);
      return !gate?.built || gate.hp <= 0;
    })) failObjective(objective, "Ein zu Angriffsbeginn intaktes Tor wurde zerstört.");
  } else if (objective.key === "fortress") {
    if ((Number(state.hp) || 0) < (Number(objective.start?.fortressHp) || 0) - 0.01) {
      failObjective(objective, "Die zentrale Festung hat Schaden erlitten.");
    }
  } else if (objective.key === "outer") {
    const indexes = objective.start?.outerIndexes || [];
    const alive = indexes.filter((index) => {
      const wall = state?.outerWalls?.[index];
      return wall?.built && wall.hp > 0;
    }).length;
    if (alive < Math.max(1, Number(objective.start?.outerRequired) || 1)) {
      failObjective(objective, "Zu viele Segmente des äußeren Rings wurden zerstört.");
    }
  } else if (objective.key === "hero") {
    const hero = (state?.units || []).find((unit) => unit?.uid === objective.start?.heroUid && unit.key === "hero");
    if (!hero || hero.hp <= 0) failObjective(objective, "Andreas ist gefallen.");
    else if (hero.hp / Math.max(1, hero.maxHp) < 0.5) failObjective(objective, "Andreas fiel unter 50 % Lebenspunkte.");
  } else if (objective.key === "boss") {
    const boss = (state?.enemies || []).find((enemy) => enemy?.type === "boss" && enemy.hp > 0);
    if (boss?.phase === "core") failObjective(objective, "Der Häuptling hat den inneren Ring durchbrochen.");
  }
  return objective;
}

export function registerBonusEnemyDeath(state, enemy) {
  const objective = ensureBonusObjectiveState(state);
  if (objective.status !== "active" || objective.key !== "boss" || enemy?.type !== "boss") return false;
  if (enemy.phase === "core") return failObjective(objective, "Der Häuptling wurde erst in der Kernzone besiegt.");
  objective.conditionMet = true;
  return true;
}

export function resolveBonusObjective(state) {
  const objective = ensureBonusObjectiveState(state);
  const definition = getBonusObjectiveDefinition(objective.key);

  if (objective.status === "active") {
    if (objective.key === "boss" && !objective.conditionMet) {
      failObjective(objective, "Der Häuptling wurde nicht rechtzeitig besiegt.");
    } else {
      objective.status = "success";
    }
  }

  const success = objective.status === "success";
  return {
    success,
    key: objective.key,
    definition,
    reward: success ? getBonusObjectiveReward(objective.key, objective.wave) : {},
    failedReason: objective.failedReason || "",
  };
}

function bossPhaseLabel(phase) {
  if (phase === "core") return "Kernzone erreicht";
  if (phase === "inside") return "zwischen mittlerem und innerem Ring";
  if (phase === "outer") return "zwischen äußerem und mittlerem Ring";
  return "noch außerhalb der Festung";
}

export function getBonusObjectiveView(state) {
  const objective = ensureBonusObjectiveState(state);
  const definition = getBonusObjectiveDefinition(objective.key);
  const reward = getBonusObjectiveReward(objective.key, objective.wave);
  let progress = "Bereit für den Angriff";

  if (objective.status === "failed") progress = objective.failedReason || "Bonusziel verfehlt";
  else if (objective.status === "success") progress = definition.successText;
  else if (objective.key === "muster") {
    const arrived = Math.max(0, Number(state?.siege?.arrived) || 0);
    const total = Math.max(0, Number(state?.siege?.total) || 0);
    progress = objective.status === "active" ? "Armee vollständig versammelt" : `${arrived}/${total} Gegner eingetroffen`;
  } else if (objective.key === "gates") {
    const refs = objective.status === "active" ? objective.start?.gateRefs || [] : builtGateRefs(state);
    const alive = refs.filter((reference) => {
      const gate = reference.gate || gateFromRef(state, reference);
      return gate?.built && gate.hp > 0;
    }).length;
    progress = `${alive}/${refs.length} relevante Tore intakt`;
  } else if (objective.key === "fortress") {
    const startHp = Number(objective.start?.fortressHp) || Number(state?.hp) || 0;
    const lost = Math.max(0, startHp - (Number(state?.hp) || 0));
    progress = lost > 0 ? `${Math.ceil(lost)} Festungsleben verloren` : "Noch kein Festungsschaden";
  } else if (objective.key === "outer") {
    const indexes = objective.status === "active"
      ? objective.start?.outerIndexes || []
      : builtOuterRefs(state).map(({ index }) => index);
    const alive = indexes.filter((index) => {
      const wall = state?.outerWalls?.[index];
      return wall?.built && wall.hp > 0;
    }).length;
    const required = objective.status === "active"
      ? Math.max(1, Number(objective.start?.outerRequired) || 1)
      : Math.max(1, Math.ceil(indexes.length * 0.75));
    progress = `${alive} Segmente intakt · mindestens ${required} benötigt`;
  } else if (objective.key === "hero") {
    const hero = livingHero(state);
    progress = hero ? `Andreas: ${Math.max(0, Math.ceil(hero.hp / Math.max(1, hero.maxHp) * 100))} % Leben` : "Andreas ist nicht kampfbereit";
  } else if (objective.key === "boss") {
    const boss = (state?.enemies || []).find((enemy) => enemy?.type === "boss" && enemy.hp > 0);
    progress = objective.conditionMet ? "Häuptling rechtzeitig besiegt" : boss ? bossPhaseLabel(boss.phase) : "Häuptling noch nicht auf dem Feld";
  }

  return {
    objective,
    definition,
    reward,
    rewardText: formatBonusReward(reward),
    progress,
  };
}
