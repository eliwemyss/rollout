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

export const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<RideWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*, creator:profiles!creator_id(*)')
        .order('start_datetime', { ascending: true });

      if (!error && data) {
        setRides(data as RideWithCreator[]);
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

  if (!user) {
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
        <Button onClick={() => navigate('/login')}>Get Started</Button>
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          Dashboard
        </h1>
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
            Create your first ride to get started.
          </p>
        </div>
      ) : (
        <>
          {upcomingRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>Upcoming</h2>
              {upcomingRides.map((ride) => (
                <Link
                  key={ride.id}
                  to={`/ride/${ride.id}`}
                  style={cardStyles}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.borderLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.border)
                  }
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
                    <RideStatusBadge
                      status={getRideStatus(ride.start_datetime)}
                    />
                  </div>
                </Link>
              ))}
            </>
          )}

          {pastRides.length > 0 && (
            <>
              <h2 style={sectionTitleStyles}>Past Rides</h2>
              {pastRides.map((ride) => (
                <Link
                  key={ride.id}
                  to={`/ride/${ride.id}`}
                  style={{ ...cardStyles, opacity: 0.6 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderLight;
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.opacity = '0.6';
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
                    <RideStatusBadge
                      status={getRideStatus(ride.start_datetime)}
                    />
                  </div>
                </Link>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};
