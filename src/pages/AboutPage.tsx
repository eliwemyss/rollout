import { Link } from 'react-router-dom';
import { Github, MessageCircle } from 'lucide-react';
import { COLORS } from '../lib/colors';

export const AboutPage = () => {
  const sectionStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '12px',
  };

  const textStyles: React.CSSProperties = {
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textSecondary,
    lineHeight: 1.7,
  };

  const linkStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '12px',
    border: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textPrimary,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto' }}>
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: COLORS.textPrimary,
          marginBottom: '8px',
        }}
      >
        About Rollout
      </h1>
      <p
        style={{
          fontSize: '15px',
          fontFamily: 'DM Sans, sans-serif',
          color: COLORS.textMuted,
          marginBottom: '32px',
        }}
      >
        Group ride RSVP, no signup required.
      </p>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>What is this?</h2>
        <p style={textStyles}>
          Rollout is a simple way to organize group rides. Create a ride, share the
          link, and see who's rolling. No Strava account needed — anyone can RSVP
          with just a name. Recurring weekly rides auto-generate a fresh RSVP list
          each week so organizers don't have to recreate the same ride every time.
        </p>
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>Who's it for?</h2>
        <p style={textStyles}>
          Built for the Nashville cycling community — but it works for any group
          ride anywhere. Whether it's a Tuesday night hammerfest, a Saturday
          morning coffee ride, or a one-off gravel adventure, Rollout handles the
          "who's coming?" part so you can focus on riding.
        </p>
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>Got feedback?</h2>
        <p style={{ ...textStyles, marginBottom: '20px' }}>
          This is actively being built and your ideas shape what comes next.
          Found a bug? Want a feature? Have an opinion about ride categories?
          Let us know.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/feedback"
            style={linkStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.backgroundColor = COLORS.accentGlow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.borderLight;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <MessageCircle size={16} />
            Send Feedback
          </Link>
          <a
            href="https://github.com/eliwemyss/rollout"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.backgroundColor = COLORS.accentGlow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.borderLight;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>

      <p
        style={{
          fontSize: '13px',
          fontFamily: 'DM Sans, sans-serif',
          color: COLORS.textMuted,
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        Made in Nashville
      </p>
    </div>
  );
};
