import type { Model } from '@/types/base';

export interface Recipe extends Model {
  id: string;
  name: string;
  ingredients: string;
  instructions: string;
  imageId: string;
}
