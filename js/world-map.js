/**
 * Globale Kampagnenkarte von Fortress Commander.
 *
 * In v1.17.0 ist nur die Grenzmark spielbar. Weitere Regionen werden bereits
 * sichtbar dargestellt, öffnen beim Antippen aber ausschließlich ihre
 * Vorschau mit dem Hinweis "Noch im Aufbau".
 */

export const WORLD_MAP_STORAGE_KEY = "fortressCommander.worldMap.v1";
export const ACTIVE_WORLD_ID = "borderlands";

export const WORLD_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: ACTIVE_WORLD_ID,
    number: 1,
    icon: "🏰",
    name: "Die Grenzmark",
    subtitle: "Welt 1 · Die erste Festung",
    description: "Verteidige die grüne Grenzmark in 32 Wellen gegen die Eisenclans und entscheide danach über den Endlosmodus.",
    feature: "Ausgewogene Angriffe · klassische Eisenclan-Kampagne",
    status: "playable",
  }),
  Object.freeze({
    id: "mistwood",
    number: 2,
    icon: "🌲",
    name: "Der Nebelwald",
    subtitle: "Welt 2 · Verborgene Waldpfade",
    description: "Ein dichter Wald, in dem Nebel und versteckte Wege die Aufklärung erschweren.",
    feature: "Geplant: Nebel, Waldpfade und der Wolfsfürst",
    status: "construction",
  }),
  Object.freeze({
    id: "frozen-pass",
    number: 3,
    icon: "❄️",
    name: "Der gefrorene Pass",
    subtitle: "Welt 3 · Eisige Gebirgsfestung",
    description: "Ein verschneiter Pass mit vereisten Wegen und schweren Schildformationen.",
    feature: "Geplant: Frost, Lagerfeuer und der Frostriese",
    status: "construction",
  }),
  Object.freeze({
    id: "scorched-plains",
    number: 4,
    icon: "🔥",
    name: "Die verbrannten Ebenen",
    subtitle: "Welt 4 · Krieg im Flammenland",
    description: "Eine verwüstete Ebene mit Feuerangriffen, knappen Holzvorräten und mächtigen Belagerungswaffen.",
    feature: "Geplant: Brände und der Flammenhäuptling",
    status: "construction",
  }),
  Object.freeze({
    id: "ironclan-heart",
    number: 5,
    icon: "🌋",
    name: "Das Herz des Eisenclans",
    subtitle: "Welt 5 · Das letzte Reich",
    description: "Die vulkanische Heimat der Eisenclans und das zukünftige Finale der großen Weltkampagne.",
    feature: "Geplant: Elitearmeen und der Hochkönig",
    status: "construction",
  }),
]);

function emptyWorldProgress() {
  return {
    bestWave: 0,
    currentWave: 1,
    completed: false,
    bossesDefeated: 0,
    lastPlayedAt: null,
  };
}

export function createWorldMapProfile() {
  return {
    format: 1,
    selectedWorldId: ACTIVE_WORLD_ID,
    lastPlayedWorldId: ACTIVE_WORLD_ID,
    worlds: { [ACTIVE_WORLD_ID]: emptyWorldProgress() },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeProgress(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    bestWave: Math.max(0, Math.floor(Number(source.bestWave) || 0)),
    currentWave: Math.max(1, Math.floor(Number(source.currentWave) || 1)),
    completed: source.completed === true,
    bossesDefeated: Math.max(0, Math.min(4, Math.floor(Number(source.bossesDefeated) || 0))),
    lastPlayedAt: typeof source.lastPlayedAt === "string" ? source.lastPlayedAt : null,
  };
}

export function normalizeWorldMapProfile(value) {
  const fallback = createWorldMapProfile();
  const source = value && typeof value === "object" ? value : fallback;
  const validIds = new Set(WORLD_DEFINITIONS.map((world) => world.id));
  const selectedWorldId = validIds.has(source.selectedWorldId) ? source.selectedWorldId : ACTIVE_WORLD_ID;
  const lastPlayedWorldId = validIds.has(source.lastPlayedWorldId) ? source.lastPlayedWorldId : ACTIVE_WORLD_ID;
  return {
    format: 1,
    selectedWorldId,
    lastPlayedWorldId,
    worlds: {
      [ACTIVE_WORLD_ID]: normalizeProgress(source.worlds?.[ACTIVE_WORLD_ID]),
    },
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : fallback.updatedAt,
  };
}

export function loadWorldMapProfile() {
  try {
    const raw = localStorage.getItem(WORLD_MAP_STORAGE_KEY);
    return raw ? normalizeWorldMapProfile(JSON.parse(raw)) : createWorldMapProfile();
  } catch (error) {
    console.warn("Kampagnenkarte konnte nicht geladen werden:", error);
    return createWorldMapProfile();
  }
}

export function saveWorldMapProfile(profile) {
  const normalized = normalizeWorldMapProfile(profile);
  normalized.updatedAt = new Date().toISOString();
  localStorage.setItem(WORLD_MAP_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getWorldDefinition(worldId) {
  return WORLD_DEFINITIONS.find((world) => world.id === worldId) || WORLD_DEFINITIONS[0];
}

export function selectWorldOnMap(profile, worldId) {
  const normalized = normalizeWorldMapProfile(profile);
  const world = getWorldDefinition(worldId);
  normalized.selectedWorldId = world.id;
  return normalized;
}

function campaignProgressFromMetadata(metadata) {
  const campaign = metadata?.campaign && typeof metadata.campaign === "object" ? metadata.campaign : null;
  const highest = Math.max(0, Math.floor(Number(campaign?.highestCompletedWave) || Math.max(0, Number(metadata?.wave || 1) - 1)));
  const claimed = Array.isArray(campaign?.milestoneRewardsClaimed) ? campaign.milestoneRewardsClaimed.length : Math.floor(highest / 8);
  return {
    currentWave: Math.max(1, Math.floor(Number(metadata?.wave) || highest + 1)),
    bestWave: Math.min(32, highest),
    completed: campaign?.completed === true || highest >= 32,
    bossesDefeated: Math.max(0, Math.min(4, claimed)),
  };
}

export function syncWorldMapProfileFromSave(profile, metadata) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!metadata?.valid) return normalized;
  const progress = campaignProgressFromMetadata(metadata);
  const target = normalized.worlds[ACTIVE_WORLD_ID];
  target.currentWave = progress.currentWave;
  target.bestWave = Math.max(target.bestWave, progress.bestWave);
  target.completed = target.completed || progress.completed;
  target.bossesDefeated = Math.max(target.bossesDefeated, progress.bossesDefeated);
  target.lastPlayedAt = metadata.savedAt || target.lastPlayedAt;
  normalized.lastPlayedWorldId = ACTIVE_WORLD_ID;
  return normalized;
}

export function syncWorldMapProfileFromState(profile, state) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!state || typeof state !== "object") return normalized;
  const campaign = state.campaign && typeof state.campaign === "object" ? state.campaign : {};
  const highest = Math.max(0, Math.floor(Number(campaign.highestCompletedWave) || Math.max(0, Number(state.wave || 1) - 1)));
  const target = normalized.worlds[ACTIVE_WORLD_ID];
  target.currentWave = Math.max(1, Math.floor(Number(state.wave) || 1));
  target.bestWave = Math.max(target.bestWave, Math.min(32, highest));
  target.completed = target.completed || campaign.completed === true || highest >= 32;
  target.bossesDefeated = Math.max(
    target.bossesDefeated,
    Array.isArray(campaign.milestoneRewardsClaimed)
      ? Math.min(4, campaign.milestoneRewardsClaimed.length)
      : Math.min(4, Math.floor(highest / 8))
  );
  target.lastPlayedAt = new Date().toISOString();
  normalized.lastPlayedWorldId = ACTIVE_WORLD_ID;
  return normalized;
}

export function getWorldMapView(profile, metadata = null) {
  const normalized = syncWorldMapProfileFromSave(profile, metadata);
  return {
    profile: normalized,
    worlds: WORLD_DEFINITIONS.map((world) => {
      const progress = world.id === ACTIVE_WORLD_ID
        ? normalized.worlds[ACTIVE_WORLD_ID]
        : emptyWorldProgress();
      return {
        ...world,
        progress,
        playable: world.status === "playable",
        underConstruction: world.status === "construction",
      };
    }),
  };
}
