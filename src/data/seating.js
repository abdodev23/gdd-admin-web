/**
 * Seating data generator for Gala de Danza at the Grand Egyptian Museum.
 *
 * Sections (display order: closest to stage first):
 *   - vip:     300 seats — Premium   (10 rows A-J × 30 seats)
 *   - vvip:    150 seats — VVIP      (5 rows A-E × 30 seats)
 *   - general: 1140 seats — General  (20 rows A-T × 57 seats)
 *
 * Approximately 20% of seats are randomly marked as 'sold' for demo purposes.
 */

const SEED = 2026;

function seededRandom(seed) {
  let s = seed;
  return function next() {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateRowLabels(count) {
  const labels = [];
  for (let i = 0; i < count; i++) {
    if (i < 26) {
      labels.push(String.fromCharCode(65 + i));
    } else {
      const first = String.fromCharCode(65 + Math.floor((i - 26) / 26));
      const second = String.fromCharCode(65 + ((i - 26) % 26));
      labels.push(first + second);
    }
  }
  return labels;
}

function buildSection(sectionId, totalSeats, seatsPerRow, random) {
  const rowCount = Math.ceil(totalSeats / seatsPerRow);
  const rowLabels = generateRowLabels(rowCount);
  const seats = [];
  let remaining = totalSeats;

  for (let r = 0; r < rowCount; r++) {
    const seatsInThisRow = Math.min(seatsPerRow, remaining);
    for (let s = 1; s <= seatsInThisRow; s++) {
      seats.push({
        id: `${sectionId}-${rowLabels[r]}-${s}`,
        section: sectionId,
        row: rowLabels[r],
        number: s,
        status: random() < 0.2 ? 'sold' : 'available',
      });
    }
    remaining -= seatsInThisRow;
  }

  return seats;
}

export function generateSeats() {
  const random = seededRandom(SEED);

  const vip = buildSection('vip', 300, 30, random);
  const vvip = buildSection('vvip', 150, 30, random);
  const general = buildSection('general', 1140, 57, random);

  return {
    vip: {
      id: 'vip',
      name: 'Premium',
      totalSeats: 300,
      seats: vip,
      availableCount: vip.filter((s) => s.status === 'available').length,
      soldCount: vip.filter((s) => s.status === 'sold').length,
    },
    vvip: {
      id: 'vvip',
      name: 'VVIP',
      totalSeats: 150,
      seats: vvip,
      availableCount: vvip.filter((s) => s.status === 'available').length,
      soldCount: vvip.filter((s) => s.status === 'sold').length,
    },
    general: {
      id: 'general',
      name: 'General',
      totalSeats: 1140,
      seats: general,
      availableCount: general.filter((s) => s.status === 'available').length,
      soldCount: general.filter((s) => s.status === 'sold').length,
    },
  };
}

export const seatingData = generateSeats();

export default seatingData;
