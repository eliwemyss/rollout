import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Bike, Trash2, ShieldCheck, ShieldOff, MessageCircle, CheckCircle, Eye, X, Archive, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { COLORS } from '../lib/colors';
import { Profile, RideWithCreator, Feedback } from '../types';
import { formatShortDate } from '../utils/dateHelpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

type Tab = 'overview' | 'users' | 'rides' | 'feedback';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [rides, setRides] = useState<RideWithCreator[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
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
    const [usersRes, ridesRes, feedbackRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase
        .from('rides')
        .select('*, creator:profiles!creator_id(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (usersRes.data) setUsers(usersRes.data as Profile[]);
    if (ridesRes.data) setRides(ridesRes.data as RideWithCreator[]);
    if (feedbackRes.data) setFeedbackItems(feedbackRes.data as Feedback[]);
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
  const newFeedback = feedbackItems.filter((f) => f.status === 'new').length;

  const updateFeedbackStatus = async (id: string, status: string) => {
    await supabase.from('feedback').update({ status }).eq('id', id);
    fetchData();
  };

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
        <button
          style={{
            ...tabStyles(tab === 'feedback'),
            position: 'relative' as const,
          }}
          onClick={() => setTab('feedback')}
        >
          Feedback
          {feedbackItems.filter((f) => f.status === 'new').length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: COLORS.danger,
              }}
            />
          )}
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

          <div style={statCardStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <MessageCircle size={20} color={COLORS.accent} />
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
                New Feedback
              </span>
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: newFeedback > 0 ? COLORS.accent : COLORS.textPrimary,
              }}
            >
              {newFeedback}
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

      {tab === 'feedback' && (() => {
        const activeFeedback = feedbackItems.filter((f) => f.status === 'new' || f.status === 'reviewed');
        const completedFeedback = feedbackItems.filter((f) => f.status === 'done' || f.status === 'dismissed');

        const renderFeedbackCard = (fb: Feedback, isCompleted: boolean) => {
          const typeColors: Record<string, string> = {
            bug: COLORS.danger,
            feature: COLORS.accent,
            general: COLORS.warning,
          };
          const typeColor = typeColors[fb.type] || COLORS.textMuted;

          return (
            <div
              key={fb.id}
              style={{
                ...tableRowStyles,
                flexDirection: 'column',
                alignItems: 'stretch',
                opacity: fb.status === 'dismissed' ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: typeColor,
                      backgroundColor: typeColor + '18',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      border: `1px solid ${typeColor}30`,
                    }}
                  >
                    {fb.type}
                  </span>
                  {fb.status === 'new' && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: COLORS.accent,
                        textTransform: 'uppercase',
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {fb.status === 'done' && (
                    <CheckCircle size={14} color={COLORS.accent} />
                  )}
                  {fb.status === 'dismissed' && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: COLORS.textMuted,
                        textTransform: 'uppercase',
                      }}
                    >
                      DISMISSED
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textMuted,
                  }}
                >
                  {new Date(fb.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  color: COLORS.textPrimary,
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                {fb.message}
              </p>

              {fb.contact_info && (
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textMuted,
                    marginBottom: '8px',
                  }}
                >
                  Contact: {fb.contact_info}
                </p>
              )}

              {fb.user_id && (
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: COLORS.textMuted,
                    marginBottom: '8px',
                  }}
                >
                  From: {users.find((u) => u.id === fb.user_id)?.full_name || fb.user_id}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {fb.status === 'new' && (
                  <Button
                    variant="ghost"
                    onClick={() => updateFeedbackStatus(fb.id, 'reviewed')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <Eye size={14} />
                    Mark Reviewed
                  </Button>
                )}
                {(fb.status === 'new' || fb.status === 'reviewed') && (
                  <Button
                    variant="ghost"
                    onClick={() => updateFeedbackStatus(fb.id, 'done')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <CheckCircle size={14} />
                    Done
                  </Button>
                )}
                {isCompleted && (
                  <Button
                    variant="ghost"
                    onClick={() => updateFeedbackStatus(fb.id, 'new')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <RotateCcw size={14} />
                    Reopen
                  </Button>
                )}
                {!isCompleted && fb.status !== 'dismissed' && (
                  <Button
                    variant="danger"
                    onClick={() => updateFeedbackStatus(fb.id, 'dismissed')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <X size={14} />
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          );
        };

        return (
          <div>
            {feedbackItems.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: COLORS.textMuted,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                No feedback yet.
              </p>
            ) : (
              <>
                {activeFeedback.length === 0 && completedFeedback.length > 0 && (
                  <p
                    style={{
                      textAlign: 'center',
                      padding: '32px',
                      color: COLORS.textMuted,
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    All caught up — no active feedback.
                  </p>
                )}

                {activeFeedback.map((fb) => renderFeedbackCard(fb, false))}

                {completedFeedback.length > 0 && (
                  <div style={{ marginTop: activeFeedback.length > 0 ? '24px' : '0' }}>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '8px',
                      }}
                    >
                      {showCompleted ? (
                        <ChevronDown size={16} color={COLORS.textMuted} />
                      ) : (
                        <ChevronRight size={16} color={COLORS.textMuted} />
                      )}
                      <Archive size={14} color={COLORS.textMuted} />
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
                        Completed ({completedFeedback.length})
                      </span>
                    </button>

                    {showCompleted && completedFeedback.map((fb) => renderFeedbackCard(fb, true))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

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
