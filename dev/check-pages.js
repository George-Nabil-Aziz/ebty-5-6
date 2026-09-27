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
//
//   ٣. صفحة بتستعمل دالة من مكتبة في js/lib بس ناسية تحمّل المكتبة —
//      بتقع بـ "X is not defined" أول ما توصل للسطر ده.

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

// أسماء الدوال اللي كل مكتبة في js/lib بتوفرها، بتتقرا مرة واحدة
let libExportsCache = null;
function libExports() {
  if (libExportsCache) return libExportsCache;
  const dir = path.join(ROOT, "js", "lib");
  libExportsCache = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const code = fs.readFileSync(path.join(dir, file), "utf8");
    libExportsCache[file] = [
      ...code.matchAll(/^function\s+([A-Za-z_$][\w$]*)/gm),
    ].map((m) => m[1]);
  }
  return libExportsCache;
}

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

  // ---------- ٣. مكتبة مستعملة بس مش محمّلة ----------
  // لكل دالة معرّفة في js/lib، لو الصفحة بتناديها لازم تكون محمّلة المكتبة.
  const loaded = new Set(scripts.map(({ src }) => path.basename(src.split("?")[0])));
  const unloaded = [];

  for (const [libFile, names] of Object.entries(libExports())) {
    if (loaded.has(libFile)) continue;
    for (const name of names) {
      const called = new RegExp("(?<![.\\w$])" + name + "\\s*\\(");
      if (called.test(joined)) {
        unloaded.push(`${name}() من ${libFile} — الصفحة بتستعملها بس مش محمّلة الملف`);
        break;
      }
    }
  }

  const total = clashes.length + missing.length + unloaded.length;
  console.log(`\n${page} — ${scripts.length} ملف، ${owner.size} اسم، ${wanted.size} عنصر`);
  if (total === 0) {
    console.log("  ✅ تمام");
  } else {
    clashes.forEach((c) => console.log("  ❌ " + c));
    missing.forEach((m) => console.log("  ❌ عنصر مش موجود: " + m));
    unloaded.forEach((u) => console.log("  ❌ " + u));
    problems += total;
  }
}

console.log(problems === 0 ? "\nمفيش أي مشكلة" : `\nفيه ${problems} مشكلة`);
process.exit(problems === 0 ? 0 : 1);
