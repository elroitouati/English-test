// מרכז הלימוד: תוכנית לפי ימים עד המבחן (4.11).
// סימון "בוצע" נשמר עם התאריך שבו סומן. משימה שלא בוצעה ביומה עוברת אוטומטית ליום הלימוד הבא.
const PLAN_DONE_KEY = 'studyPlanDone_v2';
const PLAN_DONE_KEY_V1 = 'studyPlanDone_v1';

const unitAct = (id) => ({ type: 'unit', id });
const linkAct = (href, label) => ({ type: 'link', href, label });

const STUDY_DAYS = [
  { date: '2026-10-30', short: 'ו׳', num: '30.10', title: 'שישי 30.10', subtitle: 'קצר, לפני שבת', tasks: [
    { id: 'fri-1', text: 'סבב מלא על <bdi>Review - Part 1</bdi> (<bdi>55</bdi> מילים)', act: unitAct('review-part-1') },
    { id: 'fri-2', text: 'סבב מלא על <bdi>Speak Your Mind</bdi> (<bdi>11</bdi> מילים)', act: unitAct('speak-your-mind') },
  ]},
  { date: '2026-10-31', short: 'ש׳', num: '31.10', title: 'שבת 31.10', rest: true },
  { date: '2026-11-01', short: 'א׳', num: '1.11', title: 'ראשון 1.11', subtitle: 'הווה', tasks: [
    { id: 'sun-1', text: 'שיעור: <bdi>Present Simple</bdi> מול <bdi>Present Progressive</bdi> (ובספר עמ׳ <bdi>226-227</bdi>)', act: linkAct('lesson.html#present/learn', 'לשיעור') },
    { id: 'sun-2', text: 'חוברת עמ׳ <bdi>9-11</bdi> (דקדוק) + תרגול דקדוק הווה', act: linkAct('lesson.html#present/grammar', 'לתרגול') },
    { id: 'sun-3', text: 'חוברת עמ׳ <bdi>4-8</bdi> (אוצר מילים) + תרגול מילים', act: linkAct('lesson.html#words/vocab', 'לתרגול') },
    { id: 'sun-4', text: 'שוב <bdi>Review - Part 1</bdi>, עד שהכול נקי', act: unitAct('review-part-1') },
    { id: 'sun-5', text: 'סבב ראשון על <bdi>Review - Part 2</bdi>', act: unitAct('review-part-2') },
  ]},
  { date: '2026-11-02', short: 'ב׳', num: '2.11', title: 'שני 2.11', subtitle: 'עבר', tasks: [
    { id: 'mon-1', text: 'שיעור: <bdi>Past Simple</bdi> מול <bdi>Past Progressive</bdi> (דפי חזרה עמ׳ <bdi>12</bdi>)', act: linkAct('lesson.html#past/learn', 'לשיעור') },
    { id: 'mon-r13', text: 'דף חזרה <bdi>5</bdi>, עמ׳ <bdi>13</bdi>: בחירת הזמן הנכון + <bdi>when / while</bdi>', act: linkAct('lesson.html#past/review', 'לדף') },
    { id: 'mon-r14', text: 'דפי חזרה עמ׳ <bdi>14</bdi>: השלמת פעלים + משפטים משלך', act: linkAct('lesson.html#past/review', 'לדף') },
    { id: 'mon-2', text: 'חוברת עמ׳ <bdi>20-22</bdi> (דקדוק)' },
    { id: 'mon-3', text: 'חוברת עמ׳ <bdi>12-15</bdi> (אוצר מילים)' },
    { id: 'mon-4', text: '<bdi>Review - Part 2</bdi> עד שהכול נקי, ועוד סבב קצר על <bdi>Speak Your Mind</bdi>', act: unitAct('review-part-2') },
    { id: 'tue-4', text: 'הבנת הנקרא: לקרוא שוב את הטקסטים של יחידה <bdi>1</bdi> בספר' },
  ]},
  { date: '2026-11-03', short: 'ג׳', num: '3.11', title: 'שלישי 3.11', subtitle: 'יום אחרון: שאלות בעבר וחזרה על הכול', tasks: [
    { id: 'tue-r17', text: 'שאלות בעבר: חלק 6 בשיעור + דף חזרה <bdi>7</bdi>, עמ׳ <bdi>16-17</bdi>', act: linkAct('lesson.html#past/learn', 'לשיעור') },
    { id: 'tue-r18', text: 'דפי חזרה עמ׳ <bdi>18</bdi>: שאלות כן/לא + שאלות מידע', act: linkAct('lesson.html#past/review', 'לדף') },
    { id: 'tue-1', text: 'חוברת עמ׳ <bdi>28-29</bdi> (תרגול שמערבב את ארבעת הזמנים)' },
    { id: 'tue-2', text: 'חוברת עמ׳ <bdi>16-19</bdi> ו-<bdi>26-27</bdi> (אוצר מילים)' },
    { id: 'tue-5', text: 'בחינה גדולה על כל <bdi>104</bdi> המילים, ואז "מתקשה בהם" עד שהכול נקי', act: { type: 'exam' } },
    { id: 'tue-3', text: 'כתיבה: <bdi>10</bdi> משפטים עם המילים הכי קשות, כל משפט בזמן אחר' },
    { id: 'wed-2', text: 'לסיום: לעבור על מילות הסימן של ארבעת הזמנים (למטה)' },
  ], tips: [
    ['always, usually, every day', 'Present Simple'],
    ['now, at the moment, Look!', 'Present Progressive'],
    ['yesterday, last week, ago', 'Past Simple'],
    ['while, at 9 o\'clock yesterday', 'Past Progressive'],
  ]},
  { date: '2026-11-04', short: 'ד׳', num: '4.11', title: 'רביעי 4.11', subtitle: 'יום המבחן, <bdi>12:00</bdi>', exam: true, rest: true },
];

const ALL_TASKS = STUDY_DAYS.flatMap(d => (d.tasks || []).map(t => ({ ...t, date: d.date, dayTitle: d.title, dayShort: d.short })));
let planDone = loadPlanDone(); // { taskId: 'YYYY-MM-DD' שבו סומן }
let planJustToggled = null;
let selectedDay = null;

function loadPlanDone(){
  try{
    const v2 = JSON.parse(localStorage.getItem(PLAN_DONE_KEY));
    if(v2 && typeof v2 === 'object' && !Array.isArray(v2)) return v2;
    // מעבר מהגרסה הקודמת (רשימת מזהים): נחשב שבוצעו ביום שלהן
    const v1 = JSON.parse(localStorage.getItem(PLAN_DONE_KEY_V1));
    const map = {};
    if(Array.isArray(v1)) v1.forEach(id => { const t = ALL_TASKS.find(x => x.id === id); if(t) map[id] = t.date; });
    return map;
  }catch(e){
    return {};
  }
}
function savePlanDone(){
  try{ localStorage.setItem(PLAN_DONE_KEY, JSON.stringify(planDone)); }catch(e){}
}

function planTodayKey(){
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// יום הלימוד הראשון שמתחיל מהתאריך הנתון (מדלג על שבת ועל יום המבחן);
// אם לא נשאר יום לימוד, המשימה נשארת ביום הלימוד האחרון
function studyDayFrom(dateKey){
  const study = STUDY_DAYS.filter(x => !x.rest);
  const d = study.find(x => x.date >= dateKey);
  return d ? d.date : study[study.length - 1].date;
}

// באיזה יום המשימה מופיעה עכשיו
function taskHome(t){
  const doneOn = planDone[t.id];
  if(doneOn) return doneOn > t.date ? studyDayFrom(doneOn) : t.date;
  const today = planTodayKey();
  return t.date >= today ? t.date : studyDayFrom(today);
}

function dayView(day){
  const today = planTodayKey();
  // יום עבר מציג את המשימות שלו; יום הלימוד הפעיל (היום, או האחרון אחרי שהימים נגמרו) מציג גם את מה שהועבר אליו
  if(day.date < today && day.date !== studyDayFrom(today)){
    return ALL_TASKS.filter(t => t.date === day.date).map(t => {
      const home = taskHome(t);
      return { t, movedTo: planDone[t.id] || home === t.date ? null : home };
    });
  }
  return ALL_TASKS.filter(t => taskHome(t) === day.date).map(t => ({ t, carried: t.date !== day.date }))
    .sort((a, b) => (b.carried ? 1 : 0) - (a.carried ? 1 : 0));
}

function dayProgress(day){
  const view = dayView(day);
  return { done: view.filter(v => planDone[v.t.id]).length, total: view.length };
}

function shortOf(dateKey){
  const d = STUDY_DAYS.find(x => x.date === dateKey);
  return d ? d.short : '';
}

function renderTaskAction(act){
  if(!act) return '';
  if(act.type === 'unit') return `<button class="task-open pressable" data-action="open" data-id="${act.id}">לתרגול</button>`;
  if(act.type === 'exam') return `<button class="task-open pressable" data-action="open-exam">לבחינה</button>`;
  return `<a class="task-open pressable" href="${act.href}">${act.label}</a>`;
}

function renderTaskRow(v){
  const t = v.t;
  const done = !!planDone[t.id];
  const pop = t.id === planJustToggled ? ' pop' : '';
  let tag = '';
  if(v.carried) tag = `<span class="task-tag">הועבר מיום ${t.dayShort}</span>`;
  else if(v.movedTo) tag = `<span class="task-tag">הועבר ליום ${shortOf(v.movedTo)}</span>`;
  return `<li class="task${done ? ' is-done' : ''}${v.movedTo ? ' is-moved' : ''}${pop}">
    <button class="task-toggle" data-action="plan-toggle" data-task="${t.id}" aria-pressed="${done}">
      <span class="check">${icon('check')}</span>
      <span class="task-body"><span class="task-text">${t.text}</span>${tag}</span>
    </button>
    ${renderTaskAction(t.act)}
  </li>`;
}

function renderStudyCenter(){
  const today = planTodayKey();
  const last = STUDY_DAYS[STUDY_DAYS.length - 1].date;
  if(!selectedDay) selectedDay = today > last ? last : (STUDY_DAYS.find(d => d.date === today) ? today : studyDayFrom(today));
  const day = STUDY_DAYS.find(d => d.date === selectedDay) || STUDY_DAYS[0];

  const strip = STUDY_DAYS.map(d => {
    const status = d.date < today ? 'past' : d.date === today ? 'today' : 'future';
    let mark;
    if(d.rest) mark = `<span class="ds-mark">${d.exam ? 'מבחן' : 'מנוחה'}</span>`;
    else {
      const p = dayProgress(d);
      mark = p.total && p.done === p.total
        ? `<span class="ds-mark ds-done">${icon('check')}</span>`
        : `<bdi class="ds-mark">${p.done}/${p.total}</bdi>`;
    }
    return `<button class="ds ${status}${d.date === selectedDay ? ' on' : ''}${d.exam ? ' exam' : ''}" data-action="select-day" data-date="${d.date}" aria-pressed="${d.date === selectedDay}">
      <span class="ds-day">${d.short}</span><bdi class="ds-num">${d.num}</bdi>${mark}
    </button>`;
  }).join('');

  let body;
  if(day.rest){
    body = day.exam
      ? `<p class="day-rest">יום המבחן, בלי לימוד. לישון טוב, לאכול ארוחת בוקר ולהגיע רגוע. בהצלחה!</p>`
      : `<p class="day-rest">שבת, בלי לימוד.</p>`;
  } else {
    const view = dayView(day);
    const p = dayProgress(day);
    const carried = view.filter(v => v.carried);
    const own = view.filter(v => !v.carried);
    const pct = p.total ? Math.round(p.done / p.total * 100) : 0;
    body = `
      <div class="dp-progress"><bdi>${p.done}/${p.total}</bdi> משימות<span class="meter"><span style="width:${pct}%"></span></span></div>
      ${carried.length ? `<p class="dp-group">משימות שהועברו מימים קודמים</p><ul class="tasks">${carried.map(renderTaskRow).join('')}</ul>` : ''}
      ${own.length ? `${carried.length ? '<p class="dp-group dp-group-own">של היום</p>' : ''}<ul class="tasks">${own.map(renderTaskRow).join('')}</ul>` : ''}
      ${!view.length ? '<p class="day-rest">אין משימות ליום הזה.</p>' : ''}
      ${day.tips ? `<dl class="tips">${day.tips.map(([w, tense]) => `<div class="tip"><dt dir="ltr">${w}</dt><dd dir="ltr">${tense}</dd></div>`).join('')}</dl>` : ''}`;
  }
  planJustToggled = null;
  const label = day.date === today ? 'היום' : day.date < today ? 'יום שעבר' : 'יום הבא';
  return `
    <section class="center">
      <div class="day-strip">${strip}</div>
      <div class="day-panel${day.date === today ? ' is-today' : ''}">
        <header class="dp-head">
          <span class="dp-label">${label}</span>
          <h2>${day.title}${day.subtitle ? `<span class="dp-sub"> · ${day.subtitle}</span>` : ''}</h2>
        </header>
        ${body}
      </div>
    </section>`;
}

function selectStudyDay(date){
  selectedDay = date;
  render();
}

function togglePlanTask(id){
  if(planDone[id]) delete planDone[id];
  else planDone[id] = planTodayKey();
  planJustToggled = id;
  savePlanDone();
  render();
}
