
import { supabase } from '@/integrations/supabase/client';
import { RealTimeMatchmakingService } from './RealTimeMatchmakingService';
import { DebugLogger } from './matchmaking/DebugLogger';

// Initialize and export the singleton instance
export const matchmakingService = RealTimeMatchmakingService.getInstance();

// Initialize the service
matchmakingService.initialize();
