import { useState, FormEvent } from 'react';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { COLORS } from '../../lib/colors';
import { RideSeries } from '../../types';
import { TagPicker } from './TagPicker';

interface SeriesFormProps {
  initialData?: Partial<RideSeries>;
  onSubmit: (data: SeriesFormData) => Promise<void>;
  submitLabel?: string;
}

export interface SeriesFormData {
  title: string;
  description: string;
  start_location: string;
  day_of_week: number;
  start_time: string;
  distance_miles: string;
  pace: string;
  route_link: string;
  tags: string[];
  start_date: string;
  end_date: string;
  coffee_shop_name: string;
  coffee_shop_address: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SeriesForm = ({
  initialData,
  onSubmit,
  submitLabel = 'Create Series',
}: SeriesFormProps) => {
  const [formData, setFormData] = useState<SeriesFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start_location: initialData?.start_location || '',
    day_of_week: initialData?.day_of_week ?? 2, // Default to Tuesday
    start_time: initialData?.start_time?.slice(0, 5) || '18:00',
    distance_miles: initialData?.distance_miles?.toString() || '',
    pace: initialData?.pace || '',
    route_link: initialData?.route_link || '',
    tags: initialData?.tags || [],
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    coffee_shop_name: initialData?.coffee_shop_name || '',
    coffee_shop_address: initialData?.coffee_shop_address || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.name === 'day_of_week' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const missing: string[] = [];
    if (!formData.title.trim()) missing.push('Series Name');
    if (!formData.start_location.trim()) missing.push('Meet-up Location');
    if (!formData.start_time) missing.push('Start Time');
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const selectStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    backgroundColor: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    color: COLORS.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <ErrorMessage message={error} />}
      <Input
        type="text"
        name="title"
        label="Series Name"
        placeholder="SABCo Tuesday Night Ride"
        value={formData.title}
        onChange={handleChange}
        required
        autoFocus
      />
      <TextArea
        name="description"
        label="Description"
        placeholder="Weekly group ride, all paces welcome..."
        value={formData.description}
        onChange={handleChange}
      />
      <Input
        type="text"
        name="start_location"
        label="Meet-up Location"
        placeholder="Shelby Ave Bicycle Co, Nashville TN"
        value={formData.start_location}
        onChange={handleChange}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyles}>
            Day of Week
            <span style={{ color: COLORS.accent, marginLeft: '4px' }}>*</span>
          </label>
          <select
            name="day_of_week"
            value={formData.day_of_week}
            onChange={handleChange}
            style={selectStyles}
          >
            {DAY_NAMES.map((day, i) => (
              <option key={i} value={i} style={{ backgroundColor: COLORS.dark }}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <Input
          type="time"
          name="start_time"
          label="Start Time"
          value={formData.start_time}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          type="date"
          name="start_date"
          label="Season Start"
          value={formData.start_date}
          onChange={handleChange}
          helperText="Leave blank to start immediately"
        />
        <Input
          type="date"
          name="end_date"
          label="Season End"
          value={formData.end_date}
          onChange={handleChange}
          helperText="Leave blank for evergreen"
        />
      </div>

      <Input
        type="number"
        name="distance_miles"
        label="Distance (miles)"
        placeholder="Optional"
        value={formData.distance_miles}
        onChange={handleChange}
        step="0.1"
        min="0.1"
        helperText="Approximate ride distance"
      />
      <Input
        type="text"
        name="pace"
        label="Pace"
        placeholder="e.g., Casual, 12-15 mph, No Drop"
        value={formData.pace}
        onChange={handleChange}
        helperText="Expected riding pace or difficulty"
      />
      <Input
        type="url"
        name="route_link"
        label="Route Link"
        placeholder="Paste a Strava, RideWithGPS, or Google Maps link"
        value={formData.route_link}
        onChange={handleChange}
      />
      <TagPicker
        selected={formData.tags}
        onChange={(tags) => setFormData({ ...formData, tags })}
      />
      {formData.tags.includes('cafe') && (
        <>
          <Input
            type="text"
            name="coffee_shop_name"
            label="Coffee Shop"
            placeholder="e.g., Barista Parlor"
            value={formData.coffee_shop_name}
            onChange={handleChange}
            helperText="Where you're stopping for coffee"
          />
          <Input
            type="text"
            name="coffee_shop_address"
            label="Coffee Shop Address"
            placeholder="e.g., 519 Gallatin Ave, Nashville"
            value={formData.coffee_shop_address}
            onChange={handleChange}
          />
        </>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
};
