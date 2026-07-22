/**
 * Kampagnenfortschritt von Fortress Commander.
 *
 * Die reguläre Kampagne endet nach Welle 32. Nach dem Sieg kann die Partie
 * abgeschlossen oder ohne Verlust des Festungsstands im Endlosmodus
 * fortgesetzt werden.
 */

export const CAMPAIGN_FINAL_WAVE = 32;

export const CAMPAIGN_MILESTONES = Object.freeze([
  Object.freeze({
    wave: 8,
    icon: "👑",
    title: "Der erste Häuptling",
    description: "Der erste Anführer der Eisenclans führt seine Eskorte persönlich gegen die Festung.",
    reward: Object.freeze({ gold: 120, stone: 30, researchPoints: 3, repairPercent: 0.03 }),
  }),
  Object.freeze({
    wave: 16,
    icon: "🛡️",
    title: "Elitehäuptling",
    description: "Ein erfahrener Häuptling greift mit schwer gepanzerten Veteranen an.",
    reward: Object.freeze({ gold: 180, stone: 55, researchPoints: 5, repairPercent: 0.05 }),
  }),
  Object.freeze({
    wave: 24,
    icon: "🔥",
    title: "Der Großangriff",
    description: "Die stärksten Krieger der Eisenclans sammeln sich für einen umfassenden Sturm.",
    reward: Object.freeze({ gold: 260, stone: 85, researchPoints: 7, repairPercent: 0.07 }),
  }),
  Object.freeze({
    wave: 32,
    icon: "⚔️",
    title: "Der letzte Kriegsherr",
    description: "Der Kriegsherr der Eisenclans führt die letzte Armee. Übersteht die Festung diesen Angriff, ist die Kampagne gewonnen.",
    reward: Object.freeze({ gold: 500, stone: 150, researchPoints: 10, repairPercent: 0.10 }),
  }),
]);

const VALID_MODES = new Set(["campaign", "endless", "completed"]);

function clampWave(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function milestoneWavesUpTo(value) {
  const completed = Math.max(0, Math.floor(Number(value) || 0));
  return CAMPAIGN_MILESTONES
    .filter((milestone) => milestone.wave <= completed)
    .map((milestone) => milestone.wave);
}

function normalizeMilestones(value, highestCompletedWave) {
  const valid = new Set(CAMPAIGN_MILESTONES.map((milestone) => milestone.wave));
  const saved = Array.isArray(value)
    ? value.map((wave) => Math.floor(Number(wave) || 0)).filter((wave) => valid.has(wave))
    : [];
  for (const wave of milestoneWavesUpTo(highestCompletedWave)) saved.push(wave);
  return [...new Set(saved)].sort((a, b) => a - b);
}

export function createCampaignState(wave = 1) {
  const currentWave = clampWave(wave);
  const legacyEndless = currentWave > CAMPAIGN_FINAL_WAVE;
  const highestCompletedWave = legacyEndless ? currentWave - 1 : Math.max(0, currentWave - 1);
  return {
    mode: legacyEndless ? "endless" : "campaign",
    completed: legacyEndless,
    victoryPending: false,
    highestCompletedWave,
    milestoneRewardsClaimed: normalizeMilestones([], legacyEndless ? CAMPAIGN_FINAL_WAVE : highestCompletedWave),
    endlessWavesCompleted: legacyEndless ? Math.max(0, currentWave - CAMPAIGN_FINAL_WAVE - 1) : 0,
  };
}

export function ensureCampaignState(state) {
  if (!state || typeof state !== "object") return createCampaignState(1);
  const currentWave = clampWave(state.wave);
  const fallback = createCampaignState(currentWave);
  const source = state.campaign && typeof state.campaign === "object" ? state.campaign : fallback;
  const mode = VALID_MODES.has(source.mode) ? source.mode : fallback.mode;
  const highestCompletedWave = Math.max(
    0,
    Math.floor(Number(source.highestCompletedWave) || Math.max(0, currentWave - 1))
  );
  const campaign = {
    mode,
    completed: source.completed === true || mode !== "campaign" || highestCompletedWave >= CAMPAIGN_FINAL_WAVE,
    victoryPending: mode === "campaign" && source.victoryPending === true,
    highestCompletedWave,
    milestoneRewardsClaimed: normalizeMilestones(source.milestoneRewardsClaimed, highestCompletedWave),
    endlessWavesCompleted: Math.max(0, Math.floor(Number(source.endlessWavesCompleted) || 0)),
  };
  if (currentWave > CAMPAIGN_FINAL_WAVE && mode === "campaign" && !campaign.victoryPending) {
    campaign.mode = "endless";
    campaign.completed = true;
    campaign.endlessWavesCompleted = Math.max(campaign.endlessWavesCompleted, currentWave - CAMPAIGN_FINAL_WAVE - 1);
  }
  state.campaign = campaign;
  return campaign;
}

export function serializeCampaignState(value, wave = 1) {
  const holder = { wave: clampWave(wave), campaign: value };
  const campaign = ensureCampaignState(holder);
  return {
    mode: campaign.mode,
    completed: campaign.completed === true,
    victoryPending: campaign.victoryPending === true,
    highestCompletedWave: campaign.highestCompletedWave,
    milestoneRewardsClaimed: [...campaign.milestoneRewardsClaimed],
    endlessWavesCompleted: campaign.endlessWavesCompleted,
  };
}

export function restoreCampaignState(saved, wave = 1) {
  const state = { wave: clampWave(wave), campaign: saved };
  return ensureCampaignState(state);
}

export function getCampaignMilestone(wave) {
  const currentWave = clampWave(wave);
  return CAMPAIGN_MILESTONES.find((milestone) => milestone.wave === currentWave) || null;
}

export function getNextCampaignMilestone(state) {
  const campaign = ensureCampaignState(state);
  if (campaign.mode !== "campaign") return null;
  const currentWave = clampWave(state.wave);
  return CAMPAIGN_MILESTONES.find((milestone) => milestone.wave >= currentWave) || null;
}

export function getCampaignBossProfile(state, wave = state?.wave) {
  const campaign = ensureCampaignState(state);
  const currentWave = clampWave(wave);
  if (currentWave % 8 !== 0) return null;
  if (currentWave === 8) {
    return { role: "firstChieftain", name: "Erster Eisenclan-Häuptling", powerScale: 1, rewardScale: 1, visualScale: 1 };
  }
  if (currentWave === 16) {
    return { role: "eliteChieftain", name: "Elitehäuptling der Eisenclans", powerScale: 1.18, rewardScale: 1.08, visualScale: 1.06 };
  }
  if (currentWave === 24) {
    return { role: "grandChieftain", name: "Großhäuptling der Eisenclans", powerScale: 1.35, rewardScale: 1.15, visualScale: 1.11 };
  }
  if (currentWave === CAMPAIGN_FINAL_WAVE && campaign.mode === "campaign") {
    return { role: "warlord", name: "Kriegsherr der Eisenclans", powerScale: 1.60, rewardScale: 1.25, visualScale: 1.20 };
  }
  const endlessBonus = Math.min(0.55, Math.max(0, currentWave - CAMPAIGN_FINAL_WAVE) * 0.0125);
  return {
    role: "endlessChieftain",
    name: `Endlos-Häuptling · Welle ${currentWave}`,
    powerScale: 1 + endlessBonus,
    rewardScale: 1 + endlessBonus * 0.35,
    visualScale: 1 + Math.min(0.15, endlessBonus * 0.25),
  };
}

export function resolveCampaignWave(state, completedWave) {
  const campaign = ensureCampaignState(state);
  const wave = clampWave(completedWave);
  campaign.highestCompletedWave = Math.max(campaign.highestCompletedWave, wave);
  if (campaign.mode === "endless" && wave > CAMPAIGN_FINAL_WAVE) {
    campaign.endlessWavesCompleted = Math.max(campaign.endlessWavesCompleted, wave - CAMPAIGN_FINAL_WAVE);
  }

  const milestone = getCampaignMilestone(wave);
  let reward = null;
  if (milestone && !campaign.milestoneRewardsClaimed.includes(wave)) {
    campaign.milestoneRewardsClaimed.push(wave);
    campaign.milestoneRewardsClaimed.sort((a, b) => a - b);
    reward = { ...milestone.reward };
  }

  const victory = campaign.mode === "campaign" && wave >= CAMPAIGN_FINAL_WAVE;
  if (victory) {
    campaign.completed = true;
    campaign.victoryPending = true;
  }

  return { victory, milestone, reward, campaign };
}

export function continueCampaignInEndlessMode(state) {
  const campaign = ensureCampaignState(state);
  campaign.mode = "endless";
  campaign.completed = true;
  campaign.victoryPending = false;
  campaign.highestCompletedWave = Math.max(campaign.highestCompletedWave, CAMPAIGN_FINAL_WAVE);
  return campaign;
}

export function finishCampaign(state) {
  const campaign = ensureCampaignState(state);
  campaign.mode = "completed";
  campaign.completed = true;
  campaign.victoryPending = false;
  campaign.highestCompletedWave = Math.max(campaign.highestCompletedWave, CAMPAIGN_FINAL_WAVE);
  return campaign;
}

export function isCampaignChoiceRequired(state) {
  const campaign = ensureCampaignState(state);
  return campaign.mode === "campaign" && campaign.victoryPending === true;
}

export function isCampaignFinished(state) {
  return ensureCampaignState(state).mode === "completed";
}

export function getCampaignView(state) {
  const campaign = ensureCampaignState(state);
  const completed = Math.min(CAMPAIGN_FINAL_WAVE, campaign.highestCompletedWave);
  const nextMilestone = getNextCampaignMilestone(state);
  const modeLabel = campaign.mode === "endless"
    ? "Endlosmodus"
    : campaign.mode === "completed"
      ? "Kampagne abgeschlossen"
      : campaign.victoryPending
        ? "Sieg errungen"
        : "Kampagne";
  return {
    campaign,
    modeLabel,
    completed,
    total: CAMPAIGN_FINAL_WAVE,
    progress: completed / CAMPAIGN_FINAL_WAVE,
    nextMilestone,
    milestones: CAMPAIGN_MILESTONES.map((milestone) => ({
      ...milestone,
      completed: campaign.highestCompletedWave >= milestone.wave,
      current: campaign.mode === "campaign" && clampWave(state.wave) === milestone.wave,
    })),
    endlessWave: campaign.mode === "endless" ? Math.max(1, clampWave(state.wave) - CAMPAIGN_FINAL_WAVE) : 0,
  };
}

export function formatCampaignReward(reward) {
  if (!reward) return "";
  const parts = [];
  if (reward.gold) parts.push(`+${Math.floor(reward.gold)} Gold`);
  if (reward.stone) parts.push(`+${Math.floor(reward.stone)} Stein`);
  if (reward.researchPoints) parts.push(`+${Math.floor(reward.researchPoints)} Forschung`);
  if (reward.repairPercent) parts.push(`+${Math.round(reward.repairPercent * 100)} % Festungsreparatur`);
  return parts.join(" · ");
}
