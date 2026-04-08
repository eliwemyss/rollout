import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { RideSeries } from '../types';
import { SeriesForm, SeriesFormData } from '../components/rides/SeriesForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const EditSeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<RideSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSeries = async () => {
      const { data, error } = await supabase
        .from('ride_series')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setSeries(data as RideSeries);
      }
      setLoading(false);
    };

    fetchSeries();
  }, [id]);

  useEffect(() => {
    if (!loading && series && user) {
      const isCreator = user.id === series.creator_id;
      if (!isCreator && !isAdmin) {
        navigate(`/series/${id}`);
      }
    }
  }, [loading, series, user, isAdmin]);

  const handleSubmit = async (formData: SeriesFormData) => {
    if (!id) return;

    const { error } = await supabase
      .from('ride_series')
      .update({
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time + ':00',
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
        pace: formData.pace || null,
        route_link: formData.route_link || null,
        tags: formData.tags.length > 0 ? formData.tags : [],
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    navigate(`/series/${id}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!series) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: COLORS.textSecondary,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Series not found
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textPrimary,
          marginBottom: '24px',
        }}
      >
        Edit Series
      </h1>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <SeriesForm
          initialData={series}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
};
