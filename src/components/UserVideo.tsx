
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume, VolumeX, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserVideoProps {
  username: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  isMuted?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  streamId?: string;
  onLeave?: () => void;
}

const UserVideo = ({ 
  username, 
  avatarUrl, 
  isCurrentUser = false, 
  isMuted = false,
  videoEnabled = true,
  audioEnabled = true,
  streamId,
  onLeave
}: UserVideoProps) => {
  const [audioMuted, setAudioMuted] = useState(isMuted);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle video stream
  useEffect(() => {
    const setupVideoStream = async () => {
      if (!isCurrentUser || !videoEnabled) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoEnabled, 
          audio: audioEnabled 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setVideoLoaded(true);
        }
        
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };
    
    setupVideoStream();
  }, [isCurrentUser, videoEnabled, audioEnabled]);
  
  // Apply video enabled/disabled state for current user
  const isVideoDisabled = isCurrentUser ? !videoEnabled : false;
  
  return (
    <div 
      className="video-container group animate-scale-in relative h-64 md:h-80 rounded-xl overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-b from-roast-dark-gray to-roast-dark flex items-center justify-center ${videoLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
        <div className="w-16 h-16 rounded-full bg-roast-medium-gray animate-pulse-soft" />
      </div>
      
      {/* Video disabled overlay */}
      {isVideoDisabled && (
        <div className="absolute inset-0 bg-roast-dark-gray/90 flex flex-col items-center justify-center text-white z-10">
          <VideoOff size={32} className="mb-2 opacity-50" />
          <p className="text-sm opacity-70">Camera off</p>
        </div>
      )}
      
      {/* Actual video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isCurrentUser || audioMuted}
        className={`w-full h-full object-cover ${videoLoaded && !isVideoDisabled ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
      />
      
      {/* Fallback background when no video */}
      {(!videoLoaded || isVideoDisabled) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'linear-gradient(to bottom right, #2A2A2A, #1A1A1A)',
              backgroundSize: 'cover',
              backgroundPosition: 'center' 
            }}
          />
          <Avatar className="h-24 w-24 border-2 border-white/20">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* User info overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent ${showControls ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">
            {username}
            {isCurrentUser && !audioEnabled && (
              <span className="ml-2 text-xs text-roast-red">🔇 Muted</span>
            )}
          </span>
          <div className="flex gap-2">
            {isCurrentUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAudioMuted(!audioMuted)}
                className="bg-roast-dark-gray/50 text-white hover:bg-roast-dark-gray/70 rounded-full h-8 w-8"
                disabled={!audioEnabled}
              >
                {audioMuted || !audioEnabled ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            )}
            {!isCurrentUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAudioMuted(!audioMuted)}
                className="bg-roast-dark-gray/50 text-white hover:bg-roast-dark-gray/70 rounded-full h-8 w-8"
              >
                {audioMuted ? <VolumeX size={16} /> : <Volume size={16} />}
              </Button>
            )}
            {isCurrentUser && onLeave && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLeave}
                className="bg-roast-red/50 text-white hover:bg-roast-red/70 rounded-full h-8 w-8"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* User badge */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-roast-dark-gray/70 backdrop-blur-sm rounded-lg text-xs text-white">
        {isCurrentUser ? "You" : "Opponent"}
      </div>
    </div>
  );
};

export default UserVideo;
