(() => {
  const canvas = document.getElementById("course");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const state = {
    hi: 0, stroke: 1, scores: Array(18).fill(null), club: 0, aim: 0, power: 0,
    charging: false, chargeDir: 1, flying: false,
    ball: {x: 0, y: 0, z: 0}, start: {x: 0, y: 0}, lie: "Tee",
    wind: {spd: 6, dir: 20}, cam: 0, flyover: 0, ambient: true, caddieOn: true,
    voice: false, birds: [], shake: 0, lastShot: null, foursome: false,
    guest: [null, null, null].map(() => Array(18).fill(null))
  };
  let audio = { ac: null, master: null, windGain: null, windSrc: null };
  function hole() { return HOLES[state.hi]; }
  function seed(n) {
    let x = (n * 9301 + 49297) % 233280;
    return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  }
  function layout(h) {
    const rnd = seed(h.n * 17 + h.yards);
    const length = h.yards, pinX = (rnd() - 0.5) * 8, greenR = h.par === 3 ? 14 : 16, fw = h.par === 3 ? 22 : 28;
    const hazards = [];
    if (h.island) hazards.push({kind: "water", x: 0, y: length * 0.42, w: 220, hh: length * 0.72});
    else if (h.water > 0.15) {
      const side = h.dog >= 0 ? 1 : -1;
      hazards.push({kind: "water", x: side * (30 + rnd() * 18), y: length * (0.35 + rnd() * 0.2), w: 36 + h.water * 50, hh: length * (0.18 + h.water * 0.2)});
    }
    const bunkers = [];
    const bc = h.island ? 2 : 1 + (h.hcp < 8 ? 1 : 0);
    for (let i = 0; i < bc; i++) bunkers.push({x: (i ? -1 : 1) * (greenR + 6 + rnd() * 6) + pinX, y: length - 8 - rnd() * 10, r: 5 + rnd() * 3});
    const oaks = [];
    const oc = h.theme === "oak" || h.theme === "fog" ? 9 : 5;
    for (let i = 0; i < oc; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      oaks.push({x: side * (fw + 18 + rnd() * 40), y: 40 + rnd() * (length - 70), r: 8 + rnd() * 7});
    }
    return {length, pinX, pinY: length - 3 - rnd() * 4, greenR, fw, hazards, bunkers, oaks, dog: h.dog};
  }
  function centerlineX(L, y) { return Math.sin(Math.max(0, Math.min(1, y / L.length)) * Math.PI) * L.dog; }
  function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function remain() { const L = layout(hole()); return dist2(state.ball, {x: L.pinX, y: L.pinY}); }
  function isPutting() {
    const club = CLUBS[state.club];
    return state.lie === "Green" || state.lie === "Cup" || (club && club.id === "PT" && remain() < 40);
  }
  function normAim(a) { a = a % 360; if (a < 0) a += 360; return a; }
  function aimToPin() {
    const L = layout(hole());
    state.aim = normAim(Math.atan2(L.pinX - state.ball.x, L.pinY - state.ball.y) * 180 / Math.PI);
  }
  function syncAimSlider() {
    const el = $("aim"); if (!el) return;
    if (isPutting()) { el.min = "0"; el.max = "359"; el.step = "1"; state.aim = normAim(state.aim); }
    else { el.min = "-28"; el.max = "28"; el.step = "1"; state.aim = Math.max(-28, Math.min(28, state.aim)); }
    el.value = state.aim;
  }
  function screenToWorld(L, sx, sy) {
    if (!isPutting()) return null;
    const w = canvas.width, ht = canvas.height, span = Math.max(22, L.greenR * 2.8), px = Math.min(w, ht) * 0.72 / span;
    return { x: L.pinX + (sx - w * 0.5) / px, y: L.pinY - (sy - ht * 0.42) / px };
  }
  function lieAt(L, p) {
    if (p.y < -8 || p.y > L.length + 18 || Math.abs(p.x) > 110) return "OB";
    for (const w of L.hazards) if (Math.abs(p.x - w.x) < w.w / 2 && Math.abs(p.y - w.y) < w.hh / 2) return "Water";
    for (const b of L.bunkers) if (Math.hypot(p.x - b.x, p.y - b.y) < b.r) return "Sand";
    const pin = {x: L.pinX, y: L.pinY};
    if (dist2(p, pin) <= L.greenR) return dist2(p, pin) < 1.15 ? "Cup" : "Green";
    const lat = Math.abs(p.x - centerlineX(L, p.y));
    if (lat < L.fw * 0.55) return p.y < 6 ? "Tee" : "Fairway";
    return "Rough";
  }
  function lieMul(lie) {
    if (isPutting()) return 1;
    return ({Tee: 1, Fairway: 0.98, Green: 1, Cup: 0, Rough: 0.8, Sand: 0.62, Water: 0, OB: 0})[lie] ?? 0.8;
  }
  function pickClubAuto(d, lie) {
    if (lie === "Green" || d < 18) return CLUBS.findIndex(c => c.id === "PT");
    if (lie === "Sand") return CLUBS.findIndex(c => c.id === "SW");
    let best = 0, err = 9999;
    CLUBS.forEach((c, i) => { if (c.id === "PT") return; const e = Math.abs(c.carry - d); if (e < err) { err = e; best = i; } });
    return best;
  }
  function resetBall() {
    state.ball = {x: 0, y: 0, z: 0}; state.start = {x: 0, y: 0}; state.lie = "Tee";
    state.stroke = 1; state.flying = false; state.charging = false; state.power = 0; state.aim = 0;
    $("aim").min = "-28"; $("aim").max = "28"; $("aim").value = 0;
    state.club = pickClubAuto(hole().yards, "Tee"); newWind(); say(openLine());
  }
  function newWind() {
    const rnd = seed(Date.now() % 99991 + hole().n);
    state.wind.spd = Math.round(3 + rnd() * 14);
    state.wind.dir = Math.round((rnd() * 360) - 180);
  }
  function windArrow() {
    const d = state.wind.dir;
    if (d > -23 && d < 23) return "N into";
    if (d >= 23 && d < 67) return "NE";
    if (d >= 67 && d < 113) return "E";
    if (d >= 113 && d < 157) return "SE";
    if (d <= -23 && d > -67) return "NW";
    if (d <= -67 && d > -113) return "W";
    if (d <= -113 && d > -157) return "SW";
    return "S helping";
  }
  function formatScore() {
    const played = state.scores.map((s, i) => s == null ? 0 : s - HOLES[i].par);
    const n = state.scores.filter(s => s != null).length;
    const tot = played.reduce((a, b) => a + b, 0);
    if (!n || tot === 0) return "E";
    return tot > 0 ? "+" + tot : String(tot);
  }
  function openLine() {
    const h = hole();
    if (h.n === 12) return "Isle of Moss. Two bunkers, lily pads, no place to miss short.";
    if (h.n === 6) return "Alligator Run. Stroke index 1. The long water. Club up or pay.";
    if (h.n === 14) return "Foggy Oaks. The moss comes down to the fairway.";
    if (h.n === 15) return "Pirogue. Shortest on the card. Still wet.";
    if (h.par === 3) return h.name + ". " + h.yards + " on the card. Don't be cute.";
    if (state.wind.spd > 12) return "Wind's up at " + state.wind.spd + ". Take an extra club.";
    return h.name + ". Live oaks, Spanish moss. Take what the hole gives you.";
  }
  function say(text) {
    $("caddie").textContent = text;
    if (state.voice && state.caddieOn) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.92; u.pitch = 0.85; u.volume = 0.8;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  }
  function log(line) { const el = $("log"); el.innerHTML = "<div>" + line + "</div>" + el.innerHTML; }
  function hud() {
    const h = hole(), left = remain();
    $("holeTitle").innerHTML = h.name + " <small>Par " + h.par + " · " + h.yards + "</small>";
    $("footHole").textContent = "Hole " + h.n + " of 18";
    $("sDist").textContent = isPutting() ? Math.max(1, left * 3).toFixed(0) + " ft" : left.toFixed(0) + " yds";
    syncAimSlider();
    $("sStroke").textContent = String(state.stroke);
    $("sWind").textContent = state.wind.spd + " mph " + windArrow();
    $("sLie").textContent = isPutting() ? "Green · " + Math.round(normAim(state.aim)) + "°" : state.lie;
    $("sScore").textContent = formatScore();
    $("sClub").textContent = CLUBS[state.club].name;
    $("meterFill").style.width = Math.max(0, Math.min(100, state.power)) + "%";
    document.querySelectorAll(".clubs button").forEach((b, i) => b.classList.toggle("on", i === state.club));
  }
  function renderClubs() {
    $("clubs").innerHTML = CLUBS.map((c, i) => "<button type='button' data-i='" + i + "' title='" + c.carry + " yds'>" + c.id + "</button>").join("");
    $("clubs").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; state.club = +b.dataset.i; hud(); };
  }
  function worldToScreen(L, x, y) {
    const w = canvas.width, ht = canvas.height;
    if (isPutting()) {
      const span = Math.max(22, L.greenR * 2.8), px = Math.min(w, ht) * 0.72 / span;
      return {x: w * 0.5 + (x - L.pinX) * px, y: ht * 0.42 - (y - L.pinY) * px, s: px / 4};
    }
    const padT = 50, padB = 70, t = y / L.length, scale = 0.55 + t * 0.9;
    return {x: w * 0.5 + (x + Math.sin(state.cam) * 4) * (3.1 * scale), y: padT + (1 - t) * (ht - padT - padB), s: scale};
  }
  function drawGreen(L, w, ht, g) {
    g.fillStyle = "#1a2a18"; g.fillRect(0, 0, w, ht);
    const c = worldToScreen(L, L.pinX, L.pinY);
    g.fillStyle = "#2c4a2c"; g.beginPath(); g.ellipse(c.x, c.y, L.greenR * 3.4 * c.s, L.greenR * 3.4 * c.s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4e8a48"; g.beginPath(); g.ellipse(c.x, c.y, L.greenR * 2.7 * c.s, L.greenR * 2.7 * c.s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#0a120e"; g.beginPath(); g.arc(c.x, c.y, Math.max(6, 4.4 * c.s), 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#efe6d0"; g.lineWidth = 2; g.stroke();
    g.fillStyle = "#d4b56a"; g.font = "14px system-ui";
    g.fillText("N", w * 0.5 - 5, 28);
    g.fillText("S", w * 0.5 - 5, ht - 18);
    g.fillText("W", 16, ht * 0.42);
    g.fillText("E", w - 28, ht * 0.42);
    g.fillText("green · north-up · 360", 20, 48);
    g.fillStyle = "#c4a36a";
    for (const bnk of L.bunkers) {
      const p = worldToScreen(L, bnk.x, bnk.y);
      g.beginPath(); g.ellipse(p.x, p.y, bnk.r * 2.8 * p.s, bnk.r * 2.8 * p.s, 0, 0, Math.PI * 2); g.fill();
    }
  }
  function draw() {
    const h = hole(), L = layout(h), w = canvas.width, ht = canvas.height, g = ctx;
    g.clearRect(0, 0, w, ht);
    if (isPutting()) {
      drawGreen(L, w, ht, g);
      if (!state.flying) {
        const left = remain();
        const dist = Math.max(2, Math.min(36, left * (state.power > 4 ? state.power / 100 * 2.2 : 1.15)));
        const ang = normAim(state.aim) * Math.PI / 180;
        g.setLineDash([5, 5]); g.strokeStyle = "rgba(239,230,208,0.85)"; g.lineWidth = 2; g.beginPath();
        const a0 = worldToScreen(L, state.ball.x, state.ball.y);
        const a1 = worldToScreen(L, state.ball.x + Math.sin(ang) * dist, state.ball.y + Math.cos(ang) * dist);
        g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke(); g.setLineDash([]);
      }
      const bp = worldToScreen(L, state.ball.x, state.ball.y);
      g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(bp.x + 2, bp.y + 3, 6, 3, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#f6f1e4"; g.beginPath(); g.arc(bp.x, bp.y, 6, 0, Math.PI * 2); g.fill();
      return;
    }
    const sky = g.createLinearGradient(0, 0, 0, ht * 0.45);
    if (h.theme === "fog") { sky.addColorStop(0, "#6d7a70"); sky.addColorStop(1, "#2a382c"); }
    else { sky.addColorStop(0, "#6fa0c4"); sky.addColorStop(1, "#1c3a28"); }
    g.fillStyle = sky; g.fillRect(0, 0, w, ht);
    const rough = g.createLinearGradient(0, 0, 0, ht);
    rough.addColorStop(0, "#2a4028"); rough.addColorStop(1, "#1a2a18");
    g.fillStyle = rough; g.fillRect(0, ht * 0.18, w, ht);
    for (const water of L.hazards) {
      const a = worldToScreen(L, water.x - water.w / 2, water.y - water.hh / 2);
      const b = worldToScreen(L, water.x + water.w / 2, water.y + water.hh / 2);
      g.fillStyle = h.island ? "#124048" : "#163a42";
      g.beginPath();
      const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
      g.roundRect(x0, y0, x1 - x0, y1 - y0, 24); g.fill();
    }
    g.strokeStyle = "#3d6a3a"; g.lineCap = "round";
    for (let i = 0; i < 28; i++) {
      const y = (i / 28) * L.length, p = worldToScreen(L, centerlineX(L, y), y);
      g.lineWidth = L.fw * 2.2 * p.s;
      if (i === 0) { g.beginPath(); g.moveTo(p.x, p.y); } else g.lineTo(p.x, p.y);
    }
    g.stroke();
    const gp = worldToScreen(L, L.pinX, L.pinY);
    g.fillStyle = "#4e8a48"; g.beginPath(); g.ellipse(gp.x, gp.y, L.greenR * 2.6 * gp.s, L.greenR * 1.5 * gp.s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c4a36a";
    for (const bnk of L.bunkers) { const p = worldToScreen(L, bnk.x, bnk.y); g.beginPath(); g.ellipse(p.x, p.y, bnk.r * 2.4 * p.s, bnk.r * 1.4 * p.s, 0, 0, Math.PI * 2); g.fill(); }
    for (const oak of L.oaks) {
      const p = worldToScreen(L, oak.x, oak.y);
      g.fillStyle = "#0e1810"; g.beginPath(); g.ellipse(p.x, p.y - 8 * p.s, oak.r * 2.1 * p.s, oak.r * 1.6 * p.s, 0, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = "#efe6d0"; g.lineWidth = 2; g.beginPath(); g.moveTo(gp.x, gp.y); g.lineTo(gp.x, gp.y - 26 * gp.s); g.stroke();
    g.fillStyle = "#c46a4a"; g.beginPath();
    const wave = Math.sin(performance.now() / 280 + state.wind.spd) * 4;
    g.moveTo(gp.x, gp.y - 26 * gp.s); g.lineTo(gp.x + 14 * gp.s + wave, gp.y - 20 * gp.s); g.lineTo(gp.x, gp.y - 14 * gp.s); g.fill();
    if (!state.flying) {
      const club = CLUBS[state.club], mul = lieMul(state.lie), carry = club.carry * 0.78 * mul, ang = state.aim * Math.PI / 180;
      g.setLineDash([6, 6]); g.strokeStyle = "rgba(239,230,208,0.55)"; g.lineWidth = 2; g.beginPath();
      const a0 = worldToScreen(L, state.ball.x, state.ball.y);
      const a1 = worldToScreen(L, state.ball.x + Math.sin(ang) * carry, state.ball.y + Math.cos(ang) * carry);
      g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke(); g.setLineDash([]);
    }
    const bp = worldToScreen(L, state.ball.x, state.ball.y), z = state.ball.z || 0;
    g.fillStyle = "rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(bp.x + 2, bp.y + 3, 5, 2.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f6f1e4"; g.beginPath(); g.arc(bp.x, bp.y - z * 0.55, 4.4 + Math.min(4, z * 0.04), 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(13,22,16,0.55)"; g.fillRect(16, 16, 168, 36);
    g.fillStyle = "#d4b56a"; g.font = "13px system-ui"; g.fillText("Wind " + state.wind.spd + " mph " + windArrow(), 26, 38);
  }
  function swing() {
    if (state.flying || state.lie === "Cup") return;
    if (state.lie === "Water" || state.lie === "OB") { drop(); return; }
    if (!state.charging) { state.charging = true; state.power = 4; state.chargeDir = 1; return; }
    state.charging = false; launch(state.power / 100);
  }
  function launch(pwr) {
    const L = layout(hole()), club = CLUBS[state.club];
    if (isPutting() || club.id === "PT") {
      const dist = 34 * pwr * pwr + 1.2 * pwr;
      const ang = normAim(state.aim) * Math.PI / 180;
      const dest = { x: state.ball.x + Math.sin(ang) * dist, y: state.ball.y + Math.cos(ang) * dist };
      state.flying = true; state.start = {x: state.ball.x, y: state.ball.y};
      const from = {x: state.start.x, y: state.start.y}, t0 = performance.now(), dur = 420 + dist * 38;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - t, 2);
        state.ball.x = from.x + (dest.x - from.x) * ease;
        state.ball.y = from.y + (dest.y - from.y) * ease;
        state.ball.z = 0;
        if (t < 1) requestAnimationFrame(tick); else finishShot(L, dest, dist);
      };
      ping("hit"); requestAnimationFrame(tick); return;
    }
    const mul = lieMul(state.lie), quality = 0.86 + pwr * 0.14;
    const carry = club.carry * pwr * mul * quality;
    const roll = club.roll * pwr * mul * 0.85;
    const windRad = state.wind.dir * Math.PI / 180, aimRad = state.aim * Math.PI / 180;
    const tail = Math.cos(windRad) * state.wind.spd, cross = Math.sin(windRad) * state.wind.spd;
    const carryAdj = carry * (1 + tail * 0.008);
    const dest = { x: state.ball.x + Math.sin(aimRad) * carryAdj + cross * 0.22, y: state.ball.y + Math.cos(aimRad) * carryAdj + roll * 0.65 };
    state.flying = true; state.start = {x: state.ball.x, y: state.ball.y};
    const from = {x: state.start.x, y: state.start.y}, t0 = performance.now(), dur = 720 + carryAdj * 3.2, hang = club.loft * 0.9 * pwr;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur), flight = t < 0.7 ? t / 0.7 : 1;
      state.ball.x = from.x + (dest.x - from.x) * (t < 0.7 ? flight : 1);
      state.ball.y = from.y + (dest.y - from.y) * t;
      state.ball.z = Math.sin(Math.min(1, t / 0.7) * Math.PI) * hang;
      if (t < 1) requestAnimationFrame(tick); else finishShot(L, dest, carryAdj);
    };
    ping("hit"); requestAnimationFrame(tick);
  }
  function finishShot(L, dest, carryAdj) {
    state.ball.x = dest.x; state.ball.y = dest.y; state.ball.z = 0; state.flying = false;
    let lie = lieAt(L, state.ball);
    const cupR = isPutting() || CLUBS[state.club].id === "PT" ? 1.65 : 1.2;
    if (lie === "Cup" || dist2(state.ball, {x: L.pinX, y: L.pinY}) < cupR) {
      state.ball.x = L.pinX; state.ball.y = L.pinY; holeOut(); return;
    }
    state.lie = lie;
    if (lie === "Green") {
      state.club = pickClubAuto(remain(), "Green");
      aimToPin(); syncAimSlider();
      say("On the green. North-up map. Click to aim — full 360. Roll it at the cup.");
    }
    if (lie === "Water") { state.shake = 5; ping("splash"); say("That's in the drink. Take your drop and add a stroke."); log("Wet · " + carryAdj.toFixed(0) + " yds"); state.stroke += 1; }
    else if (lie === "OB") { say("Past the oaks. Reload."); log("OB"); state.ball.x = state.start.x; state.ball.y = state.start.y; state.lie = lieAt(L, state.ball); state.stroke += 2; }
    else if (lie === "Sand") { say("In the white. Splash it out."); log("Sand · " + remain().toFixed(0) + " to pin"); state.stroke += 1; }
    else {
      const left = remain();
      if (lie !== "Green") say(left < 12 ? "That's kick-in range. Take the putter." : left < 40 ? "You're on the dance floor. Or close enough." : left.toFixed(0) + " left. Club for the number.");
      log(CLUBS[state.club].id + " · " + carryAdj.toFixed(0) + " yds · " + lie);
      state.stroke += 1;
    }
    state.club = pickClubAuto(remain(), state.lie); state.power = 0; hud();
    setTimeout(() => { state.shake = 0; }, 220);
  }
  function holeOut() {
    const h = hole(); state.lie = "Cup"; state.scores[state.hi] = state.stroke;
    const diff = state.stroke - h.par;
    const word = diff <= -2 ? "eagle" : diff === -1 ? "birdie" : diff === 0 ? "par" : diff === 1 ? "bogey" : "+" + diff;
    ping("cup"); say(h.name + ". " + state.stroke + " on a par " + h.par + ". " + word + "."); log("In the cup · " + word); hud();
    if (state.foursome) fillGuests(state.hi);
    setTimeout(() => {
      if (state.hi < 17) { state.hi += 1; resetBall(); hud(); }
      else say("Home Oaks is in. Card sits at " + formatScore() + ". The lounge will keep it on the wall.");
    }, 1100);
  }
  function fillGuests(i) {
    const par = HOLES[i].par;
    state.guest.forEach(g => { g[i] = Math.max(par - 2, par + Math.round((Math.random() - 0.42) * 2.4)); });
  }
  function drop() {
    const L = layout(hole());
    state.ball.x = centerlineX(L, Math.max(8, state.ball.y - 12));
    state.ball.y = Math.max(6, state.ball.y - 10);
    state.lie = lieAt(L, state.ball);
    if (state.lie === "Water") state.ball.x = 0;
    state.lie = lieAt(L, state.ball);
    say("Drop is down. Play it as it lies."); hud();
  }
  function ping(kind) {
    if (!audio.ac) return;
    const ac = audio.ac, o = ac.createOscillator(), g = ac.createGain(), now = ac.currentTime;
    if (kind === "hit") { o.frequency.value = 180; o.type = "triangle"; g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18); }
    else if (kind === "splash") { o.frequency.value = 90; o.type = "sawtooth"; g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3); }
    else { o.frequency.value = 880; o.type = "sine"; g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4); }
    o.connect(g).connect(audio.master); o.start(now); o.stop(now + 0.42);
  }
  function ensureAudio() {
    if (audio.ac) return;
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const master = ac.createGain(); master.gain.value = 0.22; master.connect(ac.destination);
    const bufferSize = 2 * ac.sampleRate, noise = ac.createBuffer(1, bufferSize, ac.sampleRate), d = noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) { const white = Math.random() * 2 - 1; last = (last + 0.02 * white) / 1.02; d[i] = last * 3.2; }
    const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
    const filter = ac.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 400;
    const windGain = ac.createGain(); windGain.gain.value = 0.0001;
    src.connect(filter).connect(windGain).connect(master); src.start();
    audio = {ac, master, windGain, windSrc: src};
  }
  function chirp() {
    if (!audio.ac || !state.ambient) return;
    const ac = audio.ac, o = ac.createOscillator(), g = ac.createGain(), now = ac.currentTime, f0 = 2200 + Math.random() * 1400;
    o.type = "sine"; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f0 * 0.72, now + 0.09);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.035, now + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g).connect(audio.master); o.start(now); o.stop(now + 0.13);
  }
  function spawnBird() { state.birds.push({x: -20, y: 40 + Math.random() * 120, v: 0.6 + Math.random() * 1.2, p: Math.random() * 6}); }
  function loop() {
    if (state.charging) {
      state.power += state.chargeDir * 1.6;
      if (state.power >= 100) { state.power = 100; state.chargeDir = -1; }
      if (state.power <= 4) { state.power = 4; state.chargeDir = 1; }
    }
    if (state.flyover > 0 && !isPutting()) { state.cam += 0.02; state.flyover -= 1; }
    if (audio.windGain) {
      const target = state.ambient ? 0.012 + state.wind.spd * 0.003 : 0.0001;
      audio.windGain.gain.value += (target - audio.windGain.gain.value) * 0.05;
    }
    state.birds.forEach(b => { b.x += b.v; b.p += 0.2; });
    state.birds = state.birds.filter(b => b.x < canvas.width + 30);
    draw(); hud(); requestAnimationFrame(loop);
  }
  function renderCard() {
    const rows = HOLES.map(h => {
      const s = state.scores[h.n - 1];
      return "<tr><td>" + h.n + "</td><td>" + h.name + "</td><td>" + h.par + "</td><td>" + h.yards + "</td><td>" + h.hcp + "</td><td>" + (s ?? "·") + "</td></tr>";
    }).join("");
    $("cardMount").innerHTML = "<table class='card-table'><thead><tr><th>#</th><th>Hole</th><th>Par</th><th>Yds</th><th>HCP</th><th>P</th></tr></thead><tbody>" + rows + "</tbody></table><p style='color:var(--muted)'>Running " + formatScore() + ".</p>";
  }
  function exportJSON() {
    const payload = { club: "Mosswood Parish Golf Club", location: "St. Martin Parish, Louisiana", tees: "Championship", par: 72, yards: 6842, stage: 1, score: formatScore(), holes: HOLES.map((h, i) => Object.assign({}, h, {strokes: state.scores[i]})) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mosswood-parish-card.json"; a.click();
  }
  function bind() {
    $("btnSwing").onclick = () => { ensureAudio(); swing(); };
    canvas.addEventListener("pointerdown", (e) => {
      const L = layout(hole());
      const rect = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const sy = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (isPutting()) {
        const wpt = screenToWorld(L, sx, sy);
        if (wpt) {
          state.aim = normAim(Math.atan2(wpt.x - state.ball.x, wpt.y - state.ball.y) * 180 / Math.PI);
          syncAimSlider();
        }
        return;
      }
      const ball = worldToScreen(L, state.ball.x, state.ball.y);
      state.aim = Math.max(-28, Math.min(28, Math.atan2(sx - ball.x, ball.y - sy) * 180 / Math.PI));
      $("aim").value = state.aim;
    });
    $("aim").oninput = (e) => { state.aim = +e.target.value; };
    $("aimL").onclick = () => { if (isPutting()) state.aim = normAim(state.aim - 8); else state.aim = Math.max(-28, state.aim - 2); syncAimSlider(); };
    $("aimR").onclick = () => { if (isPutting()) state.aim = normAim(state.aim + 8); else state.aim = Math.min(28, state.aim + 2); syncAimSlider(); };
    $("btnAmbient").onclick = () => { ensureAudio(); state.ambient = !state.ambient; $("btnAmbient").classList.toggle("on", state.ambient); };
    $("btnCaddie").onclick = () => { state.caddieOn = !state.caddieOn; $("btnCaddie").classList.toggle("on", state.caddieOn); };
    $("btnVoice").onclick = () => { state.voice = !state.voice; $("btnVoice").classList.toggle("on", state.voice); if (state.voice) say($("caddie").textContent); };
    $("btnFly").onclick = () => { if (!isPutting()) state.flyover = 220; };
    $("btnCard").onclick = () => { renderCard(); $("cardModal").classList.remove("hidden"); };
    $("btnCloseCard").onclick = () => $("cardModal").classList.add("hidden");
    $("btnHouse").onclick = () => $("clubhouse").classList.remove("hidden");
    $("btnTee").onclick = () => { ensureAudio(); $("clubhouse").classList.add("hidden"); say(openLine()); };
    $("btnDemo").onclick = () => { state.foursome = true; $("clubhouse").classList.add("hidden"); say("Foursome's on the tee."); };
    $("btnDrop").onclick = drop;
    $("btnReset").onclick = () => { resetBall(); hud(); };
    $("btnExport").onclick = exportJSON;
    $("btnImport").onclick = () => $("fileIn").click();
    $("fileIn").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (Array.isArray(data.holes)) { data.holes.forEach((hh, i) => { if (hh.strokes != null) state.scores[i] = hh.strokes; }); say("Card came in from the back-room book."); hud(); }
        } catch (err) { say("That file isn't a Mosswood card."); }
      };
      reader.readAsText(f);
    };
    document.querySelectorAll("[data-room]").forEach(btn => {
      btn.onclick = () => { const r = ROOMS[btn.dataset.room]; $("roomTitle").innerHTML = r.title; $("roomCopy").textContent = r.copy; };
    });
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") { e.preventDefault(); ensureAudio(); swing(); }
      if (e.key === "ArrowLeft") { if (isPutting()) state.aim = normAim(state.aim - 8); else state.aim = Math.max(-28, state.aim - 2); syncAimSlider(); }
      if (e.key === "ArrowRight") { if (isPutting()) state.aim = normAim(state.aim + 8); else state.aim = Math.min(28, state.aim + 2); syncAimSlider(); }
    });
    setInterval(() => { if (state.ambient && Math.random() < 0.45) chirp(); if (Math.random() < 0.28) spawnBird(); }, 1600);
  }
  function fit() {
    const stage = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(640, stage.width * dpr);
    canvas.height = Math.max(420, stage.height * dpr);
  }
  window.addEventListener("resize", fit);
  renderClubs(); fit(); resetBall(); bind(); hud(); loop();
})();
