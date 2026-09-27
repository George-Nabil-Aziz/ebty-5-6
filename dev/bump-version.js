// بيزوّد رقم النسخة على كل ملفات الـ JS و CSS في كل الصفحات: node dev/bump-version.js
//
// ليه؟ المتصفح بيحتفظ بالملفات فترة عشان الصفحة تفتح أسرع. المشكلة إنه ممكن
// يجيب index.html الجديدة ومعاها script.js القديم المحفوظ عنده، والاتنين مش
// متفقين فالصفحة بتقع. الرقم ده (?v=3) بيخلي أي تعديل يعمل رابط جديد،
// فالمتصفح مضطر يجيبه من أول.
//
// شغّله بعد أي تعديل في ملفات JS أو CSS وقبل ما ترفع.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// كل صفحات الموقع
const PAGES = [
  "index.html",
  "pages/admin.html",
  "pages/keyboard.html",
  "pages/keyboard-alt.html",
  "dev/tests.html",
];

// الروابط المحلية بس (اللي بتبدأ بـ http زي مكتبة Supabase بتتساب زي ما هي)
const ASSET = /((?:src|href)=")(?!https?:)([^"?]+\.(?:js|css))(?:\?v=\d+)?(")/g;

// الرقم الجديد = أكبر رقم موجود + 1، أو 2 لو مفيش
function currentVersion() {
  let max = 1;
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    if (!fs.existsSync(file)) continue;
    for (const m of fs.readFileSync(file, "utf8").matchAll(/\?v=(\d+)/g)) {
      max = Math.max(max, Number(m[1]));
    }
  }
  return max;
}

const next = currentVersion() + 1;
let changed = 0;

for (const page of PAGES) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) {
    console.log("  ⚠️ صفحة ناقصة: " + page);
    continue;
  }
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(ASSET, `$1$2?v=${next}$3`);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
  }
  const count = [...after.matchAll(/\?v=\d+/g)].length;
  console.log(`  ${page} — ${count} ملف`);
}

console.log(`\nالنسخة بقت v=${next} (${changed} صفحة اتغيرت)`);
