import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { COLORS } from '../lib/colors';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled.current) return;

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        handled.current = true;
        subscription.unsubscribe();

        const user = session.user;

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email ?? '',
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User',
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
        }

        navigate('/', { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      if (!handled.current) {
        handled.current = true;
        subscription.unsubscribe();
        navigate('/login?error=auth_failed', { replace: true });
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
      }}
    >
      <LoadingSpinner />
      <p
        style={{
          color: COLORS.textSecondary,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
        }}
      >
        Signing you in...
      </p>
    </div>
  );
};
