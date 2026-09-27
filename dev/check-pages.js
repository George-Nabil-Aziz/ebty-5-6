// فحص سريع لكل صفحات الموقع: node dev/check-pages.js
//
// بيدور على نوعين من الغلط اللي بيكسروا الصفحة من غير رسالة واضحة:
//
//   ١. اسم متعرّف مرتين في ملفين بيتحمّلوا في نفس الصفحة.
//      const مكرر = SyntaxError وقت التحليل، يعني الملف التاني مش بيشتغل
//      منه ولا سطر. والدالة المكررة مبتكسرش بس بتتغطى على بعض وده بيلخبط.
//
//   ٢. getElementById بيدور على عنصر مش موجود لا في الصفحة ولا بيتعمل
//      ديناميكياً — بيرجع null والسطر اللي بعده بيقع.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const PAGES = [
  "index.html",
  "pages/admin.html",
  "pages/keyboard.html",
  "pages/keyboard-alt.html",
];

let problems = 0;

function localScripts(html, pageDir) {
  return [...html.matchAll(/<script src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => !s.startsWith("http"))
    .map((s) => ({ src: s, file: path.join(pageDir, s.split("?")[0]) }));
}

for (const page of PAGES) {
  const pageFile = path.join(ROOT, page);
  if (!fs.existsSync(pageFile)) {
    console.log(`\n${page}\n  ⚠️ الصفحة مش موجودة`);
    problems++;
    continue;
  }

  const html = fs.readFileSync(pageFile, "utf8");
  const scripts = localScripts(html, path.dirname(pageFile));

  // ---------- ١. تعارض الأسماء ----------
  const owner = new Map();
  const clashes = [];
  const allCode = [];

  for (const { src, file } of scripts) {
    if (!fs.existsSync(file)) {
      clashes.push(`ملف ناقص: ${src}`);
      continue;
    }
    const code = fs.readFileSync(file, "utf8");
    allCode.push(code);

    const names = [
      ...[...code.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => [m[1], "متغير"]),
      ...[...code.matchAll(/^function\s+([A-Za-z_$][\w$]*)/gm)].map((m) => [m[1], "دالة"]),
    ];

    for (const [name, kind] of names) {
      if (owner.has(name)) {
        clashes.push(`${name} — ${kind} متعرّفة في ${owner.get(name)} وكمان في ${src}`);
      } else {
        owner.set(name, src);
      }
    }
  }

  // ---------- ٢. عناصر ناقصة ----------
  const joined = allCode.join("\n");
  const wanted = new Set(
    [...joined.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]),
  );
  const present = new Set([
    ...[...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
    // عناصر بتتعمل ديناميكياً من قوالب جوه الـ JS
    ...[...joined.matchAll(/\bid="([^"$]+)"/g)].map((m) => m[1]),
    ...[...joined.matchAll(/\.id\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]),
  ]);
  const missing = [...wanted].filter((id) => !present.has(id));

  console.log(`\n${page} — ${scripts.length} ملف، ${owner.size} اسم، ${wanted.size} عنصر`);
  if (clashes.length === 0 && missing.length === 0) {
    console.log("  ✅ تمام");
  } else {
    clashes.forEach((c) => console.log("  ❌ " + c));
    missing.forEach((m) => console.log("  ❌ عنصر مش موجود: " + m));
    problems += clashes.length + missing.length;
  }
}

console.log(problems === 0 ? "\nمفيش أي مشكلة" : `\nفيه ${problems} مشكلة`);
process.exit(problems === 0 ? 0 : 1);
