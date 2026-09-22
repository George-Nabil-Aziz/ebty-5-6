// بتفك ترميز {{ ... }} و (( ... )) لعناصر بالخط القبطي:
//   {{ ... }} -> الخط القبطي الأساسي
//   (( ... )) -> الخط القبطي التاني (بديل لو الرمز مش ظاهر صح في الأساسي)
// باقي النص بيتحط زي ما هو، والأسطر الجديدة بتتحول <br>.
//
// في ملف مشترك عشان الامتحان (js/script.js) وصفحة الأدمن (js/admin.js)
// الاتنين بيستخدموها — الأدمن في معاينة السؤال وهو بيتكتب.
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
