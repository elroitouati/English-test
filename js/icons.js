// אייקונים בקו אחיד (24px, קו 1.75). חצים מצוירים כבר בכיוון RTL: "אחורה" מצביע ימינה.
const ICON_PATHS = {
  back: '<path d="M9 6l6 6-6 6"/>',
  forward: '<path d="M15 6l-6 6 6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  undo: '<path d="M15 8.5h-6a4.5 4.5 0 0 0 0 9h3"/><path d="M12 5l3.5 3.5L12 12"/>',
  speaker: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  stack: '<rect x="4" y="8.5" width="12.5" height="11" rx="2"/><path d="M8 5.5h10a2 2 0 0 1 2 2V16"/>',
  book: '<path d="M4 6.5c2.5-1.2 5.2-1.2 8 .8 2.8-2 5.5-2 8-.8V19c-2.5-1.2-5.2-1.2-8 .8-2.8-2-5.5-2-8-.8z"/><path d="M12 7.3v12.5"/>',
  pencil: '<path d="M14.5 5.5l4 4L9 19H5v-4z"/><path d="M12.5 7.5l4 4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  doc: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 6.5 20V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4M9.5 12h6M9.5 15.5h6"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
};

function icon(name, cls){
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// הלוגו: דף מבחן עם סימוני וי בעט אדום וחותמת A+, על רקע אדום. full=true לאייקון האפליקציה (רקע מלא, בלי פינות)
function logoSvg(full){
  const rows = [26, 33, 40].map((y, i) => `
      <rect x="23" y="${y - 2.6}" width="5.2" height="5.2" rx="1.2" fill="none" stroke="rgba(30,23,23,0.32)" stroke-width="1.2"/>
      ${i < 2 ? `<path d="M23.9 ${y}l1.5 1.5 2.8-3.2" fill="none" stroke="#C8202F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      <line x1="31" y1="${y}" x2="${i === 1 ? 38 : 41}" y2="${y}" stroke="rgba(30,23,23,0.2)" stroke-width="2" stroke-linecap="round"/>`).join('');
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="64" height="64" rx="${full ? 0 : 15}" fill="#C8202F"/>
    <g transform="rotate(-6 32 31)">
      <rect x="19" y="12" width="26" height="36" rx="3.5" fill="#FFFDFB"/>
      <line x1="23" y1="18.5" x2="35" y2="18.5" stroke="rgba(30,23,23,0.6)" stroke-width="2.2" stroke-linecap="round"/>
      ${rows}
    </g>
    <circle cx="43" cy="20" r="8.5" fill="#FFFDFB" stroke="#8E1420" stroke-width="1.4"/>
    <text x="43" y="23" direction="ltr" unicode-bidi="bidi-override" text-anchor="middle" font-family="Rubik, system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#C8202F">A+</text>
  </svg>`;
}

// סרגל ניווט תחתון, משותף לאפליקציה ולדף השיעורים
function renderTabbar(active){
  const items = [
    ['home', 'index.html#home', 'target', 'הכנה'],
    ['lessons', 'lesson.html', 'book', 'שיעורים'],
    ['cards', 'index.html#cards', 'stack', 'כרטיסיות'],
  ];
  return items.map(([id, href, ic, label]) =>
    `<a class="tb-item${id === active ? ' on' : ''}" href="${href}"${id === active ? ' aria-current="page"' : ''}><span class="tb-icon">${icon(ic)}</span><span>${label}</span></a>`).join('');
}
