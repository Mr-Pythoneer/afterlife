/* Per-country municipal waste. Source: World Bank "What a Waste" (3.0 edition, 2026; 2.0 edition, 2018).
 * kg   = municipal solid waste generated per person per day
 * dump = share landfilled, open-dumped or never collected (uncollected waste is mostly dumped or burned)
 * India, Pakistan, Thailand and South Africa use the 2.0 edition: the 3.0 disposal data is incomplete or looks unreliable there.
 * Countries with no usable disposal data (Nigeria, Ghana, Kenya, Ethiopia, Bangladesh, Vietnam, Philippines) are left out on purpose. */
export const PLACES = [
  { name: 'United States', kg: 2.18, yr: 2018, dump: 0.49 },
  { name: 'Canada', kg: 2.25, yr: 2018, dump: 0.63 },
  { name: 'Mexico', kg: 1.03, yr: 2021, dump: 0.87 },
  { name: 'Brazil', kg: 1.07, yr: 2022, dump: 0.98 },
  { name: 'Argentina', kg: 1.17, yr: 2022, dump: 0.99 },
  { name: 'Colombia', kg: 0.77, yr: 2022, dump: 0.83 },
  { name: 'Peru', kg: 0.85, yr: 2021, dump: 0.67 },
  { name: 'Chile', kg: 1.22, yr: 2022, dump: 0.97 },
  { name: 'United Kingdom', kg: 1.28, yr: 2021, dump: 0.09 },
  { name: 'Ireland', kg: 1.74, yr: 2021, dump: 0.16 },
  { name: 'France', kg: 1.52, yr: 2022, dump: 0.24 },
  { name: 'Germany', kg: 1.63, yr: 2022, dump: 0.01 },
  { name: 'Spain', kg: 1.61, yr: 2021, dump: 0.49 },
  { name: 'Italy', kg: 1.33, yr: 2022, dump: 0.14 },
  { name: 'Netherlands', kg: 1.29, yr: 2022, dump: 0.01 },
  { name: 'Sweden', kg: 1.08, yr: 2022, dump: 0.02 },
  { name: 'Poland', kg: 0.97, yr: 2022, dump: 0.38 },
  { name: 'Russia', kg: 0.86, yr: 2022, dump: 0.91 },
  { name: 'Turkey', kg: 0.95, yr: 2022, dump: 0.81 },
  { name: 'Egypt', kg: 0.64, yr: 2021, dump: 0.81 },
  { name: 'South Africa', kg: 0.98, yr: 2011, dump: 0.72 },
  { name: 'India', kg: 0.38, yr: 2018, dump: 0.77 },
  { name: 'Pakistan', kg: 0.44, yr: 2017, dump: 0.9 },
  { name: 'Thailand', kg: 1.07, yr: 2015, dump: 0.8 },
  { name: 'China', kg: 0.97, yr: 2022, dump: 0.18 },
  { name: 'Japan', kg: 0.88, yr: 2022, dump: 0.01 },
  { name: 'South Korea', kg: 1.22, yr: 2022, dump: 0.1 },
  { name: 'Indonesia', kg: 0.54, yr: 2023, dump: 0.88 },
  { name: 'Australia', kg: 1.48, yr: 2021, dump: 0.58 },
  { name: 'New Zealand', kg: 1.93, yr: 2022, dump: 0.91 },
  { name: 'Saudi Arabia', kg: 1.81, yr: 2022, dump: 0.88 },
  { name: 'United Arab Emirates', kg: 1.26, yr: 2022, dump: 0.9 },
  { name: 'Israel', kg: 1.88, yr: 2022, dump: 0.76 },
];
export const SOURCE = 'Source: World Bank What a Waste. Figures cover all municipal waste, and older years for some countries.';
