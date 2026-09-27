// ===== صفحة الكيبورد القبطي المستقلة =====
// الأبجدية وبناء المفاتيح والكتابة في مكان المؤشر كلهم في
// js/lib/coptic-keyboard.js، عشان صفحة الإدارة تستخدمهم هي كمان.
// الملف ده بقى مسؤول عن الصفحة دي بس: النسخ، والثيم، وربط الأزرار.

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

// ===== الثيم (نفس مفتاح التخزين بتاع الكويز عشان يفضل متزامن) =====
function applyTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// ===== الأحداث =====
keysWrap.addEventListener("click", (event) => {
  const key = event.target.closest(".kb-key");
  if (key) insertIntoField(output, key.dataset.char);
});

spaceBtn.addEventListener("click", () => insertIntoField(output, " "));
backBtn.addEventListener("click", () => deleteBackFromField(output));

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

themeToggleBtn.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
});

// ===== التشغيل =====
renderCopticKeys(keysWrap, isAltFont);
applyTheme(localStorage.getItem(THEME_KEY) || "light");
output.focus({ preventScroll: true });
