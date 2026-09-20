# Afterlife

**A pollution simulator. Photograph something you're about to throw away, follow where it goes, and see how long it stays there.**

Live demo: https://mr-pythoneer.github.io/afterlife/

---

## The problem

People don't know what happens to their rubbish after they let go of it.

- The moment something goes in the bin, it stops being the person's problem. The consequences (plastic, packaging, fuel, chemicals) are invisible, distant and slow.
- Most people believe more of it gets recycled than actually does. Roughly **9% of all plastic waste ever generated has been recycled** (Geyer, Jambeck & Law 2017), and about **8.7% of US plastic waste was recycled in 2018** (US EPA).
- Even the numbers people are told are unreliable. The familiar "a plastic bottle takes 450 years" posters trace back to unsourced educational posters, and NOAA itself says there is an "absence of reliable data". Awareness campaigns built on made-up numbers are easy to dismiss.

## Our solution

A short, guilt-driven game that makes the invisible visible.

1. **Scan** an item with your camera (or pick it from a list).
2. **See how long it lasts**: a measured range, not a made-up single number.
3. **Choose what you'd do with it**: do the right thing, bin it, or drop it.
4. **Watch its journey play out** as full-screen animated pictures: bin, truck, sorting line, river, sea, fragments, animals.
5. **Face the consequence**: one blunt, sourced statistic about what items like this do.
6. **See your landfill.** Everything you bury piles up in a cross-section of the ground. Fast-forward 500 years: food rots away, plastic breaks into fragments that never leave, and the figure standing on the surface (you) is gone by year 60.
7. **Pick where you live** and watch a year of your town's or city's waste fill a landfill, day by day.

The tone is **blunt but redemptive**: it states the facts coldly, then shows a concrete better action. The aim is to shame gently and change behaviour, not to make people quit.

---

## What's in the app

| Screen | What it does |
|---|---|
| Scan | Camera or file upload. Identified on-device, the photo is never uploaded. |
| Item | Name, estimated persistence range, and what the item does (breaks down / breaks up, not down / just sits there). Shows the popular poster number next to the measured range. |
| Decide | Do the right thing, bin it, or drop it. The journey changes with the choice. |
| Journey | Auto-playing, full-screen animated scenes (about 2 seconds each). Tap to skip. |
| Consequence | A blunt line plus a real, cited statistic (turtles, seabirds, fish, waste-site fires, e-waste children's blood lead, etc.). |
| Your landfill | Ground cross-section with everything you've buried. A slider fast-forwards 0-500 years. Counters: buried, will outlive you, diverted. |
| Where do you live? | 33 countries x four group sizes (you / school / town / city). A 20-second time-lapse of one year of landfill, then a summary (tonnes, Olympic pools, ten years). |
| The details | Collapsed text at the very end: harm, recycling reality, better alternative, methodology. |

30 items are covered (bottle, bag, can, cigarette butt, balloon, battery, electronics, clothing, and more).

---

## How it works (technical)

- **Static site.** Plain HTML + ES modules + Canvas 2D. No build step, no server, no framework. Hosted on GitHub Pages.
- **Item recognition in the browser.** [Transformers.js](https://huggingface.co/docs/transformers.js) runs `onnx-community/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M-ONNX` (about 84 MB, quantized) as a zero-shot image classifier over our own labels. WebGPU where available, WASM otherwise. First scan downloads the model (with a progress bar); it's cached afterwards.
- **Optional Claude mode.** A visitor can paste an Anthropic API key to use Claude vision (`claude-haiku-4-5`) instead. The key lives only in that tab's `sessionStorage` and is sent only to `api.anthropic.com`.
- **Animated scenes.** All illustrations are drawn procedurally on canvas (`js/pics.js`, `js/scene.js`, `js/sim.js`). No image files.

```
index.html          screens
css/style.css       layout and theme (light/dark)
js/app.js           flow, state, wiring
js/data.js          the item database, journeys and consequences
js/places.js        per-country waste data (World Bank)
js/ai.js            on-device CLIP + optional Claude call
js/pics.js          animated journey scenes
js/scene.js         the ground cross-section
js/sim.js           the landfill time-lapse
```

Run locally: serve the folder with any static server (for example `python3 -m http.server`) and open it.

---

## The numbers: how we keep them defensible

Most projects like this repeat folk statistics. We deliberately don't.

- **Persistence is a range, not a number.** Where a real measurement exists we use Chamas et al. 2020 (*ACS Sustainable Chem. Eng.*), which derives half-lives from measured surface degradation rates. Result: HDPE bottles about 58 years in marine conditions up to about 1,200 years for thick items; LDPE bags about 3-5 years. Shape matters more than material.
- **A half-life is not "gone".** It's the point where half the plastic mass has become smaller pieces of the same plastic. So each item is tagged as one of three things: **breaks down** (banana peel), **breaks up, not down** (plastic fragments into microplastics), or **just sits there** (glass, metal).
- **We show the popular number next to the measured one** ("Posters say 450. Nobody measured that.") and explain why it's unreliable.
- **Consequence lines say what items like this do, never "your item did this".** We can't know that. Every statistic names its study.
- **Country waste figures** come from the World Bank *What a Waste* dataset (3.0 edition, with the 2.0 edition where 3.0 was incomplete). Countries with no reliable disposal data were left out on purpose. "Landfilled" includes waste that is never collected, since that is mostly dumped or burned. Volumes and the Olympic-pool comparison are rough estimates, and the pile is drawn on a log scale.

### Claims we researched and deliberately do NOT make

- "You eat a credit card of plastic a week": off by about a million times against the best model (Pletz 2022; Mohamed Nor et al. 2021).
- "More plastic than fish in the ocean by 2050": a 2016 scenario, not a finding.
- "A spoonful of plastic in your brain": contested method, with an erratum on the paper.
- Any single "N years" for glass, aluminium, e-waste or fishing line.
- Pizza boxes ruin recycling because of grease: mostly a myth (AF&PA / WestRock testing; industry-funded).

### Key sources

- Chamas et al. 2020, *Degradation Rates of Plastics in the Environment*: https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635
- NOAA Marine Debris Program, *The Mystery of How Long Until It's Gone*: https://marinedebris.noaa.gov/discover-marine-debris/mystery-how-long-until-it-s-gone
- Geyer, Jambeck & Law 2017, *Production, use, and fate of all plastics ever made*: https://www.science.org/doi/10.1126/sciadv.1700782
- US EPA plastics and containers data: https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data
- World Bank *What a Waste*: https://www.worldbank.org/what-a-waste
- Consequence lines: Wilcox et al. 2018 (turtles); Roman et al. 2019 (seabirds and balloons); Slaughter et al. 2011 (cigarette butts and fish); Auman et al. 1997 (albatross chicks); Environmental Services Association 2023/24 (battery fires); Huo et al. 2007 (e-waste, Guiyu); Hong et al. 2023 (mask fibres); Napper & Thompson 2016 (clothing fibres); Qian et al. 2024 (nanoplastics in bottled water); International Aluminium Institute (recycling energy saving).

### Known limitations

- Persistence figures are estimates, and several materials (polystyrene, polypropylene) have no direct measurement.
- On-device recognition is generic: it knows "plastic bottle", not brands. Users can correct it from the list.
- Country data mixes years (some values are old), and some countries are missing.
- The first scan downloads about 85 MB.
- A few figures are single-source and flagged for re-checking before any formal use: Qian et al. 2024 nanoplastic count; the newest cigarette-butt persistence study.

---

## Business idea (from the team's planning sheet)

Our reading of the planning notes; please correct if wrong:
- **ICP (ideal customer):** schools.
- **Money:** brand-sponsored prompts, e.g. a sponsor's reusable bottle or recycling scheme as the "better option" step.

---

## For the slide (design brief)

**One-line pitch:** *You throw something away and it stops being your problem. It doesn't stop existing. Afterlife shows you where it goes.*

**Slide 1: The problem**
- People don't see the consequences of their trash: packaging, plastic, fuel, chemicals.
- Only about 9% of all plastic waste ever made has been recycled.
- The "how long it lasts" numbers people are shown are mostly made up.

**Slide 2: Our solution**
- A game that makes the invisible visible and gently shames you into changing habits.
- Photograph an item, watch its journey, face the consequence, see your own landfill grow.

**Slide 3: How it works (use screenshots in this order)**
1. Scan an item
2. See how long it lasts (range vs the popular number)
3. Choose: right thing / bin / drop
4. Auto-playing journey (bin, truck, sorting line, river, sea)
5. Consequence ("Bags like this kill turtles.")
6. Your landfill, fast-forwarded 500 years (the figure disappears at year 60)
7. "Where do you live?" landfill time-lapse

**Slide 4: Why it's different**
- Honest numbers: ranges with named sources, and the popular myth shown next to the measurement.
- Runs entirely in the browser. No account, and photos never leave the device.
- Blunt but redemptive: always ends with a better action.

**Slide 5: Impact and business**
- Target: schools (ICP). Revenue: brand-sponsored "better option" prompts.

**Suggested visuals:** the buried-ground cross-section with a gone figure at year 60; the turtle and bag consequence frame; the landfill skyline time-lapse; a big "58 - 1,200 years" number beside a crossed-out "450".

**Tone:** cold, factual, a little brutal, then a way out. Dark earth tones with one alarm red. Avoid stock-photo Earth, purple gradients and emoji.

---

Made at a hackathon. Persistence figures are estimates; ranges are deliberate.
