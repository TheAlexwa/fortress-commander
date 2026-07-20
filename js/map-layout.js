/**
 * Geometrie der sichtbaren Ausbauplanung für den Festungsumbau.
 *
 * v1.14.8 ordnet die drei Verteidigungsringe klar:
 * - innerer Mauerring: acht feste, zerstörbare Steinsegmente,
 * - mittlerer Mauerring: zwanzig einzeln baubare Holzpalisaden-Segmente,
 * - äußerer Mauerring: spätere Ausbaustufe.
 */

export const FIXED_INNER_WALL_RADIUS = 132;
export const OUTER_WALL_OFFSET = 235;
export const OUTER_GATE_GAP = 0.16;

const CARDINAL_ANGLES = [
  -Math.PI / 2,
  0,
  Math.PI / 2,
  Math.PI,
];

function normalizeAngle(angle) {
  let result = angle;
  while (result <= -Math.PI) result += Math.PI * 2;
  while (result > Math.PI) result -= Math.PI * 2;
  return result;
}

function angleDistance(a, b) {
  return Math.abs(normalizeAngle(a - b));
}

function isInsideSegment(angle, gap) {
  return CARDINAL_ANGLES.every((cardinal) => angleDistance(angle, cardinal) > gap);
}

export function getFutureLayoutGeometry({ CX, CY, WALL_R }) {
  const outerRadius = WALL_R + OUTER_WALL_OFFSET;
  const gates = CARDINAL_ANGLES.map((angle, index) => ({
    x: CX + Math.cos(angle) * outerRadius,
    y: CY + Math.sin(angle) * outerRadius,
    angle,
    index,
    label: ["Nord", "Ost", "Süd", "West"][index],
  }));

  return {
    fixedInnerRadius: FIXED_INNER_WALL_RADIUS,
    middleRadius: WALL_R,
    outerRadius,
    gates,
  };
}

function pointInRotatedGate(x, y, gate) {
  const dx = x - gate.x;
  const dy = y - gate.y;
  const rotation = -(gate.angle + Math.PI / 2);
  const localX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
  const localY = dx * Math.sin(rotation) + dy * Math.cos(rotation);
  return Math.abs(localX) <= 50 && Math.abs(localY) <= 34;
}

export function hitTestFutureLayout(x, y, context) {
  const geometry = getFutureLayoutGeometry(context);

  for (const gate of geometry.gates) {
    if (pointInRotatedGate(x, y, gate)) {
      return { type: "outer-gate", index: gate.index, label: gate.label };
    }
  }

  const dx = x - context.CX;
  const dy = y - context.CY;
  const radius = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  if (
    Math.abs(radius - geometry.outerRadius) <= 24 &&
    isInsideSegment(angle, OUTER_GATE_GAP)
  ) {
    return { type: "outer-wall" };
  }

  return null;
}
