
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BattleArena from '@/components/BattleArena';
import UserMatchmaking from '@/components/UserMatchmaking';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { User } from '@/services/matchmakingService';
import RealTimeMatchmakingService from '@/services/RealTimeMatchmakingService';
import { useAuth } from '@/contexts/AuthContext';
import { Candy, Play, Heart, Trophy } from 'lucide-react';

const Battles = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { user, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("[Battles] Component mounted");
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      console.log("[Battles] Component unmounting, cleaning up resources");
      clearTimeout(timer);
      // Clean up any active matchmaking on unmount
      if (!matchFound) {
        const matchmakingService = RealTimeMatchmakingService.getInstance();
        const userId = matchmakingService.getCurrentUserId();
        if (userId) {
          matchmakingService.cancelMatchmaking(userId);
        }
      }
    };
  }, [matchFound]);
  
  const checkMediaPermissions = async () => {
    console.log("[Battles] Checking media permissions and authentication");
    // First ensure a user is authenticated (either regular or anonymous)
    if (!user) {
      try {
        console.log("[Battles] No user found, signing in anonymously");
        // Try to sign in anonymously
        await signInAnonymously();
        toast.success("Signed in anonymously for matchmaking");
      } catch (error) {
        console.error("[Battles] Error signing in anonymously:", error);
        toast.error("Failed to create a temporary profile. Please try again.");
        return;
      }
    } else {
      console.log("[Battles] User already authenticated:", user);
    }
    
    try {
      console.log("[Battles] Requesting media permissions");
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      startMatchmaking();
    } catch (error) {
      console.error("[Battles] Media permissions error:", error);
      // We'll still allow matchmaking, but inform the user
      toast.warning("Camera/mic not available. You can still match but won't be seen/heard.");
      startMatchmaking();
    }
  };
  
  const startMatchmaking = () => {
    console.log("[Battles] Starting matchmaking");
    setIsMatching(true);
    toast.info("Looking for a sweet opponent...", {
      icon: <Candy className="text-candy-pink" />,
    });
  };
  
  const cancelMatchmaking = () => {
    console.log("[Battles] Cancelling matchmaking");
    setIsMatching(false);
    toast.info("Matchmaking cancelled");
  };
  
  const handleMatchFound = (foundOpponent: User) => {
    console.log("[Battles] Match found with opponent:", foundOpponent);
    setOpponent(foundOpponent);
    setMatchFound(true);
    toast.success(`Sweet opponent found: ${foundOpponent.username}! Get ready to roast!`, {
      icon: <Heart className="text-candy-bright-pink" />,
    });
  };
  
  // Force immediate navigation when leaving battle
  const handleLeaveBattle = () => {
    console.log("[Battles] Leaving battle");
    // Clean up any active matchmaking
    const matchmakingService = RealTimeMatchmakingService.getInstance();
    const userId = matchmakingService.getCurrentUserId();
    if (userId) {
      matchmakingService.leaveBattle(userId);
    }
    
    // Reset state
    setMatchFound(false);
    setIsMatching(false);
    setOpponent(null);
    
    // Navigate immediately
    navigate('/', { replace: true });
  };
  
  return (
    <div className="min-h-screen w-full">
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-candy-bright-pink animate-pulse-soft candy-shadow">
              Roast<span className="text-candy-blue">Battle</span><span className="text-candy-green">!</span>
            </h1>
            <p className="mt-4 text-candy-purple animate-pulse-soft">Loading sweet battles...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          
          {/* Floating Candy Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              >
                <div 
                  className="w-6 h-6 md:w-10 md:h-10 rounded-full opacity-60"
                  style={{
                    backgroundColor: [
                      '#FF8ABC', '#A066D3', '#48C4E0',
                      '#7ED957', '#FFD53F', '#FF9838'
                    ][i % 6]
                  }}
                />
              </div>
            ))}
          </div>
          
          <section className="pt-28 pb-16 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white candy-shadow">
                  Sweet <span className="text-candy-green">Roast</span> Battles
                </h1>
                <p className="mt-4 text-candy-purple max-w-2xl mx-auto">
                  Get matched with sugar-coated opponents and show off your roasting skills while the audience watches and reacts.
                </p>
              </div>
              
              {!isMatching && !matchFound ? (
                <div className="max-w-2xl mx-auto text-center py-12">
                  <div className="animate-scale-in">
                    <div className="candy-panel rounded-2xl p-8 mb-6 relative overflow-hidden">
                      <div className="absolute -right-12 -top-12 opacity-20">
                        <Candy className="w-32 h-32 text-white animate-candy-spin" />
                      </div>
                      <h2 className="text-xl font-semibold mb-4 text-white candy-shadow">Ready to Enter the Sweet Arena?</h2>
                      <p className="mb-6 text-white/80">
                        Click below to find a sugar-coated opponent and start a sweet roast battle. 
                        Remember to keep it funny, not hurtful!
                      </p>
                      <Button 
                        onClick={checkMediaPermissions}
                        className="candy-button px-8 py-6 text-lg font-medium hover:animate-jelly"
                      >
                        Start Sweet Matchmaking
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                      <div className="candy-panel rounded-xl p-6 bg-gradient-to-br from-candy-orange to-candy-red">
                        <h3 className="font-semibold mb-2 text-candy-yellow">Sweet Battle Rules</h3>
                        <ul className="text-sm text-white/80 text-left list-disc pl-4 space-y-2">
                          <li>Each battle has 3 sugary rounds</li>
                          <li>Free-form roasting (no turns)</li>
                          <li>Candy audience votes for the winner</li>
                          <li>Keep it sweet, not sour</li>
                        </ul>
                      </div>
                      
                      <div className="candy-panel rounded-xl p-6 bg-gradient-to-br from-candy-purple to-candy-bright-pink">
                        <h3 className="font-semibold mb-2 text-candy-yellow">Candy Mini Games</h3>
                        <p className="text-sm text-white/80 text-left">
                          Sweeten up your battle with Truth or Dare, Challenge Wheel, and more interactive candy games while roasting!
                        </p>
                      </div>
                      
                      <div className="candy-panel rounded-xl p-6 bg-gradient-to-br from-candy-blue to-candy-green">
                        <h3 className="font-semibold mb-2 text-candy-yellow">Sweet Rewards</h3>
                        <p className="text-sm text-white/80 text-left">
                          Win battles to climb the candy leaderboard and earn exclusive emotes, backgrounds, and status badges.
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
            <DialogContent className="sm:max-w-md candy-panel">
              <DialogHeader>
                <DialogTitle className="text-white candy-shadow">Camera & Microphone Access</DialogTitle>
                <DialogDescription className="text-white/80">
                  Sweet RoastBattle needs access to your camera and microphone to let you participate in sugary battles. Without these permissions, you won't be able to join a battle.
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
                  className="candy-button"
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
