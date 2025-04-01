
import { useState, useEffect, useCallback } from 'react';
import { RealTimeMatchmakingService } from '@/services/RealTimeMatchmakingService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from '@/services/matchmaking/types';

// Get singleton instance
const matchmakingService = RealTimeMatchmakingService.getInstance();

interface UserMatchmakingProps {
  onMatchCreated: (matchId: string) => void;
}

const UserMatchmaking = ({ onMatchCreated }: UserMatchmakingProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBotMatching, setIsBotMatching] = useState(false);
  const { user, username } = useAuth();

  // Join matchmaking
  const joinMatchmaking = useCallback(async () => {
    if (!user || !username) {
      setError('User not authenticated');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await matchmakingService.joinMatchmaking(user.id, username);
      setIsJoined(true);
      
      // Start polling for online users
      getOnlineUsers();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsJoining(false);
    }
  }, [user, username]);

  // Leave matchmaking
  const leaveMatchmaking = useCallback(async () => {
    try {
      await matchmakingService.leaveMatchmaking();
      setIsJoined(false);
      setOnlineUsers([]);
    } catch (error) {
      setError((error as Error).message);
    }
  }, []);

  // Toggle bot matching
  const toggleBotMatching = useCallback(() => {
    const newState = !isBotMatching;
    setIsBotMatching(newState);
    matchmakingService.enableBotMatch(newState);
  }, [isBotMatching]);

  // Create a match with a bot
  const createBotMatch = useCallback(async () => {
    try {
      const matchId = await matchmakingService.createBotMatch();
      onMatchCreated(matchId);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [onMatchCreated]);

  // Create a match with a user
  const createMatch = useCallback(async (opponentId: string) => {
    try {
      const matchId = await matchmakingService.createMatch(opponentId);
      onMatchCreated(matchId);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [onMatchCreated]);

  // Get online users
  const getOnlineUsers = useCallback(async () => {
    if (!isJoined) return;
    
    try {
      const users = await matchmakingService.getOnlineUsers();
      // Filter out current user
      const filteredUsers = users.filter(u => u.id !== user?.id);
      setOnlineUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, [isJoined, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMatchmaking();
    };
  }, [leaveMatchmaking]);

  // Poll for online users every 5 seconds
  useEffect(() => {
    if (!isJoined) return;
    
    const interval = setInterval(getOnlineUsers, 5000);
    return () => clearInterval(interval);
  }, [isJoined, getOnlineUsers]);

  return (
    <div className="candy-panel p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Matchmaking</h2>
      
      {error && (
        <div className="bg-roast-red/20 text-roast-red p-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {!isJoined ? (
        <Button 
          onClick={joinMatchmaking} 
          disabled={isJoining} 
          className="candy-button w-full mb-4"
        >
          {isJoining ? 'Joining...' : 'Join Matchmaking'}
        </Button>
      ) : (
        <Button 
          onClick={leaveMatchmaking} 
          className="candy-accent-button w-full mb-4"
        >
          Leave Matchmaking
        </Button>
      )}
      
      {isJoined && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-white">Bot Matching:</span>
            <Button 
              onClick={toggleBotMatching} 
              variant={isBotMatching ? "default" : "outline"}
              className={isBotMatching ? "candy-button" : ""}
            >
              {isBotMatching ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          {isBotMatching && (
            <Button 
              onClick={createBotMatch} 
              className="candy-button w-full mb-4"
            >
              Battle Bot
            </Button>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Online Users</h3>
            {onlineUsers.length === 0 ? (
              <p className="text-white/70">No users online</p>
            ) : (
              <ul className="space-y-2">
                {onlineUsers.map(user => (
                  <li 
                    key={user.id} 
                    className="flex justify-between items-center bg-white/10 p-2 rounded-md"
                  >
                    <span className="text-white">{user.username}</span>
                    <Button 
                      onClick={() => createMatch(user.id)}
                      size="sm"
                      className="candy-button"
                    >
                      Challenge
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserMatchmaking;
