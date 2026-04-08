export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface RideSeries {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  start_location: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string; // HH:MM:SS
  distance_miles?: number;
  pace?: string;
  route_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RideSeriesWithCreator extends RideSeries {
  creator?: Profile;
}

export interface Ride {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  start_location: string;
  start_datetime: string;
  distance_miles?: number;
  pace?: string;
  route_link?: string;
  series_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  ride_id: string;
  user_id?: string;
  guest_name?: string;
  joined_at: string;
}

export interface RideWithCreator extends Ride {
  creator?: Profile;
}

export interface ParticipantWithProfile extends Participant {
  profile?: Profile;
}

export type RideStatus = "upcoming" | "ongoing" | "completed";

export interface Tip {
  id: string;
  ride_id: string;
  tipper_user_id: string;
  ride_creator_id: string;
  amount_cents: number;
  stripe_session_id?: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}
