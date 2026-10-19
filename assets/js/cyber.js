(() => {
  const root = document.documentElement;
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Pointer drift (drives .aurora + scene parallax)
  const glow = document.querySelector(".cursor-glow");
  let mx = window.innerWidth * 0.7;
  let my = window.innerHeight * 0.25;
  let gx = mx;
  let gy = my;

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      root.style.setProperty("--ax", `${(mx / window.innerWidth) * 100}%`);
      root.style.setProperty("--ay", `${(my / window.innerHeight) * 100}%`);
      if (glow) glow.classList.add("on");
    },
    { passive: true }
  );

  const tickGlow = () => {
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    if (glow) {
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    }
    requestAnimationFrame(tickGlow);
  };
  requestAnimationFrame(tickGlow);

  // Typewriter headline
  const tw = document.querySelector(".typewriter");
  if (tw) {
    const full = tw.getAttribute("data-text") || "";
    let i = 0;
    tw.textContent = "";
    const step = () => {
      tw.textContent = full.slice(0, i);
      i += 1;
      if (i <= full.length) {
        setTimeout(step, 28 + Math.random() * 36);
      } else {
        tw.classList.add("done");
      }
    };
    setTimeout(step, 450);
  }

  // Hero canvas — a night passage: stars, moon, sea, a sailboat underway
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let raf = 0;
  let dpr = 1;

  // squall easter egg: Konami code, or triple-click the status panel
  let squallStart = -1;
  let seaMult = 1; // eases toward the live Open-Meteo wave height
  let vppPhase = 0, lastTs = 0, spScale = 0, vppTwa = 90, vppBs = 11, vppHeel = 16, heelTilt = 0;
  const SQUALL_LEN = 9;
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kIdx = 0;
  window.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kIdx = k === KONAMI[kIdx] ? kIdx + 1 : k === KONAMI[0] ? 1 : 0;
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      squallStart = performance.now();
      console.log("%c⚓ Fair winds, sailor!", "color:#66cfc4;font-size:14px");
    }
  });
  const statusPanel = document.querySelector(".status-panel");
  let taps = 0;
  let lastTapAt = 0;
  if (statusPanel) {
    statusPanel.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTapAt > 1200) taps = 0;
      lastTapAt = now;
      if (++taps >= 3) {
        taps = 0;
        squallStart = performance.now();
      }
    });
  }

  const stars = Array.from({ length: 110 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.52,
    r: 0.4 + Math.random() * 1.1,
    sp: 0.5 + Math.random() * 1.6,
    ph: Math.random() * Math.PI * 2,
  }));

  const gusts = Array.from({ length: 6 }, () => ({
    x: Math.random(),
    y: 0.1 + Math.random() * 0.4,
    len: 70 + Math.random() * 150,
    sp: 0.012 + Math.random() * 0.022,
    a: 0.6 + Math.random() * 0.5,
  }));

  const gulls = Array.from({ length: 4 }, (_, i) => ({
    sp: 0.01 + i * 0.004,
    y0: 0.1 + i * 0.06,
    ph: i * 1.9,
    w: 7 + i * 1.6,
  }));

  // layered sea, back to front; crest height as a fraction of canvas height
  const seaLayers = [
    { y: 0.585, amp: 4.5, len: 190, sp: 0.45 },
    { y: 0.645, amp: 6.5, len: 155, sp: 0.65 },
    { y: 0.72, amp: 8.5, len: 128, sp: 0.85 },
    { y: 0.82, amp: 10.5, len: 105, sp: 1.1 },
  ];

  const crestY = (layer, x, t, ch, mult) =>
    ch * layer.y + (Math.sin(x / layer.len + t * layer.sp) * layer.amp + Math.sin(x / 47 - t * 0.55) * 1.8) * mult;

  const PALETTES = {
    dark: {
      sky: ["rgba(4, 14, 27, 0.9)", "rgba(7, 26, 43, 0.85)", "rgba(13, 43, 62, 0.8)"],
      stars: true,
      orb: {
        core: "rgba(226, 240, 244, 0.92)",
        halo0: "rgba(214, 235, 240, 0.3)",
        halo1: "rgba(160, 205, 215, 0.1)",
        glow: "rgba(214, 235, 240, 0.8)",
      },
      glitter: [200, 228, 234],
      sea: [
        "rgba(40, 96, 110, 0.35)",
        "rgba(26, 76, 92, 0.5)",
        "rgba(14, 52, 68, 0.72)",
        "rgba(7, 32, 46, 0.92)",
      ],
      foamStroke: [0.1, 0.14, 0.16, 0.2],
      foamColor: "168, 216, 220",
      foamDab: "rgba(196, 228, 234,",
      gull: "rgba(200, 224, 230, 0.55)",
      gust: "150, 200, 210",
      gustA: 0.05,
      compass: "rgba(150, 200, 210, 0.07)",
      compassText: "rgba(150, 200, 210, 0.3)",
      hull: "rgba(5, 13, 22, 0.96)",
      sailMain: "rgba(7, 17, 28, 0.94)",
      sailJib: "rgba(9, 21, 33, 0.94)",
      sailEdge: "rgba(180, 216, 224, 0.4)",
      headlight: "rgba(226, 240, 244, 0.95)",
      lantern: "rgba(240, 190, 110, 0.95)",
      lanternGlow: "rgba(240, 190, 110, 0.9)",
      wake: "rgba(190, 222, 228, 0.32)",
      lhTower: "rgba(6, 15, 25, 0.96)",
      lhTrim: "rgba(226, 96, 79, 0.7)",
      lhLamp: "rgba(255, 214, 140, 0.95)",
      beam: "255, 214, 140",
      beamA: 0.13,
    },
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawSky = (cw, ch, t, pal, squall, windBoost) => {
    const sky = ctx.createLinearGradient(0, 0, 0, ch * 0.62);
    sky.addColorStop(0, pal.sky[0]);
    sky.addColorStop(0.7, pal.sky[1]);
    sky.addColorStop(1, pal.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch * 0.62);

    if (pal.stars) {
      stars.forEach((s) => {
        const a = (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * (1 - squall * 0.75);
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 235, 240, ${a * 0.8})`;
        ctx.fill();
      });
    }

    gusts.forEach((g) => {
      g.x += (g.sp / 100) * (1 + squall * 2.2) * windBoost;
      if (g.x > 1.2) g.x = -0.2;
      const y = g.y * ch;
      const grad = ctx.createLinearGradient(g.x * cw, y, g.x * cw + g.len, y);
      grad.addColorStop(0, `rgba(${pal.gust}, 0)`);
      grad.addColorStop(0.5, `rgba(${pal.gust}, ${pal.gustA * g.a * (1 + squall) * windBoost})`);
      grad.addColorStop(1, `rgba(${pal.gust}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(g.x * cw, y);
      ctx.lineTo(g.x * cw + g.len, y + 2);
      ctx.stroke();
    });

    gulls.forEach((g) => {
      const x = ((t * g.sp + g.ph * 0.13) % 1.25 - 0.125) * cw;
      const y = ch * (g.y0 + 0.03 * Math.sin(t * 0.5 + g.ph));
      const flap = Math.sin(t * 7 + g.ph) * g.w * 0.4;
      ctx.strokeStyle = pal.gull;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - g.w, y);
      ctx.quadraticCurveTo(x - g.w / 2, y - flap, x, y);
      ctx.quadraticCurveTo(x + g.w / 2, y - flap, x + g.w, y);
      ctx.stroke();
    });

    if (squall > 0.02) {
      ctx.fillStyle = `rgba(3, 8, 16, ${0.3 * squall})`;
      ctx.fillRect(0, 0, cw, ch * 0.62);
    }
  };

  const drawOrb = (cw, ch, pal) => {
    const ox = cw * (0.72 + (mx / window.innerWidth - 0.5) * 0.02);
    const oy = ch * 0.2;
    const r = Math.min(cw, ch) * 0.042;

    const halo = ctx.createRadialGradient(ox, oy, r * 0.4, ox, oy, r * 9);
    halo.addColorStop(0, pal.orb.halo0);
    halo.addColorStop(0.35, pal.orb.halo1);
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, cw, ch);

    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fillStyle = pal.orb.core;
    ctx.shadowColor = pal.orb.glow;
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
    return { ox, oy, r };
  };

  // large compass rose watermark, slowly turning
  const drawCompass = (cw, ch, t, pal) => {
    const cx = cw * 0.16;
    const cy = ch * 0.27;
    const R = Math.min(cw, ch) * 0.125;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.02);
    ctx.strokeStyle = pal.compass;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const len = k % 2 ? R * 0.52 : R * 0.94;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.16, Math.sin(a) * R * 0.16);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();
    ctx.font = `${Math.max(9, R * 0.17)}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = pal.compassText;
    ctx.textAlign = "center";
    ctx.fillText("N", cx, cy - R - 5);
    ctx.fillText("S", cx, cy + R + R * 0.2);
    ctx.fillText("W", cx - R - R * 0.22, cy + R * 0.06);
    ctx.fillText("E", cx + R + R * 0.22, cy + R * 0.06);
  };

  const drawLighthouse = (cw, ch, t, pal) => {
    const s = Math.min(cw, ch) / 640;
    const x = cw * 0.79;
    const base = ch * 0.585;
    const h = 52 * s;

    const lampY = base - h * 0.82;
    const lampX = x;
    const angle = t * 0.45;
    for (let k = 0; k < 2; k++) {
      ctx.save();
      ctx.translate(lampX, lampY);
      ctx.rotate(angle + k * Math.PI);
      const L = ch * 0.5;
      const g = ctx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, `rgba(${pal.beam}, ${pal.beamA})`);
      g.addColorStop(1, `rgba(${pal.beam}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(L, -12 * s);
      ctx.lineTo(L, 12 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.ellipse(x, base + 2, 30 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.lhTower;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 11 * s, base);
    ctx.lineTo(x - 6.5 * s, base - h * 0.78);
    ctx.lineTo(x + 6.5 * s, base - h * 0.78);
    ctx.lineTo(x + 11 * s, base);
    ctx.closePath();
    ctx.fillStyle = pal.lhTower;
    ctx.fill();

    ctx.fillStyle = pal.lhTower;
    ctx.fillRect(x - 8.5 * s, base - h * 0.86, 17 * s, 3.2 * s);
    ctx.fillRect(x - 5 * s, base - h * 0.98, 10 * s, 8 * s);

    ctx.beginPath();
    ctx.moveTo(x - 6 * s, base - h * 0.98);
    ctx.lineTo(x, base - h * 1.12);
    ctx.lineTo(x + 6 * s, base - h * 0.98);
    ctx.closePath();
    ctx.fillStyle = pal.lhTrim;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lampX, lampY, 2.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = pal.lhLamp;
    ctx.shadowColor = `rgba(${pal.beam}, 0.9)`;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawSeaLayer = (layer, idx, cw, ch, t, pal, mult) => {
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 6) {
      ctx.lineTo(x, crestY(layer, x, t, ch, mult));
    }
    ctx.lineTo(cw, ch);
    ctx.closePath();
    ctx.fillStyle = pal.sea[idx];
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x <= cw; x += 6) {
      const y = crestY(layer, x, t, ch, mult);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${pal.foamColor}, ${pal.foamStroke[idx]})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // shimmering light column on the water below the orb
  const drawGlitter = (cw, ch, t, orb, pal) => {
    const [r, g, b] = pal.glitter;
    const rows = 22;
    for (let i = 0; i < rows; i++) {
      const p = i / rows;
      const y = ch * 0.62 + p * ch * 0.36;
      const shimmer = Math.sin(t * 1.3 + i * 1.7) * 0.5 + 0.5;
      const w = orb.r * (1.2 + p * 5) * (0.55 + shimmer * 0.5);
      const x = orb.ox + Math.sin(t * 0.8 + i * 2.3) * 6;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.2 - p * 0.12) * (0.5 + shimmer * 0.5)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
    }
  };

  const drawBoat = (cw, ch, t, pal, squall) => {
    // IMOCA 60: plumb bow, open transom, canting keel, J-foil, square-top mainsail
    const u = Math.min(cw, ch) / 470;
    const bx = cw * (0.55 + (mx / window.innerWidth - 0.5) * 0.015);
    const layer = seaLayers[1];
    const mult = 1 + squall * 0.8;
    const surf = crestY(layer, bx, t, ch, mult);
    const slope = (crestY(layer, bx + 14, t, ch, mult) - crestY(layer, bx - 14, t, ch, mult)) / 28;

    // racing wake
    const sternX = bx - 54 * u;
    const sternY = surf + 12 * u;
    ctx.strokeStyle = pal.wake;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 60 * u, sternY + 14 * u);
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 64 * u, sternY - 5 * u);
    ctx.moveTo(sternX - 20 * u, sternY + 2 * u);
    ctx.lineTo(sternX - 34 * u, sternY + 6 * u);
    ctx.stroke();

    ctx.save();
    ctx.translate(bx, surf + 2);
    ctx.rotate(Math.atan(slope) * 0.65 + heelTilt + Math.sin(t * 2.1) * 0.07 * squall);
    ctx.scale(u, u);

    // mast + backstay + shrouds
    ctx.strokeStyle = pal.mast || pal.hull;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(2, -152);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, -152);
    ctx.lineTo(-48, -6);
    ctx.moveTo(5, -96);
    ctx.lineTo(18, -14);
    ctx.stroke();

    // mainsail with square-top head and heavy roach
    ctx.beginPath();
    ctx.moveTo(7, -150);
    ctx.lineTo(42, -144);
    ctx.quadraticCurveTo(80, -94, 54, -16);
    ctx.lineTo(6, -15);
    ctx.closePath();
    ctx.fillStyle = pal.sailMain;
    ctx.fill();
    ctx.strokeStyle = pal.sailEdge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, -144);
    ctx.quadraticCurveTo(80, -94, 54, -16);
    ctx.stroke();

    // jib on the forestay (furled when the spinnaker is up)
    if (spScale < 0.5) {
      ctx.beginPath();
      ctx.moveTo(8, -128);
      ctx.lineTo(60, -11);
      ctx.quadraticCurveTo(32, -16, 14, -13);
      ctx.closePath();
      ctx.fillStyle = pal.sailJib;
      ctx.fill();
    }

    // spinnaker (球帆) — opens downwind
    if (spScale > 0.02) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, spScale);
      ctx.translate(14, -132);
      ctx.scale(spScale, spScale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-6, 62, 36, 116);
      ctx.lineTo(60, 120);
      ctx.quadraticCurveTo(76, 56, 48, -8);
      ctx.quadraticCurveTo(26, -10, 0, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(96, 138, 166, 0.97)"; // moonlit spinnaker
      ctx.fill();
      ctx.strokeStyle = pal.sailEdge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(28, 118);
      ctx.quadraticCurveTo(50, 66, 42, -6);
      ctx.stroke();
      ctx.restore();
    }

    // hull: plumb bow, wide open transom
    ctx.beginPath();
    ctx.moveTo(62, -12);
    ctx.lineTo(65, 2);
    ctx.quadraticCurveTo(60, 12, 38, 15);
    ctx.quadraticCurveTo(4, 19, -30, 14);
    ctx.lineTo(-46, 12);
    ctx.lineTo(-51, -4);
    ctx.lineTo(-42, -8);
    ctx.quadraticCurveTo(-10, -13, 24, -12);
    ctx.lineTo(62, -12);
    ctx.closePath();
    ctx.fillStyle = pal.hull;
    ctx.fill();

    // canting keel with bulb
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(4, 44);
    ctx.lineTo(10, 44);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fillStyle = pal.hull;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, 48, 17, 7, -0.06, 0, Math.PI * 2);
    ctx.fill();

    // J-foil amidships + rudder aft
    ctx.lineWidth = 2;
    ctx.strokeStyle = pal.hull;
    ctx.beginPath();
    ctx.moveTo(28, -6);
    ctx.lineTo(33, 16);
    ctx.quadraticCurveTo(36, 26, 50, 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-40, 12);
    ctx.lineTo(-46, 32);
    ctx.stroke();

    // masthead light + stern lantern
    ctx.beginPath();
    ctx.arc(3, -154, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = pal.headlight;
    ctx.shadowColor = pal.headlight;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-50, -5, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.lantern;
    ctx.shadowColor = pal.lanternGlow;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // lantern streak on the water
    const ly = surf + 10;
    const lg = ctx.createLinearGradient(sternX, ly, sternX, ly + 34);
    lg.addColorStop(0, pal.lanternGlow.replace(/[\d.]+\)$/, "0.3)"));
    lg.addColorStop(1, pal.lanternGlow.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = lg;
    ctx.fillRect(sternX - 4 * u, ly, 7, 34);
  };

  // a dolphin porpoises near the boat: ballistic leap, nose-first re-entry,
  // then an underwater tail-beat swim-away (Weihs 2002)
  const drawDolphin = (cw, ch, dt, boatX, pal) => {
    const JUMP_T = 2.0, JUMP_DUR = 1.35, DIVE_T = JUMP_T + JUMP_DUR, SWIM_DUR = 2.3;
    const s = Math.min(cw, ch) / 620;
    const seaY = ch * 0.655;
    const jumpX = boatX + 135 * s;

    function body(x, y, ang, alpha, flexAmp, beat) {
      const P = [[56, 0], [38, -4], [16, -5], [-8, -4], [-30, -2], [-48, 0]];
      const hw = [3.2, 8.5, 11.5, 10.5, 6.5, 3.4];
      const fl = P.map((p, i) => Math.sin(beat - i * 0.9) * flexAmp * (i / (P.length - 1)));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.scale(s, s);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = "rgba(8, 20, 32, 0.95)";
      ctx.beginPath();
      ctx.moveTo(P[0][0] + 15, fl[0] - 2.5);
      for (let i = 0; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1] + fl[i] - hw[i]);
      const tx = P[P.length - 1][0], ty = P[P.length - 1][1] + fl[P.length - 1];
      ctx.lineTo(tx - 11, ty - 10);
      ctx.quadraticCurveTo(tx - 5, ty, tx - 12, ty + 10);
      ctx.lineTo(tx, ty + 3);
      for (let i = P.length - 1; i >= 0; i--) ctx.lineTo(P[i][0], P[i][1] + fl[i] + hw[i]);
      ctx.quadraticCurveTo(46, 6, P[0][0] + 15, fl[0] + 2.5);
      ctx.closePath();
      ctx.fill();
      const dx = P[2][0], dy = P[2][1] + fl[2] - hw[2];
      ctx.beginPath();
      ctx.moveTo(dx - 8, dy + 2);
      ctx.quadraticCurveTo(dx - 1, dy - 13, dx + 8, dy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(168, 216, 220, 0.3)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(34, 5);
      ctx.quadraticCurveTo(2, 12, -28, 6);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    const splash = (x, k) => {
      ctx.strokeStyle = `rgba(${pal.foamColor}, ${0.5 * k})`;
      ctx.lineWidth = 1.4;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(x + i * 12 * s, seaY, (5 + Math.abs(i) * 4) * s, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    };

    // ballistic leap: nose-up exit, glide over the peak, nose-first re-entry
    if (dt >= JUMP_T && dt < DIVE_T + 0.45) {
      const p = (dt - JUMP_T) / JUMP_DUR;
      const x = jumpX + 10 * s + p * 70 * s;
      const y = seaY - Math.sin(Math.min(p, 1) * Math.PI) * ch * 0.15;
      const ang = -0.75 + p * 1.95;
      const gliding = p > 0.3 && p < 0.7 ? 0.12 : 0.4;
      body(x, y, ang, 1, gliding, dt * 3);
      if (p < 0.16 || p > 0.84) splash(x, 1);
    } else if (dt >= DIVE_T + 0.45 && dt < DIVE_T + 0.45 + SWIM_DUR) {
      // shallow coast + tail-beat propulsion, fading as it swims away
      const p = (dt - DIVE_T - 0.45) / SWIM_DUR;
      const x = jumpX + 80 * s + p * 200 * s * (1 - p * 0.35);
      const y = seaY + (14 + p * 30) * s;
      body(x, y, 0.22, 0.55 * (1 - p), 1, dt * 3.2);
    }
  };

  const drawFoam = (cw, ch, t, pal, mult, squall) => {
    for (let i = 0; i < 18; i++) {
      const x = (((i * 61.8) % 100) / 100) * cw;
      const layer = seaLayers[i % 2 ? 2 : 3];
      const y = crestY(layer, x, t, ch, mult) - 2;
      const r = (1 + (i % 3) * 0.7) * (1 + squall * 0.6);
      const a = (0.14 + 0.1 * Math.sin(t * 2 + i)) * (1 + squall);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = pal.foamDab + " " + Math.max(0, Math.min(a, 0.5)).toFixed(2) + ")";
      ctx.fill();
    }
  };

  const draw = (ts) => {
    const t = ts * 0.001;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const pal = PALETTES.dark;
    const seaState = window.__SEA_STATE__ || {};
    const seaTarget = typeof seaState.h === "number"
      ? Math.max(0.6, Math.min(2.3, 0.55 + seaState.h * 0.55))
      : 1;
    seaMult += (seaTarget - seaMult) * 0.03;
    const vpp = window.__VPP_STATE__ || { twa: 90, bs: 11 };
    vppTwa = vpp.twa;
    vppBs = vpp.bs;
    vppHeel = vpp.heel || 16;
    heelTilt += ((vppHeel / 30) * 0.11 - heelTilt) * 0.04;
    const vppDt = Math.min(Math.max(ts - lastTs, 0), 60) / 1000;
    lastTs = ts;
    vppPhase += vppDt * (vppBs / 14) * 2.6;
    spScale += ((vppTwa > 115 ? 1 : 0) - spScale) * 0.05;
    const vppWind = 1 + (vppBs / 14 - 1) * 0.55;
    const windBoost = (1 + Math.min(1.1, (typeof seaState.wind === "number" ? seaState.wind : 8) / 30)) * vppWind;
    ctx.clearRect(0, 0, cw, ch);

    let squall = 0;
    if (squallStart >= 0) {
      const dt = (ts - squallStart) / 1000;
      if (dt < SQUALL_LEN) {
        squall = Math.min(1, dt / 1.2) * Math.min(1, Math.max(0, (SQUALL_LEN - dt) / 1.5));
      } else {
        squallStart = -1;
      }
    }
    const waveMult = (1 + squall * 1.7) * seaMult;
    const tSea = t + vppPhase;

    drawSky(cw, ch, t, pal, squall, windBoost);
    const orb = drawOrb(cw, ch, pal);
    drawCompass(cw, ch, t, pal);
    drawLighthouse(cw, ch, t, pal);
    drawSeaLayer(seaLayers[0], 0, cw, ch, tSea, pal, waveMult);
    drawGlitter(cw, ch, t, orb, pal);
    drawSeaLayer(seaLayers[1], 1, cw, ch, tSea, pal, waveMult);
    drawBoat(cw, ch, tSea, pal, squall);
    if (squall > 0.02) {
      const boatX = cw * (0.55 + (mx / window.innerWidth - 0.5) * 0.015);
      drawDolphin(cw, ch, (ts - squallStart) / 1000, boatX, pal);
    }
    drawSeaLayer(seaLayers[2], 2, cw, ch, tSea, pal, waveMult);
    drawSeaLayer(seaLayers[3], 3, cw, ch, tSea, pal, waveMult);
    drawFoam(cw, ch, tSea, pal, waveMult, squall);

    // surface flow streaks — drift speed and length follow the VPP boat speed
    for (let i = 0; i < 14; i++) {
      const layer = seaLayers[i % 2 ? 2 : 3];
      const speed = 16 + vppBs * 6.5;
      const sx = ((i * 97.3 + tSea * speed) % (cw + 60)) - 30;
      const sy = crestY(layer, sx, tSea, ch, waveMult) + 7 + (i % 3) * 5;
      const len = 8 + (i % 4) * 5 + vppBs * 1.5;
      ctx.strokeStyle = `rgba(${pal.foamColor}, ${0.12 + (vppBs / 26) * 0.32})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + len, sy);
      ctx.stroke();
    }

    // squall rain
    if (squall > 0.05) {
      ctx.strokeStyle = `rgba(168, 216, 220, ${0.22 * squall})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 55; i++) {
        const rx = ((i * 137.5 + t * 240) % (cw + 80)) - 40;
        const ry = (i * 89.3 + t * 430) % (ch * 0.72);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + 13);
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    draw(0);
  } else {
    raf = requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) raf = requestAnimationFrame(draw);
  });
})();
