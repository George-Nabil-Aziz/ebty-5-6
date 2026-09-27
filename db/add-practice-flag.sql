-- =====================================================================
-- تعليم المحاولات التجريبية
-- شغّل الملف ده مرة واحدة من SQL Editor في Supabase.
-- الملف idempotent — تقدر تشغله تاني من غير ما يكسر حاجة.
--
-- المشكلة: لما الأدمن يدخل يمتحن عشان يراجع الأسئلة، محاولته بتتحسب
-- مع محاولات الطلبة، فإحصائية "أصعب الأسئلة" بتتلخبط — ممكن يغلّط
-- في سؤال عن قصد عشان يشوف شكل الغلط، والإحصائية تعتبرها غلطة حقيقية.
--
-- الحل: أي محاولة من حد مسجّل دخول بتتعلّم إنها تجريبية، وبتتشال من
-- الإحصائية. بتفضل ظاهرة في لستة المحاولات بس معلّمة، عشان تعرف
-- إنها بتاعتك مش بتاعت طالب.
-- =====================================================================

-- ---------- ١. العمود ----------
alter table attempts
  add column if not exists is_practice boolean not null default false;

-- ---------- ٢. الأدمن يقدر يغيّر التعليم ----------
-- لو محاولة اتعلّمت غلط، تقدر تشيل التعليم أو تحطه من صفحة الإدارة.
drop policy if exists admin_updates_attempts on attempts;

create policy admin_updates_attempts on attempts
  for update to authenticated using (true) with check (true);

-- ---------- ٣. نتيجة المحاولة بتوري التعليم ----------
-- لازم نمسح العرض الأول: Postgres مش بيسمح بإضافة عمود في نص عرض موجود
-- بـ create or replace (بيقول: cannot change name of view column).
-- مفيش حاجة تانية معتمدة على العرض ده، فمسحه آمن.
drop view if exists attempt_results;

create view attempt_results with (security_invoker = true) as
select
  a.id,
  a.student_name,
  a.started_at,
  a.total,
  a.is_practice,
  count(aa.id)                                    as answered,
  count(aa.id) filter (where aa.is_correct)       as score,
  max(aa.answered_at)                             as last_answer_at,
  (count(aa.id) >= a.total)                       as is_finished
from attempts a
left join attempt_answers aa on aa.attempt_id = a.id
group by a.id, a.student_name, a.started_at, a.total, a.is_practice;

-- ---------- ٤. الإحصائية بتتجاهل المحاولات التجريبية ----------
-- أعمدته مش بتتغير، فـ create or replace كفاية هنا.
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
join attempts  a on a.id = aa.attempt_id
where not a.is_practice
group by q.id, q.question, q.difficulty;

-- تحقق: المحاولات وتعليمها
select student_name, answered, score, total, is_finished, is_practice
from attempt_results
order by started_at desc;
