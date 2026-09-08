// בחינה גדולה: מעבר חד-פעמי (בלי סבבי חזרה) על כל המילים מכל היחידות יחד.
// בסיום, המילים שסומנו "לא ידעתי" הופכות ליחידה מיוחדת "מתקשה בהם" לתרגול נפרד.
const HARD_GROUP_ID = 'hard';
const HARD_GROUP_COLOR = '#c1121f';
const EXAM_SESSION_KEY = 'examSession_v1';

let BASE_GROUPS = []; // 5 היחידות המקוריות בלבד (לא כולל "מתקשה בהם")
let examSession = null;

function initExamModule(baseGroups){
  BASE_GROUPS = baseGroups.slice();
  const saved = loadExamSession();
  if(isValidExamSession(saved)) examSession = saved;
}

function examWordsFlat(){
  return BASE_GROUPS.flatMap(g => g.words);
}
function examTotalWords(){
  return examWordsFlat().length;
}

function isValidExamSession(s){
  if(!s || typeof s !== 'object') return false;
  if(!Array.isArray(s.queue) || !Array.isArray(s.history) || !Array.isArray(s.unknownWords)) return false;
  if(typeof s.pos !== 'number' || typeof s.known !== 'number' || typeof s.unknown !== 'number') return false;
  const total = examTotalWords();
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
    unknownWords: [], // [[en,he], ...] - נאספות בזמן הבחינה, הופכות ליחידה "מתקשה בהם" בסיום
    history: [],
    flipped: false,
    seen: false,
  };
}

function renderExamEntryCard(){
  const total = examTotalWords();
  const statusText = examSession
    ? `בתהליך · ${examSession.pos}/${total}`
    : `כל ${total} המילים מכל היחידות, ברצף אחד`;
  return `
    <div class="exam-card" data-action="open-exam">
      <div class="exam-card-icon">🎓</div>
      <div class="exam-card-info">
        <b>בחינה גדולה</b>
        <div class="exam-card-meta">${statusText}</div>
      </div>
      <div class="exam-card-arrow">‹</div>
    </div>`;
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
  const remaining = s.queue.length - s.pos;
  return `
    <div class="top-bar">
      <button class="back-btn" data-action="home">← היחידות</button>
      <div class="unit-title">בחינה גדולה</div>
    </div>
    <div class="stat-row">
      <div class="stat-pill g"><b>${s.known}</b><span>ידע</span></div>
      <div class="stat-pill r"><b>${s.unknown}</b><span>לא ידע</span></div>
      <div class="stat-pill n"><b>${remaining}</b><span>נותרו</span></div>
    </div>
    <div class="flashcard ${s.flipped?'flipped':''}" dir="auto" data-action="exam-flip">
      ${s.flipped ? w[1] : w[0]}
      <div class="tap-hint">${s.seen ? 'הקש להחלפה' : 'הקש לחשיפת התרגום'}</div>
    </div>
    <div class="know-row">
      <button class="btn-no" ${!s.seen?'disabled':''} data-action="exam-answer" data-know="false">✗ לא ידעתי</button>
      <button class="btn-yes" ${!s.seen?'disabled':''} data-action="exam-answer" data-know="true">✓ ידעתי</button>
    </div>
    <div class="undo-row">
      <button class="undo-btn" data-action="exam-undo" ${s.history.length===0?'disabled':''}>↩ חזור למילה הקודמת</button>
      <button class="speak-btn" data-action="exam-speak" aria-label="השמע הגייה">🔊</button>
    </div>
  `;
}

function renderExamDone(){
  const s = examSession;
  const total = examTotalWords();
  const hardCount = s.unknownWords.length;
  let hardMessage;
  if(hardCount > 0){
    upsertHardGroup(s.unknownWords);
    hardMessage = `
      <p>נוצרה עבורך יחידה חדשה "מתקשה בהם" עם ${hardCount} מילים שסימנת "לא ידעתי" - אפשר לתרגל אותן עכשיו.</p>
      <button data-action="open-hard">תרגל את "מתקשה בהם" עכשיו</button>`;
  } else {
    removeHardGroup();
    hardMessage = `<p>ידעת את כל ${total} המילים! מוכן/ה למבחן 💪</p>`;
  }
  examSession = null;
  saveExamSession();
  return `
    <div class="top-bar">
      <button class="back-btn" data-action="home">← היחידות</button>
      <div class="unit-title">בחינה גדולה</div>
    </div>
    <div class="done-screen">
      <div class="big">🎓</div>
      <h2>סיימת את הבחינה הגדולה!</h2>
      <p>ידעת ${s.known} מתוך ${total} מילים.</p>
      ${hardMessage}
      <button class="secondary" data-action="home">חזרה לרשימת היחידות</button>
    </div>
  `;
}

function upsertHardGroup(unknownWords){
  let g = GROUPS.find(x => x.id === HARD_GROUP_ID);
  if(!g){
    g = { id: HARD_GROUP_ID, label: 'מתקשה בהם', words: [], color: HARD_GROUP_COLOR, practiceCount: 0, session: null };
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
  saveExamSession();
  render();
}
function examSpeak(){
  if(!('speechSynthesis' in window)) return;
  const s = examSession;
  const words = examWordsFlat();
  const w = words[s.queue[s.pos]];
  const rawText = s.flipped ? w[1] : w[0];
  const text = rawText.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const lang = s.flipped ? 'he-IL' : 'en-US';
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
}
