/**
 * Bauzustand und Geometrie der Festungsringe.
 *
 * v1.14.6 verwaltet zwei aktive Verteidigungslinien:
 * - der feste innere Steinring besteht aus acht echten Segmenten,
 * - die mittlere Holzpalisade besteht aus zwanzig einzeln baubaren Segmenten.
 */

export const INNER_WALL_SEGMENT_COUNT = 8;
export const INNER_WALL_MAX_HP = 360;
export const INNER_WALL_GATE_GAP = 0.13;
export const INNER_WALL_DIVIDER_GAP = 0.025;

export const MIDDLE_WALL_SECTION_COUNT = 4;
export const MIDDLE_WALL_SEGMENTS_PER_SECTION = 5;
export const MIDDLE_WALL_SEGMENT_COUNT =
  MIDDLE_WALL_SECTION_COUNT * MIDDLE_WALL_SEGMENTS_PER_SECTION;
export const MIDDLE_WALL_BUILD_WOOD = 5;

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

function normalizeSegmentIndex(index, segmentCount = MIDDLE_WALL_SEGMENT_COUNT) {
  const numeric = Number(index);
  const count = Math.max(1, Number(segmentCount) || MIDDLE_WALL_SEGMENT_COUNT);
  if (!Number.isInteger(numeric)) return -1;
  return numeric >= 0 && numeric < count ? numeric : -1;
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

export function getMiddleWallSegmentInSection(segmentIndex, segmentCount) {
  const count = Math.max(MIDDLE_WALL_SECTION_COUNT, Number(segmentCount) || 0);
  const index = Math.max(0, Math.min(count - 1, Number(segmentIndex) || 0));
  const perSection = count / MIDDLE_WALL_SECTION_COUNT;
  return Math.floor(index % perSection);
}

export function getMiddleWallSegmentName(
  segmentIndex,
  segmentCount = MIDDLE_WALL_SEGMENT_COUNT
) {
  const index = normalizeSegmentIndex(segmentIndex, segmentCount);
  if (index < 0) return "Unbekannt";
  const sectionIndex = getMiddleWallSectionIndexForSegment(index, segmentCount);
  const segmentInSection = getMiddleWallSegmentInSection(index, segmentCount);
  return `${getMiddleWallSectionName(sectionIndex)} · Segment ${segmentInSection + 1}`;
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
    if (
      isMiddleWallSectionBuilt(state, index) &&
      !isMiddleWallSectionDestroyed(state, index)
    ) {
      count++;
    }
  }
  return count;
}

export function getBuiltMiddleWallSegmentCount(state) {
  return (state?.walls || []).filter(
    (wall) => wall.built === true && Number(wall.hp) > 0
  ).length;
}

export function initializeMiddleWallSegments(walls, { built = false } = {}) {
  const count = walls?.length || MIDDLE_WALL_SEGMENT_COUNT;
  for (const wall of walls || []) {
    wall.kind = "wall";
    wall.ring = "middle";
    wall.name = getMiddleWallSegmentName(wall.i, count);
    wall.quarterIndex = getMiddleWallSectionIndexForSegment(wall.i, count);
    wall.segmentInQuarter = getMiddleWallSegmentInSection(wall.i, count);
    wall.built = Boolean(built);
    wall.hp = built ? wall.maxHp : 0;
  }
}

export function getMiddleWallSegmentStatus(state, segmentIndex) {
  const index = normalizeSegmentIndex(segmentIndex, state?.walls?.length);
  if (index < 0) return null;
  const wall = state.walls[index];
  if (!wall) return null;
  wall.name = wall.name || getMiddleWallSegmentName(index, state.walls.length);
  return wall;
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

export function getMiddleWallSegmentIndexForAngle(
  angle,
  segmentCount = MIDDLE_WALL_SEGMENT_COUNT
) {
  const count = Math.max(1, Number(segmentCount) || MIDDLE_WALL_SEGMENT_COUNT);
  const normalized = normalizeAngleFromNorth(angle);
  return Math.min(count - 1, Math.floor(normalized / (Math.PI * 2 / count)));
}

export function hitTestMiddleWallSegment(
  x,
  y,
  { CX, CY, WALL_R, segmentCount = MIDDLE_WALL_SEGMENT_COUNT, tolerance = 38 }
) {
  const dx = x - CX;
  const dy = y - CY;
  const radius = Math.hypot(dx, dy);
  if (Math.abs(radius - WALL_R) > tolerance) return null;

  const index = getMiddleWallSegmentIndexForAngle(
    Math.atan2(dy, dx),
    segmentCount
  );
  return {
    type: "middle-wall",
    index,
    segmentIndex: index,
    sectionIndex: getMiddleWallSectionIndexForSegment(index, segmentCount),
    label: getMiddleWallSegmentName(index, segmentCount),
  };
}

// Kompatibler Viertel-Trefferbereich für ältere Aufrufer und Zukunftshinweise.
export function hitTestMiddleWallSection(
  x,
  y,
  { CX, CY, WALL_R, tolerance = 38 }
) {
  const hit = hitTestMiddleWallSegment(x, y, {
    CX,
    CY,
    WALL_R,
    tolerance,
  });
  if (!hit) return null;
  return {
    type: "middle-wall",
    sectionIndex: hit.sectionIndex,
    segmentIndex: hit.segmentIndex,
    index: hit.segmentIndex,
    label: hit.label,
  };
}

export function buildMiddleWallSegmentAt(x, y, context) {
  const { state, CX, CY, WALL_R, showToast, setBuildMode, setSelected } = context;
  const hit = hitTestMiddleWallSegment(x, y, {
    CX,
    CY,
    WALL_R,
    segmentCount: state.walls.length,
    tolerance: 48,
  });

  if (!hit) {
    showToast("Holzpalisade auf einem markierten Segment des mittleren Rings errichten");
    return false;
  }
  if (state.inWave) {
    showToast("Mauerbau ist nur während der Belagerungsphase möglich");
    return false;
  }

  const wall = getMiddleWallSegmentStatus(state, hit.segmentIndex);
  if (!wall) return false;
  if (wall.built && wall.hp > 0) {
    showToast(`Palisadensegment ${wall.name} steht bereits`);
    return false;
  }
  if (state.wood < MIDDLE_WALL_BUILD_WOOD) {
    showToast(`Benötigt ${MIDDLE_WALL_BUILD_WOOD} Holz`);
    return false;
  }

  const rebuilding = wall.built && wall.hp <= 0;
  state.wood -= MIDDLE_WALL_BUILD_WOOD;
  wall.built = true;
  wall.hp = wall.maxHp;

  setSelected(wall);
  const allBuilt = getBuiltMiddleWallSegmentCount(state) >= state.walls.length;
  if (allBuilt) setBuildMode(null);
  showToast(
    `${rebuilding ? "Palisadensegment neu errichtet" : "Palisadensegment errichtet"}: ${wall.name} · ${MIDDLE_WALL_BUILD_WOOD} Holz`
  );
  return true;
}

// Alias, damit ältere Importstellen nicht unvermittelt brechen.
export const buildMiddleWallSectionAt = buildMiddleWallSegmentAt;
