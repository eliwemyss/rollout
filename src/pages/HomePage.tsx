import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { RideWithCreator } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { getRideStatus } from '../utils/rideStatus';
import { RideStatusBadge } from '../components/rides/RideStatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { getGuestJoins } from '../utils/guestStorage';

export const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<RideWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  const guestJoins = !user ? getGuestJoins() : [];
  const guestRideIds = guestJoins.map((j) => j.rideId);

  useEffect(() => {
    const fetchRides = async () => {
      if (user) {
        // Authenticated: fetch all rides
        const { data, error } = await supabase
          .from('rides')
          .select('*, creator:profiles!creator_id(*)')
          .order('start_datetime', { ascending: true });

        if (!error && data) {
          setRides(data as RideWithCreator[]);
        }
      } else if (guestRideIds.length > 0) {
        // Guest with joins: fetch only their rides
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
      fetchRides();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  // Unauthenticated user with no guest joins — show landing page
  if (!user && guestRideIds.length === 0) {
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
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Create Account
          </Button>
        </div>
      </div>
    );
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
          </div>
        </div>
        <RideStatusBadge status={getRideStatus(ride.start_datetime)} />
      </div>
    </Link>
  );

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
            Sign in to see all upcoming rides and create your own
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Create Account
            </Button>
          </div>
        </div>
      )}

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
          {user ? 'Dashboard' : 'Your Rides'}
        </h1>
        {user && (
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
        )}
      </div>

      {rides.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: COLORS.textSecondary,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            No rides yet.
          </p>
          <p style={{ fontSize: '14px', color: COLORS.textMuted }}>
            {user
              ? 'Create your first ride to get started.'
              : 'Join a ride via a shared link to see it here.'}
          </p>
        </div>
      ) : (
        <>
          {upcomingRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>Upcoming</h2>
              {upcomingRides.map((ride) => renderRideCard(ride))}
            </>
          )}

          {pastRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>Past Rides</h2>
              {pastRides.map((ride) => renderRideCard(ride, true))}
            </>
          )}
        </>
      )}
    </div>
  );
};
