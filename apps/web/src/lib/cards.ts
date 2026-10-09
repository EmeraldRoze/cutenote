// The featured-artist card catalog — five artists, three cards each,
// straight from the App Screens board, rendered in the Oct 2026 system.
// Artworks are the torn-paper pieces in /site/.

export interface CardDesign {
  id: string
  title: string
  art: string // /site/<art>.png
  bg: string
}

export interface Artist {
  name: string
  initials: string
  style: string
  chip: string
  cards: CardDesign[]
}

export const ARTISTS: Artist[] = [
  {
    name: 'Luna Park', initials: 'LP', style: 'Watercolor florals', chip: '#E4D9F7',
    cards: [
      { id: 'lp-1', title: 'Fresh Daisies', art: 'flower', bg: '#EEE6FA' },
      { id: 'lp-2', title: 'Garden Party', art: 'clover', bg: '#F2FBDA' },
      { id: 'lp-3', title: 'Petal Post', art: 'heart-torn', bg: '#FBF8F4' },
    ],
  },
  {
    name: 'Theo Marsh', initials: 'TM', style: 'Paper collage', chip: '#F2FBDA',
    cards: [
      { id: 'tm-1', title: 'Sunny Side', art: 'waves', bg: '#FBF8F4' },
      { id: 'tm-2', title: 'Over the Rainbow', art: 'rainbow', bg: '#EEE6FA' },
      { id: 'tm-3', title: 'Lucky You', art: 'finger', bg: '#F2FBDA' },
    ],
  },
  {
    name: 'Ines Duarte', initials: 'ID', style: 'Cozy still life', chip: '#EEE6FA',
    cards: [
      { id: 'id-1', title: 'Morning Ritual', art: 'coffee', bg: '#FBF8F4' },
      { id: 'id-2', title: 'Little Treat', art: 'cake', bg: '#EEE6FA' },
      { id: 'id-3', title: 'Wrapped Up', art: 'gift', bg: '#F2FBDA' },
    ],
  },
  {
    name: 'Kofi Mensah', initials: 'KM', style: 'Night skies', chip: '#E4D9F7',
    cards: [
      { id: 'km-1', title: 'Moonlight', art: 'moon', bg: '#E4D9F7' },
      { id: 'km-2', title: 'Goodnight', art: 'star-gold', bg: '#EEE6FA' },
      { id: 'km-3', title: 'Golden Hour', art: 'sun', bg: '#FBF8F4' },
    ],
  },
  {
    name: 'Ruth Abel', initials: 'RA', style: 'Love letters', chip: '#F2FBDA',
    cards: [
      { id: 'ra-1', title: 'Sealed with Love', art: 'envelope-heart', bg: '#EEE6FA' },
      { id: 'ra-2', title: 'Full Heart', art: 'heart-lime', bg: '#FBF8F4' },
      { id: 'ra-3', title: 'Hooray', art: 'popper', bg: '#F2FBDA' },
    ],
  },
]

export const CARD_LOOKUP: Record<string, CardDesign & { artist: string }> = {}
for (const a of ARTISTS) for (const c of a.cards) CARD_LOOKUP[c.id] = { ...c, artist: a.name }

// Notes sent before this catalog existed reference the old three ids.
CARD_LOOKUP['design-1'] = CARD_LOOKUP['lp-1']
CARD_LOOKUP['design-2'] = CARD_LOOKUP['ra-3']
CARD_LOOKUP['design-3'] = CARD_LOOKUP['km-2']
