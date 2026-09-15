// ===== كيبورد قبطي =====
// الخطين المستخدمين (Athanasuis و CS-Avva-Shenouda) خطوط legacy:
// مفيهمش حروف Unicode قبطية خالص، بيرسموا الأشكال القبطية فوق حروف ASCII عادية.
// عشان كده الكيبورد بيكتب وبينسخ ASCII، واللي بيخلّيه يبان قبطي هو الخط نفسه.
// وده بالظبط اللي محتاجه questions.js: تنسخ tebt وتحطها {{tebt}}.
//
// كل زرار ليبله هو الحرف نفسه معروض بخط الصفحة، فبتشوف الشكل القبطي
// اللي هيطلع قبل ما تدوس.

// ===== الأبجدية القبطية بترتيبها الصح =====
// الترتيب ده هو ترتيب الأبجدية القبطية، مش ترتيب a-b-c الإنجليزي.
// كل خط ليه مفاتيحه لوحده لأن الخطين مش بنفس التوزيع
// (مثلاً ϩ = | في الخط الأول، و h في الخط التاني).
//
// ملاحظة على ⲋ (soou): الخط الأول فيه شكلين — , صغير و < كبير.
// الخط التاني فيه شكل واحد بس (^) وهو الشكل اللي فوقه شرطة، فبيتحط في
// الصفين.
//
//    [ الاسم, خط١ صغير, خط١ كبير, خط٢ صغير, خط٢ كبير ]
const ALPHABET = [
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

const DIGITS = "0123456789";

// كل حروف الـ ASCII اللي ممكن تتكتب، عشان نعرف إيه اللي فاضل بره الأبجدية
const ALL_ASCII = (() => {
  let out = "";
  for (let code = 0x21; code < 0x7f; code++) out += String.fromCharCode(code);
  return out;
})();

const THEME_KEY = "quiz_theme";

const output = document.getElementById("kb-output");
const keysWrap = document.getElementById("kb-keys");
const copyBtn = document.getElementById("kb-copy");
const spaceBtn = document.getElementById("kb-space");
const backBtn = document.getElementById("kb-back");
const clearBtn = document.getElementById("kb-clear");
const themeToggleBtn = document.getElementById("theme-toggle");

// الصفحة بتقول هي بأنهي خط، والمفاتيح بتتاخد من العمود المناسب
const isAltFont = document.body.classList.contains("kb-font-alt");
const LOWER_COL = isAltFont ? 3 : 1;
const UPPER_COL = isAltFont ? 4 : 2;

// ===== تجميع المجموعات =====
function buildGroups() {
  const lower = ALPHABET.map((row) => [row[LOWER_COL], row[0]]);
  const upper = ALPHABET.map((row) => [row[UPPER_COL], row[0].toUpperCase()]);

  // أي حرف ASCII مش في الأبجدية ولا في الأرقام يروح لمجموعة العلامات،
  // عشان مفيش حاجة تضيع من الكيبورد
  const used = new Set(
    lower.map((k) => k[0]).concat(upper.map((k) => k[0]), DIGITS.split(""))
  );
  const rest = ALL_ASCII.split("")
    .filter((char) => !used.has(char))
    .map((char) => [char, ""]);

  return [
    { title: "الحروف الكبيرة", keys: upper },
    { title: "الأبجدية القبطية", keys: lower },
    { title: "علامات ورموز", keys: rest },
    { title: "أرقام", keys: DIGITS.split("").map((char) => [char, ""]) },
  ];
}

function buildKeys() {
  buildGroups().forEach((group) => {
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

      // الحرف الإنجليزي اللي هيتنسخ
      const ascii = document.createElement("span");
      ascii.className = "kb-ascii";
      ascii.textContent = char;
      key.appendChild(ascii);

      grid.appendChild(key);
    });

    section.appendChild(grid);
    keysWrap.appendChild(section);
  });
}

// ===== الكتابة في مكان المؤشر مش في الآخر بس =====
// preventScroll مهمة هنا: من غيرها الصفحة بتنط لفوق مع كل ضغطة زرار،
// لأن المتصفح بيلف عشان يوري المربع لما التركيز يرجعله.
function insertText(text) {
  const start = output.selectionStart ?? output.value.length;
  const end = output.selectionEnd ?? output.value.length;
  output.value = output.value.slice(0, start) + text + output.value.slice(end);
  const caret = start + text.length;
  output.setSelectionRange(caret, caret);
  output.focus({ preventScroll: true });
}

function deleteBack() {
  const start = output.selectionStart ?? output.value.length;
  const end = output.selectionEnd ?? output.value.length;
  if (start !== end) {
    // في تحديد؟ امسحه هو
    output.value = output.value.slice(0, start) + output.value.slice(end);
    output.setSelectionRange(start, start);
  } else if (start > 0) {
    output.value = output.value.slice(0, start - 1) + output.value.slice(start);
    output.setSelectionRange(start - 1, start - 1);
  }
  output.focus({ preventScroll: true });
}

// ===== النسخ =====
// الصفحة ممكن تتفتح من الجهاز مباشرة (file://)، والـ Clipboard API
// مش مضمونة هناك، فبنرجع لـ execCommand القديمة.
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // النص محدد أصلاً في المربع قبل ما الدالة دي تتنده،
  // فـ execCommand بينسخ التحديد ده من غير ما نضيّعه.
  return document.execCommand("copy")
    ? Promise.resolve()
    : Promise.reject(new Error("copy failed"));
}

let copyResetTimer = null;

function flashCopyBtn(message) {
  clearTimeout(copyResetTimer);
  copyBtn.textContent = message;
  copyResetTimer = setTimeout(() => {
    copyBtn.textContent = "📋 نسخ";
  }, 2000);
}

// ===== الأحداث =====
keysWrap.addEventListener("click", (event) => {
  const key = event.target.closest(".kb-key");
  if (key) insertText(key.dataset.char);
});

spaceBtn.addEventListener("click", () => insertText(" "));
backBtn.addEventListener("click", deleteBack);

clearBtn.addEventListener("click", () => {
  output.value = "";
  output.focus({ preventScroll: true });
});

copyBtn.addEventListener("click", () => {
  const text = output.value;
  if (!text) {
    flashCopyBtn("مفيش حاجة تتنسخ");
    return;
  }
  // بنحدد النص الأول مهما حصل: لو النسخ نجح، أول ما تكتب حرف جديد يتمسح
  // على طول؛ ولو فشل لأي سبب تقدر تعمل Ctrl+C وهو محدد قدامك.
  output.focus({ preventScroll: true });
  output.select();
  copyText(text)
    .then(() => flashCopyBtn("تم النسخ ✅"))
    .catch(() => flashCopyBtn("محدّد — دوس Ctrl+C"));
});

// ===== الثيم (نفس مفتاح التخزين بتاع الكويز عشان يفضل متزامن) =====
function applyTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeToggleBtn.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
});

// ===== التشغيل =====
buildKeys();
applyTheme(localStorage.getItem(THEME_KEY) || "light");
output.focus({ preventScroll: true });
