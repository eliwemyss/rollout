import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Edit2, Trash2, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useRide } from '../hooks/useRide';
import { useParticipants } from '../hooks/useParticipants';
import { COLORS } from '../lib/colors';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RideDetails } from '../components/rides/RideDetails';
import { ShareLinkSection } from '../components/rides/ShareLinkSection';
import { JoinRideForm } from '../components/rides/JoinRideForm';
import { ParticipantList } from '../components/rides/ParticipantList';
import { TipLeaderButton } from '../components/rides/TipLeaderButton';
import { saveGuestJoin, saveGuestRedirect, getGuestJoins } from '../utils/guestStorage';

export const RideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { ride, loading: rideLoading } = useRide(id);
  const { participants, refetch: refetchParticipants } = useParticipants(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [tipBanner, setTipBanner] = useState<'success' | 'cancelled' | null>(null);
  const [joinToast, setJoinToast] = useState(false);

  useEffect(() => {
    const tipParam = searchParams.get('tip');
    const tipId = searchParams.get('tip_id');
    const sessionId = searchParams.get('session_id');

    if (tipParam === 'success') {
      setTipBanner('success');
      if (tipId && sessionId) {
        supabase
          .from('tips')
          .update({ status: 'completed' })
          .eq('id', tipId)
          .then(() => {});
      }
      const next = new URLSearchParams(searchParams);
      next.delete('tip');
      next.delete('tip_id');
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    } else if (tipParam === 'cancelled') {
      setTipBanner('cancelled');
      const next = new URLSearchParams(searchParams);
      next.delete('tip');
      setSearchParams(next, { replace: true });
    }
  }, []);

  const isCreator = user && ride && user.id === ride.creator_id;
  const guestJoinedThisRide = !user && id
    ? getGuestJoins().some((j) => j.rideId === id)
    : false;
  const hasJoined = participants.some(
    (p) => p.user_id === user?.id || (user && p.guest_name === profile?.full_name)
  ) || guestJoinedThisRide;
  const myParticipant = participants.find((p) => p.user_id === user?.id);

  const handleJoin = async (guestName?: string) => {
    if (!id) return;

    const { data: insertedRow, error } = await supabase
      .from('participants')
      .insert({
        ride_id: id,
        user_id: user?.id || null,
        guest_name: guestName || null,
      })
      .select('id')
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        throw new Error('You have already joined this ride');
      }
      throw new Error(error.message);
    }

    // If this was a guest join, cache info in localStorage for account linking
    if (!user && guestName && insertedRow) {
      saveGuestJoin({
        participantId: insertedRow.id,
        rideId: id,
        guestName: guestName,
        joinedAt: new Date().toISOString(),
      });
    }

    setShowJoinForm(false);
    refetchParticipants();
    setJoinToast(true);
    setTimeout(() => setJoinToast(false), 3000);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (!error) {
      refetchParticipants();
    }
  };

  const handleDeleteRide = async () => {
    if (!id) return;

    const { error } = await supabase.from('rides').delete().eq('id', id);

    if (!error) {
      navigate('/');
    }
  };

  if (rideLoading) {
    return <LoadingSpinner />;
  }

  if (!ride) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: COLORS.textSecondary,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Ride not found
      </div>
    );
  }

  const actionBarStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  };

  const joinSectionStyles: React.CSSProperties = {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    color: COLORS.textPrimary,
    marginBottom: '16px',
  };

  const creatorName = ride?.creator?.full_name ?? 'the ride leader';
  const showTipButton = !isCreator && ride?.creator_id;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {user && (
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: COLORS.textSecondary,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            padding: '0',
            marginBottom: '20px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.textPrimary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textSecondary)}
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      )}

      {joinToast && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: COLORS.accentGlow,
            border: `1px solid ${COLORS.accent}`,
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '15px',
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            You're in! See you on the ride.
          </span>
          <button
            onClick={() => setJoinToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.accent,
              display: 'flex',
              padding: '0',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {tipBanner === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: COLORS.accentGlow,
            border: `1px solid ${COLORS.accent}`,
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '15px',
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            Thanks for buying the leader a coffee! You're a legend.
          </span>
          <button
            onClick={() => setTipBanner(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.accent,
              display: 'flex',
              padding: '0',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {tipBanner === 'cancelled' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255,184,0,0.08)',
            border: `1px solid ${COLORS.warning}`,
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '15px',
              color: COLORS.warning,
              fontWeight: 600,
            }}
          >
            No worries - maybe next time!
          </span>
          <button
            onClick={() => setTipBanner(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.warning,
              display: 'flex',
              padding: '0',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {isCreator && (
        <>
          <div style={actionBarStyles}>
            <Button
              variant="ghost"
              onClick={() => navigate(`/ride/${id}/edit`)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit2 size={16} />
              Edit Ride
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trash2 size={16} />
              Delete Ride
            </Button>
          </div>
          <ShareLinkSection rideId={id!} />
        </>
      )}

      <RideDetails ride={ride} />

      {!hasJoined && (
        <div style={joinSectionStyles}>
          <h3 style={sectionTitleStyles}>
            {isCreator ? 'Rejoin Your Ride' : 'Join This Ride'}
          </h3>
          {showJoinForm ? (
            <JoinRideForm
              onJoin={handleJoin}
              isAuthenticated={!!user}
              userFullName={profile?.full_name}
            />
          ) : (
            <Button
              onClick={() => {
                if (user) {
                  handleJoin();
                } else {
                  setShowJoinForm(true);
                }
              }}
              fullWidth
            >
              {isCreator ? 'Rejoin Ride' : 'Join Ride'}
            </Button>
          )}
          {!user && (
            <p
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: COLORS.textMuted,
              }}
            >
              Want to see all upcoming rides?{' '}
              <Link
                to="/login"
                onClick={() => { if (id) saveGuestRedirect(id); }}
                style={{
                  color: COLORS.textSecondary,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  transition: 'color 0.2s ease',
                }}
              >
                Create a free account →
              </Link>
            </p>
          )}
        </div>
      )}

      {hasJoined && (
        <>
          <div
            style={{
              ...joinSectionStyles,
              backgroundColor: COLORS.accentGlow,
              borderColor: COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontFamily: 'DM Sans, sans-serif',
                color: COLORS.textPrimary,
                margin: 0,
              }}
            >
              You're in! See you on the ride.
            </p>
            {user && myParticipant && (
              <Button
                variant="ghost"
                onClick={() => handleRemoveParticipant(myParticipant.id)}
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Leave Ride
              </Button>
            )}
          </div>
          {!user && (
            <div
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  color: COLORS.textSecondary,
                  margin: 0,
                  flex: 1,
                }}
              >
                Save your spot and see upcoming rides — create a free account
              </p>
              <Link
                to="/login"
                onClick={() => { if (id) saveGuestRedirect(id); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${COLORS.borderLight}`,
                  background: 'transparent',
                  color: COLORS.textPrimary,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.2s ease',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </>
      )}

      <ParticipantList
        participants={participants}
        currentUserId={user?.id}
        creatorId={ride.creator_id}
        onRemoveParticipant={handleRemoveParticipant}
      />

      {showTipButton && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <TipLeaderButton creatorName={creatorName} />
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Ride"
          message="Are you sure you want to delete this ride? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteRide}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
