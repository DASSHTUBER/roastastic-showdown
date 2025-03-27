
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  stream?: MediaStream;
  isBot?: boolean;
}

export type MatchmakingCallback = (opponent: User) => void;
export type NoUsersCallback = () => void;
