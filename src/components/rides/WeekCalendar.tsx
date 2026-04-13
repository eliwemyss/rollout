import { Link } from 'react-router-dom';
import { MapPin, Users, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import { COLORS } from '../../lib/colors';
import { RideWithCreator } from '../../types';
import { TagBadge } from './TagBadge';

interface WeekCalendarProps {
  rides: RideWithCreator[];
  participantCounts: Record<string, number>;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getWeekDates = (offset: number): Date[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatTime12h = (dateStr: string) => {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const WeekCalendar = ({ rides, participantCounts, weekOffset, onWeekChange }: WeekCalendarProps) => {
  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group rides by day of week index (0-6, Mon-Sun mapped)
  const ridesByDay: Record<number, RideWithCreator[]> = {};
  for (let i = 0; i < 7; i++) {
    ridesByDay[i] = [];
  }
  rides.forEach((ride) => {
    const rideDate = new Date(ride.start_datetime);
    for (let i = 0; i < 7; i++) {
      if (isSameDay(rideDate, weekDates[i])) {
        ridesByDay[i].push(ride);
        break;
      }
    }
  });

  // Week range label
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const rangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}`
      : `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}`;

  return (
    <div>
      {/* Week navigation header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={16} color={COLORS.textSecondary} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: COLORS.textPrimary,
            }}
          >
            {rangeLabel}
          </span>
          {weekOffset !== 0 && (
            <button
              onClick={() => onWeekChange(0)}
              style={{
                background: 'none',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                padding: '3px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: COLORS.accent,
              }}
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={16} color={COLORS.textSecondary} />
        </button>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          const dayRides = ridesByDay[i];
          const isPast = date < today && !isToday;

          return (
            <div
              key={i}
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${isToday ? COLORS.accent + '50' : COLORS.border}`,
                borderRadius: '12px',
                padding: '10px 8px',
                minHeight: '120px',
                opacity: isPast ? 0.5 : 1,
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Day header */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isToday ? COLORS.accent : COLORS.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {DAY_NAMES_SHORT[date.getDay()]}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isToday ? COLORS.accent : COLORS.textPrimary,
                    marginTop: '2px',
                  }}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Rides for this day */}
              {dayRides.map((ride) => (
                <Link
                  key={ride.id}
                  to={`/ride/${ride.id}`}
                  style={{
                    display: 'block',
                    backgroundColor: COLORS.dark,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    padding: '8px',
                    marginBottom: '4px',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'DM Sans, sans-serif',
                      color: COLORS.textPrimary,
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ride.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: COLORS.accent,
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    {formatTime12h(ride.start_datetime)}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: COLORS.textMuted,
                      fontFamily: 'DM Sans, sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <MapPin size={10} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ride.start_location}
                    </span>
                  </div>
                  {(participantCounts[ride.id] || 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: COLORS.textMuted,
                        fontFamily: 'DM Sans, sans-serif',
                        marginTop: '3px',
                      }}
                    >
                      <Users size={10} />
                      {participantCounts[ride.id]}
                    </div>
                  )}
                  {ride.coffee_shop_name && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#ffb800',
                        fontFamily: 'DM Sans, sans-serif',
                        marginTop: '3px',
                      }}
                    >
                      <Coffee size={10} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ride.coffee_shop_name}
                      </span>
                    </div>
                  )}
                  {ride.tags && ride.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                      {ride.tags.slice(0, 2).map((tag) => (
                        <TagBadge key={tag} tagId={tag} size="sm" />
                      ))}
                    </div>
                  )}
                </Link>
              ))}

              {dayRides.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px 0',
                    fontSize: '11px',
                    color: COLORS.textMuted,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
