
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import { X, RefreshCw, User, Camera, CameraOff } from 'lucide-react';
import { toast } from "sonner";
import { User as MatchmakingUser } from '@/services/matchmakingService';
import RealTimeMatchmakingService from '@/services/RealTimeMatchmakingService';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface UserMatchmakingProps {
  onCancel: () => void;
  onMatchFound: (opponent: MatchmakingUser) => void;
}

const UserMatchmaking = ({ onCancel, onMatchFound }: UserMatchmakingProps) => {
  const [searchTime, setSearchTime] = useState(0);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false);
  const [matchmakingState, setMatchmakingState] = useState<'searching' | 'no-users' | 'connecting'>('searching');
  const [showBotOption, setShowBotOption] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const matchmakingService = RealTimeMatchmakingService.getInstance();
  
  useEffect(() => {
    // Start matchmaking when component mounts
    initializeMatchmaking();
    
    // Start timer
    const interval = setInterval(() => {
      setSearchTime(prev => {
        // After 15 seconds, show bot option if still searching
        if (prev === 15 && matchmakingState === 'searching') {
          setShowBotOption(true);
        }
        return prev + 1;
      });
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

  useEffect(() => {
    // Check if bot matching is enabled after waiting period
    const botCheckInterval = setInterval(() => {
      if (userIdRef.current && matchmakingService.isBotMatchEnabled() && matchmakingState === 'no-users') {
        // Bot matching is available but user needs to explicitly confirm
        setShowBotOption(true);
      }
    }, 2000);
    
    return () => clearInterval(botCheckInterval);
  }, [matchmakingState]);
  
  const initializeMatchmaking = async () => {
    try {
      // Reset state
      setShowNoUsersMessage(false);
      setMatchmakingState('searching');
      setShowBotOption(false);
      setCameraEnabled(true);
      
      // Get user media
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setUserStream(stream);
      } catch (mediaError) {
        console.error("Media access error:", mediaError);
        toast.error("Could not access camera or microphone. Continuing without media.");
        // Continue without media - users can still match without camera/mic
      }
      
      // Generate username or use from localStorage if available
      const username = localStorage.getItem('username') || `RoastMaster${Math.floor(Math.random() * 999)}`;
      const avatarUrl = localStorage.getItem('avatarUrl');
      
      console.log("Initializing matchmaking with username:", username);
      
      // Initialize user in matchmaking service
      const userId = matchmakingService.initialize(username, avatarUrl || undefined);
      userIdRef.current = userId;
      
      // Set user stream if available
      if (stream) {
        matchmakingService.setUserStream(userId, stream);
      }
      
      // Start looking for a match
      matchmakingService.findMatch(
        userId, 
        (opponent) => {
          // When a match is found, notify the parent component
          if (opponent.isBot) {
            toast.info(`No real opponents found. Connecting with ${opponent.username}...`);
          } else {
            toast.success(`Match found with ${opponent.username}!`);
          }
          onMatchFound(opponent);
        },
        () => {
          // Called when no users are available after waiting
          setMatchmakingState('no-users');
          setShowNoUsersMessage(true);
          toast.info("No opponents found at this time. Try again later or play with a bot.");
        }
      );
      
      console.log("Matchmaking initialized for user:", userId);
      setConnectionAttempts(prev => prev + 1);
    } catch (error) {
      console.error("Error initializing matchmaking:", error);
      toast.error("Failed to connect to matchmaking service. Please try again.");
      setMatchmakingState('no-users');
      setShowNoUsersMessage(true);
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

  const handleConnectWithBot = () => {
    if (userIdRef.current) {
      setMatchmakingState('connecting');
      matchmakingService.matchWithBot(userIdRef.current);
    }
  };
  
  const toggleCamera = () => {
    if (userStream) {
      const videoTracks = userStream.getVideoTracks();
      
      videoTracks.forEach(track => {
        track.enabled = !cameraEnabled;
      });
      
      setCameraEnabled(!cameraEnabled);
      toast.info(`Camera ${cameraEnabled ? 'disabled' : 'enabled'}`);
    }
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
            videoEnabled={cameraEnabled}
          />
        </div>
        
        <div className="text-center">
          {matchmakingState === 'no-users' ? (
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-xl font-semibold text-white">No opponents found</h3>
              <p className="text-roast-light-gray mb-2">
                It seems there are no other users available for a battle right now.
              </p>
              
              {showBotOption && (
                <div className="w-full mb-4">
                  <Alert variant="default" className="bg-[#8023a5]/20 border-[#8023a5]/40 text-white">
                    <AlertTitle className="text-white">Want to try with a RoastBot?</AlertTitle>
                    <AlertDescription className="text-white/80">
                      No real opponents are online right now. You can battle with our AI RoastBot instead.
                    </AlertDescription>
                    <Button
                      onClick={handleConnectWithBot}
                      variant="default"
                      className="rounded-full px-6 mt-4 bg-[#8023a5] hover:bg-[#8023a5]/80 w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Connect with RoastBot
                    </Button>
                  </Alert>
                </div>
              )}
              
              <Button
                onClick={initializeMatchmaking}
                variant="default"
                className="rounded-full px-6 mb-4 bg-roast-red hover:bg-roast-red/80"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={handleCancelMatchmaking}
                variant="outline" 
                className="rounded-full px-4"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="animate-pulse h-3 w-3 bg-roast-red rounded-full"></span>
                <h3 className="text-xl font-semibold text-white">Finding a real opponent</h3>
              </div>
              
              <p className="text-roast-light-gray mb-6">
                Time elapsed: {formatTime(searchTime)}
              </p>
              
              <div className="flex justify-center mb-4">
                <div className="h-8 w-8 border-4 border-roast-red/30 border-t-roast-red rounded-full animate-spin"></div>
              </div>
              
              <p className="text-sm text-roast-light-gray mb-6">
                Looking for another user who's ready to get roasted...
                {connectionAttempts > 1 && (
                  <span className="block mt-2 text-xs">
                    Connection attempt #{connectionAttempts}. Make sure you have another device connected.
                  </span>
                )}
              </p>
              
              {showBotOption && matchmakingState === 'searching' && (
                <div className="w-full mb-4">
                  <Alert variant="default" className="bg-[#8023a5]/20 border-[#8023a5]/40 text-white">
                    <AlertTitle className="text-white">Waiting for a while...</AlertTitle>
                    <AlertDescription className="text-white/80">
                      It's taking longer than expected to find a real opponent. Would you like to battle with our AI RoastBot instead?
                    </AlertDescription>
                    <Button
                      onClick={handleConnectWithBot}
                      variant="default"
                      className="rounded-full px-6 mt-4 bg-[#8023a5] hover:bg-[#8023a5]/80 w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Connect with RoastBot
                    </Button>
                  </Alert>
                </div>
              )}
              
              <div className="flex space-x-2 justify-center mb-4">
                <Button 
                  onClick={toggleCamera}
                  variant="outline" 
                  className="rounded-full px-4"
                  disabled={!userStream}
                >
                  {cameraEnabled ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                  {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                </Button>
                <Button 
                  onClick={handleCancelMatchmaking}
                  variant="outline" 
                  className="rounded-full px-4"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMatchmaking;
