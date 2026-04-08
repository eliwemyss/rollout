export interface RideTag {
  id: string;
  label: string;
  color: string; // accent color for the pill
}

export const RIDE_TAGS: RideTag[] = [
  { id: 'social', label: 'Social', color: '#00ff87' },
  { id: 'cafe', label: 'Cafe Ride', color: '#ffb800' },
  { id: 'no-drop', label: 'No Drop', color: '#00b4ff' },
  { id: 'drop', label: 'Drop Ride', color: '#ff4444' },
  { id: 'gravel', label: 'Gravel', color: '#c084fc' },
  { id: 'training', label: 'Training', color: '#ff6b35' },
  { id: 'mtb', label: 'MTB', color: '#8b6914' },
];

export const getTagById = (id: string): RideTag | undefined =>
  RIDE_TAGS.find((t) => t.id === id);
