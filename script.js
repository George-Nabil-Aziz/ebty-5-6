const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const appTitleEl = document.getElementById("app-title");
const resultTitleEl = document.getElementById("result-title");
const quizNoticeEl = document.getElementById("quiz-notice");
const lastScoreEl = document.getElementById("last-score");
const startBtn = document.getElementById("start-btn");
// TEMP: أدوات تجربة، هتتشال قبل الإطلاق
// خليها true عشان ترجّع أدوات التجربة (الأزرار + شريط الإجابات + id السؤال)
const DEBUG_TOOLS = false;
const debugAllBtn = document.getElementById("debug-all-btn");
const debugPrevBtn = document.getElementById("debug-prev-btn");
const debugNextBtn = document.getElementById("debug-next-btn");
const debugQuestionIdInput = document.getElementById("debug-question-id-input");
const debugGotoBtn = document.getElementById("debug-goto-btn");
const debugAnswersBar = document.getElementById("debug-answers-bar");
const progressText = document.getElementById("progress-text");
const questionText = document.getElementById("question-text");
const answerArea = document.getElementById("answer-area");
const nextBtn = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const reviewList = document.getElementById("review-list");
const restartBtn = document.getElementById("restart-btn");
const timerEl = document.getElementById("timer");
const langToggleBtn = document.getElementById("lang-toggle");
const themeToggleBtn = document.getElementById("theme-toggle");
const BEST_SCORE_KEY = "quiz_best_score";
const LAST_SCORE_KEY = "quiz_last_score";
const LAST_TOTAL_KEY = "quiz_last_total";
const LANG_KEY = "quiz_lang";
const THEME_KEY = "quiz_theme";
const QUIZ_DURATION_SECONDS = 15 * 60;

const TRUEFALSE_ICONS = { true: "✅", false: "❌" };

const LANGS = ["ar", "en", "fr"];
const LANG_LABELS = { ar: "AR", en: "EN", fr: "FR" };

const TRANSLATIONS = {
  ar: {
    dir: "rtl",
    appTitle: "الكويز",
    resultTitle: "النتيجة",
    start: "ابدأ الكويز",
    next: "التالي",
    retry: "إعادة الكويز",
    true: "صح",
    false: "غلط",
    fillPlaceholder: "اكتب إجابتك هنا",
    noAnswer: "لم تتم الإجابة",
    yourAnswer: "إجابتك",
    correct: "الصح",
    questionOf: (i, total) => `سؤال ${i} من ${total}`,
    yourScore: (score, total) => `درجتك: ${score} من ${total}`,
    lastScore: (score, total) => `آخر نتيجة: ${score}/${total}`,
    notice:
      "تنبيه: بعد ما تجاوب على أي سؤال مفيش رجوع فيه. في وقت بيعد قدره 15 دقيقة. حل على اد ما تقدر ومتخافش.",
  },
  en: {
    dir: "ltr",
    appTitle: "Quiz",
    resultTitle: "Result",
    start: "Start",
    next: "Next",
    retry: "Retry",
    true: "True",
    false: "False",
    fillPlaceholder: "Type your answer here",
    noAnswer: "No answer",
    yourAnswer: "Your answer",
    correct: "Correct",
    questionOf: (i, total) => `Question ${i} of ${total}`,
    yourScore: (score, total) => `Your score: ${score} / ${total}`,
    lastScore: (score, total) => `Last score: ${score}/${total}`,
    notice:
      "Note: once you answer a question, there's no going back. A 15-minute countdown timer is running. Answer as much as you can, and don't worry.",
  },
  fr: {
    dir: "ltr",
    appTitle: "Quiz",
    resultTitle: "Résultat",
    start: "Commencer",
    next: "Suivant",
    retry: "Recommencer",
    true: "Vrai",
    false: "Faux",
    fillPlaceholder: "Tapez votre réponse ici",
    noAnswer: "Pas de réponse",
    yourAnswer: "Votre réponse",
    correct: "Correct",
    questionOf: (i, total) => `Question ${i} sur ${total}`,
    yourScore: (score, total) => `Votre score : ${score} / ${total}`,
    lastScore: (score, total) => `Dernier score : ${score}/${total}`,
    notice:
      "Remarque : une fois que vous répondez à une question, il n'y a pas de retour en arrière. Un compte à rebours de 15 minutes est actif. Répondez du mieux que vous pouvez, sans vous inquiéter.",
  },
};

let currentLang = localStorage.getItem(LANG_KEY) || "ar";
let currentIndex = 0;
let userAnswers = [];
let selectedAnswer = null;
let timerInterval = null;
let secondsLeft = QUIZ_DURATION_SECONDS;
let quizQuestions = QUESTIONS;

// عدد الأسئلة اللي بتتسحب من كل مستوى في كل امتحان (لو المتاح أقل، بياخد المتاح).
const QUOTAS = { easy: 10, medium: 20, hard: 10 };
const LEVELS = ["easy", "medium", "hard"];

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// كل مستوى بيتخلط جوه نفسه، والمستويات بتتراكم بالترتيب: easy ثم medium ثم hard.
function buildQuizOrder() {
  return LEVELS.flatMap((level) =>
    shuffle(QUESTIONS_BY_DIFFICULTY[level]).slice(0, QUOTAS[level]),
  );
}

function t(key) {
  return TRANSLATIONS[currentLang][key];
}

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) =>
    s.classList.add("hidden"),
  );
  screen.classList.remove("hidden");
}

function getBestScore() {
  return Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
}

function setBestScore(score) {
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  }
}

function getLastScore() {
  const value = localStorage.getItem(LAST_SCORE_KEY);
  const total = localStorage.getItem(LAST_TOTAL_KEY);
  return value === null || total === null
    ? null
    : { score: Number(value), total: Number(total) };
}

function setLastScore(score, total) {
  localStorage.setItem(LAST_SCORE_KEY, String(score));
  localStorage.setItem(LAST_TOTAL_KEY, String(total));
}

function renderLastScoreText() {
  const last = getLastScore();
  lastScoreEl.textContent =
    last !== null ? t("lastScore")(last.score, last.total) : "";
}

function renderStartScreen() {
  quizNoticeEl.textContent = t("notice");
  renderLastScoreText();
  showScreen(startScreen);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function renderTimer() {
  timerEl.textContent = formatTime(Math.abs(secondsLeft));
  timerEl.classList.toggle("timer-danger", secondsLeft <= 0);
}

function startTimer() {
  clearInterval(timerInterval);
  secondsLeft = QUIZ_DURATION_SECONDS;
  renderTimer();
  timerInterval = setInterval(() => {
    secondsLeft--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function startQuiz() {
  debugBrowsing = false; // TEMP: هيتشال مع أدوات التجربة
  quizQuestions = buildQuizOrder();
  currentIndex = 0;
  userAnswers = [];
  selectedAnswer = null;
  showScreen(quizScreen);
  renderQuestion();
  startTimer();
}

function appendWithCopticMarkers(el, text) {
  text.split(/(\{\{.+?\}\}|\(\(.+?\)\))/g).forEach((part) => {
    const mainMatch = part.match(/^\{\{(.+)\}\}$/);
    const altMatch = part.match(/^\(\((.+)\)\)$/);
    if (mainMatch) {
      const span = document.createElement("span");
      span.className = "coptic-text";
      span.textContent = mainMatch[1];
      el.appendChild(span);
    } else if (altMatch) {
      const span = document.createElement("span");
      span.className = "coptic-text-alt";
      span.textContent = altMatch[1];
      el.appendChild(span);
    } else if (part) {
      part.split("\n").forEach((line, i) => {
        if (i > 0) el.appendChild(document.createElement("br"));
        if (line) el.appendChild(document.createTextNode(line));
      });
    }
  });
}

function renderQuestionText(el, q, numberPrefix) {
  el.innerHTML = "";
  if (numberPrefix) el.appendChild(document.createTextNode(numberPrefix));
  appendWithCopticMarkers(el, q.question);
  if (q.copticQuote) {
    el.appendChild(document.createElement("br"));
    const quoteEl = document.createElement("span");
    quoteEl.className = "coptic-text";
    quoteEl.textContent = q.copticQuote;
    el.appendChild(quoteEl);
  }
}

function renderQuestion() {
  selectedAnswer = null;
  const q = quizQuestions[currentIndex];
  setProgressText();
  renderDebugAnswersBar(); // TEMP: هيتشال مع أدوات التجربة
  renderQuestionText(questionText, q);
  answerArea.innerHTML = "";
  answerArea.classList.toggle("truefalse-row", q.type === "truefalse");

  if (q.type === "mcq") {
    q.options.forEach((option, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      appendWithCopticMarkers(btn, option);
      btn.addEventListener("click", () => {
        selectedAnswer = i;
        [...answerArea.children].forEach((c) => c.classList.remove("selected"));
        btn.classList.add("selected");
      });
      answerArea.appendChild(btn);
    });
  } else if (q.type === "truefalse") {
    const trueBtn = document.createElement("button");
    trueBtn.type = "button";
    trueBtn.className = "option truefalse-icon";
    trueBtn.textContent = TRUEFALSE_ICONS.true;
    const falseBtn = document.createElement("button");
    falseBtn.type = "button";
    falseBtn.className = "option truefalse-icon";
    falseBtn.textContent = TRUEFALSE_ICONS.false;

    trueBtn.addEventListener("click", () => {
      selectedAnswer = true;
      trueBtn.classList.add("selected");
      falseBtn.classList.remove("selected");
    });
    falseBtn.addEventListener("click", () => {
      selectedAnswer = false;
      falseBtn.classList.add("selected");
      trueBtn.classList.remove("selected");
    });

    answerArea.appendChild(trueBtn);
    answerArea.appendChild(falseBtn);
  } else if (q.type === "fill") {
    const isNumericAnswer = /^[0-9]+$/.test(String(q.answer).trim());
    const input = document.createElement("input");
    input.type = "text";
    if (isNumericAnswer) {
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";
    }
    if (q.lang === "cop") input.classList.add("coptic-text");
    input.placeholder = t("fillPlaceholder");
    input.addEventListener("input", () => {
      if (isNumericAnswer) {
        const digitsOnly = input.value.replace(/[^0-9]/g, "");
        if (digitsOnly !== input.value) input.value = digitsOnly;
      }
      selectedAnswer = input.value;
    });
    answerArea.appendChild(input);
  }
}

function normalizeFillAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/[ةه]/g, "ه")
    .replace(/[يى]/g, "ي")
    .replace(/^و/, "");
}

function isCorrect(q, given) {
  if (q.type === "fill") {
    if (typeof given !== "string") return false;
    return normalizeFillAnswer(given) === normalizeFillAnswer(String(q.answer));
  }
  return given === q.answer;
}

// ===== أصوات زرار "التالي" =====
// كل الأصوات متولّدة بالكود عن طريق Web Audio API، مفيش أي ملف صوت.
// مع كل دوسة على "التالي" بيتشغّل صوت عشوائي من اللستة اللي تحت،
// من غير ما يكرر نفس الصوت مرتين ورا بعض.

let audioCtx = null;

function getAudioCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// نغمة واحدة: تردد + شكل موجة + ظرف صوتي (بيعلى بسرعة وبيخفت بالتدريج).
// glideTo -> لو موجود، التردد بيتزحلق للقيمة دي خلال glideTime.
function tone(dest, opts) {
  const c = getAudioCtx();
  const {
    freq,
    type = "sine",
    peak = 0.2,
    attack = 0.008,
    decay = 0.3,
    at = 0,
    glideTo = null,
    glideTime = 0.1,
  } = opts;

  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const env = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + glideTime);

  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  osc.connect(env).connect(dest);
  osc.start(t);
  osc.stop(t + decay + 0.03);
}

// ضوضاء قصيرة مفلترة، بتستخدم في صوت الكليك والـ swoosh.
function noise(dest, opts) {
  const c = getAudioCtx();
  const {
    peak = 0.2,
    decay = 0.12,
    at = 0,
    filterType = "bandpass",
    from = 1200,
    to = null,
  } = opts;

  const t = c.currentTime + at;
  const len = Math.ceil(c.sampleRate * (decay + 0.05));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const filt = c.createBiquadFilter();
  filt.type = filterType;
  filt.Q.value = 1.2;
  filt.frequency.setValueAtTime(from, t);
  if (to) filt.frequency.exponentialRampToValueAtTime(to, t + decay);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  src.connect(filt).connect(env).connect(dest);
  src.start(t);
  src.stop(t + decay + 0.05);
}

// مخرج مفلتر بيقص الحدة الزيادة، وبيتحكم في الفوليوم العام للصوت.
function soundOut(cutoff, gain) {
  const c = getAudioCtx();
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = cutoff;
  const vol = c.createGain();
  vol.gain.value = gain;
  filt.connect(vol).connect(c.destination);
  return filt;
}

const CLICK_SOUNDS = [
  // جرس خشبي: نوتة أساسية + توافقيات بتخفت أسرع منها
  function woodBell() {
    const out = soundOut(2800, 0.9);
    tone(out, { freq: 784, type: "triangle", peak: 0.22, decay: 0.55 });
    tone(out, { freq: 1568, peak: 0.09, decay: 0.28 });
    tone(out, { freq: 2359, peak: 0.04, decay: 0.15 });
  },

  // نقطة ماء: التردد بينزل بسرعة فبيطلع زي الفقاعة
  function waterPop() {
    const out = soundOut(4000, 1);
    tone(out, {
      freq: 900,
      peak: 0.32,
      attack: 0.004,
      decay: 0.14,
      glideTo: 320,
      glideTime: 0.09,
    });
  },

  // نغمتين طالعين ورا بعض، إحساس تقدّم
  function twoNoteRise() {
    const out = soundOut(3200, 0.8);
    tone(out, { freq: 1046, type: "triangle", peak: 0.2, decay: 0.22 });
    tone(out, { freq: 1319, type: "triangle", peak: 0.22, decay: 0.45, at: 0.09 });
  },

  // جرس زجاج: نوتتين قريبين جدًا من بعض بيعملوا رنّة لامعة
  function glassBell() {
    const out = soundOut(6000, 0.7);
    tone(out, { freq: 1568, peak: 0.16, decay: 0.9 });
    tone(out, { freq: 1573, peak: 0.12, decay: 0.85 });
    tone(out, { freq: 3136, peak: 0.05, decay: 0.4 });
  },

  // كليك ميكانيكي خفيف زي كبسة الكيبورد
  function softTick() {
    const out = soundOut(9000, 1);
    noise(out, { peak: 0.28, decay: 0.05, from: 2200 });
    tone(out, { freq: 180, peak: 0.18, attack: 0.002, decay: 0.06 });
  },

  // بليب رقمي بموجة مربعة مفلترة
  function retroBlip() {
    const out = soundOut(2000, 0.6);
    tone(out, { freq: 660, type: "square", peak: 0.16, attack: 0.005, decay: 0.09 });
    tone(out, { freq: 990, type: "square", peak: 0.16, attack: 0.005, decay: 0.13, at: 0.07 });
  },

  // قلب صفحة: ضوضاء بتنزل من تردد عالي لواطي
  function pageSwoosh() {
    const c = getAudioCtx();
    const vol = c.createGain();
    vol.gain.value = 0.9;
    vol.connect(c.destination);
    noise(vol, { peak: 0.22, decay: 0.22, from: 4000, to: 500 });
  },

  // نوتة بيانو ناعمة بذيل متوسط
  function softPiano() {
    const out = soundOut(2200, 0.95);
    tone(out, { freq: 587, type: "triangle", peak: 0.2, attack: 0.01, decay: 0.7 });
    tone(out, { freq: 1174, peak: 0.07, decay: 0.35 });
    tone(out, { freq: 880, peak: 0.05, decay: 0.5 });
  },
];

let lastSoundIndex = -1;

function playClickSound() {
  try {
    if (!getAudioCtx()) return;

    // نختار صوت عشوائي، وبنعيد الاختيار لو طلع نفس صوت المرة اللي فاتت
    let index = Math.floor(Math.random() * CLICK_SOUNDS.length);
    if (CLICK_SOUNDS.length > 1 && index === lastSoundIndex) {
      index = (index + 1 + Math.floor(Math.random() * (CLICK_SOUNDS.length - 1))) % CLICK_SOUNDS.length;
    }
    lastSoundIndex = index;

    CLICK_SOUNDS[index]();
  } catch (e) {
    // لو المتصفح مش سامح بالصوت، الكويز يكمل عادي
  }
}

function handleNext() {
  playClickSound();
  const q = quizQuestions[currentIndex];
  const given = selectedAnswer;
  const correct =
    given !== null &&
    given !== undefined &&
    given !== "" &&
    isCorrect(q, given);

  userAnswers[currentIndex] = { question: q, given, correct };

  currentIndex++;
  if (currentIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function formatGiven(q, given) {
  if (given === null || given === undefined || given === "")
    return t("noAnswer");
  if (q.type === "mcq") return q.options[given] ?? t("noAnswer");
  if (q.type === "truefalse") return TRUEFALSE_ICONS[given];
  return given;
}

function formatAnswer(q) {
  if (q.type === "mcq") return q.options[q.answer];
  if (q.type === "truefalse") return TRUEFALSE_ICONS[q.answer];
  return q.answer;
}

function renderResult() {
  const score = userAnswers.filter((a) => a.correct).length;

  scoreText.textContent = t("yourScore")(score, userAnswers.length);
  reviewList.innerHTML = "";

  userAnswers.forEach((a, idx) => {
    const item = document.createElement("div");
    item.className = `review-item ${a.correct ? "correct" : "wrong"}`;

    const qEl = document.createElement("div");
    qEl.className = "q";
    renderQuestionText(qEl, a.question, `${idx + 1}. `);

    const aEl = document.createElement("div");
    aEl.className = "a";
    const line = a.correct
      ? `${t("yourAnswer")}: ${formatGiven(a.question, a.given)} ✓`
      : `${t("yourAnswer")}: ${formatGiven(a.question, a.given)} — ${t("correct")}: ${formatAnswer(a.question)}`;
    appendWithCopticMarkers(aEl, line);

    item.appendChild(qEl);
    item.appendChild(aEl);
    reviewList.appendChild(item);
  });
}

function showResult() {
  stopTimer();
  const score = userAnswers.filter((a) => a.correct).length;
  setBestScore(score);
  setLastScore(score, userAnswers.length);

  renderResult();
  showScreen(resultScreen);
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = t("dir");

  const nextLang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
  langToggleBtn.textContent = LANG_LABELS[nextLang];
  appTitleEl.textContent = t("appTitle");
  quizNoticeEl.textContent = t("notice");
  resultTitleEl.textContent = t("resultTitle");
  startBtn.textContent = t("start");
  nextBtn.textContent = t("next");
  restartBtn.textContent = t("retry");

  renderLastScoreText();

  if (!quizScreen.classList.contains("hidden")) {
    const q = quizQuestions[currentIndex];
    setProgressText();
    if (q.type === "fill") {
      answerArea.querySelector("input").placeholder = t("fillPlaceholder");
    }
  }

  if (!resultScreen.classList.contains("hidden")) {
    renderResult();
  }
}

function applyTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

langToggleBtn.addEventListener("click", () => {
  applyLanguage(LANGS[(LANGS.indexOf(currentLang) + 1) % LANGS.length]);
});

themeToggleBtn.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
});

// ===== TEMP: أدوات تجربة، هتتشال قبل الإطلاق =====
// بتعرض كل الأسئلة بترتيب الملف عشان تراجعها واحد واحد،
// من غير مؤقت، وبتوريك رقم (id) السؤال اللي إنت واقف عليه.

let debugBrowsing = false;

// 21031 -> "2_1031"، عشان الرقم يبان بنفس شكله في questions.js
function formatQuestionId(id) {
  const s = String(id);
  return s.length > 1 ? s[0] + "_" + s.slice(1) : s;
}

// TEMP: بيكتب "سؤال ١ من ٢٠" وجنبه id السؤال عشان المراجعة.
// وقت الإطلاق: شيل جزء الـ id وسيب سطر t("questionOf") بس.
function setProgressText() {
  const q = quizQuestions[currentIndex];
  const base = t("questionOf")(currentIndex + 1, quizQuestions.length);
  progressText.textContent = DEBUG_TOOLS
    ? base + "  •  id " + formatQuestionId(q.id)
    : base;
}

// شريط فوق السؤال فيه مربع لكل سؤال: أخضر لو جاوبته صح، أحمر لو غلط،
// ورمادي لو لسه. دوس على أي مربع يوديك للسؤال بتاعه على طول.
function renderDebugAnswersBar() {
  if (!DEBUG_TOOLS || !debugAnswersBar) return;

  debugAnswersBar.innerHTML = "";

  quizQuestions.forEach((q, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "debug-dot";
    dot.textContent = String(i + 1);
    dot.title = `سؤال ${i + 1} — id ${formatQuestionId(q.id)}`;

    const answered = userAnswers[i];
    if (answered) dot.classList.add(answered.correct ? "is-correct" : "is-wrong");
    if (i === currentIndex) dot.classList.add("is-current");

    dot.addEventListener("click", () => debugGoToIndex(i));
    debugAnswersBar.appendChild(dot);
  });

  const current = debugAnswersBar.children[currentIndex];
  if (current) current.scrollIntoView({ block: "nearest" });
}

function debugGoToIndex(index) {
  currentIndex = index;
  if (debugBrowsing) debugRender();
  else renderQuestion();
}

function debugRender() {
  renderQuestion();
  timerEl.textContent = "🧪";
  timerEl.classList.remove("timer-danger");
}

// startId اختياري: لو موجود بيفتح على السؤال ده بدل الأول
function debugBrowse(startId) {
  let index = 0;

  if (startId !== undefined) {
    index = QUESTIONS.findIndex((q) => q.id === startId);
    if (index < 0) {
      alert("مفيش سؤال بالرقم ده");
      return;
    }
  }

  debugBrowsing = true;
  quizQuestions = QUESTIONS;
  currentIndex = index;
  userAnswers = [];
  selectedAnswer = null;
  stopTimer();
  showScreen(quizScreen);
  debugRender();
}

function debugGoto() {
  const digits = debugQuestionIdInput.value.replace(/\D/g, "");
  if (!digits) return;
  debugBrowse(Number(digits));
}

debugAllBtn.addEventListener("click", () => debugBrowse());
debugGotoBtn.addEventListener("click", debugGoto);

debugQuestionIdInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") debugGoto();
});

debugPrevBtn.addEventListener("click", () => {
  debugGoToIndex(Math.max(0, currentIndex - 1));
});

debugNextBtn.addEventListener("click", () => {
  debugGoToIndex(Math.min(quizQuestions.length - 1, currentIndex + 1));
});

// لو الأدوات مقفولة، نخفي كل عناصرها من الصفحة
if (!DEBUG_TOOLS) {
  document
    .querySelectorAll(".debug-tools, #debug-answers-bar")
    .forEach((el) => (el.hidden = true));
}
// ===== نهاية أدوات التجربة =====

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", renderStartScreen);

applyLanguage(currentLang);
applyTheme(localStorage.getItem(THEME_KEY) || "light");
renderStartScreen();
