/**
 * Kampfsystem von Fortress Commander.
 *
 * Das Modul verwaltet Zielsuche, Projektilerzeugung sowie Erfahrungs-
 * und Talentaufwertungen. Spielzustand und UI-Rückmeldungen werden von
 * main.js übergeben, damit dieses Modul keinen globalen Zustand benötigt.
 */

export function findNearestEnemy(enemies, x, y, range) {
  let best = null;
  let bestDistanceSquared = range * range;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const distanceSquared = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      best = enemy;
    }
  }

  return best;
}

export function getEffectiveEnemyArmor(enemy) {
  const baseArmor = Math.max(0, Number(enemy?.armor) || 0);
  const auraArmor = enemy?.bossAura ? 0.08 : 0;
  const moralePenalty = (Number(enemy?.moraleBreakTime) || 0) > 0 ? 0.08 : 0;
  const breakAmount = (Number(enemy?.armorBreakTime) || 0) > 0
    ? Math.max(0, Number(enemy?.armorBreakAmount) || 0)
    : 0;
  return Math.max(0, baseArmor + auraArmor - moralePenalty - breakAmount);
}

export function getEffectiveEnemySpeed(enemy) {
  const baseSpeed = Math.max(0, Number(enemy?.speed) || 0);
  const slowAmount = (Number(enemy?.slowTime) || 0) > 0
    ? Math.max(0, Math.min(0.75, Number(enemy?.slowAmount) || 0))
    : 0;
  const rageMultiplier = enemy?.type === "berserker" && Number(enemy?.hp) > 0 && Number(enemy?.hp) <= Number(enemy?.maxHp) * 0.5 ? 1.3 : 1;
  const auraMultiplier = enemy?.bossAura ? 1.1 : 1;
  const moraleMultiplier = (Number(enemy?.moraleBreakTime) || 0) > 0 ? 0.8 : 1;
  return baseSpeed * (1 - slowAmount) * rageMultiplier * auraMultiplier * moraleMultiplier;
}

export function findTowerTarget(enemies, tower, range) {
  let best = null;
  let bestScore = Infinity;
  const maxDistanceSquared = range * range;

  for (const enemy of enemies || []) {
    if (!enemy || enemy.hp <= 0) continue;
    const distanceSquared = (enemy.x - tower.slot.x) ** 2 + (enemy.y - tower.slot.y) ** 2;
    if (distanceSquared > maxDistanceSquared) continue;

    const distance = Math.sqrt(distanceSquared);
    let score = distance;
    if (tower.key === "archer") {
      if (tower.specialization === "hunter") {
        if (["shield", "berserker", "boss"].includes(enemy.type)) score -= 300;
        else if (enemy.type === "runner" || enemy.type === "raider") score -= 80;
      } else if (enemy.type === "runner" || enemy.type === "raider") {
        score -= 190;
      }
      if (getEffectiveEnemyArmor(enemy) >= 0.15) score += tower.specialization === "hunter" ? 20 : 85;
    } else if (tower.key === "crossbow") {
      score -= getEffectiveEnemyArmor(enemy) * 820;
      if (["shield", "berserker", "boss"].includes(enemy.type)) score -= 170;
      if (tower.specialization === "executioner" && Number(enemy.maxHp) > 0) {
        score -= Math.max(0, 0.4 - Number(enemy.hp) / Number(enemy.maxHp)) * 1200;
      }
    } else if (tower.key === "catapult") {
      const splashMultiplier = tower.specialization === "fragmentation" ? 1.45 : tower.specialization === "breaker" ? 0.7 : 1;
      const splashRadius = (tower.splash || 62) * splashMultiplier;
      const cluster = (enemies || []).reduce((count, candidate) => {
        if (!candidate || candidate.hp <= 0) return count;
        return count + (Math.hypot(candidate.x - enemy.x, candidate.y - enemy.y) <= splashRadius ? 1 : 0);
      }, 0);
      score -= Math.min(7, cluster) * 42;
      if (tower.specialization === "breaker" && ["shield", "berserker", "boss"].includes(enemy.type)) score -= 130;
    }

    if (score < bestScore) {
      bestScore = score;
      best = enemy;
    }
  }

  return best;
}

export function findNearestUnit(units, x, y, range) {
  let best = null;
  let bestDistanceSquared = range * range;

  for (const unit of units) {
    if (unit.hp <= 0) continue;
    const distanceSquared = (unit.x - x) ** 2 + (unit.y - y) ** 2;
    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      best = unit;
    }
  }

  return best;
}

export function getTargetCapacity(enemy) {
  if (enemy.type === "boss") return 5;
  if (enemy.type === "shield") return 2;
  return 1;
}

export function countAssignedUnits(units, enemy, exceptUnit = null) {
  let count = 0;

  for (const unit of units) {
    if (unit === exceptUnit || unit.hp <= 0 || unit.controlMode !== "auto") continue;
    if (unit.autoTarget === enemy) count++;
  }

  return count;
}

export function getTowerCoverage(buildings, enemy) {
  let coverage = 0;
  let strongCoverage = 0;

  for (const building of buildings) {
    if (building.base.kind !== "tower" || building.hp <= 0) continue;

    const distance = Math.hypot(
      enemy.x - building.slot.x,
      enemy.y - building.slot.y
    );

    if (distance <= building.range) {
      coverage++;
      const readiness = Math.max(
        0,
        1 - (building.cooldown || 0) / Math.max(0.1, building.rate)
      );
      strongCoverage += 0.45 + readiness * 0.55 + (building.splash ? 0.35 : 0);
    }
  }

  return { coverage, strongCoverage };
}

export function chooseAutomaticTarget(
  unit,
  { enemies, units, buildings, centerX, centerY }
) {
  let best = null;
  let bestScore = Infinity;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const assigned = countAssignedUnits(units, enemy, unit);
    const capacity = getTargetCapacity(enemy);
    const distance = Math.hypot(enemy.x - unit.x, enemy.y - unit.y);
    const overload = Math.max(0, assigned - capacity + 1);
    const cover = getTowerCoverage(buildings, enemy);
    const towerPenalty = cover.coverage * 1050 + cover.strongCoverage * 620;
    const dangerBonus = enemy.phase !== "outside" ? -720 : 0;
    const nearCastleBonus = Math.max(
      0,
      520 - Math.hypot(enemy.x - centerX, enemy.y - centerY)
    ) * 0.9;
    const priority = unit?.targetPriority || "nearest";
    const priorityBonus = priority === "fast"
      ? -(Number(enemy.speed) || 0) * 18
      : priority === "strong"
        ? -((Number(enemy.maxHp) || Number(enemy.hp) || 0) * 0.42 + getEffectiveEnemyArmor(enemy) * 720 + (enemy.boss ? 520 : 0))
        : 0;
    const score =
      (assigned / capacity) * 900 +
      overload * 1800 +
      distance +
      towerPenalty +
      dangerBonus -
      nearCastleBonus +
      priorityBonus;

    if (score < bestScore) {
      bestScore = score;
      best = enemy;
    }
  }

  return best;
}

export function getTowerBehindWall(wallSlots, index) {
  const slot = wallSlots[index];
  return slot &&
    slot.building &&
    slot.building.base.kind === "tower" &&
    slot.building.hp > 0
    ? slot.building
    : null;
}

export function findNearestCastleTower(buildings, enemy) {
  let best = null;
  let bestDistanceSquared = Infinity;

  for (const building of buildings) {
    if (
      building.base.kind !== "tower" ||
      building.slot.type !== "castle" ||
      building.hp <= 0
    ) {
      continue;
    }

    const distanceSquared =
      (building.slot.x - enemy.x) ** 2 +
      (building.slot.y - enemy.y) ** 2;

    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      best = building;
    }
  }

  return best;
}


export const GUARD_DEFEND_RADIUS_BONUS = 135;
export const GUARD_OUTER_HOLD_RADIUS_BONUS = 235;

export function isMeleeDefender(unit) {
  return Boolean(unit && (unit.key === "guard" || unit.key === "hero"));
}

export function getGuardRadiusLimit(unit, wallRadius) {
  if (!isMeleeDefender(unit)) return wallRadius + GUARD_DEFEND_RADIUS_BONUS;
  if (unit.stance === "offense") return wallRadius + 330;
  const zone = unit.guardZone || "middle";
  return wallRadius + (zone === "outer" ? GUARD_OUTER_HOLD_RADIUS_BONUS : GUARD_DEFEND_RADIUS_BONUS);
}

export function isGuardTargetAllowed(
  unit,
  enemy,
  { centerX, centerY, wallRadius }
) {
  if (!isMeleeDefender(unit) || !enemy || enemy.hp <= 0) return false;

  const enemyCenterRadius = Math.hypot(enemy.x - centerX, enemy.y - centerY);
  return enemyCenterRadius <= getGuardRadiusLimit(unit, wallRadius);
}

export function findNearestGuardTarget(
  unit,
  enemies,
  { centerX, centerY, wallRadius }
) {
  let best = null;
  let bestDistanceSquared = Infinity;

  for (const enemy of enemies || []) {
    if (!isGuardTargetAllowed(unit, enemy, { centerX, centerY, wallRadius })) {
      continue;
    }
    const distanceSquared = (enemy.x - unit.x) ** 2 + (enemy.y - unit.y) ** 2;
    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      best = enemy;
    }
  }

  return best;
}

export function getGuardMeleeReach(unit, enemy) {
  const unitRange = Math.max(0, Number(unit?.range) || 0);
  const enemyRadius = Math.max(8, Number(enemy?.radius) || 12);
  return Math.max(48, unitRange + enemyRadius + 10);
}

export function resolveGuardEnemyOverlap(
  unit,
  enemy,
  { centerX, centerY, wallRadius }
) {
  if (!isMeleeDefender(unit) || !enemy) return false;

  let dx = unit.x - enemy.x;
  let dy = unit.y - enemy.y;
  const overlapDistance = Math.hypot(dx, dy);
  const minimumDistance = Math.max(24, (Number(enemy.radius) || 12) + 15);
  if (overlapDistance >= minimumDistance) return false;

  // Bei exakt gleicher Position wird die Wache radial zur Burgmitte
  // zurückgeschoben. Dadurch bleiben beide Figuren sichtbar getrennt und
  // die Nahkampfentfernung kann stabil ausgewertet werden.
  let directionLength = overlapDistance;
  if (directionLength < 0.001) {
    dx = centerX - enemy.x;
    dy = centerY - enemy.y;
    directionLength = Math.hypot(dx, dy);
    if (directionLength < 0.001) {
      dx = 1;
      dy = 0;
      directionLength = 1;
    }
  }

  const push = minimumDistance - overlapDistance;
  unit.x += (dx / directionLength) * push;
  unit.y += (dy / directionLength) * push;

  if (unit.stance !== "offense") {
    const ux = unit.x - centerX;
    const uy = unit.y - centerY;
    const unitRadius = Math.hypot(ux, uy);
    const maximumRadius = getGuardRadiusLimit(unit, wallRadius) - 10;
    if (unitRadius > maximumRadius) {
      unit.x = centerX + (ux / unitRadius) * maximumRadius;
      unit.y = centerY + (uy / unitRadius) * maximumRadius;
    }
  }

  return true;
}

export function findNearestBlockingUnit(
  units,
  enemy,
  { centerX, centerY, wallRadius, maxRange = 58 }
) {
  let best = null;
  let bestDistanceSquared = maxRange * maxRange;

  for (const unit of units) {
    if (unit.hp <= 0) continue;

    if (isMeleeDefender(unit) && !isGuardTargetAllowed(unit, enemy, {
      centerX,
      centerY,
      wallRadius,
    })) {
      continue;
    }

    const distanceSquared = (unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2;
    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      best = unit;
    }
  }

  return best;
}

export function resolveEnemySeparation(
  enemies,
  dt,
  { interval = 0.075, cellSize = 52, maxPush = 3.6 } = {}
) {
  const active = (enemies || []).filter((enemy) => enemy && enemy.hp > 0);
  if (active.length < 2) return 0;

  const elapsed = Math.max(0, Number(dt) || 0);
  const owner = active[0];
  owner._separationClock = (Number(owner._separationClock) || 0) + elapsed;
  if (owner._separationClock < interval) return 0;
  const stepTime = Math.min(0.2, owner._separationClock);
  owner._separationClock = 0;

  const grid = new Map();
  const keyFor = (x, y) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
  for (const enemy of active) {
    enemy._ghostTime = Math.max(0, (Number(enemy._ghostTime) || 0) - stepTime);
    const key = keyFor(enemy.x, enemy.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(enemy);
  }

  let pairs = 0;
  for (const enemy of active) {
    const gx = Math.floor(enemy.x / cellSize);
    const gy = Math.floor(enemy.y / cellSize);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const neighbours = grid.get(`${gx + ox},${gy + oy}`) || [];
        for (const other of neighbours) {
          if ((Number(other.eid) || 0) <= (Number(enemy.eid) || 0)) continue;
          let dx = other.x - enemy.x;
          let dy = other.y - enemy.y;
          let distance = Math.hypot(dx, dy);
          const ghostFactor = enemy._ghostTime > 0 || other._ghostTime > 0 ? 0.48 : 1;
          const minimum = Math.max(14, ((Number(enemy.radius) || 12) + (Number(other.radius) || 12)) * 0.82 * ghostFactor);
          if (distance >= minimum) continue;
          if (distance < 0.001) {
            const angle = (((Number(enemy.eid) || 1) * 2.399963) % (Math.PI * 2));
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            distance = 1;
          }
          const overlap = Math.min(maxPush, (minimum - distance) * 0.34);
          const nx = dx / distance;
          const ny = dy / distance;
          const enemyWeight = enemy.type === "boss" ? 0.18 : enemy.type === "shield" ? 0.38 : 0.5;
          const otherWeight = other.type === "boss" ? 0.18 : other.type === "shield" ? 0.38 : 0.5;
          enemy.x -= nx * overlap * enemyWeight;
          enemy.y -= ny * overlap * enemyWeight;
          other.x += nx * overlap * otherWeight;
          other.y += ny * overlap * otherWeight;
          pairs++;
        }
      }
    }
  }

  for (const enemy of active) {
    const previousX = Number.isFinite(enemy._progressX) ? enemy._progressX : enemy.x;
    const previousY = Number.isFinite(enemy._progressY) ? enemy._progressY : enemy.y;
    const moved = Math.hypot(enemy.x - previousX, enemy.y - previousY);
    const intentionallyWaiting = enemy.queueWaiting === true || (Number(enemy.attackAnim) || 0) > 0;
    enemy._stuckTime = intentionallyWaiting || moved > 0.9
      ? 0
      : (Number(enemy._stuckTime) || 0) + stepTime;
    if (enemy._stuckTime > 1.7) {
      enemy._ghostTime = 0.9;
      enemy._stuckTime = 0;
      const angle = (((Number(enemy.eid) || 1) * 1.618034) % (Math.PI * 2));
      enemy.x += Math.cos(angle) * 4;
      enemy.y += Math.sin(angle) * 4;
    }
    enemy._progressX = enemy.x;
    enemy._progressY = enemy.y;
  }

  return pairs;
}

export function createProjectile(
  projectiles,
  from,
  target,
  damage,
  speed,
  splash = 0,
  color = "#f0d176",
  effects = null
) {
  const x = from.slot ? from.slot.x : from.x;
  const y = from.slot ? from.slot.y : from.y;

  projectiles.push({
    x,
    y,
    target,
    damage,
    speed,
    splash,
    color,
    radius: splash ? 6 : 3,
    armorPenetration: Math.max(0, Math.min(1, Number(effects?.armorPenetration) || 0)),
    armorBreakAmount: Math.max(0, Number(effects?.armorBreakAmount) || 0),
    armorBreakDuration: Math.max(0, Number(effects?.armorBreakDuration) || 0),
    slowAmount: Math.max(0, Math.min(0.75, Number(effects?.slowAmount) || 0)),
    slowDuration: Math.max(0, Number(effects?.slowDuration) || 0),
    primaryTargetMultiplier: Math.max(0, Number(effects?.primaryTargetMultiplier) || 1),
    owner:
      from &&
      (from.kind === "unit" ||
        (from.kind === "building" && from.base.kind === "tower"))
        ? from
        : null,
  });
}

export function grantTowerExperience(
  tower,
  amount,
  { burst, isSelected, showToast }
) {
  if (
    !tower ||
    tower.kind !== "building" ||
    tower.base.kind !== "tower" ||
    tower.hp <= 0 ||
    amount <= 0
  ) {
    return;
  }

  tower.xp = (tower.xp || 0) + amount;
  tower.xpMax = tower.xpMax || 90;

  while (tower.xp >= tower.xpMax) {
    tower.xp -= tower.xpMax;
    tower.expLevel = (tower.expLevel || 1) + 1;
    tower.pendingUpgrades = (tower.pendingUpgrades || 0) + 1;
    tower.xpMax = Math.round(tower.xpMax * 1.3 + 18);
    burst(tower.slot.x, tower.slot.y, "#58aaff", 20);
    if (isSelected(tower)) {
      showToast(`${tower.base.name}: EXP-Aufwertung bereit`);
    }
  }
}

export function grantUnitExperience(
  unit,
  amount,
  { burst, isSelected, showToast }
) {
  if (!unit || unit.hp <= 0 || amount <= 0) return;

  unit.xp = (unit.xp || 0) + amount;

  while (unit.xp >= unit.xpMax) {
    unit.xp -= unit.xpMax;
    unit.expLevel = (unit.expLevel || 1) + 1;
    unit.pendingUpgrades = (unit.pendingUpgrades || 0) + 1;
    unit.xpMax = Math.round(unit.xpMax * 1.28 + 12);
    burst(unit.x, unit.y, "#58aaff", 18);
    if (isSelected(unit)) {
      showToast("Aufwertung bereit – im Kreismenü auswählen");
    }
  }
}

export function grantCombatExperience(owner, amount, callbacks) {
  if (!owner || amount <= 0) return;

  if (owner.kind === "unit") {
    grantUnitExperience(owner, amount, callbacks);
  } else if (owner.kind === "building" && owner.base.kind === "tower") {
    grantTowerExperience(owner, amount, callbacks);
  }
}

export function applyTowerTalent(tower, type, { burst, showToast }) {
  if (
    !tower ||
    tower.base.kind !== "tower" ||
    (tower.pendingUpgrades || 0) <= 0
  ) {
    return false;
  }

  tower.expUpgradeStats = tower.expUpgradeStats || {
    damage: 0,
    range: 0,
    rate: 0,
    health: 0,
  };

  if (type === "damage") {
    tower.damage *= 1.2;
    tower.expUpgradeStats.damage++;
    showToast("Turmschaden um 20% verbessert");
  }

  if (type === "range") {
    tower.range *= 1.1;
    tower.expUpgradeStats.range++;
    showToast("Turmreichweite um 10% verbessert");
  }

  if (type === "rate") {
    tower.rate = Math.max(0.2, tower.rate * 0.88);
    tower.expUpgradeStats.rate++;
    showToast("Nachladezeit um 12% verkürzt");
  }

  if (type === "health") {
    const gain = tower.maxHp * 0.22;
    tower.maxHp += gain;
    tower.hp = Math.min(tower.maxHp, tower.hp + gain);
    tower.expUpgradeStats.health++;
    showToast("Turmleben um 22% verbessert");
  }

  tower.pendingUpgrades--;
  burst(tower.slot.x, tower.slot.y, "#78cfff", 16);
  return true;
}

export function applyUnitTalentUpgrade(unit, type, { burst, showToast }) {
  if (!unit || unit.pendingUpgrades <= 0) return false;

  if (type === "damage") {
    unit.damage *= 1.24;
    unit.upgradeStats.damage++;
    showToast("Schaden verbessert");
  }

  if (type === "health") {
    const gain = unit.maxHp * 0.28;
    unit.maxHp += gain;
    unit.hp = Math.min(unit.maxHp, unit.hp + gain);
    unit.upgradeStats.health++;
    showToast("Leben verbessert");
  }

  if (type === "speed") {
    unit.speed *= 1.16;
    unit.upgradeStats.speed++;
    showToast("Geschwindigkeit verbessert");
  }

  if (type === "rate") {
    unit.rate = Math.max(0.24, unit.rate * 0.84);
    unit.upgradeStats.rate++;
    showToast("Schussfrequenz verbessert");
  }

  if (type === "range") {
    unit.range *= 1.12;
    unit.upgradeStats.range = (unit.upgradeStats.range || 0) + 1;
    showToast("Reichweite verbessert");
  }

  unit.pendingUpgrades--;
  burst(unit.x, unit.y, "#7fc4ff", 14);
  return true;
}
