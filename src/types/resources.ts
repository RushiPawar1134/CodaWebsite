export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  description?: string;
  updatedAt: string; // ISO date
  ownerName?: string;
}
