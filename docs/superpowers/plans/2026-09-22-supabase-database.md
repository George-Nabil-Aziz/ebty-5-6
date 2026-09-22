# Supabase Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** تحويل الكويز من موقع ساكن بأسئلة مكتوبة في ملف JS إلى نظام على النت بقاعدة بيانات Supabase، بيسجل اسم كل طالب وكل إجاباته، وبصفحة أدمن لإدارة الأسئلة ومراجعة النتايج.

**Architecture:** المشروع بيفضل ملفات ساكنة (HTML/CSS/JS عادي، من غير `npm` ولا build). مكتبة `supabase-js` بتتجاب من CDN كـ `<script>` عادي وبتدي متغير عام `supabase`. كل كود الداتابيز في `js/db.js` لوحده، والدوال الخالصة (اللي مالهاش علاقة بالشاشة ولا بالشبكة) في `js/lib/quiz-core.js` عشان تتختبر. الحماية كلها بـ Row Level Security جوه Postgres، مش بكود في المتصفح.

**Tech Stack:** Vanilla JS (ES2020, no modules — plain `<script>` globals) · Supabase (Postgres + PostgREST + GoTrue Auth) · `@supabase/supabase-js@2` من jsDelivr CDN · اختبارات في صفحة متصفح من غير أي مكتبة.

**Spec:** [`docs/superpowers/specs/2026-09-22-quiz-database-design.md`](../specs/2026-09-22-quiz-database-design.md)

## Global Constraints

- **مفيش `npm`، مفيش `package.json`، مفيش build step.** أي مكتبة بتتجاب من CDN بـ `<script>`. ده قرار في الـ spec (البند ٤).
- **مفيش ES modules.** كل ملفات JS بتتحمل بـ `<script src>` عادي وبتعرّف متغيرات عامة، زي باقي المشروع.
- **التعليقات بالعربي، أسماء الكود بالإنجليزي** — زي المتبع في `js/script.js` و`js/questions.js`.
- **مفتاح `anon` بس في الكود.** مفتاح `service_role` ممنوع منعاً باتاً يتكتب في أي ملف في الـ repo.
- **ترميز الخط القبطي `{{ ... }}` و `(( ... ))`** بيتخزن في الداتابيز نصاً كما هو، وبيتفكّ عند العرض بـ `appendWithCopticMarkers` الموجودة. مفيش تغيير في الترميز.
- **`id` السؤال:** `prefix * 10000 + counter`، حيث `fill = 1`, `mcq = 2`, `truefalse = 3`، والعداد بيبدأ من `1001`.
- **حصص الامتحان:** `QUOTAS = { easy: 10, medium: 20, hard: 10 }` — تفضل زي ما هي في `js/script.js`.
- **تسجيل إجابات الطالب best-effort.** أي فشل في الشبكة بيتسجل في `console.warn` ومبيوقفش الامتحان على الطالب أبداً.
- كل commit بينتهي بـ `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

---

## ⚠️ Task 0: خطوات يدوية لازم جورج يعملها (بتعطّل Tasks 3+)

مش ممكن أعملها بدالك — محتاجة حسابك على Supabase.

- [ ] **Step 1: اعمل مشروع على Supabase**

روح [supabase.com](https://supabase.com) → New project. اختار أقرب region (Frankfurt أو London).

- [ ] **Step 2: هات الـ URL والمفتاح العام**

من Project Settings → API، انسخ:
- `Project URL` (شكله `https://abcdefgh.supabase.co`)
- `anon` `public` key (نص طويل بيبدأ بـ `eyJ`)

⚠️ **متنسخش** `service_role` key. ده بيتخطى كل قواعد الحماية ولازم يفضل سر.

- [ ] **Step 3: شغّل ملف الجداول**

بعد ما Task 1 يخلص، افتح SQL Editor في Supabase، الصق محتوى `db/schema.sql` كله، ودوس Run.

- [ ] **Step 4: اعمل حساب الأدمن**

Authentication → Users → Add user → اكتب إيميلك وباسورد قوي، وفعّل "Auto Confirm User".

- [ ] **Step 5: اقفل التسجيل الذاتي**

Authentication → Sign In / Providers → Email → اقفل **Allow new users to sign up**. من غير الخطوة دي أي حد يقدر يعمل لنفسه حساب أدمن.

- [ ] **Step 6: حط القيم في `js/config.js`**

بعد ما Task 2 يخلص، حط الـ URL والمفتاح في الملف.

---

## Task 1: ملف الجداول والصلاحيات

**Files:**
- Create: `db/schema.sql`

**Interfaces:**
- Produces: الجداول `questions`, `attempts`, `attempt_answers`، والعرض `question_stats`، وسياسات RLS. كل الـ tasks اللي بعده بتعتمد على أسماء الأعمدة دي.

- [ ] **Step 1: اكتب `db/schema.sql`**

```sql
-- =====================================================================
-- جداول كويز اللغة القبطية
-- شغّل الملف ده مرة واحدة من SQL Editor في Supabase.
-- الملف idempotent — تقدر تشغله تاني من غير ما يكسر حاجة.
-- =====================================================================

-- ---------- الأسئلة ----------
-- id شكله X_XXXX: الرقم الأول هو النوع (1 أكمل، 2 اختيار، 3 صح وغلط)
-- والباقي ترقيم متسلسل لكل نوع لوحده. الصعوبة مش داخلة في الرقم عن قصد،
-- عشان تنقل سؤال بين المستويات من غير ما ترقمه من أول.
create table if not exists questions (
  id          bigint primary key,
  type        text not null check (type in ('mcq', 'truefalse', 'fill')),
  difficulty  text not null check (difficulty in ('easy', 'medium', 'hard')),
  question    text not null,
  options     jsonb,
  answer      jsonb not null,
  lang        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists questions_active_difficulty_idx
  on questions (difficulty) where active;

-- ---------- المحاولات ----------
-- id بيتولّد في متصفح الطالب (crypto.randomUUID) قبل الإضافة، مش في الداتابيز،
-- لأن الطالب ممنوع من القراءة فمش هيقدر يستقبله بعد الإضافة.
create table if not exists attempts (
  id            uuid primary key,
  student_name  text not null check (length(trim(student_name)) between 1 and 60),
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  score         integer,
  total         integer
);

create index if not exists attempts_started_at_idx on attempts (started_at desc);

-- ---------- الإجابات ----------
-- سطر لكل سؤال في كل محاولة. position هو ترتيب السؤال في امتحان الطالب ده.
create table if not exists attempt_answers (
  id           bigserial primary key,
  attempt_id   uuid not null references attempts(id) on delete cascade,
  question_id  bigint not null references questions(id),
  position     integer not null,
  given_answer jsonb,
  is_correct   boolean not null,
  answered_at  timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists attempt_answers_question_idx
  on attempt_answers (question_id);

-- =====================================================================
-- الصلاحيات
-- الفكرة: الطالب بيدخل من غير تسجيل دخول (anon)، وجورج هو الوحيد اللي
-- بيسجل دخول (authenticated). يعني "أدمن" = "مسجّل دخول".
-- =====================================================================

alter table questions       enable row level security;
alter table attempts        enable row level security;
alter table attempt_answers enable row level security;

drop policy if exists read_active_questions    on questions;
drop policy if exists admin_manages_questions  on questions;
drop policy if exists anyone_inserts_attempt   on attempts;
drop policy if exists anyone_finishes_attempt  on attempts;
drop policy if exists admin_reads_attempts     on attempts;
drop policy if exists anyone_inserts_answer    on attempt_answers;
drop policy if exists admin_reads_answers      on attempt_answers;

-- الأسئلة: أي حد يقرا النشط منها
create policy read_active_questions on questions
  for select to anon, authenticated using (active);

-- الأسئلة: الأدمن يعمل أي حاجة، بما فيها قراءة المخفي
create policy admin_manages_questions on questions
  for all to authenticated using (true) with check (true);

-- المحاولات: أي حد يسجل محاولة
create policy anyone_inserts_attempt on attempts
  for insert to anon, authenticated with check (true);

-- المحاولات: يقدر يقفل محاولته (يكتب الدرجة) طالما لسه ما خلصتش.
-- محدش يقدر يعدل محاولة غيره لأنه لازم يعرف الـ uuid بتاعها، وهو غير قابل للتخمين.
create policy anyone_finishes_attempt on attempts
  for update to anon, authenticated
  using (finished_at is null) with check (true);

-- المحاولات: الأدمن بس يقراها
create policy admin_reads_attempts on attempts
  for select to authenticated using (true);

-- الإجابات: أي حد يضيف، الأدمن بس يقرا
create policy anyone_inserts_answer on attempt_answers
  for insert to anon, authenticated with check (true);

create policy admin_reads_answers on attempt_answers
  for select to authenticated using (true);

-- =====================================================================
-- إحصائية: نسبة الغلط لكل سؤال
-- security_invoker يعني إن صلاحيات القارئ هي اللي بتتطبق، فالطالب
-- مش هيقدر يقرا منه لأنه ممنوع من قراءة attempt_answers أصلاً.
-- =====================================================================

create or replace view question_stats with (security_invoker = true) as
select
  q.id,
  q.question,
  q.difficulty,
  count(*)                                   as times_answered,
  count(*) filter (where not aa.is_correct)  as times_wrong,
  round(100.0 * count(*) filter (where not aa.is_correct) / count(*))
                                             as wrong_pct
from attempt_answers aa
join questions q on q.id = aa.question_id
group by q.id, q.question, q.difficulty;
```

- [ ] **Step 2: تحقق من الصياغة**

مفيش `psql` في المشروع، فالتحقق بصري: اقرا الملف وتأكد إن كل `create table` ليه `if not exists`، وكل `create policy` مسبوق بـ `drop policy if exists` بنفس الاسم بالظبط.

Run: `grep -c "drop policy if exists" db/schema.sql` → Expected: `7`
Run: `grep -c "^create policy" db/schema.sql` → Expected: `7`

- [ ] **Step 3: Commit**

```bash
git add db/schema.sql
git commit -m "Add Supabase schema with RLS policies and stats view"
```

- [ ] **Step 4: قول لجورج يشغّل الملف**

قف هنا واطلب منه ينفذ Steps 1-5 من Task 0. الـ tasks اللي بعد Task 2 مش هينفعوا يتجربوا من غيرها.

---

## Task 2: الإعدادات، الدوال الخالصة، واختباراتها

**Files:**
- Create: `js/config.js`
- Create: `js/lib/quiz-core.js`
- Create: `js/db.js`
- Create: `dev/tests.html`

**Interfaces:**
- Consumes: أسماء أعمدة الجداول من Task 1.
- Produces:
  - `SUPABASE_URL: string`, `SUPABASE_ANON_KEY: string` (globals من `config.js`)
  - `QUESTION_TYPE_PREFIX: { fill: 1, mcq: 2, truefalse: 3 }`
  - `rowToQuestion(row: object) -> { id, type, question, options?, answer, lang? }`
  - `questionToRow(q: object, difficulty: string) -> object`
  - `nextQuestionId(type: string, currentMaxId: number|null) -> number`
  - `formatQuestionId(id: number) -> string` (مثال: `21001` → `"2_1001"`)
  - `db` — عميل Supabase (global من `db.js`)
  - `fetchQuestionsByDifficulty() -> Promise<{easy: [], medium: [], hard: []}>`
  - `createAttempt(studentName: string, total: number) -> Promise<string>` (بيرجع uuid)
  - `recordAnswer(attemptId, questionId, position, given, correct) -> Promise<void>`
  - `finishAttempt(attemptId, score, total) -> Promise<void>`

- [ ] **Step 1: اكتب صفحة الاختبارات الفاشلة `dev/tests.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>اختبارات</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; line-height: 1.8; }
      .pass { color: #0a7d32; }
      .fail { color: #c02626; font-weight: bold; }
      pre  { background: #f4f4f4; padding: 8px; overflow-x: auto; }
    </style>
  </head>
  <body>
    <h1>اختبارات الدوال الخالصة</h1>
    <p>افتح الصفحة دي في المتصفح. كل سطر أخضر يعني نجح، وأحمر يعني فشل.</p>
    <div id="out"></div>

    <script src="../js/lib/quiz-core.js"></script>
    <script>
      // عدّاد بسيط بدل مكتبة اختبارات — المشروع من غير npm عن قصد.
      let passed = 0;
      let failed = 0;

      function test(name, fn) {
        const line = document.createElement("div");
        try {
          fn();
          passed++;
          line.className = "pass";
          line.textContent = "✅ " + name;
        } catch (e) {
          failed++;
          line.className = "fail";
          line.textContent = "❌ " + name + " — " + e.message;
        }
        document.getElementById("out").appendChild(line);
      }

      function assertEqual(actual, expected, label) {
        const a = JSON.stringify(actual);
        const b = JSON.stringify(expected);
        if (a !== b) {
          throw new Error(`${label || ""} المتوقع ${b} والفعلي ${a}`);
        }
      }

      // ===== rowToQuestion: سطر من الداتابيز -> سؤال زي ما script.js متوقعه =====

      test("rowToQuestion: سؤال اختيار من متعدد", () => {
        assertEqual(
          rowToQuestion({
            id: 21001, type: "mcq", difficulty: "easy",
            question: "الأبجدية القبطية تتكون من كام حرف؟",
            options: ["32", "34", "36", "38"], answer: 0,
            lang: null, active: true,
          }),
          {
            id: 21001, type: "mcq",
            question: "الأبجدية القبطية تتكون من كام حرف؟",
            options: ["32", "34", "36", "38"], answer: 0,
          },
        );
      });

      test("rowToQuestion: صح وغلط مالوش options", () => {
        const q = rowToQuestion({
          id: 31001, type: "truefalse", difficulty: "easy",
          question: "الأبجدية القبطية حروفها متحركة وساكنة بس.",
          options: null, answer: false, lang: null, active: true,
        });
        assertEqual(q.answer, false, "الإجابة");
        assertEqual("options" in q, false, "مفيش مفتاح options");
      });

      test("rowToQuestion: بيحافظ على lang لما تكون cop", () => {
        const q = rowToQuestion({
          id: 11001, type: "fill", difficulty: "hard",
          question: "اكتب الحرف", options: null,
          answer: "ⲑ", lang: "cop", active: true,
        });
        assertEqual(q.lang, "cop", "اللغة");
      });

      test("rowToQuestion: مبيحطش lang لما تكون null", () => {
        const q = rowToQuestion({
          id: 11002, type: "fill", difficulty: "easy",
          question: "اكمل", options: null, answer: "ابانوب",
          lang: null, active: true,
        });
        assertEqual("lang" in q, false, "مفيش مفتاح lang");
      });

      test("rowToQuestion: بيحافظ على ترميز الحروف القبطية كما هو", () => {
        const q = rowToQuestion({
          id: 21002, type: "mcq", difficulty: "easy",
          question: "الحرف {{ⲑ}} ينطق إزاي؟ و ((:)) كمان",
          options: ["ث", "ت"], answer: 0, lang: null, active: true,
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
            id: 21001, type: "mcq", difficulty: "medium", question: "س",
            options: ["أ", "ب"], answer: 1, lang: null, active: true,
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

      const summary = document.createElement("h2");
      summary.textContent = `نجح ${passed} — فشل ${failed}`;
      summary.className = failed === 0 ? "pass" : "fail";
      document.getElementById("out").appendChild(summary);
    </script>
  </body>
</html>
```

- [ ] **Step 2: شغّل الاختبارات وتأكد إنها بتفشل**

افتح `dev/tests.html` في المتصفح.
Expected: كل السطور حمرا، ورسايل زي `rowToQuestion is not defined` (لأن `js/lib/quiz-core.js` لسه مش موجود).

- [ ] **Step 3: اكتب `js/lib/quiz-core.js`**

```js
// دوال خالصة: مالهاش علاقة بالشاشة ولا بالشبكة، فبتتختبر لوحدها في dev/tests.html.
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
```

- [ ] **Step 4: شغّل الاختبارات وتأكد إنها بتنجح**

افتح `dev/tests.html` تاني (اعمل hard refresh).
Expected: `نجح 12 — فشل 0` بالأخضر.

- [ ] **Step 5: اكتب `js/config.js`**

```js
// إعدادات Supabase.
// المفتاح ده عام (anon) ومصمم أصلاً إنه يبقى ظاهر في المتصفح — الحماية الحقيقية
// في قواعد RLS جوه Supabase مش في إخفاء المفتاح.
// ⚠️ متحطش هنا أبداً مفتاح service_role، ده بيتخطى كل قواعد الحماية.
const SUPABASE_URL = "PUT_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PUT_YOUR_ANON_PUBLIC_KEY_HERE";
```

- [ ] **Step 6: اكتب `js/db.js`**

```js
// كل تعامل مع الداتابيز في الملف ده لوحده.
// بيعتمد على: supabase (من CDN)، SUPABASE_URL و SUPABASE_ANON_KEY (config.js)،
// و rowToQuestion (quiz-core.js).

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- الأسئلة ----------

// بيجيب الأسئلة النشطة مقسومة على المستويات، بنفس شكل QUESTIONS_BY_DIFFICULTY القديم.
async function fetchQuestionsByDifficulty() {
  const { data, error } = await db
    .from("questions")
    .select("id, type, difficulty, question, options, answer, lang")
    .eq("active", true);
  if (error) throw error;

  const byDifficulty = { easy: [], medium: [], hard: [] };
  data.forEach((row) => {
    if (byDifficulty[row.difficulty]) {
      byDifficulty[row.difficulty].push(rowToQuestion(row));
    }
  });
  return byDifficulty;
}

// ---------- المحاولات ----------

// بيولّد الـ id في المتصفح لأن الطالب ممنوع من القراءة فمش هيقدر يستقبله من السيرفر.
async function createAttempt(studentName, total) {
  const id = crypto.randomUUID();
  const { error } = await db.from("attempts").insert({
    id,
    student_name: studentName.trim(),
    total,
  });
  if (error) throw error;
  return id;
}

async function recordAnswer(attemptId, questionId, position, given, correct) {
  const { error } = await db.from("attempt_answers").insert({
    attempt_id: attemptId,
    question_id: questionId,
    position,
    given_answer: given === undefined || given === "" ? null : given,
    is_correct: correct,
  });
  if (error) throw error;
}

async function finishAttempt(attemptId, score, total) {
  const { error } = await db
    .from("attempts")
    .update({ finished_at: new Date().toISOString(), score, total })
    .eq("id", attemptId);
  if (error) throw error;
}
```

- [ ] **Step 7: Commit**

```bash
git add js/config.js js/lib/quiz-core.js js/db.js dev/tests.html
git commit -m "Add Supabase client, pure question mappers, and browser tests"
```

---

## Task 3: أداة نقل الـ ١٠٠ سؤال

**Files:**
- Create: `dev/migrate-questions.html`

**Interfaces:**
- Consumes: `questionToRow`, `db`, و`EASY_QUESTIONS`/`MEDIUM_QUESTIONS`/`HARD_QUESTIONS` من `js/questions.js` (لسه موجود في المرحلة دي).
- Produces: الـ ١٠٠ سؤال جوه جدول `questions`.

**ملاحظة:** الأداة دي بتتشال في Task 9. هي بتستخدم `upsert` عشان تقدر تشغلها أكتر من مرة من غير ما تكرر أسئلة.

- [ ] **Step 1: اكتب `dev/migrate-questions.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>نقل الأسئلة للداتابيز</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; line-height: 1.9; max-width: 720px; }
      input, button { font: inherit; padding: 8px; margin: 4px 0; }
      input { width: 260px; }
      #log { background: #f4f4f4; padding: 12px; white-space: pre-wrap; margin-top: 16px; }
      .ok { color: #0a7d32; } .bad { color: #c02626; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>نقل الأسئلة للداتابيز</h1>
    <p>أداة لمرة واحدة. بتقرا الأسئلة من <code>js/questions.js</code> وتحطها في Supabase
       بنفس الـ id ونفس الصعوبة. لو شغلتها تاني بتحدّث الموجود بدل ما تكرره.</p>

    <div>
      <input id="email" type="email" placeholder="إيميل الأدمن" /><br />
      <input id="password" type="password" placeholder="الباسورد" /><br />
      <button id="run">سجّل دخول وانقل الأسئلة</button>
    </div>

    <div id="log"></div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../js/config.js"></script>
    <script src="../js/lib/quiz-core.js"></script>
    <script src="../js/db.js"></script>
    <script src="../js/questions.js"></script>
    <script>
      const logEl = document.getElementById("log");
      function log(msg, cls) {
        const line = document.createElement("div");
        if (cls) line.className = cls;
        line.textContent = msg;
        logEl.appendChild(line);
      }

      const GROUPS = [
        ["easy", EASY_QUESTIONS],
        ["medium", MEDIUM_QUESTIONS],
        ["hard", HARD_QUESTIONS],
      ];

      document.getElementById("run").addEventListener("click", async () => {
        logEl.innerHTML = "";
        try {
          const { error: authError } = await db.auth.signInWithPassword({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
          });
          if (authError) throw authError;
          log("تم تسجيل الدخول.", "ok");

          const rows = GROUPS.flatMap(([difficulty, list]) =>
            list.map((q) => questionToRow(q, difficulty)),
          );
          log(`جاهز ينقل ${rows.length} سؤال...`);

          const { error } = await db.from("questions").upsert(rows, { onConflict: "id" });
          if (error) throw error;
          log("تم النقل. جاري التحقق...", "ok");

          // التحقق: العدد الكلي والتوزيع على المستويات
          const { count, error: countError } = await db
            .from("questions").select("*", { count: "exact", head: true });
          if (countError) throw countError;
          log(`العدد في الداتابيز: ${count}`, count === rows.length ? "ok" : "bad");

          for (const [difficulty, list] of GROUPS) {
            const { count: c, error: e } = await db
              .from("questions")
              .select("*", { count: "exact", head: true })
              .eq("difficulty", difficulty);
            if (e) throw e;
            log(
              `${difficulty}: الداتابيز ${c} — الملف ${list.length}`,
              c === list.length ? "ok" : "bad",
            );
          }
        } catch (e) {
          log("فشل: " + e.message, "bad");
        }
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: شغّل الأداة**

افتح `dev/migrate-questions.html` في المتصفح، اكتب إيميل وباسورد الأدمن، ودوس الزرار.
Expected: كل السطور خضرا، والعدد `100`، والتوزيع `easy: 16`, `medium: 38`, `hard: 46`.

- [ ] **Step 3: تحقق يدوي من الحروف القبطية**

في لوحة تحكم Supabase → Table Editor → `questions`، دور على `id = 21002` (السؤال اللي فيه `{{E}}`) و`id = 31051` (اللي فيه `{{ⲀϢ ⲠⲈ ⲠⲈⲦⲈⲚⲢⲀⲚ}}`).
Expected: الحروف القبطية والأقواس المزدوجة متخزنة نصاً كما هي، مش رموز مكسورة.

- [ ] **Step 4: Commit**

```bash
git add dev/migrate-questions.html
git commit -m "Add one-time tool to migrate the 100 questions into Supabase"
```

---

## Task 4: خانة الاسم وجلب الأسئلة من الداتابيز

**Files:**
- Modify: `index.html` (شاشة البداية + سطور `<script>`)
- Modify: `js/script.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `fetchQuestionsByDifficulty`, `createAttempt` من Task 2.
- Produces: متغير عام `allQuestions` (لستة مسطحة بكل الأسئلة النشطة) تستخدمه أدوات التجربة، ومتغير `currentAttemptId`.

**⚠️ انتبه:** السطر `let quizQuestions = QUESTIONS;` في `js/script.js:112` بيشتغل وقت تحميل الصفحة. لو `js/questions.js` اتشال من غير ما السطر ده يتغير، الصفحة هتقع بـ `ReferenceError` قبل ما أي حاجة تشتغل. لازم يتغير في الـ task ده.

- [ ] **Step 1: ضيف خانة الاسم في `index.html`**

في `<section id="start-screen">`، بين `<p id="last-score">` و`<button id="start-btn">`:

```html
        <div class="name-field">
          <label id="student-name-label" for="student-name">اسمك</label>
          <input
            id="student-name"
            type="text"
            maxlength="60"
            autocomplete="name"
            dir="auto"
          />
        </div>
```

- [ ] **Step 2: حدّث سطور `<script>` في `index.html`**

بدّل السطرين اللي في آخر `<body>`:

```html
    <script src="js/questions.js"></script>
    <script src="js/script.js"></script>
```

بـ:

```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/config.js"></script>
    <script src="js/lib/quiz-core.js"></script>
    <script src="js/db.js"></script>
    <script src="js/questions.js"></script>
    <script src="js/script.js"></script>
```

`js/questions.js` بيفضل مؤقتاً لحد Task 9.

- [ ] **Step 3: ضيف ستايل خانة الاسم في `css/style.css`**

في آخر الملف:

```css
/* خانة اسم الطالب في شاشة البداية */
.name-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto 16px;
  text-align: start;
}

.name-field label {
  font-size: 0.95rem;
  opacity: 0.85;
}

.name-field input {
  font: inherit;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border, #ccc);
  background: var(--card, #fff);
  color: inherit;
  width: 100%;
}
```

**ملاحظة:** شوف أسماء المتغيرات الموجودة فعلاً في `css/style.css` (`:root`) واستخدمها بدل `--border` و`--card` لو كانت بأسماء تانية، عشان الثيم الغامق يشتغل صح.

- [ ] **Step 4: ضيف نصوص الترجمة الجديدة في `js/script.js`**

في `TRANSLATIONS`، ضيف لكل لغة المفاتيح دي:

```js
  // ar
    nameLabel: "اسمك",
    nameRequired: "اكتب اسمك الأول",
    loading: "جاري التحميل...",
    loadError: "مش قادر يحمّل الأسئلة. اتأكد إن فيه إنترنت وجرب تاني.",
  // en
    nameLabel: "Your name",
    nameRequired: "Please enter your name first",
    loading: "Loading...",
    loadError: "Couldn't load the questions. Check your connection and try again.",
  // fr
    nameLabel: "Votre nom",
    nameRequired: "Veuillez d'abord saisir votre nom",
    loading: "Chargement...",
    loadError: "Impossible de charger les questions. Vérifiez votre connexion et réessayez.",
```

- [ ] **Step 5: ضيف عناصر الصفحة والحالة الجديدة في `js/script.js`**

جنب باقي تعريفات العناصر في أول الملف:

```js
const studentNameInput = document.getElementById("student-name");
const studentNameLabel = document.getElementById("student-name-label");
const STUDENT_NAME_KEY = "quiz_student_name";
```

وجنب متغيرات الحالة:

```js
// بتتملى من الداتابيز أول ما يدوس "ابدأ"
let allQuestions = [];
let currentAttemptId = null;
```

وغيّر السطر:

```js
let quizQuestions = QUESTIONS;
```

لـ:

```js
let quizQuestions = [];
```

- [ ] **Step 6: خلي `buildQuizOrder` تاخد الأسئلة كمعامل**

بدّل:

```js
function buildQuizOrder() {
  return LEVELS.flatMap((level) =>
    shuffle(QUESTIONS_BY_DIFFICULTY[level]).slice(0, QUOTAS[level]),
  );
}
```

بـ:

```js
// كل مستوى بيتخلط جوه نفسه، والمستويات بتتراكم بالترتيب: easy ثم medium ثم hard.
function buildQuizOrder(byDifficulty) {
  return LEVELS.flatMap((level) =>
    shuffle(byDifficulty[level]).slice(0, QUOTAS[level]),
  );
}
```

- [ ] **Step 7: خلي `startQuiz` غير متزامنة**

بدّل الدالة كلها بـ:

```js
async function startQuiz() {
  const name = studentNameInput.value.trim();
  if (!name) {
    alert(t("nameRequired"));
    studentNameInput.focus();
    return;
  }
  localStorage.setItem(STUDENT_NAME_KEY, name);

  const originalLabel = startBtn.textContent;
  startBtn.disabled = true;
  startBtn.textContent = t("loading");

  try {
    const byDifficulty = await fetchQuestionsByDifficulty();
    allQuestions = [
      ...byDifficulty.easy,
      ...byDifficulty.medium,
      ...byDifficulty.hard,
    ];
    quizQuestions = buildQuizOrder(byDifficulty);
    currentAttemptId = await createAttempt(name, quizQuestions.length);
  } catch (e) {
    console.error(e);
    alert(t("loadError"));
    return;
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = originalLabel;
  }

  debugBrowsing = false; // TEMP: هيتشال مع أدوات التجربة
  currentIndex = 0;
  userAnswers = [];
  selectedAnswer = null;
  showScreen(quizScreen);
  renderQuestion();
  startTimer();
}
```

- [ ] **Step 8: سجّل كل إجابة في `handleNext`**

في آخر `handleNext`، بعد سطر `userAnswers[currentIndex] = ...` وقبل `currentIndex++`:

```js
  // التسجيل best-effort: لو الشبكة وقعت، الامتحان بيكمل عادي والغلطة بتتسجل في الكونسول.
  if (currentAttemptId) {
    recordAnswer(currentAttemptId, q.id, currentIndex + 1, given, correct).catch(
      (e) => console.warn("تسجيل الإجابة فشل", e),
    );
  }
```

- [ ] **Step 9: اقفل المحاولة في `showResult`**

في `showResult`، بعد `setLastScore(...)`:

```js
  if (currentAttemptId) {
    finishAttempt(currentAttemptId, score, userAnswers.length).catch((e) =>
      console.warn("قفل المحاولة فشل", e),
    );
  }
```

- [ ] **Step 10: صلّح أدوات التجربة عشان تستخدم `allQuestions`**

في `debugBrowse`، بدّل السطرين اللي بيستخدموا `QUESTIONS`:

```js
    index = QUESTIONS.findIndex((q) => q.id === startId);
```
→
```js
    index = allQuestions.findIndex((q) => q.id === startId);
```

و:

```js
  quizQuestions = QUESTIONS;
```
→
```js
  quizQuestions = allQuestions;
```

وفي أول `debugBrowse`، قبل أي حاجة، حمّل الأسئلة لو لسه فاضية:

```js
async function debugBrowse(startId) {
  if (allQuestions.length === 0) {
    const byDifficulty = await fetchQuestionsByDifficulty();
    allQuestions = [
      ...byDifficulty.easy,
      ...byDifficulty.medium,
      ...byDifficulty.hard,
    ];
  }
  let index = 0;
  // ... باقي الدالة زي ما هي
```

وغيّر نداءاتها لتبقى `debugBrowse().catch(console.error)` و`debugBrowse(Number(digits)).catch(console.error)`.

- [ ] **Step 11: املا الاسم المحفوظ في `renderStartScreen`**

في `renderStartScreen`، قبل `showScreen(startScreen)`:

```js
  studentNameInput.value = localStorage.getItem(STUDENT_NAME_KEY) || "";
```

- [ ] **Step 12: ترجم عنوان الخانة في `applyLanguage`**

جنب باقي أسطر الترجمة في `applyLanguage`:

```js
  studentNameLabel.textContent = t("nameLabel");
```

- [ ] **Step 13: جرّب الامتحان كامل في المتصفح**

افتح `index.html`:
1. زرار "ابدأ" من غير اسم → لازم يطلع تنبيه ومبدأش.
2. اكتب اسم ودوس ابدأ → الأسئلة بتتحمل من الداتابيز (شوف تبويب Network).
3. حل ٣ أسئلة وبص في Supabase → Table Editor → `attempt_answers`: لازم تلاقي ٣ سطور بـ `position` ١ و٢ و٣.
4. كمّل لآخر سؤال → في `attempts` لازم `finished_at` و`score` و`total` يتملوا.
5. اقفل الصفحة وافتحها تاني → الاسم لازم يكون محفوظ في الخانة.
6. جرّب تبديل اللغة والثيم → لازم يشتغلوا زي الأول، وعنوان خانة الاسم يترجم.

- [ ] **Step 14: Commit**

```bash
git add index.html js/script.js css/style.css
git commit -m "Load questions from Supabase and record each student attempt"
```

---

## Task 5: صفحة الأدمن — الهيكل وتسجيل الدخول

**Files:**
- Create: `pages/admin.html`
- Create: `js/admin.js`
- Create: `css/admin.css`

**Interfaces:**
- Consumes: `db` من Task 2.
- Produces:
  - `showAdminTab(name: string)` — بتظهر تبويب وتخفي الباقي
  - عناصر بـ `id`: `admin-login`, `admin-main`, `tab-add`, `tab-list`, `tab-attempts`, `tab-stats`
  - `adminError(message: string)` — بتعرض رسالة غلط في شريط أعلى الصفحة

- [ ] **Step 1: اكتب `pages/admin.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>إدارة الكويز</title>
    <link rel="icon" type="image/png" href="../assets/img/logo.png" />
    <link rel="stylesheet" href="../css/style.css" />
    <link rel="stylesheet" href="../css/admin.css" />
  </head>
  <body>
    <div class="admin">
      <p id="admin-error" class="admin-error hidden"></p>

      <!-- تسجيل الدخول -->
      <section id="admin-login" class="admin-section">
        <h1>إدارة الكويز</h1>
        <input id="admin-email" type="email" placeholder="الإيميل" autocomplete="username" />
        <input id="admin-password" type="password" placeholder="الباسورد" autocomplete="current-password" />
        <button id="admin-login-btn" class="btn primary" type="button">دخول</button>
      </section>

      <!-- بعد الدخول -->
      <section id="admin-main" class="admin-section hidden">
        <div class="admin-bar">
          <nav class="admin-tabs">
            <button class="tab-btn" data-tab="add" type="button">إضافة سؤال</button>
            <button class="tab-btn" data-tab="list" type="button">كل الأسئلة</button>
            <button class="tab-btn" data-tab="attempts" type="button">المحاولات</button>
            <button class="tab-btn" data-tab="stats" type="button">أصعب الأسئلة</button>
          </nav>
          <button id="admin-logout-btn" class="btn" type="button">خروج</button>
        </div>

        <div id="tab-add" class="admin-tab"></div>
        <div id="tab-list" class="admin-tab hidden"></div>
        <div id="tab-attempts" class="admin-tab hidden"></div>
        <div id="tab-stats" class="admin-tab hidden"></div>
      </section>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../js/config.js"></script>
    <script src="../js/lib/quiz-core.js"></script>
    <script src="../js/db.js"></script>
    <script src="../js/admin.js"></script>
  </body>
</html>
```

- [ ] **Step 2: اكتب `css/admin.css`**

```css
/* صفحة الأدمن. بتكمّل على متغيرات الثيم اللي في css/style.css */
.admin { max-width: 900px; margin: 0 auto; padding: 16px; }

.admin-section input {
  font: inherit;
  display: block;
  width: 100%;
  max-width: 320px;
  padding: 10px 12px;
  margin: 8px 0;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.admin-error {
  background: #fdecec;
  color: #c02626;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.admin-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.admin-tabs { display: flex; flex-wrap: wrap; gap: 6px; }

.tab-btn {
  font: inherit;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #ccc;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.tab-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }

.admin-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e5e5e5;
  cursor: pointer;
  text-align: start;
  width: 100%;
  background: transparent;
  color: inherit;
  font: inherit;
  border-inline: 0;
  border-top: 0;
}

.admin-row:hover { background: rgba(127, 127, 127, 0.08); }

.admin-hint { font-size: 0.85rem; opacity: 0.7; margin: 4px 0 12px; }

.hidden { display: none; }

@media (max-width: 480px) {
  .admin-row { flex-direction: column; gap: 4px; }
}
```

- [ ] **Step 3: اكتب `js/admin.js` — الدخول والتبويبات بس**

```js
// منطق صفحة الأدمن. التبويبات بتتملى في الـ tasks اللي بعد كده.

const loginSection = document.getElementById("admin-login");
const mainSection = document.getElementById("admin-main");
const errorEl = document.getElementById("admin-error");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");

const TAB_IDS = ["add", "list", "attempts", "stats"];

function adminError(message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("hidden", !message);
}

function showAdminTab(name) {
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

document.getElementById("admin-login-btn").addEventListener("click", async () => {
  adminError("");
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
});

document.getElementById("admin-logout-btn").addEventListener("click", async () => {
  await db.auth.signOut();
  showLoggedIn(false);
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("admin-login-btn").click();
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => showAdminTab(btn.dataset.tab));
});

// التبويبات الفاضية دلوقتي، بتتملى في الـ tasks الجاية.
function renderAddTab() {}
function renderListTab() {}
function renderAttemptsTab() {}
function renderStatsTab() {}

// الجلسة محفوظة في localStorage، فلو داخل من قبل مبيسألش تاني.
db.auth.getSession().then(({ data }) => showLoggedIn(Boolean(data.session)));
```

- [ ] **Step 4: جرّب الدخول في المتصفح**

افتح `pages/admin.html`:
1. باسورد غلط → لازم تظهر رسالة "الإيميل أو الباسورد غلط."
2. باسورد صح → شاشة التبويبات تظهر، وتبويب "إضافة سؤال" يبقى نشط.
3. اعمل refresh → لازم تفضل داخل من غير ما يسألك تاني.
4. دوس "خروج" ثم refresh → لازم يرجّعك لشاشة الدخول.

- [ ] **Step 5: Commit**

```bash
git add pages/admin.html js/admin.js css/admin.css
git commit -m "Add admin page shell with Supabase login and tabs"
```

---

## Task 6: صفحة الأدمن — إضافة وتعديل الأسئلة

**Files:**
- Modify: `js/admin.js` (تعبئة `renderAddTab` و`renderListTab`)
- Modify: `js/db.js` (دوال الأسئلة للأدمن)

**Interfaces:**
- Consumes: `nextQuestionId`, `formatQuestionId`, `questionToRow`, `showAdminTab`, `adminError`.
- Produces:
  - `fetchMaxQuestionId(type: string) -> Promise<number|null>`
  - `saveQuestion(row: object) -> Promise<void>` (upsert)
  - `fetchAllQuestions() -> Promise<object[]>` (بما فيها المخفي)
  - `setQuestionActive(id: number, active: boolean) -> Promise<void>`

- [ ] **Step 1: ضيف دوال الأدمن في `js/db.js`**

في آخر الملف:

```js
// ---------- الأسئلة: للأدمن بس (محتاجة تسجيل دخول) ----------

// أكبر id مستخدم لنوع معيّن، عشان نحسب الرقم الجاي. بيرجع null لو مفيش.
async function fetchMaxQuestionId(type) {
  const prefix = QUESTION_TYPE_PREFIX[type];
  const { data, error } = await db
    .from("questions")
    .select("id")
    .gte("id", prefix * 10000)
    .lt("id", (prefix + 1) * 10000)
    .order("id", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data.length ? data[0].id : null;
}

async function saveQuestion(row) {
  const { error } = await db.from("questions").upsert(row, { onConflict: "id" });
  if (error) throw error;
}

// بترجع كل الأسئلة بما فيها المخفي — سياسة admin_manages_questions هي اللي بتسمح بده.
async function fetchAllQuestions() {
  const { data, error } = await db
    .from("questions")
    .select("id, type, difficulty, question, options, answer, lang, active")
    .order("id");
  if (error) throw error;
  return data;
}

async function setQuestionActive(id, active) {
  const { error } = await db.from("questions").update({ active }).eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 2: اكتب `renderAddTab` في `js/admin.js`**

بدّل `function renderAddTab() {}` بـ:

```js
// السؤال اللي بنعدله دلوقتي، أو null لو بنضيف جديد.
let editingQuestion = null;

const TYPE_LABELS = { mcq: "اختيار من متعدد", truefalse: "صح وغلط", fill: "أكمل" };
const DIFFICULTY_LABELS = { easy: "سهل", medium: "متوسط", hard: "صعب" };

function renderAddTab() {
  const q = editingQuestion;
  const container = document.getElementById("tab-add");
  container.innerHTML = "";

  const form = document.createElement("div");
  form.innerHTML = `
    <h2>${q ? "تعديل سؤال " + formatQuestionId(q.id) : "إضافة سؤال جديد"}</h2>

    <label>النوع</label>
    <select id="q-type">
      <option value="mcq">اختيار من متعدد</option>
      <option value="truefalse">صح وغلط</option>
      <option value="fill">أكمل</option>
    </select>

    <label>نص السؤال</label>
    <textarea id="q-text" rows="3"></textarea>
    <p class="admin-hint">
      حط الحرف القبطي بين {{ }} — مثال: الحرف {{ⲑ}} ينطق إزاي؟<br />
      لو الرمز مش باين صح استخدم (( )) بدلها — دي بتستخدم الخط القبطي التاني.
    </p>

    <div id="q-answer-area"></div>

    <label>الصعوبة</label>
    <select id="q-difficulty">
      <option value="easy">سهل</option>
      <option value="medium">متوسط</option>
      <option value="hard">صعب</option>
    </select>

    <label><input type="checkbox" id="q-cop-lang" /> نص السؤال كله قبطي</label>

    <h3>معاينة</h3>
    <div id="q-preview" class="review-item"></div>

    <button id="q-save" class="btn primary" type="button">حفظ السؤال</button>
    <button id="q-cancel" class="btn ${q ? "" : "hidden"}" type="button">إلغاء التعديل</button>
  `;
  container.appendChild(form);

  const typeSelect = document.getElementById("q-type");
  const textArea = document.getElementById("q-text");
  const difficultySelect = document.getElementById("q-difficulty");
  const copLangBox = document.getElementById("q-cop-lang");

  if (q) {
    typeSelect.value = q.type;
    textArea.value = q.question;
    difficultySelect.value = q.difficulty;
    copLangBox.checked = q.lang === "cop";
  }

  renderAnswerFields(q);
  renderPreview();

  typeSelect.addEventListener("change", () => { renderAnswerFields(null); renderPreview(); });
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
  area.innerHTML = "";

  if (type === "mcq") {
    area.innerHTML = `<label>الاختيارات (اختار الصح)</label><div id="q-options"></div>
      <button id="q-add-option" class="btn" type="button">+ اختيار</button>`;
    const options = q && q.options ? q.options : ["", ""];
    options.forEach((text, i) => addOptionRow(text, q ? q.answer === i : i === 0));
    document.getElementById("q-add-option").addEventListener("click", () =>
      addOptionRow("", false),
    );
  } else if (type === "truefalse") {
    area.innerHTML = `<label>الإجابة الصح</label>
      <select id="q-tf-answer">
        <option value="true">صح</option>
        <option value="false">غلط</option>
      </select>`;
    if (q) document.getElementById("q-tf-answer").value = String(q.answer);
  } else {
    area.innerHTML = `<label>الإجابة الصح</label>
      <input id="q-fill-answer" type="text" />
      <p class="admin-hint">المقارنة بتتجاهل حالة الأحرف والمسافات الزيادة،
      وبتعامل أ/إ/آ/ا زي بعض، وه/ة زي بعض، وي/ى زي بعض.</p>`;
    if (q) document.getElementById("q-fill-answer").value = String(q.answer);
  }
}

function addOptionRow(text, isCorrect) {
  const list = document.getElementById("q-options");
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
  input.addEventListener("input", renderPreview);
  row.appendChild(radio);
  row.appendChild(input);
  list.appendChild(row);
}

// معاينة بالخط القبطي، بتستخدم نفس دالة فك الترميز اللي في الامتحان.
function renderPreview() {
  const preview = document.getElementById("q-preview");
  if (!preview) return;
  preview.innerHTML = "";
  appendWithCopticMarkers(preview, document.getElementById("q-text").value);
}

function readFormQuestion() {
  const type = document.getElementById("q-type").value;
  const question = document.getElementById("q-text").value.trim();
  if (!question) throw new Error("اكتب نص السؤال.");

  const base = { type, question };
  if (document.getElementById("q-cop-lang").checked) base.lang = "cop";

  if (type === "mcq") {
    const rows = [...document.querySelectorAll(".option-row")];
    const options = rows.map((r) => r.querySelector(".option-text").value.trim());
    if (options.some((o) => !o)) throw new Error("فيه اختيار فاضي.");
    if (options.length < 2) throw new Error("لازم اختيارين على الأقل.");
    const answer = rows.findIndex((r) => r.querySelector("input[type=radio]").checked);
    if (answer < 0) throw new Error("اختار الإجابة الصح.");
    return { ...base, options, answer };
  }

  if (type === "truefalse") {
    return { ...base, answer: document.getElementById("q-tf-answer").value === "true" };
  }

  const answer = document.getElementById("q-fill-answer").value.trim();
  if (!answer) throw new Error("اكتب الإجابة الصح.");
  return { ...base, answer };
}

async function saveFromForm() {
  adminError("");
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
  }
}
```

**⚠️ `appendWithCopticMarkers` معرّفة في `js/script.js` اللي مش محمّل في صفحة الأدمن.** في Step 3 بننقلها لملف مشترك.

- [ ] **Step 3: انقل `appendWithCopticMarkers` لملف مشترك**

الدالة دي محتاجة تشتغل في صفحتين، فبتتنقل من `js/script.js` لملف جديد:

Create `js/lib/coptic-markup.js`:

```js
// بتفك ترميز {{ ... }} و (( ... )) لعناصر بالخط القبطي.
// في ملف مشترك عشان الامتحان وصفحة الأدمن (المعاينة) الاتنين بيستخدموها.
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
```

- احذف الدالة من `js/script.js` (كانت حوالي السطر 216).
- ضيف `<script src="js/lib/coptic-markup.js"></script>` في `index.html` **قبل** `js/script.js`.
- ضيف `<script src="../js/lib/coptic-markup.js"></script>` في `pages/admin.html` **قبل** `js/admin.js`.
- ضيف `<script src="../js/lib/coptic-markup.js"></script>` في `dev/tests.html`.

- [ ] **Step 4: اكتب `renderListTab` في `js/admin.js`**

بدّل `function renderListTab() {}` بـ:

```js
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
      rows
        .filter((r) => !filter || r.question.includes(filter))
        .forEach((r) => {
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
          const editBtn = document.createElement("button");
          editBtn.className = "btn";
          editBtn.textContent = "تعديل";
          editBtn.addEventListener("click", () => {
            editingQuestion = r;
            showAdminTab("add");
          });
          const toggleBtn = document.createElement("button");
          toggleBtn.className = "btn";
          toggleBtn.textContent = r.active ? "إخفاء" : "إظهار";
          toggleBtn.addEventListener("click", async () => {
            await setQuestionActive(r.id, !r.active);
            renderListTab();
          });
          actions.appendChild(editBtn);
          actions.appendChild(toggleBtn);

          row.appendChild(left);
          row.appendChild(actions);
          listEl.appendChild(row);
        });
    }

    draw("");
    document.getElementById("q-search").addEventListener("input", (e) => draw(e.target.value));
  } catch (e) {
    adminError(e.message);
  }
}
```

- [ ] **Step 5: تأكد إن اختبارات Task 2 لسه بتنجح**

افتح `dev/tests.html`.
Expected: `نجح 12 — فشل 0`.

- [ ] **Step 6: جرّب في المتصفح**

في `pages/admin.html` بعد الدخول:
1. ضيف سؤال اختيار من متعدد فيه `{{ⲑ}}` → المعاينة تحت الفورم لازم تعرض الحرف بالخط القبطي.
2. احفظه → لازم تظهر رسالة بالرقم الجديد (`2_1006` لو آخر واحد كان `2_1005`).
3. روح تبويب "كل الأسئلة" → السؤال الجديد لازم يكون ظاهر.
4. دوس "إخفاء" → يتعلّم "مخفي". افتح `index.html` وابدأ امتحان → السؤال ده ميظهرش.
5. دوس "إظهار" → يرجع.
6. دوس "تعديل" على سؤال، غيّر النص، احفظ → التعديل يظهر في اللستة والـ id ما اتغيرش.
7. افتح `index.html` وتأكد إن الامتحان لسه شغال عادي بعد نقل `appendWithCopticMarkers`.

- [ ] **Step 7: Commit**

```bash
git add js/admin.js js/db.js js/lib/coptic-markup.js js/script.js index.html pages/admin.html dev/tests.html
git commit -m "Add question editor and list to admin page"
```

---

## Task 7: صفحة الأدمن — المحاولات وتفاصيلها

**Files:**
- Modify: `js/admin.js` (تعبئة `renderAttemptsTab`)
- Modify: `js/db.js`

**Interfaces:**
- Consumes: `formatQuestionId`, `appendWithCopticMarkers`, `adminError`.
- Produces:
  - `fetchAttempts(nameFilter?: string) -> Promise<object[]>`
  - `fetchAttemptAnswers(attemptId: string) -> Promise<object[]>` — كل سطر فيه `question` مدمج

- [ ] **Step 1: ضيف دوال المحاولات في `js/db.js`**

```js
// ---------- المحاولات: للأدمن بس ----------

async function fetchAttempts(nameFilter) {
  let query = db
    .from("attempts")
    .select("id, student_name, started_at, finished_at, score, total")
    .order("started_at", { ascending: false })
    .limit(500);
  if (nameFilter) query = query.ilike("student_name", `%${nameFilter}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// بيجيب إجابات محاولة واحدة ومعاها بيانات كل سؤال، مرتبة بترتيب الامتحان الأصلي.
async function fetchAttemptAnswers(attemptId) {
  const { data, error } = await db
    .from("attempt_answers")
    .select(
      "position, given_answer, is_correct, " +
        "questions ( id, type, question, options, answer, lang )",
    )
    .eq("attempt_id", attemptId)
    .order("position");
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: اكتب `renderAttemptsTab` في `js/admin.js`**

```js
const TRUEFALSE_LABELS = { true: "✅ صح", false: "❌ غلط" };

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("ar-EG", {
    day: "numeric", month: "long", hour: "numeric", minute: "2-digit",
  });
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
        listEl.innerHTML = "<p>مفيش محاولات لسه.</p>";
        return;
      }
      rows.forEach((a) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "admin-row";

        const name = document.createElement("strong");
        name.textContent = a.student_name;

        const meta = document.createElement("span");
        meta.textContent =
          formatDateTime(a.started_at) +
          " — " +
          (a.finished_at ? `${a.score} / ${a.total}` : "ما خلصش");

        btn.appendChild(name);
        btn.appendChild(meta);
        btn.addEventListener("click", () => showAttemptDetail(a));
        listEl.appendChild(btn);
      });
    } catch (e) {
      adminError(e.message);
    }
  }

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
  container.innerHTML = `<p>جاري التحميل...</p>`;
  try {
    const answers = await fetchAttemptAnswers(attempt.id);

    container.innerHTML = "";
    const back = document.createElement("button");
    back.className = "btn";
    back.textContent = "‹ رجوع للمحاولات";
    back.addEventListener("click", renderAttemptsTab);
    container.appendChild(back);

    const head = document.createElement("h2");
    head.textContent =
      `${attempt.student_name} — ${formatDateTime(attempt.started_at)} — ` +
      (attempt.finished_at ? `${attempt.score} / ${attempt.total}` : "ما خلصش");
    container.appendChild(head);

    answers.forEach((a) => {
      const q = a.questions;
      const item = document.createElement("div");
      item.className = `review-item ${a.is_correct ? "correct" : "wrong"}`;

      const qEl = document.createElement("div");
      qEl.className = "q";
      appendWithCopticMarkers(qEl, `${a.is_correct ? "✅" : "❌"} ${a.position}. ${q.question}`);

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
```

- [ ] **Step 3: جرّب في المتصفح**

1. من `index.html` حل امتحان كامل باسم "مينا"، وامتحان تاني باسم "مريم".
2. ابدأ امتحان تالت باسم "مينا" وحل ٣ أسئلة بس واقفل الصفحة.
3. في تبويب "المحاولات": لازم تلاقي ٣ سطور، الأحدث فوق، والتالتة مكتوب عندها "ما خلصش".
4. دوس على محاولة مينا الكاملة → لازم تعرض ٤٠ سؤال بترتيب الامتحان، بعلامة ✅ أو ❌، وإجابته والصح.
5. اكتب "مر" في البحث → مريم بس تظهر.
6. تأكد إن الحروف القبطية ظاهرة صح في شاشة التفاصيل.

- [ ] **Step 4: Commit**

```bash
git add js/admin.js js/db.js
git commit -m "Add attempts list and per-attempt answer review to admin page"
```

---

## Task 8: صفحة الأدمن — أصعب الأسئلة

**Files:**
- Modify: `js/admin.js` (تعبئة `renderStatsTab`)
- Modify: `js/db.js`

**Interfaces:**
- Consumes: `appendWithCopticMarkers`, `formatQuestionId`, `DIFFICULTY_LABELS`, `adminError`.
- Produces: `fetchQuestionStats(minAnswers: number) -> Promise<object[]>`

- [ ] **Step 1: ضيف `fetchQuestionStats` في `js/db.js`**

```js
// ---------- الإحصائية: للأدمن بس ----------

// بتقرا من العرض question_stats. الأسئلة اللي اتجاوبت أقل من minAnswers مرة
// بتتستبعد، لأن نسبة مبنية على إجابة أو اتنين مالهاش معنى.
async function fetchQuestionStats(minAnswers) {
  const { data, error } = await db
    .from("question_stats")
    .select("id, question, difficulty, times_answered, times_wrong, wrong_pct")
    .gte("times_answered", minAnswers)
    .order("wrong_pct", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: اكتب `renderStatsTab` في `js/admin.js`**

```js
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
```

- [ ] **Step 3: جرّب في المتصفح**

1. لو لسه مفيش ٥ إجابات على أي سؤال → لازم تظهر "لسه مفيش إجابات كفاية".
2. حل امتحانات كفاية عشان سؤال معيّن يتجاوب ٥ مرات على الأقل، وغلّط فيه عن قصد كذا مرة.
3. افتح التبويب → السؤال ده لازم يكون في الأول بنسبة غلط عالية.
4. اتأكد إن الحروف القبطية ظاهرة صح في نص السؤال.

- [ ] **Step 4: Commit**

```bash
git add js/admin.js js/db.js
git commit -m "Add hardest-questions stats tab to admin page"
```

---

## Task 9: التنضيف — شيل `questions.js` وأداة النقل

**Files:**
- Delete: `js/questions.js`
- Delete: `dev/migrate-questions.html`
- Modify: `index.html`
- Modify: `README.md` (لو موجود) أو Create: `README.md`

**⚠️ متعملش الـ task ده غير بعد ما Tasks 4-8 يتجربوا كلهم ويشتغلوا.** ده آخر نسخة من الأسئلة في الـ repo — الاعتماد بعدها بيبقى على الداتابيز بس.

- [ ] **Step 1: تحقق نهائي إن الأسئلة سليمة في الداتابيز**

في Supabase SQL Editor:

```sql
select difficulty, count(*) from questions group by difficulty order by difficulty;
```

Expected: `easy 16`, `hard 46`, `medium 38` (زائد أي أسئلة ضفتها بإيدك وأنت بتجرب).

```sql
select count(*) from questions where question like '%{{%' or question like '%((%';
```

Expected: رقم أكبر من صفر — يعني ترميز الحروف القبطية متخزن سليم.

- [ ] **Step 2: خد نسخة احتياطية من الأسئلة قبل الحذف**

```bash
git log --oneline -1 -- js/questions.js
```

Expected: بيطبع الكوميت اللي فيه الملف. سجّله في رسالة الكوميت الجاي عشان تقدر ترجعه بـ `git show <commit>:js/questions.js` في أي وقت.

- [ ] **Step 3: شيل السطر من `index.html`**

احذف:

```html
    <script src="js/questions.js"></script>
```

- [ ] **Step 4: احذف الملفات**

```bash
git rm js/questions.js dev/migrate-questions.html
```

- [ ] **Step 5: جرّب إن كل حاجة لسه شغالة**

1. افتح `index.html` → ابدأ امتحان كامل، لازم يشتغل عادي من غير أي غلط في الكونسول.
2. افتح `pages/admin.html` → التبويبات الأربعة كلها شغالة.
3. افتح `dev/tests.html` → `نجح 12 — فشل 0`.
4. افتح الكونسول في الصفحتين → لازم يكون فاضي من أي `ReferenceError`.

- [ ] **Step 6: اكتب `README.md`**

```markdown
# كويز اللغة القبطية

موقع امتحان في اللغة القبطية، أسئلته وإجابات الطلبة متخزنة في Supabase.

## تشغيل محلي

الموقع ملفات ساكنة من غير build. شغّل سيرفر بسيط من جذر المشروع:

```bash
python -m http.server 8000
```

وافتح `http://localhost:8000`. (لازم سيرفر مش فتح الملف مباشرة، عشان
`crypto.randomUUID` بيحتاج سياق آمن.)

## الملفات

| المسار | الدور |
|---|---|
| `index.html`, `js/script.js` | الامتحان |
| `pages/admin.html`, `js/admin.js` | صفحة الإدارة |
| `js/db.js` | كل التعامل مع Supabase |
| `js/lib/quiz-core.js` | دوال خالصة (تحويل الأسئلة، حساب الـ id) |
| `js/lib/coptic-markup.js` | فك ترميز `{{ }}` و `(( ))` للخط القبطي |
| `js/config.js` | رابط ومفتاح Supabase |
| `db/schema.sql` | الجداول والصلاحيات |
| `dev/tests.html` | اختبارات الدوال الخالصة — افتحها في المتصفح |

## الأسئلة

الأسئلة كلها في الداتابيز، بتتضاف وتتعدل من `pages/admin.html`.
نسخة الأسئلة القديمة اللي كانت في `js/questions.js` موجودة في تاريخ git.

## التصميم والخطة

- التصميم: `docs/superpowers/specs/2026-09-22-quiz-database-design.md`
- خطة التنفيذ: `docs/superpowers/plans/2026-09-22-supabase-database.md`
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Remove questions.js and migration tool now that questions live in Supabase"
```

---

## Self-Review

**تغطية الـ spec:**

| بند في الـ spec | الـ task |
|---|---|
| جدول `questions` | Task 1 |
| جدول `attempts` | Task 1 |
| جدول `attempt_answers` | Task 1 |
| عرض `question_stats` | Task 1 |
| سياسات RLS | Task 1 |
| حساب الأدمن وقفل التسجيل | Task 0 |
| `js/db.js` | Tasks 2, 6, 7, 8 |
| `js/config.js` | Task 2 |
| نقل الـ ١٠٠ سؤال + التحقق | Task 3 |
| خانة الاسم في شاشة البداية | Task 4 |
| جلب الأسئلة من الداتابيز | Task 4 |
| تسجيل المحاولة والإجابات | Task 4 |
| `crypto.randomUUID` من المتصفح | Task 2 (`createAttempt`) |
| تسجيل دخول الأدمن | Task 5 |
| إضافة سؤال + معاينة + شرح الترميز | Task 6 |
| لستة الأسئلة + إخفاء/إظهار + تعديل | Task 6 |
| لستة المحاولات + التفاصيل | Task 7 |
| أصعب الأسئلة | Task 8 |
| حذف `questions.js` بعد التحقق | Task 9 |

**حاجات اتحلت أثناء الكتابة:**

- `js/script.js:112` فيه `let quizQuestions = QUESTIONS;` بيشتغل وقت تحميل الصفحة. لو `questions.js` اتشال من غير تغييره الصفحة بتقع. متغطي في Task 4 Step 5 وفيه تحذير صريح.
- أدوات التجربة (`debugBrowse`) بتستخدم `QUESTIONS` العام. اتحولت لـ `allQuestions` في Task 4 Step 10 بدل ما تتحذف.
- `appendWithCopticMarkers` كانت في `js/script.js` ومحتاجة تشتغل في صفحة الأدمن كمان. اتنقلت لـ `js/lib/coptic-markup.js` في Task 6 Step 3.
- `q.copticQuote` مستخدمة في `renderQuestionText` بس مفيش ولا سؤال بيستخدمها. اتسابت زي ما هي ومفيش عمود ليها في الداتابيز.

**تطابق الأسماء:** `rowToQuestion`, `questionToRow`, `nextQuestionId`, `formatQuestionId`, `fetchQuestionsByDifficulty`, `createAttempt`, `recordAnswer`, `finishAttempt`, `fetchMaxQuestionId`, `saveQuestion`, `fetchAllQuestions`, `setQuestionActive`, `fetchAttempts`, `fetchAttemptAnswers`, `fetchQuestionStats`, `showAdminTab`, `adminError`, `appendWithCopticMarkers` — كلها معرّفة في task واحد ومستخدمة بنفس الاسم والتوقيع في اللي بعده.
