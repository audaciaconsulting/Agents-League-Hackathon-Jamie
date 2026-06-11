const form = document.getElementById('gamertag-form');
const gamertagInput = document.getElementById('gamertag');
const statusTitle = document.getElementById('status-title');
const statusCopy = document.getElementById('status-copy');
const statusBadge = document.getElementById('status-badge');
const sourceList = document.getElementById('source-list');
const recommendations = document.getElementById('recommendations');

function setStatus(state, title, copy) {
  statusBadge.className = `status-badge ${state}`;
  statusBadge.textContent = state === 'busy' ? 'Running' : state === 'error' ? 'Blocked' : state === 'ready' ? 'Ready' : 'Idle';
  statusTitle.textContent = title;
  statusCopy.textContent = copy;
}

function renderSources(sourceStatuses) {
  sourceList.innerHTML = '';

  for (const source of sourceStatuses) {
    const card = document.createElement('article');
    card.className = 'source-card';

    const profile = source.profile;
    const profileLines = profile
      ? [
          profile.customUrl ? `Custom URL: ${profile.customUrl}` : '',
          profile.memberSince ? `Member since: ${profile.memberSince}` : '',
          profile.location ? `Location: ${profile.location}` : '',
          profile.stateMessage ? `Status: ${profile.stateMessage}` : '',
        ].filter(Boolean)
      : [];

    card.innerHTML = `
      <div class="source-card-header">
        <div class="source-name">${source.label}</div>
        <span class="pill">${source.state}</span>
      </div>
      <p class="source-note">${source.note}</p>
      ${profileLines.length ? `<ul class="source-details">${profileLines.map((line) => `<li>${line}</li>`).join('')}</ul>` : ''}
      ${profile?.summary ? `<p class="source-summary">${profile.summary}</p>` : ''}
    `;

    sourceList.appendChild(card);
  }
}

function renderRecommendations(payload) {
  const items = Array.isArray(payload.recommendations) ? payload.recommendations : [];

  if (!items.length) {
    recommendations.className = 'recommendations empty-state';
    recommendations.textContent = payload.summary || 'No recommendations yet.';
    return;
  }

  recommendations.className = 'recommendations';
  recommendations.innerHTML = '';

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'recommendation-card';

    const confidenceLabel = typeof item.confidence === 'number' ? `${Math.round(item.confidence * 100)}% match` : 'Foundry suggestion';

    card.innerHTML = `
      <div class="recommendation-header">
        <div class="recommendation-title">${item.title}</div>
        <span class="pill accent">${confidenceLabel}</span>
      </div>
      <p class="recommendation-reason">${item.reason || 'Similar vibe or genre.'}</p>
    `;

    recommendations.appendChild(card);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const gamertag = gamertagInput.value.trim();
  if (gamertag.length < 3) {
    setStatus('error', 'Enter a longer gamertag', 'Use at least three characters so the analysis request can run.');
    return;
  }

  setStatus('busy', `Analyzing ${gamertag}`, 'Checking public source availability and preparing the Foundry payload.');
  recommendations.className = 'recommendations empty-state';
  recommendations.textContent = 'Running analysis...';

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gamertag }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || payload.error || 'Request failed.');
    }

    setStatus(payload.foundry?.connected ? 'ready' : 'error', `Results for ${payload.gamertag}`, payload.summary);
    renderSources(payload.sourceStatuses || []);
    renderRecommendations(payload);
  } catch (error) {
    setStatus('error', 'Analysis failed', error instanceof Error ? error.message : 'Unexpected error.');
    recommendations.className = 'recommendations empty-state';
    recommendations.textContent = 'The request did not complete. Check the server output and try again.';
  }
});

setStatus('idle', 'Waiting for a gamertag', 'Enter a player name to inspect public source status and Foundry output.');
renderSources([
  { label: 'Xbox', state: 'planned', note: 'Public adapter still needs verification.' },
  { label: 'PlayStation', state: 'planned', note: 'Deferred until a compliant public-data source is confirmed.' },
  { label: 'Steam', state: 'public-profile-found', note: 'Try a Steam vanity name to see public profile metadata.', profile: null },
]);