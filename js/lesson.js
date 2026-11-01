// שיעור דקדוק: Present Simple מול Present Progressive.
// שלוש לשוניות: #learn (הסבר), #grammar (תרגול דקדוק), #vocab (תרגול אוצר מילים).

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
const sm = { subject: 'She', verb: 'study', tense: 'simple', form: 'pos' };

function smBuild(){
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
  const html = tokens.map(tk => tk.stem !== undefined
    ? `<span class="tk-stem">${tk.stem}</span><span class="tk-suf">${tk.suf}</span>`
    : `<span class="${tk.c}">${tk.t}</span>`).join(' ') + (sm.form === 'q' ? '?' : '.');
  const meaning = sm.tense === 'simple' ? 'קורה באופן קבוע, כהרגל' : 'קורה ממש עכשיו, באמצע הפעולה';
  return { html, rules, meaning };
}

function chipGroup(name, options, current){
  return `<div class="seg" role="group">${options.map(([val, label]) =>
    `<button class="seg-btn${val === current ? ' on' : ''}" data-sm="${name}" data-val="${val}" aria-pressed="${val === current}"${/[a-z]/i.test(label) ? ' dir="ltr"' : ''}>${label}</button>`).join('')}</div>`;
}

function renderMachine(){
  const out = smBuild();
  return `
    <div class="sm-controls">
      <div class="sm-row"><span class="sm-label">זמן</span>${chipGroup('tense', [['simple', 'Present Simple'], ['prog', 'Present Progressive']], sm.tense)}</div>
      <div class="sm-row"><span class="sm-label">סוג</span>${chipGroup('form', [['pos', 'חיובי'], ['neg', 'שלילה'], ['q', 'שאלה']], sm.form)}</div>
      <div class="sm-row"><span class="sm-label">נושא</span>${chipGroup('subject', SM_SUBJECTS.map(s => [s, s]), sm.subject)}</div>
      <div class="sm-row"><span class="sm-label">פועל</span>${chipGroup('verb', SM_VERBS.map(v => [v.id, v.label]), sm.verb)}</div>
    </div>
    <div class="sm-output t-${sm.tense}">
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

function renderLearn(){
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
    <h3><span class="ls-num">1</span>מכונת המשפטים</h3>
    <p class="ls-text">תבחר זמן, סוג משפט, נושא ופועל, ותראה איך המשפט נבנה. החלקים הצבעוניים הם מה שמשתנה.</p>
    <div id="machine">${renderMachine()}</div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">2</span>איך בונים</h3>
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
    <h3><span class="ls-num">3</span>כללי כתיב</h3>
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
    <h3><span class="ls-num">4</span>שלילה ושאלה</h3>
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
    <h3><span class="ls-num">5</span>מילות סימן</h3>
    <p class="ls-text">המילים האלה במשפט הן הרמז הכי מהיר במבחן.</p>
    <div class="signals">
      <div class="t-simple"><span class="vs-name" dir="ltr">Present Simple</span>
        <div class="tags" dir="ltr"><span>always</span><span>usually</span><span>often</span><span>sometimes</span><span>never</span><span>every day</span><span>on Mondays</span><span>twice a week</span></div></div>
      <div class="t-prog"><span class="vs-name" dir="ltr">Present Progressive</span>
        <div class="tags" dir="ltr"><span>now</span><span>right now</span><span>at the moment</span><span>today</span><span>this week</span><span>Look!</span><span>Listen!</span><span>Be quiet!</span></div></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">6</span>פעלים שלא מקבלים ing</h3>
    <p class="ls-text">פעלים של מחשבה, רגש ושייכות מתארים מצב, לא פעולה. הם נשארים ב-Present Simple גם כשמדובר בעכשיו.</p>
    <div class="tags tags-plain" dir="ltr"><span>know</span><span>understand</span><span>believe</span><span>remember</span><span>mean</span><span>like</span><span>love</span><span>hate</span><span>want</span><span>need</span><span>prefer</span><span>own</span><span>belong</span><span>seem</span></div>
    <div class="fix-list">
      <div class="fix"><p class="fix-bad" dir="ltr">I am knowing the answer.</p><p class="fix-good" dir="ltr">I know the answer.</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">She is wanting a selfie now.</p><p class="fix-good" dir="ltr">She wants a selfie now.</p></div>
    </div>
  </section>

  <section class="ls-card">
    <h3><span class="ls-num">7</span>הטעויות הכי נפוצות</h3>
    <div class="fix-list">
      <div class="fix"><p class="fix-bad" dir="ltr">My colleague work every day.</p><p class="fix-good" dir="ltr">My colleague works every day.</p><p class="fix-why">נושא בגוף שלישי יחיד, אז צריך s</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">Does he likes jokes?</p><p class="fix-good" dir="ltr">Does he like jokes?</p><p class="fix-why">אחרי does הפועל בלי s</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">They playing outside.</p><p class="fix-good" dir="ltr">They are playing outside.</p><p class="fix-why">ing בלי am / is / are זו לא צורה שלמה</p></div>
      <div class="fix"><p class="fix-bad" dir="ltr">Look! It rains.</p><p class="fix-good" dir="ltr">Look! It is raining.</p><p class="fix-why">Look! מסמן שזה קורה עכשיו</p></div>
    </div>
  </section>

  <a class="btn btn-primary pressable ls-next" href="#grammar">לתרגול דקדוק ${icon('forward')}</a>`;
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

/* ---------- Quiz engine ---------- */
const quizzes = {
  grammar: { source: GRAMMAR_ITEMS, title: 'תרגול דקדוק', next: ['#vocab', 'לתרגול אוצר מילים'] },
  vocab:   { source: VOCAB_ITEMS,   title: 'תרגול אוצר מילים', next: ['#learn', 'חזרה לשיעור'] },
};

function shuffleArr(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function startQuiz(key, onlyIds){
  const q = quizzes[key];
  const pool = onlyIds ? q.source.filter(it => onlyIds.includes(it.id)) : q.source;
  q.state = {
    items: shuffleArr(pool).map(it => ({ ...it, shuffled: it.options ? shuffleArr(it.options) : null })),
    idx: 0, results: [], answered: null,
  };
}

function normalize(s){
  return s.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.?!,]/g, '').replace(/\s+/g, ' ').trim();
}

function blankHtml(text){
  return text.split('___').join('<span class="blank">&nbsp;</span>');
}

function renderQuiz(key){
  const q = quizzes[key];
  if(!q.state) startQuiz(key);
  const st = q.state;
  if(st.idx >= st.items.length) return renderResults(key);
  const it = st.items[st.idx];
  const done = st.results.filter(r => r.correct).length;
  const a = st.answered;
  let body = '';
  const typeLabel = it.type === 'tf' ? 'המשפט נכון, או שיש בו טעות?' : it.type === 'type' ? (it.verb ? 'כתוב את הצורה הנכונה של הפועל' : 'כתוב את השאלה באנגלית') : 'בחר את המילה המתאימה';
  const sentence = it.type === 'tf' ? it.q : blankHtml(it.q);

  if(it.type === 'mc'){
    body = `<div class="options">${it.shuffled.map(opt => {
      let cls = '';
      if(a){ if(opt === it.answer) cls = ' is-right'; else if(opt === a.given) cls = ' is-wrong'; }
      return `<button class="opt pressable${cls}" data-q="answer" data-val="${opt.replace(/"/g, '&quot;')}" dir="ltr" ${a ? 'disabled' : ''}>${opt}</button>`;
    }).join('')}</div>`;
  } else if(it.type === 'tf'){
    const mark = (val) => !a ? '' : (val === it.correct ? ' is-right' : (val === a.given ? ' is-wrong' : ''));
    body = `<div class="options options-2">
      <button class="opt pressable${mark(true)}" data-q="answer" data-val="true" ${a ? 'disabled' : ''}>${icon('check')}המשפט נכון</button>
      <button class="opt pressable${mark(false)}" data-q="answer" data-val="false" ${a ? 'disabled' : ''}>${icon('x')}יש טעות</button>
    </div>`;
  } else {
    body = `<form class="type-row" data-q="form">
      <input class="type-input${a ? (a.correct ? ' is-right' : ' is-wrong') : ''}" id="type-input" dir="ltr" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${it.verb ? 'Type the verb form…' : 'Type the question…'}" value="${a ? a.given.replace(/"/g, '&quot;') : ''}" ${a ? 'disabled' : ''} aria-label="התשובה שלך">
      ${a ? '' : `<button class="btn btn-primary pressable" type="submit">בדוק</button>`}
    </form>`;
  }

  const feedback = a ? `
    <div class="feedback ${a.correct ? 'fb-good' : 'fb-bad'}" role="status">
      <p class="fb-title">${a.correct ? icon('check') + 'נכון' : icon('x') + 'לא בדיוק'}</p>
      <p class="fb-full" dir="ltr">${it.full}</p>
      <p class="fb-why">${it.why}</p>
    </div>
    <button class="btn btn-primary pressable q-next" data-q="next" id="q-next">${st.idx === st.items.length - 1 ? 'לתוצאות' : 'לשאלה הבאה'} ${icon('forward')}</button>` : '';

  return `
    <div class="quiz-head">
      <span>שאלה <bdi>${st.idx + 1}</bdi> מתוך <bdi>${st.items.length}</bdi></span>
      <span class="quiz-score">${icon('check')}<bdi>${done}</bdi></span>
    </div>
    <span class="meter quiz-meter"><span style="width:${(st.idx + (a ? 1 : 0)) / st.items.length * 100}%"></span></span>
    <article class="q-card">
      <p class="q-type">${typeLabel}</p>
      <p class="q-sentence" dir="ltr">${sentence}${it.verb ? ` <span class="q-verb">(${it.verb})</span>` : ''}</p>
      ${body}
      ${feedback}
    </article>`;
}

function renderResults(key){
  const q = quizzes[key];
  const st = q.state;
  const right = st.results.filter(r => r.correct).length;
  const total = st.results.length;
  const wrong = st.items.filter(it => !st.results.find(r => r.id === it.id && r.correct));
  const pct = right / total;
  const msg = pct === 1 ? 'מושלם. אתה שולט בזה.' : pct >= 0.8 ? 'מצוין. עוד סבב קצר על הטעויות, וזה סגור.' : pct >= 0.6 ? 'בכיוון הנכון. כדאי לעבור שוב על הטעויות.' : 'כדאי לחזור לשיעור ואז לנסות שוב.';
  return `
    <section class="result">
      <p class="tile-label">${q.title}</p>
      <p class="result-score"><span class="result-int">${right}</span><span class="result-of">/${total}</span></p>
      <p class="result-msg">${msg}</p>
      ${wrong.length ? `<button class="btn btn-primary pressable" data-q="retry">${icon('restart')}לתרגל רק את ${wrong.length === 1 ? 'הטעות' : `<bdi>${wrong.length}</bdi> הטעויות`}</button>` : ''}
      <button class="btn btn-secondary pressable" data-q="restart">מההתחלה</button>
      <a class="btn btn-secondary pressable" href="${q.next[0]}">${q.next[1]}</a>
    </section>
    ${wrong.length ? `<h3 class="mist-title">הטעויות שלך</h3>
    <div class="mistakes">${wrong.map(it => `
      <div class="mistake"><p class="fb-full" dir="ltr">${it.full}</p><p class="fb-why">${it.why}</p></div>`).join('')}</div>` : ''}`;
}

function answerQuiz(key, given){
  const q = quizzes[key];
  const st = q.state;
  const it = st.items[st.idx];
  let correct;
  if(it.type === 'mc') correct = given === it.answer;
  else if(it.type === 'tf'){ given = given === 'true'; correct = given === it.correct; }
  else correct = it.accept.includes(normalize(given));
  st.answered = { given, correct };
  st.results.push({ id: it.id, correct });
  renderTab(true);
  const next = document.getElementById('q-next');
  if(next && window.matchMedia('(pointer: fine)').matches) next.focus({ preventScroll: true });
}

/* ---------- Page ---------- */
const TABS = [['learn', 'שיעור'], ['grammar', 'דקדוק'], ['vocab', 'מילים']];

function currentTab(){
  const h = location.hash.slice(1);
  return TABS.some(t => t[0] === h) ? h : 'learn';
}

function renderTab(keepScroll){
  const tab = currentTab();
  document.querySelectorAll('.tab').forEach(el => {
    const on = el.dataset.tab === tab;
    el.classList.toggle('on', on);
    el.setAttribute('aria-selected', on);
  });
  const panel = document.getElementById('panel');
  panel.innerHTML = tab === 'learn' ? renderLearn() : renderQuiz(tab);
  panel.dataset.tab = tab;
  if(!keepScroll) window.scrollTo(0, 0);
}

function initLesson(){
  document.getElementById('tabs').innerHTML = TABS.map(([id, label], i) =>
    `<a class="tab" href="#${id}" data-tab="${id}" role="tab"><span class="tab-num">${i + 1}</span>${label}</a>`).join('');
  window.addEventListener('hashchange', () => renderTab(false));

  document.getElementById('panel').addEventListener('click', (e) => {
    const smBtn = e.target.closest('[data-sm]');
    if(smBtn){
      sm[smBtn.dataset.sm] = smBtn.dataset.val;
      document.getElementById('machine').innerHTML = renderMachine();
      const out = document.querySelector('.sm-output');
      if(out){ out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump'); }
      return;
    }
    const qBtn = e.target.closest('[data-q]');
    if(!qBtn || qBtn.disabled) return;
    const key = currentTab();
    const st = quizzes[key] && quizzes[key].state;
    const act = qBtn.dataset.q;
    if(act === 'answer' && st && !st.answered) answerQuiz(key, qBtn.dataset.val);
    else if(act === 'next'){ st.idx += 1; st.answered = null; renderTab(false); focusInput(); }
    else if(act === 'retry'){
      const wrongIds = st.items.filter(it => !st.results.find(r => r.id === it.id && r.correct)).map(it => it.id);
      startQuiz(key, wrongIds); renderTab(false); focusInput();
    }
    else if(act === 'restart'){ startQuiz(key); renderTab(false); focusInput(); }
  });

  document.getElementById('panel').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('type-input');
    const key = currentTab();
    if(!input || !input.value.trim()) { if(input) input.focus(); return; }
    if(quizzes[key].state && !quizzes[key].state.answered) answerQuiz(key, input.value);
  });

  renderTab(false);
}

function focusInput(){
  const input = document.getElementById('type-input');
  if(input && window.matchMedia('(pointer: fine)').matches) input.focus();
}

initLesson();
