// תוכנית הלימוד עד המבחן (4.11). סימוני "בוצע" נשמרים ב-localStorage.
const PLAN_DONE_KEY = 'studyPlanDone_v1';

const STUDY_PLAN = [
  { date: '2026-10-30', title: 'שישי 30.10', subtitle: 'קצר, לפני שבת', tasks: [
    { id: 'fri-1', text: 'סבב מלא על <bdi>Review - Part 1</bdi> (<bdi>55</bdi> מילים)', unit: 'review-part-1' },
    { id: 'fri-2', text: 'סבב מלא על <bdi>Speak Your Mind</bdi> (<bdi>11</bdi> מילים)', unit: 'speak-your-mind' },
  ]},
  { date: '2026-10-31', title: 'שבת 31.10', rest: true },
  { date: '2026-11-01', title: 'ראשון 1.11', subtitle: 'הווה', tasks: [
    { id: 'sun-1', text: 'לקרוא את הכללים של <bdi>Present Simple</bdi> ו-<bdi>Present Progressive</bdi> בספר, עמ׳ <bdi>226-227</bdi>', link: ['lesson.html#learn', 'לשיעור'] },
    { id: 'sun-2', text: 'חוברת עמ׳ <bdi>9-11</bdi> (דקדוק)', link: ['lesson.html#grammar', 'לתרגול'] },
    { id: 'sun-3', text: 'חוברת עמ׳ <bdi>4-8</bdi> (אוצר מילים)', link: ['lesson.html#vocab', 'לתרגול'] },
    { id: 'sun-4', text: 'שוב <bdi>Review - Part 1</bdi>, עד שהכול נקי', unit: 'review-part-1' },
    { id: 'sun-5', text: 'סבב ראשון על <bdi>Review - Part 2</bdi>', unit: 'review-part-2' },
  ]},
  { date: '2026-11-02', title: 'שני 2.11', subtitle: 'עבר', tasks: [
    { id: 'mon-1', text: 'לקרוא את הכללים של <bdi>Past Simple</bdi> ו-<bdi>Past Progressive</bdi> בספר, עמ׳ <bdi>228-229</bdi>' },
    { id: 'mon-2', text: 'חוברת עמ׳ <bdi>20-22</bdi> (דקדוק)' },
    { id: 'mon-3', text: 'חוברת עמ׳ <bdi>12-15</bdi> (אוצר מילים)' },
    { id: 'mon-4', text: '<bdi>Review - Part 2</bdi> עד שהכול נקי', unit: 'review-part-2' },
    { id: 'mon-5', text: 'עוד סבב על <bdi>Speak Your Mind</bdi>', unit: 'speak-your-mind' },
  ]},
  { date: '2026-11-03', title: 'שלישי 3.11', subtitle: 'הכול ביחד', tasks: [
    { id: 'tue-1', text: 'חוברת עמ׳ <bdi>28-29</bdi> (תרגול שמערבב את ארבעת הזמנים)' },
    { id: 'tue-2', text: 'חוברת עמ׳ <bdi>16-19</bdi> ו-<bdi>26-27</bdi> (אוצר מילים)' },
    { id: 'tue-3', text: 'כתיבה: <bdi>10-15</bdi> משפטים עם המילים הכי קשות, כל משפט בזמן אחר' },
    { id: 'tue-4', text: 'הבנת הנקרא: לקרוא שוב את הטקסטים של יחידה <bdi>1</bdi> בספר' },
    { id: 'tue-5', text: 'בחינה גדולה על כל <bdi>104</bdi> המילים, ואז לתרגל את "מתקשה בהם"', exam: true },
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
let planJustToggled = null;

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

function planIsOver(){
  return planTodayKey() > STUDY_PLAN[STUDY_PLAN.length - 1].date;
}

function renderPlanCard(){
  if(planIsOver()) return '';
  const today = planTodayKey();
  const day = STUDY_PLAN.find(d => d.date === today) || STUDY_PLAN.find(d => d.date > today);
  const label = day.date === today ? 'היום' : 'הבא בתור';
  let body;
  if(day.rest){
    body = `<span class="plan-tile-status">חופש, אין לימוד</span>`;
  } else {
    const p = planDayProgress(day);
    const pct = p.total ? Math.round(p.done / p.total * 100) : 0;
    body = `
      <span class="plan-tile-status"><bdi>${p.done}/${p.total}</bdi> משימות</span>
      <span class="meter"><span style="width:${pct}%"></span></span>`;
  }
  return `
    <button class="tile tile-plan pressable" data-action="open-plan">
      <span class="tile-label">${label}</span>
      <span class="plan-tile-day">${day.title}</span>
      ${body}
      <span class="tile-go">${icon('forward')}</span>
    </button>`;
}

function renderPlanScreen(){
  const today = planTodayKey();
  const all = STUDY_PLAN.flatMap(d => d.tasks || []);
  const doneCount = all.filter(t => planDone.has(t.id)).length;
  let html = `
    <header class="topbar">
      <button class="back-btn pressable" data-action="home">${icon('back')}<span>יחידות</span></button>
      <h1 class="topbar-title">תוכנית לימוד</h1>
    </header>
    <p class="lede"><bdi>${doneCount}/${all.length}</bdi> משימות הושלמו עד המבחן</p>`;
  STUDY_PLAN.forEach(day => {
    const status = day.date < today ? 'past' : day.date === today ? 'today' : 'future';
    const p = planDayProgress(day);
    let end = '';
    if(status === 'today') end = `<span class="chip chip-accent">היום</span>`;
    else if(!day.rest) end = `<bdi class="day-count">${p.done}/${p.total}</bdi>`;
    html += `<section class="day ${status}">
      <header class="day-head">
        <h2>${day.title}</h2>
        ${day.subtitle ? `<span class="day-sub">${day.subtitle}</span>` : ''}
        ${end}
      </header>`;
    if(day.rest){
      html += `<p class="day-rest">שבת, בלי לימוד</p>`;
    } else {
      html += `<ul class="tasks">`;
      day.tasks.forEach(t => {
        const done = planDone.has(t.id);
        const pop = t.id === planJustToggled ? ' pop' : '';
        html += `<li class="task${done ? ' is-done' : ''}${pop}">
          <button class="task-toggle" data-action="plan-toggle" data-task="${t.id}" aria-pressed="${done}">
            <span class="check">${icon('check')}</span>
            <span class="task-text">${t.text}</span>
          </button>
          ${t.unit ? `<button class="task-open pressable" data-action="open" data-id="${t.unit}">לתרגול</button>` : ''}
          ${t.exam ? `<button class="task-open pressable" data-action="open-exam">לבחינה</button>` : ''}
          ${t.link ? `<a class="task-open pressable" href="${t.link[0]}">${t.link[1]}</a>` : ''}
        </li>`;
      });
      html += `</ul>`;
    }
    if(day.tips){
      html += `<dl class="tips">${day.tips.map(([words, tense]) =>
        `<div class="tip"><dt dir="ltr">${words}</dt><dd dir="ltr">${tense}</dd></div>`).join('')}</dl>`;
    }
    html += `</section>`;
  });
  planJustToggled = null;
  return html;
}

function openPlan(){
  curGroupId = '__plan__';
  render();
  const todayCard = document.querySelector('.day.today');
  if(todayCard) todayCard.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
}

function togglePlanTask(id){
  if(planDone.has(id)) planDone.delete(id);
  else planDone.add(id);
  planJustToggled = id;
  savePlanDone();
  render();
}
