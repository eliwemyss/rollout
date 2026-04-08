import { useState, useEffect } from 'react';
import { COLORS } from '../../lib/colors';

interface DateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
  required?: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const min = m.toString().padStart(2, '0');
      slots.push(`${hour}:${min} ${ampm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const parseTimeSlot = (slot: string): { hours: number; minutes: number } => {
  const [time, ampm] = slot.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (ampm === 'PM' && h !== 12) hours += 12;
  if (ampm === 'AM' && h === 12) hours = 0;
  return { hours, minutes: m };
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getDayOfWeek = (year: number, month: number, day: number) =>
  new Date(year, month, day).getDay();

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DateTimePicker = ({ value, onChange, required }: DateTimePickerProps) => {
  const now = new Date();
  const parsed = value ? new Date(value) : null;

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(parsed?.getDate() ?? null);
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (!parsed) return '9:00 AM';
    const h = parsed.getHours();
    const m = Math.round(parsed.getMinutes() / 15) * 15;
    const hour = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  });

  useEffect(() => {
    if (selectedDay !== null) {
      const { hours, minutes } = parseTimeSlot(selectedTime);
      const d = new Date(viewYear, viewMonth, selectedDay, hours, minutes);
      onChange(d.toISOString().slice(0, 16));
    }
  }, [selectedDay, selectedTime, viewYear, viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getDayOfWeek(viewYear, viewMonth, 1);
  const today = new Date();
  const isToday = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const navBtnStyles: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    padding: '6px 12px',
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
  };

  const monthLabelStyles: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  };

  const dayHeaderStyles: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    padding: '4px 0',
  };

  const dayBtnStyles = (day: number): React.CSSProperties => {
    const selected = day === selectedDay;
    return {
      background: selected ? COLORS.accent : 'transparent',
      color: selected ? COLORS.black : isToday(day) ? COLORS.accent : COLORS.textPrimary,
      border: isToday(day) && !selected ? `1px solid ${COLORS.accent}` : '1px solid transparent',
      borderRadius: '8px',
      padding: '8px 0',
      fontSize: '13px',
      fontWeight: selected || isToday(day) ? 700 : 400,
      fontFamily: 'DM Sans, sans-serif',
      cursor: 'pointer',
      textAlign: 'center',
    };
  };

  const timeContainerStyles: React.CSSProperties = {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const timeLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  };

  const selectStyles: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textPrimary,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  return (
    <div>
      <label style={labelStyles}>
        Date & Time {required && '*'}
      </label>
      <div style={containerStyles}>
        <div style={navStyles}>
          <button type="button" style={navBtnStyles} onClick={prevMonth}>&larr;</button>
          <span style={monthLabelStyles}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button type="button" style={navBtnStyles} onClick={nextMonth}>&rarr;</button>
        </div>

        <div style={gridStyles}>
          {DAY_LABELS.map((d) => (
            <div key={d} style={dayHeaderStyles}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            return (
              <button
                key={day}
                type="button"
                style={dayBtnStyles(day)}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div style={timeContainerStyles}>
          <span style={timeLabelStyles}>Time</span>
          <select
            style={selectStyles}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
