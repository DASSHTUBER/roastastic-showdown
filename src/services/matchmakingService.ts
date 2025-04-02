
import { supabase } from '@/integrations/supabase/client';
import { RealTimeMatchmakingService } from './RealTimeMatchmakingService';
import { User } from './matchmaking/types';

// Re-export the User type from types.ts
export type { User } from './matchmaking/types';

// Initialize and export the singleton instance
export const matchmakingService = RealTimeMatchmakingService.getInstance();

// Initialize the service
matchmakingService.initialize();
