// שיעורי דקדוק: הווה (Present Simple / Progressive) ועבר (Past Simple / Progressive), כולל דפי החזרה.
// ניתוב: #present/learn | #present/grammar | #present/vocab | #past/learn | #past/review[/setId]

/* ---------- Sentence machine ---------- */
const SM_SUBJECTS = ['I', 'You', 'He', 'She', 'We', 'They'];
const SM_VERBS = [
  { id: 'play',  label: 'play football', s: ['play', 's'],   ing: ['play', 'ing'],  rest: 'football',
    sRule: 'רוב הפעלים: מוסיפים <b>s</b>', ingRule: 'רוב הפעלים: מוסיפים <b>ing</b>' },
  { id: 'watch', label: 'watch TV',      s: ['watch', 'es'], ing: ['watch', 'ing'], rest: 'TV',
    sRule: 'פועל שנגמר ב-<b dir="ltr">ch</b>: מוסיפים <b>es</b>', ingRule: 'רוב הפעלים: מוסיפים <b>ing</b>' },
  { id: 'study', label: 'study English', s: ['stud', 'ies'], ing: ['study', 'ing'], rest: 'English',
    sRule: 'עיצור ואחריו <b>y</b>: ה-y הופכת ל-<b>ies</b>', ingRule: 'עם <b>ing</b> ה-y נשארת: <b dir="ltr">studying</b>' },
  { id: 'swim',  label: 'swim',          s: ['swim', 's'],   ing: ['swim', 'ming'], rest: 'in the lake',
    sRule: 'רוב הפעלים: מוסיפים <b>s</b>', ingRule: 'עיצור-תנועה-עיצור: מכפילים את האות האחרונה, <b dir="ltr">swim → swimming</b>' },
  { id: 'make',  label: 'make a cake',   s: ['make', 's'],   ing: ['mak', 'ing'],   rest: 'a cake',
    sRule: 'רוב הפעלים: מוסיפים <b>s</b>', ingRule: 'נגמר ב-<b>e</b> שקטה: מורידים אותה, <b dir="ltr">make → making</b>' },
  { id: 'go',    label: 'go to school',  s: ['go', 'es'],    ing: ['go', 'ing'],    rest: 'to school',
    sRule: 'פועל שנגמר ב-<b>o</b>: מוסיפים <b>es</b>', ingRule: 'רוב הפעלים: מוסיפים <b>ing</b>' },
];
const machines = {
  present: { subject: 'She', verb: 'study', tense: 'simple', form: 'pos' },
  past:    { subject: 'They', verb: 'go', tense: 'prog', form: 'pos' },
};

function smBuild(sm){
  const v = SM_VERBS.find(x => x.id === sm.verb);
  const third = sm.subject === 'He' || sm.subject === 'She';
  const be = sm.subject === 'I' ? 'am' : third ? 'is' : 'are';
  const time = sm.tense === 'simple' ? 'every day' : 'now';
  const subj = { t: sm.subject, c: 'tk-subj' };
  const rest = { t: `${v.rest} ${time}`, c: 'tk-rest' };
  let tokens, rules = [];
  if(sm.tense === 'simple'){
    const base = { t: v.id, c: 'tk-stem' };
    if(sm.form === 'pos'){
      tokens = third ? [subj, { stem: v.s[0], suf: v.s[1] }, rest] : [subj, base, rest];
      rules.push(third ? `<b dir="ltr">${sm.subject}</b> = גוף שלישי יחיד, אז הפועל מקבל סיומת. ${v.sRule}` : `<b dir="ltr">${sm.subject}</b>: הפועל בצורת הבסיס, בלי שינוי`);
    } else if(sm.form === 'neg'){
      tokens = [subj, { t: third ? "doesn't" : "don't", c: 'tk-aux' }, base, rest];
      rules.push(third ? '<b dir="ltr">doesn\'t</b> + פועל בסיס. ה-s כבר נמצאת ב-does, אז לפועל אין s' : '<b dir="ltr">don\'t</b> + פועל בסיס');
    } else {
      tokens = [{ t: third ? 'Does' : 'Do', c: 'tk-aux' }, { t: sm.subject === 'I' ? 'I' : sm.subject.toLowerCase(), c: 'tk-subj' }, base, rest];
      rules.push(third ? '<b dir="ltr">Does</b> עובר להתחלה, והפועל חוזר לבסיס, בלי s' : '<b dir="ltr">Do</b> עובר להתחלה + פועל בסיס');
    }
  } else {
    const ingTok = { stem: v.ing[0], suf: v.ing[1] };
    if(sm.form === 'pos'){
      tokens = [subj, { t: be, c: 'tk-aux' }, ingTok, rest];
      rules.push(`<b dir="ltr">${be}</b> לפי הנושא + פועל עם <b>ing</b>`);
    } else if(sm.form === 'neg'){
      const neg = be === 'am' ? 'am not' : be === 'is' ? "isn't" : "aren't";
      tokens = [subj, { t: neg, c: 'tk-aux' }, ingTok, rest];
      rules.push(`שלילה: <b dir="ltr">${neg}</b> + פועל עם <b>ing</b>`);
    } else {
      tokens = [{ t: be[0].toUpperCase() + be.slice(1), c: 'tk-aux' }, { t: sm.subject === 'I' ? 'I' : sm.subject.toLowerCase(), c: 'tk-subj' }, ingTok, rest];
      rules.push(`שאלה: <b dir="ltr">${be}</b> עובר להתחלה`);
    }
    rules.push(v.ingRule);
  }
  const html = tokensHtml(tokens, sm.form);
  const meaning = sm.tense === 'simple' ? 'קורה באופן קבוע, כהרגל' : 'קורה ממש עכשיו, באמצע הפעולה';
  return { html, rules, meaning };
}

function tokensHtml(tokens, form){
  return tokens.map(tk => tk.stem !== undefined
    ? `<span class="tk-stem">${tk.stem}</span><span class="tk-suf">${tk.suf}</span>`
    : `<span class="${tk.c}">${tk.t}</span>`).join(' ') + (form === 'q' ? '?' : '.');
}

function chipGroup(m, name, options, current){
  return `<div class="seg" role="group">${options.map(([val, label]) =>
    `<button class="seg-btn${val === current ? ' on' : ''}" data-m="${m}" data-sm="${name}" data-val="${val}" aria-pressed="${val === current}"${/[a-z]/i.test(label) ? ' dir="ltr"' : ''}>${label}</button>`).join('')}</div>`;
}

function renderMachine(m){
  const st = machines[m];
  const past = m === 'past';
  const out = past ? pastBuild(st) : smBuild(st);
  const tenses = past ? [['simple', 'Past Simple'], ['prog', 'Past Progressive']] : [['simple', 'Present Simple'], ['prog', 'Present Progressive']];
  const verbs = past ? PAST_VERBS : SM_VERBS;
  return `
    <div class="sm-controls">
      <div class="sm-row"><span class="sm-label">זמן</span>${chipGroup(m, 'tense', tenses, st.tense)}</div>
      <div class="sm-row"><span class="sm-label">סוג</span>${chipGroup(m, 'form', [['pos', 'חיובי'], ['neg', 'שלילה'], ['q', 'שאלה']], st.form)}</div>
      <div class="sm-row"><span class="sm-label">נושא</span>${chipGroup(m, 'subject', SM_SUBJECTS.map(x => [x, x]), st.subject)}</div>
      <div class="sm-row"><span class="sm-label">פועל</span>${chipGroup(m, 'verb', verbs.map(v => [v.id, v.label]), st.verb)}</div>
    </div>
    <div class="sm-output t-${st.tense}">
      <p class="sm-sentence" dir="ltr">${out.html}</p>
      <p class="sm-meaning">${out.meaning}</p>
      <ul class="sm-rules">${out.rules.map(r => `<li>${r}</li>`).join('')}</ul>
    </div>`;
}

/* ---------- Lesson ---------- */
function timelineSvg(kind){
  const axis = `
    <line x1="16" y1="60" x2="300" y2="60" class="tl-axis"/>
    <path d="M296 55l6 5-6 5" class="tl-axis" fill="none"/>
    <line x1="160" y1="18" x2="160" y2="70" class="tl-now"/>
    <text x="20" y="88" class="tl-label" text-anchor="start">עבר</text>
    <text x="160" y="88" class="tl-label tl-label-now" text-anchor="middle">עכשיו</text>
    <text x="300" y="88" class="tl-label" text-anchor="end">עתיד</text>`;
  if(kind === 'simple'){
    const dots = [40, 80, 120, 160, 200, 240, 280].map(x => `<circle cx="${x}" cy="60" r="6" class="tl-dot"/>`).join('');
    return `<svg viewBox="0 0 320 96" class="timeline" role="img" aria-label="ציר זמן: הפעולה חוזרת שוב ושוב, בעבר, עכשיו ובעתיד">${axis}${dots}<text x="160" y="12" class="tl-cap" text-anchor="middle">every Tuesday</text></svg>`;
  }
  return `<svg viewBox="0 0 320 96" class="timeline" role="img" aria-label="ציר זמן: הפעולה קורה עכשיו, מתחילה קצת לפני ונגמרת קצת אחרי">${axis}
    <rect x="118" y="49" width="84" height="22" rx="11" class="tl-band"/>
    <circle cx="160" cy="60" r="6" class="tl-band-dot"/>
    <text x="160" y="12" class="tl-cap tl-cap-prog" text-anchor="middle">right now</text></svg>`;
}

function renderPresentLearn(){
  return `
  <section class="ls-card ls-hero">
    <p class="ls-kicker">השאלה היחידה שצריך לשאול</p>
    <h2>זה <span class="c-simple">הרגל או עובדה</span>, או משהו ש<span class="c-prog">קורה עכשיו</span>?</h2>
    <div class="vs">
      <div class="vs-col t-simple">
        <span class="vs-name" dir="ltr">Present Simple</span>
        ${timelineSvg('simple')}
        <p class="en" dir="ltr">I <b>play</b> football every Tuesday.</p>
        <p class="vs-he">קורה שוב ושוב: הרגלים, שגרה, עובדות</p>
      </div>
      <div class="vs-col t-prog">
        <span class="vs-name" dir="ltr">Present Progressive</span>
        ${timelineSvg('prog')}
        <p class="en" dir="ltr">I <b>am playing</b> football now.</p>
        <p class="vs-he">קורה ממש עכשיו, או משהו זמני בתקופה הזאת</p>
      </div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">1</span><span>מכונת המשפטים</span></h3>
    <p class="ls-text">תבחר זמן, סוג משפט, נושא ופועל, ותראה איך המשפט נבנה. החלקים הצבעוניים הם מה שמשתנה.</p>
    <div class="machine" data-machine="present">${renderMachine('present')}</div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">2</span><span>איך בונים</span></h3>
    <div class="formula">
      <div class="formula-row t-simple"><span class="vs-name" dir="ltr">Present Simple</span>
        <p dir="ltr"><span class="f-part">subject</span> + <span class="f-part f-key">verb (+s)</span></p></div>
      <div class="formula-row t-prog"><span class="vs-name" dir="ltr">Present Progressive</span>
        <p dir="ltr"><span class="f-part">subject</span> + <span class="f-part f-key">am / is / are</span> + <span class="f-part f-key">verb-ing</span></p></div>
    </div>
    <div class="table-wrap">
      <table class="conj" dir="ltr">
        <thead><tr><th></th><th class="c-simple">Present Simple</th><th class="c-prog">Present Progressive</th></tr></thead>
        <tbody>
          <tr><th>I</th><td>work</td><td><span class="hl-p">am</span> work<span class="hl-p">ing</span></td></tr>
          <tr><th>You</th><td>work</td><td><span class="hl-p">are</span> work<span class="hl-p">ing</span></td></tr>
          <tr class="row-third"><th>He / She / It</th><td>work<span class="hl-s">s</span></td><td><span class="hl-p">is</span> work<span class="hl-p">ing</span></td></tr>
          <tr><th>We</th><td>work</td><td><span class="hl-p">are</span> work<span class="hl-p">ing</span></td></tr>
          <tr><th>They</th><td>work</td><td><span class="hl-p">are</span> work<span class="hl-p">ing</span></td></tr>
        </tbody>
      </table>
    </div>
    <p class="ls-note">ב-Present Simple רק <b dir="ltr">he / she / it</b> משנים את הפועל. זה המקום שבו הכי הרבה טועים במבחן.</p>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">3</span><span>כללי כתיב</span></h3>
    <div class="spell-grid">
      <div class="spell t-simple">
        <span class="vs-name">סיומת <b dir="ltr">s</b> (he / she / it)</span>
        <ul>
          <li><span>רוב הפעלים</span><span dir="ltr">play → play<b>s</b></span></li>
          <li><span>נגמר ב- s, sh, ch, x, o</span><span dir="ltr">watch → watch<b>es</b></span></li>
          <li><span>עיצור + y</span><span dir="ltr">study → stud<b>ies</b></span></li>
          <li><span>תנועה + y</span><span dir="ltr">enjoy → enjoy<b>s</b></span></li>
          <li><span>יוצא דופן</span><span dir="ltr">have → <b>has</b></span></li>
        </ul>
      </div>
      <div class="spell t-prog">
        <span class="vs-name">סיומת <b dir="ltr">ing</b></span>
        <ul>
          <li><span>רוב הפעלים</span><span dir="ltr">read → read<b>ing</b></span></li>
          <li><span>נגמר ב-e שקטה</span><span dir="ltr">write → writ<b>ing</b></span></li>
          <li><span>עיצור-תנועה-עיצור</span><span dir="ltr">sit → sit<b>ting</b></span></li>
          <li><span>נגמר ב-ie</span><span dir="ltr">lie → l<b>ying</b></span></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">4</span><span>שלילה ושאלה</span></h3>
    <div class="jump t-simple">
      <span class="vs-name"><bdi>Present Simple</bdi>: ה-s קופצת לפועל העזר</span>
      <p class="en" dir="ltr">He play<span class="hl-s">s</span> tennis.</p>
      <p class="en" dir="ltr">He doe<span class="hl-s">s</span>n't play tennis.</p>
      <p class="en" dir="ltr">Doe<span class="hl-s">s</span> he play tennis?</p>
      <p class="ls-note">אחרי <b dir="ltr">does / doesn't</b> הפועל תמיד בבסיס. <b dir="ltr">Does he plays</b> זו טעות.</p>
    </div>
    <div class="table-wrap">
      <table class="conj conj-forms" dir="ltr">
        <thead><tr><th></th><th class="c-simple">Present Simple</th><th class="c-prog">Present Progressive</th></tr></thead>
        <tbody>
          <tr><th>+</th><td>She works.</td><td>She <span class="hl-p">is</span> working.</td></tr>
          <tr><th>−</th><td>She <span class="hl-s">doesn't</span> work.</td><td>She <span class="hl-p">isn't</span> working.</td></tr>
          <tr><th>?</th><td><span class="hl-s">Does</span> she work?</td><td><span class="hl-p">Is</span> she working?</td></tr>
          <tr><th>Yes</th><td>Yes, she <span class="hl-s">does</span>.</td><td>Yes, she <span class="hl-p">is</span>.</td></tr>
          <tr><th>No</th><td>No, she <span class="hl-s">doesn't</span>.</td><td>No, she <span class="hl-p">isn't</span>.</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">5</span><span>מילות סימן</span></h3>
    <p class="ls-text">המילים האלה במשפט הן הרמז הכי מהיר במבחן.</p>
    <div class="signals">
      <div class="t-simple"><span class="vs-name" dir="ltr">Present Simple</span>
        <div class="tags" dir="ltr"><span>always</span><span>usually</span><span>often</span><span>sometimes</span><span>never</span><span>every day</span><span>on Mondays</span><span>twice a week</span></div></div>
      <div class="t-prog"><span class="vs-name" dir="ltr">Present Progressive</span>
        <div class="tags" dir="ltr"><span>now</span><span>right now</span><span>at the moment</span><span>today</span><span>this week</span><span>Look!</span><span>Listen!</span><span>Be quiet!</span></div></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">6</span><span>פעלים שלא מקבלים ing</span></h3>
    <p class="ls-text">פעלים של מחשבה, רגש ושייכות מתארים מצב, לא פעולה. הם נשארים ב-Present Simple גם כשמדובר בעכשיו.</p>
    <div class="tags tags-plain" dir="ltr"><span>know</span><span>understand</span><span>believe</span><span>remember</span><span>mean</span><span>like</span><span>love</span><span>hate</span><span>want</span><span>need</span><span>prefer</span><span>own</span><span>belong</span><span>seem</span></div>
    <div class="fix-list">
      <div class="fix"><p class="fix-bad" dir="ltr">I am knowing the answer.</p><p class="fix-good" dir="ltr">I know the answer.</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">She is wanting a selfie now.</p><p class="fix-good" dir="ltr">She wants a selfie now.</p></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">7</span><span>הטעויות הכי נפוצות</span></h3>
    <div class="fix-list">
      <div class="fix"><p class="fix-bad" dir="ltr">My colleague work every day.</p><p class="fix-good" dir="ltr">My colleague works every day.</p><p class="fix-why">נושא בגוף שלישי יחיד, אז צריך s</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">Does he likes jokes?</p><p class="fix-good" dir="ltr">Does he like jokes?</p><p class="fix-why">אחרי does הפועל בלי s</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">They playing outside.</p><p class="fix-good" dir="ltr">They are playing outside.</p><p class="fix-why">ing בלי am / is / are זו לא צורה שלמה</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">Look! It rains.</p><p class="fix-good" dir="ltr">Look! It is raining.</p><p class="fix-why">Look! מסמן שזה קורה עכשיו</p></div>
    </div>
  </section>

  <a class="btn btn-primary pressable ls-next" href="#present/grammar">לתרגול דקדוק ${icon('forward')}</a>`;
}

/* ---------- Practice data ---------- */
const GRAMMAR_ITEMS = [
  { id: 'g1', type: 'mc', q: 'Listen! Someone ___ at the door.', options: ['is knocking', 'knocks'], answer: 'is knocking',
    full: 'Listen! Someone <mark>is knocking</mark> at the door.', why: '<b dir="ltr">Listen!</b> מסמן שזה קורה עכשיו, אז Present Progressive.' },
  { id: 'g2', type: 'mc', q: 'My colleague ___ coffee every morning.', options: ['drinks', 'is drinking', 'drink'], answer: 'drinks',
    full: 'My colleague <mark>drinks</mark> coffee every morning.', why: '<b dir="ltr">every morning</b> זה הרגל. colleague הוא גוף שלישי יחיד, אז drinks עם s.' },
  { id: 'g3', type: 'mc', q: 'Look! The kids ___ into the lake.', options: ['are diving', 'dive', 'is diving'], answer: 'are diving',
    full: 'Look! The kids <mark>are diving</mark> into the lake.', why: '<b dir="ltr">Look!</b> = עכשיו. kids זה רבים, אז are ולא is.' },
  { id: 'g4', type: 'mc', q: 'I ___ what you mean.', options: ['understand', 'am understanding'], answer: 'understand',
    full: 'I <mark>understand</mark> what you mean.', why: '<b dir="ltr">understand</b> הוא פועל של מחשבה, והוא לא מקבל ing.' },
  { id: 'g5', type: 'mc', q: '___ your brother often ___ selfies?', options: ['Does … take', 'Does … takes', 'Is … taking'], answer: 'Does … take',
    full: '<mark>Does</mark> your brother often <mark>take</mark> selfies?', why: '<b dir="ltr">often</b> = הרגל. אחרי Does הפועל חוזר לבסיס, take בלי s.' },
  { id: 'g6', type: 'mc', q: 'Water ___ at 100 degrees.', options: ['boils', 'is boiling'], answer: 'boils',
    full: 'Water <mark>boils</mark> at 100 degrees.', why: 'זו עובדה מדעית שתמיד נכונה, אז Present Simple.' },
  { id: 'g7', type: 'mc', q: 'He ___ like jokes about his job.', options: ["doesn't", "don't", "isn't"], answer: "doesn't",
    full: "He <mark>doesn't</mark> like jokes about his job.", why: 'שלילה ב-Present Simple עם he: <b dir="ltr">doesn\'t</b> + פועל בסיס.' },
  { id: 'g8', type: 'mc', q: 'Be quiet! Dad ___ on the phone.', options: ['is talking', 'talks'], answer: 'is talking',
    full: 'Be quiet! Dad <mark>is talking</mark> on the phone.', why: '<b dir="ltr">Be quiet!</b> מסמן שזה קורה עכשיו.' },
  { id: 'g9', type: 'type', q: 'My grandmother ___ English twice a week.', verb: 'study', accept: ['studies'],
    full: 'My grandmother <mark>studies</mark> English twice a week.', why: '<b dir="ltr">twice a week</b> = הרגל. study: עיצור + y, אז studies.' },
  { id: 'g10', type: 'type', q: 'We ___ TV at the moment.', verb: 'not / watch', accept: ["aren't watching", 'are not watching', "we're not watching"],
    full: "We <mark>aren't watching</mark> TV at the moment.", why: '<b dir="ltr">at the moment</b> = עכשיו. שלילה: aren\'t + ing.' },
  { id: 'g11', type: 'type', q: 'Tom usually ___ the elevator himself.', verb: 'fix', accept: ['fixes'],
    full: 'Tom usually <mark>fixes</mark> the elevator himself.', why: '<b dir="ltr">usually</b> = הרגל. fix נגמר ב-x, אז fixes.' },
  { id: 'g12', type: 'type', q: 'Shh! The baby ___.', verb: 'sleep', accept: ['is sleeping', "'s sleeping"],
    full: 'Shh! The baby <mark>is sleeping</mark>.', why: 'קורה עכשיו: is + sleeping.' },
  { id: 'g13', type: 'type', q: 'They ___ the story.', verb: 'not / believe', accept: ["don't believe", 'do not believe'],
    full: "They <mark>don't believe</mark> the story.", why: '<b dir="ltr">believe</b> לא מקבל ing. שלילה עם they: don\'t + בסיס.' },
  { id: 'g14', type: 'type', q: 'Look! She ___ a cake for the party.', verb: 'make', accept: ['is making', "'s making"],
    full: 'Look! She <mark>is making</mark> a cake for the party.', why: 'Look! = עכשיו. make נגמר ב-e, אז making.' },
  { id: 'g15', type: 'type', q: 'Write a question: (she / often / borrow / your books)', verb: null,
    accept: ['does she often borrow your books', 'does she borrow your books often'],
    full: '<mark>Does</mark> she often <mark>borrow</mark> your books?', why: 'הרגל (often), אז Present Simple. שאלה: Does + she + פועל בסיס.' },
  { id: 'g16', type: 'type', q: 'Write a question: (you / laugh / at me / right now)', verb: null,
    accept: ['are you laughing at me right now', 'are you laughing at me'],
    full: '<mark>Are</mark> you <mark>laughing</mark> at me right now?', why: 'right now = Present Progressive. שאלה: Are + you + ing.' },
  { id: 'g17', type: 'tf', q: "She don't want to defend her idea.", correct: false,
    full: "She <mark>doesn't</mark> want to defend her idea.", why: 'she = גוף שלישי, אז doesn\'t ולא don\'t.' },
  { id: 'g18', type: 'tf', q: 'I am knowing the answer.', correct: false,
    full: 'I <mark>know</mark> the answer.', why: 'know לא מקבל ing, גם כשמדובר בעכשיו.' },
  { id: 'g19', type: 'tf', q: 'The public is gathering outside the building now.', correct: true,
    full: 'The public <mark>is gathering</mark> outside the building now.', why: 'now = עכשיו, ו-the public הוא שם יחיד, אז is.' },
  { id: 'g20', type: 'tf', q: 'Does he usually tweets about football?', correct: false,
    full: 'Does he usually <mark>tweet</mark> about football?', why: 'אחרי Does הפועל בלי s: tweet.' },
];

const VOCAB_ITEMS = [
  { id: 'v1', q: 'The ___ is broken, so we have to take the stairs.', options: ['elevator', 'jar', 'article', 'route'], answer: 'elevator', why: 'elevator = מעלית' },
  { id: 'v2', q: "Can I ___ your pen? I'll give it back after class.", options: ['borrow', 'forgive', 'deny', 'attach'], answer: 'borrow', why: 'borrow = לשאול (לקחת בהשאלה)' },
  { id: 'v3', q: 'My ___ at work helped me finish the project.', options: ['colleague', 'stranger', 'speaker', 'opinion'], answer: 'colleague', why: 'colleague = עמית לעבודה' },
  { id: 'v4', q: 'She has a great ___. She laughs at all my jokes.', options: ['sense of humor', 'attitude', 'excuse', 'tone'], answer: 'sense of humor', why: 'sense of humor = חוש הומור' },
  { id: 'v5', q: "Don't talk to ___ on your way home.", options: ['strangers', 'colleagues', 'notes', 'topics'], answer: 'strangers', why: 'stranger = זר' },
  { id: 'v6', q: 'He tried to ___ that he broke the window, but everyone saw him.', options: ['deny', 'defend', 'arrange', 'express'], answer: 'deny', why: 'deny = להכחיש' },
  { id: 'v7', q: 'Please ___ the photo to the email.', options: ['attach', 'roll', 'dive', 'gather'], answer: 'attach', why: 'attach = לצרף' },
  { id: 'v8', q: 'This decision is ___. It will change everything.', options: ['crucial', 'elementary', 'singular', 'ancient'], answer: 'crucial', why: 'crucial = מכריע, קריטי' },
  { id: 'v9', q: 'The Pyramids are very ___ buildings.', options: ['ancient', 'complex', 'certain', 'mean'], answer: 'ancient', why: 'ancient = עתיק' },
  { id: 'v10', q: "I'm so tired. I ___ slept last night.", options: ['hardly', 'eventually', 'relatively', 'later'], answer: 'hardly', why: 'hardly = בקושי' },
  { id: 'v11', q: 'We waited for two hours, and ___ the bus arrived.', options: ['eventually', 'hardly', 'nowadays', 'rather'], answer: 'eventually', why: 'eventually = בסופו של דבר' },
  { id: 'v12', q: 'Write one ___ about your favorite hobby.', options: ['paragraph', 'period', 'phrase', 'plural'], answer: 'paragraph', why: 'paragraph = פסקה' },
  { id: 'v13', q: "What's your ___ about school uniforms?", options: ['opinion', 'topic', 'speech', 'route'], answer: 'opinion', why: 'opinion = דעה' },
  { id: 'v14', q: 'Can you do me a ___ and close the window?', options: ['favor', 'duty', 'joke', 'cut'], answer: 'favor', why: 'favor = טובה' },
  { id: 'v15', q: "___, I didn't like the movie at all.", options: ['To be honest', 'In other words', 'For instance', 'In detail'], answer: 'To be honest', why: 'to be honest = למען האמת' },
  { id: 'v16', q: 'He talks ___ he knows everything.', options: ['as if', 'so that', 'in fact', 'at all'], answer: 'as if', why: 'as if = כאילו' },
  { id: 'v17', q: "I'm saving money ___ I can buy a new phone.", options: ['so that', 'as if', 'for instance', 'at all'], answer: 'so that', why: 'so that = כדי ש...' },
  { id: 'v18', q: 'There are many team sports, ___, football and basketball.', options: ['for instance', 'to be honest', 'in other words', 'nowadays'], answer: 'for instance', why: 'for instance = לדוגמה' },
  { id: 'v19', q: '___, most teenagers have a smartphone.', options: ['Nowadays', 'Later', 'Eventually', 'Hardly'], answer: 'Nowadays', why: 'nowadays = כיום, בימינו' },
  { id: 'v20', q: 'The teacher read the text slowly, and we wrote a ___.', options: ['dictation', 'culture', 'noticeboard', 'gas'], answer: 'dictation', why: 'dictation = הכתבה' },
];
VOCAB_ITEMS.forEach(it => {
  it.type = 'mc';
  it.full = it.q.replace('___', `<mark>${it.answer}</mark>`);
});

/* ---------- Past: sentence machine ---------- */
const PAST_VERBS = [
  { id: 'play',  label: 'play football',  past: ['play', 'ed'],  ing: ['play', 'ing'],  rest: 'football',
    edRule: 'רוב הפעלים: מוסיפים <b>ed</b>' },
  { id: 'study', label: 'study English',  past: ['stud', 'ied'], ing: ['study', 'ing'], rest: 'English',
    edRule: 'עיצור ואחריו <b>y</b>: ה-y הופכת ל-<b>ied</b>', ingRule: 'עם <b>ing</b> ה-y נשארת: <b dir="ltr">studying</b>' },
  { id: 'stop',  label: 'stop the car',   past: ['stop', 'ped'], ing: ['stop', 'ping'], rest: 'the car',
    edRule: 'עיצור-תנועה-עיצור: מכפילים את האות האחרונה, <b dir="ltr">stop → stopped</b>', ingRule: 'גם עם <b>ing</b> מכפילים: <b dir="ltr">stopping</b>' },
  { id: 'go',    label: 'go to school',   past: ['', 'went'],    ing: ['go', 'ing'],    rest: 'to school',
    edRule: 'פועל לא סדיר: <b dir="ltr">go → went</b>. את הצורה הזאת צריך לזכור בעל פה' },
  { id: 'write', label: 'write an email', past: ['', 'wrote'],   ing: ['writ', 'ing'],  rest: 'an email',
    edRule: 'פועל לא סדיר: <b dir="ltr">write → wrote</b>', ingRule: 'נגמר ב-e שקטה: מורידים אותה, <b dir="ltr">writing</b>' },
  { id: 'make',  label: 'make a cake',    past: ['', 'made'],    ing: ['mak', 'ing'],   rest: 'a cake',
    edRule: 'פועל לא סדיר: <b dir="ltr">make → made</b>', ingRule: 'נגמר ב-e שקטה: מורידים אותה, <b dir="ltr">making</b>' },
];

function pastBuild(st){
  const v = PAST_VERBS.find(x => x.id === st.verb);
  const was = ['I', 'He', 'She'].includes(st.subject) ? 'was' : 'were';
  const time = st.tense === 'simple' ? 'yesterday' : "at 9 o'clock yesterday";
  const subj = { t: st.subject, c: 'tk-subj' };
  const subjLow = { t: st.subject === 'I' ? 'I' : st.subject.toLowerCase(), c: 'tk-subj' };
  const rest = { t: `${v.rest} ${time}`, c: 'tk-rest' };
  const base = { t: v.id, c: 'tk-stem' };
  let tokens, rules = [];
  if(st.tense === 'simple'){
    if(st.form === 'pos'){
      tokens = [subj, { stem: v.past[0], suf: v.past[1] }, rest];
      rules.push('ב-<bdi>Past Simple</bdi> הפועל זהה לכל הנושאים: <b dir="ltr">I, he, they...</b>', v.edRule);
    } else if(st.form === 'neg'){
      tokens = [subj, { t: "didn't", c: 'tk-aux' }, base, rest];
      rules.push('<b dir="ltr">didn\'t</b> + פועל בסיס. הצורה של העבר עוברת ל-did, אז הפועל חוזר לבסיס');
    } else {
      tokens = [{ t: 'Did', c: 'tk-aux' }, subjLow, base, rest];
      rules.push('<b dir="ltr">Did</b> בהתחלה + פועל בסיס, לכל הנושאים');
    }
  } else {
    const ingTok = { stem: v.ing[0], suf: v.ing[1] };
    const who = was === 'was' ? 'I / he / she / it' : 'you / we / they';
    if(st.form === 'pos'){
      tokens = [subj, { t: was, c: 'tk-aux' }, ingTok, rest];
      rules.push(`<b dir="ltr">${was}</b> (ל-<bdi>${who}</bdi>) + פועל עם <b>ing</b>`);
    } else if(st.form === 'neg'){
      const neg = was === 'was' ? "wasn't" : "weren't";
      tokens = [subj, { t: neg, c: 'tk-aux' }, ingTok, rest];
      rules.push(`שלילה: <b dir="ltr">${neg}</b> + פועל עם <b>ing</b>`);
    } else {
      tokens = [{ t: was[0].toUpperCase() + was.slice(1), c: 'tk-aux' }, subjLow, ingTok, rest];
      rules.push(`שאלה: <b dir="ltr">${was}</b> עובר להתחלה`);
    }
    rules.push(v.ingRule || 'רוב הפעלים: מוסיפים <b>ing</b>');
  }
  const meaning = st.tense === 'simple' ? 'פעולה שהתחילה והסתיימה בעבר' : 'הייתי באמצע הפעולה, ברגע מסוים בעבר';
  return { html: tokensHtml(tokens, st.form), rules, meaning };
}

/* ---------- Past: lesson ---------- */
function pastTimeline(kind){
  const axis = (y, now) => `
    <line x1="16" y1="${y}" x2="300" y2="${y}" class="tl-axis"/>
    <path d="M296 ${y - 5}l6 5-6 5" class="tl-axis" fill="none"/>
    <line x1="${now}" y1="${y - 10}" x2="${now}" y2="${y + 8}" class="tl-now"/>
    <text x="20" y="${y + 24}" class="tl-label" text-anchor="start">עבר</text>
    <text x="${now}" y="${y + 24}" class="tl-label tl-label-now" text-anchor="middle">עכשיו</text>`;
  if(kind === 'simple'){
    return `<svg viewBox="0 0 320 96" class="timeline" role="img" aria-label="ציר זמן: פעולה אחת שהסתיימה בעבר">${axis(60, 250)}
      <circle cx="100" cy="60" r="7" class="tl-dot"/><text x="100" y="40" class="tl-cap" text-anchor="middle">last night</text></svg>`;
  }
  if(kind === 'prog'){
    return `<svg viewBox="0 0 320 96" class="timeline" role="img" aria-label="ציר זמן: פעולה ממושכת בעבר, ובאמצעה שעה מסוימת">${axis(60, 250)}
      <rect x="44" y="49" width="130" height="22" rx="11" class="tl-band"/>
      <line x1="110" y1="34" x2="110" y2="49" class="tl-tick"/><circle cx="110" cy="60" r="5" class="tl-band-dot"/>
      <text x="110" y="28" class="tl-cap tl-cap-prog" text-anchor="middle">at 9 o'clock</text></svg>`;
  }
  if(kind === 'interrupt'){
    return `<svg viewBox="0 0 320 124" class="timeline" role="img" aria-label="ציר זמן: פעולה ארוכה, ובאמצעה פעולה קצרה שקוטעת אותה">${axis(96, 270)}
      <rect x="36" y="70" width="200" height="22" rx="11" class="tl-band"/>
      <text x="48" y="85" class="tl-in tl-cap-prog" text-anchor="start">was watching TV</text>
      <line x1="190" y1="22" x2="190" y2="66" class="tl-hit"/>
      <circle cx="190" cy="81" r="7" class="tl-dot"/>
      <text x="190" y="16" class="tl-cap" text-anchor="middle">the lights went out</text></svg>`;
  }
  return `<svg viewBox="0 0 320 124" class="timeline" role="img" aria-label="ציר זמן: שתי פעולות ארוכות בעבר, באותו זמן">${axis(96, 270)}
    <rect x="36" y="14" width="200" height="22" rx="11" class="tl-band"/>
    <text x="48" y="29" class="tl-in tl-cap-prog" text-anchor="start">we were watching TV</text>
    <rect x="36" y="44" width="200" height="22" rx="11" class="tl-band"/>
    <text x="48" y="59" class="tl-in tl-cap-prog" text-anchor="start">Dad was making popcorn</text></svg>`;
}

const IRREGULAR = [
  ['go', 'went'], ['come', 'came'], ['see', 'saw'], ['do', 'did'], ['have', 'had'], ['get', 'got'],
  ['make', 'made'], ['take', 'took'], ['eat', 'ate'], ['buy', 'bought'], ['find', 'found'], ['leave', 'left'],
  ['meet', 'met'], ['write', 'wrote'], ['ride', 'rode'], ['drive', 'drove'], ['break', 'broke'], ['wake', 'woke'],
  ['begin', 'began'], ['ring', 'rang'], ['fall', 'fell'], ['hear', 'heard'], ['steal', 'stole'], ['stand', 'stood'],
  ['cut', 'cut'], ['hit', 'hit'], ['think', 'thought'], ['teach', 'taught'],
];

function renderPastLearn(){
  return `
  <section class="ls-card ls-hero">
    <p class="ls-kicker">השאלה היחידה שצריך לשאול</p>
    <h2>הפעולה <span class="c-simple">התחילה והסתיימה</span>, או שהייתה <span class="c-prog">באמצע</span>?</h2>
    <div class="vs">
      <div class="vs-col t-simple">
        <span class="vs-name" dir="ltr">Past Simple</span>
        ${pastTimeline('simple')}
        <p class="en" dir="ltr">I <b>watched</b> TV last night.</p>
        <p class="vs-he">פעולה שלמה בעבר: קרתה ונגמרה</p>
      </div>
      <div class="vs-col t-prog">
        <span class="vs-name" dir="ltr">Past Progressive</span>
        ${pastTimeline('prog')}
        <p class="en" dir="ltr">I <b>was watching</b> TV at nine o'clock last night.</p>
        <p class="vs-he">ברגע מסוים בעבר הייתי באמצע הפעולה</p>
      </div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">1</span><span>מכונת המשפטים</span></h3>
    <p class="ls-text">תבחר זמן, סוג משפט, נושא ופועל. החלקים הצבעוניים הם מה שמשתנה.</p>
    <div class="machine" data-machine="past">${renderMachine('past')}</div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">2</span><span><bdi>when</bdi> ו-<bdi>while</bdi>: שני הזמנים במשפט אחד</span></h3>
    <p class="ls-text">זה הנושא שהכי הרבה שואלים עליו בדפי החזרה.</p>
    <div class="story t-prog">
      <span class="vs-name">פעולה ארוכה שנקטעה</span>
      ${pastTimeline('interrupt')}
      <p class="en" dir="ltr">I <b class="c-prog">was watching</b> TV <b>when</b> the lights <b class="c-simple">went out</b>.</p>
      <p class="vs-he">הפעולה הארוכה ב-<bdi>Past Progressive</bdi>, והפעולה הקצרה שקטעה אותה ב-<bdi>Past Simple</bdi>.</p>
    </div>
    <div class="story t-prog">
      <span class="vs-name">שתי פעולות ארוכות באותו זמן</span>
      ${pastTimeline('parallel')}
      <p class="en" dir="ltr">We <b class="c-prog">were watching</b> TV <b>while</b> Dad <b class="c-prog">was making</b> popcorn.</p>
      <p class="vs-he">שתיהן ארוכות ובמקביל, אז שתיהן ב-<bdi>Past Progressive</bdi>.</p>
    </div>
    <div class="formula">
      <div class="formula-row t-simple"><p dir="ltr"><span class="f-key">when</span> + <span class="f-part">short action</span> <span class="f-key">(Past Simple)</span></p>
        <p class="vs-he">אחרי <bdi>when</bdi> בא בדרך כלל הרגע הקצר: <bdi>when the phone rang</bdi></p></div>
      <div class="formula-row t-prog"><p dir="ltr"><span class="f-key">while</span> + <span class="f-part">long action</span> <span class="f-key">(Past Progressive)</span></p>
        <p class="vs-he">אחרי <bdi>while</bdi> באה הפעולה הארוכה: <bdi>while I was waiting</bdi></p></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">3</span><span>איך בונים</span></h3>
    <div class="formula">
      <div class="formula-row t-simple"><span class="vs-name" dir="ltr">Past Simple</span>
        <p dir="ltr"><span class="f-part">subject</span> + <span class="f-key">verb-ed / irregular</span></p></div>
      <div class="formula-row t-prog"><span class="vs-name" dir="ltr">Past Progressive</span>
        <p dir="ltr"><span class="f-part">subject</span> + <span class="f-key">was / were</span> + <span class="f-key">verb-ing</span></p></div>
    </div>
    <div class="table-wrap">
      <table class="conj" dir="ltr">
        <thead><tr><th></th><th class="c-simple">Past Simple</th><th class="c-prog">Past Progressive</th></tr></thead>
        <tbody>
          <tr><th>I</th><td>work<span class="hl-s">ed</span></td><td><span class="hl-p">was</span> work<span class="hl-p">ing</span></td></tr>
          <tr><th>He / She / It</th><td>work<span class="hl-s">ed</span></td><td><span class="hl-p">was</span> work<span class="hl-p">ing</span></td></tr>
          <tr class="row-were"><th>You</th><td>work<span class="hl-s">ed</span></td><td><span class="hl-p">were</span> work<span class="hl-p">ing</span></td></tr>
          <tr class="row-were"><th>We</th><td>work<span class="hl-s">ed</span></td><td><span class="hl-p">were</span> work<span class="hl-p">ing</span></td></tr>
          <tr class="row-were"><th>They</th><td>work<span class="hl-s">ed</span></td><td><span class="hl-p">were</span> work<span class="hl-p">ing</span></td></tr>
        </tbody>
      </table>
    </div>
    <p class="ls-note">ב-<bdi>Past Simple</bdi> הפועל זהה לכל הנושאים. ב-<bdi>Past Progressive</bdi> רק צריך לבחור: <b dir="ltr">was</b> ל-<bdi>I / he / she / it</bdi>, <b dir="ltr">were</b> ל-<bdi>you / we / they</bdi>.</p>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">4</span><span>כתיב <bdi>ed</bdi> ופעלים לא סדירים</span></h3>
    <div class="spell t-simple">
      <span class="vs-name">סיומת <b dir="ltr">ed</b></span>
      <ul>
        <li><span>רוב הפעלים</span><span dir="ltr">play → play<b>ed</b></span></li>
        <li><span>נגמר ב-e</span><span dir="ltr">live → live<b>d</b></span></li>
        <li><span>עיצור + y</span><span dir="ltr">study → stud<b>ied</b></span></li>
        <li><span>עיצור-תנועה-עיצור</span><span dir="ltr">stop → stop<b>ped</b></span></li>
      </ul>
    </div>
    <p class="ls-text ls-gap">פעלים לא סדירים לא מקבלים <bdi>ed</bdi>. אלה שמופיעים בדפי החזרה, כדאי לדעת בעל פה:</p>
    <div class="irr" dir="ltr">${IRREGULAR.map(([b, p]) => `<span class="irr-item"><span class="irr-base">${b}</span><span class="irr-past">${p}</span></span>`).join('')}</div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">5</span><span>שלילה ושאלות כן/לא</span></h3>
    <div class="jump t-simple">
      <span class="vs-name"><bdi>Past Simple</bdi>: העבר קופץ ל-did</span>
      <p class="en" dir="ltr">She <span class="hl-s">went</span> to the party.</p>
      <p class="en" dir="ltr">She <span class="hl-s">didn't</span> go to the party.</p>
      <p class="en" dir="ltr"><span class="hl-s">Did</span> she go to the party?</p>
      <p class="ls-note">אחרי <b dir="ltr">did / didn't</b> הפועל תמיד בבסיס. <b dir="ltr">Did she went</b> זו טעות.</p>
    </div>
    <div class="table-wrap">
      <table class="conj conj-forms" dir="ltr">
        <thead><tr><th></th><th class="c-simple">Past Simple</th><th class="c-prog">Past Progressive</th></tr></thead>
        <tbody>
          <tr><th>+</th><td>He worked.</td><td>He <span class="hl-p">was</span> working.</td></tr>
          <tr><th>−</th><td>He <span class="hl-s">didn't</span> work.</td><td>He <span class="hl-p">wasn't</span> working.</td></tr>
          <tr><th>?</th><td><span class="hl-s">Did</span> he work?</td><td><span class="hl-p">Was</span> he working?</td></tr>
          <tr><th>Yes</th><td>Yes, he <span class="hl-s">did</span>.</td><td>Yes, he <span class="hl-p">was</span>.</td></tr>
          <tr><th>No</th><td>No, he <span class="hl-s">didn't</span>.</td><td>No, he <span class="hl-p">wasn't</span>.</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">6</span><span>שאלות מידע ושאלות נושא</span></h3>
    <p class="ls-text">לפי דפי החזרה עמ׳ <bdi>16</bdi>.</p>
    <div class="formula">
      <div class="formula-row t-simple"><span class="vs-name">שאלת מידע, <bdi>Past Simple</bdi></span>
        <p dir="ltr"><span class="f-key">Wh-</span> + <span class="f-key">did</span> + <span class="f-part">subject</span> + <span class="f-part">verb?</span></p>
        <p class="en" dir="ltr">What <b class="c-simple">did</b> she study last night?</p></div>
      <div class="formula-row t-prog"><span class="vs-name">שאלת מידע, <bdi>Past Progressive</bdi></span>
        <p dir="ltr"><span class="f-key">Wh-</span> + <span class="f-key">was / were</span> + <span class="f-part">subject</span> + <span class="f-key">verb-ing?</span></p>
        <p class="en" dir="ltr">What <b class="c-prog">was</b> she <b class="c-prog">studying</b> at 9 o'clock?</p></div>
    </div>
    <div class="warn">
      <p class="warn-title">שאלת נושא: שואלים מי או מה עשה את הפעולה</p>
      <p class="en" dir="ltr"><b>Who</b> studied last night? &nbsp; <b>What</b> made that noise?</p>
      <p class="en" dir="ltr"><b>Who</b> was studying at 9 o'clock?</p>
      <p class="ls-note">בשאלת נושא אין <b dir="ltr">did</b>. הפועל בא מיד אחרי <bdi>Who / What</bdi>, ותמיד בגוף שלישי יחיד (<b dir="ltr">was</b>), גם אם התשובה ברבים.</p>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">7</span><span>ביטויי זמן</span></h3>
    <div class="signals">
      <div class="t-simple"><span class="vs-name" dir="ltr">Past Simple</span>
        <div class="tags" dir="ltr"><span>yesterday</span><span>last week</span><span>last year</span><span>two days ago</span><span>an hour ago</span><span>in 1972</span><span>on May 1</span></div></div>
      <div class="t-prog"><span class="vs-name" dir="ltr">Past Progressive</span>
        <div class="tags" dir="ltr"><span>while</span><span>as</span><span>at four o'clock</span><span>at noon</span><span>at midnight</span><span>all morning</span><span>all evening</span></div></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">8</span><span>הטעויות הכי נפוצות</span></h3>
    <div class="fix-list">
      <div class="fix"><p class="fix-bad" dir="ltr">Did she went to the party?</p><p class="fix-good" dir="ltr">Did she go to the party?</p><p class="fix-why">אחרי did הפועל בבסיס</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">They was playing football.</p><p class="fix-good" dir="ltr">They were playing football.</p><p class="fix-why">they = were</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">I was watch TV.</p><p class="fix-good" dir="ltr">I was watching TV.</p><p class="fix-why">אחרי was / were הפועל עם ing</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">Who did find the money?</p><p class="fix-good" dir="ltr">Who found the money?</p><p class="fix-why">שאלת נושא: בלי did</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">While the phone rang, I was sleeping.</p><p class="fix-good" dir="ltr">When the phone rang, I was sleeping.</p><p class="fix-why">צלצול זו פעולה קצרה, אז when</p></div>
    </div>
  </section>

  <a class="btn btn-primary pressable ls-next" href="#past/review">לדפי החזרה ${icon('forward')}</a>`;
}

/* ---------- Past: review worksheets ---------- */
const WHEN_WHY = '<b dir="ltr">when</b> לפני הפעולה הקצרה (<bdi>Past Simple</bdi>), <b dir="ltr">while</b> לפני הפעולה הארוכה (<bdi>Past Progressive</bdi>).';

const REVIEW_SETS = [
  { id: 'r13a', page: 13, ex: 1, title: 'בחר את הצורה הנכונה', items: [
    { q: 'Dina ___ the guitar when a string broke.', options: ['played', 'was playing'], answer: 'was playing', why: 'הנגינה הייתה פעולה ארוכה, ומיתר שנקרע קטע אותה.' },
    { q: 'The painters ___ when I saw them this morning.', options: ["weren't working", "didn't work"], answer: "weren't working", why: 'מה הם עשו ברגע שראיתי אותם: פעולה (או אי-פעולה) ממושכת, <bdi>Past Progressive</bdi>.' },
    { q: 'I was checking my work when I ___ a serious mistake.', options: ['discovered', 'was discovering'], answer: 'discovered', why: 'הגילוי הוא הרגע הקצר שקטע את הבדיקה: <bdi>Past Simple</bdi>.' },
    { q: "Shimon ___ his bike at 4 o'clock this afternoon.", options: ['cleaned', 'was cleaning'], answer: 'was cleaning', why: 'שעה מסוימת (<bdi>at 4 o\'clock</bdi>) = הוא היה באמצע הפעולה.' },
    { q: 'Lior ___ me yesterday.', options: ["didn't call", "wasn't calling"], answer: "didn't call", why: '<bdi>yesterday</bdi> ופעולה שלמה: <bdi>Past Simple</bdi>.' },
    { q: 'He ___ his finger while he was preparing a salad.', options: ['cut', 'was cutting'], answer: 'cut', why: 'החתך הוא רגע קצר בתוך הפעולה הארוכה. <bdi>cut → cut</bdi> הוא פועל לא סדיר.' },
    { q: 'I ___ when you came in.', options: ["didn't sleep", "wasn't sleeping"], answer: "wasn't sleeping", why: 'ברגע שנכנסת לא הייתי באמצע שינה: <bdi>Past Progressive</bdi>.' },
    { q: 'Einat was reading while her brothers ___ TV.', options: ['watched', 'were watching'], answer: 'were watching', why: '<bdi>while</bdi> ושתי פעולות ארוכות במקביל: שתיהן <bdi>Past Progressive</bdi>.' },
    { q: "It wasn't raining when we ___ the house.", options: ['were leaving', 'left'], answer: 'left', why: 'אחרי <bdi>when</bdi> בא הרגע הקצר. <bdi>leave → left</bdi>.' },
    { q: 'Sharon ___ the car while she was crossing the street.', options: ["didn't notice", "wasn't noticing"], answer: "didn't notice", why: 'לשים לב זה רגע, לא פעולה ממושכת: <bdi>Past Simple</bdi>.' },
  ]},
  { id: 'r13b', page: 13, ex: 2, title: 'השלם עם when או while', items: [
    { q: 'Tammy was getting dressed ___ her mother left for work.', options: ['when', 'while'], answer: 'when' },
    { q: 'It was snowing ___ we arrived.', options: ['when', 'while'], answer: 'when' },
    { q: 'I met my English teacher ___ I was shopping for shoes.', options: ['when', 'while'], answer: 'while' },
    { q: '___ Maya was eating supper, her dad was feeding the dog.', options: ['When', 'While'], answer: 'While' },
    { q: 'They were sitting in a restaurant ___ they heard the news of the fire.', options: ['when', 'while'], answer: 'when' },
    { q: 'Sam watched ___ his father was fixing his bike.', options: ['when', 'while'], answer: 'while' },
    { q: '___ the police arrived, the thieves were counting the money.', options: ['When', 'While'], answer: 'When' },
    { q: 'Assaf broke his glasses ___ he was skateboarding.', options: ['when', 'while'], answer: 'while' },
  ].map(it => ({ ...it, why: WHEN_WHY }))},
  { id: 'r14a', page: 14, ex: 3, title: 'השלם את הפועל בזמן הנכון', items: [
    { type: 'type', q: "Dan wasn't waiting at the station when the train ___.", verb: 'arrive', accept: ['arrived'], why: 'הרכבת הגיעה ברגע אחד: <bdi>Past Simple</bdi>.' },
    { type: 'type', q: 'I was looking at the map while Miri ___.', verb: 'drive', accept: ['was driving'], why: '<bdi>while</bdi> ושתי פעולות ארוכות במקביל.' },
    { type: 'type', q: 'Edan ___ his glasses while he was playing soccer.', verb: 'break', accept: ['broke'], why: 'רגע קצר בתוך פעולה ארוכה. <bdi>break → broke</bdi>.' },
    { type: 'type', q: 'Rotem ___ text messages when she dropped her phone.', verb: 'write', accept: ['was writing'], why: 'הפעולה הארוכה שנקטעה: <bdi>Past Progressive</bdi>.' },
    { type: 'type', q: 'I ___ that you were standing behind me.', verb: 'not realize', accept: ["didn't realize", 'did not realize', "didn't realise", 'did not realise'], why: '<bdi>realize</bdi> הוא פועל של מחשבה, לא מקבל ing.' },
    { type: 'type', q: 'My friends ___ volleyball when I arrived at the gym.', verb: 'not play', accept: ["weren't playing", 'were not playing'], why: 'מה קרה ברגע שהגעתי: <bdi>Past Progressive</bdi>, ו-friends ברבים, אז <bdi>weren\'t</bdi>.' },
    { type: 'type', q: 'Tom ___ hurt when he fell off the ladder.', verb: 'not get', accept: ["didn't get", 'did not get'], why: 'תוצאה של רגע אחד: <bdi>Past Simple</bdi>.' },
    { type: 'type', q: 'When I came home, my dad ___ in the garden.', verb: 'work', accept: ['was working'], why: 'מה אבא עשה ברגע שהגעתי: הוא היה באמצע.' },
    { type: 'type', q: 'Daniella ___ her bike while her dog was running next to her.', verb: 'ride', accept: ['was riding'], why: 'שתי פעולות ארוכות במקביל.' },
    { type: 'type', q: 'The pilot ___ when he made an emergency landing.', verb: 'not panic', accept: ["didn't panic", 'did not panic'], why: 'תגובה ברגע אחד: <bdi>Past Simple</bdi>.' },
    { type: 'type', q: 'While I was talking to Adi, she ___ her nails.', verb: 'do', accept: ['was doing'], why: '<bdi>while</bdi> ושתי פעולות ארוכות במקביל.' },
    { type: 'type', q: 'I ___ my favorite TV program at 10 last night.', verb: 'watch', accept: ['was watching'], why: 'שעה מסוימת בעבר (<bdi>at 10</bdi>) = הייתי באמצע.' },
    { type: 'type', q: 'While you ___ with Eran, we were doing our homework.', verb: 'chat', accept: ['were chatting'], why: 'אחרי <bdi>while</bdi> פעולה ארוכה. chat מכפיל t: <bdi>chatting</bdi>.' },
    { type: 'type', q: 'We ___ what he was talking about.', verb: 'not understand', accept: ["didn't understand", 'did not understand'], why: '<bdi>understand</bdi> לא מקבל ing.' },
    { type: 'type', q: 'Avi ___ to park his car when he hit a tree.', verb: 'try', accept: ['was trying'], why: 'הפעולה הארוכה שנקטעה כשפגע בעץ.' },
  ]},
  { id: 'r14b', page: 14, ex: 4, title: 'השלם במשפט משלך', free: true, items: [
    { type: 'free', q: 'While ___, I fell off my bike.', example: 'While <mark>I was riding down the hill</mark>, I fell off my bike.', why: 'אחרי <bdi>while</bdi>: פעולה ארוכה ב-<bdi>Past Progressive</bdi>.' },
    { type: 'free', q: 'Last weekend, I ___.', example: 'Last weekend, I <mark>went to the beach with my family</mark>.', why: '<bdi>Last weekend</bdi> ופעולה שלמה: <bdi>Past Simple</bdi>.' },
    { type: 'free', q: 'They were playing Taki when ___.', example: 'They were playing Taki when <mark>their mother called them for dinner</mark>.', why: 'אחרי <bdi>when</bdi>: הרגע הקצר שקטע, <bdi>Past Simple</bdi>.' },
    { type: 'free', q: 'Eitan burned his hand while ___.', example: 'Eitan burned his hand while <mark>he was cooking pasta</mark>.', why: 'אחרי <bdi>while</bdi>: פעולה ארוכה, <bdi>Past Progressive</bdi>.' },
    { type: 'free', q: 'When ___, Nadav was sleeping.', example: 'When <mark>the phone rang</mark>, Nadav was sleeping.', why: 'אחרי <bdi>when</bdi>: רגע קצר, <bdi>Past Simple</bdi>.' },
    { type: 'free', q: '___ when they heard the police siren.', example: '<mark>They were walking home</mark> when they heard the police siren.', why: 'הפעולה הארוכה שנקטעה: <bdi>Past Progressive</bdi>.' },
    { type: 'free', q: '___ while I was waiting for the bus.', example: '<mark>I saw my English teacher</mark> while I was waiting for the bus.', why: 'רגע קצר בתוך ההמתנה: <bdi>Past Simple</bdi>. אפשר גם פעולה ארוכה במקביל (<bdi>It was raining</bdi>).' },
    { type: 'free', q: '___ when someone stole his bag.', example: '<mark>Yoni was sitting in the park</mark> when someone stole his bag.', why: 'הפעולה הארוכה שנקטעה: <bdi>Past Progressive</bdi>.' },
    { type: 'free', q: '___ while his brother was washing the car.', example: '<mark>Ido was cleaning his room</mark> while his brother was washing the car.', why: 'שתי פעולות ארוכות במקביל: <bdi>Past Progressive</bdi>.' },
    { type: 'free', q: '___ when the alarm clock rang.', example: '<mark>I was dreaming about the test</mark> when the alarm clock rang.', why: 'הפעולה הארוכה שנקטעה: <bdi>Past Progressive</bdi>.' },
    { type: 'free', q: "At 5 o'clock yesterday, ___.", example: "At 5 o'clock yesterday, <mark>I was doing my homework</mark>.", why: 'שעה מסוימת בעבר: <bdi>Past Progressive</bdi>.' },
  ]},
  { id: 'r17a', page: 17, ex: 1, title: 'בחר את התשובה הנכונה', items: [
    { q: "What ___ yesterday between 3 and 4 o'clock?", options: ['did you do', 'were you doing'], answer: 'were you doing', why: 'בין 3 ל-4 = באמצע פעולה, בזמן מסוים.' },
    { q: '___ when the baby-sitter arrived?', options: ['Did the children sleep', 'Were the children sleeping'], answer: 'Were the children sleeping', why: 'מה קרה ברגע שהבייביסיטר הגיעה: <bdi>Past Progressive</bdi>.' },
    { q: '___ to her ballet class yesterday?', options: ['Did Ruti go', 'Was Ruti going'], answer: 'Did Ruti go', why: '<bdi>yesterday</bdi> ופעולה שלמה: <bdi>Did</bdi>.' },
    { q: '___ Hagit to your birthday party?', options: ['Did you invite', 'Were you inviting'], answer: 'Did you invite', why: 'הזמנה היא פעולה שלמה: <bdi>Past Simple</bdi>.' },
    { q: 'Which sweater ___ in the end?', options: ['did she buy', 'was she buying'], answer: 'did she buy', why: '<bdi>in the end</bdi> = התוצאה הסופית, פעולה שלמה.' },
    { q: '___ when you left the house this morning?', options: ['Did it rain', 'Was it raining'], answer: 'Was it raining', why: 'מה היה מזג האוויר ברגע שיצאת: <bdi>Past Progressive</bdi>.' },
    { q: "Who ___ me yesterday at 7 o'clock?", options: ['looked for', 'was looking for'], answer: 'was looking for', why: 'שעה מסוימת: באמצע פעולה. זו שאלת נושא, אז <bdi>was</bdi> מיד אחרי <bdi>Who</bdi>.' },
    { q: 'Who ___ that money in the street?', options: ['found', 'find'], answer: 'found', why: 'שאלת נושא: בלי did, והפועל בעבר. <bdi>find → found</bdi>.' },
    { q: 'Who ___ the children while you were shopping?', options: ['watched', 'was watching'], answer: 'was watching', why: '<bdi>while</bdi> ושתי פעולות ארוכות במקביל.' },
    { q: '___ Kobi at the party yesterday?', options: ['Did you meet', 'Were you meeting'], answer: 'Did you meet', why: 'פגישה היא פעולה שלמה: <bdi>Past Simple</bdi>.' },
  ]},
  { id: 'r17b', page: 17, ex: 2, title: 'סדר את המילים לשאלה', items: [
    { type: 'order', words: ['you', 'where', 'buy', 'did', 'those jeans'], accept: ['where did you buy those jeans'], answer: 'Where did you buy those jeans?', why: 'שאלת מידע ב-<bdi>Past Simple</bdi>: <bdi>Wh- + did + subject + verb</bdi>.' },
    { type: 'order', words: ['doing', 'Shmuel', 'was', 'what', 'when the party started'], accept: ['what was shmuel doing when the party started', 'when the party started what was shmuel doing'], answer: 'What was Shmuel doing when the party started?', why: '<bdi>Wh- + was + subject + verb-ing</bdi>.' },
    { type: 'order', words: ['working', 'you', 'at the computer', 'were', 'when I phoned'], accept: ['were you working at the computer when i phoned', 'when i phoned were you working at the computer'], answer: 'Were you working at the computer when I phoned?', why: 'שאלת כן/לא: <bdi>Were</bdi> בהתחלה.' },
    { type: 'order', words: ['you', 'did', 'to summer camp', 'go', 'when you were a child'], accept: ['did you go to summer camp when you were a child', 'when you were a child did you go to summer camp'], answer: 'Did you go to summer camp when you were a child?', why: 'שאלת כן/לא: <bdi>Did + subject + verb</bdi>.' },
    { type: 'order', words: ['they', 'in the sea', 'swimming', 'why', 'during a storm', 'were'], accept: ['why were they swimming in the sea during a storm'], answer: 'Why were they swimming in the sea during a storm?', why: '<bdi>Wh- + were + subject + verb-ing</bdi>.' },
    { type: 'order', words: ['did', 'you', 'this morning', 'wake up', 'what time'], accept: ['what time did you wake up this morning', 'this morning what time did you wake up'], answer: 'What time did you wake up this morning?', why: '<bdi>What time</bdi> נחשב מילת שאלה אחת.' },
    { type: 'order', words: ['on the English test', 'get', 'you', 'a good mark', 'did'], accept: ['did you get a good mark on the english test', 'on the english test did you get a good mark'], answer: 'Did you get a good mark on the English test?', why: '<bdi>Did + subject + verb</bdi>.' },
    { type: 'order', words: ['Shir', 'too fast', 'when the police stopped her', 'driving', 'was'], accept: ['was shir driving too fast when the police stopped her', 'when the police stopped her was shir driving too fast'], answer: 'Was Shir driving too fast when the police stopped her?', why: '<bdi>Was + subject + verb-ing</bdi>.' },
  ]},
  { id: 'r18a', page: 18, ex: 3, title: 'שאלת כן/לא, תשובה בשלילה ומשפט חיובי', items: [
    { type: 'multi', cue: 'Oren / write e-mails / when / the phone / ring / ? (read a book)', fields: [
        { label: 'שאלת כן/לא', accept: ['was oren writing emails when the phone rang'] },
        { label: 'תשובה בשלילה', accept: ["no he wasn't", 'no he was not'] },
        { label: 'משפט חיובי עם המילים בסוגריים', accept: ['he was reading a book'] }],
      answer: "Was Oren writing e-mails when the phone rang?<br>No, he wasn't. He was reading a book.", why: 'פעולה ארוכה שנקטעה (<bdi>when the phone rang</bdi>): <bdi>Past Progressive</bdi>.' },
    { type: 'multi', cue: 'the cat / hide / under the table / when / you / come home / ? (under the sofa)', fields: [
        { label: 'שאלת כן/לא', accept: ['was the cat hiding under the table when you came home'] },
        { label: 'תשובה בשלילה', accept: ["no it wasn't", 'no it was not', "no she wasn't", "no he wasn't"] },
        { label: 'משפט חיובי עם המילים בסוגריים', accept: ['it was hiding under the sofa', 'she was hiding under the sofa', 'he was hiding under the sofa'] }],
      answer: "Was the cat hiding under the table when you came home?<br>No, it wasn't. It was hiding under the sofa.", why: 'מה החתול עשה ברגע שהגעת: <bdi>Past Progressive</bdi>. <bdi>come → came</bdi>.' },
    { type: 'multi', cue: 'Noa / go / to the party / last night / ? (stay home)', fields: [
        { label: 'שאלת כן/לא', accept: ['did noa go to the party last night'] },
        { label: 'תשובה בשלילה', accept: ["no she didn't", 'no she did not'] },
        { label: 'משפט חיובי עם המילים בסוגריים', accept: ['she stayed home', 'she stayed at home', 'she stayed home last night', 'she stayed at home last night'] }],
      answer: "Did Noa go to the party last night?<br>No, she didn't. She stayed home.", why: '<bdi>last night</bdi> ופעולה שלמה: <bdi>Did</bdi>, ובתשובה <bdi>stayed</bdi>.' },
    { type: 'multi', cue: 'Ziva and Yael / run / in the park / when / the rain / begin / ? (sit in a café)', fields: [
        { label: 'שאלת כן/לא', accept: ['were ziva and yael running in the park when the rain began'] },
        { label: 'תשובה בשלילה', accept: ["no they weren't", 'no they were not'] },
        { label: 'משפט חיובי עם המילים בסוגריים', accept: ['they were sitting in a cafe'] }],
      answer: "Were Ziva and Yael running in the park when the rain began?<br>No, they weren't. They were sitting in a café.", why: 'שתי בנות = <bdi>were</bdi>. <bdi>run → running</bdi>, <bdi>begin → began</bdi>.' },
    { type: 'multi', cue: 'Rami / walk / to school / yesterday / ? (take the bus)', fields: [
        { label: 'שאלת כן/לא', accept: ['did rami walk to school yesterday'] },
        { label: 'תשובה בשלילה', accept: ["no he didn't", 'no he did not'] },
        { label: 'משפט חיובי עם המילים בסוגריים', accept: ['he took the bus', 'he took the bus to school', 'he took the bus yesterday', 'he took the bus to school yesterday'] }],
      answer: "Did Rami walk to school yesterday?<br>No, he didn't. He took the bus.", why: '<bdi>yesterday</bdi>: <bdi>Past Simple</bdi>. <bdi>take → took</bdi>.' },
  ]},
  { id: 'r18b', page: 18, ex: 4, title: 'כתוב שאלת מידע על החלק המסומן', items: [
    { type: 'type', q: 'They traveled to work <u>by bus</u> yesterday.', accept: ['how did they travel to work yesterday', 'how did they travel to work'], answer: 'How did they travel to work yesterday?', why: 'by bus = איך. <bdi>How + did + they + travel</bdi>.' },
    { type: 'type', q: 'He was laughing <u>because he was watching a funny movie</u>.', accept: ['why was he laughing'], answer: 'Why was he laughing?', why: 'because = למה. <bdi>Why + was + he + laughing</bdi>.' },
    { type: 'type', q: "Tammy was driving to <u>the clinic</u> at 8 o'clock.", accept: ["where was tammy driving at 8 o'clock", "where was tammy driving to at 8 o'clock", 'where was tammy driving', 'where was tammy driving to'], answer: "Where was Tammy driving at 8 o'clock?", why: 'מקום = <bdi>Where</bdi>. <bdi>Where + was + Tammy + driving</bdi>.' },
    { type: 'type', q: 'Ronen studied <u>at the Hebrew University in Jerusalem</u>.', accept: ['where did ronen study'], answer: 'Where did Ronen study?', why: '<bdi>Past Simple</bdi>: <bdi>Where + did + Ronen + study</bdi> (בלי ed).' },
    { type: 'type', q: "They were eating <u>falafel</u> at 11 o'clock.", accept: ["what were they eating at 11 o'clock", 'what were they eating'], answer: "What were they eating at 11 o'clock?", why: '<bdi>What + were + they + eating</bdi>.' },
    { type: 'type', q: "The guests arrived <u>at 5 o'clock</u>.", accept: ['when did the guests arrive', 'what time did the guests arrive'], answer: 'When did the guests arrive?', why: 'זמן = <bdi>When / What time</bdi>. <bdi>did + the guests + arrive</bdi>.' },
  ].map(it => ({ ...it, label: 'כתוב שאלה על החלק המסומן בקו' }))},
];

REVIEW_SETS.forEach(set => set.items.forEach((it, i) => {
  it.id = `${set.id}-${i + 1}`;
  it.type = it.type || 'mc';
  if(!it.full){
    if(it.type === 'mc' || (it.type === 'type' && it.verb)) it.full = it.q.replace('___', `<mark>${it.answer || it.accept[0]}</mark>`);
    else if(it.type === 'type' || it.type === 'order' || it.type === 'multi') it.full = `<mark>${it.answer}</mark>`;
  }
}));

/* ---------- Quiz engine ---------- */
const SCORES_KEY = 'lessonScores_v1';
const quizzes = {
  'present-grammar': { title: 'תרגול דקדוק: הווה', source: GRAMMAR_ITEMS, next: ['#present/vocab', 'לתרגול מילים'] },
  'present-vocab':   { title: 'תרגול אוצר מילים', source: VOCAB_ITEMS, next: ['#past/learn', 'לשיעור עבר'] },
};
REVIEW_SETS.forEach((set, i) => {
  const nxt = REVIEW_SETS[i + 1];
  quizzes[set.id] = {
    title: `עמ׳ ${set.page}, תרגיל ${set.ex}: ${set.title}`, source: set.items, set: true, free: !!set.free,
    next: nxt ? [`#past/review/${nxt.id}`, `לתרגיל הבא: עמ׳ ${nxt.page}, תרגיל ${nxt.ex}`] : ['#past/review', 'לכל דפי החזרה'],
  };
});

function loadScores(){ try{ return JSON.parse(localStorage.getItem(SCORES_KEY)) || {}; }catch(e){ return {}; } }
function saveScore(key, right, total){
  const all = loadScores();
  all[key] = { right, total };
  try{ localStorage.setItem(SCORES_KEY, JSON.stringify(all)); }catch(e){}
}

function shuffleArr(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function startQuiz(key, onlyIds){
  const q = quizzes[key];
  const pool = onlyIds ? q.source.filter(it => onlyIds.includes(it.id)) : q.source;
  // דפי החזרה נשארים בסדר של הדף, כדי שיהיה קל להשוות לחוברת
  const ordered = q.set ? pool.slice() : shuffleArr(pool);
  q.state = {
    items: ordered.map(it => ({ ...it, shuffled: it.options ? shuffleArr(it.options) : null, pool: it.words ? shuffleArr(it.words.map((w, i) => i)) : null })),
    idx: 0, results: [], answered: null, picked: [], full: !onlyIds,
  };
}

function normalize(s){
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’‘`'"]/g, '').replace(/-/g, '').replace(/[.?!,;:]/g, '').replace(/\s+/g, ' ').trim();
}
function matches(given, accept){
  const g = normalize(given);
  return accept.some(a => normalize(a) === g);
}
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function blankHtml(text){ return text.split('___').join('<span class="blank">&nbsp;</span>'); }
function capFirst(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }

const TYPE_LABELS = {
  mc: 'בחר את התשובה הנכונה', tf: 'המשפט נכון, או שיש בו טעות?', order: 'הקש על המילים לפי הסדר הנכון',
  multi: 'כתוב שאלה, תשובה בשלילה ומשפט חיובי', free: 'השלם במשפט משלך, ואז השווה לדוגמה',
};

function renderQuiz(key){
  const q = quizzes[key];
  if(!q.state) startQuiz(key);
  const st = q.state;
  if(st.idx >= st.items.length) return renderResults(key);
  const it = st.items[st.idx];
  const a = st.answered;
  const right = st.results.filter(r => r.correct).length;
  const label = it.label || (it.type === 'type' ? (it.verb ? 'כתוב את הצורה הנכונה של הפועל' : 'כתוב את השאלה באנגלית') : TYPE_LABELS[it.type]);
  let prompt = '', body = '';

  if(it.type === 'mc'){
    prompt = blankHtml(it.q);
    body = `<div class="options">${it.shuffled.map(opt => {
      let cls = '';
      if(a){ if(opt === it.answer) cls = ' is-right'; else if(opt === a.given) cls = ' is-wrong'; }
      return `<button class="opt pressable${cls}" data-q="answer" data-val="${esc(opt)}" dir="ltr" ${a ? 'disabled' : ''}>${opt}</button>`;
    }).join('')}</div>`;
  } else if(it.type === 'tf'){
    prompt = it.q;
    const mark = (val) => !a ? '' : (val === it.correct ? ' is-right' : (val === a.given ? ' is-wrong' : ''));
    body = `<div class="options options-2">
      <button class="opt pressable${mark(true)}" data-q="answer" data-val="true" ${a ? 'disabled' : ''}>${icon('check')}המשפט נכון</button>
      <button class="opt pressable${mark(false)}" data-q="answer" data-val="false" ${a ? 'disabled' : ''}>${icon('x')}יש טעות</button>
    </div>`;
  } else if(it.type === 'type'){
    prompt = blankHtml(it.q) + (it.verb ? ` <span class="q-verb">(${it.verb})</span>` : '');
    body = `<form class="type-row" data-q="form">
      ${inputHtml('type-input', a ? a.given : '', a ? a.correct : null, it.verb ? 'Type the verb form…' : 'Type the question…', !!a)}
      ${a ? '' : `<button class="btn btn-primary pressable" type="submit">בדוק</button>`}
    </form>`;
  } else if(it.type === 'order'){
    prompt = '';
    const words = st.picked.map(i => it.words[i]);
    const line = words.length ? capFirst(words.join(' ')) + '?' : '';
    body = `
      <div class="order-line${a ? (a.correct ? ' is-right' : ' is-wrong') : ''}" dir="ltr">
        ${words.length ? st.picked.map(i => `<button class="chip-w chip-in pressable" data-q="unpick" data-i="${i}" ${a ? 'disabled' : ''}>${it.words[i]}</button>`).join('') : '<span class="order-ph">הקש על המילים כדי לבנות את השאלה</span>'}
      </div>
      <div class="order-pool" dir="ltr">${it.pool.map(i => st.picked.includes(i) ? `<span class="chip-w chip-ghost">${it.words[i]}</span>` : `<button class="chip-w pressable" data-q="pick" data-i="${i}" ${a ? 'disabled' : ''}>${it.words[i]}</button>`).join('')}</div>
      ${a ? '' : `<button class="btn btn-primary pressable order-check" data-q="check-order" ${st.picked.length === it.words.length ? '' : 'disabled'}>בדוק</button>`}
      ${a && !a.correct ? `<p class="order-yours" dir="ltr">${esc(line)}</p>` : ''}`;
  } else if(it.type === 'multi'){
    prompt = it.cue;
    body = `<form class="multi" data-q="form">
      ${it.fields.map((f, i) => `<label class="field"><span class="field-label">${f.label}</span>${inputHtml(`mf-${i}`, a ? a.given[i] : '', a ? a.fields[i] : null, '', !!a)}</label>`).join('')}
      ${a ? '' : `<button class="btn btn-primary pressable" type="submit">בדוק</button>`}
    </form>`;
  } else if(it.type === 'free'){
    prompt = blankHtml(it.q);
    body = `<form class="type-row" data-q="form">
      ${inputHtml('type-input', a ? a.given : '', null, 'Write your idea…', !!a)}
      ${a ? '' : `<button class="btn btn-primary pressable" type="submit">הצג דוגמה</button>`}
    </form>`;
  }

  let feedback = '';
  if(a && it.type === 'free'){
    const mine = it.q.split('___').join(`<mark>${esc(a.given)}</mark>`);
    feedback = `
      <div class="feedback fb-neutral" role="status">
        <p class="fb-sub">המשפט שלך</p><p class="fb-full" dir="ltr">${mine}</p>
        <p class="fb-sub">דוגמה</p><p class="fb-full" dir="ltr">${it.example}</p>
        <p class="fb-why">${it.why}</p>
      </div>
      ${a.correct === undefined ? `
      <p class="self-q">לפי הכלל, המשפט שלך נכון?</p>
      <div class="options options-2">
        <button class="opt pressable" data-q="self" data-val="true">${icon('check')}נכון</button>
        <button class="opt pressable" data-q="self" data-val="false">${icon('x')}צריך תיקון</button>
      </div>` : nextBtn(st)}`;
  } else if(a){
    feedback = `
      <div class="feedback ${a.correct ? 'fb-good' : 'fb-bad'}" role="status">
        <p class="fb-title">${a.correct ? icon('check') + 'נכון' : icon('x') + 'לא בדיוק'}</p>
        <p class="fb-full" dir="ltr">${it.full}</p>
        ${it.why ? `<p class="fb-why">${it.why}</p>` : ''}
      </div>
      ${nextBtn(st)}`;
  }

  return `
    <div class="quiz-head">
      <span>שאלה <bdi>${st.idx + 1}</bdi> מתוך <bdi>${st.items.length}</bdi></span>
      <span class="quiz-score">${icon('check')}<bdi>${right}</bdi></span>
    </div>
    <span class="meter quiz-meter"><span style="width:${(st.idx + (a ? 1 : 0)) / st.items.length * 100}%"></span></span>
    <article class="q-card">
      <p class="q-type">${label}</p>
      ${prompt ? `<p class="q-sentence" dir="ltr">${prompt}</p>` : ''}
      ${body}
      ${feedback}
    </article>`;
}

function inputHtml(id, value, state, placeholder, disabled){
  const cls = state === true ? ' is-right' : state === false ? ' is-wrong' : '';
  return `<input class="type-input${cls}" id="${id}" dir="ltr" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${placeholder}" value="${esc(value || '')}" ${disabled ? 'disabled' : ''} aria-label="התשובה שלך">`;
}
function nextBtn(st){
  return `<button class="btn btn-primary pressable q-next" data-q="next" id="q-next">${st.idx === st.items.length - 1 ? 'לתוצאות' : 'לשאלה הבאה'} ${icon('forward')}</button>`;
}

function renderResults(key){
  const q = quizzes[key];
  const st = q.state;
  const right = st.results.filter(r => r.correct).length;
  const total = st.results.length;
  const wrong = st.items.filter(it => !st.results.find(r => r.id === it.id && r.correct));
  const pct = total ? right / total : 0;
  const msg = pct === 1 ? 'מושלם. אתה שולט בזה.' : pct >= 0.8 ? 'מצוין. עוד סבב קצר על הטעויות, וזה סגור.' : pct >= 0.6 ? 'בכיוון הנכון. כדאי לעבור שוב על הטעויות.' : 'כדאי לחזור לשיעור ואז לנסות שוב.';
  return `
    <section class="result">
      <p class="tile-label">${q.title}</p>
      <p class="result-score"><span class="result-int">${right}</span><span class="result-of">/${total}</span></p>
      <p class="result-msg">${msg}</p>
      ${wrong.length ? `<button class="btn btn-primary pressable" data-q="retry">${icon('restart')}לתרגל רק את ${wrong.length === 1 ? 'הטעות' : `<bdi>${wrong.length}</bdi> הטעויות`}</button>` : ''}
      <a class="btn ${wrong.length ? 'btn-secondary' : 'btn-primary'} pressable" href="${q.next[0]}">${q.next[1]}</a>
      <button class="btn btn-secondary pressable" data-q="restart">מההתחלה</button>
    </section>
    ${wrong.length ? `<h3 class="mist-title">${q.free ? 'משפטים לתקן' : 'הטעויות שלך'}</h3>
    <div class="mistakes">${wrong.map(it => `
      <div class="mistake"><p class="fb-full" dir="ltr">${it.type === 'free' ? it.example : it.full}</p>${it.why ? `<p class="fb-why">${it.why}</p>` : ''}</div>`).join('')}</div>` : ''}`;
}

function recordAnswer(key, correct){
  const st = quizzes[key].state;
  st.results.push({ id: st.items[st.idx].id, correct });
}

function answerQuiz(key, given){
  const st = quizzes[key].state;
  const it = st.items[st.idx];
  if(it.type === 'free'){
    st.answered = { given, correct: undefined };
  } else {
    let correct;
    if(it.type === 'mc') correct = given === it.answer;
    else if(it.type === 'tf'){ given = given === 'true'; correct = given === it.correct; }
    else if(it.type === 'multi'){
      const fields = it.fields.map((f, i) => matches(given[i], f.accept));
      st.answered = { given, fields, correct: fields.every(Boolean) };
      recordAnswer(key, st.answered.correct);
      return afterAnswer();
    }
    else correct = matches(given, it.accept);
    st.answered = { given, correct };
    recordAnswer(key, correct);
  }
  afterAnswer();
}
function afterAnswer(){
  renderPage(true);
  const next = document.getElementById('q-next');
  if(next && window.matchMedia('(pointer: fine)').matches) next.focus({ preventScroll: true });
}

/* ---------- Page: routing, nav, review list ---------- */
const TOPICS = {
  present: { label: 'הווה', en: 'Present', tabs: [['learn', 'שיעור'], ['grammar', 'דקדוק'], ['vocab', 'מילים']] },
  past:    { label: 'עבר', en: 'Past', tabs: [['learn', 'שיעור'], ['review', 'דפי חזרה']] },
};

function parseRoute(){
  let h = location.hash.slice(1);
  if(['learn', 'grammar', 'vocab'].includes(h)) h = `present/${h}`;
  const [t, tab, set] = h.split('/');
  const topic = TOPICS[t] ? t : 'present';
  const validTab = TOPICS[topic].tabs.some(x => x[0] === tab) ? tab : 'learn';
  const validSet = topic === 'past' && validTab === 'review' && REVIEW_SETS.some(s => s.id === set) ? set : null;
  return { topic, tab: validTab, set: validSet };
}
function currentQuizKey(){
  const r = parseRoute();
  if(r.topic === 'present' && (r.tab === 'grammar' || r.tab === 'vocab')) return `present-${r.tab}`;
  if(r.set) return r.set;
  return null;
}

function renderNav(r){
  return `
    <div class="topic-switch" role="tablist" aria-label="נושא">
      ${Object.entries(TOPICS).map(([id, t]) => `<a class="topic${id === r.topic ? ' on' : ''}" href="#${id}/learn" role="tab" aria-selected="${id === r.topic}">${t.label}<bdi class="topic-en">${t.en}</bdi></a>`).join('')}
    </div>
    <nav class="tabs tabs-${TOPICS[r.topic].tabs.length}" role="tablist" aria-label="חלקי השיעור">
      ${TOPICS[r.topic].tabs.map(([id, label], i) => `<a class="tab${id === r.tab ? ' on' : ''}" href="#${r.topic}/${id}" role="tab" aria-selected="${id === r.tab}"><span class="tab-num">${i + 1}</span>${label}</a>`).join('')}
    </nav>`;
}

function renderReviewList(){
  const scores = loadScores();
  const pages = [...new Set(REVIEW_SETS.map(s => s.page))];
  return `
    <p class="ls-text">כל התרגילים מדפי החזרה, באותו סדר כמו בדף. כל תשובה נבדקת מיד, עם הסבר.</p>
    ${pages.map(p => `
      <h3 class="page-title">עמוד <bdi>${p}</bdi></h3>
      <div class="set-list">${REVIEW_SETS.filter(s => s.page === p).map(s => {
        const sc = scores[s.id];
        const chip = sc ? `<bdi class="chip${sc.right === sc.total ? ' chip-good' : ''}">${sc.right}/${sc.total}</bdi>` : `<span class="chip">${s.items.length} שאלות</span>`;
        return `<a class="set-row pressable" href="#past/review/${s.id}">
          <span class="set-ex">תרגיל <bdi>${s.ex}</bdi></span>
          <span class="set-title">${s.title}</span>
          ${chip}
        </a>`;
      }).join('')}</div>`).join('')}`;
}

function renderPage(keepScroll){
  const r = parseRoute();
  document.getElementById('nav').innerHTML = renderNav(r);
  const panel = document.getElementById('panel');
  let html;
  if(r.tab === 'learn') html = r.topic === 'past' ? renderPastLearn() : renderPresentLearn();
  else if(r.topic === 'past' && r.tab === 'review' && !r.set) html = renderReviewList();
  else {
    const key = currentQuizKey();
    const back = r.set ? `<a class="set-back" href="#past/review">${icon('back')}<span>לכל דפי החזרה</span></a><h2 class="set-head">${quizzes[key].title}</h2>` : '';
    html = back + renderQuiz(key);
  }
  panel.innerHTML = html;
  document.title = `שיעור דקדוק - ${TOPICS[r.topic].label}`;
  if(!keepScroll) window.scrollTo(0, 0);
}

function initLesson(){
  window.addEventListener('hashchange', () => renderPage(false));
  const panel = document.getElementById('panel');

  panel.addEventListener('click', (e) => {
    const smBtn = e.target.closest('[data-sm]');
    if(smBtn){
      const m = smBtn.dataset.m;
      machines[m][smBtn.dataset.sm] = smBtn.dataset.val;
      const box = smBtn.closest('.machine');
      box.innerHTML = renderMachine(m);
      const out = box.querySelector('.sm-output');
      if(out){ out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump'); }
      return;
    }
    const qBtn = e.target.closest('[data-q]');
    if(!qBtn || qBtn.disabled || qBtn.tagName === 'FORM') return;
    const key = currentQuizKey();
    if(!key) return;
    const q = quizzes[key];
    const st = q.state;
    const act = qBtn.dataset.q;
    if(act === 'answer' && st && !st.answered) answerQuiz(key, qBtn.dataset.val);
    else if(act === 'pick' && !st.answered){ st.picked.push(Number(qBtn.dataset.i)); renderPage(true); }
    else if(act === 'unpick' && !st.answered){ st.picked = st.picked.filter(i => i !== Number(qBtn.dataset.i)); renderPage(true); }
    else if(act === 'check-order' && !st.answered){
      const it = st.items[st.idx];
      answerQuiz(key, st.picked.map(i => it.words[i]).join(' '));
    }
    else if(act === 'self' && st.answered && st.answered.correct === undefined){
      st.answered.correct = qBtn.dataset.val === 'true';
      recordAnswer(key, st.answered.correct);
      afterAnswer();
    }
    else if(act === 'next'){
      st.idx += 1; st.answered = null; st.picked = [];
      if(st.idx >= st.items.length && st.full) saveScore(key, st.results.filter(x => x.correct).length, st.results.length);
      renderPage(false); focusInput();
    }
    else if(act === 'retry'){
      const wrongIds = st.items.filter(it => !st.results.find(x => x.id === it.id && x.correct)).map(it => it.id);
      startQuiz(key, wrongIds); renderPage(false); focusInput();
    }
    else if(act === 'restart'){ startQuiz(key); renderPage(false); focusInput(); }
  });

  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = currentQuizKey();
    if(!key) return;
    const st = quizzes[key].state;
    if(!st || st.answered) return;
    const it = st.items[st.idx];
    if(it.type === 'multi'){
      const values = it.fields.map((f, i) => document.getElementById(`mf-${i}`).value);
      const firstEmpty = values.findIndex(v => !v.trim());
      if(firstEmpty !== -1){ document.getElementById(`mf-${firstEmpty}`).focus(); return; }
      answerQuiz(key, values);
      return;
    }
    const input = document.getElementById('type-input');
    if(!input || !input.value.trim()){ if(input) input.focus(); return; }
    answerQuiz(key, input.value.trim());
  });

  renderPage(false);
}

function focusInput(){
  const input = document.getElementById('type-input') || document.getElementById('mf-0');
  if(input && window.matchMedia('(pointer: fine)').matches) input.focus();
}

initLesson();
