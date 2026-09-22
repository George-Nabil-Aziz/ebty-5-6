// كل تعامل مع الداتابيز في الملف ده لوحده.
// بيعتمد على: supabase (من CDN)، SUPABASE_URL و SUPABASE_ANON_KEY (config.js)،
// و rowToQuestion و QUESTION_TYPE_PREFIX (lib/quiz-core.js).

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
