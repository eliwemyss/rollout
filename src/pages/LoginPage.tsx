import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../lib/colors';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { popGuestRedirect } from '../utils/guestStorage';

export const LoginPage = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [searchParams] = useSearchParams();
  const authError = searchParams.get('error');

  if (user) {
    const guestRedirect = popGuestRedirect();
    return <Navigate to={guestRedirect ? `/ride/${guestRedirect}` : '/'} replace />;
  }

  const containerStyles: React.CSSProperties = {
    maxWidth: '440px',
    margin: '60px auto',
    padding: '20px',
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '32px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 800,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '8px',
    textAlign: 'center',
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '15px',
    color: COLORS.textSecondary,
    fontFamily: 'DM Sans, sans-serif',
    marginBottom: '32px',
    textAlign: 'center',
  };

  const toggleContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    backgroundColor: COLORS.dark,
    padding: '4px',
    borderRadius: '12px',
  };

  const toggleButtonStyles = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? COLORS.accent : 'transparent',
    color: active ? COLORS.black : COLORS.textSecondary,
  });

  const dividerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  };

  const lineStyles: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: COLORS.border,
  };

  const dividerTextStyles: React.CSSProperties = {
    fontSize: '13px',
    color: COLORS.textMuted,
    fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        {authError === 'auth_failed' && (
          <ErrorMessage message="Google sign-in failed. Please try again." />
        )}
        <h1 style={titleStyles}>
          {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
        </h1>
        <p style={subtitleStyles}>
          {mode === 'signin'
            ? 'Sign in to manage your rides'
            : 'Create an account to start organizing rides'}
        </p>

        <div style={toggleContainerStyles}>
          <button
            style={toggleButtonStyles(mode === 'signin')}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            style={toggleButtonStyles(mode === 'signup')}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? <LoginForm /> : <SignUpForm />}

        <div style={dividerStyles}>
          <div style={lineStyles} />
          <span style={dividerTextStyles}>or</span>
          <div style={lineStyles} />
        </div>

        <GoogleAuthButton />
      </div>
    </div>
  );
};
