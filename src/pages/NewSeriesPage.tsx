import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { SeriesForm, SeriesFormData } from '../components/rides/SeriesForm';

export const NewSeriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: SeriesFormData) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ride_series')
      .insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time + ':00', // HH:MM -> HH:MM:SS
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
        pace: formData.pace || null,
        route_link: formData.route_link || null,
        tags: formData.tags.length > 0 ? formData.tags : [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      // Generate the first ride occurrence
      await supabase.rpc('generate_next_series_ride', { p_series_id: data.id });
      navigate(`/series/${data.id}`);
    }
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
        Create Recurring Ride
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
        Set up a weekly ride that shows up on the homepage. A new RSVP list
        auto-generates each week.
      </p>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <SeriesForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
