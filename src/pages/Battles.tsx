
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BattleArena from '@/components/BattleArena';
import UserMatchmaking from '@/components/UserMatchmaking';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const Battles = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const checkMediaPermissions = async () => {
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
    toast.info("Looking for an opponent...");
    
    // Simulate matchmaking process
    const matchTimer = setTimeout(() => {
      setMatchFound(true);
      toast.success("Opponent found! Get ready to roast!");
    }, 3500);
    
    return () => clearTimeout(matchTimer);
  };
  
  const cancelMatchmaking = () => {
    setIsMatching(false);
    toast.info("Matchmaking cancelled");
  };
  
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient animate-pulse-soft">RoastBattle</h1>
            <p className="mt-4 text-roast-light-gray animate-pulse-soft">Loading the arena...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          
          <section className="pt-28 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Live <span className="text-gradient">Roast</span> Battles
                </h1>
                <p className="mt-4 text-roast-light-gray max-w-2xl mx-auto">
                  Get matched with random opponents and show off your roasting skills while the audience watches and reacts.
                </p>
              </div>
              
              {!isMatching && !matchFound ? (
                <div className="max-w-2xl mx-auto text-center py-12">
                  <div className="animate-scale-in">
                    <div className="glass-light rounded-2xl p-8 mb-6">
                      <h2 className="text-xl font-semibold mb-4">Ready to Enter the Arena?</h2>
                      <p className="mb-6 text-roast-light-gray">
                        Click below to find a random opponent and start a live roast battle. 
                        Remember to keep it funny, not hurtful!
                      </p>
                      <Button 
                        onClick={checkMediaPermissions}
                        className="button-gradient rounded-full text-white px-8 py-6 text-lg font-medium"
                      >
                        Start Matchmaking
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                      <div className="glass-light rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Battle Rules</h3>
                        <ul className="text-sm text-roast-light-gray text-left list-disc pl-4 space-y-2">
                          <li>Each battle has 3 rounds</li>
                          <li>Free-form roasting (no turns)</li>
                          <li>Audience votes for the winner</li>
                          <li>Keep it witty, not offensive</li>
                        </ul>
                      </div>
                      
                      <div className="glass-light rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Mini Games</h3>
                        <p className="text-sm text-roast-light-gray text-left">
                          Spice up your battle with Truth or Dare, Challenge Wheel, and more interactive games while roasting!
                        </p>
                      </div>
                      
                      <div className="glass-light rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Rewards</h3>
                        <p className="text-sm text-roast-light-gray text-left">
                          Win battles to climb the leaderboard and earn exclusive emotes, backgrounds, and status badges.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !matchFound ? (
                <UserMatchmaking onCancel={cancelMatchmaking} />
              ) : (
                <div className="animate-scale-in">
                  <BattleArena />
                </div>
              )}
            </div>
          </section>
          
          {/* Camera/Mic Permission Dialog */}
          <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Camera & Microphone Access</DialogTitle>
                <DialogDescription>
                  RoastBattle needs access to your camera and microphone to let you participate in live battles. Without these permissions, you won't be able to join a battle.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm">
                  Please enable camera and microphone access in your browser settings and try again. This typically appears in the address bar or in your browser's site settings.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowPermissionDialog(false)}>Got it</Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    checkMediaPermissions();
                    setShowPermissionDialog(false);
                  }}
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
