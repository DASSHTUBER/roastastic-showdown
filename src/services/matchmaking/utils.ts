
/**
 * Generate a unique ID for a user
 */
export const generateUserId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 10);
};

/**
 * Broadcast matchmaking request to other tabs/browsers
 */
export const broadcastMatchmakingRequest = (userId: string, username: string, avatarUrl?: string): number => {
  if (typeof localStorage !== 'undefined') {
    const requestData = {
      userId,
      username,
      avatarUrl,
      timestamp: Date.now()
    };
    
    localStorage.setItem('matchmaking_request', JSON.stringify(requestData));
    return Date.now();
  }
  return 0;
};

/**
 * Broadcast matchmaking cancellation to other tabs/browsers
 */
export const broadcastCancellation = (userId: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('matchmaking_cancel', JSON.stringify({
      userId,
      timestamp: Date.now()
    }));
  }
};
