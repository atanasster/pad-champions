export interface ScreeningEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  zip: string;
  type: 'Barbershop' | 'Community Center' | 'Church' | 'Pharmacy';
  coordinates: { lat: number; lng: number };
}

export interface QuizQuestion {
  id: number;
  text: string;
  weight: number; // Higher weight means higher risk
}

export interface NavItem {
  label: string;
  path: string;
}
