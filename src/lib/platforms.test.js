const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');

const {
  lookupSteamRecentlyPlayedGames,
  normalizeSteamRecentlyPlayedGames,
  createSteamRecentlyPlayedStatus,
} = require('./platforms');

const originalFetch = global.fetch;
const originalEnv = {
  STEAM_WEB_API_KEY: process.env.STEAM_WEB_API_KEY,
  STEAM_WEB_API_URL: process.env.STEAM_WEB_API_URL,
};

afterEach(() => {
  global.fetch = originalFetch;
  process.env.STEAM_WEB_API_KEY = originalEnv.STEAM_WEB_API_KEY;
  process.env.STEAM_WEB_API_URL = originalEnv.STEAM_WEB_API_URL;
});

test('normalizeSteamRecentlyPlayedGames keeps the first five games', () => {
  const games = normalizeSteamRecentlyPlayedGames([
    { appid: 1, name: 'Game One', playtime_2weeks: 10, playtime_forever: 100 },
    { appid: 2, name: 'Game Two', playtime_2weeks: 20, playtime_forever: 200 },
    { appid: 3, name: 'Game Three', playtime_2weeks: 30, playtime_forever: 300 },
    { appid: 4, name: 'Game Four', playtime_2weeks: 40, playtime_forever: 400 },
    { appid: 5, name: 'Game Five', playtime_2weeks: 50, playtime_forever: 500 },
    { appid: 6, name: 'Game Six', playtime_2weeks: 60, playtime_forever: 600 },
  ]);

  assert.equal(games.length, 5);
  assert.deepEqual(games[0], {
    appId: 1,
    name: 'Game One',
    rank: 1,
    playtimeTwoWeeksMinutes: 10,
    playtimeForeverMinutes: 100,
    iconUrl: undefined,
    logoUrl: undefined,
  });
  assert.equal(games[4].name, 'Game Five');
});

test('lookupSteamRecentlyPlayedGames returns normalized games from Steam', async () => {
  process.env.STEAM_WEB_API_KEY = 'test-key';
  process.env.STEAM_WEB_API_URL = 'https://api.steampowered.com';

  global.fetch = async (requestUrl) => {
    const url = new URL(String(requestUrl));

    assert.equal(url.pathname, '/IPlayerService/GetRecentlyPlayedGames/v0001/');
    assert.equal(url.searchParams.get('key'), 'test-key');
    assert.equal(url.searchParams.get('steamid'), '76561197960287930');
    assert.equal(url.searchParams.get('count'), '5');
    assert.equal(url.searchParams.get('include_appinfo'), '1');

    return {
      ok: true,
      json: async () => ({
        response: {
          games: [
            { appid: 730, name: 'Counter-Strike 2', playtime_2weeks: 120, playtime_forever: 800 },
          ],
        },
      }),
    };
  };

  const result = await lookupSteamRecentlyPlayedGames('76561197960287930');

  assert.deepEqual(result, {
    games: [
      {
        appId: 730,
        name: 'Counter-Strike 2',
        rank: 1,
        playtimeTwoWeeksMinutes: 120,
        playtimeForeverMinutes: 800,
        iconUrl: undefined,
        logoUrl: undefined,
      },
    ],
    warning: undefined,
  });
});

test('createSteamRecentlyPlayedStatus reports warnings', () => {
  const status = createSteamRecentlyPlayedStatus('gaben', {
    games: [],
    warning: 'Steam Web API key is not configured.',
  });

  assert.equal(status.id, 'steam-recently-played-games');
  assert.equal(status.state, 'recent-games-unavailable');
  assert.equal(status.warning, 'Steam Web API key is not configured.');
});