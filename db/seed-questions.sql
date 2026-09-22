-- =====================================================================
-- الـ ١٠٠ سؤال الأصلية اللي كانت في js/questions.js
-- شغّل الملف ده من SQL Editor في Supabase **بعد** db/schema.sql.
-- الملف idempotent: لو شغلته تاني بيحدّث الموجود بدل ما يكرره.
--
-- الملف ده متولّد بالكود من js/questions.js، متعدلوش بالإيد —
-- بعد النقل، إضافة وتعديل الأسئلة بيبقى من صفحة الإدارة pages/admin.html
-- =====================================================================

insert into questions (id, type, difficulty, question, options, answer, lang, active)
values
  (21001, 'mcq', 'easy', 'الأبجدية القبطية تتكون من كام حرف؟', '["32","34","36","38"]'::jsonb, '0'::jsonb, null, true),
  (21002, 'mcq', 'easy', 'الجنكم ( ` ) إذا وضع على حرف متحرك فإنه يفيد؟', '["استقلال نطق الحرف","تنطق كحرف {{E}}"]'::jsonb, '0'::jsonb, null, true),
  (21003, 'mcq', 'easy', 'الجنكم ( ` ) إذا وضع على حرف ساكن فإنها؟', '["استقلال نطق الحرف","تنطق كحرف {{E}}"]'::jsonb, '1'::jsonb, null, true),
  (21004, 'mcq', 'easy', 'الحرف ((:)) ينطق ت امتى ؟', '["لو جه قبله ((C)) - ((S))","لو جه بعده ((C)) - ((S))"]'::jsonb, '0'::jsonb, null, true),
  (21005, 'mcq', 'easy', 'يعني ايه كلمة سمكة؟', '["{{ⲣⲱⲙⲓ}}","{{ⲥⲓⲙⲓ}}","{{ⲧⲉⲃⲧ}}"]'::jsonb, '2'::jsonb, null, true),
  (31001, 'truefalse', 'easy', 'الأبجدية القبطية تتكون من الحروف المتحركة والساكنة فقط.', null, 'false'::jsonb, null, true),
  (31002, 'truefalse', 'easy', 'الحرف ((^)) يستخدم للتعبير عن الرقم 8.', null, 'false'::jsonb, null, true),
  (31003, 'truefalse', 'easy', 'حروف التضخيم هي {{A}} - {{O}}.', null, 'false'::jsonb, null, true),
  (31004, 'truefalse', 'easy', 'عدد الحروف المتحركة للكسر 3.', null, 'false'::jsonb, null, true),
  (31005, 'truefalse', 'easy', 'الحرف {{B}} ينطق ڤ لو جه بعده حرف متحرك للكسر فقط.', null, 'false'::jsonb, null, true),
  (31006, 'truefalse', 'easy', 'الحرف {{G}} ينطق ج لو جه بعده حرف متحرك للكسر.', null, 'true'::jsonb, null, true),
  (31008, 'truefalse', 'easy', 'كلمة {{ⲆⲒⲠⲚⲞⲚ}} يعني غذاء.', null, 'false'::jsonb, null, true),
  (11001, 'fill', 'easy', 'أكمل: عدد الحروف المتحركة في الأبجدية القبطية هو ____.', null, '"7"'::jsonb, null, true),
  (11002, 'fill', 'easy', 'أكمل: عدد الحروف الساكنة في الأبجدية القبطية هو ____.', null, '"24"'::jsonb, null, true),
  (11010, 'fill', 'easy', 'أكمل: كلمه {{ϢⲀϢϤ}} , تعبر عن رقم كام؟ ____.', null, '"7"'::jsonb, null, true),
  (31022, 'truefalse', 'easy', 'كلمة {{ϤⲈⲚⲦ}} يعني عنكبوت.', null, 'false'::jsonb, null, true),
  (21006, 'mcq', 'medium', 'الحرف ((C)) ينطق ص امتى ؟', '["إذا جاء بعده حرف تضخيم ((A)) - ((W))","إذا جاء في كلمة يونانية","فيما عدا ذلك"]'::jsonb, '0'::jsonb, null, true),
  (21007, 'mcq', 'medium', 'الحرف ((T)) ينطق د امتى ؟', '["إذا جاء بعده حرف تضخيم","إذا جاء في كلمة يونانية وجاء قبله حرف ((N))","فيما عدا ذلك"]'::jsonb, '1'::jsonb, null, true),
  (21008, 'mcq', 'medium', 'يعني ايه كلمة {{ⲁⲫⲉ}}؟', '["يد","رأس","رجل"]'::jsonb, '1'::jsonb, null, true),
  (21010, 'mcq', 'medium', 'معنى كلمة {{ⲃⲁⲗ}}؟', '["يد","عين","رجل"]'::jsonb, '1'::jsonb, null, true),
  (21012, 'mcq', 'medium', 'ليه في كلمة ((AGGELOC)) حرف ال ((G)) الثانى اتنطق ج؟', '["علشان قبله حرف حلقى","علشان متكرر","علشان بعده حرف متحرك للكسر"]'::jsonb, '2'::jsonb, null, true),
  (21013, 'mcq', 'medium', 'ليه في كلمة ((AGGELOC)) حرف ال ((G)) الأول اتنطق ن؟', '["علشان بعده حرف حلقى","علشان متكرر","علشان بعده حرف متحرك للكسر"]'::jsonb, '0'::jsonb, null, true),
  (21014, 'mcq', 'medium', 'يعني ايه كلمة {{ⲈⲖⲔⲞ}}؟', '["جوافة","خوخ","جميز"]'::jsonb, '2'::jsonb, null, true),
  (21015, 'mcq', 'medium', 'يعني ايه كلمة {{ⲤⲞⲞⲨ  Ⲛ̀ϪⲰⲘ}}؟', '["الكتب","اقرا الكتب","6 كتب"]'::jsonb, '2'::jsonb, null, true),
  (21016, 'mcq', 'medium', 'يعني ايه كلمة {{ⲌⲎⲖⲞⲤ}}؟', '["جسد","حسد","فسد"]'::jsonb, '1'::jsonb, null, true),
  (31009, 'truefalse', 'medium', 'كلمة {{ⲤⲎⲒⲚⲒ}} يعني شاطئ.', null, 'false'::jsonb, null, true),
  (21017, 'mcq', 'medium', 'في كلمة {{ϢⲐⲎⲚ}}، حرف ((Ⲑ)) هنا بينطق ايه؟', '["ث","ت"]'::jsonb, '1'::jsonb, null, true),
  (21018, 'mcq', 'medium', 'يعني ايه كلمة {{ⲔⲈⲖⲒ}}؟', '["رجل","عضمة","ركبة"]'::jsonb, '2'::jsonb, null, true),
  (31010, 'truefalse', 'medium', 'كلمة {{ⲐⲞϢ}} يعني اقليم.', null, 'true'::jsonb, null, true),
  (11003, 'fill', 'medium', 'أكمل: كلمة {{ⲰⲒⲔ}} يعني ____.', null, '"خبز"'::jsonb, null, true),
  (11004, 'fill', 'medium', 'أكمل: كلمة {{ⲤⲞⲚ}} يعني ____.', null, '"أخ"'::jsonb, null, true),
  (11005, 'fill', 'medium', 'أكمل: كلمة {{ⲢⲞⲘⲠⲒ}} يعني ____.', null, '"سنة"'::jsonb, null, true),
  (11006, 'fill', 'medium', 'أكمل: كلمة {{ⲪⲈ}} يعني ____.', null, '"سماء"'::jsonb, null, true),
  (11007, 'fill', 'medium', 'أكمل: كلمة {{Ⲭ̀ⲖⲀⲖ}} يعني ____.', null, '"عقد"'::jsonb, null, true),
  (11008, 'fill', 'medium', 'أكمل: كلمة {{ⲮⲨⲬⲞⲤ}} يعني ____.', null, '"برد"'::jsonb, null, true),
  (11009, 'fill', 'medium', 'أكمل: كلمة (("IT)) تعبر عن رقم ____.', null, '"9"'::jsonb, null, true),
  (31011, 'truefalse', 'medium', 'كلمة {{ⲖⲀⲤ}} يعني فم.', null, 'false'::jsonb, null, true),
  (31012, 'truefalse', 'medium', 'كلمة {{ⲘⲀⲨ}} يعني أخت.', null, 'false'::jsonb, null, true),
  (31014, 'truefalse', 'medium', 'كلمة {{ⲖⲒⲜ}} يعني مخدة.', null, 'false'::jsonb, null, true),
  (31015, 'truefalse', 'medium', 'كلمة {{ⲢⲎ}} يعني شمس.', null, 'true'::jsonb, null, true),
  (31016, 'truefalse', 'medium', 'كلمة {{ⲔⲞⲤⲘⲞⲤ}} يعني عالم.', null, 'true'::jsonb, null, true),
  (21019, 'mcq', 'medium', 'في كلمة {{ⲤⲰ}}، حرف ((C)) هنا بينطق ايه؟', '["ص","س"]'::jsonb, '0'::jsonb, null, true),
  (21020, 'mcq', 'medium', 'في كلمة {{ⲈⲚⲦⲞⲖⲎ}}، حرف ((T)) هنا بينطق ايه؟', '["س","ص","ط","د"]'::jsonb, '3'::jsonb, null, true),
  (31017, 'truefalse', 'medium', 'كلمة {{ⲦⲀⲒⲞ}} يعني نعمة.', null, 'false'::jsonb, null, true),
  (31018, 'truefalse', 'medium', 'كلمة {{ⲞⲨⲢⲞ}} يعني ملكة.', null, 'false'::jsonb, null, true),
  (31019, 'truefalse', 'medium', 'كلمة {{ⲞⲨⲢⲰ}} يعني ملك.', null, 'false'::jsonb, null, true),
  (31020, 'truefalse', 'medium', 'كلمة {{ⲂⲨⲔⲔⲒ}} يعني حب العزيز.', null, 'true'::jsonb, null, true),
  (31023, 'truefalse', 'medium', 'كلمة ((QRE)) يعني جعان.', null, 'false'::jsonb, null, true),
  (11011, 'fill', 'medium', 'أكمل: كلمة {{Ϩ̀ⲘⲞⲨ}} يعني ____.', null, '"ملح"'::jsonb, null, true),
  (31024, 'truefalse', 'medium', 'كلمة {{ϪⲒϪ}} يعني يد.', null, 'true'::jsonb, null, true),
  (31025, 'truefalse', 'medium', 'كلمة {{ϪⲰⲘ}} يعني قوة.', null, 'false'::jsonb, null, true),
  (31026, 'truefalse', 'medium', 'كلمة {{ϬⲒⲤⲒ}} يعني يعظم.', null, 'true'::jsonb, null, true),
  (21022, 'mcq', 'medium', 'يعني ايه ((ⲁⲛⲟⲕ ⲡⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ ⲙⲡⲓⲕⲟⲥⲙⲟⲥ))؟', '["الله محبة","انا هو نور العالم","احبوا بعضكم بعضا"]'::jsonb, '1'::jsonb, null, true),
  (31030, 'truefalse', 'medium', 'معنى ((ϣⲱⲡⲓ ⲉⲣⲉⲧⲉⲛⲥⲉⲃⲧⲱⲧ)) هو: كونوا متيقظين.', null, 'false'::jsonb, null, true),
  (21025, 'mcq', 'hard', 'يعني ايه ((mareftoubo `nje pekran))؟', '["ليأت ملكوتك","ليتقدس اسمك"]'::jsonb, '1'::jsonb, null, true),
  (31037, 'truefalse', 'hard', 'كلمة ((JWM)) كلمة قبطية.', null, 'true'::jsonb, null, true),
  (31038, 'truefalse', 'hard', 'كلمة ((GRAVY)) فيها حرف ((G)) علشان كده هي كلمة يونانية.', null, 'true'::jsonb, null, true),
  (31044, 'truefalse', 'hard', 'أدوات تعريف خاصة تأتي أمام الكلمات اللي مش بتبدأ بالحروف بتاعة كلمة (فيلم نور)، زي ((Ⲡ̀)) - ((Ⲧ̀)).', null, 'true'::jsonb, null, true),
  (31043, 'truefalse', 'hard', 'أدوات تعريف خاصة تأتي أمام الكلمات اللي بتبدأ بالحروف بتاعة كلمة (فيلم نور)، زي ((Ⲫ̀)) - ((Ⲑ̀)).', null, 'true'::jsonb, null, true),
  (31042, 'truefalse', 'hard', 'أدوات التعريف العامة هي: ((PI)) - ((})) - ((NI)).', null, 'true'::jsonb, null, true),
  (31041, 'truefalse', 'hard', 'كلمة ((ANZYB)) هي كلمة قبطية.', null, 'true'::jsonb, null, true),
  (31040, 'truefalse', 'hard', 'لو الكلمة انتهت بالحروف الآتية: ((AC WC YC)) - ((AN WN YN))، تبقى كلمة يونانية.', null, 'false'::jsonb, null, true),
  (31039, 'truefalse', 'hard', 'الكلمة اللي بييجي فيها حرف ((U)) ينطق ى بتكون كلمة يونانية زي كلمة (("U<OC)).', null, 'true'::jsonb, null, true),
  (31036, 'truefalse', 'hard', 'كلمة أرض ((KAHI)) هي كلمة يونانية علشان فيها بعض من الحروف اللي بتيجي في الكلمات اليونانية.', null, 'false'::jsonb, null, true),
  (31035, 'truefalse', 'hard', 'شعار المهرجان بالقبطي هو:
((ⲧⲉⲛⲉⲣϩⲟⲩⲟ ϭⲣⲟ ⲉ̀ⲃⲟⲗ ϩⲓⲧⲉⲛ ⲫⲏⲉ̀ⲧⲁϥⲙⲉⲛⲣⲓⲧⲉⲛ)).', null, 'true'::jsonb, null, true),
  (31034, 'truefalse', 'hard', 'الجملة دى 
 {{''en Pxc? Ihc? Pen_}} 
 تساوى 
 {{''en Pi`xrictoc Ihcouc Pen_}}', null, 'true'::jsonb, null, true),
  (31033, 'truefalse', 'hard', 'معنى جملة: 
 ((alla nahmen `ebol ha pipethwou)) 
 لكن نجنا من الشرير.', null, 'true'::jsonb, null, true),
  (21029, 'mcq', 'hard', 'كلمة ((GY)) هي كلمة؟', '["قبطية","يونانية"]'::jsonb, '1'::jsonb, null, true),
  (21030, 'mcq', 'hard', 'حرف ((H)) (التنفسي الهائي) لو جه في أول الكلمة، بيخلي الكلمة؟', '["يونانية","قبطية"]'::jsonb, '0'::jsonb, null, true),
  (21028, 'mcq', 'hard', 'ايه هو شعار المهرجان بالعربي؟', '["شُكْرًا لِلَّهِ الَّذِي يُعْطِينَا النُّصْرَةَ بِرَبِّنَا يَسُوعَ الْمَسِيحِ","يَعْظُمُ انْتِصَارُنَا بِالَّذِي أَحَبَّنَا","فِي الْعَالَمِ سَيَكُونُ لَكُمْ ضِيقٌ، وَلكِنْ ثِقُوا: أَنَا قَدْ غَلَبْتُ الْعَالَمَ"]'::jsonb, '1'::jsonb, null, true),
  (21027, 'mcq', 'hard', 'يعني ايه بالقبطي: لأن لك القوة والمجد إلى الأبد آمين؟', '["{{`erwou. ouoh `mperenten `e''oun `epiracmoc alla}}","{{Je qwk te metouro nem jom nem pi`wou ]a `eneh. `Amhn}}","{{|wn `ntenxw `ebol `nnh`ete ouon `ntan `erwou}}"]'::jsonb, '1'::jsonb, null, true),
  (21026, 'mcq', 'hard', 'يعني ايه بالقبطي: كما نغفر نحن أيضا للمذنبين الينا؟', '["{{`m`vrh;. |wn `ntenxw `ebol `nnh`ete ouon `ntan `erwou}}","{{pete\\nak maref]wpi `m`vrh;}}","{{''en nivhou`i mareftoubo `nje pekran}}"]'::jsonb, '0'::jsonb, null, true),
  (31032, 'truefalse', 'hard', 'معنى 
 ((Penwik `nte rac; mhif nan `mvoou)) 
 هو: خبزنا الذي للغد أعطنا اليوم.', null, 'true'::jsonb, null, true),
  (31031, 'truefalse', 'hard', 'معنى 
 {{petehnak maref]wpi `m`vrh; ''en `tve nem \ijen pika\i}} 
 هو: لتكن مشيئتك، كما في السماء كذلك على الأرض.', null, 'true'::jsonb, null, true),
  (11014, 'fill', 'hard', 'أكمل: يعني ايه 
 {{ouo\ `mperenten `e''oun `epiracmoc}} ؟ ____', null, '"ولا تدخلنا في تجربة"'::jsonb, null, true),
  (11013, 'fill', 'hard', 'أكمل: يعني ايه 
 {{ouo\ xa nhet`eron nan `ebol}} ؟ ____', null, '"واغفر لنا ذنوبنا"'::jsonb, null, true),
  (11012, 'fill', 'hard', 'أكمل: يعني ايه 
 {{marec`i `nje tekmetouro}} ؟ ____', null, '"ليأت ملكوتك"'::jsonb, null, true),
  (21021, 'mcq', 'hard', 'يعني ايه الآلهة؟', '["((ni[oic))","((ninou]))","((ouka]))"]'::jsonb, '1'::jsonb, null, true),
  (31021, 'truefalse', 'hard', 'كلمة {{ⲤⲞⲚⲒ}} يعني أخت.', null, 'false'::jsonb, null, true),
  (31013, 'truefalse', 'hard', 'كلمة نووتي ((NOUTI)) يعني إله.', null, 'false'::jsonb, null, true),
  (21011, 'mcq', 'hard', 'كلمة (أرض) بالقبطي؟', '["((GY))","((GI))"]'::jsonb, '0'::jsonb, null, true),
  (21009, 'mcq', 'hard', 'الحرف كى ⲭ ينطق؟', '["ج-ش-ن","ع-ج-ك","ك-ش-خ","ف-ن-ع"]'::jsonb, '2'::jsonb, null, true),
  (31007, 'truefalse', 'hard', 'في كلمة {{Eua}}، الحرف ((U)) اتنطق هنا ڤ علشان جه بعده حرف ((A)).', null, 'false'::jsonb, null, true),
  (31029, 'truefalse', 'hard', 'معنى 
 ((ϫⲉⲙϯⲡⲓ ⲟⲥⲧⲉ ⲛⲧⲉⲧⲉⲛⲛⲁⲩ ϫⲉ ⲟⲩⲭⲣⲏⲥⲧⲟⲥ ⲡⲉ Ⲡϭⲟⲓⲥ)) 
 ذوقوا وانظروا ما أطيب الرب.', null, 'true'::jsonb, null, true),
  (21024, 'mcq', 'hard', 'يعني ايه 
 ((ⲉⲩⲉⲣⲟⲩⲱⲓⲛⲓ ⲛϫⲉ ⲛⲓⲃⲁⲗ ⲛⲧⲉ ⲛⲉⲧⲉⲛϩⲏⲧ))؟', '["مُسْتَنِيرَةً عُيُونُ أَذْهَانِكُمْ","صَابِرِينَ فِي الضِّيقِ","فَرِحِينَ فِي الرَّجَاءِ"]'::jsonb, '0'::jsonb, null, true),
  (21023, 'mcq', 'hard', 'يعني ايه 
 ((ⲁⲛⲟⲕ ⲡⲉ ⲡⲓⲱⲓⲕ ⲛⲧⲉ ⲡⲱⲛϧ))؟', '["انا هو خبز الحياة","انا هو الرب الهك","انا معك حينما تذهب"]'::jsonb, '0'::jsonb, null, true),
  (31028, 'truefalse', 'hard', 'معنى 
 ((Ouwnh `ebol `m`P[oic je ou`,ryctoc ou`aga;oc)) 
 اشكروا الرب لأنه صالح وخيِّر.', null, 'true'::jsonb, null, true),
  (31027, 'truefalse', 'hard', 'كلمة ((}PI)) يعني مذاق.', null, 'true'::jsonb, null, true),
  (21031, 'mcq', 'hard', 'يعني ايه 
 ((NENAGGELOC NTE }EKKLYCIA)) ؟', '["خدام الكنيسة","خدام المذبح","ملائكة الكنيسة"]'::jsonb, '2'::jsonb, null, true),
  (31045, 'truefalse', 'hard', '{{ⲞⲨ}} أداة تنكير للمفرد، و{{ϨⲀⲚ}} أداة تنكير للجمع.', null, 'true'::jsonb, null, true),
  (31046, 'truefalse', 'hard', '{{ⲠⲀⲒⲰⲦ ⲚⲈⲘ ⲦⲀⲘⲀⲨ}} يعني يوسف مع مريم.', null, 'false'::jsonb, null, true),
  (31047, 'truefalse', 'hard', 'كلمة {{ⲚⲈⲘⲀⲔ}} يعني معك.', null, 'true'::jsonb, null, true),
  (31048, 'truefalse', 'hard', 'كلمة {{ⲚⲈⲘⲰⲦⲈⲚ}} يعني معكم.', null, 'true'::jsonb, null, true),
  (11015, 'fill', 'hard', 'أكمل: {{Ⲡ⳪}} اختصار لكلمة ____.', null, '"الرب"'::jsonb, null, true),
  (11016, 'fill', 'hard', 'أكمل: {{ⲠⲬ̅Ⲥ̅}} اختصار لكلمة ____.', null, '"المسيح"'::jsonb, null, true),
  (31049, 'truefalse', 'hard', '{{ⲰϢ}} فعل ماضي.', null, 'false'::jsonb, null, true),
  (31050, 'truefalse', 'hard', '{{Ⲙ̀ⲠⲈⲢ}} بتتضاف عشان فعل الأمر.', null, 'false'::jsonb, null, true),
  (21032, 'mcq', 'hard', 'يعني ايه {{ⲀϢ}}؟', '["من - لمن - فمن","ما - كيف - ماذا","لماذا - كيف - من"]'::jsonb, '1'::jsonb, null, true),
  (31051, 'truefalse', 'hard', '{{ⲀϢ ⲠⲈ ⲠⲈⲦⲈⲚⲢⲀⲚ}} يعني اسمك ايه؟', null, 'false'::jsonb, null, true),
  (31052, 'truefalse', 'hard', '{{ⲠⲈⲢⲀⲚ}} يعني أسماؤكم.', null, 'false'::jsonb, null, true)
on conflict (id) do update set
  type       = excluded.type,
  difficulty = excluded.difficulty,
  question   = excluded.question,
  options    = excluded.options,
  answer     = excluded.answer,
  lang       = excluded.lang;

-- تحقق: المفروض يطلع easy 16، medium 38، hard 46
select difficulty, count(*) as عدد from questions group by difficulty order by difficulty;
