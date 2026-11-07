// Page-load screen: a tiny run plays out while the page loads.
// Checkpoints appear, step 4 fails and rewinds, the run recovers, the gate says yes.
// Include right after <body>. Add ?noboot to skip it (for screenshots).
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="6" r="3"/><path d="M5 9v12"/><circle cx="19" cy="18" r="3"/><path d="m15 9-3-3 3-3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const X = (i) => 14 + i * 36;

  function build(host) {
    host.innerHTML = `<div class="boot-in">
      <div class="boot-mark">${MARK}</div>
      <div class="track" aria-hidden="true"><span class="rail"></span><span class="fill"></span><span class="stem"></span><span class="dot"></span><span class="gate">${CHECK}</span></div>
      <div class="boot-line" role="status" aria-live="polite"><span class="txt">Loading</span><span class="caret"></span></div></div>`;
    const track = host.querySelector(".track");
    const nodes = Array.from({ length: 8 }, (_, i) => { const n = document.createElement("span"); n.className = "n"; n.style.left = X(i) + "px"; track.appendChild(n); return n; });
    const retry = document.createElement("span"); retry.className = "n"; retry.style.left = X(3) + "px"; track.appendChild(retry);
    return { host, track, nodes, retry, fill: track.querySelector(".fill"), stem: track.querySelector(".stem"), dot: track.querySelector(".dot"), gate: track.querySelector(".gate"), line: host.querySelector(".boot-line"), txt: host.querySelector(".txt") };
  }

  function play(v, { loop = false, onEnd } = {}) {
    let timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const say = (t, kind) => { v.txt.textContent = t; v.line.className = "boot-line" + (kind ? " " + kind : ""); };
    const fillTo = (i) => (v.fill.style.width = X(i) + "px");
    function reset() {
      v.nodes.forEach((n) => (n.className = "n")); v.retry.className = "n";
      v.stem.className = "stem"; v.dot.className = "dot"; v.gate.className = "gate"; v.fill.style.width = 0;
    }
    function run() {
      reset();
      if (reduced) {
        v.nodes.forEach((n) => n.classList.add("on")); fillTo(7); v.gate.classList.add("ok");
        say("Opening the page", "ok");
        at(300, () => onEnd && onEnd());
        return;
      }
      say("Cloning into a sealed sandbox");
      [0, 1, 2].forEach((i) => at(i * 180, () => { v.nodes[i].classList.add("on"); fillTo(i); }));
      at(380, () => say("Saving checkpoint CP-3"));
      at(560, () => v.nodes[3].classList.add("on", "run"));
      at(920, () => {
        v.nodes[3].classList.remove("run"); v.nodes[3].classList.add("fail");
        v.stem.style.left = X(3) + "px"; v.stem.classList.add("on");
        say("Step 4 failed. Rewinding. Nobody saw that.", "warn");
      });
      at(1120, () => { v.dot.style.transition = "none"; v.dot.style.left = X(3) + "px"; v.dot.getBoundingClientRect(); v.dot.style.transition = ""; v.dot.classList.add("on"); });
      at(1160, () => (v.dot.style.left = X(2) + "px"));
      at(1500, () => {
        v.dot.classList.remove("on"); v.nodes[3].classList.add("ghost");
        v.retry.classList.add("on"); fillTo(3);
        say("Back on track from CP-3");
      });
      [4, 5, 6, 7].forEach((i, k) => at(1680 + k * 160, () => { v.nodes[i].classList.add("on"); fillTo(i); }));
      at(2260, () => { v.gate.classList.add("wait"); say("Asking the gate nicely"); });
      at(2700, () => { v.gate.classList.remove("wait"); v.gate.classList.add("ok"); v.fill.style.width = "100%"; say("Gate says yes. Opening the page", "ok"); });
      at(3150, () => { if (onEnd) onEnd(); if (loop) at(700, run); });
    }
    run();
    return { stop: () => timers.forEach(clearTimeout), replay: () => { timers.forEach(clearTimeout); timers = []; run(); } };
  }

  let markReady;
  window.Loader = { build, play, ready: new Promise((r) => (markReady = r)) };

  // Page-load screen: the full story on the first page of a visit, a quick look after that.
  const qs = new URLSearchParams(location.search);
  if (qs.has("noboot") || !document.body) { markReady(); return; }
  let seen = false;
  try { seen = sessionStorage.getItem("resolver-booted") === "1"; sessionStorage.setItem("resolver-booted", "1"); } catch (e) {}
  if (qs.has("boot")) seen = false;
  const boot = document.createElement("div");
  boot.className = "boot";
  boot.setAttribute("aria-label", "Loading");
  document.body.appendChild(boot);
  const view = build(boot);
  const minTime = reduced ? 250 : seen ? 650 : 3300;
  const t0 = Date.now();
  const p = play(view, { loop: true });
  function finish() {
    setTimeout(() => {
      boot.classList.add("done");
      markReady();
      setTimeout(() => { p.stop(); boot.remove(); }, 420);
    }, Math.max(0, minTime - (Date.now() - t0)));
  }
  if (document.readyState === "complete") finish(); else window.addEventListener("load", finish);
})();
