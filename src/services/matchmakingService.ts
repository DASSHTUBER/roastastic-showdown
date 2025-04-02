
import { supabase } from '@/integrations/supabase/client';
import { RealTimeMatchmakingService } from './RealTimeMatchmakingService';
import { DebugLogger } from './matchmaking/DebugLogger';

// Export the User type from RealTimeMatchmakingService
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status?: string;
  rating?: number;
}

// Initialize and export the singleton instance
export const matchmakingService = RealTimeMatchmakingService.getInstance();

// Initialize the service
matchmakingService.initialize();
