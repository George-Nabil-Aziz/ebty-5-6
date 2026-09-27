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
drop policy if exists admin_deletes_attempts   on attempts;
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

-- المحاولات: الأدمن يقدر يمسح محاولة، وإجاباتها بتتمسح معاها تلقائياً
-- بسبب on delete cascade اللي في جدول attempt_answers
create policy admin_deletes_attempts on attempts
  for delete to authenticated using (true);

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
