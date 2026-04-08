import { RideStatus } from '../types';

export const getRideStatus = (startDatetime: string): RideStatus => {
  const start = new Date(startDatetime);
  const now = new Date();
  const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return 'upcoming';
  if (diffHours < 4) return 'ongoing';
  return 'completed';
};
