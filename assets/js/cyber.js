window.__err = []; window.addEventListener("error", (e) => window.__err.push(String(e.message) + " @" + (e.lineno||0)));
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

  // VPP 极坐标面板顶边与 eyebrow 行顶边对齐
  const heroEl = document.querySelector(".hero");
  const polarEl = document.querySelector(".hero-polar");
  const eyebrowEl = document.querySelector(".hero .eyebrow");
  if (heroEl && polarEl && eyebrowEl) {
    const alignPolar = () => {
      var top = eyebrowEl.getBoundingClientRect().top - heroEl.getBoundingClientRect().top;
      polarEl.style.top = Math.max(24, Math.round(top)) + "px";
    };
    alignPolar();
    window.addEventListener("resize", alignPolar);
    setTimeout(alignPolar, 350);
  }

  // 版权保护: 禁右键/复制/剪切/选择 (防君子层面的门槛)
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("copy", (e) => e.preventDefault());
  document.addEventListener("cut", (e) => e.preventDefault());

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
  let vppPhase = 0, lastTs = 0, spScale = 0, vppTwa = 90, vppBs = 11, vppHeel = 16, heelTilt = 0, mainRot = -0.06;
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

  const drawLighthouse = (cw, ch, t, pal, squall) => {
    // 风暴时灯频闪
    const strobe = squall > 0.1 ? (Math.sin(t * 34) > -0.3 ? 1 : 0.12) : 1;
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
    const u = Math.min(cw, ch) / 400;
    const bx = cw * (0.55 + (mx / window.innerWidth - 0.5) * 0.015);
    const layer = seaLayers[1];
    const mult = 1 + squall * 0.8;
    const surf = crestY(layer, bx, t, ch, mult);
    const slope = (crestY(layer, bx + 14, t, ch, mult) - crestY(layer, bx - 14, t, ch, mult)) / 28;

    // racing wake: 船首 V 波 + 船尾尾流 + 泡沫
    const bowX = bx + 74 * u;
    const sternX = bx - 58 * u;
    const sternY = surf + 13 * u;
    ctx.strokeStyle = pal.wake;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bowX, surf + 1 * u);
    ctx.lineTo(bowX + 26 * u, surf + 13 * u);
    ctx.moveTo(bowX, surf + 1 * u);
    ctx.lineTo(bowX + 16 * u, surf + 15 * u);
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 66 * u, sternY + 16 * u);
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 70 * u, sternY - 6 * u);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const f = i / 5;
      const fx = sternX - (16 + i * 12) * u;
      const fy = sternY + (i % 2 ? 7 : -3) * u;
      ctx.globalAlpha = 0.55 * (1 - f);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 9 * u, fy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(bx, surf + 2);
    ctx.rotate(Math.atan(slope) * 0.65 + Math.sin(t * 2.1) * 0.07 * squall);
    ctx.scale(u, u);

    // 帆装: 横倾压缩 + 主帆帆形随航角变化 (迎风平直 → 顺风鼓满)
    const rigScaleY = 1 - (vppHeel / 30) * 0.3;
    mainRot += (-(0.06 + trimF * 0.38) - mainRot) * 0.05;
    const trimF = vppTwa < 60 ? 0 : vppTwa < 115 ? 0.5 : 1;

    ctx.save();
    ctx.translate(0, -12);
    ctx.scale(1, rigScaleY);
    ctx.translate(0, 12);

    // mast (29.5m, 轻微后倾) + backstay + shrouds
    ctx.strokeStyle = pal.mast || pal.hull;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(14, -12);
    ctx.lineTo(1, -222);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, -222);
    ctx.lineTo(-54, -5);
    ctx.moveTo(5, -150);
    ctx.lineTo(60, -10);
    ctx.moveTo(3, -108);
    ctx.lineTo(62, -10);
    ctx.stroke();

    // mainsail ~120m²: 绕挂点旋转 — 迎风绷紧, 顺风松帆后倒; luff 沿桅, square-top head
    ctx.save();
    ctx.translate(13, -13);
    ctx.rotate(mainRot);
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(-11, -206);
    ctx.lineTo(hx - 12, -194);
    ctx.quadraticCurveTo(lcx - 13, -110, 50 - trimF * 6, -2);
    ctx.closePath();
    ctx.fillStyle = pal.sailMain;
    ctx.fill();
    ctx.strokeStyle = pal.sailEdge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx - 12, -194);
    ctx.quadraticCurveTo(lcx - 13, -110, 50 - trimF * 6, -2);
    ctx.stroke();
    ctx.restore();

    // spinnaker (球帆) — masthead kite, 桅顶到船首的巨球 (顺风才升)
    if (spScale > 0.02) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, spScale);
      ctx.translate(1, -222);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(40, 110, 72, 212);
      ctx.lineTo(30, 206);
      ctx.quadraticCurveTo(-26, 108, 0, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(96, 138, 166, 0.97)"; // moonlit spinnaker
      ctx.fill();
      ctx.strokeStyle = pal.sailEdge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(72, 212);
      ctx.quadraticCurveTo(78, 100, 60, 20);
      ctx.stroke();
      ctx.restore();
    }

    // jib on the forestay (furl 当球帆升起)
    if (spScale < 0.5) {
      ctx.beginPath();
      ctx.moveTo(9, -206);
      ctx.lineTo(71, -9);
      ctx.quadraticCurveTo(40, -14, 20, -12);
      ctx.closePath();
      ctx.fillStyle = pal.sailJib;
      ctx.fill();
    }

    ctx.restore(); // rig 压缩结束

    // hull — knuckle bow, near-vertical stem, open transom
    ctx.beginPath();
    ctx.moveTo(74, -10);
    ctx.lineTo(71, 6);
    ctx.quadraticCurveTo(66, 12, 48, 15);
    ctx.quadraticCurveTo(8, 19, -28, 13);
    ctx.lineTo(-50, 11);
    ctx.lineTo(-57, -3);
    ctx.lineTo(-49, -7);
    ctx.quadraticCurveTo(-6, -14, 34, -12);
    ctx.closePath();
    ctx.fillStyle = pal.hull;
    ctx.fill();

    // canting keel + bulb (吃水 4.5m, 球头 3.4m)
    ctx.beginPath();
    ctx.moveTo(1, 15);
    ctx.lineTo(6, 46);
    ctx.lineTo(11, 46);
    ctx.lineTo(4, 15);
    ctx.closePath();
    ctx.fillStyle = pal.hull;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, 49, 12, 4.5, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // J-foil amidships + twin rudder
    ctx.lineWidth = 2;
    ctx.strokeStyle = pal.hull;
    ctx.beginPath();
    ctx.moveTo(26, -4);
    ctx.lineTo(31, 18);
    ctx.quadraticCurveTo(35, 30, 52, 37);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-43, 11);
    ctx.lineTo(-49, 34);
    ctx.stroke();

    // masthead light + stern lantern
    ctx.beginPath();
    ctx.arc(1, -224, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = pal.headlight;
    ctx.shadowColor = pal.headlight;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-54, -6, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.lantern;
    ctx.shadowColor = pal.lanternGlow;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
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

  // a dolphin porpoises near the boat: ballistic leap, nose-first re-entry,
  // then an underwater tail-beat swim-away (Weihs 2002)
  const drawDolphin = (cw, ch, dt, boatX, pal) => {
    const JUMP_T = 3.4, JUMP_DUR = 1.35, DIVE_T = JUMP_T + JUMP_DUR, AIR_T = DIVE_T + 0.45, SWIM_DUR = 2.3;
    const s = Math.min(cw, ch) / 620;
    const seaY = ch * 0.655;
    const jumpX = boatX + 135 * s;

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
      ctx.fillStyle = "rgba(88, 128, 156, 0.97)"; // moonlit dolphin
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
    if (dt >= JUMP_T && dt < AIR_T) {
      // 跃水弧线: 上升段弓背蓄力, 顶点舒展滑翔, 下降段收腹, 出入水瞬间尾鳍发力
      const p = (dt - JUMP_T) / JUMP_DUR;
      const x = jumpX + 10 * s + p * 70 * s;
      const y = seaY - Math.sin(Math.min(p, 1) * Math.PI) * ch * 0.105;
      const ang = -0.7 + p * 1.45;
      const bend = -Math.sin(p * Math.PI * 0.9) * (6 + p * 10);
      const beat = (p < 0.18 || p > 0.82 ? 1.6 : 0.5) + dt * 2.2;
      body(x, y, ang, 1, bend, beat);
      if (p < 0.15 || p > 0.85) splash(x, 1);
    } else if (dt >= DIVE_T + 0.45 - 0.12 && dt < DIVE_T + 0.45 - 0.12 + SWIM_DUR) {
      // 入水后: 明显的尾鳍上下拍击推进, 渐隐游远
      const p = (dt - (AIR_T - 0.12)) / SWIM_DUR;
      const x = jumpX + 80 * s + p * 200 * s * (1 - p * 0.3);
      const y = seaY + (12 + p * 32) * s;
      body(x, y, 0.2, 0.72 * (1 - p * 0.85), 1.4, dt * 4.2);
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
    drawLighthouse(cw, ch, t, pal, squall);
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
    raf = requestAnimationFrame(draw);
  };

  window.__dbgDol = (dt) => drawDolphin(cw, ch, dt, cw * 0.56, PALETTES.dark);
  window.__dbgWater = (t) => { drawSeaLayer(seaLayers[3], 3, cw, ch, t + vppPhase, PALETTES.dark, 1); };
  window.__vppSquallCheck = (dt) => { squallStart = 1000; draw(1000 + dt * 1000); };
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
