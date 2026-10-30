window.__err = []; window.addEventListener("error", (e) => window.__err.push(String(e.message) + " @" + (e.lineno||0)));
(() => {
  const root = document.documentElement;
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const setMenu = (open, restoreFocus = false) => {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) toggle.focus();
  };
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenu(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) setMenu(false, true);
    });
    document.addEventListener("click", (event) => {
      if (nav.classList.contains("open") && !event.target.closest(".topbar")) setMenu(false);
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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const watchMedia = (query, handler) => {
    if (typeof query.addEventListener === "function") query.addEventListener("change", handler);
    else if (typeof query.addListener === "function") query.addListener(handler);
  };

  // Pointer drift (drives .aurora + scene parallax)
  const glow = document.querySelector(".cursor-glow");
  let mx = window.innerWidth * 0.7;
  let my = window.innerHeight * 0.25;
  let gx = mx;
  let gy = my;
  let glowRaf = 0;

  const canRunGlow = () => glow && !document.hidden && !reducedMotion.matches && finePointer.matches;
  const stopGlow = () => {
    if (glowRaf) {
      cancelAnimationFrame(glowRaf);
      glowRaf = 0;
    }
  };
  const tickGlow = () => {
    if (!canRunGlow()) {
      glowRaf = 0;
      if (glow) glow.classList.remove("on");
      return;
    }
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    if (glow) {
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      glow.classList.add("on");
    }
    glowRaf = requestAnimationFrame(tickGlow);
  };
  const startGlow = () => {
    if (canRunGlow() && !glowRaf) glowRaf = requestAnimationFrame(tickGlow);
  };
  const updateGlowMode = () => {
    stopGlow();
    if (glow && (reducedMotion.matches || !finePointer.matches)) glow.classList.remove("on");
    else startGlow();
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (document.hidden || reducedMotion.matches || !finePointer.matches) return;
      mx = e.clientX;
      my = e.clientY;
      root.style.setProperty("--ax", `${(mx / window.innerWidth) * 100}%`);
      root.style.setProperty("--ay", `${(my / window.innerHeight) * 100}%`);
      startGlow();
    },
    { passive: true }
  );
  watchMedia(reducedMotion, updateGlowMode);
  watchMedia(finePointer, updateGlowMode);
  document.addEventListener("visibilitychange", () => {
    stopGlow();
    if (!document.hidden) startGlow();
  });

  // Typewriter headline
  const tw = document.querySelector(".typewriter");
  let typeTimer = 0;
  const clearTypewriter = () => {
    if (typeTimer) {
      clearTimeout(typeTimer);
      typeTimer = 0;
    }
  };
  const completeTypewriter = () => {
    clearTypewriter();
    if (!tw) return;
    tw.textContent = tw.getAttribute("data-text") || "";
    tw.classList.add("done");
  };
  const startTypewriter = () => {
    clearTypewriter();
    if (!tw) return;
    const full = tw.getAttribute("data-text") || "";
    let i = 0;
    tw.textContent = "";
    tw.classList.remove("done");
    const step = () => {
      tw.textContent = full.slice(0, i);
      i += 1;
      if (i <= full.length) {
        typeTimer = setTimeout(step, 28 + Math.random() * 36);
      } else {
        tw.classList.add("done");
      }
    };
    typeTimer = setTimeout(step, 450);
  };
  const updateTypewriterMode = () => {
    if (reducedMotion.matches) completeTypewriter();
    else startTypewriter();
  };
  if (tw) {
    if (reducedMotion.matches) completeTypewriter();
    else startTypewriter();
    watchMedia(reducedMotion, updateTypewriterMode);
  }

  // Hero canvas — a night passage: stars, moon, sea, a sailboat underway
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let raf = 0;
  let animationToken = 0;
  let heroVisible = true;
  let dpr = 1;
  let panelLeft = Infinity;
  let panelTop = Infinity;
  let dolphinLeft = 0, dolphinRight = 0;

  // squall easter egg: Konami code, or triple-click the status panel
  let squallStart = -1;
  let seaMult = 1; // eases toward the live Open-Meteo wave height
  let vppPhase = 0, lastTs = 0, vppTwa = 90, vppTws = 8, vppBs = 10.7, boatHeel = 12;
  const SQUALL_LEN = 9;
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kIdx = 0;
  window.addEventListener("keydown", (e) => {
    // e.code is the physical key: immune to IME composition and layouts,
    // so the B/A steps still land while a Chinese IME is active
    const k = e.code === "KeyB" ? "b" : e.code === "KeyA" ? "a" : e.key.length === 1 ? e.key.toLowerCase() : e.key;
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
      compass: "rgba(150, 200, 210, 0.2)",
      compassText: "rgba(150, 200, 210, 0.45)",
      hull: "rgba(5, 13, 22, 0.96)",
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
    const panels = document.querySelector(".hero-instruments");
    panelLeft = panels && window.innerWidth > 900
      ? panels.getBoundingClientRect().left - rect.left : Infinity;
    panelTop = panels && window.innerWidth <= 900
      ? panels.getBoundingClientRect().top - rect.top : Infinity;
    const introduction = document.querySelector(".hero-line")?.getBoundingClientRect();
    dolphinLeft = introduction ? introduction.left - rect.left : rect.width * 0.12;
    dolphinRight = introduction ? introduction.right - rect.left : rect.width * 0.4;
  };

  const boatXFor = (cw, ch) => Math.min(
    cw * (0.55 + (mx / window.innerWidth - 0.5) * 0.015),
    panelLeft - Math.min(cw, ch) / 540 * 125 - 24
  );

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
    const oy = ch * 0.2;
    const r = Math.min(cw, ch) * 0.042;
    const ox = Math.min(cw * (0.72 + (mx / window.innerWidth - 0.5) * 0.02), panelLeft - r - 32);

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
    const cx = cw * 0.10;
    const cy = ch * 0.80;
    const R = Math.min(cw, ch) * 0.11;
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

  const drawLighthouse = (cw, ch, t, pal, squall) => {
    // 风暴时灯频闪
    const strobe = squall > 0.1 ? (Math.sin(t * 34) > -0.3 ? 1 : 0.12) : 1;
    const s = Math.min(cw, ch) / 640;
    // Distant lighthouse between the introduction and the boat, clear of the panels.
    const x = cw * 0.46;
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
      g.addColorStop(0, `rgba(${pal.beam}, ${pal.beamA * (0.35 + 0.65 * strobe)})`);
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

    ctx.strokeStyle = "rgba(132, 164, 176, 0.28)";
    ctx.lineWidth = 0.7;
    ctx.stroke();

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

    ctx.globalAlpha = strobe;
    ctx.beginPath();
    ctx.arc(lampX, lampY, 2.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = pal.lhLamp;
    ctx.shadowColor = `rgba(${pal.beam}, 0.9)`;
    ctx.shadowBlur = 8 + 14 * strobe;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
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
    // IMOCA 60, 2022 foiling generation — proportions per published specs:
    // LOA 18.28m · mast ~29.5m (1.6×LOA) · main ~120m² · draft 4.5m · bulb ~3.4m
    const u = Math.min(cw, ch) / 540;
    const bx = boatXFor(cw, ch);
    const layer = seaLayers[1];
    const mult = 1 + squall * 0.8;
    const surf = crestY(layer, bx, t, ch, mult);
    const slope = (crestY(layer, bx + 14, t, ch, mult) - crestY(layer, bx - 14, t, ch, mult)) / 28;

    const sternX = bx - 49 * u;

    ctx.save();
    ctx.translate(bx, surf + 2);
    const wavePitch = Math.max(-0.03, Math.min(0.03, Math.atan(slope) * 0.12 + Math.sin(t * 2.1) * 0.018 * squall));
    ctx.rotate(wavePitch);
    ctx.scale(u, u);

    const wakeTime = lastTs * 0.001;
    const projection = window.ImocaSails.projectionFor(boatHeel);
    window.ImocaWater.draw(ctx, vppBs, wakeTime, false, projection);

    // Fixed port-side profile: main aft of the mast, bow to the right.
    // The exact same 38 configurations drive both the VPP readout and this scene.
    const sailState = window.ImocaSails.getState(vppTws, vppTwa);
    ctx.save();
    // Longitudinal roll in an orthographic side view shortens vertical heights.
    // Wave-induced pitch remains the separate rotation above.
    ctx.scale(1, projection.verticalScale);
    ctx.save();
    ctx.translate(14, -12);
    ctx.scale(0.55, 0.55);
    ctx.translate(-181, -400);
    window.ImocaSails.draw(ctx, sailState, {hull: pal.hull, edge: pal.sailEdge, heel: boatHeel});
    ctx.restore();

    // masthead light + stern lantern
    ctx.beginPath();
    ctx.arc(1, -224, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = pal.headlight;
    ctx.shadowColor = pal.headlight;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-54, -6 + 18 * projection.depthScale, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.lantern;
    ctx.shadowColor = pal.lanternGlow;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    window.ImocaWater.draw(ctx, vppBs, wakeTime, true, projection);
    ctx.restore();

    // lantern reflection: 暖色横向光斑
    for (let i = 0; i < 4; i++) {
      const ly = surf + 12 * u + i * 8 * u;
      const lw = (20 - i * 3.5) * u;
      const la = 0.3 - i * 0.07;
      ctx.fillStyle = `rgba(240, 190, 110, ${Math.max(0.05, la)})`;
      ctx.fillRect(sternX - lw / 2, ly, lw, 1.8);
    }
  };

  // A porpoising dolphin occupies the left introduction's sea lane.
  const drawDolphin = (cw, ch, dt, pal) => {
    const JUMP_T = 3.4, JUMP_DUR = 1.6, AIR_T = JUMP_T + JUMP_DUR, SWIM_DUR = 2.3;
    const s = Math.min(cw, ch) / 740;
    const seaY = Math.min(ch * 0.655, panelTop - 95 * s);
    const jumpX = dolphinLeft + 65 * s;
    const landingX = Math.max(jumpX + 35 * s, Math.min(dolphinRight - 70 * s,
      window.innerWidth > 900 ? boatXFor(cw, ch) - 130 * s : dolphinRight - 70 * s));
    const travel = landingX - jumpX;

    function body(x, y, ang, alpha, bend, beat) {
      const P = [[56, 0], [38, -4], [16, -5], [-8, -4], [-30, -2], [-48, 0]];
      const hw = [3.2, 8.5, 11.5, 10.5, 6.5, 3.4];
      const fl = P.map((p, i) => {
        const k = i / (P.length - 1);
        return Math.sin(beat - k * 2.4) * 8 * k + Math.sin(k * Math.PI) * bend * k;
      });
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.scale(s, s);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = "rgba(116, 155, 171, 0.97)";
      ctx.beginPath();
      ctx.moveTo(70, fl[0] - 1.5);
      ctx.quadraticCurveTo(63, fl[0] - 4, 57, fl[0] - 3);
      ctx.quadraticCurveTo(52, fl[0] - 12, 38, -12 + fl[1]);
      for (let i = 2; i < P.length; i++) {
        const previous = P[i - 1], current = P[i];
        ctx.quadraticCurveTo(previous[0], previous[1] + fl[i - 1] - hw[i - 1],
          (previous[0] + current[0]) / 2,
          (previous[1] + fl[i - 1] - hw[i - 1] + current[1] + fl[i] - hw[i]) / 2);
      }
      const tx = P[P.length - 1][0], ty = P[P.length - 1][1] + fl[P.length - 1];
      ctx.lineTo(tx - 11, ty - 10);
      ctx.quadraticCurveTo(tx - 5, ty, tx - 12, ty + 10);
      ctx.lineTo(tx, ty + 3);
      for (let i = P.length - 1; i >= 0; i--) ctx.lineTo(P[i][0], P[i][1] + fl[i] + hw[i]);
      ctx.quadraticCurveTo(48, 11 + fl[0], 57, 3 + fl[0]);
      ctx.lineTo(69, 2 + fl[0]);
      ctx.closePath();
      ctx.fill();
      const dx = P[2][0], dy = P[2][1] + fl[2] - hw[2];
      ctx.beginPath();
      ctx.moveTo(dx - 8, dy + 2);
      ctx.quadraticCurveTo(dx - 7, dy - 11, dx - 2, dy - 18);
      ctx.quadraticCurveTo(dx + 8, dy - 15, dx + 10, dy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(69, 105, 124, 0.9)";
      ctx.beginPath();
      ctx.moveTo(28, 6 + fl[2]);
      ctx.quadraticCurveTo(17, 12 + fl[2], 5, 25 + fl[2]);
      ctx.quadraticCurveTo(20, 23 + fl[2], 35, 8 + fl[2]);
      ctx.fill();
      ctx.fillStyle = "#152e3b";
      ctx.beginPath();ctx.arc(48, -3 + fl[0], 1.25, 0, Math.PI * 2);ctx.fill();
      ctx.strokeStyle = "rgba(184, 215, 222, 0.48)";
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
    if (dt >= JUMP_T && dt < AIR_T) {
      // 跃水弧线: 上升段弓背蓄力, 顶点舒展滑翔, 下降段收腹, 出入水瞬间尾鳍发力
      const p = (dt - JUMP_T) / JUMP_DUR;
      const height = ch * 0.085;
      const x = jumpX + p * travel;
      const y = seaY - 4 * height * p * (1 - p);
      const ang = Math.atan2(-4 * height * (1 - 2 * p), travel) * 0.65;
      const bend = -Math.sin(p * Math.PI * 0.9) * (6 + p * 10);
      const beat = (p < 0.18 || p > 0.82 ? 1.6 : 0.5) + dt * 2.2;
      body(x, y, ang, 1, bend, beat);
      if (p < 0.15 || p > 0.85) splash(x, 1);
    } else if (dt >= AIR_T && dt < AIR_T + SWIM_DUR) {
      // 入水后: 明显的尾鳍上下拍击推进, 渐隐游远
      const p = (dt - AIR_T) / SWIM_DUR;
      const x = landingX + p * 65 * s;
      const y = seaY + (8 * p + 32 * p * p) * s;
      const entryAngle = Math.atan2(4 * ch * 0.085, travel) * 0.65;
      body(x, y, entryAngle * (1 - p) + 0.15 * p, 1 - p * 0.9, 1.4, dt * 4.2);
      if (p < 0.2) splash(landingX, 1 - p * 5);
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
    const vpp = window.__VPP_STATE__ || { tws: 8, twa: 90, bs: 10.7 };
    vppTwa = vpp.twa;
    vppTws = vpp.tws;
    vppBs = vpp.bs;
    const vppDt = Math.min(Math.max(ts - lastTs, 0), 60) / 1000;
    lastTs = ts;
    boatHeel += ((vpp.heel || 0) - boatHeel) * (1 - Math.exp(-vppDt * 5));
    vppPhase += vppDt * (vppBs / 14) * 2.6;
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
    drawLighthouse(cw, ch, t, pal, squall);
    drawSeaLayer(seaLayers[0], 0, cw, ch, tSea, pal, waveMult);
    drawGlitter(cw, ch, t, orb, pal);
    drawSeaLayer(seaLayers[1], 1, cw, ch, tSea, pal, waveMult);
    drawBoat(cw, ch, tSea, pal, squall);
    const dolphinTime = squall > 0.02 ? (ts - squallStart) / 1000 : (t + 2) % 24;
    drawDolphin(cw, ch, dolphinTime, pal);
    drawSeaLayer(seaLayers[2], 2, cw, ch, tSea, pal, waveMult);
    drawSeaLayer(seaLayers[3], 3, cw, ch, tSea, pal, waveMult);
    drawFoam(cw, ch, tSea, pal, waveMult, squall);
    drawCompass(cw, ch, t, pal);

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

    // lightning — two jagged strikes during the squall
    let flash = 0, boltPts = null;
    if (squall > 0.1) {
      const sdt = (ts - squallStart) / 1000;
      for (const bt of [1.1, 2.5]) {
        if (sdt >= bt && sdt < bt + 0.13) {
          flash = 1 - (sdt - bt) / 0.13;
          let seed = Math.floor(squallStart) + Math.round(bt * 100);
          const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
          const topY = ch * 0.05, endY = ch * 0.6;
          let bx0 = cw * (0.22 + rnd() * 0.5);
          boltPts = [[bx0, topY]];
          for (let k = 1; k <= 9; k++) {
            bx0 += (rnd() - 0.5) * cw * 0.05;
            boltPts.push([bx0, topY + ((endY - topY) * k) / 9]);
          }
          break;
        }
      }
    }
    if (boltPts) {
      ctx.strokeStyle = `rgba(228, 240, 255, ${0.9 * flash})`;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "rgba(205, 228, 255, 0.95)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      boltPts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      const mid = boltPts[4];
      ctx.beginPath();
      ctx.moveTo(mid[0], mid[1]);
      ctx.lineTo(mid[0] - 26, mid[1] + 46);
      ctx.lineTo(mid[0] - 44, mid[1] + 78);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(208, 228, 252, ${0.15 * flash})`;
      ctx.fillRect(0, 0, cw, ch);
    }

    window.__drawOK = (window.__drawOK || 0) + 1;
  };

  window.__dbgDol = (dt) => drawDolphin(canvas.width / dpr, canvas.height / dpr, dt, PALETTES.dark);
  window.__dbgWater = (t) => { drawSeaLayer(seaLayers[3], 3, cw, ch, t + vppPhase, PALETTES.dark, 1); };
  window.__vppSquallCheck = (dt) => { squallStart = 1000; draw(1000 + dt * 1000); };
  window.__drawFrame = draw;
  const shouldAnimate = () => !document.hidden && heroVisible && !reducedMotion.matches;
  const stopAnimation = () => {
    animationToken += 1;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const startAnimation = () => {
    if (!shouldAnimate() || raf) return;
    const token = ++animationToken;
    const animationLoop = (ts) => {
      if (token !== animationToken) return;
      raf = 0;
      draw(ts);
      if (shouldAnimate()) raf = requestAnimationFrame(animationLoop);
    };
    raf = requestAnimationFrame(animationLoop);
  };
  const renderStatic = () => draw(performance.now());
  const reconcileAnimation = () => {
    if (!shouldAnimate()) stopAnimation();
    else startAnimation();
    if (reducedMotion.matches) renderStatic();
  };

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion.matches) renderStatic();
  });

  if (reducedMotion.matches) renderStatic();
  else startAnimation();
  watchMedia(reducedMotion, reconcileAnimation);
  window.addEventListener("vppchange", () => {
    if (reducedMotion.matches) renderStatic();
  });
  document.addEventListener("visibilitychange", () => reconcileAnimation());

  const hero = canvas.closest(".hero");
  if (hero && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroVisible = entries.some((entry) => entry.target === hero && entry.isIntersecting);
        reconcileAnimation();
      },
      { threshold: 0.05 }
    );
    heroObserver.observe(hero);
  }
})();
