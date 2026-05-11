export const pakistanRegions = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Faisalabad',
  'Multan',
  'Sukkur',
  'Hyderabad',
  'Peshawar',
] as const;

export type PakistanRegion = (typeof pakistanRegions)[number];

export function isPakistanRegion(value: unknown): value is PakistanRegion {
  return typeof value === 'string' && pakistanRegions.includes(value as PakistanRegion);
}
