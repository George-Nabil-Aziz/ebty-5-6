const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const appTitleEl = document.getElementById("app-title");
const resultTitleEl = document.getElementById("result-title");
const quizNoticeEl = document.getElementById("quiz-notice");
const lastScoreEl = document.getElementById("last-score");
const startBtn = document.getElementById("start-btn");
const debugLastBtn = document.getElementById("debug-last-btn"); // TEMP: هيتشال بعدين
const debugPrevBtn = document.getElementById("debug-prev-btn"); // TEMP: هيتشال بعدين
const debugNextBtn = document.getElementById("debug-next-btn"); // TEMP: هيتشال بعدين
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

const EASY_QUESTIONS_LIMIT = 10;

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuizOrder() {
  const easy = shuffle(QUESTIONS.filter((q) => q.difficulty === "easy")).slice(
    0,
    EASY_QUESTIONS_LIMIT,
  );
  const rest = QUESTIONS.filter((q) => q.difficulty !== "easy");
  return [...easy, ...rest];
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
      el.appendChild(document.createTextNode(part));
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
  progressText.textContent = t("questionOf")(
    currentIndex + 1,
    quizQuestions.length,
  );
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
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    if (q.lang === "cop") input.classList.add("coptic-text");
    input.placeholder = t("fillPlaceholder");
    input.addEventListener("input", () => {
      const digitsOnly = input.value.replace(/[^0-9]/g, "");
      if (digitsOnly !== input.value) input.value = digitsOnly;
      selectedAnswer = input.value;
    });
    answerArea.appendChild(input);
  }
}

function isCorrect(q, given) {
  if (q.type === "fill") {
    if (typeof given !== "string") return false;
    return given.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  }
  return given === q.answer;
}

function handleNext() {
  const q = quizQuestions[currentIndex];
  const given = selectedAnswer;
  const correct =
    given !== null &&
    given !== undefined &&
    given !== "" &&
    isCorrect(q, given);

  userAnswers.push({ question: q, given, correct });

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
  if (q.type === "truefalse") return given ? t("true") : t("false");
  return given;
}

function formatAnswer(q) {
  if (q.type === "mcq") return q.options[q.answer];
  if (q.type === "truefalse") return q.answer ? t("true") : t("false");
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
    if (a.correct) {
      aEl.textContent = `${t("yourAnswer")}: ${formatGiven(a.question, a.given)} ✓`;
    } else {
      aEl.textContent = `${t("yourAnswer")}: ${formatGiven(a.question, a.given)} — ${t("correct")}: ${formatAnswer(a.question)}`;
    }

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
    progressText.textContent = t("questionOf")(
      currentIndex + 1,
      quizQuestions.length,
    );
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

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", renderStartScreen);

// TEMP: هيتشال بعدين
debugLastBtn.addEventListener("click", () => {
  startQuiz();
  currentIndex = quizQuestions.length - 1;
  renderQuestion();
});

debugPrevBtn.addEventListener("click", () => {
  currentIndex = Math.max(0, currentIndex - 1);
  renderQuestion();
});

debugNextBtn.addEventListener("click", () => {
  currentIndex = Math.min(quizQuestions.length - 1, currentIndex + 1);
  renderQuestion();
});

applyLanguage(currentLang);
applyTheme(localStorage.getItem(THEME_KEY) || "light");
renderStartScreen();
