import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RideWithCreator } from '../types';

export const useRide = (id: string | undefined) => {
  const [ride, setRide] = useState<RideWithCreator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchRide = async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*, creator:profiles!creator_id(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setRide(data as RideWithCreator);
      }
      setLoading(false);
    };

    fetchRide();
  }, [id]);

  return { ride, loading };
};
