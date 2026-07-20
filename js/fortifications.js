/**
 * Bauzustand und Geometrie der Festungsringe.
 *
 * v1.14.5 verwaltet zwei getrennte Verteidigungslinien:
 * - der feste innere Steinring besteht aus acht echten Segmenten,
 * - die mittlere Holzpalisade bleibt in vier Vierteln baubar.
 */

export const INNER_WALL_SEGMENT_COUNT = 8;
export const INNER_WALL_MAX_HP = 360;
export const INNER_WALL_GATE_GAP = 0.13;
export const INNER_WALL_DIVIDER_GAP = 0.025;

export const MIDDLE_WALL_SECTION_COUNT = 4;
export const MIDDLE_WALL_BUILD_WOOD = 45;

const SECTION_NAMES = [
  "Nordost",
  "Südost",
  "Südwest",
  "Nordwest",
];

function normalizeSectionIndex(index) {
  const numeric = Number(index);
  if (!Number.isInteger(numeric)) return -1;
  return numeric >= 0 && numeric < MIDDLE_WALL_SECTION_COUNT ? numeric : -1;
}

function normalizeAngleFromNorth(angle) {
  let result = Number(angle) + Math.PI / 2;
  const tau = Math.PI * 2;
  while (result < 0) result += tau;
  while (result >= tau) result -= tau;
  return result;
}

export function createInnerWallSegments({ maxHp = INNER_WALL_MAX_HP } = {}) {
  const walls = [];

  for (let quarterIndex = 0; quarterIndex < 4; quarterIndex++) {
    const quarterStart = -Math.PI / 2 + quarterIndex * Math.PI / 2;
    const quarterEnd = quarterStart + Math.PI / 2;
    const middle = (quarterStart + quarterEnd) / 2;
    const ranges = [
      [quarterStart + INNER_WALL_GATE_GAP, middle - INNER_WALL_DIVIDER_GAP],
      [middle + INNER_WALL_DIVIDER_GAP, quarterEnd - INNER_WALL_GATE_GAP],
    ];

    ranges.forEach(([a0, a1], segmentInQuarter) => {
      const i = quarterIndex * 2 + segmentInQuarter;
      walls.push({
        kind: "wall",
        ring: "inner",
        i,
        quarterIndex,
        segmentInQuarter,
        name: `${SECTION_NAMES[quarterIndex]} · Segment ${segmentInQuarter + 1}`,
        a0,
        a1,
        am: (a0 + a1) / 2,
        built: true,
        hp: maxHp,
        maxHp,
      });
    });
  }

  return walls;
}

export function initializeInnerWallSegments(innerWalls, { fullHealth = true } = {}) {
  for (const wall of innerWalls || []) {
    wall.kind = "wall";
    wall.ring = "inner";
    wall.built = true;
    wall.hp = fullHealth ? wall.maxHp : Math.max(0, Number(wall.hp) || 0);
  }
}

export function getInnerWallSegmentIndexForAngle(angle) {
  const normalized = normalizeAngleFromNorth(angle);
  const quarterSpan = Math.PI / 2;
  const quarterIndex = Math.min(3, Math.floor(normalized / quarterSpan));
  const local = normalized - quarterIndex * quarterSpan;
  const segmentInQuarter = local < quarterSpan / 2 ? 0 : 1;
  return quarterIndex * 2 + segmentInQuarter;
}

export function getInnerWallSegmentForPoint(state, x, y, { CX, CY }) {
  const index = getInnerWallSegmentIndexForAngle(Math.atan2(y - CY, x - CX));
  return state?.innerWalls?.[index] || null;
}

export function hitTestInnerWallSegment(
  x,
  y,
  { CX, CY, radius, tolerance = 25 }
) {
  const dx = x - CX;
  const dy = y - CY;
  if (Math.abs(Math.hypot(dx, dy) - radius) > tolerance) return null;

  const index = getInnerWallSegmentIndexForAngle(Math.atan2(dy, dx));
  return {
    type: "inner-wall",
    index,
    label: `Innerer Mauerring · Segment ${index + 1}`,
  };
}

export function getMiddleWallSectionName(index) {
  return SECTION_NAMES[normalizeSectionIndex(index)] || "Unbekannt";
}

export function getMiddleWallSectionIndexForSegment(segmentIndex, segmentCount) {
  const count = Math.max(MIDDLE_WALL_SECTION_COUNT, Number(segmentCount) || 0);
  const index = Math.max(0, Math.min(count - 1, Number(segmentIndex) || 0));
  return Math.min(
    MIDDLE_WALL_SECTION_COUNT - 1,
    Math.floor(index / (count / MIDDLE_WALL_SECTION_COUNT))
  );
}

export function getMiddleWallSectionWalls(state, sectionIndex) {
  const index = normalizeSectionIndex(sectionIndex);
  if (index < 0 || !Array.isArray(state?.walls)) return [];

  return state.walls.filter(
    (wall) =>
      getMiddleWallSectionIndexForSegment(wall.i, state.walls.length) === index
  );
}

export function isMiddleWallSectionBuilt(state, sectionIndex) {
  const walls = getMiddleWallSectionWalls(state, sectionIndex);
  return walls.length > 0 && walls.every((wall) => wall.built === true);
}

export function isMiddleWallSectionDestroyed(state, sectionIndex) {
  const walls = getMiddleWallSectionWalls(state, sectionIndex);
  return (
    walls.length > 0 &&
    walls.every((wall) => wall.built === true && Number(wall.hp) <= 0)
  );
}

export function getBuiltMiddleWallSectionCount(state) {
  let count = 0;
  for (let index = 0; index < MIDDLE_WALL_SECTION_COUNT; index++) {
    if (isMiddleWallSectionBuilt(state, index) && !isMiddleWallSectionDestroyed(state, index)) {
      count++;
    }
  }
  return count;
}

export function initializeMiddleWallSegments(walls, { built = false } = {}) {
  for (const wall of walls || []) {
    wall.kind = "wall";
    wall.ring = "middle";
    wall.built = Boolean(built);
    wall.hp = built ? wall.maxHp : 0;
  }
}

export function getMiddleWallSectionStatus(state, sectionIndex) {
  const index = normalizeSectionIndex(sectionIndex);
  const walls = getMiddleWallSectionWalls(state, index);
  const status = {
    kind: "wall-section",
    ring: "middle",
    index,
    sectionIndex: index,
    name: getMiddleWallSectionName(index),
    walls,
  };

  Object.defineProperties(status, {
    maxHp: {
      enumerable: true,
      get: () => walls.reduce(
        (sum, wall) => sum + Math.max(0, Number(wall.maxHp) || 0),
        0
      ),
    },
    hp: {
      enumerable: true,
      get: () => walls.reduce(
        (sum, wall) => sum + Math.max(0, Number(wall.hp) || 0),
        0
      ),
    },
    built: {
      enumerable: true,
      get: () => walls.length > 0 && walls.every((wall) => wall.built === true),
    },
    destroyed: {
      enumerable: true,
      get: () =>
        walls.length > 0 &&
        walls.every((wall) => wall.built === true) &&
        walls.every((wall) => Number(wall.hp) <= 0),
    },
  });

  return status;
}

export function hitTestMiddleWallSection(
  x,
  y,
  { CX, CY, WALL_R, tolerance = 38 }
) {
  const dx = x - CX;
  const dy = y - CY;
  const radius = Math.hypot(dx, dy);
  if (Math.abs(radius - WALL_R) > tolerance) return null;

  let angle = Math.atan2(dy, dx);
  if (angle < -Math.PI / 2) angle += Math.PI * 2;
  const sectionIndex = Math.min(
    MIDDLE_WALL_SECTION_COUNT - 1,
    Math.floor((angle + Math.PI / 2) / (Math.PI / 2))
  );

  return {
    type: "middle-wall",
    sectionIndex,
    label: getMiddleWallSectionName(sectionIndex),
  };
}

export function buildMiddleWallSectionAt(x, y, context) {
  const { state, CX, CY, WALL_R, showToast, setBuildMode, setSelected } = context;
  const hit = hitTestMiddleWallSection(x, y, { CX, CY, WALL_R, tolerance: 48 });

  if (!hit) {
    showToast("Holzpalisade auf einem markierten Abschnitt des mittleren Rings errichten");
    return false;
  }
  if (state.inWave) {
    showToast("Mauerbau ist nur während der Belagerungsphase möglich");
    return false;
  }

  const status = getMiddleWallSectionStatus(state, hit.sectionIndex);
  if (status.built && !status.destroyed) {
    showToast(`Palisadenabschnitt ${status.name} steht bereits`);
    return false;
  }
  if (state.wood < MIDDLE_WALL_BUILD_WOOD) {
    showToast(`Benötigt ${MIDDLE_WALL_BUILD_WOOD} Holz`);
    return false;
  }

  const rebuilding = status.destroyed;
  state.wood -= MIDDLE_WALL_BUILD_WOOD;
  for (const wall of status.walls) {
    wall.built = true;
    wall.hp = wall.maxHp;
  }

  const selection = getMiddleWallSectionStatus(state, hit.sectionIndex);
  setBuildMode(null);
  setSelected(selection);
  showToast(
    rebuilding
      ? `Palisadenabschnitt ${status.name} neu errichtet`
      : `Palisadenabschnitt ${status.name} errichtet`
  );
  return true;
}
