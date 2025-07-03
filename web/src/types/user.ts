import type { Model } from '@/types/base';

export type Token = string;

export interface User extends Model {
  id: string;
  name: string;
  email: string;
}
