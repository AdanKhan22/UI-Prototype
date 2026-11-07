// Live run page. One render() draws the whole page for a moment in the run.
// H = latest step the run has reached, V = step being viewed (time travel),
// running = step H is still executing.
(function () {
  const R = window.RUN, S = R.steps, N = S.length;
  const qs = new URLSearchParams(location.search);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mode = qs.has("demo") ? "demo" : qs.get("state") === "held" ? "held" : "live";
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  let H = 1, V = 1, running = false, revealed = 0, follow = true, ready = false, snapNext = true;
  let liveSecs = 0, liveTok = 0, tab = "term", paused = false, pending = null, timer = null, finished = false, notify = false;
  const events = new Set(), undoing = new Set();
  let cancelled = false;
  const CANCEL_LINES = ["!^C", "! Run cancelled by Adan J.", ".docker stop resolver-run-0142 ... stopped in 0.4s", ".docker rm resolver-run-0142 ... sandbox destroyed", "~Repository untouched. Checkpoints and logs kept for the audit trail."];
  const FIRST_FAIL = S.findIndex((s) => s.fail) + 1;

  // ---------- Icons: render each Lucide icon once, then reuse its markup ----------
  const ICONS = {}, PATHS = {};
  (function () {
    const names = ["circle-slash", "circle-check", "undo-2", "loader-circle", "flag", "shield-alert", "shield", "crosshair", "eye", "play", "pause",
      "rotate-ccw", "bell", "bell-ring", "maximize-2", "minimize-2", "check", "download"];
    const box = document.createElement("div");
    box.hidden = true;
    box.innerHTML = names.map((n) => `<i data-lucide="${n}"></i>`).join("");
    document.body.appendChild(box);
    lucide.createIcons();
    box.querySelectorAll("svg").forEach((svg, i) => { ICONS[names[i]] = svg.outerHTML; PATHS[names[i]] = svg.innerHTML; });
    box.remove();
  })();
  const ico = (n) => ICONS[n] || "";
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- Run model ----------
  const phaseOf = (n) => R.phases.find((p) => n >= p[1] && n <= p[2]) || R.phases[0];
  const hash7 = (n) => ((Math.imul(n + 7, 2654435761) >>> 0).toString(16) + "0000000").slice(0, 7);
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const doneAt = (T) => (T === H && running ? T - 1 : T);
  const falatDone = () => events.has("falat") && doneAt(H) >= R.falat.after;
  const gateDone = () => events.has("gate") && doneAt(H) >= R.gate.step;

  function status(n, T) {
    if (cancelled && n === H) return "can";
    if (n === T && T === H && running) return "cur";
    const s = S[n - 1], d = doneAt(T);
    if (s.fail) return "rb";
    if (n >= R.falat.from && n <= R.falat.to && events.has("falat") && d >= R.falat.after) return "rbf";
    if (n === R.gate.source && events.has("gate") && d >= R.gate.step) return "src";
    if (n === R.gate.step && events.has("gate") && d >= R.gate.step) return "fl";
    return "ok";
  }
  // The state each step started from: failed steps were rolled back, and the
  // root-cause rollback sends the run back to the checkpoint before step 10.
  function parentOf(n) {
    if (n <= 1) return 0;
    let p = n - 1;
    while (p >= 1 && S[p - 1].fail) p--;
    if (falatDone() && n > R.falat.after && p >= R.falat.from && p <= R.falat.to) p = R.falat.from - 1;
    return p;
  }
  const laneMemo = new Map();
  function laneOf(n) {
    if (n <= 0) return 0;
    if (laneMemo.has(n)) return laneMemo.get(n);
    let l;
    if (n >= R.falat.from && n <= R.falat.to) l = falatDone() ? 1 : 0;
    else if (S[n - 1].fail && status(n, H) !== "cur") l = laneOf(parentOf(n)) + 1;
    else l = laneOf(parentOf(n));
    laneMemo.set(n, l);
    return l;
  }

  function partial(T) {
    if (!(T === H && running)) return 1;
    if (mode === "live") return null;
    return S[T - 1].out.length ? revealed / S[T - 1].out.length : 1;
  }
  function stepTok(n) {
    if (n === H && running) { const p = partial(n); return p === null ? liveTok : Math.round(S[n - 1].tok * p); }
    return S[n - 1].tok;
  }
  function elapsed(T) {
    let t = 0;
    for (let i = 0; i < T - 1; i++) t += S[i].dur;
    const p = partial(T);
    return t + (p === null ? liveSecs : S[T - 1].dur * p);
  }
  function tokens(T) {
    let t = 0;
    for (let n = 1; n < T; n++) t += S[n - 1].tok;
    return t + stepTok(T);
  }

  // Tamper-evident audit chain: each entry's SHA-256 covers the previous hash.
  const AUD = [];
  (async function () {
    let prev = "0".repeat(64);
    for (let n = 1; n <= N; n++) {
      const body = JSON.stringify({ step: n, command: S[n - 1].cmd, prev });
      let h;
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
        h = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
      } catch (e) {
        let a = 0x811c9dc5; for (const ch of body) { a ^= ch.charCodeAt(0); a = Math.imul(a, 16777619) >>> 0; }
        h = (a.toString(16).padStart(8, "0")).repeat(8);
      }
      AUD[n] = { hash: h, prev };
      prev = h;
    }
  })();

  // ---------- Graph: structure ----------
  const PH = 26, GH = 214, LG = 46, PADL = 20, PADR = 22;
  const gWrap = $("gWrap"), gEdges = $("gEdges"), gNodes = $("gNodes"), gBar = $("gBar"), tip = $("tip");
  let W = 0, dx = 1, y0 = 107;
  const xOf = (n) => PADL + n * dx;
  const P = {}, TG = {}, nodeEls = [], edgeEls = [];
  const ghostLine = mk("path", { class: "ghost-line" }, gEdges);
  const ghostGate = mk("path", { class: "ghost-gate" }, gEdges);

  const phaseEls = R.phases.map(([name, a, b]) => {
    const el = document.createElement("div");
    el.className = "phase" + (name === "Gate" ? " gate" : "");
    el.dataset.a = a; el.dataset.b = b;
    el.innerHTML = (name === "Gate" ? ico("shield") : "") + `<b>${name}</b>` + (b > a ? `<span class="r">${a}–${b}</span>` : "");
    $("gPhases").appendChild(el);
    return el;
  });
  const segs = S.map(() => { const i = document.createElement("i"); i.className = "seg e"; gBar.insertBefore(i, gBar.firstChild); return i; });

  function nodeEl(n) {
    if (nodeEls[n]) return nodeEls[n];
    const g = mk("g", { "data-n": n }, gNodes);
    const inner = mk("g", { class: "in" + (ready && !reduced ? " pop" : "") }, g);
    inner.addEventListener("animationend", () => inner.classList.remove("pop", "flash"));
    ["spin", "sel", "red", "root"].forEach((k) => mk("circle", { class: "ring " + k, r: k === "root" ? 17 : 16 }, inner));
    if (n === 0) mk("circle", { class: "core", r: 6 }, inner);
    else if (n === R.gate.step) {
      mk("path", { class: "core", d: "M0 -13 L13 0 L0 13 L-13 0 Z" }, inner);
      const gl = mk("g", { class: "glyph", transform: "translate(-6.5 -6.5) scale(0.54)", fill: "none", stroke: "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" }, inner);
      gl.innerHTML = PATHS["shield"];
    } else {
      mk("circle", { class: "core", r: 11 }, inner);
      const t = mk("text", { class: "num", "text-anchor": "middle", dy: "0.35em" }, inner);
      t.textContent = n;
    }
    nodeEls[n] = g;
    return g;
  }
  function edgeEl(n) {
    if (!edgeEls[n]) edgeEls[n] = mk("path", { class: "edge" + (ready && !reduced ? " new" : "") }, gEdges);
    return edgeEls[n];
  }
  function dropNodesAfter(h) {
    for (let n = h + 1; n <= N; n++) {
      if (nodeEls[n]) { nodeEls[n].remove(); nodeEls[n] = null; }
      if (edgeEls[n]) { edgeEls[n].remove(); edgeEls[n] = null; }
      delete P[n]; delete TG[n];
    }
  }
  function nodeClass(n) {
    if (n === 0) return "node start";
    const st = status(n, H);
    let c = "node " + st;
    if (undoing.has(n)) c += " undoing";
    if (falatDone() && n === R.falat.root) c += " is-root";
    if (st === "src") c += " is-src";
    if (!follow && n === V) c += " is-sel";
    if (n === hotN) c += " hot";
    if (n > V) c += " after";
    return c;
  }
  function edgeClass(n) {
    const st = status(n, H);
    let c = "edge";
    if (st === "cur") c += " live";
    else if (st === "can") c += " can";
    else if (st === "rb") c += " fail";
    else if (st === "rbf" || undoing.has(n)) c += " undone";
    if (n > V) c += " after";
    if (edgeEls[n] && edgeEls[n].classList.contains("new")) c += " new";
    return c;
  }

  function renderGraph() {
    laneMemo.clear();
    W = gWrap.clientWidth;
    dx = (W - PADL - PADR) / N;
    let maxLane = 0;
    for (let n = 1; n <= H; n++) maxLane = Math.max(maxLane, laneOf(n));
    if (falatDone()) maxLane = Math.max(maxLane, 2);
    const contentH = maxLane * LG + 24 + (gateDone() ? 64 : 0);
    y0 = Math.round((GH - contentH) / 2 + maxLane * LG + 12);

    dropNodesAfter(H);
    for (let n = 0; n <= H; n++) {
      TG[n] = { x: xOf(n), y: y0 - laneOf(n) * LG };
      if (!P[n] || snapNext) P[n] = { x: TG[n].x, y: TG[n].y };
      nodeEl(n).setAttribute("class", nodeClass(n));
      if (n >= 1) edgeEl(n).setAttribute("class", edgeClass(n));
    }
    // Phase labels and the scrub bar share the graph's x scale.
    phaseEls.forEach((el) => {
      const a = +el.dataset.a, b = +el.dataset.b, l = xOf(a) - dx / 2 + 2, r = xOf(b) + dx / 2 - 2;
      el.style.left = l + "px"; el.style.width = Math.max(8, r - l) + "px";
      el.classList.toggle("on", V >= a && V <= b);
    });
    const w = Math.max(3, dx - 4);
    segs.forEach((el, i) => {
      const n = i + 1, flash = el.classList.contains("flash");
      el.style.left = xOf(n) - w / 2 + "px"; el.style.width = w + "px";
      el.className = "seg " + (n > H ? "e" : status(n, H)) + (n > V && n <= H ? " after" : "") + (flash ? " flash" : "");
    });
    $("playhead").style.left = xOf(V) + "px";
    $("gCursor").hidden = follow;
    $("gCursor").style.left = xOf(V) + "px";
    gWrap.setAttribute("aria-valuemax", H);
    gWrap.setAttribute("aria-valuenow", V);
    gWrap.setAttribute("aria-valuetext", `Step ${V} of ${H}: ${S[V - 1].cmd}`);
    const snapped = snapNext || document.hidden;
    snapNext = false;
    if (snapped || reduced) for (const k in TG) P[k] = { x: TG[k].x, y: TG[k].y };
    // Place everything now (new nodes included); the tween then eases any movement.
    drawGraph();
    if (!snapped && !reduced) tween();
  }

  // Next tick from whichever arrives first: an animation frame (smooth when
  // visible) or a short timer (keeps moving when the browser throttles frames).
  function nextTick(fn) {
    let done = false;
    const go = () => { if (!done) { done = true; fn(performance.now()); } };
    requestAnimationFrame(go);
    setTimeout(go, 34);
  }

  // Positions ease toward their targets, so branches lift and drop smoothly.
  let tweening = false;
  function tween() {
    if (tweening) return;
    tweening = true;
    let last = performance.now();
    nextTick(function step(now) {
      const a = 1 - Math.pow(0.84, Math.min(4, (now - last) / 16.7));
      last = now;
      let moving = false;
      for (const k in TG) {
        const p = P[k], t = TG[k];
        if (!p) continue;
        const ex = t.x - p.x, ey = t.y - p.y;
        if (Math.abs(ex) > 0.3 || Math.abs(ey) > 0.3) { p.x += ex * a; p.y += ey * a; moving = true; }
        else { p.x = t.x; p.y = t.y; }
      }
      drawGraph();
      if (moving) nextTick(step); else tweening = false;
    });
  }

  function edgePath(pn, n) {
    const a = P[pn], b = P[n];
    if (!a || !b) return "";
    if (S[n - 1].fail && status(n, H) !== "cur") {
      const r = Math.max(0, Math.min(10, a.y - b.y, b.x - a.x));
      return `M${a.x} ${a.y} H${b.x - r} Q${b.x} ${a.y} ${b.x} ${a.y - r} V${b.y}`;
    }
    const m = b.x - a.x;
    return `M${a.x} ${a.y} C${a.x + m * 0.55} ${a.y} ${b.x - m * 0.55} ${b.y} ${b.x} ${b.y}`;
  }
  let provShown = false;
  function drawGraph() {
    for (let n = 0; n <= H; n++) {
      const p = P[n];
      if (!p || !nodeEls[n]) continue;
      nodeEls[n].setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      if (n >= 1 && edgeEls[n]) edgeEls[n].setAttribute("d", edgePath(parentOf(n), n));
    }
    // The gate always waits at the end of the run.
    const gx = xOf(N), gy = y0;
    if (H < N && P[H] && !cancelled) {
      ghostGate.setAttribute("d", `M${gx} ${gy - 12} L${gx + 12} ${gy} L${gx} ${gy + 12} L${gx - 12} ${gy} Z`);
      ghostLine.setAttribute("d", `M${P[H].x + 18} ${P[H].y} L${gx - 16} ${gy}`);
      ghostGate.style.display = ghostLine.style.display = "";
    } else ghostGate.style.display = ghostLine.style.display = "none";

    // Labels on the graph
    const root = R.falat.root;
    // Centre the label over the branch, but slide it left if it would cover the first failed attempt.
    place($("chipRoot"), falatDone() && P[root] && P[root + 1], () => {
      const half = $("chipRoot").offsetWidth / 2, stub = P[FIRST_FAIL];
      let x = (P[root].x + P[root + 1].x) / 2;
      if (stub) x = Math.min(x, stub.x - 16 - half);
      return [Math.max(half, x), PH + P[root].y - LG];
    });
    const back = R.falat.from - 1, resume = R.falat.after + 1;
    place($("chipResume"), falatDone() && P[back] && P[resume], () => [(P[back].x + P[resume].x) / 2, PH + P[back].y]);

    const prov = $("provPath"), mask = $("provMaskPath"), a = P[R.gate.step], b = P[R.gate.source];
    if (gateDone() && a && b) {
      const mx = (a.x + b.x) / 2, d = `M${a.x} ${a.y} Q${mx} ${a.y + 100} ${b.x} ${b.y}`;
      prov.setAttribute("d", d); mask.setAttribute("d", d); prov.style.display = "";
      place($("chipProv"), true, () => [mx, PH + a.y + 50]);
      if (!provShown) {
        provShown = true;
        if (ready && !reduced) {
          const L = mask.getTotalLength();
          mask.style.transition = "none"; mask.style.strokeDasharray = L; mask.style.strokeDashoffset = L;
          mask.getBoundingClientRect();
          mask.style.transition = "stroke-dashoffset 1200ms cubic-bezier(.2,.8,.2,1)";
          mask.style.strokeDashoffset = 0;
          setTimeout(() => { mask.style.transition = ""; mask.style.strokeDasharray = "none"; }, 1300);
        }
      }
    } else { prov.style.display = "none"; provShown = false; place($("chipProv"), false); }
  }
  function place(el, on, xy) {
    el.classList.toggle("on", !!on);
    if (on) { const [x, y] = xy(); el.style.left = x + "px"; el.style.top = y + "px"; }
  }

  // ---------- Render ----------
  let nowKey = "";
  function render() {
    if (follow) V = H;
    const held = gateDone() && !running;

    // Header
    const badge = $("badge"), want = cancelled ? "can" : held ? "held" : "run";
    if (badge.dataset.k !== want) {
      badge.dataset.k = want;
      badge.className = cancelled ? "badge b-neutral" : held ? "badge b-warn" : "badge b-run";
      badge.innerHTML = cancelled ? ico("circle-slash") + "Cancelled" : held ? ico("eye") + "Awaiting review" : '<span class="dot"></span>Running';
    }
    $("reviewBtn").hidden = !held || cancelled;
    $("cancelBtn").hidden = held || cancelled;
    $("newRunBtn").hidden = !cancelled;
    $("notifyBtn").hidden = cancelled;

    // What the agent is doing
    const ph = phaseOf(V);
    $("phaseChip").textContent = cancelled && V === H ? "Cancelled" : held && V === H ? "Gate" : ph[0];
    const key = cancelled && V === H ? "can" : held && V === H ? "held" : V + (V === H && running ? "r" : "");
    if (key !== nowKey) {
      nowKey = key;
      const el = $("nowTxt");
      el.innerHTML = cancelled && V === H
        ? `Cancelled at step ${H}. <span>The container was stopped and the sandbox destroyed. The repository is untouched.</span>`
        : held && V === H
        ? `Held at the gate. <span>A person must approve or reject this change.</span>`
        : (V === H && running ? "" : `<span>Step ${V} · </span>`) + esc(S[V - 1].intent);
      if (ready && !reduced) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
    }
    $("viewing").hidden = follow;
    $("legend").hidden = !follow;
    $("viewTxt").textContent = `Viewing step ${V} of ${H}`;
    $("backBtn").textContent = held ? "Back to latest" : "Back to live";
    let ok = 0, rb = 0;
    for (let n = 1; n <= doneAt(H); n++) { const s = status(n, H); if (s === "ok") ok++; else if (s === "rb" || s === "rbf") rb++; }
    $("lgOk").textContent = ok + " passed";
    $("lgRb").textContent = rb + " rolled back";
    $("lgFlag").hidden = !gateDone();
    $("lgCur").hidden = !running;

    renderGraph();
    renderSteps();
    if (tab === "term") renderTerm(); else renderChanges();
    $("changesN").textContent = activeFiles(V).length;
    const live = running && V === H;
    $("stream").className = "stream" + (live ? " live" : "");
    $("streamTxt").textContent = live ? `Streaming · step ${V}` : cancelled && V === H ? "Cancelled" : held && V === H ? "Finished at the gate" : `Step ${V}`;

    // Side rail
    $("elapsed").textContent = fmt(elapsed(V));
    $("stepLbl").textContent = follow ? (held ? "Final step" : "Step") : "Viewing";
    $("stepNo").innerHTML = follow ? String(V) : `${V}<span> of ${H}</span>`;
    const tk = tokens(V);
    $("tokens").textContent = tk.toLocaleString("en-US");
    $("cost").innerHTML = "$" + (tk * 0.000009).toFixed(2) + " <span>est.</span>";
    renderChart();
    $("cpCount").textContent = `${H} saved`;

    if (mode === "demo") {
      $("demoStep").textContent = finished ? "Finished" : `Step ${H} of ${N}`;
      $("demoProg").style.width = (doneAt(H) / N) * 100 + "%";
      $("demoPlay").innerHTML = ico(finished ? "rotate-ccw" : paused ? "play" : "pause");
      $("demoPlay").setAttribute("aria-label", finished ? "Replay" : paused ? "Play" : "Pause");
    }
    if (window.RollbackRunner) RollbackRunner.setStatus(held ? { text: "RUN-0142 needs you", need: true } : { text: `RUN-0142 · step ${H}`, need: false });
  }

  // ---------- Steps list ----------
  function renderSteps() {
    const list = $("steps");
    let html = "", last = null;
    for (let n = 1; n <= V; n++) {
      const ph = phaseOf(n);
      if (ph !== last) { html += `<div class="ph-row"><b>${ph[0]}</b><span>${ph[1] === ph[2] ? ph[1] : ph[1] + "–" + ph[2]}</span></div>`; last = ph; }
      const s = S[n - 1], st = status(n, V);
      const icon = { ok: "circle-check", rb: "undo-2", rbf: "undo-2", cur: "loader-circle", src: "flag", fl: "shield-alert", can: "circle-slash" }[st];
      let why = s.note || "", tag = `<span class="d">${s.dur.toFixed(1)}s</span>`;
      if (st === "rb") why = `Rolled back: ${s.note.toLowerCase()} · restored CP-${n}`;
      if (st === "rbf") why = `Undone by the rollback to CP-${R.falat.root}`;
      if (st === "rbf" && n === R.falat.root) { why = `Root cause of failures ${FIRST_FAIL}–${R.falat.after}`; tag = `<span class="badge b-warn">${ico("crosshair")}Root cause</span>`; }
      if (st === "src") { why = `Untrusted input containing ${R.gate.url}`; tag = `<span class="badge b-bad">${ico("flag")}Flag source</span>`; }
      if (st === "fl") { why = `New URL found: ${R.gate.url}`; tag = `<span class="badge b-bad">${ico("shield-alert")}Held</span>`; }
      if (st === "cur") tag = `<span class="d live">running</span>`;
      if (st === "can") { why = "Cancelled by Adan J. · container stopped"; tag = `<span class="badge b-neutral">${ico("circle-slash")}Cancelled</span>`; }
      html += `<div class="step ${st}${n === V ? " sel" : ""}" data-n="${n}" title="${esc(s.cmd)}">` +
        `<span class="n">${String(n).padStart(2, "0")}</span>${ico(icon)}` +
        `<div><code>${esc(s.cmd)}</code>${why ? `<span class="why">${esc(why)}</span>` : ""}</div>${tag}</div>`;
    }
    if (list._h === html && list._v === V) return;
    if (list._h !== html) { list.innerHTML = html; list._h = html; }
    const row = list.querySelector(".step.sel");
    if (row && list._v !== V) {
      list._v = V;
      const top = row.offsetTop - 34, bottom = row.offsetTop + row.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }
  }

  // ---------- Terminal ----------
  function line(t) {
    if (t[0] === "#") return t.slice(1);
    const cls = { "!": "err", "~": "warn", "+": "ok", ".": "dim" }[t[0]];
    return cls ? `<span class="${cls}">${esc(t.slice(1))}</span>` : esc(t);
  }
  function renderTerm() {
    const out = [];
    for (let n = Math.max(1, V - 2); n <= V; n++) {
      const s = S[n - 1], live = n === H && running;
      const lines = cancelled && n === H ? s.out.slice(0, revealed || s.out.length).concat(CANCEL_LINES) : live ? s.out.slice(0, revealed) : s.out;
      let b = `<span class="cmd">${esc(s.cmd)}</span>`;
      if (lines.length) b += "\n" + lines.map(line).join("\n");
      if (live) b += '\n<span class="caret"></span>';
      out.push(`<span class="blk${n < V ? " old" : ""}">${b}</span>`);
    }
    const html = `<pre class="screen">${out.join("")}</pre>`, sc = $("pane");
    if (sc._h === html) return;
    sc.innerHTML = html; sc._h = html;
    sc.scrollTop = sc.scrollHeight;
  }

  // ---------- Changes ----------
  function activeFiles(T) {
    const d = doneAt(T), files = new Map();
    for (let n = 1; n <= d; n++) {
      const s = S[n - 1];
      if (!s.patch) continue;
      const st = status(n, T);
      if (st === "rb" || st === "rbf") continue;
      s.patch.forEach((p) => { if (!files.has(p.file)) files.set(p.file, []); files.get(p.file).push(...p.lines); });
    }
    return [...files.entries()];
  }
  function renderChanges() {
    const files = activeFiles(V), flagged = events.has("gate") && doneAt(V) >= R.gate.step;
    let html = "";
    if (events.has("falat") && doneAt(V) >= R.falat.after) html += `<div class="gone">${ico("undo-2")}Changes from steps ${R.falat.from}–${R.falat.to} were undone by the root-cause rollback.</div>`;
    if (!files.length) html += `<div class="empty-files">No files changed yet at step ${V}.</div>`;
    files.forEach(([file, lines]) => {
      const a = lines.filter((l) => l[0] === "+").length, dl = lines.filter((l) => l[0] === "-").length;
      html += `<div class="file"><div class="file-head"><span>${esc(file)}</span><span class="ct"><span class="a">+${a}</span><span class="d">−${dl}</span></span></div>`;
      lines.forEach(([k, t]) => {
        const hot = flagged && t.includes(R.gate.url);
        const cls = hot ? "hot" : k === "+" ? "add" : k === "-" ? "del" : "";
        let txt = esc(t);
        if (hot) txt = txt.replace(R.gate.url, `<mark>${R.gate.url}</mark>`);
        html += `<div class="dl ${cls}"><span class="g">${k === " " ? "" : k === "-" ? "−" : "+"}</span><code>${txt}</code></div>`;
      });
      html += "</div>";
    });
    const out = `<div class="files">${html}</div>`, sc = $("pane");
    if (sc._h === out) return;
    sc.innerHTML = out; sc._h = out;
  }

  // ---------- Tokens per step chart ----------
  const maxTok = Math.max(...S.map((s) => s.tok));
  $("tcMax").textContent = (maxTok / 1000).toFixed(1) + "k max";
  const cols = S.map((s, i) => { const b = document.createElement("i"); b.dataset.n = i + 1; $("tcCols").appendChild(b); return b; });
  function renderChart() {
    cols.forEach((b, i) => {
      const n = i + 1;
      if (n > H) { b.style.height = "2px"; b.className = "e"; return; }
      b.style.height = Math.max(2, Math.round((stepTok(n) / maxTok) * 56)) + "px";
      b.className = status(n, H) + (n > V ? " after" : "") + (!follow && n === V ? " sel" : "");
    });
  }
  $("tcCols").addEventListener("mousemove", (e) => {
    const b = e.target.closest("i"); if (!b) return;
    const n = +b.dataset.n;
    $("tcLbl").textContent = n > H ? `Step ${n} · not run yet` : `Step ${n} · ${stepTok(n).toLocaleString("en-US")} tokens`;
  });
  $("tcCols").addEventListener("mouseleave", () => ($("tcLbl").textContent = "Tokens per step"));
  $("tcCols").addEventListener("click", (e) => { const b = e.target.closest("i"); if (b && +b.dataset.n <= H) setV(+b.dataset.n); });

  // ---------- Tooltip and time travel ----------
  let hotN = -1;
  const nAt = (clientX) => Math.max(1, Math.min(H, Math.round((clientX - gWrap.getBoundingClientRect().left - PADL) / dx)));
  function setHot(n) {
    if (hotN === n) return;
    const prev = hotN; hotN = n;
    [prev, n].forEach((k) => { if (k >= 0 && nodeEls[k]) nodeEls[k].setAttribute("class", nodeClass(k)); });
  }
  function showTip(n) {
    const p = P[n];
    if (!p || n < 1 || n > H) { tip.classList.remove("on"); setHot(-1); return; }
    const s = S[n - 1], st = status(n, H);
    const word = { ok: "Passed", rb: "Failed, rolled back", rbf: n === R.falat.root ? "Root cause, undone" : "Undone", cur: "Running now", src: "Flag source", fl: "Held for review", can: "Cancelled" }[st];
    const files = s.patch ? s.patch.map((q) => `${esc(q.file)} +${q.lines.filter((l) => l[0] === "+").length} −${q.lines.filter((l) => l[0] === "-").length}`).join("<br>") : "";
    tip.innerHTML = `<div class="t1"><span>Step ${n} · ${phaseOf(n)[0]}</span><span class="w ${st}">${word}</span></div><code>${esc(s.cmd)}</code>` +
      `<div class="t3"><span>Checkpoint <span class="mono">CP-${n} · ${hash7(n)}</span></span>` +
      (files ? `<span class="mono">${files}</span>` : "") +
      (AUD[n] ? `<span>Audit <span class="mono">sha256 ${AUD[n].hash.slice(0, 10)}…${AUD[n].hash.slice(-4)}</span></span>` : "") + "</div>";
    tip.style.left = Math.max(0, Math.min(W - 300, p.x - 150)) + "px";
    tip.style.top = PH + p.y - 22 + "px";
    tip.classList.add("on");
    setHot(n);
  }
  function setV(n) {
    n = Math.max(1, Math.min(H, n));
    follow = n === H;
    V = n;
    render();
  }
  let scrubbing = false;
  gWrap.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; scrubbing = true; gWrap.setPointerCapture(e.pointerId); const n = nAt(e.clientX); setV(n); showTip(n); });
  gWrap.addEventListener("pointermove", (e) => { const n = nAt(e.clientX); if (scrubbing && n !== V) setV(n); showTip(n); });
  gWrap.addEventListener("pointerup", () => (scrubbing = false));
  gWrap.addEventListener("pointercancel", () => (scrubbing = false));
  gWrap.addEventListener("pointerleave", () => { if (!scrubbing) { tip.classList.remove("on"); setHot(-1); } });
  gWrap.addEventListener("blur", () => { tip.classList.remove("on"); setHot(-1); });
  $("steps").addEventListener("click", (e) => { const r = e.target.closest(".step"); if (r) setV(+r.dataset.n); });
  $("backBtn").addEventListener("click", () => { follow = true; render(); });
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
    tab = b.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
    render();
  }));
  new ResizeObserver(() => { snapNext = true; render(); }).observe(gWrap);

  // ---------- Header actions ----------
  $("notifyBtn").addEventListener("click", () => {
    notify = !notify;
    const b = $("notifyBtn");
    b.setAttribute("aria-pressed", notify);
    b.innerHTML = ico(notify ? "bell-ring" : "bell") + `<span>${notify ? "Notifying you" : "Notify me"}</span>`;
    toast(notify ? "ok" : "info", notify ? "bell-ring" : "bell", notify ? "We'll let you know" : "Notifications off",
      notify ? "You'll get an email when RUN-0142 finishes or needs your review." : "You won't be notified about RUN-0142.", 3600);
  });
  const menu = $("exportMenu"), eb = $("exportBtn");
  const closeMenu = () => { menu.hidden = true; eb.setAttribute("aria-expanded", "false"); };
  eb.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open; eb.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("button").focus();
  });
  menu.addEventListener("click", (e) => { const b = e.target.closest("[data-export]"); if (b) { closeMenu(); exportAs(b.dataset.export); } });
  document.addEventListener("click", (e) => { if (!menu.hidden && !e.target.closest(".menu-wrap")) closeMenu(); });

  function rows() {
    const word = { ok: "passed", rb: "failed_rolled_back", rbf: "undone_by_root_cause_rollback", cur: "running", src: "flag_source", fl: "held_for_review", can: "cancelled" };
    const out = [];
    for (let n = 1; n <= H; n++) {
      const s = S[n - 1];
      out.push({ step: n, phase: phaseOf(n)[0], command: s.cmd, status: word[status(n, H)], duration_s: s.dur, tokens: stepTok(n),
        checkpoint: `CP-${n}`, checkpoint_commit: hash7(n), audit_sha256: AUD[n] ? AUD[n].hash : "", prev_sha256: AUD[n] ? AUD[n].prev : "" });
    }
    return out;
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportAs(kind) {
    const base = { run: "RUN-0142", repository: "acme-labs/payments-api", issue: 482, model: "Claude Sonnet", exported_at: new Date().toISOString() };
    const r = rows();
    if (kind === "json") download("RUN-0142-log.json", JSON.stringify({ ...base, steps: r }, null, 2), "application/json");
    if (kind === "csv") {
      const keys = Object.keys(r[0]);
      download("RUN-0142-log.csv", [keys.join(",")].concat(r.map((o) => keys.map((k) => `"${String(o[k]).replace(/"/g, '""')}"`).join(","))).join("\n"), "text/csv");
    }
    if (kind === "audit") download("RUN-0142-audit.json", JSON.stringify({ ...base, chain: "sha256 of each entry, including the previous entry's hash",
      entries: r.map(({ step, command, status: st, audit_sha256, prev_sha256 }) => ({ step, command, status: st, audit_sha256, prev_sha256 })) }, null, 2), "application/json");
    toast("ok", "download", "Export ready", kind === "csv" ? "RUN-0142 log saved as CSV." : kind === "audit" ? "RUN-0142 audit trail saved with its SHA-256 chain." : "RUN-0142 log saved as JSON.", 3200);
  }

  function setFocus(on) {
    document.body.classList.toggle("focus", on);
    const b = $("focusBtn");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Exit focus mode" : "Focus mode");
    b.innerHTML = ico(on ? "minimize-2" : "maximize-2");
    $("steps")._v = -1; // panel height changed: keep the selected step in view
    requestAnimationFrame(render);
  }
  $("focusBtn").addEventListener("click", () => setFocus(!document.body.classList.contains("focus")));

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
    const t = e.target;
    if (t.closest && t.closest("input, textarea, select")) return;
    if (e.key === "Escape") {
      if (!menu.hidden) { closeMenu(); eb.focus(); }
      else if (!follow) { follow = true; render(); }
      else if (document.body.classList.contains("focus")) setFocus(false);
      return;
    }
    if (t.closest && t.closest(".menu")) return;
    const k = { ArrowLeft: V - 1, ArrowRight: V + 1, Home: 1, End: H }[e.key];
    if (k !== undefined) { e.preventDefault(); setV(k); showTip(V); return; }
    if (e.key === "f" || e.key === "F") { setFocus(!document.body.classList.contains("focus")); return; }
    if (e.key === " " && mode === "demo" && !(t.closest && t.closest("button, a"))) { e.preventDefault(); $("demoPlay").click(); }
  });

  // ---------- While you wait ----------
  const F = R.facts;
  let fi = (+qs.get("fact") || 0) % F.length, factHold = false;
  function showFact(i, anim) {
    fi = (i + F.length) % F.length;
    $("factTag").textContent = F[fi][0];
    $("factTxt").textContent = F[fi][1];
    $("factN").textContent = `${fi + 1} / ${F.length}`;
    const box = $("fact");
    if (anim && !reduced) { box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap"); }
  }
  $("factPrev").addEventListener("click", () => showFact(fi - 1, true));
  $("factNext").addEventListener("click", () => showFact(fi + 1, true));
  $("waitCard").addEventListener("mouseenter", () => (factHold = true));
  $("waitCard").addEventListener("mouseleave", () => (factHold = false));
  setInterval(() => {
    const gameOpen = window.RollbackRunner && RollbackRunner.isOpen();
    if (!factHold && !document.hidden && !gameOpen) showFact(fi + 1, true);
  }, 12000);
  showFact(fi, false);
  $("playBtn").addEventListener("click", () => window.RollbackRunner && RollbackRunner.open());

  // ---------- Moments ----------
  function toast(kind, icon, title, body, ms) {
    const box = $("toasts"), t = document.createElement("div");
    t.className = "toast " + kind;
    t.setAttribute("role", "status");
    t.innerHTML = ico(icon) + `<div><b>${title}</b>${body}</div>`;
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 250); }, ms || 5200);
  }
  function flash(n) {
    const seg = segs[n - 1];
    seg.classList.remove("flash"); void seg.offsetWidth; seg.classList.add("flash");
    setTimeout(() => seg.classList.remove("flash"), 750);
    const inner = nodeEls[n] && nodeEls[n].firstChild;
    if (inner && !reduced) { inner.classList.remove("pop", "flash"); void inner.getBBox(); inner.classList.add("flash"); }
  }
  function sweep(from, to) {
    const sw = $("sweep"), w = Math.max(3, dx - 4);
    sw.style.left = xOf(from) - w / 2 + "px";
    sw.style.width = xOf(to) - xOf(from) + w + "px";
    sw.classList.remove("go"); void sw.offsetWidth; sw.classList.add("go");
  }
  // A dot travels back along the failed path to the checkpoint before the root cause.
  function rewindTrace(done) {
    if (reduced) return done();
    const hold = P[R.falat.to].y;
    const pts = [P[R.falat.after], { x: P[R.falat.after].x, y: hold }];
    for (let n = R.falat.to; n >= R.falat.from - 1; n--) pts.push(P[n]);
    const segLen = [], total = pts.slice(1).reduce((s, p, i) => { const l = Math.hypot(p.x - pts[i].x, p.y - pts[i].y); segLen.push(l); return s + l; }, 0);
    const dot = $("rwDot");
    dot.style.display = "";
    sweep(R.falat.root, R.falat.after);
    const t0 = performance.now();
    let over = false;
    const finish = () => { if (over) return; over = true; dot.style.display = "none"; done(); };
    nextTick(function f(now) {
      if (over) return;
      const k = Math.min(1, (now - t0) / 1400), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      let d = e * total, i = 0;
      while (i < segLen.length - 1 && d > segLen[i]) { d -= segLen[i]; i++; }
      const a = pts[i], b = pts[i + 1], r = segLen[i] ? d / segLen[i] : 1;
      const x = a.x + (b.x - a.x) * r, y = a.y + (b.y - a.y) * r;
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      for (let n = R.falat.from; n <= R.falat.to; n++) {
        if (x <= P[n].x + 1 && !undoing.has(n)) { undoing.add(n); nodeEls[n].setAttribute("class", nodeClass(n)); edgeEls[n].setAttribute("class", edgeClass(n)); }
      }
      if (k < 1) nextTick(f); else finish();
    });
  }

  // ---------- Playback ----------
  function after(ms, fn) { clearTimeout(timer); timer = setTimeout(() => (paused ? (pending = fn) : fn()), reduced ? Math.min(ms, 400) : ms); }
  function stepStart() { running = true; revealed = 0; render(); after(350, streamNext); }
  function streamNext() {
    if (revealed < S[H - 1].out.length) { revealed++; render(); after(120, streamNext); }
    else after(S[H - 1].fail ? 300 : 380, stepEnd);
  }
  function stepEnd() {
    running = false;
    const s = S[H - 1];
    render();
    if (s.fail) {
      flash(H);
      toast("warn", "undo-2", `Step ${H} failed, rolled back`, `${esc(s.note)}. Files restored to CP-${H} and the failed turn trimmed from memory.`);
    }
    if (H === R.falat.after) {
      after(900, () => rewindTrace(() => {
        events.add("falat");
        undoing.clear();
        render();
        toast("warn", "crosshair", "Failure attribution", `5 failures in a row traced back to step ${R.falat.root}, which changed retry.ts. Rolled back to CP-${R.falat.root}; steps ${R.falat.from}–${R.falat.to} undone.`, 7000);
        after(2400, next);
      }));
      return;
    }
    if (H === R.gate.step) {
      events.add("gate");
      finished = true;
      render();
      toast("bad", "shield-alert", "Held at the gate", `New URL <code>${R.gate.url}</code> traced to step ${R.gate.source}, an untrusted log file. Waiting for a person to review.`, 9000);
      if (notify) setTimeout(() => toast("ok", "bell-ring", "Notification sent", "Emailed adan@acme-labs.dev: RUN-0142 needs your review.", 6000), 1200);
      if (window.RollbackRunner) RollbackRunner.alert(true);
      return;
    }
    after(s.fail ? 900 : 260, next);
  }
  function next() { H++; stepStart(); }
  function restart() {
    clearTimeout(timer); pending = null; paused = false; finished = false;
    events.clear(); undoing.clear(); cancelled = false;
    H = 1; follow = true;
    dropNodesAfter(0);
    $("toasts").innerHTML = "";
    if (window.RollbackRunner) RollbackRunner.alert(false);
    stepStart();
  }

  // ---------- Cancel run ----------
  $("cancelBtn").addEventListener("click", () => $("cancelDlg").showModal());
  $("cKeep").addEventListener("click", () => $("cancelDlg").close());
  $("cGo").addEventListener("click", () => {
    $("cancelDlg").close();
    clearTimeout(timer); pending = null;
    running = false; cancelled = true; finished = true; follow = true;
    render();
    toast("info", "circle-slash", "Run cancelled", "Container stopped in 0.4s and the sandbox destroyed. Checkpoints stay in the audit log.", 5200);
  });

  // ---------- Start ----------
  if (mode === "demo") {
    $("demo").hidden = false;
    $("demoPlay").addEventListener("click", () => {
      if (finished) return restart();
      paused = !paused;
      if (!paused && pending) { const f = pending; pending = null; f(); }
      render();
    });
    $("demoRestart").addEventListener("click", restart);
    ready = true;
    // Start the playback once the page-load screen has gone, so no step plays hidden.
    if (window.Loader && Loader.ready) Loader.ready.then(restart); else restart();
  } else if (mode === "held") {
    H = N; running = false; finished = true; events.add("falat"); events.add("gate");
    render();
    if (window.RollbackRunner) RollbackRunner.alert(true);
  } else {
    // Live: the run is partway through step 25.
    H = 25; running = true; revealed = 0; events.add("falat");
    liveSecs = 12; liveTok = 1400;
    render();
    const reveal = () => { if (revealed < S[H - 1].out.length) { revealed++; render(); setTimeout(reveal, reduced ? 0 : 320); } };
    setTimeout(reveal, reduced ? 0 : 500);
    setInterval(() => { if (running) { liveSecs++; liveTok += Math.floor(Math.random() * 60); render(); } }, 1000);
  }
  ready = true;
  const view = +qs.get("view");
  if (view) setV(view);
  if (qs.get("tab") === "changes") document.querySelector('[data-tab="changes"]').click();
  if (qs.has("focus")) setFocus(true);
  if (qs.has("game") && window.RollbackRunner) RollbackRunner.open();
  if (qs.get("state") === "cancelled") $("cGo").click();
})();
