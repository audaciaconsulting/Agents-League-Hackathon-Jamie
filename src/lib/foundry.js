const { getConfigValue } = require('./env');
const OpenAI = require('openai');
const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity');

const DEFAULT_DEPLOYMENT_NAME = 'gpt-5.4-nano';
const AZURE_SCOPE = 'https://ai.azure.com/.default';

function debugFoundry(message, details) {
  if (typeof details === 'undefined') {
    console.log(`[foundry] ${message}`);
    return;
  }

  console.log(`[foundry] ${message}`, details);
}

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
          confidence: undefined,
        };
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      return {
        title: String(item.title || item.name || 'Suggested game').trim(),
        reason: String(item.reason || item.explanation || '').trim(),
        confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
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

function parseModelResponse(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return { summary: text };
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return { summary: text };
    }
  }
}

function buildPrompt(profile) {
  var prompt = [
    'Analyze this public gamer profile and suggest the most relevant similar games.',
    'Treat the five most recently played Steam games as the strongest direct play-history signal when available.',
    'Return only valid JSON with this shape:',
    '{"summary":"string","recommendations":[{"title":"string","reason":"string","confidence":0.0}]}',
    'Use the supplied public data only. Keep recommendations concise and specific.',
    '',
    JSON.stringify(
      {
        gamertag: profile.gamertag,
        sourceStatuses: profile.sourceStatuses,
        publicSignals: profile.publicSignals,
        steamProfile: profile.steamProfile,
        steamRecentlyPlayedGames: profile.steamRecentlyPlayedGames,
        steamRecentlyPlayedGamesStatus: profile.steamRecentlyPlayedGamesStatus,
      },
      null,
      2
    ),
  ].join('\n');

  debugFoundry('Built Foundry prompt.', prompt);
  return prompt;
}

function createOpenAIClient() {
  const endpoint = getConfigValue('FOUNDRY_IQ_ENDPOINT') || getConfigValue('AZURE_AI_ENDPOINT');
  const apiKey =
    getConfigValue('FOUNDRY_IQ_API_KEY') || getConfigValue('AZURE_AI_KEY') || null;
  const tokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), AZURE_SCOPE);

  if (!endpoint) {
    debugFoundry('No Foundry endpoint configured; using offline fallback.');
    return null;
  }

  debugFoundry('Creating Azure OpenAI client.', {
    endpoint,
    authMode: apiKey ? 'api-key' : 'azure-credential',
  });

  return new OpenAI({
    baseURL: endpoint,
    apiKey: apiKey || tokenProvider,
  });
}

function getDeploymentName() {
  return (
    getConfigValue('FOUNDRY_IQ_DEPLOYMENT_NAME') ||
    getConfigValue('AZURE_AI_DEPLOYMENT_NAME') ||
    DEFAULT_DEPLOYMENT_NAME
  );
}

async function callFoundry(profile) {
  debugFoundry('Starting analysis.', {
    gamertag: profile.gamertag,
    hasSteamProfile: Boolean(profile.steamProfile),
    hasSteamRecentlyPlayedGames: Array.isArray(profile.steamRecentlyPlayedGames)
      ? profile.steamRecentlyPlayedGames.length > 0
      : false,
  });

  const client = createOpenAIClient();

  if (!client) {
    debugFoundry('Falling back to offline insight.');
    return {
      ...buildOfflineInsight(profile),
      recommendations: profile.steamProfile
        ? deriveRecommendationsFromSteamProfile(profile.steamProfile)
        : [],
    };
  }

  const deploymentName = getDeploymentName();
  const prompt = buildPrompt(profile);

  debugFoundry('Prepared Foundry request.', {
    deploymentName,
    promptLength: prompt.length,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const runner = client.responses.stream({
      model: deploymentName,
      input: prompt
    });

    let responseText = '';

    runner.on('response.output_text.delta', (diff) => {
      responseText += diff.delta;
    });

    runner.on('event', (event) => {
      if (event?.type) {
        debugFoundry(`Stream event: ${event.type}`);
      }
    });

    runner.on('response.output_text.done', (event) => {
      if (typeof event?.text === 'string' && event.text.trim()) {
        responseText = event.text;
      }
    });

    const result = await runner.finalResponse();
    const parsedResponse = parseModelResponse(responseText || result?.output_text || '');

    debugFoundry('Foundry request completed.', {
      hasText: Boolean(responseText),
      recommendationCount: Array.isArray(parsedResponse.recommendations)
        ? parsedResponse.recommendations.length
        : 0,
    });

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
    debugFoundry('Foundry request failed.', {
      message: error instanceof Error ? error.message : String(error),
    });

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