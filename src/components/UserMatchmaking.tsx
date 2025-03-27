
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import { X } from 'lucide-react';
import MatchmakingService, { User } from '@/services/matchmakingService';

interface UserMatchmakingProps {
  onCancel: () => void;
  onMatchFound: (opponent: User) => void;
}

const UserMatchmaking = ({ onCancel, onMatchFound }: UserMatchmakingProps) => {
  const [searchTime, setSearchTime] = useState(0);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const userIdRef = useRef<string | null>(null);
  const matchmakingService = MatchmakingService.getInstance();
  
  useEffect(() => {
    // Start matchmaking when component mounts
    initializeMatchmaking();
    
    // Start timer
    const interval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      // Cancel matchmaking when component unmounts
      if (userIdRef.current) {
        matchmakingService.cancelMatchmaking(userIdRef.current);
      }
      
      // Stop all media tracks
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const initializeMatchmaking = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setUserStream(stream);
      
      // Generate username or use from localStorage if available
      const username = localStorage.getItem('username') || `RoastMaster${Math.floor(Math.random() * 999)}`;
      
      // Initialize user in matchmaking service
      const userId = matchmakingService.initialize(username);
      userIdRef.current = userId;
      
      // Set user stream
      matchmakingService.setUserStream(userId, stream);
      
      // Start looking for a match
      matchmakingService.findMatch(userId, (opponent) => {
        // When a match is found, notify the parent component
        onMatchFound(opponent);
      });
      
      // Broadcast this matchmaking request to other tabs/browsers
      matchmakingService.broadcastMatchmakingRequest(
        userId, 
        username,
        localStorage.getItem('avatarUrl') || undefined
      );
      
      console.log("Matchmaking initialized for user:", userId);
    } catch (error) {
      console.error("Error initializing matchmaking:", error);
    }
  };
  
  const handleCancelMatchmaking = () => {
    if (userIdRef.current) {
      matchmakingService.cancelMatchmaking(userIdRef.current);
    }
    
    // Stop all media tracks
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
    }
    
    onCancel();
  };
  
  // Format search time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="glass-light rounded-2xl p-6 flex flex-col items-center">
        <div className="w-full max-w-sm mb-8">
          <UserVideo 
            username="You" 
            isCurrentUser={true}
            stream={userStream || undefined}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="animate-pulse h-3 w-3 bg-roast-red rounded-full"></span>
            <h3 className="text-xl font-semibold">Finding a real opponent</h3>
          </div>
          
          <p className="text-roast-light-gray mb-6">
            Time elapsed: {formatTime(searchTime)}
          </p>
          
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 border-4 border-roast-red/30 border-t-roast-red rounded-full animate-spin"></div>
          </div>
          
          <p className="text-sm text-roast-light-gray mb-6">
            Looking for another user who's ready to get roasted...
          </p>
          
          <Button 
            onClick={handleCancelMatchmaking}
            variant="outline" 
            className="rounded-full px-4"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserMatchmaking;
