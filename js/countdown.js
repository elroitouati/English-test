// ספירה לאחור עד המבחן - מוצגת רק במסך הבית (בתוך renderHome),
// כדי שלא תפריע באמצע תרגול. כשלא במסך הבית, האלמנט לא קיים ו-updateCountdownDisplay פשוט לא עושה כלום.
const EXAM_DATE = new Date(2026, 8, 9, 12, 0, 0); // יום רביעי, 9.9.2026, 12:00

function renderCountdownCard(){
  return `
    <div class="countdown-card" id="exam-countdown">
      <div class="countdown-title">⏳ עד המבחן</div>
      <div class="countdown-numbers">
        <div class="countdown-unit"><span class="countdown-value" id="cd-days">0</span><span class="countdown-label">ימים</span></div>
        <div class="countdown-unit"><span class="countdown-value" id="cd-hours">00</span><span class="countdown-label">שעות</span></div>
        <div class="countdown-unit"><span class="countdown-value" id="cd-mins">00</span><span class="countdown-label">דקות</span></div>
        <div class="countdown-unit"><span class="countdown-value" id="cd-secs">00</span><span class="countdown-label">שניות</span></div>
      </div>
    </div>`;
}

function updateCountdownDisplay(){
  const el = document.getElementById('exam-countdown');
  if(!el) return;
  const diff = EXAM_DATE.getTime() - Date.now();
  if(diff <= 0){
    el.innerHTML = `<div class="countdown-title">🎓 בהצלחה במבחן!</div>`;
    return;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const set = (id, text) => { const e = document.getElementById(id); if(e) e.textContent = text; };
  set('cd-days', String(days));
  set('cd-hours', pad(hours));
  set('cd-mins', pad(minutes));
  set('cd-secs', pad(seconds));
}

setInterval(updateCountdownDisplay, 1000);
