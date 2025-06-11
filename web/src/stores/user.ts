import type { UserState } from '@/types/state';
import type { Token, User } from '@/types/user';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
  }),
  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
    setToken(token: Token | null) {
      this.token = token;
    },
  },
});
