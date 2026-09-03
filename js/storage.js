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
    const g = groups.find(x=>x.id===sg.id);
    if(!g) return;
    if(typeof sg.practiceCount === 'number') g.practiceCount = sg.practiceCount;
    if(sg.session) g.session = sg.session;
  });
}

function saveState(groups){
  const data = {
    groups: groups.map(g=>({
      id: g.id,
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
