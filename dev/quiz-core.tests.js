// اختبارات الدوال الخالصة اللي في js/lib/quiz-core.js
//
// الملف ده بيتشغّل من مكانين بنفس المحتوى:
//   - dev/tests.html   -> في المتصفح، النتيجة بتتعرض في الصفحة
//   - dev/run-tests.js -> في node، النتيجة بتتطبع في التيرمينال
// الاتنين بيوفروا الدالتين test و assertEqual قبل ما يحمّلوا الملف ده.

// ===== rowToQuestion: سطر من الداتابيز -> سؤال زي ما script.js متوقعه =====

test("rowToQuestion: سؤال اختيار من متعدد", () => {
  assertEqual(
    rowToQuestion({
      id: 21001,
      type: "mcq",
      difficulty: "easy",
      question: "الأبجدية القبطية تتكون من كام حرف؟",
      options: ["32", "34", "36", "38"],
      answer: 0,
      lang: null,
      active: true,
    }),
    {
      id: 21001,
      type: "mcq",
      question: "الأبجدية القبطية تتكون من كام حرف؟",
      answer: 0,
      options: ["32", "34", "36", "38"],
    },
  );
});

test("rowToQuestion: صح وغلط مالوش options", () => {
  const q = rowToQuestion({
    id: 31001,
    type: "truefalse",
    difficulty: "easy",
    question: "الأبجدية القبطية حروفها متحركة وساكنة بس.",
    options: null,
    answer: false,
    lang: null,
    active: true,
  });
  assertEqual(q.answer, false, "الإجابة");
  assertEqual("options" in q, false, "مفيش مفتاح options");
});

test("rowToQuestion: بيحافظ على lang لما تكون cop", () => {
  const q = rowToQuestion({
    id: 11001,
    type: "fill",
    difficulty: "hard",
    question: "اكتب الحرف",
    options: null,
    answer: "ⲑ",
    lang: "cop",
    active: true,
  });
  assertEqual(q.lang, "cop", "اللغة");
});

test("rowToQuestion: مبيحطش lang لما تكون null", () => {
  const q = rowToQuestion({
    id: 11002,
    type: "fill",
    difficulty: "easy",
    question: "اكمل",
    options: null,
    answer: "ابانوب",
    lang: null,
    active: true,
  });
  assertEqual("lang" in q, false, "مفيش مفتاح lang");
});

test("rowToQuestion: بيحافظ على ترميز الحروف القبطية كما هو", () => {
  const q = rowToQuestion({
    id: 21002,
    type: "mcq",
    difficulty: "easy",
    question: "الحرف {{ⲑ}} ينطق إزاي؟ و ((:)) كمان",
    options: ["ث", "ت"],
    answer: 0,
    lang: null,
    active: true,
  });
  assertEqual(q.question, "الحرف {{ⲑ}} ينطق إزاي؟ و ((:)) كمان");
});

// ===== questionToRow: سؤال -> سطر جاهز للإضافة =====

test("questionToRow: بيحط الصعوبة وبيفعّل السؤال", () => {
  assertEqual(
    questionToRow(
      { id: 21001, type: "mcq", question: "س", options: ["أ", "ب"], answer: 1 },
      "medium",
    ),
    {
      id: 21001,
      type: "mcq",
      difficulty: "medium",
      question: "س",
      options: ["أ", "ب"],
      answer: 1,
      lang: null,
      active: true,
    },
  );
});

test("questionToRow: options بتبقى null لغير الاختيار من متعدد", () => {
  const row = questionToRow(
    { id: 31001, type: "truefalse", question: "س", answer: true },
    "hard",
  );
  assertEqual(row.options, null, "الاختيارات");
  assertEqual(row.answer, true, "الإجابة");
});

test("questionToRow: بيمرّر lang لما تكون موجودة", () => {
  const row = questionToRow(
    { id: 11001, type: "fill", question: "س", answer: "ج", lang: "cop" },
    "hard",
  );
  assertEqual(row.lang, "cop", "اللغة");
});

test("questionToRow ثم rowToQuestion بيرجّعوا نفس السؤال", () => {
  const original = {
    id: 21007,
    type: "mcq",
    question: "يعني ايه كلمة سمكة؟",
    answer: 2,
    options: ["{{ⲣⲱⲙⲓ}}", "{{ⲥⲓⲙⲓ}}", "{{ⲧⲉⲃⲧ}}"],
  };
  assertEqual(rowToQuestion(questionToRow(original, "easy")), original);
});

// ===== nextQuestionId =====

test("nextQuestionId: أول سؤال من كل نوع", () => {
  assertEqual(nextQuestionId("fill", null), 11001, "أكمل");
  assertEqual(nextQuestionId("mcq", null), 21001, "اختيار");
  assertEqual(nextQuestionId("truefalse", null), 31001, "صح وغلط");
});

test("nextQuestionId: بيكمل ورا أكبر رقم موجود", () => {
  assertEqual(nextQuestionId("mcq", 21005), 21006);
  assertEqual(nextQuestionId("truefalse", 31052), 31053);
});

test("nextQuestionId: رقم أقل من البداية مبيرجّعش لورا", () => {
  assertEqual(nextQuestionId("mcq", 5), 21001);
});

// ===== formatQuestionId =====

test("formatQuestionId: بيحط الشرطة السفلية زي questions.js", () => {
  assertEqual(formatQuestionId(21001), "2_1001");
  assertEqual(formatQuestionId(11016), "1_1016");
  assertEqual(formatQuestionId(31052), "3_1052");
});
