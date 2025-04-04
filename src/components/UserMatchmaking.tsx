
import React, { useState, useEffect } from 'react';
import { User } from '@/services/matchmaking/types';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from 'lucide-react';
import { matchmakingService } from '@/services/matchmakingService';
import { useAuth } from '@/contexts/AuthContext';

export interface UserMatchmakingProps {
  onCancel: () => void;
  onMatchFound: (opponent: User) => void;
}

const UserMatchmaking: React.FC<UserMatchmakingProps> = ({ onCancel, onMatchFound }) => {
  const [progress, setProgress] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [isSearching, setIsSearching] = useState(true);
  const [matchmakingMessage, setMatchmakingMessage] = useState('Finding a sweet opponent...');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { username, user } = useAuth();
  
  useEffect(() => {
    // Start matchmaking when component mounts
    const startMatchmaking = async () => {
      if (user?.id) {
        const userDisplayName = username || `User_${user.id.substring(0, 4)}`;
        
        // Generate a consistent avatar URL
        const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${userDisplayName}`;
        
        // Register callback for match notifications
        matchmakingService.onMatchFound(user.id, (opponent) => {
          if (opponent) {
            console.log("Match found with opponent:", opponent);
            onMatchFound(opponent);
            setIsSearching(false);
          }
        });
        
        // Enter matchmaking queue
        await matchmakingService.enterMatchmaking(
          user.id, 
          userDisplayName, 
          avatarUrl
        );
      }
    };
    
    startMatchmaking();
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          // Reset progress when it reaches 100%
          return 0;
        }
        return newProgress;
      });
    }, 300);
    
    // Track search time
    const searchTimeInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    // Update messages based on search time
    const messageInterval = setInterval(() => {
      const messages = [
        'Finding a sweet opponent...',
        'Searching for candy crushers...',
        'Looking for roast masters...',
        'Matching skill levels...',
        'Still searching...',
        'Hang tight, almost there...',
        'Scanning the candy kingdom...'
      ];
      
      // Sometimes show encouraging messages for longer waits
      if (searchTime > 10 && Math.random() > 0.7) {
        setMatchmakingMessage('Not many players online right now. Hang tight!');
      } else {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMatchmakingMessage(randomMessage);
      }
      
      // Update simulated online users count (more realistic)
      setOnlineUsers(Math.floor(Math.random() * 30) + 5 + Math.floor(searchTime / 3));
      
    }, 4000);
    
    // Clean up intervals and timeouts
    return () => {
      clearInterval(progressInterval);
      clearInterval(searchTimeInterval);
      clearInterval(messageInterval);
      
      // Cancel matchmaking when component unmounts
      if (user?.id) {
        matchmakingService.cancelMatchmaking(user.id);
      }
    };
  }, [onMatchFound, user, username, searchTime]);
  
  const handleCancel = () => {
    if (user?.id) {
      matchmakingService.cancelMatchmaking(user.id);
    }
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="candy-panel p-8 rounded-xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-candy-purple/30 to-candy-blue/30 animate-pulse-slow"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6 text-white candy-shadow">
            Sweet Matchmaking
          </h2>
          
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-candy-bright-pink via-candy-purple to-candy-blue animate-spin-slow"></div>
              <div className="absolute inset-1 rounded-full bg-[#2A0E3D] flex items-center justify-center">
                <Avatar className="w-16 h-16 border-2 border-white/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username || 'User'}`} />
                  <AvatarFallback className="bg-candy-purple text-white">
                    {username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="mt-4 text-white">
              <p className="font-medium">{username || 'Anonymous User'}</p>
              <p className="text-sm text-white/60">Ready to roast</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-white/80 mb-2">{matchmakingMessage}</p>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center text-sm text-white/60 mb-6">
            <span>Search time: {searchTime}s</span>
            <span>Players online: {onlineUsers}</span>
          </div>
          
          <Button 
            onClick={handleCancel}
            variant="outline" 
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <X className="mr-2 h-4 w-4" /> Cancel Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserMatchmaking;
