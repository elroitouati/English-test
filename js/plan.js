// תוכנית הלימוד עד המבחן (4.11). סימוני "בוצע" נשמרים ב-localStorage.
const PLAN_DONE_KEY = 'studyPlanDone_v1';

const STUDY_PLAN = [
  { date: '2026-10-30', title: 'שישי 30.10', subtitle: 'קצר, לפני שבת', tasks: [
    { id: 'fri-1', text: 'Review - Part 1: סבב מלא (55 מילים)', unit: 'review-part-1' },
    { id: 'fri-2', text: 'Speak Your Mind: סבב מלא (11 מילים)', unit: 'speak-your-mind' },
  ]},
  { date: '2026-10-31', title: 'שבת 31.10', rest: true },
  { date: '2026-11-01', title: 'ראשון 1.11', subtitle: 'הווה', tasks: [
    { id: 'sun-1', text: 'לקרוא את הכללים של Present Simple ו-Present Progressive: ספר, עמ׳ 226-227' },
    { id: 'sun-2', text: 'חוברת עמ׳ 9-11 (דקדוק)' },
    { id: 'sun-3', text: 'חוברת עמ׳ 4-8 (אוצר מילים)' },
    { id: 'sun-4', text: 'Review - Part 1: שוב, עד שהכול נקי', unit: 'review-part-1' },
    { id: 'sun-5', text: 'Review - Part 2: סבב ראשון', unit: 'review-part-2' },
  ]},
  { date: '2026-11-02', title: 'שני 2.11', subtitle: 'עבר', tasks: [
    { id: 'mon-1', text: 'לקרוא את הכללים של Past Simple ו-Past Progressive: ספר, עמ׳ 228-229' },
    { id: 'mon-2', text: 'חוברת עמ׳ 20-22 (דקדוק)' },
    { id: 'mon-3', text: 'חוברת עמ׳ 12-15 (אוצר מילים)' },
    { id: 'mon-4', text: 'Review - Part 2: עד שהכול נקי', unit: 'review-part-2' },
    { id: 'mon-5', text: 'Speak Your Mind: עוד סבב', unit: 'speak-your-mind' },
  ]},
  { date: '2026-11-03', title: 'שלישי 3.11', subtitle: 'הכול ביחד', tasks: [
    { id: 'tue-1', text: 'חוברת עמ׳ 28-29 (תרגול שמערבב את ארבעת הזמנים)' },
    { id: 'tue-2', text: 'חוברת עמ׳ 16-19 ו-26-27 (אוצר מילים)' },
    { id: 'tue-3', text: 'כתיבה: 10-15 משפטים עם המילים הכי קשות, כל משפט בזמן אחר' },
    { id: 'tue-4', text: 'הבנת הנקרא: לקרוא שוב את הטקסטים של יחידה 1 בספר' },
    { id: 'tue-5', text: 'סבב אחרון על שלוש היחידות באפליקציה' },
  ]},
  { date: '2026-11-04', title: 'רביעי 4.11', subtitle: 'יום המבחן', tasks: [
    { id: 'wed-1', text: 'בבוקר: סבב מהיר על שלוש היחידות באפליקציה' },
    { id: 'wed-2', text: 'לעבור על מילות הסימן של הזמנים (למטה)' },
  ], tips: [
    ['always, usually', 'Present Simple'],
    ['now, at the moment', 'Present Progressive'],
    ['yesterday, ago', 'Past Simple'],
    ['while', 'Past Progressive'],
  ]},
];

let planDone = loadPlanDone();

function loadPlanDone(){
  try{
    const arr = JSON.parse(localStorage.getItem(PLAN_DONE_KEY));
    return new Set(Array.isArray(arr) ? arr : []);
  }catch(e){
    return new Set();
  }
}
function savePlanDone(){
  try{ localStorage.setItem(PLAN_DONE_KEY, JSON.stringify([...planDone])); }catch(e){}
}

function planTodayKey(){
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function planDayProgress(day){
  const tasks = day.tasks || [];
  return { done: tasks.filter(t => planDone.has(t.id)).length, total: tasks.length };
}

function renderPlanCard(){
  const today = planTodayKey();
  const last = STUDY_PLAN[STUDY_PLAN.length - 1];
  if(today > last.date) return '';
  const day = STUDY_PLAN.find(d => d.date === today) || STUDY_PLAN.find(d => d.date > today);
  let meta;
  if(day.rest){
    meta = `היום · ${day.title}: חופש, אין לימוד`;
  } else {
    const p = planDayProgress(day);
    const prefix = day.date === today ? 'היום' : 'הבא בתור';
    meta = `${prefix} · ${day.title}: ${p.done}/${p.total} משימות`;
  }
  return `
    <div class="plan-card" data-action="open-plan">
      <div class="plan-card-icon">📅</div>
      <div class="plan-card-info">
        <b>תוכנית לימוד</b>
        <div class="plan-card-meta">${meta}</div>
      </div>
      <div class="plan-card-arrow">‹</div>
    </div>`;
}

function renderPlanScreen(){
  const today = planTodayKey();
  let html = `
    <div class="top-bar">
      <button class="back-btn" data-action="home">← היחידות</button>
      <div class="unit-title">תוכנית לימוד</div>
    </div>`;
  STUDY_PLAN.forEach(day => {
    const status = day.date < today ? 'past' : day.date === today ? 'today' : 'future';
    const p = planDayProgress(day);
    const right = status === 'today'
      ? '<span class="plan-today-badge">היום</span>'
      : (!day.rest ? `<span class="plan-day-count">${p.done}/${p.total}</span>` : '');
    html += `<div class="plan-day ${status}">
      <div class="plan-day-head">
        <div><b>${day.title}</b>${day.subtitle ? `<span class="plan-day-sub"> · ${day.subtitle}</span>` : ''}</div>
        ${right}
      </div>`;
    if(day.rest){
      html += `<div class="plan-rest">שבת, חופש מלימוד</div>`;
    } else {
      day.tasks.forEach(t => {
        const done = planDone.has(t.id);
        html += `<div class="plan-task ${done ? 'done' : ''}" data-action="plan-toggle" data-task="${t.id}">
          <span class="plan-check">${done ? '✓' : ''}</span>
          <span class="plan-task-text">${t.text}</span>
          ${t.unit ? `<button class="plan-open" data-action="open" data-id="${t.unit}">לתרגול ›</button>` : ''}
        </div>`;
      });
    }
    if(day.tips){
      html += `<div class="plan-tips">${day.tips.map(([words, tense]) =>
        `<div class="plan-tip" dir="ltr"><span>${words}</span><b>${tense}</b></div>`).join('')}</div>`;
    }
    html += `</div>`;
  });
  return html;
}

function openPlan(){
  curGroupId = '__plan__';
  render();
  const todayCard = document.querySelector('.plan-day.today');
  if(todayCard) todayCard.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
}

function togglePlanTask(id){
  if(planDone.has(id)) planDone.delete(id);
  else planDone.add(id);
  savePlanDone();
  render();
}
