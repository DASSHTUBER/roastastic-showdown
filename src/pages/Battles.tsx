
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BattleArena from '@/components/BattleArena';
import UserMatchmaking from '@/components/UserMatchmaking';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { User } from '@/services/matchmakingService';
import MatchmakingService from '@/services/matchmakingService';
import { useAuth } from '@/contexts/AuthContext';

const Battles = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      // Clean up any active matchmaking on unmount
      if (!matchFound) {
        const matchmakingService = MatchmakingService.getInstance();
        const userId = matchmakingService.getCurrentUserId();
        if (userId) {
          matchmakingService.cancelMatchmaking(userId);
        }
      }
    };
  }, [matchFound]);
  
  const checkMediaPermissions = async () => {
    // First check if user is authenticated
    if (!user) {
      // Store current location in sessionStorage to redirect back after auth
      sessionStorage.setItem('redirectAfterAuth', '/battles');
      toast.info("Please sign in to start matchmaking");
      navigate('/auth');
      return;
    }
    
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      startMatchmaking();
    } catch (error) {
      console.error("Media permissions error:", error);
      setShowPermissionDialog(true);
    }
  };
  
  const startMatchmaking = () => {
    setIsMatching(true);
    toast.info("Looking for a real opponent...");
  };
  
  const cancelMatchmaking = () => {
    setIsMatching(false);
    toast.info("Matchmaking cancelled");
  };
  
  const handleMatchFound = (foundOpponent: User) => {
    setOpponent(foundOpponent);
    setMatchFound(true);
    toast.success(`Opponent found: ${foundOpponent.username}! Get ready to roast!`);
  };
  
  // Force immediate navigation when leaving battle
  const handleLeaveBattle = () => {
    // Clean up any active matchmaking
    const matchmakingService = MatchmakingService.getInstance();
    const userId = matchmakingService.getCurrentUserId();
    if (userId) {
      matchmakingService.leaveBattle(userId);
    }
    
    // Navigate immediately
    navigate('/', { replace: true });
  };
  
  return (
    <div className="min-h-screen w-full">
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse-soft">
              Roast<span className="text-[#00E1A0]">Battle</span><span className="text-[#FF5757]">!</span>
            </h1>
            <p className="mt-4 text-white/80 animate-pulse-soft">Loading the arena...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          
          <section className="pt-28 pb-16 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Live <span className="neon-text-green">Roast</span> Battles
                </h1>
                <p className="mt-4 text-white/80 max-w-2xl mx-auto">
                  Get matched with real opponents and show off your roasting skills while the audience watches and reacts.
                </p>
              </div>
              
              {!isMatching && !matchFound ? (
                <div className="max-w-2xl mx-auto text-center py-12">
                  <div className="animate-scale-in">
                    <div className="gartic-panel rounded-2xl p-8 mb-6">
                      <h2 className="text-xl font-semibold mb-4 text-white">Ready to Enter the Arena?</h2>
                      <p className="mb-6 text-white/80">
                        Click below to find a real opponent and start a live roast battle. 
                        Remember to keep it funny, not hurtful!
                      </p>
                      <Button 
                        onClick={checkMediaPermissions}
                        className="gartic-accent-button px-8 py-6 text-lg font-medium"
                      >
                        Start Matchmaking
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                      <div className="gartic-panel rounded-xl p-6">
                        <h3 className="font-semibold mb-2 text-[#00E1A0]">Battle Rules</h3>
                        <ul className="text-sm text-white/80 text-left list-disc pl-4 space-y-2">
                          <li>Each battle has 3 rounds</li>
                          <li>Free-form roasting (no turns)</li>
                          <li>Audience votes for the winner</li>
                          <li>Keep it witty, not offensive</li>
                        </ul>
                      </div>
                      
                      <div className="gartic-panel rounded-xl p-6">
                        <h3 className="font-semibold mb-2 text-[#00E1A0]">Mini Games</h3>
                        <p className="text-sm text-white/80 text-left">
                          Spice up your battle with Truth or Dare, Challenge Wheel, and more interactive games while roasting!
                        </p>
                      </div>
                      
                      <div className="gartic-panel rounded-xl p-6">
                        <h3 className="font-semibold mb-2 text-[#00E1A0]">Rewards</h3>
                        <p className="text-sm text-white/80 text-left">
                          Win battles to climb the leaderboard and earn exclusive emotes, backgrounds, and status badges.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !matchFound ? (
                <UserMatchmaking 
                  onCancel={cancelMatchmaking} 
                  onMatchFound={handleMatchFound}
                />
              ) : (
                <div className="animate-scale-in">
                  <BattleArena 
                    opponentData={opponent} 
                    onLeave={handleLeaveBattle}
                  />
                </div>
              )}
            </div>
          </section>
          
          {/* Camera/Mic Permission Dialog */}
          <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
            <DialogContent className="sm:max-w-md gartic-panel">
              <DialogHeader>
                <DialogTitle className="text-white">Camera & Microphone Access</DialogTitle>
                <DialogDescription className="text-white/80">
                  RoastBattle needs access to your camera and microphone to let you participate in live battles. Without these permissions, you won't be able to join a battle.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-white/80">
                  Please enable camera and microphone access in your browser settings and try again. This typically appears in the address bar or in your browser's site settings.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowPermissionDialog(false)} className="text-white border-white/20 hover:bg-white/10" variant="outline">Got it</Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    checkMediaPermissions();
                    setShowPermissionDialog(false);
                  }}
                  className="gartic-accent-button"
                >
                  Try Again
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Battles;
