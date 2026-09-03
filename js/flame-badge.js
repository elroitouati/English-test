// קומפוננטה נפרדת: אייקון להבה שמרחף מעל כרטיס יחידה ומשקף את מספר התרגולים שהושלמו.
// מקבלת פרופ אחד (מספר תרגולים) וגוזרת ממנו רמה, צבע וגודל.
function renderFlameBadge(practiceCount){
  if(!practiceCount || practiceCount < 1) return '';

  let level, mainColor, lightColor, size;
  if(practiceCount === 1){
    level = 1; mainColor = '#EF9F27'; lightColor = '#F8CB86'; size = 30;
  } else if(practiceCount === 2){
    level = 2; mainColor = '#D85A30'; lightColor = '#EC9B7C'; size = 38;
  } else {
    level = 3; mainColor = '#E24B4A'; lightColor = '#F29B9A'; size = 48;
  }
  const backSize = size + 8;
  // path של אייקון flame (lucide)
  const flamePath = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';

  return `
    <div class="flame-badge" data-level="${level}">
      <svg class="flame-layer flame-back" viewBox="0 0 24 24" fill="${lightColor}" style="width:${backSize}px;height:${backSize}px;"><path d="${flamePath}"/></svg>
      <svg class="flame-layer flame-front" viewBox="0 0 24 24" fill="${mainColor}" style="width:${size}px;height:${size}px;"><path d="${flamePath}"/></svg>
    </div>`;
}
