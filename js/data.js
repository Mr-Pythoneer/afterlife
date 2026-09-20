/* Afterlife — trash database.
 *
 * ---------------------------------------------------------------------------
 * A NOTE ON THE NUMBERS, because this is the part most of these projects get
 * wrong.
 *
 * The familiar decomposition timelines — "a plastic bottle takes 450 years" —
 * are folk statistics. The educational posters they come from attribute them
 * to an unnamed USDA Forest Service study that cannot be located, and they
 * cite each other in a circle. NOAA, the body most often credited, states on
 * its own site that there is an "absence of reliable data" and only a handful
 * of peer-reviewed studies on the question.
 *
 * The real measurement is Chamas et al. (2020), "Degradation Rates of Plastics
 * in the Environment", ACS Sustainable Chemistry & Engineering, which
 * harmonises observed specific surface degradation rates into half-lives.
 * Those come out as wide RANGES, because shape dominates: the same 2.75 g of
 * plastic can take under 2 years as thin film or over 1,400 years as a bead.
 *
 * So every item here carries:
 *   persist  — a defensible range, from measurement where it exists
 *   claimed  — the number the posters give, shown so we can say where it fails
 *   mode     — what actually happens to it, which is not the same for everything
 *
 * And `mode` matters more than the number:
 *   biodegrades — genuinely returns to soil and gas
 *   fragments   — breaks into smaller plastic forever; never actually leaves
 *   inert       — does not break down and does not poison; simply persists
 *
 * A banana peel and a glass bottle do not belong on the same axis, and half
 * the impact of this app is refusing to pretend they do.
 * ---------------------------------------------------------------------------
 */

export const FATES = {
  PLASTIC: 'plastic', METAL: 'metal', GLASS: 'glass',
  ORGANIC: 'organic', PAPER: 'paper', TOXIC: 'toxic', TEXTILE: 'textile',
};

export const MODES = {
  BIODEGRADES: 'biodegrades',
  FRAGMENTS: 'fragments',
  INERT: 'inert',
};

export const MODE_COPY = {
  [MODES.BIODEGRADES]: {
    label: 'Breaks down',
    blurb: 'Returns to soil and gas. Actually leaves.',
  },
  [MODES.FRAGMENTS]: {
    label: 'Breaks up — not down',
    blurb: 'Shatters into smaller and smaller plastic. The mass never leaves; it just stops being visible.',
  },
  [MODES.INERT]: {
    label: 'Just sits there',
    blurb: 'Does not rot, does not poison. Persists indefinitely without doing much harm.',
  },
};

export const METHODOLOGY = {
  headline: 'Most trash timelines are made up. These are not — and where they are uncertain, we say so.',
  body: [
    'The numbers on the familiar "how long does it take to decompose" posters have no traceable study behind them. They are attributed to an unnamed USDA Forest Service paper that cannot be found in the Forest Service research database, and the charts cite one another in a loop.',
    'NOAA, usually credited as the source, says plainly on its own site that there is an "absence of reliable data, and only a few peer-reviewed studies exploring these topics".',
    'Where a real measurement exists we use Chamas et al. (2020), which derives half-lives from observed surface degradation rates. It produces ranges, not single numbers, because the shape of an object matters more than what it is made of — thin film degrades in a couple of years, a thick bead of the same plastic takes over a thousand.',
    'A half-life here means the loss of the first half of the polymer mass. It does not mean the object is gone. It means it has become smaller pieces of the same plastic.',
  ],
  cite: {
    name: 'Chamas et al. 2020, ACS Sustainable Chem. Eng.',
    url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635',
  },
};

const JOURNEYS = {
  [FATES.PLASTIC]: [
    { t: 'right now', title: 'You let go', text: 'It leaves your hand. For you the object is finished. This is the last moment you will think about it.' },
    { t: 'day 1', title: 'The bin', text: 'It sits with everything else. Food residue from the other rubbish soaks into it, and that will matter later.' },
    { t: 'day 4', title: 'The truck', text: 'Compacted under roughly ten tonnes of everything else from your street.' },
    { t: 'day 6', title: 'The sorting line', branch: true, text: 'An optical scanner and a human get about half a second each to decide what this is. Wet, crushed, black-coloured or wrapped in a label the scanner cannot read, and it goes to landfill regardless of the arrows printed on the bottom.' },
    { t: 'month 2', title: 'Sold by the tonne', text: 'If it survived sorting it is baled and sold. A large share of collected plastic is exported to countries with cheaper labour and looser rules about what happens to the part nobody wants.' },
    { t: 'year 1', title: 'Out in the open', text: 'Landfill, open dump, or blown off the back of a lorry. Wind and rain move it. It begins travelling without you.' },
    { t: 'year 3', title: 'Water', text: 'Drain, river, estuary, sea. Most plastic floats, so it goes wherever water goes — which is everywhere.' },
    { t: 'the half-life', title: 'It breaks up, not down', text: 'Sunlight makes it brittle and it shatters. Half its mass is now fragments. This is the moment the poster calls "decomposed". Nothing has decomposed. There is simply more of it, in smaller pieces, spread wider.' },
    { t: 'after that', title: 'Small enough to eat', text: 'Fragments reach the size of fish eggs, and are eaten by the things that eat fish eggs, then by everything above them. Microplastics have been found in human blood, lungs and placentas.' },
    { t: 'the far end', title: 'Still here, just invisible', text: 'The polymer does not mineralise on any timescale that means anything to you. It stops being visible. That is all that happens.' },
  ],
  [FATES.METAL]: [
    { t: 'right now', title: 'You let go', text: 'It leaves your hand — and this one is genuinely worth money.' },
    { t: 'day 1', title: 'The bin', text: 'Which bin you picked decides almost everything that follows.' },
    { t: 'day 6', title: 'The sorting line', branch: true, text: 'Metal is the one material the system is actually good at. Magnets take the steel, eddy currents fling the aluminium out. If it reached the line at all, it will probably be caught.' },
    { t: 'month 1', title: 'The furnace', text: 'Melted down. Recycling aluminium takes around a twentieth of the energy of smelting it from bauxite ore. This is the rare case where recycling is dramatically better rather than marginally better.' },
    { t: 'month 3', title: 'Back on a shelf', text: 'It can be a new can in about six weeks, and it can repeat that loop indefinitely without degrading.' },
    { t: 'the other road', title: 'Or: none of that', branch: true, text: 'Put in the wrong bin it is buried instead. It will corrode eventually, slowly, harmlessly — and in the meantime it is a valuable resource sitting uselessly in a hole.' },
  ],
  [FATES.GLASS]: [
    { t: 'right now', title: 'You let go', text: 'Sand, soda ash and limestone, melted together — and endlessly re-meltable.' },
    { t: 'day 6', title: 'The sorting line', branch: true, text: 'Glass is heavy and it breaks. Shattered glass contaminates the paper and plastic streams, so some facilities would honestly rather not receive it.' },
    { t: 'month 2', title: 'Re-melted, or crushed for roadfill', text: 'Clean, colour-sorted glass becomes new glass forever. Mixed broken glass becomes road aggregate — still useful, but a one-way trip downwards.' },
    { t: 'the other road', title: 'Or: buried', text: 'Chemically, glass is close to a rock. Buried, it simply waits. It poisons nothing. It also goes nowhere.' },
    { t: 'the far end', title: 'Geological', text: 'Archaeologists dig up Roman glass two thousand years old that is still, recognisably, glass.' },
  ],
  [FATES.ORGANIC]: [
    { t: 'right now', title: 'You let go', text: 'This one can genuinely disappear. Whether it does depends entirely on where you put it.' },
    { t: 'week 2', title: 'In open air or a compost heap', text: 'Microbes, oxygen, warmth. It breaks down into soil and carbon dioxide. This is the system working exactly as it should.' },
    { t: 'the other road', title: 'Or: sealed in landfill', branch: true, text: 'Buried under compacted rubbish there is no oxygen, so it cannot rot properly. It ferments instead, producing methane — a greenhouse gas far more potent than CO2 over the short term. Food waste in a sealed landfill is a climate problem, not a compost problem.' },
    { t: 'years later', title: 'Legible', text: 'Landfill excavations routinely turn up decades-old newspapers still readable and food still recognisable. Airtight burial preserves things rather than destroying them.' },
  ],
  [FATES.PAPER]: [
    { t: 'right now', title: 'You let go', text: 'Wood fibre. Recyclable — but only a finite number of times.' },
    { t: 'day 6', title: 'The sorting line', branch: true, text: 'Wet and food-soiled paper is what mills reject. Fibre with too much food or oil on it can downgrade the bale around it — though a little grease matters less than people think.' },
    { t: 'month 1', title: 'Pulped', text: 'Mixed back into slurry and re-formed. Every cycle shortens the fibres, so paper goes round perhaps five to seven times before the fibres are too short to hold together.' },
    { t: 'eventually', title: 'The end of the line', text: 'It finishes as low-grade board, and then as nothing. Of the everyday materials, this is one of the few with a genuinely decent ending.' },
  ],
  [FATES.TOXIC]: [
    { t: 'right now', title: 'You let go', text: 'This is not simply litter. It is a container for things that should never enter soil or water.' },
    { t: 'day 1', title: 'The wrong bin', branch: true, text: 'In household waste it is unsorted and unsafe. Crushed in a lorry, damaged lithium cells ignite — waste-facility fires traced to binned batteries are a routine and well-documented problem.' },
    { t: 'year 1', title: 'Leaching', text: 'Buried and corroding, heavy metals move into landfill leachate. Modern landfills are lined to catch it. Liners are not permanent, and older sites do not have them at all.' },
    { t: 'decades', title: 'Downstream', text: 'Heavy metals do not break down into anything harmless — there is no smaller, safer version of lead. They accumulate in sediment, in fish, and upwards through everything that eats them.' },
    { t: 'the better road', title: 'What should have happened', text: 'Take-back points exist for rechargeable and lithium cells. Alkaline rules vary by region, so check yours.' },
  ],
  [FATES.TEXTILE]: [
    { t: 'right now', title: 'You let go', text: 'Most donated clothing is not worn again by someone down the road.' },
    { t: 'month 1', title: 'Sorted and shipped', branch: true, text: 'Wearable items are baled and exported. A significant share arrives unsellable and is dumped at the destination, so the receiving country inherits the disposal problem along with the gift.' },
    { t: 'year 1', title: 'Every single wash', text: 'If it is polyester, nylon or acrylic then it is plastic thread. Every wash sheds microfibres straight through treatment plants into water. It pollutes for the whole time you own it, not only after you throw it away.' },
    { t: 'the far end', title: 'Buried whole', text: 'Blended fabrics cannot be economically separated back into fibres, so almost no clothing becomes new clothing. It goes into the ground as cloth.' },
  ],
};

/* persist: measured or best-defensible range in years. Infinity = no meaningful end.
 * claimed: the figure the popular posters give, where one exists.
 * labels:  natural-language prompts for the zero-shot image classifier.
 */
export const ITEMS = [
  {
    id: 'pet-bottle', name: 'Plastic bottle', material: 'PET plastic',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 58, high: 1200 }, claimed: 450,
    note: 'Half-life for the first 50% of polymer mass, from measured degradation rates. The spread is real: wall thickness changes the answer by more than an order of magnitude.',
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic water bottle', 'a clear plastic drinks bottle', 'an empty plastic soda bottle'],
    harm: 'Around a million are bought every minute worldwide. The cap is a different polymer from the bottle, which is why caps in particular keep turning up inside dead seabirds.',
    better: 'A refillable bottle pays for itself in about a fortnight. This is the easiest swap on the entire list.',
    recycle: 'One of the few plastics genuinely worth recycling — if it is empty, dry, and the cap is screwed back on.',
  },
  {
    id: 'plastic-bag', name: 'Plastic bag', material: 'Polyethylene film',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 3, high: 250 }, claimed: 20,
    note: 'Marine conditions at the low end, buried in soil at the high end. Thin film fragments fast — which is worse, not better, because it becomes microplastic sooner.',
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic shopping bag', 'a crumpled plastic carrier bag', 'a thin plastic bag'],
    harm: 'In water it looks almost exactly like a jellyfish. Turtles eat them, cannot pass them, and starve with a full stomach.',
    better: 'Bags jam the spinning sorting machinery, so they are banned from most kerbside bins. Supermarket film collection points are the only real route.',
    recycle: 'Almost never, from a household bin. It tangles the machines.',
  },
  {
    id: 'aluminium-can', name: 'Aluminium can', material: 'Aluminium',
    fate: FATES.METAL, mode: MODES.INERT,
    persist: { low: 80, high: 200 }, claimed: 200,
    note: 'Corrosion estimate for a buried can. Recycled instead, it is back on a shelf within weeks — which is the only number that should matter here.',
    source: { name: 'Corrosion estimates; widely repeated, weakly sourced', url: '' },
    labels: ['an aluminium drink can', 'an empty soda can', 'a crushed beverage can'],
    harm: 'Smelting new aluminium from ore is enormously energy-hungry. Burying a can throws all of that embodied energy away permanently.',
    better: 'Rinse it and put it in the recycling. This is the one where you get an unambiguous, uncomplicated win.',
    recycle: 'Infinitely recyclable with no loss of quality. The best-case material in everyday rubbish.',
  },
  {
    id: 'glass-bottle', name: 'Glass bottle', material: 'Soda-lime glass',
    fate: FATES.GLASS, mode: MODES.INERT,
    persist: { low: Infinity, high: Infinity }, claimed: 1000000,
    note: 'The "one million years" figure is a polite way of writing "indefinitely". Glass does not biodegrade in any meaningful sense — but it also does not poison anything.',
    source: { name: 'Materials chemistry; no decomposition study exists', url: '' },
    labels: ['a glass bottle', 'an empty beer bottle', 'a glass jar'],
    harm: 'Inert and non-toxic — genuinely one of the least harmful things here. Its real cost is weight: hauling it around burns fuel.',
    better: 'Recycle it, and keep the colours separate if your system asks. Mixed glass becomes road aggregate rather than new bottles.',
    recycle: 'Endlessly recyclable, but heavy, and easily contaminated once broken.',
  },
  {
    id: 'coffee-cup', name: 'Disposable coffee cup', material: 'Paper with a polyethylene lining',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 20, high: 250 }, claimed: 30,
    note: 'The paper goes quickly. The plastic film welded to the inside behaves like any other polyethylene film.',
    source: { name: 'Chamas et al. 2020 (film rates)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a disposable coffee cup', 'a paper takeaway cup', 'a takeaway coffee cup with a lid'],
    harm: 'It looks like paper and gets filed as paper, which is exactly why so many are thrown into paper recycling — where they contaminate the bale around them.',
    better: 'Most chains discount a refill in your own cup. Over a year that is real money, not a gesture.',
    recycle: 'Needs a specialist plant that can peel plastic from fibre. Very few exist, so the great majority are burned or buried.',
  },
  {
    id: 'straw', name: 'Plastic straw', material: 'Polypropylene',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 10, high: 500 }, claimed: 200,
    note: 'Thin-walled polypropylene. No direct measurement for straws specifically; range extrapolated from PP rates.',
    source: { name: 'Chamas et al. 2020 (PP rates)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic drinking straw', 'a striped plastic straw', 'a bendy straw'],
    harm: 'Too light and thin to be sorted mechanically — it falls straight through every screen in the facility.',
    better: 'The honest note: straws are a tiny fraction of ocean plastic by weight. They became the symbol because they are easy to give up, and giving one up is not the same as solving anything.',
    recycle: 'Effectively never. Too small to sort.',
  },
  {
    id: 'cigarette-butt', name: 'Cigarette butt', material: 'Cellulose acetate — a plastic',
    fate: FATES.TOXIC, mode: MODES.FRAGMENTS,
    persist: { low: 1.5, high: 15 }, claimed: 10,
    note: 'Cellulose acetate degrades faster than most plastics but still fragments rather than vanishing. The toxicity arrives immediately, long before the filter does anything.',
    source: { name: 'Cellulose acetate degradation literature', url: '' },
    labels: ['a cigarette butt', 'a discarded cigarette end', 'a used cigarette filter on the ground'],
    harm: 'The single most collected item in worldwide beach cleanups, year after year. The filter is not cotton — it is plastic, and it arrives pre-loaded with the nicotine, arsenic and heavy metals it just finished filtering.',
    better: 'A pocket ashtray costs almost nothing. Flicking one into a drain is a direct pipe to the river.',
    recycle: 'No route at all. This one is pure loss.',
  },
  {
    id: 'crisp-packet', name: 'Crisp / chip packet', material: 'Metallised plastic film, multi-layer',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 30, high: 250 }, claimed: 80,
    note: 'People routinely find legible packets from the 1970s and 80s on beaches — which is closer to hard evidence than most figures on this list get.',
    source: { name: 'Beach cleanup records; Chamas et al. 2020 for film rates', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['an empty crisp packet', 'a foil chip bag', 'a shiny snack food wrapper'],
    harm: 'Several different materials fused into one sheet. Nothing can economically pull them apart, making it one of the least recyclable objects in an ordinary shop.',
    better: 'Some brands run postal take-back schemes. Otherwise the only lever is buying fewer single-serve packets.',
    recycle: 'No. Multi-layer laminates are a design decision that made recycling impossible.',
  },
  {
    id: 'styrofoam', name: 'Polystyrene container', material: 'Expanded polystyrene',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 50, high: Infinity }, claimed: 500,
    note: 'Among the slowest-degrading common plastics. The usual "500 years" is a placeholder for "nobody has watched one finish".',
    source: { name: 'Chamas et al. 2020 (PS rates)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a styrofoam takeaway container', 'a white polystyrene food box', 'a styrofoam cup'],
    harm: 'Roughly 95% air, so a lorry-load is mostly nothing and it is uneconomic to collect. It crumbles into small white beads that birds and fish reliably mistake for food.',
    better: 'Refuse it at the counter where you can. Several cities have banned it outright for exactly these reasons.',
    recycle: 'Technically possible, almost never done. Not worth the haulage.',
  },
  {
    id: 'plastic-cutlery', name: 'Plastic cutlery', material: 'Polystyrene or polypropylene',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 50, high: 1000 }, claimed: 200,
    note: 'Thick, rigid mouldings sit at the slow end of the range — the same plastic as a straw, but far more of it per millimetre of surface.',
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic fork', 'a plastic spoon', 'disposable plastic cutlery'],
    harm: 'Rigid, sharp once broken, and squarely in the size range that seabirds and turtles swallow whole.',
    better: 'A fork from your kitchen drawer kept in your bag. Mildly annoying, completely effective.',
    recycle: 'Wrong shape and usually food-soiled. Sorted out and landfilled.',
  },
  {
    id: 'takeaway-box', name: 'Plastic takeaway container', material: 'Polypropylene',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 30, high: 500 }, claimed: 30,
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic takeaway food container', 'a clear plastic food box', 'a plastic tub with a lid'],
    harm: 'Usually recyclable in principle and usually landfilled in practice, because it arrives with curry in it.',
    better: 'Rinse it. Thirty seconds under a tap is the whole difference between recycled and buried.',
    recycle: 'Yes — if clean. Food residue is the single biggest reason recyclable plastic gets rejected.',
  },
  {
    id: 'tin-can', name: 'Steel food can', material: 'Tin-plated steel',
    fate: FATES.METAL, mode: MODES.INERT,
    persist: { low: 50, high: 100 }, claimed: 50,
    note: 'Corrodes rather than degrades, and leaves iron oxide behind — which is what soil is already full of.',
    source: { name: 'Corrosion estimates', url: '' },
    labels: ['a tin can', 'an empty food can', 'a steel soup can'],
    harm: 'Relatively little. Steel is magnetic, which makes it the single easiest thing in the entire waste stream to pull back out.',
    better: 'Rinse and recycle. Leave the paper label on — it burns off in the furnace.',
    recycle: 'Reliably recycled. The magnet does not miss.',
  },
  {
    id: 'carton', name: 'Drinks carton', material: 'Paper, plastic and aluminium laminate',
    fate: FATES.PAPER, mode: MODES.FRAGMENTS,
    persist: { low: 5, high: 250 }, claimed: 5,
    note: 'The board pulps away in years. The polyethylene layer bonded to it does not.',
    source: { name: 'Chamas et al. 2020 (film rates)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a milk carton', 'a juice carton', 'a tetra pak drinks carton'],
    harm: 'Six bonded layers. Separating them needs a specialist plant, and most regions have none within economic reach.',
    better: 'Check whether your council actually takes cartons — many do not, whatever the symbol on the side implies.',
    recycle: 'Only where a dedicated facility exists.',
  },
  {
    id: 'face-mask', name: 'Disposable face mask', material: 'Polypropylene fabric',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 5, high: 450 }, claimed: 450,
    note: 'Melt-blown fibre is extremely fine, so it fragments quickly into microfibres — the "450 years" framing gets the persistence right and the mechanism wrong.',
    source: { name: 'Chamas et al. 2020 (PP fibre rates)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a disposable face mask', 'a discarded surgical mask', 'a blue medical face mask on the ground'],
    harm: 'An estimated 129 billion masks were used worldwide every month during the pandemic (Prata et al. 2020). The ear loops tangle small animals and birds.',
    better: 'A washable mask where the setting allows it. Cut the loops before binning a disposable one.',
    recycle: 'No route. It is plastic fabric.',
  },
  {
    id: 'battery', name: 'Battery', material: 'Metals, acids, lithium',
    fate: FATES.TOXIC, mode: MODES.INERT,
    persist: { low: 100, high: Infinity }, claimed: 100,
    note: 'The casing corrodes in roughly a century. The heavy metals inside do not break down at all, on any timescale — there is no smaller, safer version of lead.',
    source: { name: 'EPA household hazardous waste guidance', url: 'https://www.epa.gov/recycle' },
    labels: ['a used battery', 'an AA battery', 'a discarded lithium battery'],
    harm: 'Lithium cells crushed in a bin lorry start fires. This is not hypothetical — facility fires traced to binned batteries are a recurring, documented cause of serious damage.',
    better: 'Take rechargeable and lithium cells to a take-back point. Rules for ordinary alkaline batteries vary by region, so check yours.',
    recycle: 'Yes, and it matters most for lithium cells — but only via a take-back point, never a kerbside bin.',
  },
  {
    id: 'clothing', name: 'Clothing', material: 'Cotton, or polyester — which is plastic',
    fate: FATES.TEXTILE, mode: MODES.FRAGMENTS,
    persist: { low: 0.5, high: 250 }, claimed: 200,
    note: 'Cotton rots in months. Polyester is plastic thread and behaves like plastic. The label decides which of those two numbers applies.',
    source: { name: 'Chamas et al. 2020; Ellen MacArthur Foundation', url: 'https://www.ellenmacarthurfoundation.org/' },
    labels: ['a discarded t-shirt', 'a pile of old clothes', 'a worn out garment'],
    harm: 'Synthetic clothing sheds microfibres in every wash, straight through treatment and into water. It pollutes for the entire time you own it, not only after you discard it.',
    better: 'Wear it for longer. Garment lifespan is the lever that actually moves the number; everything else is rounding.',
    recycle: 'Blended fabrics cannot be economically separated, so barely any clothing becomes new clothing.',
  },
  {
    id: 'receipt', name: 'Receipt', material: 'Thermal paper',
    fate: FATES.TOXIC, mode: MODES.BIODEGRADES,
    persist: { low: 1, high: 5 }, claimed: 3,
    note: 'The paper itself goes quickly. The BPA/BPS coating is the problem, and it does not go anywhere pleasant.',
    source: { name: 'Environmental chemistry literature', url: 'https://www.epa.gov/' },
    labels: ['a paper receipt', 'a shop receipt', 'a long till receipt'],
    harm: 'Coated in BPA or BPS so the heat printing works. Recycling it spreads that coating through the entire paper stream, which is why thermal paper is formally excluded from paper recycling.',
    better: 'Decline it, or take the digital version. And keep it out of the paper bin — it contaminates.',
    recycle: 'No. It is the one paper item that must go in general waste.',
  },
  {
    id: 'balloon', name: 'Balloon', material: 'Latex or metallised film',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 0.5, high: Infinity }, claimed: 4,
    note: 'Natural latex genuinely does break down in months to a few years. Foil balloons are plastic film and do not. These are sold side by side.',
    source: { name: 'Marine Conservation Society', url: 'https://www.mcsuk.org/' },
    labels: ['a deflated balloon', 'a party balloon', 'a balloon with a string'],
    harm: 'A released balloon comes down somewhere, and a burst balloon is soft and stretchy — of all ocean debris it is among the deadliest to seabirds that swallow it.',
    better: 'Never release them. A released balloon is simply litter with a delay built in.',
    recycle: 'No.',
  },
  {
    id: 'toothbrush', name: 'Toothbrush', material: 'Mixed plastics and nylon',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 100, high: 1400 }, claimed: 400,
    note: 'A thick solid moulding, which puts it at the very slow end of the measured range.',
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic toothbrush', 'an old toothbrush', 'a used toothbrush'],
    harm: 'Handle, bristles and grip are three different plastics moulded together and impossible to separate. About a billion are thrown away in the US every year (a widely cited estimate).',
    better: 'Replaceable-head brushes cut the volume by most of it.',
    recycle: 'No. Mixed plastics, fused.',
  },
  {
    id: 'pizza-box', name: 'Pizza box', material: 'Corrugated cardboard',
    fate: FATES.PAPER, mode: MODES.BIODEGRADES,
    persist: { low: 0.2, high: 2 }, claimed: 1,
    source: { name: 'EPA recycling guidance', url: 'https://www.epa.gov/recycle' },
    labels: ['a pizza box', 'a greasy cardboard pizza box', 'an empty takeaway pizza box'],
    harm: 'The grease worry is mostly a myth. Boxes carry about 1–2% grease by weight, and industry testing found little fibre damage below 10% (AF&PA / WestRock study — industry-funded, so worth saying).',
    better: 'Scrape off leftover food and recycle the box, if your local programme takes them. Rules vary.',
    recycle: 'Generally yes — check your local rules.',
  },
  {
    id: 'banana-peel', name: 'Banana peel', material: 'Organic matter',
    fate: FATES.ORGANIC, mode: MODES.BIODEGRADES,
    persist: { low: 0.05, high: 2 }, claimed: 2,
    note: 'Weeks in open air or a compost heap. Up to about two years sealed in an anaerobic landfill, where it ferments instead of rotting.',
    source: { name: 'EPA food waste guidance', url: 'https://www.epa.gov/sustainable-management-food' },
    labels: ['a banana peel', 'a banana skin', 'discarded fruit peel'],
    harm: 'Almost none — unless it is sealed in landfill, where with no oxygen it produces methane instead of soil.',
    better: 'Compost heap or food waste caddy. This is one of the few items here that can genuinely vanish.',
    recycle: 'Compostable, which is better than recyclable.',
  },
  {
    id: 'apple-core', name: 'Apple core', material: 'Organic matter',
    fate: FATES.ORGANIC, mode: MODES.BIODEGRADES,
    persist: { low: 0.04, high: 1 }, claimed: 1,
    source: { name: 'EPA food waste guidance', url: 'https://www.epa.gov/sustainable-management-food' },
    labels: ['an apple core', 'a half eaten apple', 'a discarded apple'],
    harm: 'Nothing, in the open. Sealed in landfill it becomes methane like everything else organic.',
    better: 'Food waste bin or compost.',
    recycle: 'Compostable.',
  },
  {
    id: 'paper', name: 'Paper', material: 'Wood fibre',
    fate: FATES.PAPER, mode: MODES.BIODEGRADES,
    persist: { low: 0.1, high: 5 }, claimed: 1,
    note: 'Weeks in the open. Decades sealed in landfill — excavations pull out readable newspapers from the 1960s.',
    source: { name: 'EPA recycling data', url: 'https://www.epa.gov/recycle' },
    labels: ['a crumpled sheet of paper', 'waste paper', 'a newspaper'],
    harm: 'Low, though landfilled paper still generates methane, and burying a newspaper preserves it rather than destroying it.',
    better: 'Recycle it dry and clean.',
    recycle: 'Yes — roughly five to seven times before the fibres are too short.',
  },
  {
    id: 'cardboard', name: 'Cardboard box', material: 'Corrugated fibre',
    fate: FATES.PAPER, mode: MODES.BIODEGRADES,
    persist: { low: 0.2, high: 5 }, claimed: 1,
    source: { name: 'EPA recycling data', url: 'https://www.epa.gov/recycle' },
    labels: ['a cardboard box', 'a flattened cardboard box', 'a corrugated shipping box'],
    harm: 'One of the better-behaved materials — genuinely and routinely recycled at high rates.',
    better: 'Flatten it and keep it dry. Wet cardboard is much harder to pulp.',
    recycle: 'Yes, reliably.',
  },
  {
    id: 'electronics', name: 'Electronics', material: 'Plastics, rare metals, lithium',
    fate: FATES.TOXIC, mode: MODES.INERT,
    persist: { low: 500, high: Infinity }, claimed: 1000,
    note: 'A composite of things that fragment, things that corrode and things that never change. No single number describes it.',
    source: { name: 'UN Global E-waste Monitor', url: 'https://ewastemonitor.info/' },
    labels: ['a broken smartphone', 'old electronics', 'a discarded laptop', 'tangled electronic cables'],
    harm: 'Contains gold, cobalt and rare earths at higher concentration than the ore they are mined from — alongside lead and mercury. Much of the world\'s e-waste is dismantled informally by hand, often burned to strip cables, by people including children.',
    better: 'Manufacturer take-back or a council e-waste point. Wipe it, then hand it over.',
    recycle: 'Valuable and recoverable — but only through a proper e-waste route.',
  },
  {
    id: 'bottle-cap', name: 'Bottle cap', material: 'Polypropylene',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 100, high: 1400 }, claimed: 450,
    note: 'Small but thick-walled, which puts it at the slow end. Thickness matters more than size.',
    source: { name: 'Chamas et al. 2020', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a plastic bottle cap', 'a bottle lid', 'a small plastic cap'],
    harm: 'Small, buoyant, brightly coloured, and exactly the size of the food seabirds hunt for. Caps turn up in the stomachs of albatross chicks on islands a thousand miles from the nearest city.',
    better: 'Screw it back onto the bottle before recycling. Attached, it gets sorted with the bottle instead of falling through the screens.',
    recycle: 'Only if attached to the bottle. Loose, it is too small to sort.',
  },
  {
    id: 'nappy', name: 'Disposable nappy', material: 'Plastic, wood pulp and absorbent polymer',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 50, high: 500 }, claimed: 450,
    source: { name: 'Chamas et al. 2020 (mixed polymer)', url: 'https://pubs.acs.org/doi/10.1021/acssuschemeng.9b06635' },
    labels: ['a disposable diaper', 'a used nappy', 'a rolled up diaper'],
    harm: 'A child gets through several thousand. Every one ever used is still somewhere, and each also buries untreated human waste in the ground.',
    better: 'Reusables are a real commitment, but the volume difference is enormous. Otherwise there is no good route.',
    recycle: 'No. Mixed materials plus contamination.',
  },
  {
    id: 'fishing-line', name: 'Fishing line', material: 'Nylon monofilament',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 100, high: 600 }, claimed: 600,
    source: { name: 'NOAA Marine Debris Program', url: 'https://marinedebris.noaa.gov/' },
    labels: ['fishing line', 'tangled nylon fishing line', 'discarded fishing net'],
    harm: 'Lost line and nets keep catching things with nobody there to collect them — "ghost gear". Abandoned fishing equipment is one of the largest components of ocean plastic by weight.',
    better: 'Many marinas and tackle shops keep monofilament collection tubes.',
    recycle: 'Specialist schemes only.',
  },
  {
    id: 'gum', name: 'Chewing gum', material: 'Synthetic rubber — a plastic',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 20, high: 500 }, claimed: 50,
    note: 'Modern gum base is synthetic polymer. There is no study on chewed gum specifically, which tells you something.',
    source: { name: 'Polymer chemistry; no direct study', url: '' },
    labels: ['chewing gum', 'a piece of chewed gum', 'gum stuck on the pavement'],
    harm: 'Councils spend serious money steam-cleaning pavements, and it is one of the more surprising plastics people put in their mouths on purpose.',
    better: 'Wrap it and bin it. Never the pavement.',
    recycle: 'A handful of niche schemes exist. Effectively no.',
  },
  {
    id: 'unknown', name: 'Unidentified rubbish', material: 'Unknown',
    fate: FATES.PLASTIC, mode: MODES.FRAGMENTS,
    persist: { low: 20, high: 500 }, claimed: null,
    note: 'The classifier could not place this confidently.',
    source: { name: '—', url: '' },
    labels: ['a piece of litter', 'a piece of rubbish', 'general waste', 'garbage'],
    harm: 'The model could not identify this one — which is itself the point. Most rubbish is a composite of several materials fused together, and that is precisely what makes it unrecyclable and unmeasurable.',
    better: 'If you cannot tell what something is made of, neither can the sorting facility.',
    recycle: 'Unknown, which in practice means no.',
  },
];

export function getJourney(item) {
  return JOURNEYS[item.fate] || JOURNEYS[FATES.PLASTIC];
}

export function itemById(id) {
  return ITEMS.find((i) => i.id === id) || ITEMS.find((i) => i.id === 'unknown');
}

export function labelIndex() {
  const prompts = [];
  const owners = [];
  for (const item of ITEMS) {
    if (item.id === 'unknown') continue;
    for (const label of item.labels) { prompts.push(label); owners.push(item.id); }
  }
  return { prompts, owners };
}

export function yearsText(y) {
  if (y === Infinity) return 'indefinitely';
  if (y < 1) { const m = Math.max(1, Math.round(y * 12)); return m === 1 ? '1 month' : `${m} months`; }
  if (y < 2) return `${y.toFixed(1)} years`;
  return `${Math.round(y).toLocaleString()} years`;
}

export function rangeText(item) {
  const { low, high } = item.persist;
  if (low === Infinity) return 'indefinitely';
  if (high === Infinity) return `${yearsText(low)} — indefinitely`;
  if (low === high) return yearsText(low);
  return `${yearsText(low)} — ${yearsText(high)}`;
}

/* The year at which the scene should show this item changing state. */
export function changeYear(item) {
  return item.mode === MODES.BIODEGRADES ? item.persist.high : item.persist.low;
}

/* The consequence beat at the end of an item's journey. Every stat is from a named study or agency;
 * the framing is "what items like this do", never "your item did this" — we can't know that. */
export const COST = {
  'plastic-bag': { pic: 'turtle', line: 'Bags like this kill turtles.', stat: 'A turtle that swallows a single piece of plastic has a 22% chance of dying. At 14 pieces it is 50%.', src: 'Wilcox et al. 2018, Scientific Reports (246 turtles)' },
  'plastic-cutlery': { pic: 'turtle', line: 'This is what turtles and seabirds swallow most.', stat: 'Experts ranked plastic cutlery as the debris most likely to be eaten.', src: 'Wilcox et al. 2016, Marine Policy' },
  'straw': { pic: 'turtle', line: 'Researchers pulled one of these out of a live turtle\'s nose.', stat: 'A 10 cm straw, from an olive ridley turtle in Costa Rica, 2015. A single observation, not a study.', src: 'Texas A&M / National Geographic' },
  'balloon': { pic: 'bird', line: 'Balloons are the deadliest litter for seabirds.', stat: 'A bird that swallows one is 32 times more likely to die than one that swallows hard plastic.', src: 'Roman et al. 2019, Scientific Reports (1,733 seabirds)' },
  'bottle-cap': { pic: 'bird', line: 'Albatross parents feed their chicks plastic.', stat: '97.6% of 251 chicks examined on Midway Atoll had plastic inside them.', src: 'Auman et al. 1997 — plastic in general; the study did not itemise caps' },
  'fishing-line': { pic: 'bird', line: 'Lost line keeps catching things with nobody there.', stat: '7% of 3,766 pelicans surveyed in Tampa Bay were tangled in fishing gear.', src: 'PLOS ONE 2025' },
  'cigarette-butt': { pic: 'animal', line: 'One butt in a litre of water kills half the fish in it.', stat: 'LC50 of about 1 butt per litre for fathead minnow and topsmelt.', src: 'Slaughter et al. 2011, Tobacco Control' },
  'battery': { pic: 'fire', line: 'Binned batteries start fires.', stat: 'Over 1,200 battery fires in UK waste sites and bin lorries in one year, up 71%.', src: 'Environmental Services Association 2023/24' },
  'electronics': { pic: 'fire', line: 'Where e-waste is burned by hand, children carry the lead.', stat: 'Children in Guiyu, China: blood lead averaged 15.3 µg/dL, and 82% were above 10.', src: 'Huo et al. 2007, Environmental Health Perspectives' },
  'face-mask': { pic: 'fragments', line: 'One mask sheds about 1,700 microplastic particles a day.', stat: 'Measured on disposable masks in use.', src: 'Hong et al. 2023, Science of the Total Environment' },
  'clothing': { pic: 'river', line: 'One wash of synthetic clothes can shed half a million fibres.', stat: '496,030 fibres from a 6 kg polyester load, straight through treatment plants.', src: 'Napper & Thompson 2016, Marine Pollution Bulletin' },
  'pet-bottle': { pic: 'fragments', line: 'It comes back to you.', stat: 'Bottled water was found to hold about 240,000 plastic particles per litre, mostly nanoplastics.', src: 'Qian et al. 2024, PNAS' },
  'aluminium-can': { pic: 'furnace', line: 'Burying a can wastes 95% of the energy it took to make.', stat: 'Recycled aluminium needs 95% less energy than new metal from ore.', src: 'International Aluminium Institute' },
  'coffee-cup': { pic: 'dump', line: 'Fewer than 1 in 400 of these are recycled.', stat: 'The UK throws away about 2.5 billion disposable cups a year.', src: 'UK Environmental Audit Committee 2018' },
  'styrofoam': { pic: 'dump', line: 'Its building block is a probable carcinogen.', stat: 'Styrene is classed Group 2A, "probably carcinogenic to humans", and it migrates into food.', src: 'IARC Monograph 121, 2019' },
  'banana-peel': { pic: 'dump', line: 'Sealed in landfill, it makes methane instead of soil.', stat: 'Landfills are the third-largest source of human methane emissions in the US, 14.4%.', src: 'US EPA' },
  'apple-core': { pic: 'dump', line: 'Sealed in landfill, it makes methane instead of soil.', stat: 'Landfills are the third-largest source of human methane emissions in the US, 14.4%.', src: 'US EPA' },
};
