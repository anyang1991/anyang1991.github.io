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

  // Pointer aurora + soft glow
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

  // Hero canvas
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let raf = 0;
  let dpr = 1;

  const rings = Array.from({ length: 7 }, (_, i) => ({
    r: 36 + i * 48,
    speed: 0.18 + i * 0.05,
    phase: i * 0.7,
  }));

  const rain = Array.from({ length: 140 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.3 + Math.random() * 1.1,
    len: 10 + Math.random() * 26,
  }));

  const sparks = Array.from({ length: 42 }, () => ({
    a: Math.random() * Math.PI * 2,
    r: 40 + Math.random() * 260,
    s: 0.4 + Math.random() * 1.4,
    hue: Math.random() > 0.6 ? "hot" : "cyan",
  }));

  const waves = Array.from({ length: 4 }, (_, i) => ({
    amp: 8 + i * 4,
    len: 140 + i * 40,
    speed: 0.4 + i * 0.15,
    y: 0.72 + i * 0.05,
    a: i * 1.2,
  }));

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawBoat = (cx, cy, t) => {
    const sway = Math.sin(t * 1.2) * 3;
    ctx.save();
    ctx.translate(cx - 10, cy + 8 + sway);
    ctx.strokeStyle = "rgba(232,244,248,0.55)";
    ctx.shadowColor = "rgba(61,255,240,0.45)";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 78);
    ctx.lineTo(0, -110);
    ctx.moveTo(0, -102);
    ctx.quadraticCurveTo(82, -36, 10, 62);
    ctx.moveTo(0, -78);
    ctx.quadraticCurveTo(-64, -18, -8, 56);
    ctx.stroke();
    // neon keel glow
    ctx.strokeStyle = "rgba(255,61,110,0.35)";
    ctx.shadowColor = "rgba(255,61,110,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, 78);
    ctx.stroke();
    ctx.restore();
  };

  const draw = (ts) => {
    const t = ts * 0.001;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    ctx.clearRect(0, 0, cw, ch);

    const cx = cw * (0.62 + (mx / window.innerWidth - 0.5) * 0.04);
    const cy = ch * (0.4 + (my / window.innerHeight - 0.5) * 0.03);

    // Core bloom
    const grd = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(cw, ch) * 0.62);
    grd.addColorStop(0, "rgba(61,255,240,0.2)");
    grd.addColorStop(0.25, "rgba(61,255,240,0.07)");
    grd.addColorStop(0.55, "rgba(255,61,110,0.04)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, cw, ch);

    // Concentric rings + dashes
    rings.forEach((ring, i) => {
      const pulse = 1 + Math.sin(t * ring.speed + ring.phase) * 0.035;
      const r = ring.r * pulse * (ch / 700 + 0.75);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(61,255,240,${0.32 - i * 0.03})`;
      ctx.lineWidth = i === 0 ? 1.6 : 1;
      ctx.setLineDash(i % 2 ? [6, 10] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Sweep
    const sweep = ((t * 0.42) % 1) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, Math.min(cw, ch) * 0.42, sweep, sweep + 0.55);
    ctx.closePath();
    const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(cw, ch) * 0.42);
    sweepGrad.addColorStop(0, "rgba(255,61,110,0.28)");
    sweepGrad.addColorStop(0.55, "rgba(61,255,240,0.08)");
    sweepGrad.addColorStop(1, "rgba(255,61,110,0)");
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Orbiting sparks
    sparks.forEach((s) => {
      s.a += 0.004 * s.s;
      const x = cx + Math.cos(s.a + t * 0.2) * s.r;
      const y = cy + Math.sin(s.a + t * 0.2) * s.r * 0.72;
      ctx.beginPath();
      ctx.arc(x, y, s.s, 0, Math.PI * 2);
      ctx.fillStyle = s.hue === "hot" ? "rgba(255,61,110,0.85)" : "rgba(61,255,240,0.9)";
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    drawBoat(cx, cy, t);

    // Neon sea waves
    waves.forEach((w, idx) => {
      ctx.beginPath();
      const baseY = ch * w.y;
      for (let x = 0; x <= cw; x += 8) {
        const y =
          baseY +
          Math.sin(x / w.len + t * w.speed + w.a) * w.amp +
          Math.sin(x / 55 + t * 1.4) * (2 + idx);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = idx % 2 ? `rgba(255,61,110,${0.18 - idx * 0.02})` : `rgba(61,255,240,${0.28 - idx * 0.04})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Digital rain
    rain.forEach((d) => {
      d.y += 0.0055 * d.z;
      if (d.y > 1.1) {
        d.y = -0.05;
        d.x = Math.random();
      }
      const x = d.x * cw;
      const y = d.y * ch;
      const g = ctx.createLinearGradient(x, y, x, y + d.len);
      g.addColorStop(0, "rgba(61,255,240,0)");
      g.addColorStop(1, `rgba(61,255,240,${0.18 + d.z * 0.4})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = d.z;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + d.len);
      ctx.stroke();
    });

    // Occasional glitch flash
    if (Math.sin(t * 7.3) > 0.992) {
      ctx.fillStyle = "rgba(255,61,110,0.05)";
      ctx.fillRect(0, Math.random() * ch, cw, 12 + Math.random() * 40);
    }

    // Crosshair
    ctx.strokeStyle = "rgba(240,160,48,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy);
    ctx.lineTo(cx - 5, cy);
    ctx.moveTo(cx + 5, cy);
    ctx.lineTo(cx + 16, cy);
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy - 5);
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx, cy + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(240,160,48,0.28)";
    ctx.stroke();

    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(draw);
  });
})();
