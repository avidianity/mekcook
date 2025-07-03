import type { AsForm } from '@/types/base';
import type { Response } from '@/types/http';
import type { Token, User } from '@/types/user';
import http from '@/utils/http';

export function login(email: string, password: string) {
  return http.post<Response<{ user: User; token: Token }>>('/auth/login', {
    email,
    password,
  });
}

export function register(user: AsForm<User> & { password: string }) {
  return http.post<Response<{ user: User; token: Token }>>('/auth/register', user);
}
