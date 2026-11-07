// Shared prototype behaviour: theme toggle, password reveal, and ?state= screen variants.
(function () {
  const root = document.documentElement;
  const state = new URLSearchParams(location.search).get("state") || "default";

  // Show only the variant asked for: [data-state="error"] appears for ?state=error,
  // [data-state-not="sent"] hides for ?state=sent.
  document.querySelectorAll("[data-state]").forEach((el) => { el.hidden = el.dataset.state.split(" ").indexOf(state) === -1; });
  document.querySelectorAll("[data-state-not]").forEach((el) => { el.hidden = el.dataset.stateNot.split(" ").indexOf(state) !== -1; });
  document.querySelectorAll("[data-state-class]").forEach((el) => {
    const [s, cls] = el.dataset.stateClass.split(":");
    el.classList.toggle(cls, s === state);
    if (s === state && el.matches("input")) el.setAttribute("aria-invalid", "true");
  });

  const paint = () => window.lucide && lucide.createIcons();
  const btn = document.getElementById("themeBtn");
  const setTheme = (t) => {
    root.dataset.theme = t;
    if (btn) {
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.innerHTML = '<i data-lucide="' + (t === "dark" ? "sun" : "moon") + '"></i>';
    }
    paint();
    try { localStorage.setItem("resolver-theme", t); } catch (e) {}
  };
  if (btn) btn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  setTheme(root.dataset.theme || "dark");

  document.querySelectorAll(".reveal").forEach((b) => b.addEventListener("click", () => {
    const input = b.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    b.setAttribute("aria-label", show ? "Hide password" : "Show password");
    b.innerHTML = '<i data-lucide="' + (show ? "eye-off" : "eye") + '"></i>';
    paint();
  }));

  // Prototype forms don't submit anywhere; they follow the demo flow.
  document.querySelectorAll("form").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    if (f.dataset.next) location.href = f.dataset.next;
  }));
})();

// Mini timelines: data-p is one character per step.
// 1 passed, r rolled back, f flagged, c current, e not run yet.
document.querySelectorAll(".mini[data-p]").forEach((m) => {
  const cls = { r: "rb", f: "fl", c: "cur", e: "e" };
  for (const ch of m.dataset.p) {
    const s = document.createElement("i");
    if (cls[ch]) s.className = cls[ch];
    m.appendChild(s);
  }
});

// Table rows that open a page
document.querySelectorAll("tr[data-href]").forEach((r) => r.addEventListener("click", () => (location.href = r.dataset.href)));

// Account menu on the top-bar avatar: profile, theme and log out.
(function () {
  const me = document.querySelector(".topbar .me");
  if (!me) return;
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "me"; btn.id = me.id || "";
  btn.textContent = me.textContent;
  btn.setAttribute("aria-label", "Account menu for Adan Javed");
  btn.setAttribute("aria-haspopup", "menu"); btn.setAttribute("aria-expanded", "false");
  me.replaceWith(btn);
  const role = (document.querySelector(".topbar .org small") || {}).textContent || "Owner";
  const menu = document.createElement("div");
  menu.className = "acct"; menu.hidden = true; menu.setAttribute("role", "menu");
  menu.innerHTML = `<div class="who"><span class="me">${btn.textContent}</span><div><b>Adan Javed</b><span>adan@acme-labs.dev</span></div></div>
    <div class="org-row"><span>acme-labs</span><span>${role}</span></div><hr>
    <a role="menuitem" href="settings.html#profile"><i data-lucide="user"></i>Profile and settings</a>
    <button role="menuitem" class="item" type="button" data-act="theme"><i data-lucide="sun-moon"></i>Theme<span class="end"></span></button>
    <a role="menuitem" href="loading.html"><i data-lucide="sparkles"></i>Loading states</a><hr>
    <button role="menuitem" class="item" type="button" data-act="logout"><i data-lucide="log-out"></i>Log out</button>`;
  document.body.appendChild(menu);
  const themeLabel = () => (menu.querySelector(".end").textContent = document.documentElement.dataset.theme === "light" ? "Light" : "Dark");
  const close = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    if (open) { themeLabel(); if (window.lucide) lucide.createIcons(); menu.querySelector("a").focus(); }
  });
  menu.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    if (b.dataset.act === "theme") { const t = document.getElementById("themeBtn"); if (t) t.click(); themeLabel(); }
    if (b.dataset.act === "logout") location.href = "login.html?state=signedout";
  });
  document.addEventListener("click", (e) => { if (!menu.hidden && !e.target.closest(".acct")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { close(); btn.focus(); } });
})();
