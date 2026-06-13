const {
  getSourceStatuses,
  lookupSteamPublicProfile,
  lookupSteamRecentlyPlayedGames,
  createSteamProfileStatus,
  createSteamRecentlyPlayedStatus,
} = require('./platforms');
const { callFoundry } = require('./foundry');

function normalizeGamertag(input) {
  return String(input || '').trim().replace(/\s+/g, ' ');
}

async function analyzeGamertag(inputGamertag) {
  const gamertag = normalizeGamertag(inputGamertag);
  const sourceStatuses = getSourceStatuses(gamertag);
  const steamProfile = await lookupSteamPublicProfile(gamertag);
  const steamRecentlyPlayedGames = await lookupSteamRecentlyPlayedGames(steamProfile?.steamId64);

  sourceStatuses[0] = createSteamProfileStatus(gamertag, steamProfile);
  sourceStatuses.push(createSteamRecentlyPlayedStatus(gamertag, steamRecentlyPlayedGames));

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
        ...(steamRecentlyPlayedGames.games.length > 0
          ? [
              {
                source: 'steam',
                type: 'recently-played-games',
                steamId64: steamProfile.steamId64,
                games: steamRecentlyPlayedGames.games,
              },
            ]
          : []),
      ]
    : [];

  const foundryInsight = await callFoundry({
    gamertag,
    sourceStatuses,
    publicSignals,
    steamProfile,
    steamRecentlyPlayedGames: steamRecentlyPlayedGames.games,
    steamRecentlyPlayedGamesStatus: steamRecentlyPlayedGames.warning
      ? steamRecentlyPlayedGames.warning
      : undefined,
  });

  return {
    gamertag,
    sourceStatuses,
    publicSignals,
    steamProfile,
    steamRecentlyPlayedGames: steamRecentlyPlayedGames.games,
    steamRecentlyPlayedGamesWarning: steamRecentlyPlayedGames.warning,
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