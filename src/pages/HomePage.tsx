import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Repeat, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { RideWithCreator, RideSeriesWithCreator } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { getRideStatus } from '../utils/rideStatus';
import { RideStatusBadge } from '../components/rides/RideStatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { getGuestJoins } from '../utils/guestStorage';
import { TagBadge } from '../components/rides/TagBadge';
import { RIDE_TAGS } from '../lib/rideTags';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

interface SeriesWithNextRide extends RideSeriesWithCreator {
  nextRide?: RideWithCreator;
  participantCount: number;
}

export const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<RideWithCreator[]>([]);
  const [rideParticipantCounts, setRideParticipantCounts] = useState<Record<string, number>>({});
  const [seriesList, setSeriesList] = useState<SeriesWithNextRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const guestJoins = !user ? getGuestJoins() : [];
  const guestRideIds = guestJoins.map((j) => j.rideId);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Always fetch active series (public for everyone)
      const { data: seriesData } = await supabase
        .from('ride_series')
        .select('*, creator:profiles!creator_id(*)')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });

      if (seriesData && seriesData.length > 0) {
        // Generate next ride for each series
        const seriesWithRides: SeriesWithNextRide[] = [];

        for (const s of seriesData) {
          // Generate/get next ride
          const { data: rideId } = await supabase.rpc('generate_next_series_ride', {
            p_series_id: s.id,
          });

          let nextRide: RideWithCreator | undefined;
          let participantCount = 0;

          if (rideId) {
            const { data: rideData } = await supabase
              .from('rides')
              .select('*, creator:profiles!creator_id(*)')
              .eq('id', rideId)
              .single();

            if (rideData) {
              nextRide = rideData as RideWithCreator;

              const { count } = await supabase
                .from('participants')
                .select('*', { count: 'exact', head: true })
                .eq('ride_id', rideId);

              participantCount = count || 0;
            }
          }

          seriesWithRides.push({
            ...(s as RideSeriesWithCreator),
            nextRide,
            participantCount,
          });
        }

        setSeriesList(seriesWithRides);
      }

      // 2. Fetch user's rides (non-series, only created or joined)
      if (user) {
        // Get ride IDs the user has joined
        const { data: participantRows } = await supabase
          .from('participants')
          .select('ride_id')
          .eq('user_id', user.id);

        const joinedRideIds = (participantRows || []).map((p) => p.ride_id);

        // Fetch rides created by user OR joined by user, excluding series rides
        const { data, error } = await supabase
          .from('rides')
          .select('*, creator:profiles!creator_id(*)')
          .is('series_id', null)
          .or(`creator_id.eq.${user.id}${joinedRideIds.length > 0 ? `,id.in.(${joinedRideIds.join(',')})` : ''}`)
          .order('start_datetime', { ascending: true });

        if (!error && data) {
          setRides(data as RideWithCreator[]);

          // Fetch participant counts for these rides
          if (data.length > 0) {
            const counts: Record<string, number> = {};
            for (const r of data) {
              const { count } = await supabase
                .from('participants')
                .select('*', { count: 'exact', head: true })
                .eq('ride_id', r.id);
              counts[r.id] = count || 0;
            }
            setRideParticipantCounts(counts);
          }
        }
      } else if (guestRideIds.length > 0) {
        const { data, error } = await supabase
          .from('rides')
          .select('*, creator:profiles!creator_id(*)')
          .in('id', guestRideIds)
          .order('start_datetime', { ascending: true });

        if (!error && data) {
          setRides(data as RideWithCreator[]);
        }
      }

      setLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  const upcomingRides = rides.filter(
    (r) => getRideStatus(r.start_datetime) === 'upcoming'
  );
  const pastRides = rides.filter(
    (r) => getRideStatus(r.start_datetime) !== 'upcoming'
  );

  const cardStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '12px',
    textDecoration: 'none',
    display: 'block',
    transition: 'border-color 0.2s ease',
    cursor: 'pointer',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
    marginTop: '32px',
  };

  const renderRideCard = (ride: RideWithCreator, dimmed = false) => (
    <Link
      key={ride.id}
      to={`/ride/${ride.id}`}
      style={{ ...cardStyles, ...(dimmed ? { opacity: 0.6 } : {}) }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.borderLight;
        if (dimmed) e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        if (dimmed) e.currentTarget.style.opacity = '0.6';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textPrimary,
              marginBottom: '8px',
            }}
          >
            {ride.title}
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textSecondary,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <MapPin size={14} />
              {ride.start_location}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={14} />
              {formatShortDate(ride.start_datetime)}
            </span>
            {(rideParticipantCounts[ride.id] || 0) > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} />
                {rideParticipantCounts[ride.id]} going
              </span>
            )}
          </div>
        </div>
        <RideStatusBadge status={getRideStatus(ride.start_datetime)} />
      </div>
      {ride.tags && ride.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {ride.tags.map((tag) => (
            <TagBadge key={tag} tagId={tag} />
          ))}
        </div>
      )}
    </Link>
  );

  const renderSeriesCard = (s: SeriesWithNextRide) => (
    <Link
      key={s.id}
      to={s.nextRide ? `/ride/${s.nextRide.id}` : `/series/${s.id}`}
      style={{
        ...cardStyles,
        borderColor: COLORS.accent + '30',
        position: 'relative' as const,
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent + '60';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent + '30';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                color: COLORS.textPrimary,
              }}
            >
              {s.title}
            </h3>
            <Repeat size={14} style={{ color: COLORS.accent, flexShrink: 0 }} />
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textSecondary,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              {s.start_location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {DAY_NAMES[s.day_of_week]}s at {formatTime12h(s.start_time)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} />
              {s.participantCount > 0
                ? `${s.participantCount} ${s.participantCount === 1 ? 'rider' : 'riders'} going`
                : 'Be the first to RSVP'}
            </span>
          </div>
          {s.tags && s.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {s.tags.map((tag) => (
                <TagBadge key={tag} tagId={tag} />
              ))}
            </div>
          )}
          {s.end_date && (
            <p
              style={{
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: 'DM Sans, sans-serif',
                color: COLORS.textMuted,
              }}
            >
              Through {new Date(s.end_date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {s.nextRide && (
            <p
              style={{
                marginTop: '10px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                color: COLORS.accent,
                fontWeight: 600,
              }}
            >
              Next ride: {formatShortDate(s.nextRide.start_datetime)} →
            </p>
          )}
        </div>
      </div>
    </Link>
  );

  // Unauthenticated with no guest joins — show landing with series
  if (!user && guestRideIds.length === 0 && seriesList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textPrimary,
            marginBottom: '16px',
          }}
        >
          rollout
        </h1>
        <p
          style={{
            fontSize: '18px',
            fontFamily: 'DM Sans, sans-serif',
            color: COLORS.textSecondary,
            marginBottom: '40px',
            maxWidth: '480px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Organize group rides, share routes, and ride together.
        </p>
        <div style={{ maxWidth: '320px', margin: '0 auto' }}>
          <GoogleAuthButton />
          <p
            style={{
              marginTop: '16px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textMuted,
            }}
          >
            or{' '}
            <Link
              to="/login"
              style={{
                color: COLORS.textSecondary,
                textDecoration: 'none',
                borderBottom: `1px solid ${COLORS.borderLight}`,
                transition: 'color 0.2s ease',
              }}
            >
              sign in with email
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {!user && (
        <div
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              color: COLORS.textSecondary,
              margin: 0,
              flex: 1,
            }}
          >
            Sign in to create rides and manage your RSVPs
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <GoogleAuthButton />
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textPrimary,
          }}
        >
          {user ? 'Dashboard' : 'rollout'}
        </h1>
        {user && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/series/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Repeat size={16} />
              New Series
            </Button>
            <Button
              onClick={() => navigate('/ride/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} />
              New Ride
            </Button>
          </div>
        )}
      </div>

      {/* Filter chips */}
      {seriesList.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '24px',
            marginBottom: '8px',
          }}
        >
          <button
            onClick={() => setActiveFilter(null)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              color: activeFilter === null ? COLORS.textPrimary : COLORS.textMuted,
              backgroundColor: activeFilter === null ? COLORS.borderLight : 'transparent',
              border: `1px solid ${activeFilter === null ? COLORS.borderLight : COLORS.border}`,
            }}
          >
            All
          </button>
          {RIDE_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveFilter(activeFilter === tag.id ? null : tag.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: activeFilter === tag.id ? tag.color : COLORS.textMuted,
                backgroundColor: activeFilter === tag.id ? tag.color + '18' : 'transparent',
                border: `1px solid ${activeFilter === tag.id ? tag.color + '50' : COLORS.border}`,
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}

      {/* Weekly Rides Section - always visible */}
      {seriesList.length > 0 && (
        <>
          <h2 style={sectionTitleStyles}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Repeat size={14} />
              Weekly Rides
            </span>
          </h2>
          {seriesList
            .filter((s) => !activeFilter || (s.tags && s.tags.includes(activeFilter)))
            .map((s) => renderSeriesCard(s))}
          {seriesList.filter((s) => !activeFilter || (s.tags && s.tags.includes(activeFilter))).length === 0 && (
            <p style={{ fontSize: '14px', color: COLORS.textMuted, fontFamily: 'DM Sans, sans-serif', padding: '20px 0' }}>
              No weekly rides match this filter.
            </p>
          )}
        </>
      )}

      {/* Personal rides section */}
      {(rides.length > 0 || user) && (
        <>
          {upcomingRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>
                {user ? 'Your Upcoming Rides' : 'Your Rides'}
              </h2>
              {upcomingRides.map((ride) => renderRideCard(ride))}
            </>
          )}

          {pastRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>Past Rides</h2>
              {pastRides.map((ride) => renderRideCard(ride, true))}
            </>
          )}

          {user && rides.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: COLORS.textSecondary,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <p style={{ fontSize: '14px', color: COLORS.textMuted }}>
                No one-off rides yet. Create one or RSVP to a weekly ride above.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
