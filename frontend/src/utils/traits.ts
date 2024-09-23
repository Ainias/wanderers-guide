export type TraitType =
  | 'GENERAL'
  | 'SKILL'
  | 'INVESTED'
  | 'EXPLORATION'
  | 'DOWNTIME'
  | 'CONSUMABLE'
  | 'THROWN'
  | 'THROWN-10'
  | 'THROWN-20'
  | 'SPLASH'
  | 'PROPULSIVE'
  | 'FOCUS'
  | 'CANTRIP'
  | 'BOMB'
  | 'AGILE'
  | 'FINESSE'
  | 'MULTICLASS'
  | 'DEDICATION'
  | 'ARCHAIC'
  | 'MAGICAL'
  | 'STAFF'
  | 'WAND'
  | 'TECH'
  | 'TRACKING-1'
  | 'TRACKING-2'
  | 'TRACKING-3'
  | 'TRACKING-4'
  | 'RESILIENT-1'
  | 'RESILIENT-2'
  | 'RESILIENT-3'
  | 'RESILIENT-4';
const traitMap: Record<number, TraitType> = {
  // Hardcoded trait ids:
  1437: 'GENERAL',
  1438: 'SKILL',
  1527: 'INVESTED',
  1531: 'CONSUMABLE',
  1457: 'EXPLORATION',
  1466: 'DOWNTIME',
  1575: 'THROWN',
  1626: 'THROWN-10',
  1843: 'THROWN-20',
  1532: 'SPLASH',
  1579: 'PROPULSIVE',
  1856: 'FOCUS',
  1858: 'CANTRIP',
  1530: 'BOMB',
  1569: 'AGILE',
  1570: 'FINESSE',
  1446: 'MULTICLASS',
  1445: 'DEDICATION',
  1504: 'MAGICAL',
  1546: 'STAFF',
  1665: 'WAND',
  2503: 'ARCHAIC',
  2508: 'TECH',
  3673: 'TRACKING-1',
  3674: 'TRACKING-2',
  3675: 'TRACKING-3',
  4001: 'TRACKING-4',
  4002: 'RESILIENT-1',
  4003: 'RESILIENT-2',
  4004: 'RESILIENT-3',
  4005: 'RESILIENT-4',
};

export function getTraitTypeById(traitId: number): TraitType | null {
  return traitMap[traitId] ?? null;
}

export function getTraitIdByType(traitType: TraitType): number {
  return parseInt(Object.entries(traitMap).find(([id, type]) => type === traitType)?.[0] ?? '');
}

export function hasTraitType(traitType: TraitType, traitIds?: number[]): boolean {
  if (!traitIds) return false;
  return traitIds.some((traitId) => getTraitTypeById(traitId) === traitType);
}
