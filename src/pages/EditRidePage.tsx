import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRide } from '../hooks/useRide';
import { COLORS } from '../lib/colors';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RideForm, RideFormData } from '../components/rides/RideForm';

export const EditRidePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { ride, loading } = useRide(id);

  useEffect(() => {
    if (!loading && ride && user && ride.creator_id !== user.id && !isAdmin) {
      navigate(`/ride/${id}`);
    }
  }, [ride, user, loading, id, navigate]);

  const handleSubmit = async (formData: RideFormData) => {
    if (!id) return;

    const { error } = await supabase
      .from('rides')
      .update({
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
        pace: formData.pace || null,
        route_link: formData.route_link || null,
        tags: formData.tags.length > 0 ? formData.tags : [],
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    navigate(`/ride/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ride) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: COLORS.textSecondary,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Ride not found
      </div>
    );
  }

  const containerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '40px auto',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 800,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '24px',
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '32px',
  };

  return (
    <div style={containerStyles}>
      <h1 style={titleStyles}>Edit Ride</h1>
      <div style={cardStyles}>
        <RideForm
          initialData={ride}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
};
