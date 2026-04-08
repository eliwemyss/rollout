import { MapPin, Calendar, Gauge, Route, ExternalLink } from 'lucide-react';
import { RideWithCreator } from '../../types';
import { COLORS } from '../../lib/colors';
import { formatRideDateTime } from '../../utils/dateHelpers';
import { getRideStatus } from '../../utils/rideStatus';
import { RideStatusBadge } from './RideStatusBadge';
import { TagBadge } from './TagBadge';

interface RideDetailsProps {
  ride: RideWithCreator;
}

export const RideDetails = ({ ride }: RideDetailsProps) => {
  const status = getRideStatus(ride.start_datetime);

  const containerStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: '20px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '12px',
  };

  const creatorStyles: React.CSSProperties = {
    fontSize: '14px',
    color: COLORS.textSecondary,
    fontFamily: 'DM Sans, sans-serif',
    marginBottom: '12px',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '15px',
    color: COLORS.textSecondary,
    fontFamily: 'DM Sans, sans-serif',
    lineHeight: 1.6,
    marginTop: '16px',
    marginBottom: '20px',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  };

  const infoItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  };

  const iconContainerStyles: React.CSSProperties = {
    padding: '8px',
    backgroundColor: COLORS.accentGlow,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const infoTextStyles: React.CSSProperties = {
    flex: 1,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textPrimary,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>{ride.title}</h1>
        <div style={creatorStyles}>
          Created by {ride.creator?.full_name || 'Unknown'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <RideStatusBadge status={status} />
          {ride.tags && ride.tags.map((tag) => (
            <TagBadge key={tag} tagId={tag} size="md" />
          ))}
        </div>
      </div>

      {ride.description && (
        <p style={descriptionStyles}>{ride.description}</p>
      )}

      <div style={gridStyles}>
        <div style={infoItemStyles}>
          <div style={iconContainerStyles}>
            <MapPin size={20} color={COLORS.accent} />
          </div>
          <div style={infoTextStyles}>
            <div style={labelStyles}>Start Location</div>
            <div style={valueStyles}>{ride.start_location}</div>
          </div>
        </div>

        <div style={infoItemStyles}>
          <div style={iconContainerStyles}>
            <Calendar size={20} color={COLORS.accent} />
          </div>
          <div style={infoTextStyles}>
            <div style={labelStyles}>Date & Time</div>
            <div style={valueStyles}>{formatRideDateTime(ride.start_datetime)}</div>
          </div>
        </div>

        {ride.distance_miles && (
          <div style={infoItemStyles}>
            <div style={iconContainerStyles}>
              <Route size={20} color={COLORS.accent} />
            </div>
            <div style={infoTextStyles}>
              <div style={labelStyles}>Distance</div>
              <div style={valueStyles}>{ride.distance_miles} miles</div>
            </div>
          </div>
        )}

        {ride.pace && (
          <div style={infoItemStyles}>
            <div style={iconContainerStyles}>
              <Gauge size={20} color={COLORS.accent} />
            </div>
            <div style={infoTextStyles}>
              <div style={labelStyles}>Pace</div>
              <div style={valueStyles}>{ride.pace}</div>
            </div>
          </div>
        )}
      </div>

      {ride.route_link && (
        <div style={{ marginTop: '20px' }}>
          <a
            href={ride.route_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: COLORS.accent,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textDecoration: 'none',
            }}
          >
            VIEW ROUTE
            <ExternalLink size={14} color={COLORS.accent} />
          </a>
        </div>
      )}
    </div>
  );
};
