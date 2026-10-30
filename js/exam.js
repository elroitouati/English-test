// בחינה גדולה: מעבר אחד (בלי סבבי חזרה) על כל המילים מכל היחידות יחד.
// בסיום, המילים שסומנו "לא ידעתי" הופכות ליחידה "מתקשה בהם" לתרגול נפרד.
const HARD_GROUP_ID = 'hard';
const EXAM_SESSION_KEY = 'examSession_v2';

let BASE_GROUPS = []; // יחידות הלימוד בלבד (לא כולל "מתקשה בהם")
let examSession = null;

function initExamModule(baseGroups){
  BASE_GROUPS = baseGroups.slice();
  const saved = loadExamSession();
  if(isValidExamSession(saved)) examSession = saved;
}

function examWordsFlat(){
  return BASE_GROUPS.flatMap(g => g.words);
}
function examWordOrigins(){
  return BASE_GROUPS.flatMap(g => g.words.map(() => g.label));
}
function examTotalWords(){
  return examWordsFlat().length;
}

function isValidExamSession(s){
  if(!s || typeof s !== 'object') return false;
  if(!Array.isArray(s.queue) || !Array.isArray(s.history) || !Array.isArray(s.unknownWords)) return false;
  if(typeof s.pos !== 'number' || typeof s.known !== 'number' || typeof s.unknown !== 'number') return false;
  const total = examTotalWords();
  if(s.queue.length !== total) return false;
  if(s.pos < 0 || s.pos > s.queue.length) return false;
  return s.queue.every(i => Number.isInteger(i) && i >= 0 && i < total);
}

function loadExamSession(){
  try{ return JSON.parse(localStorage.getItem(EXAM_SESSION_KEY)); }catch(e){ return null; }
}
function saveExamSession(){
  try{
    if(examSession) localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(examSession));
    else localStorage.removeItem(EXAM_SESSION_KEY);
  }catch(e){}
}

function newExamSession(){
  const total = examTotalWords();
  return {
    queue: shuffle(Array.from({length: total}, (_, i) => i)),
    pos: 0,
    known: 0,
    unknown: 0,
    unknownWords: [], // [[en,he], ...] - הופכות ליחידה "מתקשה בהם" בסיום
    history: [],
    flipped: false,
    seen: false,
  };
}

function renderExamEntryCard(){
  const total = examTotalWords();
  let meta = `כל <bdi>${total}</bdi> המילים מכל היחידות, ברצף אחד`;
  let meter = '';
  if(examSession){
    meta = `בתהליך · <bdi>${examSession.pos}/${total}</bdi>`;
    meter = `<span class="meter"><span style="width:${Math.round(examSession.pos / total * 100)}%"></span></span>`;
  }
  return `
    <button class="exam-row pressable" data-action="open-exam">
      <span class="exam-icon">${icon('stack')}</span>
      <span class="unit-body">
        <span class="unit-name">בחינה גדולה</span>
        <span class="unit-meta">${meta}</span>
        ${meter}
      </span>
      <span class="row-go">${icon('forward')}</span>
    </button>`;
}

function openExam(){
  if(!isValidExamSession(examSession)) examSession = newExamSession();
  curGroupId = '__exam__';
  render();
}

function renderExamScreen(){
  if(!isValidExamSession(examSession)) examSession = newExamSession();
  const s = examSession;
  if(s.pos >= s.queue.length) return renderExamDone();

  const words = examWordsFlat();
  const w = words[s.queue[s.pos]];
  const origin = examWordOrigins()[s.queue[s.pos]];
  const goodPct = s.known / s.queue.length * 100;
  const badPct = s.unknown / s.queue.length * 100;
  let face;
  if(s.flipped){
    face = `<span class="ic-word ic-word-he">${w[1]}</span>`;
  } else {
    const { main, pos } = splitPos(w[0]);
    face = `<span class="ic-word" dir="ltr">${main}${pos ? ` <span class="ic-pos">${pos}</span>` : ''}</span>`;
  }
  return `
    <header class="topbar">
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>יחידות</span></button>
      <h1 class="topbar-title">בחינה גדולה</h1>
    </header>
    <div class="round">
      <div class="round-bar" aria-hidden="true">
        <span class="seg-good" style="width:${goodPct}%"></span><span class="seg-bad" style="width:${badPct}%"></span>
      </div>
      <div class="round-stats">
        <span class="stat stat-good"><b>${s.known}</b> ידעתי</span>
        <span class="stat stat-bad"><b>${s.unknown}</b> לא ידעתי</span>
        <span class="stat stat-left"><b>${s.queue.length - s.pos}</b> נותרו</span>
      </div>
    </div>
    <button class="index-card${s.flipped ? ' is-back' : ''}" data-action="exam-flip" ${cardAnim ? `data-anim="${cardAnim}"` : ''} aria-label="הפוך את הכרטיסייה">
      <span class="ic-head">
        <bdi class="ic-side">${origin}</bdi>
        <bdi class="ic-count">${s.pos + 1}/${s.queue.length}</bdi>
      </span>
      ${face}
      <span class="ic-hint">${s.seen ? '' : 'הקש כדי לראות את התרגום'}</span>
    </button>
    <div class="answer-row">
      <button class="btn btn-bad pressable" ${!s.seen?'disabled':''} data-action="exam-answer" data-know="false">${icon('x')}<span>לא ידעתי</span></button>
      <button class="btn btn-good pressable" ${!s.seen?'disabled':''} data-action="exam-answer" data-know="true">${icon('check')}<span>ידעתי</span></button>
    </div>
    <div class="tool-row">
      <button class="btn-quiet pressable" data-action="exam-undo" ${s.history.length===0?'disabled':''}>${icon('undo')}<span>חזור למילה הקודמת</span></button>
      <button class="icon-btn pressable" data-action="exam-speak" aria-label="השמע הגייה">${icon('speaker')}</button>
    </div>
  `;
}

function renderExamDone(){
  const s = examSession;
  const total = examTotalWords();
  const hardCount = s.unknownWords.length;
  let body;
  if(hardCount > 0){
    upsertHardGroup(s.unknownWords);
    body = `
      <p>ידעת <bdi>${s.known}</bdi> מתוך <bdi>${total}</bdi> מילים. ה-<bdi>${hardCount}</bdi> שלא ידעת נכנסו ליחידה חדשה, "מתקשה בהם".</p>
      <button class="btn btn-primary pressable" data-action="open-hard">תרגל את "מתקשה בהם"</button>
      <button class="btn btn-secondary pressable" data-action="home">חזרה ליחידות</button>`;
  } else {
    removeHardGroup();
    body = `
      <p>ידעת את כל <bdi>${total}</bdi> המילים. אתה מוכן למבחן.</p>
      <button class="btn btn-primary pressable" data-action="home">חזרה ליחידות</button>`;
  }
  examSession = null;
  saveExamSession();
  return `
    <header class="topbar">
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>יחידות</span></button>
      <h1 class="topbar-title">בחינה גדולה</h1>
    </header>
    <section class="done-screen">
      <span class="done-mark">${icon('check')}</span>
      <h2>סיימת את הבחינה הגדולה</h2>
      ${body}
    </section>
  `;
}

function upsertHardGroup(unknownWords){
  let g = GROUPS.find(x => x.id === HARD_GROUP_ID);
  if(!g){
    g = { id: HARD_GROUP_ID, label: 'מתקשה בהם', dotLabel: '!', dynamic: true, words: [], practiceCount: 0, session: null };
    GROUPS.push(g);
  }
  g.words = unknownWords.slice();
  g.practiceCount = 0;
  g.session = null;
}
function removeHardGroup(){
  const idx = GROUPS.findIndex(x => x.id === HARD_GROUP_ID);
  if(idx !== -1) GROUPS.splice(idx, 1);
}
function openHardGroup(){
  curGroupId = HARD_GROUP_ID;
  render();
}

function examFlip(){
  examSession.flipped = !examSession.flipped;
  if(examSession.flipped) examSession.seen = true;
  cardAnim = 'flip';
  saveExamSession();
  render();
}
function examAnswer(knew){
  const s = examSession;
  const words = examWordsFlat();
  const wordIdx = s.queue[s.pos];
  s.history.push({ knew });
  if(knew){ s.known += 1; }
  else { s.unknown += 1; s.unknownWords.push(words[wordIdx]); }
  s.pos += 1;
  s.flipped = false;
  s.seen = false;
  cardAnim = 'next';
  saveExamSession();
  render();
}
function examGoBack(){
  const s = examSession;
  if(!s || s.history.length === 0) return;
  const last = s.history.pop();
  s.pos -= 1;
  if(last.knew){ s.known -= 1; }
  else { s.unknown -= 1; s.unknownWords.pop(); }
  s.flipped = false;
  s.seen = false;
  cardAnim = 'next';
  saveExamSession();
  render();
}
function examSpeak(){
  if(!('speechSynthesis' in window)) return;
  const s = examSession;
  const w = examWordsFlat()[s.queue[s.pos]];
  const rawText = s.flipped ? w[1] : w[0];
  const text = rawText.replace(/\s*\([^)]*\)\s*$/, '').trim();
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = s.flipped ? 'he-IL' : 'en-US';
  window.speechSynthesis.speak(utter);
}
