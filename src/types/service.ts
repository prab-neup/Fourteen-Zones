export const ServiceAvailability = {
  Available: 'available',
  Limited: 'limited',
  Unavailable: 'unavailable',
} as const;

export type ServiceAvailability =
  (typeof ServiceAvailability)[keyof typeof ServiceAvailability];

export const ServiceCategory = {
  Cleaning: 'cleaning',
  Plumbing: 'plumbing',
  Electrical: 'electrical',
  Wellness: 'wellness',
  Tutoring: 'tutoring',
  Moving: 'moving',
} as const;

export type ServiceCategory = (typeof ServiceCategory)[keyof typeof ServiceCategory];

export type Provider = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  provider: Provider;
  /** Integer minor units (8500 + USD = $85.00). Avoids float rounding. */
  price: number;
  currency: string;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  availability: ServiceAvailability;
};

export type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

export type ServiceAvailabilityDay = {
  serviceId: string;
  date: string;
  slots: TimeSlot[];
};
