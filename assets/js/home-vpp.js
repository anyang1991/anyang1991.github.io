/* Illustrative IMOCA-class polars, not measured VPP results.
   Sail selection shares the 38 port-tack configurations in imoca-sails.js. */
(() => {
  const host = document.getElementById("vpp-polar");
  if (!host || !window.ImocaSails) return;
  const TWAS = Array.from({length: 19}, (_, i) => i * 10);
  // Zero entries denote the non-sailing / marginal angles shown in this illustration.
  // These hand-shaped curves are visual examples, not a recalculated physical VPP.
  const POLAR = {
    8: [0, 0, 0, 0, 0, 4.6, 5.6, 6.4, 7.1, 7.8, 8.5, 9.2, 9.8, 10.2, 10.4, 10.0, 9.1, 7.0, 5.2],
    28: [0, 0, 0, 0, 0, 10.5, 12.2, 14.4, 16.8, 18.7, 21.0, 23.2, 25.2, 27.0, 28.0, 27.4, 25.8, 22.0, 18.5],
  };
  const CURVES = [{tws: 8, color: "#66cfc4"}, {tws: 28, color: "#e0a248"}];
  const VMAX = 32, CX = 180, CY = 180, RMAX = 150;
  const state = {tws: 8, twa: 90, bs: 7.8};
  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const node = document.createElementNS(SVGNS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const polarXY = (twa, speed) => {
    const r = RMAX * speed / VMAX, angle = twa * Math.PI / 180;
    return [CX + Math.sin(angle) * r, CY - Math.cos(angle) * r];
  };
  const set = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };
  const svg = el("svg", {viewBox: "0 0 360 360", "aria-label": "8节和28节真风速示意极曲线；可点击曲线选择风角", role: "img"});
  const title = el("title", {});
  title.textContent = "IMOCA 60 示意极曲线，船速单位 kn";
  svg.appendChild(title);
  const [nx, ny] = polarXY(40, VMAX), [nx2, ny2] = polarXY(-40, VMAX);
  svg.appendChild(el("path", {class: "no-go", d: `M${CX},${CY} L${nx},${ny} A${RMAX},${RMAX} 0 0 0 ${nx2},${ny2} Z`}));
  for (const speed of [5, 10, 15, 20, 25, 30]) {
    const r = RMAX * speed / VMAX;
    svg.appendChild(el("circle", {class: "ring", cx: CX, cy: CY, r}));
    const label = el("text", {x: CX + 6, y: CY - r + 11});
    label.textContent = speed + " kn";
    svg.appendChild(label);
  }
  for (const angle of [0, 30, 60, 90, 120, 150, 180]) {
    for (const sign of angle === 0 || angle === 180 ? [1] : [-1, 1]) {
      const [x, y] = polarXY(angle * sign, VMAX);
      svg.appendChild(el("line", {class: "spoke", x1: CX, y1: CY, x2: x, y2: y}));
      const [lx, ly] = polarXY(angle * sign, VMAX * 1.12);
      const label = el("text", {x: lx, y: ly + 4, "text-anchor": "middle"});
      label.textContent = angle + "°";
      svg.appendChild(label);
    }
  }
  const coordinates = (points) => points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L");
  for (const curve of CURVES) {
    // Leave the no-go sector open instead of joining the two upwind limits.
    const pts = TWAS.filter((angle) => angle >= 50).map((angle) => polarXY(angle, POLAR[curve.tws][angle / 10]));
    const mirror = pts.slice(0, -1).reverse().map(([x, y]) => [2 * CX - x, y]);
    svg.appendChild(el("path", {class: "curve", "data-tws": curve.tws, d: "M" + coordinates(pts.concat(mirror)), style: "stroke:" + curve.color}));
  }
  const markerLine = el("line", {class: "marker-line", x1: CX, y1: CY, x2: CX, y2: CY});
  const markerDot = el("circle", {class: "marker-dot", cx: CX, cy: CY, r: 4.5});
  const preview = el("circle", {class: "pp-preview", cx: CX, cy: CY, r: 0});
  svg.append(markerLine, markerDot, preview);
  // Nearest-point selection works for both mirrored branches without overlapping hit targets.
  function closest(event) {
    const box = svg.getBoundingClientRect();
    const x = (event.clientX - box.left) * 360 / box.width;
    const y = (event.clientY - box.top) * 360 / box.height;
    let best = null, distance = Infinity;
    for (const curve of CURVES) {
      for (const angle of TWAS.filter((angle) => angle >= 50)) {
        for (const sign of [-1, 1]) {
          const [px, py] = polarXY(angle * sign, POLAR[curve.tws][angle / 10]);
          const d = Math.hypot(x - px, y - py);
          if (d < distance) { distance = d; best = {tws: curve.tws, twa: angle, x: px, y: py}; }
        }
      }
    }
    return distance <= 24 ? best : null;
  }
  svg.addEventListener("pointermove", (event) => {
    const point = closest(event);
    preview.setAttribute("r", point ? 6 : 0);
    if (point) { preview.setAttribute("cx", point.x); preview.setAttribute("cy", point.y); }
  });
  svg.addEventListener("pointerleave", () => preview.setAttribute("r", 0));
  svg.addEventListener("click", (event) => {
    const point = closest(event);
    if (point) select(point.tws, point.twa);
  });
  host.appendChild(svg);
  function select(tws, twa) {
    const sails = window.ImocaSails.getState(tws, twa);
    state.tws = sails.tws;
    state.twa = sails.twa;
    state.bs = POLAR[state.tws][state.twa / 10];
    state.heel = sails.luffing ? 0 : Math.round(Math.max(3, Math.min(28, state.tws / 30 * (26 - 14 * (state.twa - 30) / 150))));
    window.__VPP_STATE__ = {...state, sails};
    set("hp-tws", state.tws + " KT");
    set("ro-twa", state.twa + "°");
    set("ro-bs", state.bs.toFixed(1) + " kn");
    set("ro-sails", sails.description);
    const slider = document.getElementById("vpp-twa");
    slider.value = state.twa;
    slider.setAttribute("aria-valuetext", `${state.twa}度真风角，${sails.description}`);
    document.querySelectorAll(".vpp-tws button").forEach((button) => {
      const active = Number(button.dataset.tws) === state.tws;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    host.querySelectorAll(".curve").forEach((p) => p.classList.toggle("active", Number(p.dataset.tws) === state.tws));
    const [x, y] = polarXY(-state.twa, state.bs), [ex, ey] = polarXY(-state.twa, VMAX);
    markerDot.setAttribute("cx", x); markerDot.setAttribute("cy", y);
    markerLine.setAttribute("x2", ex); markerLine.setAttribute("y2", ey);
    window.dispatchEvent(new CustomEvent("vppchange", {detail: window.__VPP_STATE__}));
  }
  document.querySelectorAll(".vpp-tws button").forEach((button) => button.addEventListener("click", () => select(Number(button.dataset.tws), state.twa)));
  document.getElementById("vpp-twa").addEventListener("input", (event) => select(state.tws, Number(event.target.value)));
  select(8, 90);
})();
