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

module.exports = {
  createSteamProfileStatus,
  extractSteamProfile,
  getSourceStatuses,
  lookupSteamPublicProfile,
};