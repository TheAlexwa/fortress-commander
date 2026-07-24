import {
  GUARD_DEFEND_RADIUS_BONUS,
  GUARD_OUTER_HOLD_RADIUS_BONUS,
  GUARD_OFFENSE_RADIUS_BONUS,
  getGuardRadiusLimit,
  getGuardMeleeReach,
  isGuardTargetAllowed,
  findNearestGuardTarget,
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

if (failures.length) {
  console.error("Kampfprüfung fehlgeschlagen:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Kampfprüfung erfolgreich: Burghalten, Außenring, Ausfall und Rand-Nahkampf bestätigt.");
