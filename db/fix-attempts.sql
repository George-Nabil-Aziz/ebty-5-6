-- =====================================================================
-- إصلاح تسجيل الدرجة + السماح بمسح المحاولات
-- شغّل الملف ده مرة واحدة من SQL Editor في Supabase.
-- الملف idempotent — تقدر تشغله تاني من غير ما يكسر حاجة.
--
-- المشكلة اللي بيحلها:
--   الطالب كان بيسجل محاولته، وفي آخر الامتحان بيعدّلها عشان يكتب درجته.
--   بس إحنا مانعينه يقرا المحاولات، وPostgres بيمنع التعديل كمان في الحالة دي
--   لأن التعديل بـ "where id = ..." محتاج يقرا السطر الأول عشان يلاقيه.
--   فالتعديل كان بيرجع "تمام" وهو مش بيعمل حاجة، والدرجة مكانتش بتتسجل.
--
-- الحل:
--   الدرجة مبقتش تتخزن خالص، بقت بتتحسب من الإجابات المسجلة نفسها.
--   ده بيحل الباج، وكمان بيقفل باب الغش: قبل كده متصفح الطالب كان هو اللي
--   بيقول الدرجة، دلوقتي الداتابيز هي اللي بتعدّها من الإجابات الحقيقية.
-- =====================================================================

-- ---------- ١. الطالب مابقاش محتاج يعدّل محاولته ----------
drop policy if exists anyone_finishes_attempt on attempts;

-- ---------- ٢. الأدمن يقدر يمسح محاولة ----------
-- الإجابات بتتمسح معاها تلقائياً بسبب on delete cascade
drop policy if exists admin_deletes_attempts on attempts;

create policy admin_deletes_attempts on attempts
  for delete to authenticated using (true);

-- ---------- ٣. الأعمدة اللي مابقاش ليها لازمة ----------
-- الدرجة وميعاد الانتهاء بقوا بيتحسبوا من الإجابات، فالأعمدة دي بقت
-- مصدر تاني للحقيقة ممكن يتعارض مع الأول. الأحسن تروح.
alter table attempts drop column if exists score;
alter table attempts drop column if exists finished_at;

-- ---------- ٤. نتيجة كل محاولة، محسوبة من إجاباتها ----------
-- answered  = عدد الأسئلة اللي جاوبها فعلاً
-- score     = عدد اللي جاوبهم صح
-- total     = عدد أسئلة الامتحان (اتسجل وقت ما بدأ)
-- is_finished = وصل لآخر سؤال ولا لأ
create or replace view attempt_results with (security_invoker = true) as
select
  a.id,
  a.student_name,
  a.started_at,
  a.total,
  count(aa.id)                                    as answered,
  count(aa.id) filter (where aa.is_correct)       as score,
  max(aa.answered_at)                             as last_answer_at,
  (count(aa.id) >= a.total)                       as is_finished
from attempts a
left join attempt_answers aa on aa.attempt_id = a.id
group by a.id, a.student_name, a.started_at, a.total;

-- تحقق: المفروض تشوف المحاولات التجريبية بدرجاتها المحسوبة
select student_name, answered, score, total, is_finished
from attempt_results
order by started_at desc;
