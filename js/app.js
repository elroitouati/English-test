const GROUPS = buildGroups();
applySavedState(GROUPS, loadSavedState());

let curGroupId = null; // מזהה היחידה שפתוחה כרגע במסך תרגול, או null במסך הבית

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

function ensureSession(group){
  if(!group.session) group.session = newSession(group);
}

function render(){
  const app = document.getElementById('app');
  if(curGroupId===null){
    app.innerHTML = renderHome();
  } else {
    const g = getGroup(curGroupId);
    ensureSession(g);
    app.innerHTML = renderPractice(g);
  }
  saveState(GROUPS);
  updateCountdownDisplay();
}

function renderHome(){
  const totalWords = GROUPS.reduce((s,g)=>s+g.words.length,0);
  let html = `<h1>כרטיסיות אוצר מילים</h1>
  <div class="sub">${totalWords} מילים · ${GROUPS.length} יחידות מאוחדות</div>
  ${renderCountdownCard()}
  <div class="units-grid">`;
  GROUPS.forEach(g=>{
    const s = g.session;
    let metaText = `${g.words.length} מילים`;
    let pct = 0;
    if(s){
      pct = Math.round((s.known / g.words.length)*100);
      metaText = `בתהליך · ${s.known}/${g.words.length} ידע`;
    }
    const dotLabel = g.label.replace('יחידות ','').replace('יחידה ','');
    html += `<div class="unit-card" style="--c:${g.color};" data-action="open" data-id="${g.id}">
      ${renderFlameBadge(g.practiceCount, dotLabel)}
      <div class="info">
        <b>${g.label}</b>
        <div class="meta">${metaText}</div>
        <div class="progress-mini"><div style="width:${pct}%;"></div></div>
      </div>
      <div class="badge">תרגול ${g.practiceCount}</div>
    </div>`;
  });
  html += `</div>`;
  return html;
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
  return `
    <div class="top-bar">
      <button class="back-btn" data-action="home">← היחידות</button>
      <div class="unit-title">${g.label}</div>
    </div>
    <div class="stat-row">
      <div class="stat-pill g"><b>${s.known}</b><span>ידע</span></div>
      <div class="stat-pill r"><b>${s.toRetry}</b><span>לחזרה</span></div>
      <div class="stat-pill n"><b>${remaining}</b><span>נותרו בסבב</span></div>
    </div>
    <div class="undo-row">
      <button class="undo-btn" data-action="undo" ${s.history.length===0?'disabled':''}>↩ חזור למילה הקודמת</button>
    </div>
    <div class="flashcard ${s.flipped?'flipped':''}" dir="auto" data-action="flip">
      ${s.flipped ? w[1] : w[0]}
      <div class="tap-hint">${s.seen ? 'הקש להחלפה' : 'הקש לחשיפת התרגום'}</div>
    </div>
    <div class="know-row">
      <button class="btn-no" ${!s.seen?'disabled':''} data-action="answer" data-know="false">✗ לא ידעתי</button>
      <button class="btn-yes" ${!s.seen?'disabled':''} data-action="answer" data-know="true">✓ ידעתי</button>
    </div>
    ${s.roundLabel>1 ? `<div class="round-note">סבב חזרה מס׳ ${s.roundLabel} · רק על המילים שסימנת "לא ידעתי"</div>` : ''}
  `;
}

function renderDone(g){
  g.session = null;
  return `
    <div class="top-bar">
      <button class="back-btn" data-action="home">← היחידות</button>
      <div class="unit-title">${g.label}</div>
    </div>
    <div class="done-screen">
      <div class="big">🎉</div>
      <h2>ידעת את כל המילים ביחידה!</h2>
      <p>זה תרגול מספר ${g.practiceCount} על היחידה הזאת.</p>
      <button data-action="restart" data-id="${g.id}">עוד תרגול על היחידה</button>
      <button class="secondary" data-action="home">חזרה לרשימת היחידות</button>
    </div>
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
  render();
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
});

render();
