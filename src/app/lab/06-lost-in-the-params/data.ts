export interface Note {
  slug: string;
  title: string;
  season: string;
  body: string;
}

const NOTES: Note[] = [
  {
    slug: 'first-frost',
    title: 'First Frost',
    season: 'Late autumn',
    body: 'The harbor went quiet overnight. Ice on the ropes, steam off the water — the whole bay exhaling. Counted eleven eider ducks and one very unimpressed heron.',
  },
  {
    slug: 'gull-politics',
    title: 'Gull Politics',
    season: 'Midwinter',
    body: 'A three-day standoff over the fish crates ended when the big herring gull simply left. Power is mostly attendance.',
  },
  {
    slug: 'the-green-week',
    title: 'The Green Week',
    season: 'Early spring',
    body: 'Everything budded at once, as if the peninsula had been holding its breath since November. The moss on the north wall is practically glowing.',
  },
];

export function getNotes(): Note[] {
  return NOTES;
}

export function getNote(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug);
}
