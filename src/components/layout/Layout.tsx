import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../lib/colors';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: `1px solid ${COLORS.border}`,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 800,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.accent,
    textDecoration: 'none',
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const navButtonStyles: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    color: COLORS.textSecondary,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const mainStyles: React.CSSProperties = {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div>
      <header style={headerStyles}>
        <Link to="/" style={logoStyles}>
          rollout
        </Link>
        <nav style={navStyles}>
          <Link
            to="/about"
            style={{ ...navButtonStyles, textDecoration: 'none' }}
          >
            About
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    ...navButtonStyles,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              <button style={navButtonStyles} onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" style={{ ...navButtonStyles, textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </nav>
      </header>
      <main style={mainStyles}>{children}</main>
    </div>
  );
};
