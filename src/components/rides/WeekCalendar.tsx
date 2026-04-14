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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

  // Group rides by day index
  const ridesByDay: Record<number, RideWithCreator[]> = {};
  for (let i = 0; i < 7; i++) ridesByDay[i] = [];
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
      {/* Week navigation */}
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

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          const dayRides = ridesByDay[i];
          const isPast = date < today && !isToday;
          const hasRides = dayRides.length > 0;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '0',
                opacity: isPast ? 0.4 : 1,
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${isToday ? COLORS.accent + '40' : COLORS.border}`,
                backgroundColor: COLORS.card,
                minHeight: hasRides ? 'auto' : '48px',
              }}
            >
              {/* Day label column */}
              <div
                style={{
                  width: '80px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 0',
                  borderRight: `1px solid ${isToday ? COLORS.accent + '25' : COLORS.border}`,
                  backgroundColor: isToday ? COLORS.accent + '08' : 'transparent',
                }}
              >
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
                  {DAY_NAMES[date.getDay()].slice(0, 3)}
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isToday ? COLORS.accent : hasRides ? COLORS.textPrimary : COLORS.textMuted,
                    lineHeight: 1.1,
                    marginTop: '2px',
                  }}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Rides area */}
              <div style={{ flex: 1, padding: hasRides ? '8px 12px' : '0 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                {dayRides.map((ride) => (
                  <Link
                    key={ride.id}
                    to={`/ride/${ride.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: dayRides.length > 1 ? '8px 12px' : '6px 0',
                      borderRadius: dayRides.length > 1 ? '8px' : '0',
                      backgroundColor: dayRides.length > 1 ? COLORS.dark : 'transparent',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.dark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = dayRides.length > 1 ? COLORS.dark : 'transparent';
                    }}
                  >
                    {/* Time */}
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: COLORS.accent,
                        whiteSpace: 'nowrap',
                        width: '90px',
                        flexShrink: 0,
                      }}
                    >
                      {formatTime12h(ride.start_datetime)}
                    </div>

                    {/* Ride info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          fontFamily: 'DM Sans, sans-serif',
                          color: COLORS.textPrimary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ride.title}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '3px',
                          fontSize: '13px',
                          fontFamily: 'DM Sans, sans-serif',
                          color: COLORS.textSecondary,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <MapPin size={12} style={{ flexShrink: 0 }} />
                          {ride.start_location}
                        </span>
                        {(participantCounts[ride.id] || 0) > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <Users size={12} />
                            {participantCounts[ride.id]} going
                          </span>
                        )}
                        {ride.coffee_shop_name && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffb800', flexShrink: 0 }}>
                            <Coffee size={12} />
                            {ride.coffee_shop_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {ride.tags && ride.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {ride.tags.slice(0, 2).map((tag) => (
                          <TagBadge key={tag} tagId={tag} size="sm" />
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
                {!hasRides && (
                  <span
                    style={{
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      color: COLORS.textMuted,
                      fontStyle: 'italic',
                    }}
                  >
                    No rides
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
