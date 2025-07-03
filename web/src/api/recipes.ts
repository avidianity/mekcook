import { useUserStore } from '@/stores/user';
import type { Recipe } from '@/types/recipe';
import http, { withToken } from '@/utils/http';

export function all() {
  const store = useUserStore();

  const headers = withToken(store.token!);

  return http.get<{ data: Recipe[] }>('/recipes', {
    headers,
  });
}
