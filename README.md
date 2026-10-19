# Yang An (安洋) — Personal Site

Cyberpunk redesign of [anyang.space](https://anyang.space).

Static HTML/CSS/JS (GitHub Pages). No Jekyll build step.

## Local preview

```bash
npx --yes serve .
# or: python -m http.server 8080
```

## Backup of previous Academic Pages site

- Git branch: `backup/academic-pages-original`
- Folder copy: `../anyang1991.github.io-backup`

## Homepage sailing illustration

The interactive polar uses **8 kn / 28 kn true wind** and 0–180° TWA in 10° steps. Both the readout and the canvas use the same 38 configurations in `assets/js/imoca-sails.js`: port-side profile, bow right; muted blue/teal/steel-grey sail tones suited to the night scene. The main stays aft of the mast and its head lowers when reefed.

The sail configurations and hand-shaped boat-speed curves are **illustrative, not measured or recalculated VPP data**. TWA alone does not determine apparent wind or precise trim. 0–30° is a no-go illustration; 40° is treated as marginal. Light-air examples use J0 at 50–70°, MH0 at 80–110°, and A2 at 120–180°. The conservative 28 kn example uses a reefed main and J3/J2, with A2 stowed. The 170–180° shapes illustrate a possible blanketed/collapsing state. These drawing ranges are not validated sail crossover limits; actual sail inventories, reefing and limits vary by boat, boat speed and sea state. At 0°/180°, the port-tack endpoint retains the preceding starboard-side sail setting. Multiple simultaneous headsails are omitted.

Reference material (consulted 2026-10-19):

- [Vendée Globe: IMOCA sail types and uses](https://www.vendeeglobe.org/en/article/what-sails-are-board-imoca-vendee-globe)
- [IMOCA: whether to carry a spinnaker](https://www.imoca.org/en/news/news/should-we-go-for-a-spinnaker-or-not-paul-meilhat-tells-us-more)
- [IMOCA: sail inventory choices and compromises](https://www.imoca.org/en/news/news/eleven-critical-choices-for-each-team)
- [North Sails: foiling and apparent wind](https://www.northsails.com/blogs/north-sails-blog/foiling-is-the-new-frontier)
- [IMOCA: reefed main and J3 in heavy weather](https://www.imoca.org/en/news/news/the-route-du-rhum-in-the-imoca-class-today-s-analysis-by-marc-guillemot)

### Polar presentation and wake animation

The 8 kn curve occupies the left half and the 28 kn curve the right half, sharing one radial boat-speed scale. Radial monotone cubic interpolation smooths the sampled speeds without overshoot. Broad-reaching speed peaks near 110–120° and decreases toward dead downwind. The profiles are hand-shaped illustrations informed by [IMOCA's performance overview](https://www.imoca.org/en/news/news/the-explosive-increase-in-imoca-performance-the-numbers-tell-a-spectacular-story-of-innovation), not data extracted from that article. Slider, curve snapping, wind buttons and sail readout remain linked. Explanatory captions are kept out of the homepage panel.

The foil is a narrow, tapered side projection with a subdued leading-edge highlight, revised against the [official IMOCA side and top/front drawings](https://www.imoca.org/en/imoca/imoca-rules). Its transverse span is not drawn as a long fore-and-aft hook. The reference images remain external and are not redistributed with the site.

Each of the 38 configurations includes an illustrative heel target: 0° in the no-go states, 2–14° in 8 kn wind and 5–26° in 28 kn wind. The readout selects the target immediately; the hull and rig ease toward it. Longitudinal roll uses an orthographic side projection: x is unchanged and vertical coordinates become y cos(heel) + z sin(heel). The hull beam opens the deck outline, and the two rudders and foil occupy separate transverse positions. Their wake origins follow those positions. Wave-induced pitch is a separate, subdued rotation capped at approximately 1.7°; VPP heel is never applied as a rotation in the image plane. These are visual trim targets, not measured equilibrium heel angles.

Four local disturbance sources (bow, stern, foil and keel) share the boat's position and pitch; their attachment points follow heel while the wake fans stay in the sea plane. Their aft-going wave trains, foam, extent, wavelength and amplitude vary continuously with selected boat speed, fading to zero at rest. Keel disturbance is weaker to represent its depth; this is a 2D visual treatment, not a hydrodynamic solver.

## Project origin and third-party notices

Originally forked from [Academic Pages](https://github.com/academicpages/academicpages.github.io). The current default branch is a redesigned static site; the historical Jekyll version remains on `backup/academic-pages-original`. Original upstream copyright and MIT permission text are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). That notice does not change the licensing of original content or newly authored code.

## Original work and reuse

See [COPYRIGHT.md](COPYRIGHT.md) for the reservation of rights in Yang An's original code and content. Third-party permissions and notices remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Public availability does not grant a general license to reuse the original work.
