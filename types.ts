
export type PokerValue = string | number;

export interface UserVote {
  userName: string;
  vote: PokerValue;
}

export interface Task {
  id: string;
  identifier: string;
  votes: UserVote[]; // Changed from PokerValue[] to UserVote[]
  averageScore: number | null;
  revealed: boolean;
}

export type AppPhase = 'WELCOME' | 'SESSION_ACTIVE' | 'SESSION_SUMMARY';