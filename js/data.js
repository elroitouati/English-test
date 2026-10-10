// יחידות אוצר המילים הפעילות. כל יחידה עומדת בפני עצמה בתרגול (רק המילים שלה).
// כל מילה = זוג [אנגלית, עברית].
const UNITS = [
  {
    id: 'extra-about-time',
    label: "About Time - It's a Date",
    dotLabel: '⏰',
    color: '#ffb703',
    words: [
      ["care","לדאוג, להיות אכפת"],
      ["duty","חובה, תפקיד"],
      ["excitement","התרגשות"],
      ["find (it) (funny)","לחשוב שזה מצחיק"],
      ["happiness","אושר, שמחה"],
      ["importance","חשיבות"],
      ["joke","בדיחה"],
      ["pop","פופ (מוזיקת פופ)"],
      ["selfie","סלפי"],
      ["stranger","זר"],
      ["article","מאמר"],
      ["defend","להגן"],
      ["elevator","מעלית"],
      ["favor","טובה"],
      ["for instance","לדוגמה"],
      ["hit","להיט / לפגוע"],
      ["jar","צנצנת"],
      ["nowadays","כיום, בימינו"],
      ["result in","לגרום ל..."],
      ["so (that)","כך ש..., כדי ש..."],
      ["as if","כאילו ש..."],
      ["attempt","ניסיון, לנסות"],
      ["borrow","לשאול (לקחת בהשאלה)"],
      ["deny","להכחיש"],
      ["elementary","יסודי, בסיסי"],
      ["every single","כל אחד, כל יחיד"],
      ["forgive","לסלוח"],
      ["give someone a call","להתקשר למישהו"],
      ["hardly","בקושי"],
      ["mean","להתכוון, משמעו"],
    ],
  },
];

function buildGroups(){
  return UNITS.map(u => ({ ...u, words: u.words.slice(), practiceCount: 0, session: null }));
}
