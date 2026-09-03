// عدّل أو ضيف أسئلتك هنا، كل نوع في مجموعته.
// id         -> رقم ثابت لكل سؤال، استخدمه للإشارة للسؤال لو فيه غلط تحب تصلحه
// mcq        -> اختيار من متعدد: options مصفوفة، answer هو رقم الاختيار الصح (يبدأ من 0)
// truefalse  -> صح ولا غلط: answer قيمته true أو false
// fill       -> إكمال: answer نص، والمقارنة بتتجاهل حالة الأحرف والمسافات الزيادة
// lang: "cop" -> اختياري، ضيفه لأي سؤال (من أي نوع فوق) لو نص السؤال نفسه فيه حروف قبطية،
//                وهيتعرض بخط قبطي مخصص بدل الخط العادي
// {{...}} -> حط أي جزء من نص السؤال أو أي اختيار جوه قوسين مزدوجين كده عشان يتعرض بالخط القبطي الأساسي،
//            من غير ما يأثر على باقي الجملة العربية (استخدمه لحرف أو رمز واحد جوه الجملة)
// ((...)) -> زيها بالظبط بس بيستخدم الخط القبطي التاني (بديل لو الرمز مش ظاهر صح في الأساسي)
// difficulty: "easy" -> اختياري، أي سؤال متعلم عليه كده هيتحط في أول الامتحان قبل باقي الأسئلة

const MCQ_QUESTIONS = [
  {
    id: 1,
    type: "mcq",
    difficulty: "easy",
    question: "الأبجدية القبطية تتكون من كام حرف؟",
    options: ["32", "34", "36", "38"],
    answer: 0,
  },
  {
    id: 2,
    type: "mcq",
    difficulty: "easy",
    question: "الجنكم ( ` ) إذا وضع على حرف متحرك فإنه يفيد؟",
    options: ["استقلال نطق الحرف", "تنطق كحرف {{E}}"],
    answer: 0,
  },
  {
    id: 3,
    type: "mcq",
    difficulty: "easy",
    question: "الجنكم ( ` ) إذا وضع على حرف ساكن فإنها؟",
    options: ["استقلال نطق الحرف", "تنطق كحرف {{E}}"],
    answer: 1,
  },
  {
    id: 12,
    type: "mcq",
    difficulty: "easy",
    question: "الحرف ((:)) ينطق ت امتى ؟",
    options: ["لو جه قبله ((C)) - ((S))", "لو جه بعده ((C)) - ((S))"],
    answer: 0,
  },
  {
    id: 13,
    type: "mcq",
    difficulty: "medium",
    question: "الحرف ((C)) ينطق ص امتى ؟",
    options: [
      "إذا جاء بعده حرف تضخيم ((A)) - ((W))",
      "إذا جاء في كلمة يونانية",
      "فيما عدا ذلك",
    ],
    answer: 0,
  },
  {
    id: 14,
    type: "mcq",
    difficulty: "medium",
    question: "الحرف ((T)) ينطق د امتى ؟",
    options: [
      "إذا جاء بعده حرف تضخيم",
      "إذا جاء في كلمة يونانية وجاء قبله حرف ((N))",
      "فيما عدا ذلك",
    ],
    answer: 1,
  },
  {
    id: 16,
    type: "mcq",
    difficulty: "hard",
    question: "الحرف كى ⲭ ينطق؟",
    options: ["ج ش ن", "ع ج ك", "ك ش خ", "ف ن ع"],
    answer: 2,
  },
];

const TRUEFALSE_QUESTIONS = [
  {
    id: 4,
    type: "truefalse",
    difficulty: "easy",
    question: "الأبجدية القبطية تتكون من الحروف المتحركة والساكنة فقط.",
    answer: false,
  },
  {
    id: 5,
    type: "truefalse",
    difficulty: "easy",
    question: "الحرف ((^)) يستخدم للتعبير عن الرقم 8.",
    answer: false,
  },
  {
    id: 6,
    type: "truefalse",
    difficulty: "easy",
    question: "حروف التضخيم هي {{A}} - {{O}}.",
    answer: false,
  },
  {
    id: 7,
    type: "truefalse",
    difficulty: "easy",
    question: "عدد الحروف المتحركة للكسر 3.",
    answer: false,
  },
  {
    id: 8,
    type: "truefalse",
    difficulty: "easy",
    question: "الحرف {{B}} ينطق ڤ لو جه بعده حرف متحرك للكسر.",
    answer: false,
  },
  {
    id: 9,
    type: "truefalse",
    difficulty: "easy",
    question: "الحرف {{G}} ينطق ج لو جه بعده حرف متحرك للكسر.",
    answer: true,
  },
  {
    id: 15,
    type: "truefalse",
    difficulty: "hard",
    question:
      "في كلمة {{Eua}}، الحرف ((U)) اتنطق هنا ڤ علشان جه بعده حرف ((A)).",
    answer: false,
  },
];

const FILL_QUESTIONS = [
  {
    id: 10,
    type: "fill",
    difficulty: "easy",
    question: "أكمل: عدد الحروف المتحركة في الأبجدية القبطية هو ____.",
    answer: "7",
  },
  {
    id: 11,
    type: "fill",
    difficulty: "easy",
    question: "أكمل: عدد الحروف الساكنة في الأبجدية القبطية هو ____.",
    answer: "24",
  },
];

const COPTIC_QUESTIONS = [];

const QUESTIONS = [
  ...MCQ_QUESTIONS,
  ...TRUEFALSE_QUESTIONS,
  ...FILL_QUESTIONS,
  ...COPTIC_QUESTIONS,
];
