// إعدادات Supabase.
//
// المفتاح ده عام (anon) ومصمم أصلاً إنه يبقى ظاهر في المتصفح — الحماية الحقيقية
// في قواعد RLS اللي في db/schema.sql، مش في إخفاء المفتاح.
//
// ⚠️ متحطش هنا أبداً مفتاح service_role. ده بيتخطى كل قواعد الحماية، ولو اتكتب
//    في الـ repo يبقى أي حد يقدر يقرا ويمسح كل إجابات الطلبة.
//
// القيمتين دول بتجيبهم من: Supabase -> Project Settings -> API
const SUPABASE_URL = "PUT_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PUT_YOUR_ANON_PUBLIC_KEY_HERE";
