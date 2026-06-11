const {
  getSourceStatuses,
  lookupSteamPublicProfile,
  createSteamProfileStatus,
} = require('./platforms');
const { callFoundry } = require('./foundry');

function normalizeGamertag(input) {
  return String(input || '').trim().replace(/\s+/g, ' ');
}

async function analyzeGamertag(inputGamertag) {
  const gamertag = normalizeGamertag(inputGamertag);
  const sourceStatuses = getSourceStatuses(gamertag);
  const steamProfile = await lookupSteamPublicProfile(gamertag);

  sourceStatuses[0] = createSteamProfileStatus(gamertag, steamProfile);

  const publicSignals = steamProfile
    ? [
        {
          source: 'steam',
          type: 'public-profile',
          steamId64: steamProfile.steamId64,
          steamId: steamProfile.steamId,
          customUrl: steamProfile.customUrl,
          onlineState: steamProfile.onlineState,
          stateMessage: steamProfile.stateMessage,
          privacyState: steamProfile.privacyState,
          visibilityState: steamProfile.visibilityState,
          memberSince: steamProfile.memberSince,
          location: steamProfile.location,
          realName: steamProfile.realName,
          summary: steamProfile.summary,
          headline: steamProfile.headline,
        },
      ]
    : [];

  const foundryInsight = await callFoundry({
    gamertag,
    sourceStatuses,
    publicSignals,
    steamProfile,
  });

  return {
    gamertag,
    sourceStatuses,
    publicSignals,
    steamProfile,
    foundry: foundryInsight,
    summary: foundryInsight.summary || 'No public play-history data was available to analyze yet.',
    recommendations: foundryInsight.recommendations || [],
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  analyzeGamertag,
  normalizeGamertag,
};