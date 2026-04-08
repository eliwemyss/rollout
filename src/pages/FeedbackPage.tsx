import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bug, Lightbulb, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { FeedbackType } from '../types';
import { TextArea } from '../components/common/TextArea';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';

const FEEDBACK_TYPES: { id: FeedbackType; label: string; icon: typeof Bug; description: string }[] = [
  { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Something broken or not working right' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'An idea for something new' },
  { id: 'general', label: 'General', icon: MessageCircle, description: 'Anything else on your mind' },
];

export const FeedbackPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<FeedbackType>('feature');
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Please write a message');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      type,
      message: message.trim(),
      contact_info: contactInfo.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '540px', margin: '80px auto', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: COLORS.accentGlow,
            border: `2px solid ${COLORS.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle size={28} color={COLORS.accent} />
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textPrimary,
            marginBottom: '12px',
          }}
        >
          Thanks for the feedback!
        </h1>
        <p
          style={{
            fontSize: '15px',
            fontFamily: 'DM Sans, sans-serif',
            color: COLORS.textSecondary,
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          We read every submission and it directly shapes what gets built next.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/')}>Back to Rides</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setContactInfo('');
              setType('feature');
            }}
          >
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textPrimary,
          marginBottom: '8px',
        }}
      >
        Feedback
      </h1>
      <p
        style={{
          fontSize: '15px',
          fontFamily: 'DM Sans, sans-serif',
          color: COLORS.textSecondary,
          marginBottom: '28px',
          lineHeight: 1.5,
        }}
      >
        Found a bug? Have an idea? We're building this for riders like you — tell
        us what would make Rollout better.
      </p>

      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {error && <ErrorMessage message={error} />}

          {/* Type selector */}
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: COLORS.textMuted,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            What kind of feedback?
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            {FEEDBACK_TYPES.map((ft) => {
              const isActive = type === ft.id;
              const Icon = ft.icon;
              return (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => setType(ft.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '14px 8px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: isActive ? COLORS.accentGlow : 'transparent',
                    border: `1px solid ${isActive ? COLORS.accent + '50' : COLORS.border}`,
                    color: isActive ? COLORS.accent : COLORS.textMuted,
                  }}
                >
                  <Icon size={20} />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {ft.label}
                  </span>
                </button>
              );
            })}
          </div>

          <TextArea
            name="message"
            label="Your Message"
            placeholder={
              type === 'bug'
                ? "What happened? What did you expect to happen?"
                : type === 'feature'
                  ? "What would you like to see in Rollout?"
                  : "What's on your mind?"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ minHeight: '120px' }}
          />

          {!user && (
            <Input
              type="text"
              name="contact_info"
              label="How can we reach you?"
              placeholder="Email, IG handle, or leave blank"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              helperText="Optional — in case we need to follow up"
            />
          )}

          {user && profile && (
            <p
              style={{
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                color: COLORS.textMuted,
                marginBottom: '20px',
              }}
            >
              Submitting as {profile.full_name}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Send size={16} />
            {loading ? 'Sending...' : 'Submit Feedback'}
          </Button>
        </form>
      </div>
    </div>
  );
};
