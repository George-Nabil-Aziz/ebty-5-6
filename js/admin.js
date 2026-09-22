// منطق صفحة الأدمن.
// "أدمن" = "مسجّل دخول" — مفيش أدوار ولا صلاحيات، لأن فيه حساب واحد بس.
// الحماية الحقيقية في سياسات RLS اللي في db/schema.sql، مش في الكود ده.

const loginSection = document.getElementById("admin-login");
const mainSection = document.getElementById("admin-main");
const errorEl = document.getElementById("admin-error");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("admin-login-btn");

const TAB_IDS = ["add", "list", "attempts", "stats"];

function adminError(message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("hidden", !message);
}

function showAdminTab(name) {
  adminError("");
  TAB_IDS.forEach((id) => {
    document.getElementById("tab-" + id).classList.toggle("hidden", id !== name);
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });

  if (name === "add") renderAddTab();
  if (name === "list") renderListTab();
  if (name === "attempts") renderAttemptsTab();
  if (name === "stats") renderStatsTab();
}

function showLoggedIn(isLoggedIn) {
  loginSection.classList.toggle("hidden", isLoggedIn);
  mainSection.classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) showAdminTab("add");
}

loginBtn.addEventListener("click", async () => {
  adminError("");
  loginBtn.disabled = true;
  try {
    const { error } = await db.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value,
    });
    if (error) {
      adminError("الإيميل أو الباسورد غلط.");
      return;
    }
    passwordInput.value = "";
    showLoggedIn(true);
  } finally {
    loginBtn.disabled = false;
  }
});

document.getElementById("admin-logout-btn").addEventListener("click", async () => {
  await db.auth.signOut();
  showLoggedIn(false);
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => showAdminTab(btn.dataset.tab));
});

// التبويبات فاضية دلوقتي، بتتملى في الخطوات الجاية.
function renderAddTab() {}
function renderListTab() {}
function renderAttemptsTab() {}
function renderStatsTab() {}

// الجلسة محفوظة في localStorage، فلو داخل من قبل مبيسألش تاني.
db.auth.getSession().then(({ data }) => showLoggedIn(Boolean(data.session)));
