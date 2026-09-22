// إعدادات Supabase.
//
// المفتاح ده عام (publishable) ومصمم أصلاً إنه يبقى ظاهر في المتصفح — الحماية
// الحقيقية في قواعد RLS اللي في db/schema.sql، مش في إخفاء المفتاح.
// Supabase نفسها كاتبة جنبه في لوحة التحكم:
//   "Publishable keys can be safely shared publicly"
//
// ⚠️ متحطش هنا أبداً الـ Secret key (اللي بيبدأ بـ sb_secret_، وكان اسمه قبل كده
//    service_role). ده بيتخطى كل قواعد الحماية، ولو اتكتب في الـ repo يبقى أي حد
//    يقدر يقرا ويمسح كل إجابات الطلبة.
//
// القيمتين دول من: Supabase -> Project Settings -> Data API (الرابط)
//                                              -> API Keys  (المفتاح)
// ملحوظة: من غير /rest/v1/ اللي في آخر الـ API URL على لوحة التحكم — المكتبة
// بتضيف الجزء ده بنفسها.
const SUPABASE_URL = "https://mkfceidkpbelukgbpevy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Jo3ThTaSobhqIxnD-jLMzA_Nm-nQTFp";
