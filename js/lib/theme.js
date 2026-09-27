// ===== الثيم (فاتح/غامق) =====
// مشترك بين كل صفحات الموقع بنفس مفتاح التخزين، عشان اللي تختاره في
// صفحة يفضل معاك في الباقي.
//
// ملحوظة: كل صفحة فيها كمان سطر صغير في <head> بيطبّق الثيم المحفوظ
// قبل ما الصفحة تترسم، عشان متشوفش ومضة بيضا وإنت مختار الغامق.
// السطر ده بيكرر اسم المفتاح عن قصد، لأنه لازم يشتغل قبل تحميل أي ملف.

const THEME_KEY = "quiz_theme";

// localStorage ممكن يرمي غلطة في التصفح الخاص أو لو التخزين مقفول،
// فكل تعامل معاه محاط بـ try عشان الصفحة متقعش عشان الثيم.
function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

function applyTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // مش مشكلة — الثيم هيشتغل في الصفحة دي بس مش هيتحفظ
  }
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("#theme-toggle").forEach((btn) => {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
  });
}

// بتربط زرار التبديل وبتطبّق المحفوظ. بتتنده مرة واحدة في كل صفحة.
function initTheme() {
  applyTheme(getSavedTheme());
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}
