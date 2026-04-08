import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, MapPin, Clock, Repeat, Users, ChevronLeft, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { RideSeriesWithCreator, RideWithCreator } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { getRideStatus } from '../utils/rideStatus';
import { RideStatusBadge } from '../components/rides/RideStatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TagBadge } from '../components/rides/TagBadge';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const SeriesDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<RideSeriesWithCreator | null>(null);
  const [upcomingRide, setUpcomingRide] = useState<RideWithCreator | null>(null);
  const [pastRides, setPastRides] = useState<RideWithCreator[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSeries = async () => {
      // Fetch series info
      const { data: seriesData, error: seriesError } = await supabase
        .from('ride_series')
        .select('*, creator:profiles!creator_id(*)')
        .eq('id', id)
        .single();

      if (seriesError || !seriesData) {
        setLoading(false);
        return;
      }

      setSeries(seriesData as RideSeriesWithCreator);

      // Generate/get the next ride occurrence
      const { data: rideId } = await supabase.rpc('generate_next_series_ride', {
        p_series_id: id,
      });

      // Fetch all rides for this series
      const { data: ridesData } = await supabase
        .from('rides')
        .select('*, creator:profiles!creator_id(*)')
        .eq('series_id', id)
        .order('start_datetime', { ascending: false });

      if (ridesData) {
        const now = new Date();
        const upcoming = ridesData.find(
          (r) => getRideStatus(r.start_datetime) === 'upcoming'
        );
        const past = ridesData.filter(
          (r) => getRideStatus(r.start_datetime) !== 'upcoming'
        );

        setUpcomingRide((upcoming as RideWithCreator) || null);
        setPastRides(past as RideWithCreator[]);

        // Get participant count for upcoming ride
        if (upcoming) {
          const { count } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('ride_id', upcoming.id);
          setParticipantCount(count || 0);
        }
      }

      setLoading(false);
    };

    fetchSeries();
  }, [id]);

  const isCreator = user && series && user.id === series.creator_id;
  const canManage = isCreator || isAdmin;

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from('ride_series').delete().eq('id', id);
    if (!error) {
      navigate('/');
    }
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

  const infoItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textSecondary,
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: COLORS.textSecondary,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          padding: '0',
          marginBottom: '20px',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.textPrimary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textSecondary)}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Series Header */}
      <div style={cardStyles}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <Repeat size={14} style={{ color: COLORS.accent }} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: COLORS.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Weekly Series
          </span>
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textPrimary,
            marginBottom: '4px',
          }}
        >
          {series.title}
        </h1>

        {series.tags && series.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', marginTop: '8px' }}>
            {series.tags.map((tag) => (
              <TagBadge key={tag} tagId={tag} size="md" />
            ))}
          </div>
        )}

        {series.creator && (
          <p
            style={{
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textMuted,
              marginBottom: '16px',
            }}
          >
            Organized by {series.creator.full_name}
          </p>
        )}

        {series.description && (
          <p
            style={{
              fontSize: '15px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textSecondary,
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            {series.description}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <span style={infoItemStyles}>
            <MapPin size={16} style={{ color: COLORS.textMuted, flexShrink: 0 }} />
            {series.start_location}
          </span>
          <span style={infoItemStyles}>
            <Repeat size={16} style={{ color: COLORS.textMuted, flexShrink: 0 }} />
            Every {DAY_NAMES[series.day_of_week]}
          </span>
          <span style={infoItemStyles}>
            <Clock size={16} style={{ color: COLORS.textMuted, flexShrink: 0 }} />
            {formatTime12h(series.start_time)}
          </span>
        </div>

        {(series.pace || series.distance_miles) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '12px',
            }}
          >
            {series.pace && (
              <span style={infoItemStyles}>Pace: {series.pace}</span>
            )}
            {series.distance_miles && (
              <span style={infoItemStyles}>
                {series.distance_miles} miles
              </span>
            )}
          </div>
        )}

        {series.route_link && (
          <div style={{ marginTop: '16px' }}>
            <a
              href={series.route_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: `1px solid ${COLORS.borderLight}`,
                color: COLORS.accent,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'border-color 0.2s ease',
              }}
            >
              View Route →
            </a>
          </div>
        )}

        {canManage && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(`/series/${id}/edit`)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit2 size={16} />
              Edit Series
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Upcoming Ride CTA */}
      {upcomingRide && (
        <Link
          to={`/ride/${upcomingRide.id}`}
          style={{
            display: 'block',
            textDecoration: 'none',
            backgroundColor: COLORS.accentGlow,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            transition: 'background-color 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: COLORS.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                This Week's Ride
              </p>
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  fontFamily: 'DM Sans, sans-serif',
                  color: COLORS.textPrimary,
                  marginBottom: '6px',
                }}
              >
                {formatShortDate(upcomingRide.start_datetime)}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  color: COLORS.textSecondary,
                }}
              >
                <Users size={14} />
                {participantCount} {participantCount === 1 ? 'rider' : 'riders'} rolling
              </div>
            </div>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: COLORS.accent,
                color: COLORS.black,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              RSVP →
            </div>
          </div>
        </Link>
      )}

      {/* Past Rides */}
      {pastRides.length > 0 && (
        <>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: COLORS.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px',
              marginTop: '32px',
            }}
          >
            Past Rides
          </h2>
          {pastRides.map((ride) => (
            <Link
              key={ride.id}
              to={`/ride/${ride.id}`}
              style={{
                display: 'block',
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '8px',
                textDecoration: 'none',
                opacity: 0.6,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textSecondary,
                  }}
                >
                  <Calendar size={14} />
                  {formatShortDate(ride.start_datetime)}
                </span>
                <RideStatusBadge status={getRideStatus(ride.start_datetime)} />
              </div>
            </Link>
          ))}
        </>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Series"
          message="Are you sure you want to delete this recurring ride? Future rides will no longer be generated. Past rides will remain."
          confirmText="Delete Series"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
