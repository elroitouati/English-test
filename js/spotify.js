// ניגון פלייליסט מספוטיפיי ברקע בזמן תרגול, דרך ה-Web Playback SDK הרשמי.
// זרימת התחברות: Authorization Code + PKCE (בלי צורך בשרת/סוד - מתאים לאתר סטטי).
const SPOTIFY_SETTINGS_KEY = 'spotifySettings_v1';
const SPOTIFY_AUTH_KEY = 'spotifyAuth_v1';
const SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state';
const SPOTIFY_PKCE_VERIFIER_KEY = 'spotify_pkce_verifier';

let spotifyPlayer = null;
let spotifyDeviceId = null;
let spotifySettingsOpen = false;
const spotifyPlayerState = { paused: true, volume: 0.5, muted: false, volumeBeforeMute: 0.5, trackName: '' };

function getRedirectUri(){
  return window.location.origin + window.location.pathname;
}

function loadSpotifySettings(){
  try{ return JSON.parse(localStorage.getItem(SPOTIFY_SETTINGS_KEY)) || {}; }catch(e){ return {}; }
}
function saveSpotifySettings(s){
  try{ localStorage.setItem(SPOTIFY_SETTINGS_KEY, JSON.stringify(s)); }catch(e){}
}
function loadSpotifyAuth(){
  try{ return JSON.parse(localStorage.getItem(SPOTIFY_AUTH_KEY)); }catch(e){ return null; }
}
function saveSpotifyAuth(a){
  try{ localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(a)); }catch(e){}
}
function clearSpotifyAuth(){
  try{ localStorage.removeItem(SPOTIFY_AUTH_KEY); }catch(e){}
}

function normalizePlaylistInput(input){
  input = (input || '').trim();
  const m = input.match(/playlist[\/:]([a-zA-Z0-9]+)/);
  if(m) return 'spotify:playlist:' + m[1];
  return input;
}

// --- PKCE helpers ---
function randomString(len){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const vals = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(vals).map(v => chars[v % chars.length]).join('');
}
async function sha256base64url(str){
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  let binary = '';
  new Uint8Array(digest).forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function startSpotifyLogin(){
  const settings = loadSpotifySettings();
  if(!settings.clientId){ return; }
  const verifier = randomString(64);
  sessionStorage.setItem(SPOTIFY_PKCE_VERIFIER_KEY, verifier);
  const challenge = await sha256base64url(verifier);
  const params = new URLSearchParams({
    client_id: settings.clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
}

async function handleSpotifyRedirect(){
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const hasError = params.get('error');
  if(!code && !hasError) return;

  const verifier = sessionStorage.getItem(SPOTIFY_PKCE_VERIFIER_KEY);
  const settings = loadSpotifySettings();
  if(code && verifier && settings.clientId){
    const body = new URLSearchParams({
      client_id: settings.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    });
    try{
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await res.json();
      if(data.access_token){
        saveSpotifyAuth({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + (data.expires_in * 1000) - 60000,
        });
      }
    }catch(e){ /* אין רשת / שגיאת שרת - נשארים לא מחוברים */ }
  }
  sessionStorage.removeItem(SPOTIFY_PKCE_VERIFIER_KEY);
  window.history.replaceState({}, '', getRedirectUri());
}

async function refreshSpotifyToken(){
  const auth = loadSpotifyAuth();
  const settings = loadSpotifySettings();
  if(!auth || !auth.refresh_token || !settings.clientId) return null;
  const body = new URLSearchParams({
    client_id: settings.clientId,
    grant_type: 'refresh_token',
    refresh_token: auth.refresh_token,
  });
  try{
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if(data.access_token){
      const updated = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || auth.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000,
      };
      saveSpotifyAuth(updated);
      return updated.access_token;
    }
  }catch(e){ /* ignore */ }
  clearSpotifyAuth();
  return null;
}

async function getValidAccessToken(){
  const auth = loadSpotifyAuth();
  if(!auth) return null;
  if(Date.now() < auth.expires_at) return auth.access_token;
  return await refreshSpotifyToken();
}

// --- Web Playback SDK ---
window.onSpotifyWebPlaybackSDKReady = () => {
  initSpotifyPlayerIfPossible();
};

async function initSpotifyPlayerIfPossible(){
  if(spotifyPlayer || typeof Spotify === 'undefined') return;
  const token = await getValidAccessToken();
  if(!token) return;

  spotifyPlayer = new Spotify.Player({
    name: 'כרטיסיות אוצר מילים',
    getOAuthToken: async (cb) => { cb(await getValidAccessToken()); },
    volume: spotifyPlayerState.volume,
  });

  spotifyPlayer.addListener('ready', ({ device_id }) => {
    spotifyDeviceId = device_id;
    startPlaylistPlayback();
    renderSpotifyBar();
  });
  spotifyPlayer.addListener('not_ready', () => {
    spotifyDeviceId = null;
    renderSpotifyBar();
  });
  spotifyPlayer.addListener('player_state_changed', (state) => {
    if(!state) return;
    spotifyPlayerState.paused = state.paused;
    const track = state.track_window && state.track_window.current_track;
    spotifyPlayerState.trackName = track ? (track.name + ' · ' + track.artists.map(a => a.name).join(', ')) : '';
    renderSpotifyBar();
  });
  spotifyPlayer.addListener('initialization_error', () => renderSpotifyBar());
  spotifyPlayer.addListener('authentication_error', () => { clearSpotifyAuth(); renderSpotifyBar(); });
  spotifyPlayer.addListener('account_error', () => renderSpotifyBar());

  await spotifyPlayer.connect();
}

async function startPlaylistPlayback(){
  const settings = loadSpotifySettings();
  if(!settings.playlistUri || !spotifyDeviceId) return;
  const token = await getValidAccessToken();
  if(!token) return;
  try{
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ context_uri: settings.playlistUri }),
    });
  }catch(e){ /* ignore */ }
}

function togglePlayPause(){
  if(spotifyPlayer) spotifyPlayer.togglePlay();
}
function toggleMute(){
  if(!spotifyPlayer) return;
  if(spotifyPlayerState.muted){
    spotifyPlayer.setVolume(spotifyPlayerState.volumeBeforeMute);
    spotifyPlayerState.volume = spotifyPlayerState.volumeBeforeMute;
    spotifyPlayerState.muted = false;
  } else {
    spotifyPlayerState.volumeBeforeMute = spotifyPlayerState.volume;
    spotifyPlayer.setVolume(0);
    spotifyPlayerState.muted = true;
  }
  renderSpotifyBar();
}
function setSpotifyVolume(v){
  spotifyPlayerState.volume = v;
  spotifyPlayerState.muted = (v === 0);
  if(spotifyPlayer) spotifyPlayer.setVolume(v);
  renderSpotifyBar();
}
function nextSpotifyTrack(){
  if(spotifyPlayer) spotifyPlayer.nextTrack();
}

// --- UI ---
function renderSpotifySettingsPanel(settings){
  const redirectUri = getRedirectUri();
  const connected = !!loadSpotifyAuth();
  return `
    <div class="spotify-panel">
      <div class="sp-panel-title">הגדרות ספוטיפיי</div>
      <p class="sp-panel-hint">1. היכנס ל-<a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a> ולחץ "Create app".</p>
      <p class="sp-panel-hint">2. ב-Redirect URI הדבק בדיוק את הכתובת הזו:</p>
      <div class="sp-redirect-row">
        <div class="sp-redirect-uri">${redirectUri}</div>
        <button type="button" class="sp-copy-btn" data-spotify-action="copy-redirect">העתק</button>
      </div>
      <p class="sp-panel-hint">3. שמור, היכנס להגדרות האפליקציה שיצרת, והעתק משם את ה-Client ID:</p>
      <input type="text" id="sp-client-id" placeholder="Client ID" value="${settings.clientId || ''}">
      <p class="sp-panel-hint">4. הדבק קישור לפלייליסט שאתה רוצה שינגן בזמן התרגול:</p>
      <input type="text" id="sp-playlist" placeholder="קישור לפלייליסט מספוטיפיי" value="${settings.playlistLink || ''}">
      <div class="sp-panel-actions">
        <button type="button" data-spotify-action="save-settings">שמור</button>
        <button type="button" class="secondary" data-spotify-action="close-settings">סגור</button>
      </div>
      ${connected ? `<button type="button" class="sp-disconnect" data-spotify-action="disconnect">התנתק מספוטיפיי</button>` : ''}
    </div>`;
}

function renderSpotifyBar(){
  const el = document.getElementById('spotify-bar');
  if(!el) return;
  const settings = loadSpotifySettings();

  if(spotifySettingsOpen){
    el.innerHTML = renderSpotifySettingsPanel(settings);
    return;
  }

  const auth = loadSpotifyAuth();
  let statusHtml;
  if(!settings.clientId || !settings.playlistUri){
    statusHtml = `<span class="sp-status">🎵 חבר פלייליסט לתרגול</span>`;
  } else if(!auth){
    statusHtml = `<span class="sp-status">🎵 לא מחובר</span><button type="button" data-spotify-action="login" class="sp-btn-text">התחבר</button>`;
  } else if(!spotifyDeviceId){
    statusHtml = `<span class="sp-status">🎵 מתחבר לספוטיפיי...</span>`;
  } else {
    statusHtml = `
      <button type="button" data-spotify-action="playpause" class="sp-btn">${spotifyPlayerState.paused ? '▶️' : '⏸'}</button>
      <div class="sp-track">${spotifyPlayerState.trackName || ''}</div>
      <button type="button" data-spotify-action="mute" class="sp-btn">${spotifyPlayerState.muted ? '🔇' : '🔊'}</button>
      <input type="range" min="0" max="1" step="0.01" value="${spotifyPlayerState.muted ? 0 : spotifyPlayerState.volume}" data-spotify-action="volume" class="sp-volume">
      <button type="button" data-spotify-action="next" class="sp-btn">⏭</button>`;
  }

  el.innerHTML = `
    <div class="spotify-bar">
      ${statusHtml}
      <button type="button" data-spotify-action="open-settings" class="sp-btn sp-gear">⚙</button>
    </div>`;
}

function initSpotifyBarEvents(){
  const el = document.getElementById('spotify-bar');
  if(!el) return;
  el.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-spotify-action]');
    if(!btn) return;
    const action = btn.dataset.spotifyAction;
    if(action === 'login') startSpotifyLogin();
    else if(action === 'open-settings'){ spotifySettingsOpen = true; renderSpotifyBar(); }
    else if(action === 'close-settings'){ spotifySettingsOpen = false; renderSpotifyBar(); }
    else if(action === 'save-settings'){
      const clientId = document.getElementById('sp-client-id').value.trim();
      const playlistLink = document.getElementById('sp-playlist').value.trim();
      saveSpotifySettings({ clientId, playlistLink, playlistUri: normalizePlaylistInput(playlistLink) });
      spotifySettingsOpen = false;
      renderSpotifyBar();
      initSpotifyPlayerIfPossible();
    }
    else if(action === 'disconnect'){
      clearSpotifyAuth();
      if(spotifyPlayer){ spotifyPlayer.disconnect(); spotifyPlayer = null; spotifyDeviceId = null; }
      spotifySettingsOpen = false;
      renderSpotifyBar();
    }
    else if(action === 'playpause') togglePlayPause();
    else if(action === 'mute') toggleMute();
    else if(action === 'next') nextSpotifyTrack();
    else if(action === 'copy-redirect'){
      try{
        await navigator.clipboard.writeText(getRedirectUri());
        const original = btn.textContent;
        btn.textContent = 'הועתק!';
        setTimeout(() => { btn.textContent = original; }, 1500);
      }catch(e){}
    }
  });
  el.addEventListener('input', (e) => {
    if(e.target.dataset.spotifyAction === 'volume'){
      setSpotifyVolume(parseFloat(e.target.value));
    }
  });
}

(async function initSpotify(){
  await handleSpotifyRedirect();
  initSpotifyBarEvents();
  renderSpotifyBar();
  initSpotifyPlayerIfPossible();
})();
