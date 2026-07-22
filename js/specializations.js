"use strict";

export const VETERAN_UNLOCK_LEVEL = 3;

const ELITE_TYPES = new Set(["shield", "berserker", "boss"]);

export const VETERAN_SPECIALIZATIONS = Object.freeze({
  archer: Object.freeze([
    Object.freeze({
      id: "rapid_fire",
      icon: "🏹",
      name: "Schnellfeuer",
      role: "Dauerfeuer gegen große leichte Gruppen",
      benefit: "22 % kürzere Nachladezeit",
      drawback: "10 % weniger Schaden pro Treffer",
      modifiers: Object.freeze({ cooldownMultiplier: 0.78, damageMultiplier: 0.9 }),
    }),
    Object.freeze({
      id: "hunter",
      icon: "🦅",
      name: "Jagdplattform",
      role: "Weitreichender Elitejäger",
      benefit: "+20 % Reichweite und +30 % Schaden gegen Elitegegner",
      drawback: "12 % längere Nachladezeit",
      modifiers: Object.freeze({ rangeMultiplier: 1.2, eliteDamageMultiplier: 1.3, cooldownMultiplier: 1.12 }),
    }),
  ]),
  crossbow: Object.freeze([
    Object.freeze({
      id: "armor_breaker",
      icon: "🛡️",
      name: "Panzerbrecher",
      role: "Durchschlägt schwerste Rüstung und Schilddeckung",
      benefit: "80 % Rüstungsdurchdringung",
      drawback: "12 % längere Nachladezeit",
      modifiers: Object.freeze({ armorPenetration: 0.8, cooldownMultiplier: 1.12 }),
    }),
    Object.freeze({
      id: "executioner",
      icon: "☠️",
      name: "Henkerschuss",
      role: "Beendet bereits verwundete schwere Ziele",
      benefit: "+40 % Schaden gegen Gegner unter 40 % Leben",
      drawback: "10 % weniger Reichweite",
      modifiers: Object.freeze({ lowHealthDamageMultiplier: 1.4, rangeMultiplier: 0.9 }),
    }),
  ]),
  catapult: Object.freeze([
    Object.freeze({
      id: "fragmentation",
      icon: "💥",
      name: "Splittergeschosse",
      role: "Maximale Flächenwirkung gegen dicht stehende Reihen",
      benefit: "+45 % Explosionsradius",
      drawback: "15 % weniger Schaden",
      modifiers: Object.freeze({ splashMultiplier: 1.45, damageMultiplier: 0.85 }),
    }),
    Object.freeze({
      id: "breaker",
      icon: "🪨",
      name: "Brecherkugel",
      role: "Schwerer Einzeltreffer mit starkem Rüstungsbruch",
      benefit: "+45 % Schaden am Hauptziel, 30 % Rüstungsbruch und 20 % Verlangsamung",
      drawback: "30 % kleinerer Explosionsradius und 10 % längere Nachladezeit",
      modifiers: Object.freeze({
        splashMultiplier: 0.7,
        primaryTargetMultiplier: 1.45,
        armorBreakAmount: 0.3,
        slowAmount: 0.2,
        cooldownMultiplier: 1.1,
      }),
    }),
  ]),
  soldier: Object.freeze([
    Object.freeze({
      id: "skirmisher",
      icon: "⚡",
      name: "Plänkler",
      role: "Beweglicher Schnellschütze für wechselnde Fronten",
      benefit: "+25 % Tempo und 15 % kürzere Nachladezeit",
      drawback: "15 % weniger Reichweite",
      modifiers: Object.freeze({ speedMultiplier: 1.25, cooldownMultiplier: 0.85, rangeMultiplier: 0.85 }),
    }),
    Object.freeze({
      id: "sharpshooter",
      icon: "🎯",
      name: "Scharfschütze",
      role: "Langstreckenjäger für Elitegegner",
      benefit: "+20 % Reichweite und +35 % Schaden gegen Elitegegner",
      drawback: "15 % längere Nachladezeit",
      modifiers: Object.freeze({ rangeMultiplier: 1.2, eliteDamageMultiplier: 1.35, cooldownMultiplier: 1.15 }),
    }),
  ]),
  guard: Object.freeze([
    Object.freeze({
      id: "gatekeeper",
      icon: "🚪",
      name: "Torwächter",
      role: "Unbewegliche Bastion an Toren und Breschen",
      benefit: "Nahe intakten Toren zusätzlich +20 % Schaden und +15 Prozentpunkte Rüstung",
      drawback: "12 % weniger Bewegungstempo",
      modifiers: Object.freeze({ speedMultiplier: 0.88, nearGateDamageMultiplier: 1.2, nearGateArmorDelta: 0.15 }),
    }),
    Object.freeze({
      id: "sally_fighter",
      icon: "⚔️",
      name: "Ausfallkämpfer",
      role: "Aggressiver Nahkämpfer außerhalb der Mauern",
      benefit: "Im Ausfall +25 % Schaden und +20 % Tempo",
      drawback: "10 Prozentpunkte weniger Rüstung",
      modifiers: Object.freeze({ armorDelta: -0.1, offenseDamageMultiplier: 1.25, offenseSpeedMultiplier: 1.2 }),
    }),
  ]),
  hero: Object.freeze([
    Object.freeze({
      id: "guardian",
      icon: "🛡️",
      name: "Wächter der Festung",
      role: "Schützt größere Teile der Verteidigung mit seiner Aura",
      benefit: "+25 % Auraradius und +10 Prozentpunkte eigene Rüstung",
      drawback: "10 % weniger eigener Schaden",
      modifiers: Object.freeze({ auraRadiusMultiplier: 1.25, armorDelta: 0.1, damageMultiplier: 0.9 }),
    }),
    Object.freeze({
      id: "champion",
      icon: "👑",
      name: "Bezwinger des Eisenclans",
      role: "Persönlicher Elite- und Bossjäger",
      benefit: "+22 % zusätzlicher Eliteschaden und Ruf des Helden nach 45 statt 60 Sekunden bereit",
      drawback: "15 % kleinerer Auraradius",
      modifiers: Object.freeze({ eliteDamageMultiplier: 1.22, auraRadiusMultiplier: 0.85, heroCooldownMultiplier: 0.75 }),
    }),
  ]),
});

const DEFAULT_MODIFIERS = Object.freeze({
  damageMultiplier: 1,
  rangeMultiplier: 1,
  cooldownMultiplier: 1,
  speedMultiplier: 1,
  armorDelta: 0,
  splashMultiplier: 1,
  primaryTargetMultiplier: 1,
  armorPenetration: null,
  armorBreakAmount: null,
  slowAmount: null,
  eliteDamageMultiplier: 1,
  lowHealthDamageMultiplier: 1,
  nearGateDamageMultiplier: 1,
  nearGateArmorDelta: 0,
  offenseDamageMultiplier: 1,
  offenseSpeedMultiplier: 1,
  auraRadiusMultiplier: 1,
  heroCooldownMultiplier: 1,
});

export function getVeteranOptions(entityOrKey) {
  const key = typeof entityOrKey === "string" ? entityOrKey : entityOrKey?.key;
  return VETERAN_SPECIALIZATIONS[key] || [];
}

export function getVeteranSpecialization(entity) {
  if (!entity) return null;
  const id = typeof entity.specialization === "string" ? entity.specialization : "";
  return getVeteranOptions(entity).find((option) => option.id === id) || null;
}

export function normalizeVeteranSpecialization(entity) {
  if (!entity) return null;
  const specialization = getVeteranSpecialization(entity);
  entity.specialization = specialization?.id || null;
  return specialization;
}

export function getVeteranModifiers(entity) {
  const specialization = getVeteranSpecialization(entity);
  return specialization
    ? { ...DEFAULT_MODIFIERS, ...(specialization.modifiers || {}) }
    : { ...DEFAULT_MODIFIERS };
}

export function isVeteranChoiceReady(entity) {
  return Boolean(
    entity &&
    getVeteranOptions(entity).length === 2 &&
    (Number(entity.expLevel) || 1) >= VETERAN_UNLOCK_LEVEL &&
    !getVeteranSpecialization(entity)
  );
}

export function chooseVeteranSpecialization(entity, specializationId) {
  if (!entity || getVeteranSpecialization(entity)) return false;
  if ((Number(entity.expLevel) || 1) < VETERAN_UNLOCK_LEVEL) return false;
  const specialization = getVeteranOptions(entity).find((option) => option.id === specializationId);
  if (!specialization) return false;
  entity.specialization = specialization.id;
  entity.specializationChosenAtLevel = Math.max(VETERAN_UNLOCK_LEVEL, Number(entity.expLevel) || VETERAN_UNLOCK_LEVEL);
  return specialization;
}

export function veteranSpecializationLabel(entity) {
  const specialization = getVeteranSpecialization(entity);
  return specialization ? `${specialization.icon} ${specialization.name}` : "Noch kein Veteranenpfad";
}

export function isEliteEnemy(enemy) {
  return Boolean(enemy && ELITE_TYPES.has(enemy.type));
}
