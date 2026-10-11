// ── Screen identifiers ──────────────────────────────────────────────
export type Screen =
  | 'onboarding'
  | 'home'
  | 'report-location'
  | 'report-details'
  | 'confirmation';

// ── User role ───────────────────────────────────────────────────────
export type UserRole = 'reporter' | 'rescuer' | 'pet-owner';

// ── Onboarding form data ────────────────────────────────────────────
export interface UserData {
  phoneOrEmail: string;
  password: string;
  role: UserRole;
}

// ── Report form data ────────────────────────────────────────────────
export interface LocationData {
  lat: number;
  lng: number;
  label: string;           // human-readable label for display
}

export type AnimalCondition = 'Injured' | 'Sick' | 'Healthy';
export type AnimalType      = 'Dog' | 'Cat' | 'Other';

export interface ReportData {
  location: LocationData | null;
  condition: AnimalCondition;
  animalType: AnimalType;
  description: string;
}

// ── Submission outcome ──────────────────────────────────────────────
export type ReportStatus = 'idle' | 'sending' | 'success' | 'failure';
