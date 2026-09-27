// سيرفر محلي بسيط لتشغيل الموقع على الجهاز: node dev/serve.js
//
// الموقع لازم يتفتح من http:// مش بفتح الملف مباشرة، لأن المتصفح بيمنع
// الاتصال بـ Supabase وبيقفل crypto.randomUUID من file://.
// مكتوب بمكتبات node الأساسية بس، عشان المشروع يفضل من غير npm.

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2]) || 8000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".sql": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);

    // منع الخروج بره مجلد المشروع
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("مش لاقي: " + urlPath);
        return;
      }
      const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`الموقع شغال على:`);
    console.log(`  الامتحان:   http://localhost:${PORT}/`);
    console.log(`  الإدارة:    http://localhost:${PORT}/pages/admin.html`);
    console.log(`  الاختبارات: http://localhost:${PORT}/dev/tests.html`);
    console.log(`\nاقفله بـ Ctrl+C`);
  });
