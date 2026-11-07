// Rollback Runner: an original mini-game for the wait.
// Jump the failing tests. Crash and you roll back to your last checkpoint;
// five failures in a row and "failure attribution" ends the run.
(function () {
  const dlg = document.getElementById("game");
  if (!dlg) return;
  const cv = document.getElementById("gCanvas"), ctx = cv.getContext("2d");
  const runEl = document.getElementById("gRun"), alertEl = document.getElementById("gAlert");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PX = 96, PW = 22, PHT = 28, GRAV = 0.8, JUMP = 13.4, CP_EVERY = 1400, SEG = 16, GAP = 3;
  let W = 0, HT = 0, C = {}, raf = 0, last = 0, st = null, best = 0, open = false;
  try { best = +localStorage.getItem("resolver-runner-best") || 0; } catch (e) {}

  function colors() {
    const s = getComputedStyle(document.documentElement), v = (n) => s.getPropertyValue(n).trim();
    C = {
      bg: v("--surface-2"), dot: v("--border"), line: v("--border-strong"), text: v("--text"), text2: v("--text-2"), text3: v("--text-3"),
      ok: v("--series-3"), acc: v("--accent"), accText: v("--accent-text"), warn: v("--warning"), bad: v("--danger"), badBg: v("--danger-subtle"),
      overlay: v("--overlay"), sans: v("--font-sans"), mono: v("--font-mono"),
    };
  }
  function size() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; HT = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(HT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const ground = () => HT - 56;
  const score = () => Math.floor(st.dist / 12);
  const rr = (x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };

  function snap() { return { dist: st.dist, speed: st.speed, obs: st.obs.map((o) => ({ ...o })), nextObs: st.nextObs }; }
  function reset() {
    st = { mode: "ready", dist: 0, speed: 5.4, h: 0, v: 0, obs: [], nextObs: 760, cp: 0, nextCp: CP_EVERY, fails: 0, rootAt: 0, hist: [], rw: 0, msg: "", msgT: 0, saved: null };
    st.saved = snap();
  }
  function say(m) { st.msg = m; st.msgT = 140; }
  function act() {
    if (st.mode === "ready" || st.mode === "over") { reset(); st.mode = "run"; say("Checkpoint CP-0 saved"); return; }
    if (st.mode === "paused") { if (alertEl.hidden) st.mode = "run"; return; }
    if (st.mode === "run" && st.h <= 0.01) st.v = JUMP;
  }
  function spawn() {
    while (st.nextObs < st.dist + W + 160) {
      const tall = st.speed > 6.2 && Math.random() < 0.3;
      st.obs.push({ x: st.nextObs, w: 22, h: tall ? 52 : 28 });
      st.nextObs += 300 + Math.random() * 300 + st.speed * 24;
    }
    st.obs = st.obs.filter((o) => o.x > st.dist - PX - 80);
  }
  function update(k) {
    if (st.msgT > 0) st.msgT -= k;
    if (st.mode === "rewind") {
      // Play the last moments backwards, then restore the checkpoint.
      for (let i = 0; i < 3 && st.hist.length; i++) { const f = st.hist.pop(); st.dist = f.dist; st.h = f.h; st.obs = f.obs; }
      st.rw -= k;
      if (st.rw <= 0 || !st.hist.length) restore();
      return;
    }
    if (st.mode !== "run") return;
    st.speed = Math.min(12, st.speed + 0.0011 * k);
    st.dist += st.speed * k;
    st.v -= GRAV * k;
    st.h = Math.max(0, st.h + st.v * k);
    if (st.h === 0 && st.v < 0) st.v = 0;
    spawn();
    if (st.dist >= st.nextCp) { st.cp++; st.nextCp += CP_EVERY; st.fails = 0; st.saved = snap(); say(`Checkpoint CP-${st.cp} saved`); }
    st.hist.push({ dist: st.dist, h: st.h, obs: st.obs.map((o) => ({ ...o })) });
    if (st.hist.length > 140) st.hist.shift();
    const g = ground(), x1 = PX + 3, x2 = PX + PW - 3, yTop = g - st.h - PHT + 3, yBot = g - st.h - 1;
    for (const o of st.obs) {
      const ox = o.x - st.dist + PX;
      if (ox + 3 < x2 && ox + o.w - 3 > x1 && g - o.h + 2 < yBot && g > yTop) { crash(); break; }
    }
  }
  function crash() {
    if (st.fails === 0) st.rootAt = score();
    st.fails++;
    if (st.fails >= 5) {
      st.mode = "over";
      if (score() > best) { best = score(); try { localStorage.setItem("resolver-runner-best", best); } catch (e) {} }
      return;
    }
    st.mode = "rewind";
    st.rw = reduced ? 1 : 36;
  }
  function restore() {
    const s = st.saved;
    st.dist = s.dist;
    st.speed = Math.max(5.4, s.speed - 0.4);
    st.obs = s.obs.filter((o) => o.x > s.dist + 460);
    st.nextObs = Math.max(s.nextObs, s.dist + 520);
    st.h = 0; st.v = 0; st.hist = []; st.mode = "run";
    say(`Rolled back to CP-${st.cp} · failure ${st.fails} of 5`);
  }

  // ---------- Drawing ----------
  function banner(text, color) {
    ctx.font = `500 13px ${C.sans}`;
    const w = ctx.measureText(text).width + 28;
    ctx.fillStyle = C.overlay; rr(W / 2 - w / 2, 40, w, 30, 15); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1; rr(W / 2 - w / 2 + 0.5, 40.5, w - 1, 29, 15); ctx.stroke();
    ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, W / 2, 55);
    ctx.textAlign = "left";
  }
  function panel(title, body, hint) {
    ctx.globalAlpha = 0.88; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, HT); ctx.globalAlpha = 1;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.text; ctx.font = `600 20px ${C.sans}`; ctx.fillText(title, W / 2, HT / 2 - 34);
    ctx.fillStyle = C.text2; ctx.font = `400 14px ${C.sans}`; ctx.fillText(body, W / 2, HT / 2 - 4);
    ctx.fillStyle = C.accText; ctx.font = `500 13px ${C.mono}`; ctx.fillText(hint, W / 2, HT / 2 + 30);
    ctx.textAlign = "left";
  }
  function draw() {
    const g = ground();
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, HT);
    // Quiet dot grid, drifting slower than the ground for depth.
    ctx.fillStyle = C.dot;
    const off = (st.dist * 0.25) % 24;
    for (let x = 12 - off; x < W; x += 24) for (let y = 18; y < g - 8; y += 24) ctx.fillRect(x, y, 1.5, 1.5);
    // The ground is a run timeline; checkpoint segments are violet.
    ctx.fillStyle = C.line; ctx.fillRect(0, g, W, 1);
    const unit = SEG + GAP;
    for (let i = Math.floor((st.dist - PX) / unit); ; i++) {
      const wx = i * unit, sx = wx - st.dist + PX;
      if (sx > W) break;
      ctx.fillStyle = Math.floor((wx + unit) / CP_EVERY) > Math.floor(wx / CP_EVERY) ? C.acc : C.ok;
      rr(sx, g + 14, SEG, 8, 2); ctx.fill();
    }
    // Checkpoint flags
    ctx.font = `500 11px ${C.mono}`; ctx.textBaseline = "bottom";
    for (let k = Math.max(1, Math.floor((st.dist - PX) / CP_EVERY)); k * CP_EVERY - st.dist + PX < W + 40; k++) {
      const sx = k * CP_EVERY - st.dist + PX;
      ctx.fillStyle = C.accText; ctx.fillRect(sx, g - 46, 2, 46);
      rr(sx + 2, g - 46, 18, 12, 2); ctx.fill();
      ctx.fillStyle = C.text3; ctx.fillText(`CP-${k}`, sx - 2, g - 50);
    }
    // Failing tests
    ctx.lineWidth = 1.5;
    for (const o of st.obs) {
      const sx = o.x - st.dist + PX;
      if (sx > W || sx + o.w < 0) continue;
      const blocks = o.h > 40 ? 2 : 1, bh = o.h / blocks;
      for (let b = 0; b < blocks; b++) {
        const y = g - o.h + b * bh;
        ctx.fillStyle = C.badBg; rr(sx, y + 1, o.w, bh - 2, 4); ctx.fill();
        ctx.strokeStyle = C.bad; rr(sx + 0.75, y + 1.75, o.w - 1.5, bh - 3.5, 4); ctx.stroke();
        const cx = sx + o.w / 2, cy = y + bh / 2;
        ctx.beginPath(); ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 4, cy + 4); ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx - 4, cy + 4); ctx.stroke();
      }
    }
    // The agent: a violet caret with a short motion trail in the air.
    if (st.h > 2) {
      for (let i = 1; i <= 2; i++) {
        const f = st.hist[st.hist.length - 1 - i * 3];
        if (!f) continue;
        ctx.globalAlpha = 0.18 / i; ctx.fillStyle = C.acc; rr(PX - i * 7, g - f.h - PHT, PW, PHT, 5); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const py = g - st.h - PHT;
    ctx.fillStyle = C.acc; rr(PX, py, PW, PHT, 5); ctx.fill();
    ctx.globalAlpha = 0.3; ctx.fillStyle = "#ffffff"; rr(PX + 5, py + 6, 3, PHT - 12, 1.5); ctx.fill(); ctx.globalAlpha = 1;
    // Readout
    ctx.font = `500 12px ${C.mono}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = C.text2; ctx.fillText(`Steps ${score()}`, 16, 14);
    ctx.fillStyle = C.text3; ctx.fillText(`CP-${st.cp}`, 128, 14);
    ctx.fillStyle = st.fails ? C.warn : C.text3; ctx.fillText(`Failures ${st.fails}/5`, 188, 14);
    ctx.textAlign = "right"; ctx.fillStyle = C.text3; ctx.fillText(`Best ${best}`, W - 16, 14); ctx.textAlign = "left";
    // Moments and overlays
    if (st.mode === "rewind") {
      ctx.globalAlpha = 0.14; ctx.fillStyle = C.warn; ctx.fillRect(0, 0, W, HT); ctx.globalAlpha = 1;
      banner(`Rolling back to CP-${st.cp}`, C.warn);
    } else if (st.mode === "run" && st.msgT > 0) {
      ctx.globalAlpha = Math.min(1, st.msgT / 30);
      banner(st.msg, st.msg.startsWith("Rolled") ? C.warn : C.accText);
      ctx.globalAlpha = 1;
    }
    if (st.mode === "ready") panel("Rollback Runner", "Jump the failing tests. Crash and you roll back to your last checkpoint.", "Press Space or click to start");
    if (st.mode === "paused") panel("Paused", "Your run keeps going in the background.", "Press Space to continue");
    if (st.mode === "over") panel("Failure attribution: 5 in a row", `Root cause traced to step ${st.rootAt}. You reached step ${score()}.`, "Press Space to run again");
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    const k = last ? Math.min(3, (t - last) / 16.67) : 1;
    last = t;
    update(k);
    draw();
  }

  // ---------- Controls ----------
  dlg.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      if (e.target.closest("button, a")) return;
      e.preventDefault(); act();
    }
    if ((e.key === "p" || e.key === "P") && st) st.mode = st.mode === "paused" ? "run" : st.mode === "run" ? "paused" : st.mode;
  });
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); cv.focus(); act(); });
  document.getElementById("gClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => { open = false; cancelAnimationFrame(raf); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && st && st.mode === "run") st.mode = "paused"; });
  window.addEventListener("resize", () => { if (open) size(); });
  new MutationObserver(() => { if (open) colors(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.getElementById("gReview").addEventListener("click", () => dlg.close());

  window.RollbackRunner = {
    open() {
      if (open) return;
      dlg.showModal();
      open = true;
      colors(); size();
      if (!st || st.mode === "over") reset();
      if (st.mode === "run") st.mode = "paused";
      last = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
      cv.focus();
    },
    isOpen: () => open,
    setStatus({ text, need }) {
      runEl.classList.toggle("need", !!need);
      runEl.innerHTML = '<span class="dot"></span>' + text;
    },
    alert(on) {
      alertEl.hidden = !on;
      if (on && st && st.mode === "run") st.mode = "paused";
    },
  };
})();
