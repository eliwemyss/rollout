import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { RideForm, RideFormData } from '../components/rides/RideForm';

export const NewRidePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: RideFormData) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rides')
      .insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
        pace: formData.pace || null,
        route_link: formData.route_link || null,
        tags: formData.tags.length > 0 ? formData.tags : [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      navigate(`/ride/${data.id}`);
    }
  };

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
      <h1 style={titleStyles}>Create New Ride</h1>
      <div style={cardStyles}>
        <RideForm onSubmit={handleSubmit} submitLabel="Create Ride" />
      </div>
    </div>
  );
};
