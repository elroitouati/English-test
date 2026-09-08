// שמירה וטעינה של מצב האפליקציה ב-localStorage, כדי שמונה התרגולים
// והתרגול הפעיל (אם נעצר באמצע) יישמרו לצמיתות בין פתיחות.
const STORAGE_KEY = 'vocabTrainerState_v1';

function loadSavedState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){
    return null;
  }
}

function applySavedState(groups, saved){
  if(!saved || !Array.isArray(saved.groups)) return;
  saved.groups.forEach(sg=>{
    let g = groups.find(x=>x.id===sg.id);
    if(!g){
      // קבוצה דינמית שלא קיימת מראש (כמו "מתקשה בהם") - משחזרים אותה אם יש לה רשימת מילים שמורה
      if(!Array.isArray(sg.words) || sg.words.length === 0) return;
      g = { id: sg.id, label: sg.label || '', words: sg.words, color: sg.color || '#495057', practiceCount: 0, session: null };
      groups.push(g);
    }
    if(typeof sg.practiceCount === 'number') g.practiceCount = sg.practiceCount;
    if(sg.session) g.session = sg.session;
  });
}

function saveState(groups){
  const data = {
    groups: groups.map(g=>({
      id: g.id,
      label: g.label,
      color: g.color,
      words: g.words,
      practiceCount: g.practiceCount,
      session: g.session,
    })),
  };
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch(e){
    // localStorage לא זמין (למשל מצב פרטי) - ממשיכים בלי שמירה
  }
}
