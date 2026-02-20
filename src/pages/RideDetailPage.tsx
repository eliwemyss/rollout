import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const hasJoined = participants.some(
    (p) => p.user_id === user?.id || (user && p.guest_name === profile?.full_name)
  );

  const handleJoin = async (guestName?: string) => {
    if (!id) return;

    const { error } = await supabase.from('participants').insert({
      ride_id: id,
      user_id: user?.id || null,
      guest_name: guestName || null,
    });

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        throw new Error('You have already joined this ride');
      }
      throw new Error(error.message);
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
  const showTipButton =
    user && !isCreator && hasJoined && ride?.creator_id;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

      {!isCreator && !hasJoined && (
        <div style={joinSectionStyles}>
          <h3 style={sectionTitleStyles}>Join This Ride</h3>
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
              Join Ride
            </Button>
          )}
        </div>
      )}

      {!isCreator && hasJoined && (
        <div
          style={{
            ...joinSectionStyles,
            backgroundColor: COLORS.accentGlow,
            borderColor: COLORS.accent,
          }}
        >
          <p
            style={{
              fontSize: '15px',
              fontFamily: 'DM Sans, sans-serif',
              color: COLORS.textPrimary,
              textAlign: 'center',
            }}
          >
            You're in! See you on the ride.
          </p>
          {showTipButton && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TipLeaderButton
                rideId={ride!.id}
                creatorId={ride!.creator_id}
                creatorName={creatorName}
              />
            </div>
          )}
        </div>
      )}

      <ParticipantList
        participants={participants}
        currentUserId={user?.id}
        creatorId={ride.creator_id}
        onRemoveParticipant={handleRemoveParticipant}
      />

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
