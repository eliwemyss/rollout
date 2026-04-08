import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ParticipantWithProfile } from '../types';

export const useParticipants = (rideId: string | undefined, userId?: string) => {
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);

  const fetchParticipants = useCallback(async () => {
    if (!rideId) return;

    const { data, error } = await supabase
      .from('participants')
      .select('*, profile:profiles!participants_user_id_fkey(*)')
      .eq('ride_id', rideId)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setParticipants(data as ParticipantWithProfile[]);
    }
  }, [rideId, userId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return { participants, refetch: fetchParticipants };
};
