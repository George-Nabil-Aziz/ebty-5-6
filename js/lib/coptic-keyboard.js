// ===== مكتبة الكيبورد القبطي =====
// الخطين المستخدمين (Athanasuis و CS-Avva-Shenouda) خطوط legacy:
// مفيهمش حروف Unicode قبطية خالص، بيرسموا الأشكال القبطية فوق حروف ASCII عادية.
// عشان كده الكيبورد بيكتب ASCII، واللي بيخلّيه يبان قبطي هو الخط نفسه.
//
// الملف ده الجزء المشترك بين صفحة الكيبورد المستقلة (pages/keyboard.html)
// وصفحة الإدارة (اللي بتستخدمه عشان تكتب نص السؤال نفسه).

// ===== الأبجدية القبطية بترتيبها الصح =====
// الترتيب ده هو ترتيب الأبجدية القبطية، مش ترتيب a-b-c الإنجليزي.
// كل خط ليه مفاتيحه لوحده لأن الخطين مش بنفس التوزيع
// (مثلاً ϩ = | في الخط الأول، و h في الخط التاني).
//
// ملاحظة على ⲋ (soou): الخط الأول فيه شكلين — , صغير و < كبير.
// الخط التاني فيه شكل واحد بس (^) وهو الشكل اللي فوقه شرطة، فبيتحط في الصفين.
//
//    [ الاسم, خط١ صغير, خط١ كبير, خط٢ صغير, خط٢ كبير ]
const COPTIC_ALPHABET = [
  ["alpha - ⲁ", "a", "A", "a", "A"],
  ["vita - ⲃ", "b", "B", "b", "B"],
  ["gamma - ⲅ", "g", "G", "g", "G"],
  ["delta - ⲇ", "d", "D", "d", "D"],
  ["ei - ⲉ", "e", "E", "e", "E"],
  ["soou - ⲋ", ",", "<", "^", "^"],
  ["zita - ⲍ", "z", "Z", "z", "Z"],
  ["ita - ⲏ", "h", "H", "y", "Y"],
  ["thita - ⲑ", "q", "Q", ";", ":"],
  ["iota - ⲓ", "i", "I", "i", "I"],
  ["kappa - ⲕ", "k", "K", "k", "K"],
  ["lavla - ⲗ", "l", "L", "l", "L"],
  ["mi - ⲙ", "m", "M", "m", "M"],
  ["ni - ⲛ", "n", "N", "n", "N"],
  ["eksi - ⲝ", "[", "{", "x", "X"],
  ["o - ⲟ", "o", "O", "o", "O"],
  ["pi - ⲡ", "p", "P", "p", "P"],
  ["ro - ⲣ", "r", "R", "r", "R"],
  ["simma - ⲥ", "c", "C", "c", "C"],
  ["tav - ⲧ", "t", "T", "t", "T"],
  ["epsilon - ⲩ", "u", "U", "u", "U"],
  ["fi - ⲫ", "v", "V", "v", "V"],
  ["khi - ⲭ", "x", "X", ",", "<"],
  ["epsi - ⲯ", "y", "Y", "'", '"'],
  ["omega - ⲱ", "w", "W", "w", "W"],
  ["shai - ϣ", "]", "}", "s", "S"],
  ["fai - ϥ", "f", "F", "f", "F"],
  ["khai - ϧ", "'", '"', "q", "Q"],
  ["hori - ϩ", "|", "\\", "h", "H"],
  ["janja - ϫ", "j", "J", "j", "J"],
  ["chima - ϭ", "s", "S", "[", "{"],
  ["ti - ϯ", ";", ":", "]", "}"],
];

const COPTIC_DIGITS = "0123456789";

// كل حروف الـ ASCII اللي ممكن تتكتب، عشان نعرف إيه اللي فاضل بره الأبجدية
const ALL_ASCII = (() => {
  let out = "";
  for (let code = 0x21; code < 0x7f; code++) out += String.fromCharCode(code);
  return out;
})();

// بترجع مجموعات المفاتيح للخط المطلوب.
// isAltFont: false = الخط الأول (Athanasuis)، true = الخط التاني (CS-Avva-Shenouda)
function buildCopticKeyGroups(isAltFont) {
  const lowerCol = isAltFont ? 3 : 1;
  const upperCol = isAltFont ? 4 : 2;

  const lower = COPTIC_ALPHABET.map((row) => [row[lowerCol], row[0]]);
  const upper = COPTIC_ALPHABET.map((row) => [row[upperCol], row[0].toUpperCase()]);

  // أي حرف ASCII مش في الأبجدية ولا في الأرقام يروح لمجموعة العلامات،
  // عشان مفيش حاجة تضيع من الكيبورد
  const used = new Set(
    lower.map((k) => k[0]).concat(upper.map((k) => k[0]), COPTIC_DIGITS.split("")),
  );
  const rest = ALL_ASCII.split("")
    .filter((char) => !used.has(char))
    .map((char) => [char, ""]);

  return [
    { title: "الحروف الكبيرة", keys: upper },
    { title: "الأبجدية القبطية", keys: lower },
    { title: "علامات ورموز", keys: rest },
    { title: "أرقام", keys: COPTIC_DIGITS.split("").map((char) => [char, ""]) },
  ];
}

// بترسم كل المفاتيح جوه العنصر المطلوب (بتمسح اللي فيه الأول).
function renderCopticKeys(container, isAltFont) {
  container.innerHTML = "";

  buildCopticKeyGroups(isAltFont).forEach((group) => {
    const section = document.createElement("div");
    section.className = "kb-group";

    const title = document.createElement("p");
    title.className = "kb-group-title";
    title.textContent = group.title;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "kb-grid";

    group.keys.forEach(([char, name]) => {
      const key = document.createElement("button");
      key.className = "kb-key";
      key.type = "button";
      key.dataset.char = char;
      key.title = name ? name + " — يكتب: " + char : "يكتب: " + char;

      // الشكل القبطي (الحرف نفسه بخط الصفحة)
      const glyph = document.createElement("span");
      glyph.className = "kb-glyph";
      glyph.textContent = char;
      key.appendChild(glyph);

      // الحرف الإنجليزي اللي هيتكتب فعلاً
      const ascii = document.createElement("span");
      ascii.className = "kb-ascii";
      ascii.textContent = char;
      key.appendChild(ascii);

      grid.appendChild(key);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ===== الكتابة في مكان المؤشر مش في الآخر بس =====
// preventScroll مهمة هنا: من غيرها الصفحة بتنط لفوق مع كل ضغطة زرار،
// لأن المتصفح بيلف عشان يوري المربع لما التركيز يرجعله.
function insertIntoField(field, text) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  field.value = field.value.slice(0, start) + text + field.value.slice(end);
  const caret = start + text.length;
  field.setSelectionRange(caret, caret);
  field.focus({ preventScroll: true });
  // عشان أي حاجة سامعة للكتابة (زي المعاينة في صفحة الإدارة) تتحدّث
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

function deleteBackFromField(field) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  if (start !== end) {
    // في تحديد؟ امسحه هو
    field.value = field.value.slice(0, start) + field.value.slice(end);
    field.setSelectionRange(start, start);
  } else if (start > 0) {
    field.value = field.value.slice(0, start - 1) + field.value.slice(start);
    field.setSelectionRange(start - 1, start - 1);
  }
  field.focus({ preventScroll: true });
  field.dispatchEvent(new Event("input", { bubbles: true }));
}
