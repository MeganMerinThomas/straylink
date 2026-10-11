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

// ── Submission UI state (for the submit flow) ───────────────────────
export type SubmissionState = 'idle' | 'sending' | 'success' | 'failure';

// ── Report (from the database) ──────────────────────────────────────
export type ReportDbStatus = 'Reported' | 'Claimed' | 'En Route' | 'Collected' | 'At Vet';

export interface Report {
  id: string;
  user_id: string;
  animal_type: AnimalType;
  condition: AnimalCondition;
  description: string;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ReportDbStatus;
  rescuer_id: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
}

// ── Profile (from the backend) ──────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

// ── Auth response (from the backend) ────────────────────────────────
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: Profile;
}
