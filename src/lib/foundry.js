const { getConfigValue } = require('./env');

function normalizeRecommendations(rawRecommendations) {
  if (!Array.isArray(rawRecommendations)) {
    return [];
  }

  return rawRecommendations
    .map((item) => {
      if (typeof item === 'string') {
        return {
          title: item,
          reason: '',
          confidence: null,
        };
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      return {
        title: String(item.title || item.name || 'Suggested game').trim(),
        reason: String(item.reason || item.explanation || '').trim(),
        confidence: typeof item.confidence === 'number' ? item.confidence : null,
      };
    })
    .filter(Boolean)
    .filter((item) => item.title.length > 0);
}

function buildOfflineInsight(profile) {
  return {
    connected: false,
    summary:
      `Foundry is not configured yet for ${profile.gamertag}. The app can still ` +
      'collect public source data and send normalized records once an endpoint is available.',
    recommendations: [],
    source: 'offline',
  };
}

function deriveRecommendationsFromSteamProfile(steamProfile) {
  const summary = String(steamProfile?.summary || '').toLowerCase();
  const headline = String(steamProfile?.headline || '').toLowerCase();
  const text = `${summary} ${headline}`;

  const buckets = [
    {
      words: ['dayz', 'survival', 'zombie', 'rust', 'frustrating'],
      suggestions: ['DayZ', 'Rust', '7 Days to Die'],
      reason:
        'Matched public profile language that points toward survival or sandbox play.',
    },
    {
      words: ['shooter', 'fps', 'halo', 'battle', 'war'],
      suggestions: ['Halo Infinite', 'Destiny 2', 'Call of Duty: Modern Warfare III'],
      reason:
        'Matched public profile language that points toward shooter-heavy play.',
    },
    {
      words: ['racing', 'cars', 'forza', 'drive', 'track'],
      suggestions: ['Forza Horizon 5', 'Forza Motorsport', 'Need for Speed Unbound'],
      reason:
        'Matched public profile language that points toward driving and racing.',
    },
  ];

  for (const bucket of buckets) {
    if (bucket.words.some((word) => text.includes(word))) {
      return bucket.suggestions.map((title, index) => ({
        title,
        reason:
          index === 0
            ? bucket.reason
            : 'Nearby recommendation based on the same public profile theme.',
      }));
    }
  }

  return [
    {
      title: 'Halo Infinite',
      reason:
        'Fallback recommendation while the profile text is too generic to infer a narrower genre.',
    },
    {
      title: 'Forza Horizon 5',
      reason: 'Fallback recommendation based on broad mainstream appeal.',
    },
    {
      title: 'Destiny 2',
      reason: 'Fallback recommendation based on broad mainstream appeal.',
    },
  ];
}

async function callFoundry(profile) {
  const endpoint = getConfigValue('FOUNDRY_IQ_ENDPOINT');
  const apiKey = getConfigValue('FOUNDRY_IQ_API_KEY');

  if (!endpoint || !apiKey) {
    return {
      ...buildOfflineInsight(profile),
      recommendations: profile.steamProfile
        ? deriveRecommendationsFromSteamProfile(profile.steamProfile)
        : [],
    };
  }

  const requestBody = {
    gamertag: profile.gamertag,
    sourceStatuses: profile.sourceStatuses,
    publicSignals: profile.publicSignals,
    requestType: 'game-similarity-analysis',
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let parsedResponse = {};

    if (responseText) {
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = { summary: responseText };
      }
    }

    if (!response.ok) {
      return {
        ...buildOfflineInsight(profile),
        source: 'error',
        connected: false,
        summary:
          parsedResponse.summary ||
          `Foundry returned ${response.status} ${response.statusText}.`,
      };
    }

    return {
      connected: true,
      source: 'foundry',
      summary:
        String(parsedResponse.summary || parsedResponse.output?.summary || '') ||
        'Foundry completed the analysis.',
      recommendations: normalizeRecommendations(
        parsedResponse.recommendations || parsedResponse.output?.recommendations || parsedResponse.items || []
      ),
      raw: parsedResponse,
    };
  } catch (error) {
    return {
      ...buildOfflineInsight(profile),
      source: 'error',
      connected: false,
      summary:
        error instanceof Error ? `Foundry request failed: ${error.message}` : 'Foundry request failed.',
      recommendations: profile.steamProfile
        ? deriveRecommendationsFromSteamProfile(profile.steamProfile)
        : [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  callFoundry,
  normalizeRecommendations,
};