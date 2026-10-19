/* VPP Lab — interactive IMOCA 60 velocity prediction demo
   Night silhouette scene: procedural low-poly boat, water, lighthouse, dolphin.
   Polar chart: synthetic IMOCA-class data (see page note). */
window.addEventListener("error", (e) => { window.__errLog = (window.__errLog || []).concat(e.message + " @ " + (e.filename||"") + ":" + (e.lineno||0)); });
(() => {
  // ===== polar data (indicative, IMOCA-class) =====
  const TWAS = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const POLAR = {
    10: [3.2, 5.0, 6.2, 7.0, 7.6, 8.0, 8.3, 8.6, 9.0, 9.4, 9.7, 9.6, 9.2, 8.7, 8.0, 7.4],
    15: [4.2, 6.3, 7.8, 8.9, 9.7, 10.4, 11.0, 11.6, 12.3, 13.0, 13.8, 14.2, 14.0, 13.4, 12.6, 11.8],
    20: [5.0, 7.3, 9.0, 10.3, 11.4, 12.3, 13.2, 14.2, 15.3, 16.4, 17.6, 18.3, 18.4, 17.8, 17.0, 16.2],
    25: [5.6, 8.1, 10.0, 11.5, 12.8, 14.0, 15.2, 16.5, 18.0, 19.4, 20.8, 21.8, 22.2, 21.9, 21.0, 20.0],
    30: [6.0, 8.7, 10.8, 12.5, 14.0, 15.4, 16.8, 18.4, 20.2, 21.9, 23.5, 24.6, 25.2, 25.0, 24.2, 23.2],
  };
  const TWS_LIST = [10, 15, 20, 25, 30];
  const VMAX = 26;

  const heelFor = (twa, tws) =>
    Math.round(Math.min(30, (tws / 30) * (18 + 8 * Math.pow(Math.cos((twa * Math.PI) / 180), 2))));
  const sailsFor = (twa) => (twa > 115 ? "主帆 + 球帆 · SPINNAKER" : "主帆 + 前帆");

  const state = { tws: 15, twa: 90, bs: 11.0, heel: 16 };

  // squall easter egg: Konami code, or triple-click the status panel
  let squallStart = -1;
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
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
  let taps = 0, lastTapAt = 0;
  if (statusPanel) statusPanel.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTapAt > 1200) taps = 0;
    lastTapAt = now;
    if (++taps >= 3) { taps = 0; squallStart = performance.now(); }
  });

  // ===== polar chart (SVG) =====
  const CX = 160, CY = 160, RMAX = 140;
  const polarXY = (twa, val) => {
    const r = (RMAX * val) / VMAX;
    const th = (twa * Math.PI) / 180;
    return [CX + Math.sin(th) * r, CY - Math.cos(th) * r];
  };

  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  let markerDot, markerLine;

  function buildPolar() {
    const host = document.getElementById("vpp-polar");
    if (!host) return;
    const svg = el("svg", { viewBox: "0 0 320 320" });

    for (const v of [5, 10, 15, 20, 25]) {
      svg.appendChild(el("circle", { class: "ring", cx: CX, cy: CY, r: (RMAX * v) / VMAX }));
      const t = el("text", { x: CX + 4, y: CY - (RMAX * v) / VMAX + 11 });
      t.textContent = v + " kn";
      svg.appendChild(t);
    }
    for (const a of [30, 60, 90, 120, 150]) {
      const [x1, y1] = polarXY(a, VMAX);
      const [x2, y2] = polarXY(-a, VMAX);
      svg.appendChild(el("line", { class: "spoke", x1: CX, y1: CY, x2: x1, y2: y1 }));
      svg.appendChild(el("line", { class: "spoke", x1: CX, y1: CY, x2: x2, y2: y2 }));
      const t1 = el("text", { x: x1 + 4, y: y1 + 3 });
      const t2 = el("text", { x: x2 + 4, y: y2 + 3 });
      t1.textContent = a + "°";
      t2.textContent = a + "°";
      svg.appendChild(t1);
      svg.appendChild(t2);
    }

    TWS_LIST.forEach((tws, i) => {
      const pts = [];
      TWAS.forEach((twa) => pts.push(polarXY(twa, POLAR[tws][TWAS.indexOf(twa)])));
      const mirrored = pts.slice().reverse().map(([x, y]) => [CX - (x - CX), y]);
      const d =
        "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") +
        "L" + mirrored.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
      svg.appendChild(el("path", { class: "curve" + (tws === state.tws ? " active" : ""), d, "data-tws": tws }));
    });

    markerLine = el("line", { class: "marker-line", x1: CX, y1: CY, x2: CX, y2: CY });
    markerDot = el("circle", { class: "marker-dot", cx: CX, cy: CY, r: 4.5 });
    svg.appendChild(markerLine);
    svg.appendChild(markerDot);

    TWS_LIST.forEach((tws) => {
      TWAS.forEach((twa) => {
        const [x, y] = polarXY(twa, POLAR[tws][TWAS.indexOf(twa)]);
        const c = el("circle", { class: "pp", cx: x, cy: y, r: 9 });
        c.setAttribute("data-tws", tws);
        c.setAttribute("data-twa", twa);
        const t = el("title", {});
        t.textContent = twa + "° · " + tws + " kn 风 · " + POLAR[tws][TWAS.indexOf(twa)].toFixed(1) + " kt";
        c.appendChild(t);
        c.addEventListener("click", () => select(tws, twa));
        svg.appendChild(c);
      });
    });

    host.appendChild(svg);
  }

  function updateMarker() {
    if (!markerDot) return;
    const [x, y] = polarXY(state.twa, state.bs);
    const [ex, ey] = polarXY(state.twa, VMAX);
    markerDot.setAttribute("cx", x);
    markerDot.setAttribute("cy", y);
    markerLine.setAttribute("x2", ex);
    markerLine.setAttribute("y2", ey);
  }

  function updateTwsButtons() {
    document.querySelectorAll("#vpp-tws button").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.tws) === state.tws);
    });
    document.querySelectorAll(".curve").forEach((p) => {
      p.classList.toggle("active", Number(p.dataset.tws) === state.tws);
    });
  }

  // ===== selection =====
  const sceneTargets = { heading: Math.PI, heel: 0, bs: 11, spinnaker: false, mainTrim: -0.45 };

  function select(tws, twa) {
    state.tws = tws;
    state.twa = twa;
    const idx = TWAS.indexOf(twa);
    state.bs = POLAR[tws][idx];
    state.heel = heelFor(twa, tws);

    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set("ro-twa", twa + "°");
    set("ro-tws", tws + " KT");
    set("hp-tws", tws + " KT");
    set("ro-bs", state.bs.toFixed(1) + " KT");
    set("ro-heel", state.heel + "°");
    set("ro-sails", sailsFor(twa));

    updateTwsButtons();
    updateMarker();

    sceneTargets.heading = ((90 + twa) * Math.PI) / 180;
    sceneTargets.heel = (state.heel * Math.PI) / 180;
    sceneTargets.bs = state.bs;
    sceneTargets.spinnaker = twa > 115;
    sceneTargets.mainTrim = twa < 60 ? -0.12 : twa < 115 ? -0.5 : -1.05;
  }

  // ===== three.js scene =====
  const canvas = document.getElementById("hero3d-canvas");
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const bgBase = new THREE.Color(0x050d16);
  const bgDark = new THREE.Color(0x02060c);
  scene.background = bgBase.clone();
  scene.fog = new THREE.Fog(0x050d16, 34, 115);

  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 300);
  camera.position.set(23, 6.2, 30);
  camera.lookAt(-1.5, 3.6, 0);

  scene.add(new THREE.HemisphereLight(0x24405a, 0x04080e, 1.2));
  const moonLight = new THREE.DirectionalLight(0xcfe0ec, 0.95);
  moonLight.position.set(20, 26, 10);
  scene.add(moonLight);
  const rim = new THREE.PointLight(0x6fcfc4, 1.15, 70);
  rim.position.set(0, 5, 19);
  const fill = new THREE.DirectionalLight(0x8fb8c8, 0.3);
  fill.position.set(-8, 10, 22);
  scene.add(fill);
  scene.add(rim);

  // moon + halo
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xdfeef4, fog: false })
  );
  moon.position.set(30, 20, -78);
  scene.add(moon);
  const haloCv = document.createElement("canvas");
  haloCv.width = haloCv.height = 128;
  const hctx = haloCv.getContext("2d");
  const grad = hctx.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, "rgba(222,238,244,0.55)");
  grad.addColorStop(1, "rgba(222,238,244,0)");
  hctx.fillStyle = grad;
  hctx.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(haloCv), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.set(21, 21, 1);
  halo.position.copy(moon.position);
  scene.add(halo);

  // stars
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 380; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.random() * Math.PI * 0.42;
    const r = 120;
    starPos.push(r * Math.sin(ph) * Math.cos(th), 8 + r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th) - 20);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbfd6de, size: 0.6, transparent: true, opacity: 0.75, fog: false })));

  // water
  const waterGeo = new THREE.PlaneGeometry(170, 95, 120, 70);
  const water = new THREE.Mesh(
    waterGeo,
    new THREE.MeshStandardMaterial({ color: 0x0e2a40, roughness: 0.55, metalness: 0.45, flatShading: true })
  );
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const waterBase = waterGeo.attributes.position.array.slice();

  let scroll = 0;

  function animateWater(t, bs, amp) {
    const pos = waterGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = waterBase[i * 3];
      const y = waterBase[i * 3 + 1];
      const wx = x + scroll;
      const hgt = (
        Math.sin(wx * 0.14 + t * 1.1) * 0.34 +
        Math.sin(wx * 0.31 + y * 0.22 + t * 1.6) * 0.2 +
        Math.sin(y * 0.42 - t * 0.9) * 0.16
      ) * amp;
      pos.setZ(i, hgt);
    }
    pos.needsUpdate = true;
  }

  // lighthouse
  const lh = new THREE.Group();
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.4, 1.1, 10), new THREE.MeshStandardMaterial({ color: 0x0a1622, roughness: 0.9, flatShading: true }));
  rock.position.y = 0.2;
  lh.add(rock);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x0d1c2c, roughness: 0.7, flatShading: true });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.5, 7, 10), towerMat);
  tower.position.y = 4.3;
  lh.add(tower);
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.35, 10), towerMat);
  gallery.position.y = 7.9;
  lh.add(gallery);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.3, 10), new THREE.MeshStandardMaterial({ color: 0x3a1519, roughness: 0.6, flatShading: true }));
  roof.position.y = 9.1;
  lh.add(roof);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd98c }));
  lamp.position.y = 8.15;
  lh.add(lamp);
  const beamGroup = new THREE.Group();
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xffe4a8, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (let k = 0; k < 2; k++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 24, 18, 1, true), beamMat);
    cone.rotation.z = (k ? 1 : -1) * Math.PI / 2;
    cone.position.x = (k ? -1 : 1) * 12;
    const holder = new THREE.Group();
    holder.add(cone);
    holder.rotation.y = k * Math.PI;
    beamGroup.add(holder);
  }
  beamGroup.position.y = 8.15;
  lh.add(beamGroup);
  lh.position.set(-26, 0, -17);
  scene.add(lh);

  // ===== boat =====
  const boat = new THREE.Group();
  const heelPivot = new THREE.Group();
  boat.add(heelPivot);
  scene.add(boat);

  const matHull = new THREE.MeshStandardMaterial({ color: 0x0b1826, roughness: 0.55, metalness: 0.3, flatShading: true });
  const matSail = new THREE.MeshStandardMaterial({ color: 0x0e1d2e, roughness: 0.65, metalness: 0.1, side: THREE.DoubleSide, flatShading: true });
  const matSailEdge = new THREE.MeshBasicMaterial({ color: 0x22404f, side: THREE.DoubleSide });

  const hullShape = new THREE.Shape();
  hullShape.moveTo(9.2, 1.35);
  hullShape.lineTo(9.6, 0.15);
  hullShape.quadraticCurveTo(9.0, -0.4, 6.4, -0.55);
  hullShape.quadraticCurveTo(1.0, -0.8, -5.2, -0.35);
  hullShape.lineTo(-7.6, -0.2);
  hullShape.lineTo(-8.4, 0.9);
  hullShape.lineTo(-7.0, 1.15);
  hullShape.quadraticCurveTo(-2.0, 1.5, 3.0, 1.45);
  hullShape.lineTo(9.2, 1.35);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 5.3, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.28, bevelSegments: 2, steps: 1 });
  hullGeo.translate(0, 0, -2.65);
  const hull = new THREE.Mesh(hullGeo, matHull);
  hull.position.y = 0.35;
  heelPivot.add(hull);

  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 1.0), matHull);
  keel.position.set(0.3, -1.55, 0);
  keel.rotation.z = 0.1;
  heelPivot.add(keel);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), matHull);
  bulb.scale.set(1.7, 0.72, 0.9);
  bulb.position.set(0.8, -2.95, 0);
  heelPivot.add(bulb);

  const foilGeo = new THREE.BoxGeometry(0.14, 2.5, 0.26);
  const foil1 = new THREE.Mesh(foilGeo, matHull);
  foil1.position.set(3.4, -0.75, 2.75);
  foil1.rotation.z = -0.32;
  heelPivot.add(foil1);
  const foil2 = foil1.clone();
  foil2.position.z = -2.75;
  heelPivot.add(foil2);
  const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.6, 0.4), matHull);
  rudder.position.set(-7.0, -0.5, 0);
  heelPivot.add(rudder);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 15.5, 10), matHull);
  mast.position.set(1.2, 8.8, 0);
  heelPivot.add(mast);
  const backstay = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.2, 16.5, 0), new THREE.Vector3(-7.8, 1.3, 0)]),
    new THREE.LineBasicMaterial({ color: 0x0b1826 })
  );
  heelPivot.add(backstay);

  // mainsail group pivots at the mast
  const mainGroup = new THREE.Group();
  mainGroup.position.set(1.2, 1.55, 0);
  const msShape = new THREE.Shape();
  msShape.moveTo(0, 0);
  msShape.lineTo(0.35, 13.5);
  msShape.lineTo(4.4, 13.0);
  msShape.quadraticCurveTo(9.6, 8.0, 5.8, 0.5);
  msShape.lineTo(0, 0);
  const mainSail = new THREE.Mesh(new THREE.ShapeGeometry(msShape, 14), matSail);
  mainSail.position.z = 0.12;
  mainGroup.add(mainSail);
  const mainEdge = new THREE.Mesh(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.35, 13.5, 0.12), new THREE.Vector3(4.4, 13.0, 0.12), new THREE.Vector3(5.8, 0.5, 0.12)]),
    new THREE.LineBasicMaterial({ color: 0x2a4a5c })
  );
  mainGroup.add(mainEdge);
  heelPivot.add(mainGroup);

  // jib group pivots near the bow
  const jibGroup = new THREE.Group();
  jibGroup.position.set(7.6, 0.9, 0);
  const jbShape = new THREE.Shape();
  jbShape.moveTo(0, 0);
  jbShape.lineTo(-0.25, 11.8);
  jbShape.lineTo(-4.6, 0.2);
  jbShape.quadraticCurveTo(-2.4, -0.2, 0, 0);
  const jib = new THREE.Mesh(new THREE.ShapeGeometry(jbShape, 10), matSail);
  jibGroup.add(jib);
  heelPivot.add(jibGroup);

  // spinnaker (球帆) — balloon that opens downwind
  const spinnaker = new THREE.Mesh(
    new THREE.SphereGeometry(2.7, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ color: 0x11202f, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide, flatShading: true })
  );
  spinnaker.rotation.x = Math.PI;
  spinnaker.position.set(5.4, 6.2, 0);
  spinnaker.scale.setScalar(0.001);
  spinnaker.visible = false;
  heelPivot.add(spinnaker);

  // masthead light
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe8f2f6 }));
  headlight.position.set(1.2, 16.7, 0);
  heelPivot.add(headlight);

  boat.position.set(0, 0, 0);

  // bow spray particles
  const sprayGeo = new THREE.BufferGeometry();
  const SPRAY_N = 60;
  const sprayArr = new Float32Array(SPRAY_N * 3);
  const sprayLife = new Float32Array(SPRAY_N);
  sprayGeo.setAttribute("position", new THREE.BufferAttribute(sprayArr, 3));
  const spray = new THREE.Points(sprayGeo, new THREE.PointsMaterial({ color: 0x9fc9d4, size: 0.13, transparent: true, opacity: 0.85 }));
  scene.add(spray);
  for (let i = 0; i < SPRAY_N; i++) sprayLife[i] = Math.random() * 1.2;

  // ambient dolphin — leaps near the boat every ~16 s
  const dolShape = new THREE.Shape();
  dolShape.moveTo(1.9, 0);
  dolShape.quadraticCurveTo(1.45, -0.34, 0.9, -0.34);
  dolShape.quadraticCurveTo(0.45, -0.36, 0.18, -0.92);
  dolShape.quadraticCurveTo(0, -0.4, -0.45, -0.36);
  dolShape.quadraticCurveTo(-1.35, -0.3, -1.95, -0.06);
  dolShape.lineTo(-2.4, -0.44);
  dolShape.quadraticCurveTo(-2.14, -0.02, -2.44, 0.34);
  dolShape.quadraticCurveTo(-2.0, 0.22, -1.7, 0.22);
  dolShape.quadraticCurveTo(-0.6, 0.48, 0.45, 0.3);
  dolShape.quadraticCurveTo(1.42, 0.34, 1.9, 0);
  const dolGeo = new THREE.ExtrudeGeometry(dolShape, { depth: 0.28, bevelEnabled: false });
  dolGeo.translate(0, 0, -0.14);
  const dolphin = new THREE.Mesh(dolGeo, new THREE.MeshStandardMaterial({ color: 0x08141f, roughness: 0.6, flatShading: true }));
  dolphin.visible = false;
  scene.add(dolphin);
  let dolClock = 6;

  // wind streaks
  const windGeo = new THREE.BufferGeometry();
  const WN = 26;
  const windArr = new Float32Array(WN * 6);
  const windSeed = [];
  for (let i = 0; i < WN; i++) windSeed.push({ x: Math.random() * 80 - 40, y: 1.5 + Math.random() * 7, z: Math.random() * 50 - 25, sp: 5 + Math.random() * 6 });
  windGeo.setAttribute("position", new THREE.BufferAttribute(windArr, 3));
  const windLines = new THREE.LineSegments(windGeo, new THREE.LineBasicMaterial({ color: 0x8fb8c4, transparent: true, opacity: 0.3 }));
  scene.add(windLines);

  // ===== interaction =====
  const twsHost = document.getElementById("vpp-tws");
  TWS_LIST.forEach((tws) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = tws + " kn";
    b.dataset.tws = tws;
    b.addEventListener("click", () => select(tws, state.twa));
    twsHost.appendChild(b);
  });

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowLeft") select(state.tws, Math.max(30, state.twa - 10));
    else if (e.key === "ArrowRight") select(state.tws, Math.min(180, state.twa + 10));
    else if (e.key === "ArrowUp") {
      const i = TWS_LIST.indexOf(state.tws);
      if (i < TWS_LIST.length - 1) select(TWS_LIST[i + 1], state.twa);
    } else if (e.key === "ArrowDown") {
      const i = TWS_LIST.indexOf(state.tws);
      if (i > 0) select(TWS_LIST[i - 1], state.twa);
    }
  });

  buildPolar();
  select(15, 140);

  // ===== render loop =====
  let heading = sceneTargets.heading;
  let liveWave = 1;
  let heelCur = 0;
  let spScale = 0;
  let mainTrim = sceneTargets.mainTrim;
  let jibScale = 1;
  const clock = new THREE.Clock();

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick() {
    try { tickBody(); window.__f = (window.__f || 0) + 1; } catch (e) { window.__tickErr = String(e); }
  }
  function tickBody() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // live sea state from Open-Meteo (status panel fetch) drives the swell
    const seaState = window.__SEA_STATE__ || {};
    const seaTarget = typeof seaState.h === "number"
      ? Math.max(0.55, Math.min(2.3, 0.5 + seaState.h * 0.6))
      : 1;
    liveWave += (seaTarget - liveWave) * 0.02;
    let squall = 0;
    if (squallStart >= 0) {
      const sdt = (performance.now() - squallStart) / 1000;
      if (sdt < 9) squall = Math.min(1, sdt / 1.2) * Math.min(1, Math.max(0, (9 - sdt) / 1.5));
      else squallStart = -1;
    }
    const waveAmp = liveWave * (1 + squall * 1.6);
    const windBoost = (1 + Math.min(1.2, (typeof seaState.wind === "number" ? seaState.wind : 8) / 30)) * (1 + squall * 0.8);
    scene.background.copy(bgBase).lerp(bgDark, squall * 0.55);

    heading += (sceneTargets.heading - heading) * 0.045;
    boat.rotation.y = heading;
    heelCur += (sceneTargets.heel - heelCur) * 0.04;
    heelPivot.rotation.z = heelCur;
    boat.position.y = Math.sin(t * 0.9) * 0.12;

    // sails
    mainTrim += (sceneTargets.mainTrim - mainTrim) * 0.05;
    mainGroup.rotation.y = mainTrim;
    jibScale += ((sceneTargets.spinnaker ? 0.03 : 1) - jibScale) * 0.07;
    jibGroup.scale.z = Math.max(0.03, jibScale);
    jibGroup.scale.x = Math.max(0.4, jibScale);
    spScale += ((sceneTargets.spinnaker ? 1 : 0) - spScale) * 0.055;
    spinnaker.visible = spScale > 0.02;
    const wob = 1 + Math.sin(t * 2.2) * 0.03 * spScale;
    spinnaker.scale.setScalar(Math.max(0.001, spScale) * wob);
    spinnaker.rotation.y = -mainTrim * 0.6;

    // water scrolls past at boat speed
    scroll += sceneTargets.bs * dt * 1.35;
    animateWater(t, sceneTargets.bs, waveAmp);

    // spray at the bow scales with speed
    const sprayRate = sceneTargets.bs / 26;
    for (let i = 0; i < SPRAY_N; i++) {
      sprayLife[i] -= dt * (0.6 + sprayRate);
      if (sprayLife[i] <= 0) {
        sprayLife[i] = 1.1;
        sprayArr[i * 3] = 9.2 + Math.random() * 1.2;
        sprayArr[i * 3 + 1] = 0.55 + Math.random() * 0.5;
        sprayArr[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
      } else {
        sprayArr[i * 3] -= dt * (4 + sceneTargets.bs * 0.5) * sprayRate;
        sprayArr[i * 3 + 1] += dt * 1.4 * (1 - sprayLife[i]);
      }
    }
    sprayGeo.attributes.position.needsUpdate = true;
    spray.material.opacity = 0.25 + sprayRate * 0.7;
    spray.position.x = boat.position.x;

    // wind streaks
    for (let i = 0; i < WN; i++) {
      const w = windSeed[i];
      w.x += w.sp * dt * (1 + sceneTargets.bs / 22) * windBoost;
      if (w.x > 45) w.x = -45;
      windArr[i * 6] = w.x;
      windArr[i * 6 + 1] = w.y;
      windArr[i * 6 + 2] = w.z;
      windArr[i * 6 + 3] = w.x + 1.4;
      windArr[i * 6 + 4] = w.y + 0.06;
      windArr[i * 6 + 5] = w.z;
    }
    windGeo.attributes.position.needsUpdate = true;

    // lighthouse beam
    beamGroup.rotation.y = t * 0.5;

    // ambient dolphin every ~16 s
    dolClock -= dt;
    if (dolClock <= 0 && !reduced) {
      dolClock = 15 + Math.random() * 6;
    }
    const dolT = 15 - dolClock;
    if (dolT >= 0 && dolT < 2.4 && !reduced) {
      const p = dolT / 2.4;
      const dx = boat.position.x + 9 + p * 8;
      const dz = boat.position.z + 6.5;
      const y = -0.25 + Math.sin(p * Math.PI) * 2.3;
      dolphin.visible = true;
      dolphin.position.set(dx, y, dz);
      dolphin.rotation.z = 0.5 - p * 1.1;
      dolphin.rotation.y = 0;
    } else {
      dolphin.visible = false;
    }

    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
