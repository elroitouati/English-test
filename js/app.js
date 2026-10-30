const GROUPS = buildGroups();
const BASE_GROUPS_SNAPSHOT = GROUPS.slice(); // יחידות הלימוד, לפני שאולי מתווספת "מתקשה בהם"
applySavedState(GROUPS, loadSavedState());
initExamModule(BASE_GROUPS_SNAPSHOT);

let curGroupId = null; // מזהה היחידה/מסך פעיל: null = בית, אחרת מזהה יחידה

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function newSession(group){
  return {
    queue: shuffle(group.words.map((_,i)=>i)),
    pos: 0,
    retry: [],
    known: 0,   // מספר המילים שסומנו "ידעתי" בסבב הנוכחי (מוצג בעיגול "ידע")
    toRetry: 0, // מספר המילים שסומנו "לא ידעתי" בתת-הסבב הנוכחי (מתאפס בכל תת-סבב)
    flipped: false,
    seen: false, // האם התרגום נחשף לפחות פעם אחת בכרטיסייה הנוכחית
    roundLabel: 1, // מספר תת-הסבב בתוך התרגול (1 = מעבר ראשון על כל המילים)
    history: [], // תשובות שניתנו בתת-הסבב הנוכחי, כדי לאפשר "חזור למילה הקודמת"
  };
}

function getGroup(id){
  return GROUPS.find(g=>g.id===id);
}

// בודק שמצב שמור (מגרסה קודמת של האפליקציה, למשל) עדיין תואם למבנה הנוכחי,
// כדי שלעולם לא ניתקע במסך ריק בגלל שדה חסר או ערך לא תקין ממצב ישן.
function isValidSession(s, group){
  if(!s || typeof s !== 'object') return false;
  if(!Array.isArray(s.queue) || !Array.isArray(s.retry) || !Array.isArray(s.history)) return false;
  if(typeof s.pos !== 'number' || typeof s.known !== 'number' || typeof s.toRetry !== 'number' || typeof s.roundLabel !== 'number') return false;
  if(s.pos < 0 || s.pos > s.queue.length) return false;
  const total = group.words.length;
  const isValidIdx = (i) => Number.isInteger(i) && i >= 0 && i < total;
  if(!s.queue.every(isValidIdx) || !s.retry.every(isValidIdx)) return false;
  return true;
}

function ensureSession(group){
  if(!isValidSession(group.session, group)) group.session = newSession(group);
}

let lastScreen = undefined; // כדי להריץ אנימציית כניסה רק כשעוברים מסך, לא בכל עדכון
let cardAnim = ''; // 'flip' | 'next' - איך הכרטיסייה הבאה נכנסת

function render(){
  const app = document.getElementById('app');
  try{
    if(curGroupId===null){
      app.innerHTML = renderHome();
    } else if(curGroupId==='__plan__'){
      app.innerHTML = renderPlanScreen();
    } else if(curGroupId==='__exam__'){
      app.innerHTML = renderExamScreen();
    } else {
      const g = getGroup(curGroupId);
      ensureSession(g);
      app.innerHTML = renderPractice(g);
    }
  }catch(e){
    // רשת הגנה אחרונה: מצב שמור פגום בכל זאת גרם לשגיאה - מתחילים סבב נקי במקום להיתקע
    if(curGroupId==='__exam__'){
      examSession = newExamSession();
      app.innerHTML = renderExamScreen();
    } else if(curGroupId !== null && curGroupId !== '__plan__'){
      const g = getGroup(curGroupId);
      if(g){ g.session = newSession(g); app.innerHTML = renderPractice(g); }
      else { curGroupId = null; app.innerHTML = renderHome(); }
    } else {
      curGroupId = null;
      app.innerHTML = renderHome();
    }
  }
  const screen = curGroupId === null ? 'home' : curGroupId;
  app.dataset.screen = curGroupId === null ? 'home' : curGroupId === '__plan__' ? 'plan' : 'practice';
  app.classList.toggle('screen-enter', screen !== lastScreen);
  if(screen !== lastScreen) window.scrollTo(0, 0);
  lastScreen = screen;
  cardAnim = '';
  saveState(GROUPS);
  updateCountdownDisplay();
}

function renderHome(){
  const totalWords = BASE_GROUPS_SNAPSHOT.reduce((s,g)=>s+g.words.length,0);
  const planCard = renderPlanCard();
  let html = `
  <header class="home-head">
    <bdi class="eyebrow">Mindset Plus · Unit 1</bdi>
    <h1>אוצר מילים למבחן</h1>
    <p class="lede"><bdi>${totalWords}</bdi> מילים · <bdi>${BASE_GROUPS_SNAPSHOT.length}</bdi> יחידות</p>
  </header>
  <section class="bento${planCard ? '' : ' bento-single'}">
    ${renderCountdownCard()}
    ${planCard}
  </section>
  ${renderExamEntryCard()}
  <h2 class="section-title">יחידות</h2>
  <div class="unit-list">`;
  GROUPS.forEach(g=>{
    const s = g.session;
    let meta = `<bdi>${g.words.length}</bdi> מילים`;
    let meter = '';
    if(s){
      const pct = Math.round((s.known / g.words.length)*100);
      meta = `בתהליך · ידעת <bdi>${s.known}/${g.words.length}</bdi>`;
      meter = `<span class="meter"><span style="width:${pct}%"></span></span>`;
    }
    html += `<button class="unit pressable" data-action="open" data-id="${g.id}">
      ${renderFlameBadge(g.practiceCount, g.dotLabel)}
      <span class="unit-body">
        <bdi class="unit-name">${g.label}</bdi>
        <span class="unit-meta">${meta}</span>
        ${meter}
      </span>
      <span class="chip">תרגול <bdi>${g.practiceCount}</bdi></span>
    </button>`;
  });
  html += `</div>`;
  return html;
}

// מפריד את סימון חלק הדיבר בסוף המילה (למשל "(n, v)") כדי להציג אותו קטן יותר
function splitPos(word){
  const m = word.match(/^(.*?)\s*(\((?:n|v|adj|adv)(?:,\s*(?:n|v|adj|adv))*\))$/);
  return m ? { main: m[1], pos: m[2] } : { main: word, pos: '' };
}

function renderPractice(g){
  const s = g.session;
  if(s.pos >= s.queue.length){
    if(s.retry.length > 0){
      // פתיחת תת-סבב חדש עם המילים שסומנו "לא ידעתי" בלבד
      s.queue = shuffle(s.retry);
      s.retry = [];
      s.pos = 0;
      s.toRetry = 0;
      s.roundLabel += 1;
      s.flipped = false;
      s.seen = false;
      s.history = [];
    } else {
      // סבב שלם עבר בלי אף "לא ידעתי" - סיום תרגול מלא על היחידה
      g.practiceCount += 1;
      return renderDone(g);
    }
  }
  const wordIdx = s.queue[s.pos];
  const w = g.words[wordIdx];
  const remaining = s.queue.length - s.pos;
  const goodPct = (s.pos - s.toRetry) / s.queue.length * 100;
  const badPct = s.toRetry / s.queue.length * 100;
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
      <bdi class="topbar-title">${g.label}</bdi>
    </header>
    <div class="round">
      <div class="round-bar" aria-hidden="true">
        <span class="seg-good" style="width:${goodPct}%"></span><span class="seg-bad" style="width:${badPct}%"></span>
      </div>
      <div class="round-stats">
        <span class="stat stat-good"><b>${s.known}</b> ידעתי</span>
        <span class="stat stat-bad"><b>${s.toRetry}</b> לחזרה</span>
        <span class="stat stat-left"><b>${remaining}</b> נותרו</span>
      </div>
    </div>
    ${s.roundLabel>1 ? `<p class="round-chip">סבב חזרה <bdi>${s.roundLabel}</bdi> · רק המילים שסימנת "לא ידעתי"</p>` : ''}
    <button class="index-card${s.flipped ? ' is-back' : ''}" data-action="flip" ${cardAnim ? `data-anim="${cardAnim}"` : ''} aria-label="הפוך את הכרטיסייה">
      <span class="ic-head">
        <span class="ic-side">${s.flipped ? 'תרגום' : 'English'}</span>
        <bdi class="ic-count">${s.pos + 1}/${s.queue.length}</bdi>
      </span>
      ${face}
      <span class="ic-hint">${s.seen ? '' : 'הקש כדי לראות את התרגום'}</span>
    </button>
    <div class="answer-row">
      <button class="btn btn-bad pressable" ${!s.seen?'disabled':''} data-action="answer" data-know="false">${icon('x')}<span>לא ידעתי</span></button>
      <button class="btn btn-good pressable" ${!s.seen?'disabled':''} data-action="answer" data-know="true">${icon('check')}<span>ידעתי</span></button>
    </div>
    <div class="tool-row">
      <button class="btn-quiet pressable" data-action="undo" ${s.history.length===0?'disabled':''}>${icon('undo')}<span>חזור למילה הקודמת</span></button>
      <button class="icon-btn pressable" data-action="speak" aria-label="השמע הגייה">${icon('speaker')}</button>
    </div>
  `;
}

function renderDone(g){
  g.session = null;
  return `
    <header class="topbar">
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>יחידות</span></button>
      <bdi class="topbar-title">${g.label}</bdi>
    </header>
    <section class="done-screen">
      <span class="done-mark">${icon('check')}</span>
      <h2>ידעת את כל המילים ביחידה</h2>
      <p>זה תרגול מספר <bdi>${g.practiceCount}</bdi> על היחידה הזאת.</p>
      <button class="btn btn-primary pressable" data-action="restart" data-id="${g.id}">${icon('restart')}<span>עוד תרגול על היחידה</span></button>
      <button class="btn btn-secondary pressable" data-action="home">חזרה ליחידות</button>
    </section>
  `;
}

function openGroup(id){
  curGroupId = id;
  render();
}
function goHome(){
  curGroupId = null;
  render();
}
function restartGroup(id){
  const g = getGroup(id);
  g.session = newSession(g);
  curGroupId = id;
  render();
}
function flipCard(){
  const s = getGroup(curGroupId).session;
  s.flipped = !s.flipped;
  if(s.flipped) s.seen = true;
  cardAnim = 'flip';
  render();
}
function speakCurrentWord(){
  if(!('speechSynthesis' in window)) return;
  const g = getGroup(curGroupId);
  const s = g.session;
  const w = g.words[s.queue[s.pos]];
  const rawText = s.flipped ? w[1] : w[0];
  // מסירים הערה בסוגריים בסוף (למשל "(v)") - היא לא חלק מההגייה של המילה
  const text = rawText.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const lang = s.flipped ? 'he-IL' : 'en-US';
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
}
function answer(knew){
  const s = getGroup(curGroupId).session;
  const wordIdx = s.queue[s.pos];
  s.history.push({wordIdx, knew});
  if(knew){ s.known += 1; }
  else { s.retry.push(wordIdx); s.toRetry += 1; }
  s.pos += 1;
  s.flipped = false;
  s.seen = false;
  cardAnim = 'next';
  render();
}
function goBack(){
  const s = getGroup(curGroupId).session;
  if(!s || s.history.length === 0) return;
  const last = s.history.pop();
  s.pos -= 1;
  if(last.knew){
    s.known -= 1;
  } else {
    const idx = s.retry.lastIndexOf(last.wordIdx);
    if(idx !== -1) s.retry.splice(idx, 1);
    s.toRetry -= 1;
  }
  s.flipped = false;
  s.seen = false;
  cardAnim = 'next';
  render();
}

document.getElementById('app').addEventListener('click', (e)=>{
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  if(action==='open') openGroup(el.dataset.id);
  else if(action==='home') goHome();
  else if(action==='restart') restartGroup(el.dataset.id);
  else if(action==='flip') flipCard();
  else if(action==='answer'){
    if(el.disabled) return;
    answer(el.dataset.know==='true');
  }
  else if(action==='undo'){
    if(el.disabled) return;
    goBack();
  }
  else if(action==='speak'){
    speakCurrentWord();
  }
  else if(action==='open-plan') openPlan();
  else if(action==='open-exam') openExam();
  else if(action==='open-hard') openHardGroup();
  else if(action==='exam-flip') examFlip();
  else if(action==='exam-answer'){
    if(el.disabled) return;
    examAnswer(el.dataset.know==='true');
  }
  else if(action==='exam-undo'){
    if(el.disabled) return;
    examGoBack();
  }
  else if(action==='exam-speak') examSpeak();
  else if(action==='plan-toggle') togglePlanTask(el.dataset.task);
});

render();
