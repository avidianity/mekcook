export interface Model {
  createdAt: Date;
  updatedAt: Date;
}

export type AsForm<T extends Model> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
