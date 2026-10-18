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

  // Hero canvas — a sailing passage, day and night watches
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let raf = 0;
  let dpr = 1;

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

  const crestY = (layer, x, t, ch) =>
    ch * layer.y + Math.sin(x / layer.len + t * layer.sp) * layer.amp + Math.sin(x / 47 - t * 0.55) * 1.8;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawSky = (cw, ch, t, pal) => {
    const sky = ctx.createLinearGradient(0, 0, 0, ch * 0.62);
    sky.addColorStop(0, pal.sky[0]);
    sky.addColorStop(0.7, pal.sky[1]);
    sky.addColorStop(1, pal.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch * 0.62);

    if (pal.stars) {
      stars.forEach((s) => {
        const a = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 235, 240, ${a * 0.8})`;
        ctx.fill();
      });
    }

    gusts.forEach((g) => {
      g.x += g.sp / 100;
      if (g.x > 1.2) g.x = -0.2;
      const y = g.y * ch;
      const grad = ctx.createLinearGradient(g.x * cw, y, g.x * cw + g.len, y);
      grad.addColorStop(0, `rgba(${pal.gust}, 0)`);
      grad.addColorStop(0.5, `rgba(${pal.gust}, ${pal.gustA * g.a})`);
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
  };

  const drawOrb = (cw, ch, pal) => {
    const ox = cw * (0.67 + (mx / window.innerWidth - 0.5) * 0.02);
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
    const x = cw * 0.865;
    const base = ch * 0.585;
    const h = 52 * s;

    // rotating light beams first, tower drawn over them
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

    // rock base
    ctx.beginPath();
    ctx.ellipse(x, base + 2, 30 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.lhTower;
    ctx.fill();

    // tapered tower
    ctx.beginPath();
    ctx.moveTo(x - 11 * s, base);
    ctx.lineTo(x - 6.5 * s, base - h * 0.78);
    ctx.lineTo(x + 6.5 * s, base - h * 0.78);
    ctx.lineTo(x + 11 * s, base);
    ctx.closePath();
    ctx.fillStyle = pal.lhTower;
    ctx.fill();

    // gallery + lamp room
    ctx.fillStyle = pal.lhTower;
    ctx.fillRect(x - 8.5 * s, base - h * 0.86, 17 * s, 3.2 * s);
    ctx.fillRect(x - 5 * s, base - h * 0.98, 10 * s, 8 * s);

    // roof
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, base - h * 0.98);
    ctx.lineTo(x, base - h * 1.12);
    ctx.lineTo(x + 6 * s, base - h * 0.98);
    ctx.closePath();
    ctx.fillStyle = pal.lhTrim;
    ctx.fill();

    // the lamp itself
    ctx.beginPath();
    ctx.arc(lampX, lampY, 2.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = pal.lhLamp;
    ctx.shadowColor = `rgba(${pal.beam}, 0.9)`;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawSeaLayer = (layer, idx, cw, ch, t, pal) => {
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 6) {
      ctx.lineTo(x, crestY(layer, x, t, ch));
    }
    ctx.lineTo(cw, ch);
    ctx.closePath();
    ctx.fillStyle = pal.sea[idx];
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x <= cw; x += 6) {
      const y = crestY(layer, x, t, ch);
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

  const drawBoat = (cw, ch, t, pal) => {
    const u = Math.min(cw, ch) / 500;
    const bx = cw * (0.55 + (mx / window.innerWidth - 0.5) * 0.015);
    const layer = seaLayers[1];
    const surf = crestY(layer, bx, t, ch);
    const slope =
      (crestY(layer, bx + 14, t, ch) - crestY(layer, bx - 14, t, ch)) / 28;

    // wake trailing from the stern
    const sternX = bx - 48 * u;
    const sternY = surf + 10 * u;
    ctx.strokeStyle = pal.wake;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 52 * u, sternY + 12 * u);
    ctx.moveTo(sternX, sternY);
    ctx.lineTo(sternX - 56 * u, sternY - 4 * u);
    ctx.moveTo(sternX - 18 * u, sternY + 1 * u);
    ctx.lineTo(sternX - 30 * u, sternY + 4 * u);
    ctx.stroke();

    ctx.save();
    ctx.translate(bx, surf + 1.5);
    ctx.rotate(Math.atan(slope) * 0.65);
    ctx.scale(u, u);

    // hull silhouette
    ctx.beginPath();
    ctx.moveTo(-46, -3);
    ctx.quadraticCurveTo(-20, 11, 6, 12);
    ctx.quadraticCurveTo(32, 11, 48, -4);
    ctx.closePath();
    ctx.fillStyle = pal.hull;
    ctx.fill();

    // mast
    ctx.strokeStyle = pal.mast || pal.hull;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(2, -88);
    ctx.stroke();

    // mainsail, aft of the mast
    ctx.beginPath();
    ctx.moveTo(-1, -84);
    ctx.quadraticCurveTo(-34, -46, -40, -4);
    ctx.lineTo(-1, -4);
    ctx.closePath();
    ctx.fillStyle = pal.sailMain;
    ctx.fill();

    // jib, forward
    ctx.beginPath();
    ctx.moveTo(4, -82);
    ctx.quadraticCurveTo(34, -42, 45, -6);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fillStyle = pal.sailJib;
    ctx.fill();

    // moonlit edges
    ctx.strokeStyle = pal.sailEdge;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, -82);
    ctx.quadraticCurveTo(34, -42, 45, -6);
    ctx.moveTo(2, -88);
    ctx.lineTo(2, -2);
    ctx.stroke();

    // masthead light
    ctx.beginPath();
    ctx.arc(2, -90, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = pal.headlight;
    ctx.shadowColor = pal.headlight;
    ctx.shadowBlur = 8;
    ctx.fill();

    // stern lantern
    ctx.beginPath();
    ctx.arc(-44, -8, 2, 0, Math.PI * 2);
    ctx.fillStyle = pal.lantern;
    ctx.shadowColor = pal.lanternGlow;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // lantern streak on the water
    const ly = surf + 8;
    const lg = ctx.createLinearGradient(sternX, ly, sternX, ly + 34);
    lg.addColorStop(0, pal.lanternGlow.replace(/[\d.]+\)$/, "0.3)"));
    lg.addColorStop(1, pal.lanternGlow.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = lg;
    ctx.fillRect(sternX - 4 * u, ly, 7, 34);
  };

  // foam dabs on the front waves
  const drawFoam = (cw, ch, t, pal) => {
    for (let i = 0; i < 18; i++) {
      const x = (((i * 61.8) % 100) / 100) * cw;
      const layer = seaLayers[i % 2 ? 2 : 3];
      const y = crestY(layer, x, t, ch) - 2;
      const r = 1 + (i % 3) * 0.7;
      const a = 0.14 + 0.1 * Math.sin(t * 2 + i);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = pal.foamDab + " " + (a < 0 ? 0 : a).toFixed(2) + ")";
      ctx.fill();
    }
  };

  const draw = (ts) => {
    const t = ts * 0.001;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const pal = PALETTES.dark;
    ctx.clearRect(0, 0, cw, ch);

    drawSky(cw, ch, t, pal);
    const orb = drawOrb(cw, ch, pal);
    drawCompass(cw, ch, t, pal);
    drawLighthouse(cw, ch, t, pal);
    drawSeaLayer(seaLayers[0], 0, cw, ch, t, pal);
    drawGlitter(cw, ch, t, orb, pal);
    drawSeaLayer(seaLayers[1], 1, cw, ch, t, pal);
    drawBoat(cw, ch, t, pal);
    drawSeaLayer(seaLayers[2], 2, cw, ch, t, pal);
    drawSeaLayer(seaLayers[3], 3, cw, ch, t, pal);
    drawFoam(cw, ch, t, pal);

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
