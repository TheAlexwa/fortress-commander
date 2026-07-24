import {
  GUARD_DEFEND_RADIUS_BONUS,
  GUARD_OUTER_HOLD_RADIUS_BONUS,
  GUARD_OFFENSE_RADIUS_BONUS,
  getGuardRadiusLimit,
  getGuardMeleeReach,
  isGuardTargetAllowed,
  findNearestGuardTarget,
  ENEMY_SPEAR_REACH_BONUS,
  getEnemyDefenderAttackReach,
  isEnemyDefenderInAttackRange,
  findNearestBlockingUnit,
} from "../js/combat.js";

const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const WALL_RADIUS = 355;
const center = { centerX: 0, centerY: 0, wallRadius: WALL_RADIUS };
const guard = { key: "guard", stance: "defend", guardZone: "middle", range: 30, x: 0, y: 0, hp: 180 };
const hero = { key: "hero", stance: "offense", guardZone: "outer", range: 34, x: 820, y: 0, hp: 650 };

assert(getGuardRadiusLimit(guard, WALL_RADIUS) === WALL_RADIUS + GUARD_DEFEND_RADIUS_BONUS, "Burghalten-Radius ist falsch");
guard.guardZone = "outer";
assert(getGuardRadiusLimit(guard, WALL_RADIUS) === WALL_RADIUS + GUARD_OUTER_HOLD_RADIUS_BONUS, "Außenring-Radius ist falsch");
assert(getGuardRadiusLimit(hero, WALL_RADIUS) === WALL_RADIUS + GUARD_OFFENSE_RADIUS_BONUS, "Ausfallradius ist nicht bis 250 Einheiten über den äußeren Ring erweitert");

const outerLimit = getGuardRadiusLimit(guard, WALL_RADIUS);
const edgeEnemy = { hp: 100, radius: 12, x: outerLimit + 40, y: 0 };
const farEnemy = { hp: 100, radius: 12, x: outerLimit + getGuardMeleeReach(guard, edgeEnemy) + 20, y: 0 };
assert(isGuardTargetAllowed(guard, edgeEnemy, center), "Gegner in Nahkampfreichweite an der Bereichskante wird abgelehnt");
assert(!isGuardTargetAllowed(guard, farEnemy, center), "Zu weit außerhalb liegender Gegner wird fälschlich akzeptiert");

const offenseEnemy = { hp: 100, radius: 12, x: 830, y: 0 };
assert(isGuardTargetAllowed(hero, offenseEnemy, center), "Andreas erkennt Gegner im vorgesehenen Ausfallbereich nicht");
assert(findNearestGuardTarget(hero, [farEnemy, offenseEnemy], center) === offenseEnemy, "Ausfall-Zielsuche wählt das erreichbare Ziel nicht");

const archer = { key: "soldier", kind: "unit", hp: 145, x: 0, y: 0 };
const closeRaider = { type: "raider", hp: 100, radius: 14, x: 31, y: 0 };
const distantRaider = { type: "raider", hp: 100, radius: 14, x: 48, y: 0 };
assert(isEnemyDefenderInAttackRange(closeRaider, archer), "Normaler Nahkämpfer trifft bei echtem Kontakt nicht");
assert(!isEnemyDefenderInAttackRange(distantRaider, archer), "Normaler Nahkämpfer verursacht aus zu großer Distanz Schaden");

const spearHunter = { type: "spear", hp: 100, radius: 15, x: 68, y: 0 };
const spearGuard = { key: "guard", kind: "unit", stance: "defend", guardZone: "middle", hp: 180, x: 0, y: 0 };
assert(ENEMY_SPEAR_REACH_BONUS === 34, "Speerbonus wurde unerwartet verändert");
assert(isEnemyDefenderInAttackRange(spearHunter, spearGuard, { attackMode: "spear" }), "Speerjäger erreicht die vorgesehene zweite Reihe nicht");
assert(!isEnemyDefenderInAttackRange(spearHunter, archer), "Bogenschütze wird ohne Nahkontakt als normales Ziel getroffen");
const spearTarget = findNearestBlockingUnit([archer, spearGuard], spearHunter, {
  ...center,
  attackMode: "spear",
  unitFilter: unit => unit.key === "guard" || unit.key === "hero",
});
assert(spearTarget === spearGuard, "Speerjäger wählt im Fernstich keinen Bogenschützen");
const normalTarget = findNearestBlockingUnit([archer], distantRaider, { ...center, attackMode: "melee" });
assert(normalTarget === null, "Entfernter Nahkämpfer erhält fälschlich ein Angriffsziel");
const enemyRadii = { raider: 14, runner: 12, spear: 15, shield: 18, berserker: 17, boss: 25 };
for (const [type, radius] of Object.entries(enemyRadii)) {
  const probe = { type, hp: 100, radius, x: 0, y: 0 };
  const reach = getEnemyDefenderAttackReach(probe, archer);
  probe.x = reach - 0.5;
  assert(isEnemyDefenderInAttackRange(probe, archer), `${type} trifft bei echtem Körperkontakt nicht`);
  probe.x = reach + 4;
  assert(!isEnemyDefenderInAttackRange(probe, archer), `${type} verursacht außerhalb der Nahkampfreichweite Schaden`);
}

if (failures.length) {
  console.error("Kampfprüfung fehlgeschlagen:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Kampfprüfung erfolgreich: Verteidigerbereiche, Kontakt-Nahkampf und begrenzte Speerreichweite bestätigt.");
