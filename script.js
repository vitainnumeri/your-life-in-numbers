/* =========================================================================
   Your Life in Numbers — main logic
   Everything runs in the browser: no server, no data sent anywhere.
   ========================================================================= */

(function () {
  "use strict";

  const YEAR_MS = 365.2425 * 24 * 3600 * 1000;
  const DAY_MS = 24 * 3600 * 1000;
  const LUNAR_MONTH_DAYS = 29.530588;
  const EARTH_ORBITAL_KM_S = 29.78; // Earth's orbital speed around the Sun

  // Average rates per age band (per minute) — based on medical averages
  const HEART = [
    { untilAge: 1, perMin: 130 }, { untilAge: 3, perMin: 110 },
    { untilAge: 6, perMin: 95 },  { untilAge: 12, perMin: 85 },
    { untilAge: 18, perMin: 78 }, { untilAge: Infinity, perMin: 72 }
  ];
  const BREATH = [
    { untilAge: 1, perMin: 38 }, { untilAge: 3, perMin: 28 },
    { untilAge: 6, perMin: 24 }, { untilAge: 12, perMin: 20 },
    { untilAge: Infinity, perMin: 16 }
  ];
  // Eyes blink ~15/min but only while awake (~16h/24)
  const BLINK_PER_MIN = 15 * (16 / 24);

  const PLANETS = [
    { name: "Mercury", icon: "☿️", period: 0.2408467 },
    { name: "Venus",   icon: "♀️", period: 0.61519726 },
    { name: "Mars",    icon: "♂️", period: 1.8808158 },
    { name: "Jupiter", icon: "♃",  period: 11.862615 },
    { name: "Saturn",  icon: "♄",  period: 29.447498 }
  ];

  const $ = (sel) => document.querySelector(sel);
  const nf = new Intl.NumberFormat("en-US");
  const fmt = (n) => nf.format(Math.floor(n));

  // Integrate a count (beats/breaths) from birth to now across the age bands
  function integrate(birthMs, nowMs, segments) {
    let total = 0, cursor = birthMs;
    for (const seg of segments) {
      const segEnd = seg.untilAge === Infinity ? nowMs : birthMs + seg.untilAge * YEAR_MS;
      const end = Math.min(segEnd, nowMs);
      if (end > cursor) { total += ((end - cursor) / 60000) * seg.perMin; cursor = end; }
      if (cursor >= nowMs) break;
    }
    return total;
  }
  function currentRate(ageYears, segments) {
    for (const seg of segments) if (ageYears < seg.untilAge) return seg.perMin;
    return segments[segments.length - 1].perMin;
  }

  // ---- Compute all the statistics ----
  function computeStats(birthMs) {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - birthMs);
    const ageYears = elapsedMs / YEAR_MS;
    const daysLived = elapsedMs / DAY_MS;

    const beats = integrate(birthMs, now, HEART);
    const breaths = integrate(birthMs, now, BREATH);
    const blinks = (elapsedMs / 60000) * BLINK_PER_MIN;

    const beatRateSec = currentRate(ageYears, HEART) / 60;
    const breathRateSec = currentRate(ageYears, BREATH) / 60;
    const blinkRateSec = BLINK_PER_MIN / 60;

    // "Soft" estimates (after the first 2 years of life for talking/walking)
    const activeDays = Math.max(0, daysLived - 730);
    const words = activeDays * 16000;
    const steps = activeDays * 5000;
    const water = activeDays * 2;        // liters of water drunk
    const laughs = daysLived * 25;

    // "Live" stats: each has a base value and a per-second growth rate
    const stats = [
      { id: "seconds", base: elapsedMs / 1000, rate: 1 },
      { id: "heart",   base: beats,            rate: beatRateSec },
      { id: "breath",  base: breaths,          rate: breathRateSec },
      { id: "blink",   base: blinks,           rate: blinkRateSec },
      { id: "blood",   base: beats * 0.07,     rate: beatRateSec * 0.07 },     // liters of blood pumped
      { id: "space",   base: (elapsedMs / 1000) * EARTH_ORBITAL_KM_S, rate: EARTH_ORBITAL_KM_S },
      { id: "words",   base: words,            rate: 16000 / DAY_MS * 1000 },
      { id: "water",   base: water,            rate: 2 / DAY_MS * 1000 },
      { id: "steps",   base: steps,            rate: 0 },
      { id: "laughs",  base: laughs,           rate: 0 },
      { id: "days",    base: daysLived,        rate: 0 },
      { id: "sleep",   base: ageYears / 3,     rate: 0 },                       // anni passati a dormire
      { id: "moons",   base: daysLived / LUNAR_MONTH_DAYS, rate: 0 },
      { id: "sunlaps", base: ageYears,         rate: 0 }
    ];

    return { now, birthMs, elapsedMs, ageYears, daysLived, stats };
  }

  // Card descriptions (icon, label, format, subtitle)
  const CARD_META = {
    heart:   { icon: "❤️", label: "Heartbeats", sub: "ticking forever" },
    breath:  { icon: "🫁", label: "Breaths taken" },
    blink:   { icon: "👁️", label: "Eye blinks" },
    blood:   { icon: "🩸", label: "Liters of blood pumped" },
    space:   { icon: "🌍", label: "Km traveled in space", sub: "around the Sun" },
    words:   { icon: "🗣️", label: "Words spoken", sub: "estimate" },
    water:   { icon: "💧", label: "Liters of water drunk", sub: "estimate" },
    steps:   { icon: "👣", label: "Steps taken", sub: "estimate" },
    laughs:  { icon: "😂", label: "Times you've laughed", sub: "estimate" },
    days:    { icon: "📅", label: "Days lived" },
    sleep:   { icon: "😴", label: "Years spent sleeping", decimals: 1 },
    moons:   { icon: "🌕", label: "Full moons risen" },
    sunlaps: { icon: "☀️", label: "Trips around the Sun", sub: "your age!" }
  };
  const GRID_ORDER = ["heart", "breath", "blink", "blood", "space", "days",
    "sleep", "moons", "sunlaps", "water", "words", "steps", "laughs"];

  let tickHandle = null;
  let loadTime = 0;
  let snapshot = null;

  function buildGrid(stats) {
    const grid = $("#stats-grid");
    grid.innerHTML = "";
    const map = {};
    stats.forEach(s => map[s.id] = s);
    GRID_ORDER.forEach(id => {
      const meta = CARD_META[id]; if (!meta) return;
      const el = document.createElement("div");
      el.className = "stat";
      el.innerHTML = `<span class="icon">${meta.icon}</span>
        <span class="value" data-stat="${id}">0</span>
        <span class="label">${meta.label}</span>
        ${meta.sub ? `<span class="sub">${meta.sub}</span>` : ""}`;
      grid.appendChild(el);
    });
  }

  function renderValue(id, val) {
    const meta = CARD_META[id] || {};
    const els = document.querySelectorAll(`[data-stat="${id}"]`);
    let text;
    if (meta.decimals) text = val.toFixed(meta.decimals);
    else text = fmt(val);
    els.forEach(e => e.textContent = text);
  }

  function startTicking() {
    cancelAnimationFrame(tickHandle);
    const loop = () => {
      const elapsedSec = (Date.now() - loadTime) / 1000;
      snapshot.stats.forEach(s => renderValue(s.id, s.base + s.rate * elapsedSec));
      tickHandle = requestAnimationFrame(loop);
    };
    loop();
  }

  function buildPlanets(ageYears) {
    const card = $("#planets-card");
    card.innerHTML = `<h3>🪐 Your age on other planets</h3><div class="planets-grid"></div>`;
    const grid = card.querySelector(".planets-grid");
    PLANETS.forEach(p => {
      const age = ageYears / p.period;
      const el = document.createElement("div");
      el.className = "planet";
      el.innerHTML = `<span class="pico">${p.icon}</span>
        <span class="page">${age.toFixed(1)}</span>
        <span class="pname">years on ${p.name}</span>`;
      grid.appendChild(el);
    });
  }

  // ---- Age sentence + day of the week + next birthday ----
  function describeAge(birthMs, ageYears) {
    const d = new Date(birthMs);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const years = Math.floor(ageYears);
    // next birthday
    const now = new Date();
    let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (next < now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
    const daysToBday = Math.ceil((next - now) / DAY_MS);
    const bdayTxt = daysToBday === 0 ? "🎉 It's your birthday today, happy birthday!"
      : `🎂 ${daysToBday} days until your next birthday`;
    return `You are ${years} years old · you were born on a <strong>${weekday}</strong><br>${bdayTxt}`;
  }

  // ---- Show the results ----
  function showResults(data) {
    const { nome, cognome, birthMs } = data;
    snapshot = computeStats(birthMs);
    loadTime = Date.now();

    const fullName = `${nome} ${cognome}`.trim();
    $("#result-title").textContent = fullName ? `The life of ${fullName}` : "Your life";
    $("#result-age").innerHTML = describeAge(birthMs, snapshot.ageYears);

    buildGrid(snapshot.stats);
    buildPlanets(snapshot.ageYears);
    startTicking();

    $("#form-section").classList.add("hidden");
    $("#results").classList.remove("hidden");
    $("#results").scrollIntoView({ behavior: "smooth" });
    mountAds();   // now the in-result ad spots are visible → mount them

    saveToUrl(data);
    window.__shareData = { fullName, birthMs };
  }

  // ---- Shareable URL (personalized data in the link) ----
  function saveToUrl(data) {
    const p = new URLSearchParams();
    if (data.nome) p.set("n", data.nome);
    if (data.cognome) p.set("c", data.cognome);
    p.set("d", new Date(data.birthMs).toISOString());
    history.replaceState(null, "", "?" + p.toString());
  }
  function loadFromUrl() {
    const p = new URLSearchParams(location.search);
    if (!p.get("d")) return false;
    const birth = new Date(p.get("d"));
    if (isNaN(birth)) return false;
    showResults({ nome: p.get("n") || "", cognome: p.get("c") || "", birthMs: birth.getTime() });
    return true;
  }

  // ---- Sharing ----
  function doShare(kind) {
    const url = location.href;
    const name = (window.__shareData && window.__shareData.fullName) || "me";
    const text = `😱 Look how much I've lived! Discover your own life in numbers too:`;
    const enc = encodeURIComponent;
    let target = null;
    switch (kind) {
      case "facebook": target = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`; break;
      case "whatsapp": target = `https://wa.me/?text=${enc(text + " " + url)}`; break;
      case "telegram": target = `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`; break;
      case "x":        target = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`; break;
      case "copy":
        navigator.clipboard?.writeText(url).then(
          () => toast("Link copied! ✅"),
          () => prompt("Copy the link:", url)
        );
        return;
    }
    if (target) window.open(target, "_blank", "noopener,width=600,height=500");
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#36e0a4;color:#0f0c29;padding:12px 22px;border-radius:30px;font-weight:700;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3)";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  // ---- Analytics (loaded only if configured) ----
  // Note: Google AdSense is loaded via a static <script> in the <head> of each
  // HTML page (best for site verification + Auto Ads), not injected here.
  function loadIntegrations() {
    const cfg = window.SITE_CONFIG || {};
    // Google Analytics
    if (cfg.analytics && cfg.analytics.enabled && cfg.analytics.measurementId.indexOf("XXXX") === -1) {
      const id = cfg.analytics.measurementId;
      const g = document.createElement("script");
      g.async = true;
      g.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", id);
    }
  }

  // ---- Manual high-value ad units (mounted only when slot IDs are set in config) ----
  function mountAd(container) {
    if (!container || container.dataset.mounted) return;
    if (container.offsetParent === null) return;            // skip if not visible yet
    const ads = (window.SITE_CONFIG || {}).adsense || {};
    const pos = container.getAttribute("data-ad-position");
    const slotId = ads.slots && ads.slots[pos];
    if (!ads.publisherId || !slotId) return;                // no slot ID yet → Auto Ads handles it
    container.dataset.mounted = "1";
    container.innerHTML = `<ins class="adsbygoogle" style="display:block"
      data-ad-client="${ads.publisherId}" data-ad-slot="${slotId}"
      data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }
  function mountAds() { document.querySelectorAll(".ad-slot").forEach(mountAd); }

  // ---- Startup ----
  document.addEventListener("DOMContentLoaded", () => {
    loadIntegrations();
    mountAds();

    $("#life-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const nascita = $("#nascita").value;
      if (!nascita) return;
      const ora = $("#ora").value || "12:00";
      const birth = new Date(`${nascita}T${ora}`);
      if (isNaN(birth) || birth.getTime() > Date.now()) {
        toast("Please check your date of birth 🙂");
        return;
      }
      showResults({
        nome: $("#nome").value.trim(),
        cognome: $("#cognome").value.trim(),
        birthMs: birth.getTime()
      });
    });

    $("#restart").addEventListener("click", () => {
      cancelAnimationFrame(tickHandle);
      history.replaceState(null, "", location.pathname);
      $("#results").classList.add("hidden");
      $("#form-section").classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.querySelectorAll(".share-btn").forEach(b =>
      b.addEventListener("click", () => doShare(b.getAttribute("data-share"))));

    // If the link already contains data (shared link), show the results right away
    loadFromUrl();
  });

})();
