// ספירה לאחור עד המבחן - מוצגת רק במסך הבית, כדי שלא תפריע באמצע תרגול.
const EXAM_DATE = new Date(2026, 10, 4, 12, 0, 0); // יום רביעי, 4.11.2026, 12:00

function renderCountdownCard(){
  return `
    <div class="tile tile-hero hero-wide" id="exam-countdown">
      <span class="hero-main">
        <span class="tile-label">עד המבחן</span>
        <span class="hero-num"><span class="hero-int" id="cd-big">0</span><span class="hero-unit" id="cd-unit">ימים</span></span>
      </span>
      <span class="hero-side">
        <bdi class="hero-clock" id="cd-clock">00:00:00</bdi>
        <span class="tile-foot">רביעי <bdi>4.11</bdi> · <bdi>12:00</bdi></span>
      </span>
    </div>`;
}

function updateCountdownDisplay(){
  const el = document.getElementById('exam-countdown');
  if(!el) return;
  const diff = EXAM_DATE.getTime() - Date.now();
  if(diff <= 0){
    el.innerHTML = `<span class="tile-label">המבחן</span><span class="hero-done">בהצלחה!</span>`;
    return;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const set = (id, text) => { const e = document.getElementById(id); if(e && e.textContent !== text) e.textContent = text; };
  if(days > 0){
    set('cd-big', String(days));
    set('cd-unit', days === 1 ? 'יום' : 'ימים');
    set('cd-clock', `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
  } else {
    set('cd-big', String(hours));
    set('cd-unit', hours === 1 ? 'שעה' : 'שעות');
    set('cd-clock', `${pad(minutes)}:${pad(seconds)}`);
  }
}

setInterval(updateCountdownDisplay, 1000);
