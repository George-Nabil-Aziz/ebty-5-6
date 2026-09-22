// كل تعامل مع الداتابيز في الملف ده لوحده.
// بيعتمد على: supabase (من CDN)، SUPABASE_URL و SUPABASE_ANON_KEY (config.js)،
// و rowToQuestion و QUESTION_TYPE_PREFIX (lib/quiz-core.js).

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// الموقع لازم يتفتح من سيرفر (http/https)، مش بفتح الملف مباشرة من الجهاز.
// من file:// المتصفح بيمنع الاتصال بـ Supabase وبيقفل crypto.randomUUID كمان،
// والرسالة اللي بتطلع من غير التنبيه ده مبتوضّحش السبب خالص.
if (location.protocol === "file:") {
  const message =
    "الصفحة مفتوحة من الجهاز مباشرة، فالمتصفح بيمنع الاتصال بالداتابيز. " +
    "شغّل سيرفر محلي من جذر المشروع (مثلاً: npx serve) وافتح اللينك اللي هيطلعلك.";
  console.error(message);
  document.addEventListener("DOMContentLoaded", () => {
    const banner = document.createElement("p");
    banner.textContent = message;
    banner.style.cssText =
      "margin:0;padding:12px 16px;background:#fdecec;color:#c02626;" +
      "font:16px/1.7 system-ui,sans-serif;text-align:center;direction:rtl";
    document.body.prepend(banner);
  });
}

// ---------- الأسئلة: للطالب ----------

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

// ---------- المحاولات: للطالب ----------

// بيولّد الـ id في المتصفح لأن الطالب ممنوع من القراءة فمش هيقدر يستقبله من السيرفر.
// الـ uuid كمان غير قابل للتخمين، فمحدش يقدر يعدل محاولة غيره.
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

// ---------- الأسئلة: للأدمن بس (محتاجة تسجيل دخول) ----------

// أكبر id مستخدم لنوع معيّن، عشان nextQuestionId يحسب الرقم الجاي.
// بيرجع null لو مفيش ولا سؤال من النوع ده.
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
