export interface RideTag {
  id: string;
  label: string;
  color: string; // accent color for the pill
}

export const RIDE_TAGS: RideTag[] = [
  { id: 'road', label: 'Road', color: '#00ff87' },
  { id: 'gravel', label: 'Gravel', color: '#c084fc' },
  { id: 'mtb', label: 'MTB', color: '#ff6b35' },
  { id: 'cafe', label: 'Cafe Ride', color: '#ffb800' },
  { id: 'no-drop', label: 'No Drop', color: '#00b4ff' },
  { id: 'drop', label: 'Drop Ride', color: '#ff4444' },
  { id: 'beginner', label: 'Beginner Friendly', color: '#34d399' },
];

export const getTagById = (id: string): RideTag | undefined =>
  RIDE_TAGS.find((t) => t.id === id);
