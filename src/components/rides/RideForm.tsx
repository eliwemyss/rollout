import { useState, FormEvent } from 'react';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { DateTimePicker } from './DateTimePicker';
import { Ride } from '../../types';

interface RideFormProps {
  initialData?: Partial<Ride>;
  onSubmit: (data: RideFormData) => Promise<void>;
  submitLabel?: string;
}

export interface RideFormData {
  title: string;
  description: string;
  start_location: string;
  start_datetime: string;
  distance_miles: string;
  pace: string;
  route_link: string;
}

export const RideForm = ({
  initialData,
  onSubmit,
  submitLabel = 'Create Ride',
}: RideFormProps) => {
  const [formData, setFormData] = useState<RideFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start_location: initialData?.start_location || '',
    start_datetime: initialData?.start_datetime
      ? new Date(initialData.start_datetime).toISOString().slice(0, 16)
      : '',
    distance_miles: initialData?.distance_miles?.toString() || '',
    pace: initialData?.pace || '',
    route_link: initialData?.route_link || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const missing: string[] = [];
    if (!formData.title.trim()) missing.push('Ride Title');
    if (!formData.start_location.trim()) missing.push('Start Location');
    if (!formData.start_datetime) missing.push('Date & Time');
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

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <ErrorMessage message={error} />}
      <Input
        type="text"
        name="title"
        label="Ride Title"
        placeholder="Sunday Morning Roll"
        value={formData.title}
        onChange={handleChange}
        required
        autoFocus
      />
      <TextArea
        name="description"
        label="Description"
        placeholder="Casual ride through the city..."
        value={formData.description}
        onChange={handleChange}
      />
      <Input
        type="text"
        name="start_location"
        label="Start Location"
        placeholder="Central Park, Main Entrance"
        value={formData.start_location}
        onChange={handleChange}
        required
      />
      <DateTimePicker
        value={formData.start_datetime}
        onChange={(val) => setFormData({ ...formData, start_datetime: val })}
        required
      />
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
        placeholder="e.g., Casual, 12-15 mph"
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
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
};
