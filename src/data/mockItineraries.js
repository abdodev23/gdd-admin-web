// ─── Hotel definitions ───
export const itineraryHotels = [
  {
    id: 'hyatt-regency',
    name: 'Hyatt Regency Cairo West',
    stars: 5,
    roomType: 'Standard',
    nightlyRate: 125,       // PP in DBL
    nightlyRateSgl: 115,    // SGL supplement per night
    roomSupplements: [
      { type: 'Deluxe (King Bed)', perRoomPerNight: 25 },
      { type: 'Pyramids View (Twin Beds)', perRoomPerNight: 50 },
      { type: 'Regency Suite', perRoomPerNight: 220 },
      { type: 'Regency Executive Suite', perRoomPerNight: 260 },
    ],
  },
  {
    id: 'st-regis',
    name: 'St. Regis Cairo',
    stars: 5,
    roomType: 'Deluxe Partial Nile View',
    nightlyRate: 268,
    nightlyRateSgl: 268,
    roomSupplements: [],
  },
  {
    id: 'four-seasons-superior',
    name: 'Four Seasons Nile Plaza',
    stars: 5,
    roomType: 'Superior Room',
    nightlyRate: 493,
    nightlyRateSgl: 493,
    roomSupplements: [],
  },
  {
    id: 'four-seasons-nile-view',
    name: 'Four Seasons Nile Plaza',
    stars: 5,
    roomType: 'Nile View Room',
    nightlyRate: 570,
    nightlyRateSgl: 601,    // SGL is higher than DBL for this room
    roomSupplements: [],
  },
  {
    id: 'marriott-mena-house',
    name: 'Marriott Mena House',
    stars: 5,
    roomType: 'Deluxe Garden View',
    nightlyRate: 400,
    nightlyRateSgl: 400,
    roomSupplements: [],
  },
]

// Net hotel rates reference table (from FS sheets)
export const netHotelRates = [
  { hotel: 'St. Regis Deluxe Room - Partial View', ppInDbl: 268, withProfit35: 362 },
  { hotel: 'Four Seasons N. Plaza - Superior Room', ppInDbl: 493, withProfit35: 666 },
  { hotel: 'Four Seasons N. Plaza - Nile View Room', ppInDbl: 570, withProfit35: 770 },
  { hotel: 'Marriott Mena House - Deluxe Garden View Room', ppInDbl: 400, withProfit35: 540 },
]

// Hotel upgrade supplements (per person per night, over base Hyatt)
export const hotelUpgradeSupplements = [
  { hotel: 'St. Regis Deluxe Room - Partial View', perPersonPerNight: 193 },
  { hotel: 'Four Seasons N. Plaza - Superior Room', perPersonPerNight: 497 },
  { hotel: 'Four Seasons N. Plaza - Nile View Room', perPersonPerNight: 601 },
  { hotel: 'Marriott Mena House - Deluxe Garden View Room', perPersonPerNight: 371 },
]

// Luxor hotel (for cruise + Luxor overnight variants)
export const luxorHotel = {
  name: 'Sonesta St. Georges Luxor',
  roomType: 'Front Nile View Rooms',
  nightlyRate: 120,
  nightlyRateSgl: 84,
}

// Children policy (shared across all itineraries)
export const childrenPolicy = [
  { ageRange: '0 - 5.99 years', rule: 'Free of charge sharing parent\'s room' },
  { ageRange: '6 - 11.99 years', rule: '50% charge on meals only (breakfast at $10.00 per child/per night)' },
  { ageRange: '12+ years', rule: 'Charged as adult' },
]

// ═══════════════════════════════════════════════════════════
// 1. MAIN GROUP ITINERARY (3 Nights / 4 Days)
// ═══════════════════════════════════════════════════════════
// Per-hotel includes text (exact text from each sheet's "ABOVE RATES INCLUDE" section)
export const perHotelIncludes = {
  'main-group': {
    'hyatt-regency': [
      'Transfer from Airport to Hotel & vice versa',
      '3 Nights Accommodation at the Hyatt West Hotel based on Bed & Breakfast',
      'Transfer from Hotel to the GEM for the Event and vice versa',
      'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'st-regis': [
      'Transfer from and to Airport',
      '3 Nights Accommodation at the St. Regis Deluxe Partial N. View Rooms based on Bed & Breakfast',
      'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'four-seasons-superior': [
      'Transfer from and to Airport',
      '3 Nights Accommodation at the Four Seasons N. Plaza Superior Room based on Bed & Breakfast',
      'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'four-seasons-nile-view': [
      'Transfer from and to Airport',
      '3 Nights Accommodation at the Hyatt West Hotel based on Bed & Breakfast',
      'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'marriott-mena-house': [
      'Transfer from and to Airport',
      '3 Nights Accommodation at the Marriott Mena House Deluxe Garden View Rooms based on Bed & Breakfast',
      'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
      'English-speaking guide',
    ],
  },
  'post-event': {
    'hyatt-regency': [
      'All transfers in Cairo',
      '3 Nights Accommodation at the Hyatt Regency Hotel or similar based on Bed & Breakfast',
      'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
      'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'st-regis': [
      'All transfers in Cairo',
      '3 Nights Accommodation at St. Regis Deluxe Partial N. View Rooms based on Bed & Breakfast',
      'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
      'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'four-seasons-superior': [
      'All transfers in Cairo',
      '3 Nights Accommodation at Four Seasons Superior Room based on Bed & Breakfast',
      'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
      'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'four-seasons-nile-view': [
      'All transfers in Cairo',
      '3 Nights Accommodation at the Four Seasons N. Plaza N. View Rooms based on Bed & Breakfast',
      'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
      'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
      'English-speaking guide',
    ],
    'marriott-mena-house': [
      'All transfers in Cairo',
      '3 Nights Accommodation at the Marriott Mena House Deluxe Garden View Rooms based on Bed & Breakfast',
      'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
      'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
      'English-speaking guide',
    ],
  },
  'nile-cruise': {
    'hyatt-regency': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Hyatt West Hotel or similar based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'st-regis': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at St. Regis Deluxe Partial Nile View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'four-seasons-superior': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at Four Seasons N. Plaza Superior Room based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'four-seasons-nile-view': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Four Seasons N. Plaza N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'marriott-mena-house': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Marriott Mena House Deluxe Garden View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
  },
  'nile-cruise-luxor': {
    'hyatt-regency': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Hyatt West Hotel or similar based on Bed & Breakfast',
      '1 Night Accommodation at the Sonesta St. Georges Luxor Front N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'st-regis': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at St. Regis Deluxe Partial N. View Rooms based on Bed & Breakfast',
      '1 Night Accommodation at the Sonesta St. Georges Luxor Front N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'four-seasons-superior': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Four Seasons N. Plaza Superior Rooms based on Bed & Breakfast',
      '1 Night Accommodation at the Sonesta St. Georges Luxor Front N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'four-seasons-nile-view': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at Four Seasons N. Plaza N. View Rooms based on Bed & Breakfast',
      '1 Night Accommodation at the Sonesta St. Georges Luxor Front N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
    'marriott-mena-house': [
      'All transfers in Cairo, Luxor & Aswan',
      '2 Nights Accommodation at the Marriott Mena House Deluxe Garden View Rooms based on Bed & Breakfast',
      '1 Night Accommodation at the Sonesta St. Georges Luxor Front N. View Rooms based on Bed & Breakfast',
      '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
      'Local English-speaking guide',
    ],
  },
  'cruise-3nt': {
    'hyatt-regency': [
      'All transfers in Cairo, Aswan & Luxor',
      '2 Nights at Hyatt Regency Hotel based on Bed & Breakfast',
      '3 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
      'Excursions on board of the boat: The High Dam, Philae Temple, Felucca around the Kitchener Islands, Kom Ombo & Edfu Temple, Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut and the Colossi of Memnon)',
      'Local English-speaking guide',
    ],
  },
}

// NOTE: Table of Prices (sheet 1) shows 745/350 for Hyatt Main Group,
// but the detailed breakdown (sheet 2) computes to 742/345. The 3/$5 difference
// is in the summary sheet itself. We use the computed values from detailed sheets.

const mainGroupBase = {
  id: 'main-group-3n4d',
  category: 'main-group',
  name: 'Main Itinerary',
  subtitle: 'Option (1): Platinum',
  duration: '4 Days / 3 Nights',
  days: 4,
  nights: 3,
  paxBasis: '02 PAX',
  eventDate: 'NOV 26',
  location: 'Cairo, Egypt',
  status: 'active',
  totalBookings: 87,
  currency: 'USD',
}

const mainGroupHotelVariants = [
  {
    hotelId: 'hyatt-regency',
    dayByDay: [
      { day: 1, items: [
        { service: 'TRF APT/HTL', cost: 20 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 2, items: [
        { service: 'FD GEM, PYR', cost: 88 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 3, items: [
        { service: 'TRF TO THE GEM FOR GDD EVENT', cost: 20 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 20 },
      ]},
    ],
    sakkHandling: 197,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 742,
    sglSupplement: {
      breakdown: [
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
      ],
      total: 345,
    },
  },
  {
    hotelId: 'st-regis',
    dayByDay: [
      { day: 1, items: [
        { service: 'TRF APT/HTL', cost: 20 },
        { service: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 2, items: [
        { service: 'FD GEM, PYR', cost: 88 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 3, items: [
        { service: 'TRF TO THE GEM FOR GDD EVENT', cost: 20 },
        { service: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 20 },
      ]},
    ],
    sakkHandling: 341,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 1315,
    sglSupplement: {
      breakdown: [
        { description: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
        { description: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
        { description: '1 NT ST. REGIS HTL - DELUXE PARTIAL N. VIEW', cost: 268 },
      ],
      total: 804,
    },
  },
  {
    hotelId: 'four-seasons-superior',
    dayByDay: [
      { day: 1, items: [
        { service: 'TRF APT/HTL', cost: 20 },
        { service: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ]},
      { day: 2, items: [
        { service: 'FD GEM, PYR', cost: 88 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ]},
      { day: 3, items: [
        { service: 'TRF TO THE GEM FOR GDD EVENT', cost: 20 },
        { service: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 20 },
      ]},
    ],
    sakkHandling: 578,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2227,
    sglSupplement: {
      breakdown: [
        { description: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
        { description: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
        { description: '1 NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ],
      total: 1479,
    },
  },
  {
    hotelId: 'four-seasons-nile-view',
    dayByDay: [
      { day: 1, items: [
        { service: 'TRF APT/HTL', cost: 20 },
        { service: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 2, items: [
        { service: 'FD GEM, PYR', cost: 88 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 3, items: [
        { service: 'TRF TO THE GEM FOR GDD EVENT', cost: 20 },
        { service: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 20 },
      ]},
    ],
    sakkHandling: 658,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2538,
    sglSupplement: {
      breakdown: [
        { description: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 601 },
        { description: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 601 },
        { description: '1 NT FOUR SEASONS N. PLAZA - N. VIEW ROOMS', cost: 601 },
      ],
      total: 1803,
    },
  },
  {
    hotelId: 'marriott-mena-house',
    dayByDay: [
      { day: 1, items: [
        { service: 'TRF APT/HTL', cost: 20 },
        { service: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
      ]},
      { day: 2, items: [
        { service: 'FD GEM, PYR', cost: 88 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
      ]},
      { day: 3, items: [
        { service: 'TRF TO THE GEM FOR GDD EVENT', cost: 20 },
        { service: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 20 },
      ]},
    ],
    sakkHandling: 480,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 1850,
    sglSupplement: {
      breakdown: [
        { description: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
        { description: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
        { description: '1 NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW ROOM', cost: 400 },
      ],
      total: 1200,
    },
  },
]

const mainGroupIncludes = [
  'Transfer from Airport to Hotel & vice versa',
  '3 Nights Accommodation based on Bed & Breakfast',
  'Transfer from Hotel to the GEM for the Event and vice versa',
  'Full Day visit to the Pyramids, Sphinx & GEM including lunch at a local restaurant',
  'English-speaking guide',
]

const mainGroupExcludes = [
  'Entry visas',
  'Tips',
  'Any domestic or international flights',
]

// ═══════════════════════════════════════════════════════════
// 2. POST EVENT EXTENSION (3 Nights / 4 Days)
// ═══════════════════════════════════════════════════════════
const postEventBase = {
  id: 'post-event-3n4d',
  category: 'post-event',
  name: 'Post Event Extension',
  subtitle: '3 Nights Cairo Only',
  duration: '4 Days / 3 Nights',
  days: 4,
  nights: 3,
  paxBasis: '02 PAX',
  location: 'Cairo & Alexandria, Egypt',
  status: 'active',
  totalBookings: 42,
  currency: 'USD',
}

const postEventHotelVariants = [
  {
    hotelId: 'hyatt-regency',
    dayByDay: [
      { day: 1, items: [
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 2, items: [
        { service: 'FD : PYRAMIDS, SPH, SAKK', cost: 72 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 3, items: [
        { service: 'OVERDAY ALEXANDRIA', cost: 109 },
        { service: 'LUNCH', cost: 22 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 218,
    sakkHandlingLabel: 'SAKK HANDLING - INCL 35%',
    total: 839,
    sglSupplement: {
      breakdown: [
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
      ],
      total: 345,
    },
  },
  {
    hotelId: 'st-regis',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 2, items: [
        { service: 'FD : PYRAMIDS, SPH, SAKK', cost: 72 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 3, items: [
        { service: 'OVERDAY ALEXANDRIA', cost: 109 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 368,
    sakkHandlingLabel: 'SAKK HANDLING - INCL 35%',
    total: 1418,
    sglSupplement: {
      breakdown: [
        { description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
        { description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
        { description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 268 },
      ],
      total: 804,
    },
  },
  {
    hotelId: 'four-seasons-superior',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
      ]},
      { day: 2, items: [
        { service: 'FD : PYRAMIDS, SPH, SAKK', cost: 72 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
      ]},
      { day: 3, items: [
        { service: 'OVERDAY ALEXANDRIA', cost: 109 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 604,
    sakkHandlingLabel: 'SAKK HANDLING - INCL 35%',
    total: 2329,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 493 },
      ],
      total: 1479,
    },
  },
  {
    hotelId: 'four-seasons-nile-view',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 2, items: [
        { service: 'FD : PYRAMIDS, SPH, SAKK', cost: 72 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 3, items: [
        { service: 'OVERDAY ALEXANDRIA', cost: 109 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 685,
    sakkHandlingLabel: 'SAKK HANDLING - INCL 35%',
    total: 2641,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 770 },
        { description: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 770 },
        { description: '1NT FOUR SEASONS N. VIEW ROOMS', cost: 770 },
      ],
      total: 2310,
    },
  },
  {
    hotelId: 'marriott-mena-house',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
      ]},
      { day: 2, items: [
        { service: 'FD : PYRAMIDS, SPH, SAKK', cost: 72 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
      ]},
      { day: 3, items: [
        { service: 'OVERDAY ALEXANDRIA', cost: 109 },
        { service: 'LUNCH', cost: 22 },
        { service: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
      ]},
      { day: 4, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 506,
    sakkHandlingLabel: 'SAKK HANDLING - INCL 35%',
    total: 1952,
    sglSupplement: {
      breakdown: [
        { description: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
        { description: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
        { description: '1NT MARRIOTT MENA HOUSE - DELUXE GARDEN VIEW RMS', cost: 400 },
      ],
      total: 1200,
    },
  },
]

// Post Event — Itemized with 35% Profit (sheets 12-16)
const postEventProfitPricing = [
  { hotelId: 'hyatt-regency', dayByDay: [
    { day: 1, items: [{ service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 2, items: [{ service: 'FD : PYRAMIDS, SPH, SAKK', cost: 97.20 }, { service: 'LUNCH', cost: 29.70 }, { service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 3, items: [{ service: 'OVERDAY ALEXANDRIA', cost: 147.15 }, { service: 'LUNCH', cost: 29.70 }, { service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 4, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 838.35, sglSupplement: { breakdown: [{ description: '1 NT HYATT REGENCY BB', cost: 115 }, { description: '1 NT HYATT REGENCY BB', cost: 115 }, { description: '1 NT HYATT REGENCY BB', cost: 115 }], total: 345 }},
  { hotelId: 'st-regis', dayByDay: [
    { day: 1, items: [{ service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 362 }] },
    { day: 2, items: [{ service: 'FD : PYRAMIDS, SPH, SAKK', cost: 97.20 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 362 }] },
    { day: 3, items: [{ service: 'OVERDAY ALEXANDRIA', cost: 147.15 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 362 }] },
    { day: 4, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 1418.10, sglSupplement: { breakdown: [{ description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 363 }, { description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 362 }, { description: '1NT ST. REGIS DELUXE ROOM - PARTIAL N. VIEW', cost: 362 }], total: 1087 }},
  { hotelId: 'four-seasons-superior', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }] },
    { day: 2, items: [{ service: 'FD : PYRAMIDS, SPH, SAKK', cost: 97.20 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }] },
    { day: 3, items: [{ service: 'OVERDAY ALEXANDRIA', cost: 147.15 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }] },
    { day: 4, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2330.10, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }, { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }, { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }], total: 1998 }},
  { hotelId: 'four-seasons-nile-view', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 2, items: [{ service: 'FD : PYRAMIDS, SPH, SAKK', cost: 97.20 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 3, items: [{ service: 'OVERDAY ALEXANDRIA', cost: 147.15 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 4, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2642.10, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }, { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }, { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }], total: 2310 }},
  { hotelId: 'marriott-mena-house', dayByDay: [
    { day: 1, items: [{ service: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }] },
    { day: 2, items: [{ service: 'FD : PYRAMIDS, SPH, SAKK', cost: 97.20 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }] },
    { day: 3, items: [{ service: 'OVERDAY ALEXANDRIA', cost: 147.15 }, { service: 'LUNCH', cost: 29.70 }, { service: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }] },
    { day: 4, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 1952.10, sglSupplement: { breakdown: [{ description: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }, { description: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }, { description: '1NT MARRIOTT MENA HOUSE DELUXE GARDEN VIEW', cost: 540 }], total: 1620 }},
]

const postEventIncludes = [
  'All transfers in Cairo',
  '3 Nights Accommodation based on Bed & Breakfast',
  'Full Day: Pyramids, Sphinx, Sakkara including lunch at a local restaurant',
  'Overday Alexandria including: Catacombs, Pompey\'s Pillar, Amphitheater, Alexandria Library, Alexandria National Museum, including lunch at a local restaurant',
  'English-speaking guide',
]

const postEventExcludes = [
  'Entry visas',
  'Tips',
  'Event tickets',
  'Any other services not mentioned in inclusions',
]

// ═══════════════════════════════════════════════════════════
// 3. NILE CRUISE 4NT (1NT Cairo + 4NTS Cruise + 1NT Cairo)
// ═══════════════════════════════════════════════════════════
const nileCruise4ntBase = {
  id: 'nile-cruise-4nt',
  category: 'nile-cruise',
  name: 'Nile Cruise Extension',
  subtitle: '1NT Cairo + 4NTS Cruise',
  duration: '7 Days / 6 Nights',
  days: 7,
  nights: 6,
  paxBasis: '02 PAX',
  location: 'Cairo, Luxor & Aswan, Egypt',
  status: 'active',
  totalBookings: 28,
  currency: 'USD',
  cruiseDetails: {
    vessel: 'H/S Nebu',
    route: 'Luxor → Aswan',
    nights: 4,
    board: 'Full Board (starting with lunch, ending with breakfast)',
    cruiseCostPP: 1040,
    cruiseServiceCharge: 265,
    cruiseSglSupplement: 728,
    domesticFlightCost: 320,
  },
  excursions: [
    'Karnak & Luxor Temple',
    'West Bank: Valley of Kings, Hatshepsut & the Colossi of Memnon',
    'Edfu & Kom Ombo Temple',
    'The High Dam, Philae Temple',
    'Felucca around the Kitchener Islands',
  ],
}

const nileCruise4ntHotelVariants = [
  {
    hotelId: 'hyatt-regency',
    dayByDay: [
      { day: 1, items: [
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / CRZ', cost: 14 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 577,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2225,
    sglSupplement: {
      breakdown: [
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
      ],
      total: 958,
    },
  },
  {
    hotelId: 'st-regis',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT ST. REGIS DELUXE - PARTIAL N. VIEW ROOMS', cost: 268 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / CRZ', cost: 14 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT ST. REGIS DELUXE - PARTIAL N. VIEW ROOMS', cost: 268 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 677,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2611,
    sglSupplement: {
      breakdown: [
        { description: '1NT ST. REGIS DELUXE - PARTIAL N. VIEW ROOMS', cost: 268 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT ST. REGIS DELUXE - PARTIAL N. VIEW ROOMS', cost: 268 },
      ],
      total: 1264,
    },
  },
  {
    hotelId: 'four-seasons-superior',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / CRZ', cost: 14 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 835,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 3219,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 493 },
      ],
      total: 1714,
    },
  },
  {
    hotelId: 'four-seasons-nile-view',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. PLAZA NILE VIEW ROOMS', cost: 570 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / CRZ', cost: 14 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT FOUR SEASONS N. PLAZA NILE VIEW ROOMS', cost: 570 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 888,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 3426,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. PLAZA NILE VIEW ROOMS', cost: 570 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT FOUR SEASONS N. PLAZA NILE VIEW ROOMS', cost: 570 },
      ],
      total: 1868,
    },
  },
  {
    hotelId: 'marriott-mena-house',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT MARRIOTT MENA HOUSE DELUXE ROOM- GARDEN VIEW', cost: 400 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / CRZ', cost: 14 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT MARRIOTT MENA HOUSE DELUXE ROOM- GARDEN VIEW', cost: 400 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 769,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2967,
    sglSupplement: {
      breakdown: [
        { description: '1NT MARRIOTT MENA HOUSE DELUXE ROOM- GARDEN VIEW', cost: 400 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT MARRIOTT MENA HOUSE DELUXE ROOM- GARDEN VIEW', cost: 400 },
      ],
      total: 1528,
    },
  },
]

// Cruise 4NT — Itemized with 35% Profit (sheets 22-26)
const nileCruise4ntProfitPricing = [
  { hotelId: 'hyatt-regency', dayByDay: [
    { day: 1, items: [{ service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / CRZ', cost: 18.90 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2224.80, sglSupplement: { breakdown: [{ description: '1 NT HYATT REGENCY BB', cost: 115 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1 NT HYATT REGENCY BB', cost: 115 }], total: 1212.80 }},
  { hotelId: 'st-regis', dayByDay: [
    { day: 1, items: [{ service: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 362 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / CRZ', cost: 18.90 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 362 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2611.30, sglSupplement: { breakdown: [{ description: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 362 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 362 }], total: 1706.80 }},
  { hotelId: 'four-seasons-superior', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 666 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / CRZ', cost: 18.90 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 666 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 3219.30, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 666 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR RM', cost: 666 }], total: 2314.80 }},
  { hotelId: 'four-seasons-nile-view', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / CRZ', cost: 18.90 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 3427.30, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }], total: 2522.80 }},
  { hotelId: 'marriott-mena-house', dayByDay: [
    { day: 1, items: [{ service: '1NT MARRIOTT MENA HOUSE DELUXE - GARDEN VIEW ROOMS', cost: 540 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / CRZ', cost: 18.90 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT MARRIOTT MENA HOUSE DELUXE - GARDEN VIEW ROOMS', cost: 540 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2967.30, sglSupplement: { breakdown: [{ description: '1NT MARRIOTT MENA HOUSE DELUXE - GARDEN VIEW ROOMS', cost: 540 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT MARRIOTT MENA HOUSE DELUXE - GARDEN VIEW ROOMS', cost: 540 }], total: 2062.80 }},
]

const nileCruiseIncludes = [
  'All transfers in Cairo, Luxor & Aswan',
  '2 Nights Hotel Accommodation based on Bed & Breakfast',
  '4 Nights on board H/S Nebu or similar on Full Board basis starting with lunch and ending with breakfast',
  'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
  'Local English-speaking guide',
]

const nileCruiseExcludes = [
  'Domestic flights tickets CAI/LXR - ASW/CAI at the rate of $320.00 (subject for revision if airfare increase)',
  'Any other tour or services not mentioned in our offer',
]

// ═══════════════════════════════════════════════════════════
// 4. NILE CRUISE + LUXOR OVERNIGHT (1NT Cairo + 1NT Luxor + 4NTS Cruise + 1NT Cairo)
// ═══════════════════════════════════════════════════════════
const nileCruiseLuxorBase = {
  id: 'nile-cruise-luxor-overnight',
  category: 'nile-cruise-luxor',
  name: 'Nile Cruise + Luxor Overnight',
  subtitle: '1NT Cairo + 1NT Luxor + 4NTS Cruise',
  duration: '7 Days / 6 Nights',
  days: 7,
  nights: 6,
  paxBasis: '02 PAX',
  location: 'Cairo, Luxor & Aswan, Egypt',
  status: 'active',
  totalBookings: 15,
  currency: 'USD',
  luxorHotel: { ...luxorHotel },
  cruiseDetails: {
    vessel: 'H/S Nebu',
    route: 'Luxor → Aswan',
    nights: 4,
    board: 'Full Board (starting with lunch, ending with breakfast)',
    cruiseCostPP: 1040,
    cruiseServiceCharge: 265,
    cruiseSglSupplement: 728,
    domesticFlightCost: 320,
  },
  excursions: [
    'Karnak & Luxor Temple',
    'West Bank: Valley of Kings, Hatshepsut & the Colossi of Memnon',
    'Edfu & Kom Ombo Temple',
    'The High Dam, Philae Temple',
    'Felucca around the Kitchener Islands',
  ],
}

const nileCruiseLuxorHotelVariants = [
  {
    hotelId: 'hyatt-regency',
    dayByDay: [
      { day: 1, items: [
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / HTL', cost: 14 },
        { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 120 },
        { service: 'TRSF LXR HTL / CRZ', cost: 11 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 623,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2402,
    sglSupplement: {
      breakdown: [
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 84 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
      ],
      total: 1042,
    },
  },
  {
    hotelId: 'st-regis',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 268 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / HTL', cost: 14 },
        { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 120 },
        { service: 'TRSF LXR HTL / CRZ', cost: 11 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 268 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 723,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 2788,
    sglSupplement: {
      breakdown: [
        { description: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 268 },
        { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 84 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT ST. REGIS DELUXE PARTIAL N. VIEW ROOMS', cost: 268 },
      ],
      total: 1348,
    },
  },
  {
    hotelId: 'four-seasons-superior',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOMS', cost: 493 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / HTL', cost: 14 },
        { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 120 },
        { service: 'TRSF LXR HTL / CRZ', cost: 11 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOMS', cost: 493 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 880,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 3395,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOMS', cost: 493 },
        { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 84 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOMS', cost: 493 },
      ],
      total: 1798,
    },
  },
  {
    hotelId: 'four-seasons-nile-view',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / HTL', cost: 14 },
        { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 120 },
        { service: 'TRSF LXR HTL / CRZ', cost: 11 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 570 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 934,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 3603,
    sglSupplement: {
      breakdown: [
        { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 570 },
        { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 84 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 570 },
      ],
      total: 1952,
    },
  },
  {
    hotelId: 'marriott-mena-house',
    dayByDay: [
      { day: 1, items: [
        { service: '1NT MENA HOUSE DELUXE GARDEN VIEW', cost: 400 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF LXR APT / HTL', cost: 14 },
        { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 120 },
        { service: 'TRSF LXR HTL / CRZ', cost: 11 },
        { service: '4NTS H/S NEBU LXR-ASW', cost: 1040 },
        { service: '4NTS CRZ SS', cost: 265 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / ASW APT', cost: 16 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1NT MENA HOUSE DELUXE GARDEN VIEW', cost: 400 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 815,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 3144,
    sglSupplement: {
      breakdown: [
        { description: '1NT MENA HOUSE DELUXE GARDEN VIEW', cost: 400 },
        { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 84 },
        { description: '4NTS H/S NEBU LXR-ASW', cost: 728 },
        { description: '1NT MENA HOUSE DELUXE GARDEN VIEW', cost: 400 },
      ],
      total: 1612,
    },
  },
]

// Cruise + Luxor — Itemized with 35% Profit (sheets 32-36)
const nileCruiseLuxorProfitPricing = [
  { hotelId: 'hyatt-regency', dayByDay: [
    { day: 1, items: [{ service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / HTL', cost: 18.90 }, { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 162 }, { service: 'TRSF LXR HTL / CRZ', cost: 14.85 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2401.65, sglSupplement: { breakdown: [{ description: '1 NT HYATT REGENCY BB', cost: 115 }, { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 113.40 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1 NT HYATT REGENCY BB', cost: 115 }], total: 1326.20 }},
  { hotelId: 'st-regis', dayByDay: [
    { day: 1, items: [{ service: '1NT ST. REGIS DELUXE PARTIAL NILE VIEW ROOMS', cost: 362 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / HTL', cost: 18.90 }, { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 162 }, { service: 'TRSF LXR HTL / CRZ', cost: 14.85 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT ST. REGIS DELUXE PARTIAL NILE VIEW ROOMS', cost: 362 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 2788.15, sglSupplement: { breakdown: [{ description: '1NT ST. REGIS DELUXE PARTIAL NILE VIEW ROOMS', cost: 362 }, { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 113.40 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT ST. REGIS DELUXE PARTIAL NILE VIEW ROOMS', cost: 362 }], total: 1820.20 }},
  { hotelId: 'four-seasons-superior', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / HTL', cost: 18.90 }, { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 162 }, { service: 'TRSF LXR HTL / CRZ', cost: 14.85 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 3396.15, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }, { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 113.40 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT FOUR SEASONS N. PLAZA SUPERIOR ROOM', cost: 666 }], total: 2428.20 }},
  { hotelId: 'four-seasons-nile-view', dayByDay: [
    { day: 1, items: [{ service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / HTL', cost: 18.90 }, { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 162 }, { service: 'TRSF LXR HTL / CRZ', cost: 14.85 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 3604.15, sglSupplement: { breakdown: [{ description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }, { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 113.40 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT FOUR SEASONS N. PLAZA N. VIEW ROOMS', cost: 770 }], total: 2636.20 }},
  { hotelId: 'marriott-mena-house', dayByDay: [
    { day: 1, items: [{ service: '1NT MARRIOTT MENA HOUSE -DELUXE GARDEN VIEW ROOMS', cost: 540 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF LXR APT / HTL', cost: 18.90 }, { service: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 162 }, { service: 'TRSF LXR HTL / CRZ', cost: 14.85 }, { service: '4NTS H/S NEBU LXR-ASW', cost: 1404 }, { service: '4NTS CRZ SS', cost: 357.75 }] },
    { day: 6, items: [{ service: 'TRF CRZ / ASW APT', cost: 21.60 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1NT MARRIOTT MENA HOUSE -DELUXE GARDEN VIEW ROOMS', cost: 540 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 3144.15, sglSupplement: { breakdown: [{ description: '1NT MARRIOTT MENA HOUSE -DELUXE GARDEN VIEW ROOMS', cost: 540 }, { description: '1 NT SONESTA LXR FRONT N. VIEW ROOMS', cost: 113.40 }, { description: '4NTS H/S NEBU LXR-ASW', cost: 982.80 }, { description: '1NT MARRIOTT MENA HOUSE -DELUXE GARDEN VIEW ROOMS', cost: 540 }], total: 2176.20 }},
]

const nileCruiseLuxorIncludes = [
  'All transfers in Cairo, Luxor & Aswan',
  '2 Nights Hotel Accommodation in Cairo based on Bed & Breakfast',
  '1 Night at Sonesta St. Georges Luxor - Front Nile View Rooms based on Bed & Breakfast',
  '4 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
  'Excursions on board of the boat: Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut & the Colossi of Memnon), Edfu & Kom Ombo Temple, The High Dam, Philae Temple, Felucca around the Kitchener Islands',
  'Local English-speaking guide',
]

// ═══════════════════════════════════════════════════════════
// 5. 3NT CRUISE ASWAN → LUXOR (1NT Cairo + 3NTS Cruise + 1NT Cairo)
// ═══════════════════════════════════════════════════════════
const cruise3ntBase = {
  id: 'cruise-3nt-aswan-luxor',
  category: 'cruise-3nt',
  name: '3-Night Cruise Aswan to Luxor',
  subtitle: '1NT Cairo + 3NTS Cruise Aswan-Luxor',
  duration: '7 Days / 6 Nights',
  days: 7,
  nights: 6,
  paxBasis: '02 PAX',
  location: 'Cairo, Aswan & Luxor, Egypt',
  status: 'active',
  totalBookings: 11,
  currency: 'USD',
  cruiseDetails: {
    vessel: 'H/S Nebu',
    route: 'Aswan → Luxor',
    nights: 3,
    board: 'Full Board (starting with lunch, ending with breakfast)',
    cruiseCostPP: 780,
    cruiseServiceCharge: 243,
    cruiseSglSupplement: 546,
    domesticFlightCost: 320,
  },
  excursions: [
    'The High Dam, Philae Temple',
    'Felucca around the Kitchener Islands',
    'Kom Ombo & Edfu Temple',
    'Karnak & Luxor Temple',
    'West Bank: Valley of Kings, Hatshepsut and the Colossi of Memnon',
  ],
}

const cruise3ntHotelVariants = [
  {
    hotelId: 'hyatt-regency',
    dayByDay: [
      { day: 1, items: [
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 2, items: [
        { service: 'TRSF HTL / CAI APT', cost: 21 },
        { service: 'TRF ASW APT / CRZ', cost: 16 },
        { service: '3NTS H/S NEBU LXR-ASW', cost: 780 },
        { service: '3NTS CRZ SS', cost: 243 },
      ]},
      { day: 6, items: [
        { service: 'TRF CRZ / LXR APT', cost: 14 },
        { service: 'TRSF CAI APT / HTL', cost: 21 },
        { service: '1 NT HYATT REGENCY BB', cost: 125 },
      ]},
      { day: 7, items: [
        { service: 'TRF HTL / APT', cost: 21 },
      ]},
    ],
    sakkHandling: 479,
    sakkHandlingLabel: 'SAKK HANDLING',
    total: 1845,
    sglSupplement: {
      breakdown: [
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
        { description: '3NTS H/S NEBU LXR-ASW', cost: 546 },
        { description: '1 NT HYATT REGENCY BB', cost: 115 },
      ],
      total: 776,
    },
  },
]

// 3NT Cruise — Itemized with 35% Profit (sheet 38)
const cruise3ntProfitPricing = [
  { hotelId: 'hyatt-regency', dayByDay: [
    { day: 1, items: [{ service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 2, items: [{ service: 'TRSF HTL / CAI APT', cost: 28.35 }, { service: 'TRF ASW APT / CRZ', cost: 21.60 }, { service: '3NTS H/S NEBU LXR-ASW', cost: 1053 }, { service: '3NTS CRZ SS', cost: 328.05 }] },
    { day: 6, items: [{ service: 'TRF CRZ / LXR APT', cost: 18.90 }, { service: 'TRSF CAI APT / HTL', cost: 28.35 }, { service: '1 NT HYATT REGENCY BB', cost: 168.75 }] },
    { day: 7, items: [{ service: 'TRF HTL / APT', cost: 28.35 }] },
  ], sakkHandling: 0, total: 1844.10, sglSupplement: { breakdown: [{ description: '1 NT HYATT REGENCY BB', cost: 115 }, { description: '3NTS H/S NEBU LXR-ASW', cost: 737.10 }, { description: '1 NT HYATT REGENCY BB', cost: 115 }], total: 967.10 }},
]

const cruise3ntIncludes = [
  'All transfers in Cairo, Aswan & Luxor',
  '2 Nights at Hyatt Regency Hotel based on Bed & Breakfast',
  '3 Nights on board H/S Nebu or similar based on Full Board basis starting with lunch and ending with breakfast',
  'Excursions on board of the boat: The High Dam, Philae Temple, Felucca around the Kitchener Islands, Kom Ombo & Edfu Temple, Karnak & Luxor Temple, West Bank (Valley of Kings, Hatshepsut and the Colossi of Memnon)',
  'Local English-speaking guide',
]

const cruise3ntExcludes = [
  'Domestic flights tickets CAI/ASW - LXR/CAI at the rate of $320.00 (subject for revision if airfare increase)',
  'Any other tour or services not mentioned in our offer',
]

// ═══════════════════════════════════════════════════════════
// ASSEMBLED ITINERARIES
// ═══════════════════════════════════════════════════════════
export const itineraries = [
  {
    ...mainGroupBase,
    hotelVariants: mainGroupHotelVariants,
    includes: mainGroupIncludes,
    excludes: mainGroupExcludes,
  },
  {
    ...postEventBase,
    hotelVariants: postEventHotelVariants,
    profitPricing: postEventProfitPricing,
    includes: postEventIncludes,
    excludes: postEventExcludes,
  },
  {
    ...nileCruise4ntBase,
    hotelVariants: nileCruise4ntHotelVariants,
    profitPricing: nileCruise4ntProfitPricing,
    includes: nileCruiseIncludes,
    excludes: nileCruiseExcludes,
  },
  {
    ...nileCruiseLuxorBase,
    hotelVariants: nileCruiseLuxorHotelVariants,
    profitPricing: nileCruiseLuxorProfitPricing,
    includes: nileCruiseLuxorIncludes,
    excludes: nileCruiseExcludes,
  },
  {
    ...cruise3ntBase,
    hotelVariants: cruise3ntHotelVariants,
    profitPricing: cruise3ntProfitPricing,
    includes: cruise3ntIncludes,
    excludes: cruise3ntExcludes,
  },
]
