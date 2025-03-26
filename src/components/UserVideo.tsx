
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume, VolumeX, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserVideoProps {
  username: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  isMuted?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  streamId?: string;
  onLeave?: () => void;
  className?: string;
}

const UserVideo = ({ 
  username, 
  avatarUrl, 
  isCurrentUser = false, 
  isMuted = false,
  videoEnabled = true,
  audioEnabled = true,
  streamId,
  onLeave,
  className
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
      className={cn(
        "relative h-64 md:h-80 rounded-xl overflow-hidden animate-scale-in group",
        "border-4 border-[#4a2264]",
        isCurrentUser ? "bg-[#3d1b53]" : "bg-[#3d1b53]",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-b ${isCurrentUser ? 'from-[#4a2264] to-[#3d1b53]' : 'from-[#4a2264] to-[#3d1b53]'} flex items-center justify-center ${videoLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
        <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse-soft" />
      </div>
      
      {/* Video disabled overlay */}
      {isVideoDisabled && (
        <div className="absolute inset-0 bg-[#4a2264]/30 flex flex-col items-center justify-center text-[#00E1A0] z-10">
          <VideoOff size={32} className="mb-2 opacity-70" />
          <p className="text-sm opacity-70 text-[#00E1A0]">Camera off</p>
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
            className={`absolute inset-0 ${isCurrentUser ? 'bg-[#3d1b53]' : 'bg-[#3d1b53]'}`}
            style={{ 
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: '0.3'
            }}
          />
          <Avatar className="h-24 w-24 border-2 border-white">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className={isCurrentUser ? "bg-[#00E1A0]" : "bg-[#8023a5]"}>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* User info overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent ${showControls ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">
            {username}
            {isCurrentUser && !audioEnabled && (
              <span className="ml-2 text-xs text-[#FF5757]">🔇 Muted</span>
            )}
          </span>
          <div className="flex gap-2">
            {isCurrentUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAudioMuted(!audioMuted)}
                className="bg-[#8023a5]/50 text-white hover:bg-[#8023a5]/70 rounded-full h-8 w-8"
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
                className="bg-[#8023a5]/50 text-white hover:bg-[#8023a5]/70 rounded-full h-8 w-8"
              >
                {audioMuted ? <VolumeX size={16} /> : <Volume size={16} />}
              </Button>
            )}
            {isCurrentUser && onLeave && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLeave}
                className="bg-[#FF5757]/50 text-white hover:bg-[#FF5757]/70 rounded-full h-8 w-8"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* User badge */}
      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white ${isCurrentUser ? 'bg-[#00E1A0]' : 'bg-[#8023a5]'}`}>
        {isCurrentUser ? "You" : "Opponent"}
      </div>
    </div>
  );
};

export default UserVideo;
