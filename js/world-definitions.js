/**
 * Statische Definitionen aller Kampagnenwelten.
 *
 * Dieses Modul ist absichtlich unabhängig von Weltkarte, Kampagne, Savegame
 * und Hauptspiel. Weitere Systeme können die Definitionen daher importieren,
 * ohne zyklische Abhängigkeiten zu erzeugen.
 */

export const DEFAULT_WORLD_ID = "borderlands";

function defineWorld({ campaign, unlock, ...world }) {
  return Object.freeze({
    ...world,
    campaign: Object.freeze({
      finalWave: campaign?.finalWave !== null && campaign?.finalWave !== undefined && Number.isFinite(Number(campaign.finalWave))
        ? Math.max(1, Math.floor(Number(campaign.finalWave)))
        : null,
      bossWaves: Object.freeze(
        Array.isArray(campaign?.bossWaves)
          ? [...new Set(campaign.bossWaves.map(Number).filter(Number.isFinite))]
              .map(Math.floor)
              .filter((wave) => wave > 0)
              .sort((a, b) => a - b)
          : []
      ),
    }),
    unlock: Object.freeze(unlock || { type: "always" }),
  });
}

export const WORLD_DEFINITIONS = Object.freeze([
  defineWorld({
    id: DEFAULT_WORLD_ID,
    number: 1,
    icon: "🏰",
    name: "Die Grenzmark",
    subtitle: "Welt 1 · Die erste Festung",
    description: "Verteidige die grüne Grenzmark in 32 Wellen gegen die Eisenclans und entscheide danach über den Endlosmodus.",
    feature: "Ausgewogene Angriffe · klassische Eisenclan-Kampagne",
    status: "playable",
    layoutId: "classic-fortress-v1",
    campaign: { finalWave: 32, bossWaves: [8, 16, 24, 32] },
    unlock: { type: "always" },
  }),
  defineWorld({
    id: "mistwood",
    number: 2,
    icon: "🌲",
    name: "Der Nebelwald",
    subtitle: "Welt 2 · Verborgene Waldpfade",
    description: "Ein dichter Wald, in dem Nebel und versteckte Wege die Aufklärung erschweren.",
    feature: "Geplant: Nebel, Waldpfade und der Wolfsfürst",
    status: "construction",
    layoutId: "mistwood-future",
    campaign: { finalWave: null, bossWaves: [] },
    unlock: { type: "world-completed", worldId: DEFAULT_WORLD_ID },
  }),
  defineWorld({
    id: "frozen-pass",
    number: 3,
    icon: "❄️",
    name: "Der gefrorene Pass",
    subtitle: "Welt 3 · Eisige Gebirgsfestung",
    description: "Ein verschneiter Pass mit vereisten Wegen und schweren Schildformationen.",
    feature: "Geplant: Frost, Lagerfeuer und der Frostriese",
    status: "construction",
    layoutId: "frozen-pass-future",
    campaign: { finalWave: null, bossWaves: [] },
    unlock: { type: "world-completed", worldId: "mistwood" },
  }),
  defineWorld({
    id: "scorched-plains",
    number: 4,
    icon: "🔥",
    name: "Die verbrannten Ebenen",
    subtitle: "Welt 4 · Krieg im Flammenland",
    description: "Eine verwüstete Ebene mit Feuerangriffen, knappen Holzvorräten und mächtigen Belagerungswaffen.",
    feature: "Geplant: Brände und der Flammenhäuptling",
    status: "construction",
    layoutId: "scorched-plains-future",
    campaign: { finalWave: null, bossWaves: [] },
    unlock: { type: "world-completed", worldId: "frozen-pass" },
  }),
  defineWorld({
    id: "ironclan-heart",
    number: 5,
    icon: "🌋",
    name: "Das Herz des Eisenclans",
    subtitle: "Welt 5 · Das letzte Reich",
    description: "Die vulkanische Heimat der Eisenclans und das zukünftige Finale der großen Weltkampagne.",
    feature: "Geplant: Elitearmeen und der Hochkönig",
    status: "construction",
    layoutId: "ironclan-heart-future",
    campaign: { finalWave: null, bossWaves: [] },
    unlock: { type: "world-completed", worldId: "scorched-plains" },
  }),
]);

const WORLD_BY_ID = new Map(WORLD_DEFINITIONS.map((world) => [world.id, world]));

export function isKnownWorldId(worldId) {
  return typeof worldId === "string" && WORLD_BY_ID.has(worldId);
}

export function getWorldDefinition(worldId, { fallback = true } = {}) {
  return WORLD_BY_ID.get(worldId) || (fallback ? WORLD_BY_ID.get(DEFAULT_WORLD_ID) : null);
}

export function normalizeWorldId(worldId, fallback = DEFAULT_WORLD_ID) {
  return isKnownWorldId(worldId) ? worldId : fallback;
}

export function isWorldUnlocked(worldOrId, progressByWorld = {}) {
  const world = typeof worldOrId === "string"
    ? getWorldDefinition(worldOrId, { fallback: false })
    : worldOrId;
  if (!world) return false;
  if (world.unlock?.type === "always") return true;
  if (world.unlock?.type === "world-completed") {
    return progressByWorld?.[world.unlock.worldId]?.completed === true;
  }
  return false;
}
