import type { Token, User } from '@/types/user';

export type UserState = {
  user: User | null;
  token: Token | null;
};
