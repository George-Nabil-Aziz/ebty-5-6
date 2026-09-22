// مشغّل الاختبارات من التيرمينال: node dev/run-tests.js
//
// المشروع من غير npm عن قصد، فمفيش مكتبة اختبارات. الملف ده بيحمّل
// الدوال الخالصة وملف الاختبارات في نفس السياق ويطبع النتيجة.
// نفس ملف الاختبارات بالظبط بيتشغّل في المتصفح من dev/tests.html.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILES = [
  path.join(__dirname, "..", "js", "lib", "quiz-core.js"),
  path.join(__dirname, "quiz-core.tests.js"),
];

let passed = 0;
let failed = 0;

const sandbox = {
  console,
  test(name, fn) {
    try {
      fn();
      passed++;
      console.log("  ✅ " + name);
    } catch (e) {
      failed++;
      console.log("  ❌ " + name + " — " + e.message);
    }
  },
  assertEqual(actual, expected, label) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
      throw new Error(`${label ? label + ": " : ""}expected ${b}, got ${a}`);
    }
  },
};

vm.createContext(sandbox);

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.error("❌ ملف ناقص: " + file);
    process.exit(1);
  }
  try {
    vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  } catch (e) {
    console.error("❌ فشل تحميل " + path.basename(file) + " — " + e.message);
    process.exit(1);
  }
}

console.log(`\nنجح ${passed} — فشل ${failed}`);
process.exit(failed === 0 ? 0 : 1);
