/* Boat-local wake animation for the side-on night scene.
   Wavelength/amplitude/extent are visually scaled; this is not a fluid solver. */
(() => {
  const sources = Object.freeze([
    {name: "bow", x: 84, y: 1, weight: 0.9, reach: 1, spread: 0.92},
    {name: "stern", x: -49, y: 7, z: 18, weight: 1, reach: 1.18, spread: 1.08},
    {name: "foil", x: 39.3, y: -4.3, z: 19.25, weight: 0.76, reach: 0.84, spread: 0.64},
    {name: "keel", x: 1, y: 22, weight: 0.34, reach: 0.75, spread: 0.48},
  ]);
  function parameters(boatSpeed) {
    const speed = Math.max(0, Number(boatSpeed) || 0);
    const ratio = Math.min(1.2, speed / 30);
    const strength = Math.min(1, speed / 8) * (0.2 + 0.8 * ratio);
    return {
      speed, ratio, strength,
      length: speed > 0 ? 28 + speed * 4.6 : 0,
      spacing: 6 + Math.min(42, speed * speed * 0.032),
      amplitude: strength * (0.3 + 1.8 * ratio),
      phaseSpeed: speed * 0.065,
    };
  }
  function draw(ctx, boatSpeed, time, foreground = false, projection = {verticalScale: 1}) {
    const p = parameters(boatSpeed);
    if (p.strength < 0.001) return;
    ctx.save();
    ctx.lineCap = "round";
    for (let index = 0; index < sources.length; index++) {
      // Roll moves the attachment point; the water itself stays in the sea plane.
      const source = {...sources[index], y: sources[index].y * projection.verticalScale + (sources[index].z || 0) * (projection.sinHeel || 0)};
      const length = p.length * source.reach;
      const alpha = p.strength * source.weight;
      const phase = (time * p.phaseSpeed + index * 0.27) % 1;
      if (!foreground) {
        const gradient = ctx.createLinearGradient(source.x, 0, source.x - length, 0);
        gradient.addColorStop(0, `rgba(158, 190, 204, ${alpha * 0.38})`);
        gradient.addColorStop(0.45, `rgba(121, 159, 178, ${alpha * 0.17})`);
        gradient.addColorStop(1, "rgba(121, 159, 178, 0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.55 + p.ratio * 0.45;
        // Aft-opening divergent wave branches in the same frame as the hull.
        for (const branch of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          for (let segment = 1; segment <= 32; segment++) {
            const fraction = segment / 32, distance = length * fraction;
            const spread = distance * 0.105 * source.spread;
            const wave = Math.sin(distance / p.spacing * Math.PI * 2 - time * p.phaseSpeed * Math.PI * 2) * p.amplitude;
            ctx.lineTo(source.x - distance, source.y + branch * spread + wave * Math.sin(fraction * Math.PI));
          }
          ctx.stroke();
        }
        // Transverse crests advect aft; their spacing grows with selected speed.
        for (let crest = 0; crest < Math.ceil(length / p.spacing); crest++) {
          const distance = (crest + phase) * p.spacing;
          if (distance < 3 || distance >= length) continue;
          const fraction = distance / length;
          const spread = 1.5 + distance * 0.105 * source.spread;
          const x = source.x - distance;
          ctx.strokeStyle = `rgba(160, 191, 205, ${alpha * 0.28 * Math.pow(1 - fraction, 1.5)})`;
          ctx.lineWidth = 0.6 + p.ratio * 0.3;
          ctx.beginPath();
          ctx.moveTo(x + 2, source.y - spread);
          ctx.quadraticCurveTo(x - 2 - p.amplitude, source.y, x + 2, source.y + spread);
          ctx.stroke();
        }
      } else {
        // Near-field foam remains attached to its own component, never the screen.
        const count = source.name === "keel" ? 3 : 5;
        for (let trail = 0; trail < count; trail++) {
          const age = (time * (0.25 + p.phaseSpeed) + trail / count + index * 0.19) % 1;
          const distance = age * length * 0.58;
          const x = source.x - distance;
          const y = source.y + Math.sin(trail * 2.7 + age * 4) * (1 + age * 5) * source.spread;
          const fade = alpha * Math.pow(1 - age, 2);
          ctx.strokeStyle = `rgba(181, 207, 217, ${fade * 0.44})`;
          ctx.lineWidth = 0.65 + p.ratio * 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - (1.4 + p.speed * 0.18) * (1 - age), y + p.amplitude * 0.35);
          ctx.stroke();
        }
        if ((source.name === "bow" || source.name === "foil") && p.speed > 12) {
          const spray = Math.min(1, (p.speed - 12) / 18);
          for (let drop = 0; drop < 7; drop++) {
            const age = (time * (1.1 + p.ratio) + drop / 7) % 1;
            const x = source.x - age * (8 + 10 * spray);
            const y = source.y - Math.sin(age * Math.PI) * (2 + 6 * spray);
            ctx.fillStyle = `rgba(186, 211, 221, ${spray * source.weight * (1 - age) * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(x, y, 0.55 + spray * 0.3, 0.35, -0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    ctx.restore();
  }
  window.ImocaWater = Object.freeze({sources, parameters, draw});
})();
