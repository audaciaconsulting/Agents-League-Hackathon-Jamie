const { getConfigValue } = require('./env');

const DEFAULT_STEAM_WEB_API_URL = 'https://api.steampowered.com';
const STEAM_RECENT_GAMES_COUNT = 5;

function createSourceStatus(gamertag, id, label, note) {
  return {
    id,
    label,
    gamertag,
    state: 'planned',
    note,
  };
}

function createSteamProfileStatus(gamertag, profile) {
  return {
    id: 'steam',
    label: 'Steam',
    gamertag,
    state: profile ? 'public-profile-found' : 'not-found',
    note: profile
      ? 'Public Steam profile metadata was retrieved successfully.'
      : 'No public Steam profile was found for that vanity name.',
    profile,
  };
}

function createSteamRecentlyPlayedStatus(gamertag, recentGamesResult) {
  const games = Array.isArray(recentGamesResult?.games) ? recentGamesResult.games : [];
  const gameNames = games.map((game) => String(game?.name || '').trim()).filter(Boolean);

  return {
    id: 'steam-recently-played-games',
    label: 'Steam recent games',
    gamertag,
    state: recentGamesResult?.warning
      ? 'recent-games-unavailable'
      : games.length > 0
        ? 'recent-games-found'
        : 'recent-games-empty',
    note:
      recentGamesResult?.warning ||
      (games.length > 0
        ? 'The Steam Web API returned the most recently played games.'
        : 'Steam returned no recently played games for this profile.'),
    games,
    gameNames,
    warning: recentGamesResult?.warning,
  };
}

function getSourceStatuses(gamertag) {
  return [
    createSourceStatus(
      gamertag,
      'steam',
      'Steam',
      'Steam public profile lookup is available through the adapter.'
    ),
  ];
}

function buildSteamRecentlyPlayedGamesUrl(steamId64) {
  const baseUrl = getConfigValue('STEAM_WEB_API_URL', DEFAULT_STEAM_WEB_API_URL);
  const url = new URL('/IPlayerService/GetRecentlyPlayedGames/v0001/', baseUrl);

  url.searchParams.set('key', getConfigValue('STEAM_WEB_API_KEY'));
  url.searchParams.set('steamid', String(steamId64 || '').trim());
  url.searchParams.set('count', String(STEAM_RECENT_GAMES_COUNT));
  url.searchParams.set('include_appinfo', '1');
  url.searchParams.set('format', 'json');

  return url;
}

function decodeXmlValue(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractXmlTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeXmlValue(match[1]) : '';
}

function extractSteamProfile(xml) {
  if (!xml || /<title>Sign in<\/title>/i.test(xml) || /Sign in with account name/i.test(xml)) {
    return null;
  }

  const profile = {
    steamId64: extractXmlTag(xml, 'steamID64'),
    steamId: extractXmlTag(xml, 'steamID'),
    customUrl: extractXmlTag(xml, 'customURL'),
    onlineState: extractXmlTag(xml, 'onlineState'),
    stateMessage: extractXmlTag(xml, 'stateMessage'),
    privacyState: extractXmlTag(xml, 'privacyState'),
    visibilityState: extractXmlTag(xml, 'visibilityState'),
    memberSince: extractXmlTag(xml, 'memberSince'),
    location: extractXmlTag(xml, 'location'),
    realName: extractXmlTag(xml, 'realname'),
    headline: extractXmlTag(xml, 'headline'),
    summary: extractXmlTag(xml, 'summary'),
    avatarFull: extractXmlTag(xml, 'avatarFull'),
  };

  return profile.steamId64 || profile.steamId ? profile : null;
}

async function lookupSteamPublicProfile(gamertag) {
  const vanity = String(gamertag || '').trim();
  if (!vanity) {
    return null;
  }

  const url = `https://steamcommunity.com/id/${encodeURIComponent(vanity)}/?xml=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/xml,text/xml,text/html;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    return null;
  }

  const xml = await response.text();
  return extractSteamProfile(xml);
}

function normalizeSteamRecentlyPlayedGames(games) {
  if (!Array.isArray(games)) {
    return [];
  }

  return games.slice(0, STEAM_RECENT_GAMES_COUNT).map((game, index) => ({
    appId: Number(game?.appid) || undefined,
    name: String(game?.name || '').trim(),
    rank: index + 1,
    playtimeTwoWeeksMinutes:
      typeof game?.playtime_2weeks === 'number' ? game.playtime_2weeks : undefined,
    playtimeForeverMinutes:
      typeof game?.playtime_forever === 'number' ? game.playtime_forever : undefined,
    iconUrl: game?.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
      : undefined,
    logoUrl: game?.img_logo_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`
      : undefined,
  }));
}

async function lookupSteamRecentlyPlayedGames(steamId64) {
  const steamid = String(steamId64 || '').trim();
  if (!steamid) {
    return {
      games: [],
      warning: 'SteamID64 was not available for the recently played games lookup.',
    };
  }

  const apiKey = String(getConfigValue('STEAM_WEB_API_KEY') || '').trim();
  if (!apiKey) {
    return {
      games: [],
      warning: 'Steam Web API key is not configured.',
    };
  }

  const url = buildSteamRecentlyPlayedGamesUrl(steamid);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return {
        games: [],
        warning: `Steam recently played games request failed with status ${response.status}.`,
      };
    }

    const payload = await response.json();
    const games = normalizeSteamRecentlyPlayedGames(payload?.response?.games);

    return {
      games,
      warning: games.length > 0 ? undefined : 'Steam returned no recently played games.',
    };
  } catch (error) {
    return {
      games: [],
      warning:
        error instanceof Error
          ? `Steam recently played games lookup failed: ${error.message}`
          : 'Steam recently played games lookup failed.',
    };
  }
}

module.exports = {
  createSteamRecentlyPlayedStatus,
  createSteamProfileStatus,
  extractSteamProfile,
  getSourceStatuses,
  lookupSteamPublicProfile,
  lookupSteamRecentlyPlayedGames,
  normalizeSteamRecentlyPlayedGames,
};