import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { SeriesForm, SeriesFormData } from '../components/rides/SeriesForm';
import { useRide } from '../hooks/useRide';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RideSeries } from '../types';

export const ConvertToSeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ride, loading } = useRide(id);

  const handleSubmit = async (formData: SeriesFormData) => {
    if (!user || !id) return;

    // 1. Create the series
    const { data: series, error: seriesError } = await supabase
      .from('ride_series')
      .insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time + ':00',
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
        pace: formData.pace || null,
        route_link: formData.route_link || null,
        tags: formData.tags.length > 0 ? formData.tags : [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      })
      .select()
      .single();

    if (seriesError) throw new Error(seriesError.message);

    // 2. Link the existing ride to this series
    const { error: linkError } = await supabase
      .from('rides')
      .update({ series_id: series.id })
      .eq('id', id);

    if (linkError) throw new Error(linkError.message);

    // 3. Generate the next ride occurrence
    await supabase.rpc('generate_next_series_ride', { p_series_id: series.id });

    navigate(`/series/${series.id}`);
  };

  if (loading) return <LoadingSpinner />;

  if (!ride) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textSecondary }}>
        Ride not found
      </div>
    );
  }

  // Derive the day of week from the ride's start_datetime
  const rideDate = new Date(ride.start_datetime);
  const dayOfWeek = rideDate.getDay();

  // Extract time as HH:MM in local time
  const hours = rideDate.getHours().toString().padStart(2, '0');
  const minutes = rideDate.getMinutes().toString().padStart(2, '0');
  const startTime = `${hours}:${minutes}`;

  // Pre-fill from the existing ride
  const initialData: Partial<RideSeries> = {
    title: ride.title,
    description: ride.description,
    start_location: ride.start_location,
    day_of_week: dayOfWeek,
    start_time: startTime,
    distance_miles: ride.distance_miles,
    pace: ride.pace,
    route_link: ride.route_link,
    tags: ride.tags || [],
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textPrimary,
          marginBottom: '8px',
        }}
      >
        Make It a Series
      </h1>
      <p
        style={{
          fontSize: '15px',
          fontFamily: 'DM Sans, sans-serif',
          color: COLORS.textSecondary,
          marginBottom: '24px',
          lineHeight: 1.5,
        }}
      >
        Convert <strong style={{ color: COLORS.textPrimary }}>{ride.title}</strong> into a
        weekly recurring ride. The existing ride and its RSVPs will be linked to the new series.
      </p>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <SeriesForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Convert to Series"
        />
      </div>
    </div>
  );
};
