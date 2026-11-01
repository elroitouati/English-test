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
  restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
};

function icon(name, cls){
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}
