// دوال خالصة: مالهاش علاقة بالشاشة ولا بالشبكة، فبتتختبر لوحدها.
// شغّل اختباراتها بـ: node dev/run-tests.js  أو افتح dev/tests.html في المتصفح.
// بتتحمل بـ <script> عادي زي باقي المشروع وبتعرّف متغيرات عامة.

// النوع بيحدد أول رقم في الـ id: 1 أكمل، 2 اختيار من متعدد، 3 صح وغلط.
const QUESTION_TYPE_PREFIX = { fill: 1, mcq: 2, truefalse: 3 };

// أول رقم في كل نوع هو prefix*10000 + 1001 (يعني 11001، 21001، 31001).
const QUESTION_ID_COUNTER_START = 1000;

// سطر من جدول questions -> سؤال بنفس الشكل اللي كان في questions.js بالظبط،
// عشان باقي كود الامتحان ميتغيرش.
function rowToQuestion(row) {
  const q = {
    id: row.id,
    type: row.type,
    question: row.question,
    answer: row.answer,
  };
  if (row.options !== null && row.options !== undefined) q.options = row.options;
  if (row.lang) q.lang = row.lang;
  return q;
}

// سؤال -> سطر جاهز للإضافة في جدول questions.
function questionToRow(q, difficulty) {
  return {
    id: q.id,
    type: q.type,
    difficulty,
    question: q.question,
    options: q.type === "mcq" ? q.options : null,
    answer: q.answer,
    lang: q.lang ?? null,
    active: true,
  };
}

// الرقم الجاي لنوع معيّن. currentMaxId هو أكبر id موجود للنوع ده، أو null لو مفيش.
function nextQuestionId(type, currentMaxId) {
  const base = QUESTION_TYPE_PREFIX[type] * 10000 + QUESTION_ID_COUNTER_START;
  return Math.max(currentMaxId ?? 0, base) + 1;
}

// 21001 -> "2_1001"، عشان الرقم يبان بنفس شكله في questions.js القديم.
function formatQuestionId(id) {
  const s = String(id);
  return s.length > 1 ? s[0] + "_" + s.slice(1) : s;
}

// ===== حط أقواس الخط القبطي تلقائياً =====
// الخطوط القبطية في المشروع قديمة: بترسم الشكل القبطي فوق حرف إنجليزي.
// عشان كده أي حرف قبطي لازم يتحط بين {{ }} (الخط الأول) أو (( )) (التاني).
// الدالة دي بتخلي كيبورد صفحة الإدارة يحط الأقواس لوحده بدل ما تكتبها بإيدك:
//   واقف بره أي أقواس؟ بيفتح أقواس جديدة حوالين الحرف.
//   واقف جوه أقواس؟ بيحط الحرف جواها، فالحروف بتتجمع في قوسين واحدين.
//
// بترجع { value, caret } — النص الجديد ومكان المؤشر بعد الكتابة.
function computeMarkerInsert(value, selStart, selEnd, char, open, close) {
  const before = value.slice(0, selStart);
  const after = value.slice(selEnd);

  // المسافة مبتفتحش أقواس — قوسين فيهم مسافة بس ملهمش معنى
  const isSpace = char.trim() === "";

  // جوه أقواس؟ بندوّر على أقرب فتح وأقرب قفل ورا المؤشر، من النوعين.
  // لو أقرب حاجة ورانا فتحة، يبقى إحنا جوه — حتى لو من النوع التاني،
  // وساعتها بنكتب من غير أقواس عشان منعشّشش.
  const lastOpen = Math.max(before.lastIndexOf("{{"), before.lastIndexOf("(("));
  const lastClose = Math.max(before.lastIndexOf("}}"), before.lastIndexOf("))"));
  const inside = lastOpen > lastClose;

  if (inside || isSpace) {
    return { value: before + char + after, caret: selStart + char.length };
  }
  return {
    value: before + open + char + close + after,
    caret: selStart + open.length + char.length,
  };
}
