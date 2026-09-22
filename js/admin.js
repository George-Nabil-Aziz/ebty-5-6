// منطق صفحة الأدمن.
// "أدمن" = "مسجّل دخول" — مفيش أدوار ولا صلاحيات، لأن فيه حساب واحد بس.
// الحماية الحقيقية في سياسات RLS اللي في db/schema.sql، مش في الكود ده.

const loginSection = document.getElementById("admin-login");
const mainSection = document.getElementById("admin-main");
const errorEl = document.getElementById("admin-error");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("admin-login-btn");

const TAB_IDS = ["add", "list", "attempts", "stats"];

function adminError(message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("hidden", !message);
}

function showAdminTab(name) {
  adminError("");
  TAB_IDS.forEach((id) => {
    document.getElementById("tab-" + id).classList.toggle("hidden", id !== name);
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });

  if (name === "add") renderAddTab();
  if (name === "list") renderListTab();
  if (name === "attempts") renderAttemptsTab();
  if (name === "stats") renderStatsTab();
}

function showLoggedIn(isLoggedIn) {
  loginSection.classList.toggle("hidden", isLoggedIn);
  mainSection.classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) showAdminTab("add");
}

loginBtn.addEventListener("click", async () => {
  adminError("");
  loginBtn.disabled = true;
  try {
    const { error } = await db.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    if (error) {
      adminError("الإيميل أو الباسورد غلط.");
      return;
    }
    passwordInput.value = "";
    showLoggedIn(true);
  } finally {
    loginBtn.disabled = false;
  }
});

document.getElementById("admin-logout-btn").addEventListener("click", async () => {
  await db.auth.signOut();
  showLoggedIn(false);
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => showAdminTab(btn.dataset.tab));
});

const TYPE_LABELS = {
  mcq: "اختيار من متعدد",
  truefalse: "صح وغلط",
  fill: "أكمل",
};
const DIFFICULTY_LABELS = { easy: "سهل", medium: "متوسط", hard: "صعب" };

// ===================== تبويب: إضافة / تعديل سؤال =====================

// السؤال اللي بنعدله دلوقتي، أو null لو بنضيف جديد.
let editingQuestion = null;

function renderAddTab() {
  const q = editingQuestion;
  const container = document.getElementById("tab-add");

  container.innerHTML = `
    <h2>${q ? "تعديل سؤال " + formatQuestionId(q.id) : "إضافة سؤال جديد"}</h2>

    <label for="q-type">النوع</label>
    <select id="q-type">
      <option value="mcq">اختيار من متعدد</option>
      <option value="truefalse">صح وغلط</option>
      <option value="fill">أكمل</option>
    </select>

    <label for="q-text">نص السؤال</label>
    <textarea id="q-text" rows="3"></textarea>
    <p class="admin-hint">
      حط الحرف القبطي بين قوسين مزدوجين — مثال: الحرف {{ⲑ}} ينطق إزاي؟<br />
      لو الرمز مش باين صح استخدم (( )) بدل {{ }}، دي بتستخدم الخط القبطي التاني.
    </p>

    <div id="q-answer-area"></div>

    <label for="q-difficulty">الصعوبة</label>
    <select id="q-difficulty">
      <option value="easy">سهل</option>
      <option value="medium">متوسط</option>
      <option value="hard">صعب</option>
    </select>

    <label><input type="checkbox" id="q-cop-lang" /> نص السؤال كله قبطي</label>
    <p class="admin-hint">
      علّمها لو السؤال نفسه مكتوب بالقبطي كله. لحرف أو رمز جوه جملة عربية
      استخدم {{ }} بدل ما تعلّمها.
    </p>

    <h3>معاينة</h3>
    <div id="q-preview"></div>

    <button id="q-save" class="btn primary" type="button">حفظ السؤال</button>
    <button id="q-cancel" class="btn ${q ? "" : "hidden"}" type="button">إلغاء التعديل</button>
  `;

  const typeSelect = document.getElementById("q-type");
  const textArea = document.getElementById("q-text");

  if (q) {
    typeSelect.value = q.type;
    textArea.value = q.question;
    document.getElementById("q-difficulty").value = q.difficulty;
    document.getElementById("q-cop-lang").checked = q.lang === "cop";
  }

  renderAnswerFields(q);
  renderPreview();

  // تغيير النوع بيمسح الإجابة القديمة لأنها مش بتنفع للنوع الجديد
  typeSelect.addEventListener("change", () => {
    renderAnswerFields(null);
    renderPreview();
  });
  textArea.addEventListener("input", renderPreview);
  document.getElementById("q-save").addEventListener("click", saveFromForm);
  document.getElementById("q-cancel").addEventListener("click", () => {
    editingQuestion = null;
    renderAddTab();
  });
}

// خانات الإجابة بتتغير حسب النوع.
function renderAnswerFields(q) {
  const type = document.getElementById("q-type").value;
  const area = document.getElementById("q-answer-area");

  if (type === "mcq") {
    area.innerHTML = `
      <label>الاختيارات (علّم على الصح)</label>
      <div id="q-options"></div>
      <button id="q-add-option" class="btn" type="button">+ اختيار</button>
    `;
    const options = q && q.options ? q.options : ["", ""];
    options.forEach((text, i) =>
      addOptionRow(text, q ? q.answer === i : i === 0),
    );
    document
      .getElementById("q-add-option")
      .addEventListener("click", () => addOptionRow("", false));
  } else if (type === "truefalse") {
    area.innerHTML = `
      <label for="q-tf-answer">الإجابة الصح</label>
      <select id="q-tf-answer">
        <option value="true">صح</option>
        <option value="false">غلط</option>
      </select>
    `;
    if (q) document.getElementById("q-tf-answer").value = String(q.answer);
  } else {
    area.innerHTML = `
      <label for="q-fill-answer">الإجابة الصح</label>
      <input id="q-fill-answer" type="text" />
      <p class="admin-hint">
        المقارنة بتتجاهل حالة الأحرف والمسافات الزيادة، وبتعامل أ/إ/آ/ا زي بعض،
        وه/ة زي بعض، وي/ى زي بعض.
      </p>
    `;
    if (q) document.getElementById("q-fill-answer").value = String(q.answer);
  }
}

function addOptionRow(text, isCorrect) {
  const row = document.createElement("div");
  row.className = "option-row";

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "q-correct";
  radio.checked = isCorrect;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "option-text";
  input.value = text;

  row.appendChild(radio);
  row.appendChild(input);
  document.getElementById("q-options").appendChild(row);
}

// معاينة بالخط القبطي، بتستخدم نفس دالة فك الترميز اللي في الامتحان.
function renderPreview() {
  const preview = document.getElementById("q-preview");
  if (!preview) return;
  preview.innerHTML = "";
  appendWithCopticMarkers(preview, document.getElementById("q-text").value);
}

// بيقرا الفورم ويرجّع سؤال، أو يرمي غلطة برسالة واضحة.
function readFormQuestion() {
  const type = document.getElementById("q-type").value;
  const question = document.getElementById("q-text").value.trim();
  if (!question) throw new Error("اكتب نص السؤال.");

  const base = { type, question };
  if (document.getElementById("q-cop-lang").checked) base.lang = "cop";

  if (type === "mcq") {
    const rows = [...document.querySelectorAll(".option-row")];
    const options = rows.map((r) => r.querySelector(".option-text").value.trim());
    if (options.length < 2) throw new Error("لازم اختيارين على الأقل.");
    if (options.some((o) => !o)) throw new Error("فيه اختيار فاضي.");
    const answer = rows.findIndex(
      (r) => r.querySelector("input[type=radio]").checked,
    );
    if (answer < 0) throw new Error("علّم على الإجابة الصح.");
    return { ...base, options, answer };
  }

  if (type === "truefalse") {
    return {
      ...base,
      answer: document.getElementById("q-tf-answer").value === "true",
    };
  }

  const answer = document.getElementById("q-fill-answer").value.trim();
  if (!answer) throw new Error("اكتب الإجابة الصح.");
  return { ...base, answer };
}

async function saveFromForm() {
  adminError("");
  const saveBtn = document.getElementById("q-save");
  saveBtn.disabled = true;
  try {
    const q = readFormQuestion();
    q.id = editingQuestion
      ? editingQuestion.id
      : nextQuestionId(q.type, await fetchMaxQuestionId(q.type));

    const row = questionToRow(q, document.getElementById("q-difficulty").value);
    // التعديل ميرجّعش سؤال مخفي للظهور من غير قصد
    if (editingQuestion) row.active = editingQuestion.active;

    await saveQuestion(row);
    editingQuestion = null;
    alert("اتحفظ. رقم السؤال " + formatQuestionId(row.id));
    renderAddTab();
  } catch (e) {
    adminError(e.message);
  } finally {
    saveBtn.disabled = false;
  }
}

// ===================== تبويب: كل الأسئلة =====================

async function renderListTab() {
  const container = document.getElementById("tab-list");
  container.innerHTML = "<p>جاري التحميل...</p>";
  try {
    const rows = await fetchAllQuestions();
    container.innerHTML = `
      <h2>كل الأسئلة (${rows.length})</h2>
      <input id="q-search" type="text" placeholder="بحث في نص السؤال" />
      <div id="q-list"></div>
    `;

    const listEl = document.getElementById("q-list");

    function draw(filter) {
      listEl.innerHTML = "";
      const shown = rows.filter((r) => !filter || r.question.includes(filter));
      if (shown.length === 0) {
        listEl.innerHTML = "<p>مفيش سؤال مطابق.</p>";
        return;
      }
      shown.forEach((r) => listEl.appendChild(buildQuestionRow(r)));
    }

    draw("");
    document
      .getElementById("q-search")
      .addEventListener("input", (e) => draw(e.target.value.trim()));
  } catch (e) {
    adminError(e.message);
  }
}

function buildQuestionRow(r) {
  const row = document.createElement("div");
  row.className = "admin-row";

  const left = document.createElement("div");
  const title = document.createElement("div");
  appendWithCopticMarkers(title, r.question);
  const meta = document.createElement("small");
  meta.textContent =
    `${formatQuestionId(r.id)} · ${TYPE_LABELS[r.type]} · ` +
    `${DIFFICULTY_LABELS[r.difficulty]}${r.active ? "" : " · مخفي"}`;
  left.appendChild(title);
  left.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "row-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn";
  editBtn.textContent = "تعديل";
  editBtn.addEventListener("click", () => {
    editingQuestion = r;
    showAdminTab("add");
  });

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "btn";
  toggleBtn.textContent = r.active ? "إخفاء" : "إظهار";
  toggleBtn.addEventListener("click", async () => {
    toggleBtn.disabled = true;
    try {
      await setQuestionActive(r.id, !r.active);
      renderListTab();
    } catch (e) {
      adminError(e.message);
      toggleBtn.disabled = false;
    }
  });

  actions.appendChild(editBtn);
  actions.appendChild(toggleBtn);

  row.appendChild(left);
  row.appendChild(actions);
  return row;
}

// ===================== تبويب: المحاولات =====================

const TRUEFALSE_LABELS = { true: "✅ صح", false: "❌ غلط" };

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("ar-EG", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatScore(a) {
  return a.finished_at ? `${a.score} / ${a.total}` : "ما خلصش";
}

// إجابة الطالب بشكل مقروء
function displayGiven(q, given) {
  if (given === null || given === undefined) return "لم تتم الإجابة";
  if (q.type === "mcq") return q.options[given] ?? "لم تتم الإجابة";
  if (q.type === "truefalse") return TRUEFALSE_LABELS[given];
  return String(given);
}

function displayCorrect(q) {
  if (q.type === "mcq") return q.options[q.answer];
  if (q.type === "truefalse") return TRUEFALSE_LABELS[q.answer];
  return String(q.answer);
}

async function renderAttemptsTab() {
  const container = document.getElementById("tab-attempts");
  container.innerHTML = `
    <h2>المحاولات</h2>
    <input id="attempt-search" type="text" placeholder="بحث بالاسم" />
    <div id="attempt-list"><p>جاري التحميل...</p></div>
  `;

  const listEl = document.getElementById("attempt-list");

  async function draw(nameFilter) {
    listEl.innerHTML = "<p>جاري التحميل...</p>";
    try {
      const rows = await fetchAttempts(nameFilter);
      listEl.innerHTML = "";
      if (rows.length === 0) {
        listEl.innerHTML = nameFilter
          ? "<p>مفيش محاولة بالاسم ده.</p>"
          : "<p>مفيش محاولات لسه.</p>";
        return;
      }
      rows.forEach((a) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "admin-row";

        const name = document.createElement("strong");
        name.textContent = a.student_name;

        const meta = document.createElement("span");
        meta.textContent = `${formatDateTime(a.started_at)} — ${formatScore(a)}`;

        btn.appendChild(name);
        btn.appendChild(meta);
        btn.addEventListener("click", () => showAttemptDetail(a));
        listEl.appendChild(btn);
      });
    } catch (e) {
      adminError(e.message);
      listEl.innerHTML = "";
    }
  }

  // تأخير بسيط عشان ميضربش استعلام مع كل حرف
  let searchTimer = null;
  document.getElementById("attempt-search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const value = e.target.value.trim();
    searchTimer = setTimeout(() => draw(value), 300);
  });

  draw("");
}

async function showAttemptDetail(attempt) {
  const container = document.getElementById("tab-attempts");
  container.innerHTML = "<p>جاري التحميل...</p>";
  try {
    const answers = await fetchAttemptAnswers(attempt.id);

    container.innerHTML = "";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "btn";
    back.textContent = "‹ رجوع للمحاولات";
    back.addEventListener("click", renderAttemptsTab);
    container.appendChild(back);

    const head = document.createElement("h2");
    head.textContent =
      `${attempt.student_name} — ${formatDateTime(attempt.started_at)} — ` +
      formatScore(attempt);
    container.appendChild(head);

    if (answers.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "المحاولة دي مفيهاش أي إجابة.";
      container.appendChild(empty);
      return;
    }

    answers.forEach((a) => {
      const q = a.questions;
      const item = document.createElement("div");
      item.className = `review-item ${a.is_correct ? "correct" : "wrong"}`;

      const qEl = document.createElement("div");
      qEl.className = "q";
      appendWithCopticMarkers(
        qEl,
        `${a.is_correct ? "✅" : "❌"} ${a.position}. ${q.question}`,
      );

      const aEl = document.createElement("div");
      aEl.className = "a";
      const line = a.is_correct
        ? `إجابته: ${displayGiven(q, a.given_answer)}`
        : `إجابته: ${displayGiven(q, a.given_answer)} — الصح: ${displayCorrect(q)}`;
      appendWithCopticMarkers(aEl, line);

      item.appendChild(qEl);
      item.appendChild(aEl);
      container.appendChild(item);
    });
  } catch (e) {
    adminError(e.message);
  }
}

// ===================== تبويب: أصعب الأسئلة =====================

// أقل عدد إجابات عشان النسبة يبقى ليها معنى
const MIN_ANSWERS_FOR_STATS = 5;

async function renderStatsTab() {
  const container = document.getElementById("tab-stats");
  container.innerHTML = "<p>جاري التحميل...</p>";
  try {
    const rows = await fetchQuestionStats(MIN_ANSWERS_FOR_STATS);

    container.innerHTML = `
      <h2>أصعب الأسئلة على الناس</h2>
      <p class="admin-hint">
        مرتبة بنسبة الغلط. الأسئلة اللي اتجاوبت أقل من
        ${MIN_ANSWERS_FOR_STATS} مرات مش ظاهرة هنا، لأن النسبة ساعتها مالهاش معنى.
      </p>
      <div id="stats-list"></div>
    `;

    const listEl = document.getElementById("stats-list");
    if (rows.length === 0) {
      listEl.innerHTML = "<p>لسه مفيش إجابات كفاية عشان تطلع إحصائية.</p>";
      return;
    }

    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "admin-row";

      const left = document.createElement("div");
      const title = document.createElement("div");
      appendWithCopticMarkers(title, r.question);
      const meta = document.createElement("small");
      meta.textContent = `${formatQuestionId(r.id)} · ${DIFFICULTY_LABELS[r.difficulty]}`;
      left.appendChild(title);
      left.appendChild(meta);

      const pct = document.createElement("strong");
      pct.textContent = `غلط ${r.wrong_pct}٪ (${r.times_wrong}/${r.times_answered})`;

      row.appendChild(left);
      row.appendChild(pct);
      listEl.appendChild(row);
    });
  } catch (e) {
    adminError(e.message);
  }
}

// الجلسة محفوظة في localStorage، فلو داخل من قبل مبيسألش تاني.
db.auth.getSession().then(({ data }) => showLoggedIn(Boolean(data.session)));
