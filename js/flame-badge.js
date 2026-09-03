// קומפוננטה נפרדת: עיגול מספר היחידה, עטוף בטבעת זוהר פועמת + להבה זעירה בפינתו
// שמשקפים את מספר התרגולים שהושלמו. מקבלת את מספר התרגולים ואת התווית להצגה בעיגול.
function renderFlameBadge(practiceCount, dotLabel){
  if(!practiceCount || practiceCount < 1){
    return `<div class="dot-wrap"><div class="dot">${dotLabel}</div></div>`;
  }

  let mainColor, glowRgb, ringWidth, badgeSize, iconSize;
  if(practiceCount === 1){
    mainColor = '#EF9F27'; glowRgb = '239,159,39'; ringWidth = 2.5; badgeSize = 18; iconSize = 12;
  } else if(practiceCount === 2){
    mainColor = '#D85A30'; glowRgb = '216,90,48'; ringWidth = 2.75; badgeSize = 19.5; iconSize = 13;
  } else {
    mainColor = '#E24B4A'; glowRgb = '226,75,74'; ringWidth = 3; badgeSize = 21; iconSize = 14;
  }
  // path של אייקון flame (lucide)
  const flamePath = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';

  return `
    <div class="dot-wrap">
      <div class="dot-ring" style="border-color:${mainColor};border-width:${ringWidth}px;--ring-glow-rgb:${glowRgb};"></div>
      <div class="dot">${dotLabel}</div>
      <div class="dot-flame" style="width:${badgeSize}px;height:${badgeSize}px;">
        <svg class="flame-icon" viewBox="0 0 24 24" fill="${mainColor}" style="width:${iconSize}px;height:${iconSize}px;"><path d="${flamePath}"/></svg>
      </div>
    </div>`;
}
