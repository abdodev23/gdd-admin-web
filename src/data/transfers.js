// Transfer routes — each route contains its own list of available cars with per-route prices.
export const transferRoutes = [
  {
    id: 'hotel-airport',
    label: 'Hotel → Airport',
    cars: [
      { carId: 'sedan', carName: 'Comfortable Sedan', maxPassengers: 4, price: 80, image: '/images/dance/MEL_5841.jpg' },
      { carId: 'mercedes', carName: 'Mercedes S-Class S600', maxPassengers: 3, price: 120, image: '/images/dance/MEL_6960.jpg' },
      { carId: 'bmw', carName: 'BMW 7 Series', maxPassengers: 4, price: 100, image: '/images/dance/MEL_4520.jpg' },
      { carId: 'van', carName: 'Luxury Van (up to 8 pax)', maxPassengers: 8, price: 160, image: '/images/dance/MEL_7010.jpg' },
      { carId: 'bus', carName: 'Group Transfer Bus', maxPassengers: 30, price: 200, image: '/images/dance/MEL_4520.jpg' },
    ],
  },
  {
    id: 'airport-hotel',
    label: 'Airport → Hotel',
    cars: [
      { carId: 'sedan', carName: 'Comfortable Sedan', maxPassengers: 4, price: 80, image: '/images/dance/MEL_5841.jpg' },
      { carId: 'mercedes', carName: 'Mercedes S-Class S600', maxPassengers: 3, price: 120, image: '/images/dance/MEL_6960.jpg' },
      { carId: 'bmw', carName: 'BMW 7 Series', maxPassengers: 4, price: 100, image: '/images/dance/MEL_4520.jpg' },
      { carId: 'van', carName: 'Luxury Van (up to 8 pax)', maxPassengers: 8, price: 160, image: '/images/dance/MEL_7010.jpg' },
      { carId: 'bus', carName: 'Group Transfer Bus', maxPassengers: 30, price: 200, image: '/images/dance/MEL_4520.jpg' },
    ],
  },
  {
    id: 'hotel-event',
    label: 'Hotel → Event & Back',
    cars: [
      { carId: 'sedan', carName: 'Comfortable Sedan', maxPassengers: 4, price: 100, image: '/images/dance/MEL_5841.jpg' },
      { carId: 'mercedes', carName: 'Mercedes S-Class S600', maxPassengers: 3, price: 180, image: '/images/dance/MEL_6960.jpg' },
      { carId: 'bmw', carName: 'BMW 7 Series', maxPassengers: 4, price: 150, image: '/images/dance/MEL_4520.jpg' },
      { carId: 'van', carName: 'Luxury Van (up to 8 pax)', maxPassengers: 8, price: 220, image: '/images/dance/MEL_7010.jpg' },
      { carId: 'bus', carName: 'Group Transfer Bus', maxPassengers: 30, price: 280, image: '/images/dance/MEL_4520.jpg' },
    ],
  },
]

// Legacy export kept for compatibility
export const transfers = []
