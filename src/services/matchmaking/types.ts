
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  stream?: MediaStream;
  isBot?: boolean;
  status?: 'waiting' | 'matched' | 'in_battle';
  opponent_id?: string;
}

export interface Presence {
  user_id: string;
  username: string;
  avatar_url?: string;
  status?: string;
  skill_level?: string;
  region?: string;
  joined_at?: string;
  updated_at?: string;
}

export type MatchmakingCallback = (opponent: User) => void;
export type NoUsersCallback = () => void;
