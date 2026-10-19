/* Homepage VPP polar — two indicative IMOCA-class curves (15/25 kn wind).
   Selection drives the 2D night-sea scene via window.__VPP_STATE__. */
(() => {
  const TWAS = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const POLAR = {
    15: [4.2, 6.3, 7.8, 8.9, 9.7, 10.4, 11.0, 11.6, 12.3, 13.0, 13.8, 14.2, 14.0, 13.4, 12.6, 11.8],
    25: [5.6, 8.1, 10.0, 11.5, 12.8, 14.0, 15.2, 16.5, 18.0, 19.4, 20.8, 21.8, 22.2, 21.9, 21.0, 20.0],
  };
  const CURVES = [
    { tws: 15, color: "#66cfc4" },
    { tws: 25, color: "#e0a248" },
  ];
  const VMAX = 26, CX = 160, CY = 160, RMAX = 140;

  const heelFor = (twa, tws) =>
    Math.round(Math.max(4, Math.min(28, (tws / 30) * (26 - 14 * ((twa - 30) / 150)))));
  const sailsFor = (twa) => (twa > 115 ? "主帆 + 球帆" : "主帆 + 前帆");

  const state = { tws: 15, twa: 90, bs: 11.0 };

  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const polarXY = (twa, val) => {
    const r = (RMAX * val) / VMAX;
    const th = (twa * Math.PI) / 180;
    return [CX + Math.sin(th) * r, CY - Math.cos(th) * r];
  };

  let markerDot, markerLine;

  function buildPolar() {
    const host = document.getElementById("vpp-polar");
    if (!host) return;
    const svg = el("svg", { viewBox: "0 0 320 320" });

    for (const v of [5, 10, 15, 20, 25]) {
      const r = (RMAX * v) / VMAX;
      svg.appendChild(el("circle", { class: "ring", cx: CX, cy: CY, r: r }));
      const t = el("text", { x: CX + 7, y: CY - r + 13, "text-anchor": "start" });
      t.textContent = v + " kn";
      svg.appendChild(t);
    }
    for (const a of [30, 60, 90, 120, 150]) {
      const [x1, y1] = polarXY(a, VMAX);
      const [x2, y2] = polarXY(-a, VMAX);
      svg.appendChild(el("line", { class: "spoke", x1: CX, y1: CY, x2: x1, y2: y1 }));
      svg.appendChild(el("line", { class: "spoke", x1: CX, y1: CY, x2: x2, y2: y2 }));
      // 角度标注放圆外, 按所在侧对齐
      const lr = RMAX + 13;
      const dirs = [
        [Math.sin((a * Math.PI) / 180), a],
        [-Math.sin((a * Math.PI) / 180), a],
      ];
      dirs.forEach(([sx, aa]) => {
        const lx = CX + sx * lr;
        const ly = CY - Math.cos((aa * Math.PI) / 180) * lr + 4;
        const anchor = sx > 0.3 ? "end" : sx < -0.3 ? "start" : "middle";
        const t = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), "text-anchor": anchor });
        t.textContent = aa + "°";
        svg.appendChild(t);
      });
    }

    CURVES.forEach((cv) => {
      const pts = TWAS.map((twa) => polarXY(twa, POLAR[cv.tws][TWAS.indexOf(twa)]));
      const mir = pts.slice().reverse().map(([x, y]) => [CX - (x - CX), y]);
      const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") +
        "L" + mir.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
      svg.appendChild(el("path", { class: "curve" + (cv.tws === state.tws ? " active" : ""), d, style: "stroke:" + cv.color }));
    });

    markerLine = el("line", { class: "marker-line", x1: CX, y1: CY, x2: CX, y2: CY });
    markerDot = el("circle", { class: "marker-dot", cx: CX, cy: CY, r: 4.5 });
    svg.appendChild(markerLine);
    svg.appendChild(markerDot);

    // 悬停预览点: 移入极坐标图才出现, 吸附到最近的可选点
    const previewDot = el("circle", { class: "pp-preview", cx: -50, cy: -50, r: 6 });
    svg.appendChild(previewDot);

    CURVES.forEach((cv) => {
      TWAS.forEach((twa) => {
        const [x, y] = polarXY(twa, POLAR[cv.tws][TWAS.indexOf(twa)]);
        const c = el("circle", { class: "pp", cx: x, cy: y, r: 17 });
        const t = el("title", {});
        t.textContent = cv.tws + " kn 风 · " + twa + "° · " + POLAR[cv.tws][TWAS.indexOf(twa)].toFixed(1) + " kt";
        c.appendChild(t);
        c.addEventListener("mouseenter", () => {
          previewDot.setAttribute("cx", x);
          previewDot.setAttribute("cy", y);
          previewDot.setAttribute("r", 6.5);
        });
        c.addEventListener("click", () => select(cv.tws, twa));
        svg.appendChild(c);
      });
    });

    svg.addEventListener("mouseleave", () => previewDot.setAttribute("r", 0));

    host.appendChild(svg);
  }

  function apply() {
    const set = (id, v) => { var e = document.getElementById(id); if (e) e.textContent = v; };
    set("ro-twa", state.twa + "°");
    set("ro-tws", state.tws + " KT");
    set("hp-tws", state.tws + " KT");
    set("ro-bs", state.bs.toFixed(1) + " KT");
    set("ro-heel", state.heel + "°");
    set("ro-sails", sailsFor(state.twa));

    if (markerDot) {
      const [x, y] = polarXY(state.twa, state.bs);
      const [ex, ey] = polarXY(state.twa, VMAX);
      markerDot.setAttribute("cx", x);
      markerDot.setAttribute("cy", y);
      markerLine.setAttribute("x2", ex);
      markerLine.setAttribute("y2", ey);
    }
    document.querySelectorAll(".curve").forEach((p) => {
      p.classList.toggle("active", Number(p.dataset.tws) === state.tws);
    });
  }

  function select(tws, twa) {
    state.tws = tws;
    state.twa = twa;
    state.bs = POLAR[tws][TWAS.indexOf(twa)];
    state.heel = heelFor(twa, tws);
    window.__VPP_STATE__ = { tws: tws, twa: twa, bs: state.bs, heel: state.heel };
    apply();
  }

  buildPolar();
  select(15, 90);
})();
