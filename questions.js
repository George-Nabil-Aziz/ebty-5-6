// عدّل أو ضيف أسئلتك هنا، كل سؤال في مجموعة صعوبته مهما كان نوعه.
// المكان بيحدد الصعوبة: أي سؤال تحطه في EASY_QUESTIONS هو easy، وهكذا،
//   فمفيش حاجة اسمها difficulty جوه السؤال نفسه.
// عدد الأسئلة اللي بتتسحب من كل مجموعة في الامتحان متحكوم فيه من QUOTAS في script.js
// id -> رقم ثابت لكل سؤال، استخدمه للإشارة للسؤال لو فيه غلط تحب تصلحه.
//       شكله X_XXXX: الرقم الأول هو النوع، والباقي ترقيم متسلسل لكل نوع لوحده.
//         1 = أكمل (fill)     2 = اختيار من متعدد (mcq)     3 = صح وغلط (truefalse)
//       الشرطة السفلية فاصل بصري بس، القيمة رقم عادي (2_1001 قيمته 21001).
//       الصعوبة مش داخلة في الرقم عن قصد، عشان تنقل السؤال بين المجموعات
//       من غير ما تضطر تغيّر رقمه.
// mcq        -> اختيار من متعدد: options مصفوفة، answer هو رقم الاختيار الصح (يبدأ من 0)
// truefalse  -> صح ولا غلط: answer قيمته true أو false
// fill       -> إكمال: answer نص، والمقارنة بتتجاهل حالة الأحرف والمسافات الزيادة
// lang: "cop" -> اختياري، ضيفه لأي سؤال (من أي نوع فوق) لو نص السؤال نفسه فيه حروف قبطية،
//                وهيتعرض بخط قبطي مخصص بدل الخط العادي
// {{...}} -> حط أي جزء من نص السؤال أو أي اختيار جوه قوسين مزدوجين كده عشان يتعرض بالخط القبطي الأساسي،
//            من غير ما يأثر على باقي الجملة العربية (استخدمه لحرف أو رمز واحد جوه الجملة)
// ((...)) -> زيها بالظبط بس بيستخدم الخط القبطي التاني (بديل لو الرمز مش ظاهر صح في الأساسي)

const EASY_QUESTIONS = [
  {
    id: 2_1001,
    type: "mcq",
    question: "الأبجدية القبطية تتكون من كام حرف؟",
    options: ["32", "34", "36", "38"],
    answer: 0,
  },
  {
    id: 2_1002,
    type: "mcq",
    question: "الجنكم ( ` ) إذا وضع على حرف متحرك فإنه يفيد؟",
    options: ["استقلال نطق الحرف", "تنطق كحرف {{E}}"],
    answer: 0,
  },
  {
    id: 2_1003,
    type: "mcq",
    question: "الجنكم ( ` ) إذا وضع على حرف ساكن فإنها؟",
    options: ["استقلال نطق الحرف", "تنطق كحرف {{E}}"],
    answer: 1,
  },
  {
    id: 2_1004,
    type: "mcq",
    question: "الحرف ((:)) ينطق ت امتى ؟",
    options: ["لو جه قبله ((C)) - ((S))", "لو جه بعده ((C)) - ((S))"],
    answer: 0,
  },
  {
    id: 2_1005,
    type: "mcq",
    question: "يعني ايه كلمة سمكة؟",
    options: ["{{ⲣⲱⲙⲓ}}", "{{ⲥⲓⲙⲓ}}", "{{ⲧⲉⲃⲧ}}"],
    answer: 2,
  },
  {
    id: 3_1001,
    type: "truefalse",
    question: "الأبجدية القبطية تتكون من الحروف المتحركة والساكنة فقط.",
    answer: false,
  },
  {
    id: 3_1002,
    type: "truefalse",
    question: "الحرف ((^)) يستخدم للتعبير عن الرقم 8.",
    answer: false,
  },
  {
    id: 3_1003,
    type: "truefalse",
    question: "حروف التضخيم هي {{A}} - {{O}}.",
    answer: false,
  },
  {
    id: 3_1004,
    type: "truefalse",
    question: "عدد الحروف المتحركة للكسر 3.",
    answer: false,
  },
  {
    id: 3_1005,
    type: "truefalse",
    question: "الحرف {{B}} ينطق ڤ لو جه بعده حرف متحرك للكسر.",
    answer: false,
  },
  {
    id: 3_1006,
    type: "truefalse",
    question: "الحرف {{G}} ينطق ج لو جه بعده حرف متحرك للكسر.",
    answer: true,
  },
  {
    id: 3_1008,
    type: "truefalse",
    question: "كلمة {{ⲆⲒⲠⲚⲞⲚ}} يعني غذاء.",
    answer: false,
  },
  {
    id: 1_1001,
    type: "fill",
    question: "أكمل: عدد الحروف المتحركة في الأبجدية القبطية هو ____.",
    answer: "7",
  },
  {
    id: 1_1002,
    type: "fill",
    question: "أكمل: عدد الحروف الساكنة في الأبجدية القبطية هو ____.",
    answer: "24",
  },
  {
    id: 1_1010,
    type: "fill",
    question: "أكمل: الحرف {{ϢⲀϢϤ}} رقمه ____.",
    answer: "7",
  },
  {
    id: 3_1022,
    type: "truefalse",
    question: "كلمة {{ϤⲈⲚⲦ}} يعني عنكبوت.",
    answer: false,
  },
];

const MEDIUM_QUESTIONS = [
  {
    id: 2_1006,
    type: "mcq",
    question: "الحرف ((C)) ينطق ص امتى ؟",
    options: [
      "إذا جاء بعده حرف تضخيم ((A)) - ((W))",
      "إذا جاء في كلمة يونانية",
      "فيما عدا ذلك",
    ],
    answer: 0,
  },
  {
    id: 2_1007,
    type: "mcq",
    question: "الحرف ((T)) ينطق د امتى ؟",
    options: [
      "إذا جاء بعده حرف تضخيم",
      "إذا جاء في كلمة يونانية وجاء قبله حرف ((N))",
      "فيما عدا ذلك",
    ],
    answer: 1,
  },
  {
    id: 2_1008,
    type: "mcq",
    question: "يعني ايه كلمة {{ⲁⲫⲉ}}؟",
    options: ["يد", "رأس", "رجل"],
    answer: 1,
  },
  {
    id: 2_1010,
    type: "mcq",
    question: "معنى كلمة {{ⲃⲁⲗ}}؟",
    options: ["يد", "عين", "رجل"],
    answer: 1,
  },
  {
    id: 2_1012,
    type: "mcq",
    question: "ليه في كلمة ((ANGGELOC)) حرف ال ((G)) الثانى اتنطق ي؟",
    options: [
      "علشان قبله حرف حلقى",
      "علشان متكرر",
      "علشان بعده حرف متحرك للكسر",
    ],
    answer: 2,
  },
  {
    id: 2_1013,
    type: "mcq",
    question: "ليه في كلمة ((ANGGELOC)) حرف ال ((G)) الأول اتنطق ن؟",
    options: [
      "علشان بعده حرف حلقى",
      "علشان متكرر",
      "علشان بعده حرف متحرك للكسر",
    ],
    answer: 1,
  },
  {
    id: 2_1014,
    type: "mcq",
    question: "يعني ايه كلمة {{ⲈⲖⲔⲞ}}؟",
    options: ["جوافة", "خوخ", "جميز"],
    answer: 2,
  },
  {
    id: 2_1015,
    type: "mcq",
    question: "يعني ايه كلمة {{ⲤⲞⲞⲨ Ⲛ̀ϪⲰⲘ}}؟",
    options: ["الكتب", "اقرا الكتب", "6 كتب"],
    answer: 2,
  },
  {
    id: 2_1016,
    type: "mcq",
    question: "يعني ايه كلمة {{ⲌⲎⲖⲞⲤ}}؟",
    options: ["جسد", "حسد", "فسد"],
    answer: 1,
  },
  {
    id: 3_1009,
    type: "truefalse",
    question: "كلمة {{ⲤⲎⲒⲚⲒ}} يعني شاطئ.",
    answer: false,
  },
  {
    id: 2_1017,
    type: "mcq",
    question: "في كلمة {{Ϣ̀ⲐⲎⲚ}}، حرف ((Ⲑ)) هنا بينطق ايه؟",
    options: ["ث", "ت"],
    answer: 1,
  },
  {
    id: 2_1018,
    type: "mcq",
    question: "يعني ايه كلمة {{ⲔⲈⲖⲒ}}؟",
    options: ["رجل", "عضمة", "ركبة"],
    answer: 2,
  },
  {
    id: 3_1010,
    type: "truefalse",
    question: "كلمة {{ⲐⲞϢ}} يعني اقليم.",
    answer: true,
  },
  {
    id: 1_1003,
    type: "fill",
    question: "أكمل: كلمة {{ⲰⲒⲔ}} يعني ____.",
    answer: "خبز",
  },
  {
    id: 1_1004,
    type: "fill",
    question: "أكمل: كلمة {{ⲤⲞⲚ}} يعني ____.",
    answer: "أخ",
  },
  {
    id: 1_1005,
    type: "fill",
    question: "أكمل: كلمة {{ⲢⲞⲘⲠⲒ}} يعني ____.",
    answer: "سنة",
  },
  {
    id: 1_1006,
    type: "fill",
    question: "أكمل: كلمة {{ⲪⲈ}} يعني ____.",
    answer: "سماء",
  },
  {
    id: 1_1007,
    type: "fill",
    question: "أكمل: كلمة {{Ⲭ̀ⲖⲀⲖ}} يعني ____.",
    answer: "عقد",
  },
  {
    id: 1_1008,
    type: "fill",
    question: "أكمل: كلمة {{ⲮⲨⲬⲞⲤ}} يعني ____.",
    answer: "برد",
  },
  {
    id: 1_1009,
    type: "fill",
    question: "أكمل: الحرف {{ⲮⲒⲦ}} رقمه ____.",
    answer: "9",
  },
  {
    id: 3_1011,
    type: "truefalse",
    question: "كلمة {{ⲖⲀⲤ}} يعني فم.",
    answer: false,
  },
  {
    id: 3_1012,
    type: "truefalse",
    question: "كلمة {{ⲘⲀⲨ}} يعني أخت.",
    answer: false,
  },
  {
    id: 3_1014,
    type: "truefalse",
    question: "كلمة {{ⲖⲒⲜ}} يعني مخدة.",
    answer: false,
  },
  {
    id: 3_1015,
    type: "truefalse",
    question: "كلمة {{ⲢⲎ}} يعني شمس.",
    answer: true,
  },
  {
    id: 3_1016,
    type: "truefalse",
    question: "كلمة {{ⲔⲞⲤⲘⲞⲤ}} يعني عالم.",
    answer: true,
  },
  {
    id: 2_1019,
    type: "mcq",
    question: "في كلمة {{ⲤⲰ}}، حرف ((C)) هنا بينطق ايه؟",
    options: ["ص", "س"],
    answer: 0,
  },
  {
    id: 2_1020,
    type: "mcq",
    question: "في كلمة {{ⲈⲚⲦⲞⲖⲎ}}، حرف ((T)) هنا بينطق ايه؟",
    options: ["س", "ص", "ط", "د"],
    answer: 3,
  },
  {
    id: 3_1017,
    type: "truefalse",
    question: "كلمة {{ⲦⲀⲒⲞ}} يعني نعمة.",
    answer: false,
  },
  {
    id: 3_1018,
    type: "truefalse",
    question: "كلمة {{ⲞⲨⲢⲞ}} يعني ملكة.",
    answer: false,
  },
  {
    id: 3_1019,
    type: "truefalse",
    question: "كلمة {{ⲞⲨⲢⲰ}} يعني ملك.",
    answer: true,
  },
  {
    id: 3_1020,
    type: "truefalse",
    question: "كلمة {{ⲂⲨⲔⲔⲒ}} يعني حب العزيز.",
    answer: true,
  },
  {
    id: 3_1023,
    type: "truefalse",
    question: "كلمة ((QRE)) يعني جعان.",
    answer: false,
  },
  {
    id: 1_1011,
    type: "fill",
    question: "أكمل: كلمة {{Ϩ̀ⲘⲞⲨ}} يعني ____.",
    answer: "ملح",
  },
  {
    id: 3_1024,
    type: "truefalse",
    question: "كلمة {{ϪⲒϪ}} يعني يد.",
    answer: true,
  },
  {
    id: 3_1025,
    type: "truefalse",
    question: "كلمة {{ϪⲰⲘ}} يعني قوة.",
    answer: false,
  },
  {
    id: 3_1026,
    type: "truefalse",
    question: "كلمة {{ϬⲒⲤⲒ}} يعني يعظم.",
    answer: true,
  },
  {
    id: 2_1022,
    type: "mcq",
    question: "يعني ايه ((ⲁⲛⲟⲕ ⲡⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ ⲙⲡⲓⲕⲟⲥⲙⲟⲥ))؟",
    options: ["الله محبة", "انا هو نور العالم", "احبوا بعضكم بعضا"],
    answer: 1,
  },
  {
    id: 3_1030,
    type: "truefalse",
    question: "معنى ((ϣⲱⲡⲓ ⲉⲣⲉⲧⲉⲛⲥⲉⲃⲧⲱⲧ)) هو: كونوا متيقظين.",
    answer: false,
  },
];

const HARD_QUESTIONS = [
  {
    id: 2_1025,
    type: "mcq",
    question: "يعني ايه ((mareftoubo `nje pekran))؟",
    options: ["ليأت ملكوتك", "ليتقدس اسمك"],
    answer: 1,
  },
  {
    id: 3_1037,
    type: "truefalse",
    question: "كلمة ((JWM)) كلمة قبطية.",
    answer: true,
  },
  {
    id: 3_1038,
    type: "truefalse",
    question: "كلمة ((GRAVY)) فيها حرف ((G)) علشان كده هي كلمة يونانية.",
    answer: true,
  },
  {
    id: 3_1044,
    type: "truefalse",
    question:
      "أدوات تعريف خاصة تأتي أمام الكلمات اللي مش بتبدأ بالحروف بتاعة كلمة (فيلم نور)، زي ((Ⲡ̀)) - ((Ⲧ̀)).",
    answer: true,
  },
  {
    id: 3_1043,
    type: "truefalse",
    question:
      "أدوات تعريف خاصة تأتي أمام الكلمات اللي بتبدأ بالحروف بتاعة كلمة (فيلم نور)، زي ((Ⲫ̀)) - ((Ⲑ̀)).",
    answer: true,
  },
  {
    id: 3_1042,
    type: "truefalse",
    question: "أدوات التعريف العامة هي: ((PI)) - ((})) - ((NI)).",
    answer: true,
  },
  {
    id: 3_1041,
    type: "truefalse",
    question: "كلمة ((ANZYB)) هي كلمة قبطية.",
    answer: true,
  },
  {
    id: 3_1040,
    type: "truefalse",
    question:
      "لو الكلمة انتهت بالحروف الآتية: ((AC WC YC)) - ((AN WN YN))، تبقى كلمة يونانية.",
    answer: false,
  },
  {
    id: 3_1039,
    type: "truefalse",
    question:
      "الكلمة اللي بييجي فيها حرف ((U)) بتكون كلمة يونانية زي كلمة ((UXOC)).",
    answer: true,
  },
  {
    id: 3_1036,
    type: "truefalse",
    question:
      "كلمة أرض ((KAHI)) هي كلمة يونانية علشان فيها بعض من الحروف اللي بتيجي في الكلمات اليونانية.",
    answer: false,
  },
  {
    id: 3_1035,
    type: "truefalse",
    question:
      "شعار المهرجان بالقبطي هو ((ⲧⲉⲛⲉⲣϩⲟⲩⲟ ϭⲣⲟ ⲉ̀ⲃⲟⲗ ϩⲓⲧⲉⲛ ⲫⲏⲉ̀ⲧⲁϥⲙⲉⲛⲣⲓⲧⲉⲛ)).",
    answer: true,
  },
  {
    id: 3_1034,
    type: "truefalse",
    question: "((`en Pxc? Ihc? Pen_)) هي نفسها ((`en Pi`xrictoc Ihcouc Pen_)).",
    answer: true,
  },
  {
    id: 3_1033,
    type: "truefalse",
    question:
      "معنى ((alla na\\men `ebol \\a pipet\\wou)) هو: لكن نجنا من الشرير.",
    answer: true,
  },
  {
    id: 2_1029,
    type: "mcq",
    question: "كلمة ((GY)) هي كلمة؟",
    options: ["قبطية", "يونانية"],
    answer: 1,
  },
  {
    id: 2_1030,
    type: "mcq",
    question: "حرف ((H)) (التنفسي الهائي) لو جه في أول الكلمة، بيخلي الكلمة؟",
    options: ["يونانية", "قبطية"],
    answer: 0,
  },
  {
    id: 2_1028,
    type: "mcq",
    question: "ايه هو شعار المهرجان بالعربي؟",
    options: [
      "شُكْرًا لِلَّهِ الَّذِي يُعْطِينَا النُّصْرَةَ بِرَبِّنَا يَسُوعَ الْمَسِيحِ",
      "يَعْظُمُ انْتِصَارُنَا بِالَّذِي أَحَبَّنَا",
      "فِي الْعَالَمِ سَيَكُونُ لَكُمْ ضِيقٌ، وَلكِنْ ثِقُوا: أَنَا قَدْ غَلَبْتُ الْعَالَمَ",
    ],
    answer: 1,
  },
  {
    id: 2_1027,
    type: "mcq",
    question: "يعني ايه بالقبطي: لأن لك القوة والمجد إلى الأبد آمين؟",
    options: [
      "`erwou. ouo\\ `mperenten `e'oun `epiracmoc alla",
      "Je qwk te metouro nem jom nem pi`wou ]a `ene\\. `Amhn",
      "|wn `ntenxw `ebol `nnh`ete ouon `ntan `erwou",
    ],
    answer: 1,
  },
  {
    id: 2_1026,
    type: "mcq",
    question: "يعني ايه بالقبطي: كما نحن أيضا نغفر لمن لنا عليه؟",
    options: [
      "`m`vrh;. |wn `ntenxw `ebol `nnh`ete ouon `ntan `erwou",
      "pete\\nak maref]wpi `m`vrh;",
      "'en nivhou`i mareftoubo `nje pekran",
    ],
    answer: 0,
  },
  {
    id: 3_1032,
    type: "truefalse",
    question:
      "معنى ((Penwik `nte rac; mhif nan `mvoou)) هو: خبزنا الذي للغد أعطنا اليوم.",
    answer: true,
  },
  {
    id: 3_1031,
    type: "truefalse",
    question:
      "معنى ((pete\\nak maref]wpi `m`vrh; 'en `tve nem \\ijen pika\\i)) هو: لتكن مشيئتك، كما في السماء كذلك على الأرض.",
    answer: true,
  },
  {
    id: 1_1014,
    type: "fill",
    question: "أكمل: يعني ايه ((ouo\\ `mperenten `e'oun `epiracmoc))؟ ____",
    answer: "ولا تدخلنا في تجربة",
  },
  {
    id: 1_1013,
    type: "fill",
    question: "أكمل: يعني ايه ((ouo\\ xa nhet`eron nan `ebol))؟ ____",
    answer: "واغفر لنا ذنوبنا",
  },
  {
    id: 1_1012,
    type: "fill",
    question: "أكمل: يعني ايه ((marec`i `nje tekmetouro))؟ ____",
    answer: "ليأت ملكوتك",
  },
  {
    id: 2_1021,
    type: "mcq",
    question: "يعني ايه الآلهة؟",
    options: ["((ni[oic))", "((ninou]))", "((ouka]))"],
    answer: 1,
  },
  {
    id: 3_1021,
    type: "truefalse",
    question: "كلمة {{ⲤⲞⲚⲒ}} يعني أخت.",
    answer: false,
  },
  {
    id: 3_1013,
    type: "truefalse",
    question: "كلمة نووتي ((NOUTI)) يعني إله.",
    answer: false,
  },
  {
    id: 2_1011,
    type: "mcq",
    question: "كلمة (أرض) بالقبطي؟",
    options: ["((GY))", "((GI))"],
    answer: 0,
  },
  {
    id: 2_1009,
    type: "mcq",
    question: "الحرف كى ⲭ ينطق؟",
    options: ["ج-ش-ن", "ع-ج-ك", "ك-ش-خ", "ف-ن-ع"],
    answer: 2,
  },
  {
    id: 3_1007,
    type: "truefalse",
    question:
      "في كلمة {{Eua}}، الحرف ((U)) اتنطق هنا ڤ علشان جه بعده حرف ((A)).",
    answer: false,
  },
  {
    id: 3_1029,
    type: "truefalse",
    question:
      "معنى ((ϫⲉⲙϯⲡⲓ ⲟⲥⲧⲉ ⲛⲧⲉⲧⲉⲛⲛⲁⲩ ϫⲉ ⲟⲩⲭⲣⲏⲥⲧⲟⲥ ⲡⲉ Ⲡϭⲟⲓⲥ)) هو: ذوقوا وانظروا ما أطيب الرب.",
    answer: true,
  },
  {
    id: 2_1024,
    type: "mcq",
    question: "يعني ايه ((ⲉⲩⲉⲣⲟⲩⲱⲓⲛⲓ ⲛϫⲉ ⲛⲓⲃⲁⲗ ⲛⲧⲉ ⲛⲉⲧⲉⲛϩⲏⲧ))؟",
    options: [
      "مُسْتَنِيرَةً عُيُونُ أَذْهَانِكُمْ",
      "صَابِرِينَ فِي الضِّيقِ",
      "فَرِحِينَ فِي الرَّجَاءِ",
    ],
    answer: 0,
  },
  {
    id: 2_1023,
    type: "mcq",
    question: "يعني ايه ((ⲁⲛⲟⲕ ⲡⲉ ⲡⲓⲱⲓⲕ ⲛⲧⲉ ⲡⲱⲛϧ))؟",
    options: ["انا هو خبز الحياة", "انا هو الرب الهك", "انا معك حينما تذهب"],
    answer: 0,
  },
  {
    id: 3_1028,
    type: "truefalse",
    question:
      "معنى ((Ouwnh `ebol `m`P[oic je ou`,ryctoc ou`aga;oc)) هو: اشكروا الرب لأنه صالح وخيِّر.",
    answer: true,
  },
  {
    id: 3_1027,
    type: "truefalse",
    question: "كلمة ((}PI)) يعني مذاق.",
    answer: true,
  },
  {
    id: 2_1031,
    type: "mcq",
    question: "يعني ايه ((ⲚⲈⲚⲀⲄⲄⲈⲖⲞⲤ Ⲛ̀ⲦⲈ ϮⲈⲔⲔⲖⲎⲤⲒⲀ))؟",
    options: ["خدام الكنيسة", "خدام المذبح", "ملائكة الكنيسة"],
    answer: 2,
  },
  {
    id: 3_1045,
    type: "truefalse",
    question: "{{ⲞⲨ}} أداة تنكير للمفرد، و{{ϨⲀⲚ}} أداة تنكير للجمع.",
    answer: true,
  },
  {
    id: 3_1046,
    type: "truefalse",
    question: "{{ⲠⲀⲒⲰⲦ ⲚⲈⲘ ⲦⲀⲘⲀⲨ}} يعني يوسف مع مريم.",
    answer: false,
  },
  {
    id: 3_1047,
    type: "truefalse",
    question: "كلمة {{ⲚⲈⲘⲀⲔ}} يعني معك.",
    answer: true,
  },
  {
    id: 3_1048,
    type: "truefalse",
    question: "كلمة {{ⲚⲈⲘⲰⲦⲈⲚ}} يعني معكم.",
    answer: true,
  },
  {
    id: 1_1015,
    type: "fill",
    question: "أكمل: {{Ⲡ⳪}} اختصار لكلمة ____.",
    answer: "الرب",
  },
  {
    id: 1_1016,
    type: "fill",
    question: "أكمل: {{ⲠⲬ̅Ⲥ̅}} اختصار لكلمة ____.",
    answer: "المسيح",
  },
  {
    id: 3_1049,
    type: "truefalse",
    question: "{{ⲰϢ}} فعل ماضي.",
    answer: false,
  },
  {
    id: 3_1050,
    type: "truefalse",
    question: "{{Ⲙ̀ⲠⲈⲢ}} بتتضاف عشان فعل الأمر.",
    answer: false,
  },
  {
    id: 2_1032,
    type: "mcq",
    question: "يعني ايه {{ⲀϢ}}؟",
    options: ["من - لمن - فمن", "ما - كيف - ماذا", "لماذا - كيف - من"],
    answer: 1,
  },
  {
    id: 3_1051,
    type: "truefalse",
    question: "{{ⲀϢ ⲠⲈ ⲠⲈⲦⲈⲚⲢⲀⲚ}} يعني اسمك ايه؟",
    answer: false,
  },
  {
    id: 3_1052,
    type: "truefalse",
    question: "{{ⲠⲈⲢⲀⲚ}} يعني أسماؤكم.",
    answer: false,
  },
];

const QUESTIONS_BY_DIFFICULTY = {
  easy: EASY_QUESTIONS,
  medium: MEDIUM_QUESTIONS,
  hard: HARD_QUESTIONS,
};

// قائمة مسطحة بكل الأسئلة، للأغراض العامة (العدّ، البحث) بغض النظر عن الصعوبة.
const QUESTIONS = [...EASY_QUESTIONS, ...MEDIUM_QUESTIONS, ...HARD_QUESTIONS];
