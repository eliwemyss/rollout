import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Bike, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { Profile, RideWithCreator } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

type Tab = 'overview' | 'users' | 'rides';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [rides, setRides] = useState<RideWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const [usersRes, ridesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase
        .from('rides')
        .select('*, creator:profiles!creator_id(*)')
        .order('created_at', { ascending: false }),
    ]);

    if (usersRes.data) setUsers(usersRes.data as Profile[]);
    if (ridesRes.data) setRides(ridesRes.data as RideWithCreator[]);
    setLoading(false);
  };

  const toggleAdmin = async (profile: Profile) => {
    const newStatus = !profile.is_admin;
    setConfirmAction({
      title: newStatus ? 'Promote to Admin' : 'Remove Admin',
      message: newStatus
        ? `Make ${profile.full_name} an admin? They'll have full control over the app.`
        : `Remove admin access from ${profile.full_name}?`,
      onConfirm: async () => {
        await supabase
          .from('profiles')
          .update({ is_admin: newStatus })
          .eq('id', profile.id);
        setConfirmAction(null);
        fetchData();
      },
    });
  };

  const deleteRide = async (ride: RideWithCreator) => {
    setConfirmAction({
      title: 'Delete Ride',
      message: `Delete "${ride.title}" by ${ride.creator?.full_name || 'Unknown'}? This cannot be undone.`,
      onConfirm: async () => {
        await supabase.from('rides').delete().eq('id', ride.id);
        setConfirmAction(null);
        fetchData();
      },
    });
  };

  const deleteUser = async (profile: Profile) => {
    if (profile.id === user?.id) return;
    setConfirmAction({
      title: 'Remove User',
      message: `Remove ${profile.full_name} (${profile.email})? This will delete their profile and all their rides.`,
      onConfirm: async () => {
        await supabase.from('profiles').delete().eq('id', profile.id);
        setConfirmAction(null);
        fetchData();
      },
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return null;

  const totalUsers = users.length;
  const totalRides = rides.length;
  const totalAdmins = users.filter((u) => u.is_admin).length;

  const tabStyles = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? COLORS.accent : 'transparent',
    color: active ? COLORS.black : COLORS.textSecondary,
  });

  const statCardStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '24px',
    flex: 1,
    minWidth: '150px',
  };

  const tableRowStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Shield size={24} color={COLORS.accent} />
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: COLORS.textPrimary,
          }}
        >
          Admin
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          backgroundColor: COLORS.dark,
          padding: '4px',
          borderRadius: '12px',
          width: 'fit-content',
        }}
      >
        <button style={tabStyles(tab === 'overview')} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button style={tabStyles(tab === 'users')} onClick={() => setTab('users')}>
          Users
        </button>
        <button style={tabStyles(tab === 'rides')} onClick={() => setTab('rides')}>
          Rides
        </button>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={statCardStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Users size={20} color={COLORS.accent} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: COLORS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Total Users
              </span>
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: COLORS.textPrimary,
              }}
            >
              {totalUsers}
            </div>
          </div>

          <div style={statCardStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Bike size={20} color={COLORS.accent} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: COLORS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Total Rides
              </span>
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: COLORS.textPrimary,
              }}
            >
              {totalRides}
            </div>
          </div>

          <div style={statCardStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield size={20} color={COLORS.accent} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: COLORS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Admins
              </span>
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: COLORS.textPrimary,
              }}
            >
              {totalAdmins}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {users.map((u) => (
            <div key={u.id} style={tableRowStyles}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      fontFamily: 'DM Sans, sans-serif',
                      color: COLORS.textPrimary,
                    }}
                  >
                    {u.full_name}
                  </span>
                  {u.is_admin && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: COLORS.accent,
                        backgroundColor: COLORS.accentGlow,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textSecondary,
                  }}
                >
                  {u.email}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button
                  variant="ghost"
                  onClick={() => toggleAdmin(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  {u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  {u.is_admin ? 'Demote' : 'Promote'}
                </Button>
                {u.id !== user?.id && (
                  <Button
                    variant="danger"
                    onClick={() => deleteUser(u)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rides' && (
        <div>
          {rides.map((ride) => (
            <div key={ride.id} style={tableRowStyles}>
              <div
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => navigate(`/ride/${ride.id}`)}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textPrimary,
                    marginBottom: '4px',
                  }}
                >
                  {ride.title}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textSecondary,
                  }}
                >
                  {ride.creator?.full_name || 'Unknown'} · {formatShortDate(ride.start_datetime)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/ride/${ride.id}/edit`)}
                  style={{ fontSize: '12px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteRide(ride)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {rides.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                padding: '40px',
                color: COLORS.textMuted,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              No rides yet.
            </p>
          )}
        </div>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Confirm"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};
