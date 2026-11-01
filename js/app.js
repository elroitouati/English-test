const GROUPS = buildGroups();
const BASE_GROUPS_SNAPSHOT = GROUPS.slice(); // יחידות הלימוד, לפני שאולי מתווספת "מתקשה בהם"
applySavedState(GROUPS, loadSavedState());
initExamModule(BASE_GROUPS_SNAPSHOT);

// מסך פעיל: null = הכנה (בית), '__cards__' = כרטיסיות, '__exam__' = בחינה גדולה, אחרת מזהה יחידה
let curGroupId = screenFromHash();
let returnScreen = curGroupId; // לאן חוזרים מתרגול: הכנה או כרטיסיות

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

function screenFromHash(){
  return location.hash === '#cards' ? '__cards__' : null;
}
function backLabel(){
  return returnScreen === '__cards__' ? 'כרטיסיות' : 'הכנה';
}
function rememberReturn(){
  if(curGroupId === null || curGroupId === '__cards__') returnScreen = curGroupId;
}

function render(){
  const app = document.getElementById('app');
  try{
    if(curGroupId===null){
      app.innerHTML = renderHome();
    } else if(curGroupId==='__cards__'){
      app.innerHTML = renderCards();
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
    } else if(curGroupId !== null){
      const g = getGroup(curGroupId);
      if(g){ g.session = newSession(g); app.innerHTML = renderPractice(g); }
      else { curGroupId = null; app.innerHTML = renderHome(); }
    } else {
      curGroupId = null;
      app.innerHTML = renderHome();
    }
  }
  const screen = curGroupId === null ? 'home' : curGroupId;
  const kind = curGroupId === null ? 'home' : curGroupId === '__cards__' ? 'cards' : 'practice';
  app.dataset.screen = kind;
  document.body.dataset.screen = kind;
  document.getElementById('tabbar').innerHTML = renderTabbar(kind === 'cards' ? 'cards' : 'home');
  app.classList.toggle('screen-enter', screen !== lastScreen);
  if(screen !== lastScreen) window.scrollTo(0, 0);
  lastScreen = screen;
  cardAnim = '';
  saveState(GROUPS);
  updateCountdownDisplay();
}

function loadLessonScores(){
  try{ return JSON.parse(localStorage.getItem('lessonScores_v1')) || {}; }catch(e){ return {}; }
}

// "מה יש במבחן": ארבעת חלקי המבחן לפי דף החומר, עם ההתקדמות שלך בכל אחד
function renderExamMap(){
  const words = BASE_GROUPS_SNAPSHOT.reduce((s,g)=>s+g.words.length,0);
  const practiced = BASE_GROUPS_SNAPSHOT.filter(g => g.practiceCount > 0).length;
  const scores = loadLessonScores();
  const grammarKeys = ['present-grammar', 'r13a', 'r13b', 'r14a', 'r14b', 'r17a', 'r17b', 'r18a', 'r18b'];
  const grammarDone = grammarKeys.filter(k => scores[k]).length;
  const tile = (o) => `
    <${o.href ? `a href="${o.href}"` : o.action ? `button data-action="${o.action}"` : 'div'} class="map-tile${o.href || o.action ? ' pressable' : ''}">
      <span class="map-top"><span class="map-icon">${icon(o.icon)}</span><span class="map-name">${o.name}</span></span>
      <span class="map-stat">${o.stat}</span>
      <span class="map-sub">${o.sub}</span>
      ${o.meter !== undefined ? `<span class="meter"><span style="width:${o.meter}%"></span></span><span class="map-progress">${o.progress}</span>` : `<span class="map-progress map-tip">${o.progress}</span>`}
    </${o.href ? 'a' : o.action ? 'button' : 'div'}>`;
  return `<div class="exam-map">
    ${tile({ icon: 'stack', name: 'אוצר מילים', stat: `<span class="map-int">${words}</span> מילים`, sub: 'כל המילים בעמ׳ <bdi>32</bdi> בספר',
      meter: practiced / BASE_GROUPS_SNAPSHOT.length * 100, progress: `<bdi>${practiced}/${BASE_GROUPS_SNAPSHOT.length}</bdi> יחידות תורגלו`, href: '#cards' })}
    ${tile({ icon: 'book', name: 'דקדוק', stat: '<span class="map-int">4</span> זמנים', sub: 'הווה ועבר, <bdi>Simple</bdi> ו-<bdi>Progressive</bdi>',
      meter: grammarDone / grammarKeys.length * 100, progress: `<bdi>${grammarDone}/${grammarKeys.length}</bdi> תרגולים הושלמו`, href: 'lesson.html' })}
    ${tile({ icon: 'doc', name: 'הבנת הנקרא', stat: 'טקסט חדש', sub: 'על הנושא והמילים של היחידה',
      progress: 'הכנה: לשלוט במילים ולקרוא שוב את הטקסטים של יחידה <bdi>1</bdi>' })}
    ${tile({ icon: 'pencil', name: 'כתיבה', stat: 'משפטים', sub: 'עם מילים מאוצר המילים',
      progress: 'תרגול: משפטים משלך בדפי החזרה', href: 'lesson.html#past/review/r14b' })}
  </div>`;
}

// "להמשיך מאיפה שעצרת": תרגול פתוח שכבר התחלת
function renderResume(){
  if(examSession && examSession.pos > 0){
    return resumeRow('open-exam', '', 'בחינה גדולה', `<bdi>${examSession.pos}/${examSession.queue.length}</bdi>`);
  }
  const g = GROUPS.find(x => x.session && (x.session.pos > 0 || x.session.roundLabel > 1));
  if(!g) return '';
  return resumeRow('open', g.id, `<bdi>${g.label}</bdi>`, `ידעת <bdi>${g.session.known}/${g.words.length}</bdi>`);
}
function resumeRow(action, id, name, meta){
  return `<button class="resume pressable" data-action="${action}"${id ? ` data-id="${id}"` : ''}>
    <span class="resume-icon">${icon('play')}</span>
    <span class="unit-body"><span class="resume-label">להמשיך מאיפה שעצרת</span><span class="unit-name">${name}</span></span>
    <span class="chip">${meta}</span>
  </button>`;
}

function renderHome(){
  return `
  <header class="brand">
    <span class="brand-mark">${logoSvg(false)}</span>
    <span class="brand-text">
      <bdi class="eyebrow">Mindset Plus · Unit 1</bdi>
      <h1>הכנה למבחן באנגלית</h1>
    </span>
  </header>
  ${renderCountdownCard()}
  ${renderResume()}
  <h2 class="section-title">מה יש במבחן</h2>
  ${renderExamMap()}
  <h2 class="section-title">איך מתכוננים: התוכנית שלך</h2>
  ${renderStudyCenter()}`;
}

function renderUnitList(){
  return `<div class="unit-list">${GROUPS.map(g=>{
    const s = g.session;
    let meta = `<bdi>${g.words.length}</bdi> מילים`;
    let meter = '';
    if(s){
      const pct = Math.round((s.known / g.words.length)*100);
      meta = `בתהליך · ידעת <bdi>${s.known}/${g.words.length}</bdi>`;
      meter = `<span class="meter"><span style="width:${pct}%"></span></span>`;
    }
    return `<button class="unit pressable" data-action="open" data-id="${g.id}">
      ${renderFlameBadge(g.practiceCount, g.dotLabel)}
      <span class="unit-body">
        <bdi class="unit-name">${g.label}</bdi>
        <span class="unit-meta">${meta}</span>
        ${meter}
      </span>
      <span class="chip">תרגול <bdi>${g.practiceCount}</bdi></span>
    </button>`;
  }).join('')}</div>`;
}

function renderCards(){
  const totalWords = BASE_GROUPS_SNAPSHOT.reduce((s,g)=>s+g.words.length,0);
  return `
  <header class="page-head">
    <h1>כרטיסיות</h1>
    <p class="lede"><bdi>${totalWords}</bdi> מילים מעמ׳ <bdi>32</bdi> · <bdi>${BASE_GROUPS_SNAPSHOT.length}</bdi> יחידות</p>
  </header>
  <div class="home-rows">${renderExamEntryCard()}</div>
  <h2 class="section-title">יחידות</h2>
  ${renderUnitList()}`;
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
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>${backLabel()}</span></button>
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
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>${backLabel()}</span></button>
      <bdi class="topbar-title">${g.label}</bdi>
    </header>
    <section class="done-screen">
      <span class="done-mark">${icon('check')}</span>
      <h2>ידעת את כל המילים ביחידה</h2>
      <p>זה תרגול מספר <bdi>${g.practiceCount}</bdi> על היחידה הזאת.</p>
      <button class="btn btn-primary pressable" data-action="restart" data-id="${g.id}">${icon('restart')}<span>עוד תרגול על היחידה</span></button>
      <button class="btn btn-secondary pressable" data-action="home">חזרה ל${backLabel()}</button>
    </section>
  `;
}

function openGroup(id){
  rememberReturn();
  curGroupId = id;
  render();
}
function goHome(){
  curGroupId = returnScreen;
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
  const g = getGroup(curGroupId);
  const s = g.session;
  const w = g.words[s.queue[s.pos]];
  const rawText = s.flipped ? w[1] : w[0];
  // מסירים הערה בסוגריים בסוף (למשל "(v)") - היא לא חלק מההגייה של המילה
  const text = rawText.replace(/\s*\([^)]*\)\s*$/, '').trim();
  speakText(text, s.flipped ? 'he-IL' : 'en-US');
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
  else if(action==='select-day') selectStudyDay(el.dataset.date);
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

// כפתור "חזור" של אנדרואיד: סוגר תרגול פתוח במקום לצאת מהמסך
window.appBack = function(){
  if(curGroupId === null || curGroupId === '__cards__') return false;
  goHome();
  return true;
};

window.addEventListener('hashchange', () => {
  curGroupId = screenFromHash();
  returnScreen = curGroupId;
  render();
});

render();
