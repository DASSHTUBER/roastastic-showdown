
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import RoundTimer from './RoundTimer';
import AudienceReactions from './AudienceReactions';
import AudienceVoting from './AudienceVoting';
import ChatPanel from './ChatPanel';
import MiniGames from './MiniGames';
import { MessageCircle, Settings } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface BattleArenaProps {
  isDemo?: boolean;
}

const BattleArena = ({ isDemo = false }: BattleArenaProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [started, setStarted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showVoting, setShowVoting] = useState(false);
  const [roundWinners, setRoundWinners] = useState<string[]>([]);
  const [battleWinner, setBattleWinner] = useState<string | null>(null);
  
  const user1 = "JokeSlayer42";
  const user2 = "RoastMaster99";
  
  useEffect(() => {
    if (!isDemo && !started) {
      setStarted(true);
      
      if (!isDemo) {
        requestMediaPermissions();
      }
    }
  }, [isDemo, started]);
  
  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      toast.success("Camera and microphone access granted!");
    } catch (error) {
      toast.error("Please allow camera and microphone access for the full experience");
      console.error("Media permissions error:", error);
    }
  };
  
  const handleRoundComplete = () => {
    setShowVoting(true);
  };
  
  const handleVoteComplete = (winner: string) => {
    const newRoundWinners = [...roundWinners, winner];
    setRoundWinners(newRoundWinners);
    
    toast.info(`Round ${currentRound} winner: ${winner}!`);
    
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    } else {
      // Determine battle winner
      const winCounts = newRoundWinners.reduce((counts, winner) => {
        counts[winner] = (counts[winner] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const battleWinner = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0][0];
      setBattleWinner(battleWinner);
      toast.success(`Battle complete! ${battleWinner} wins!`);
      setBattleComplete(true);
      
      if (isDemo) {
        setTimeout(() => {
          setCurrentRound(1);
          setStarted(false);
          setBattleComplete(false);
          setRoundWinners([]);
          setBattleWinner(null);
        }, 5000);
      }
    }
    
    setShowVoting(false);
  };
  
  const toggleMiniGames = () => {
    setShowMiniGames(!showMiniGames);
    if (!showMiniGames) {
      setShowChat(false);
    }
  };
  
  return (
    <div className={`w-full max-w-6xl mx-auto rounded-2xl overflow-hidden glass-light p-6 ${isDemo ? 'md:p-8' : 'md:p-10'}`}>
      {!started && isDemo ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Experience a Live Roast Battle</h3>
          <Button 
            onClick={() => setStarted(true)} 
            className="button-gradient rounded-full text-white px-8 py-6 text-lg font-medium"
          >
            Watch Demo Battle
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            <div className="flex flex-col space-y-6 lg:w-3/4">
              {/* Battle info */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Live Battle {isDemo && "Demo"}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm bg-roast-red/10 text-roast-red px-2 py-1 rounded-full">Live</span>
                    <span className="text-sm bg-roast-dark-gray/10 px-2 py-1 rounded-full">
                      <span className="text-roast-medium-gray mr-1">👁</span> {isDemo ? 238 : Math.floor(Math.random() * 300) + 100}
                    </span>
                  </div>
                </div>
                
                {/* Settings Dialog */}
                {!isDemo && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Battle Settings</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <label htmlFor="video-toggle" className="text-sm font-medium">
                            Video
                          </label>
                          <Switch 
                            id="video-toggle" 
                            checked={videoEnabled} 
                            onCheckedChange={(checked) => {
                              setVideoEnabled(checked);
                              toast.info(`Video ${checked ? 'enabled' : 'disabled'}`);
                            }} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="audio-toggle" className="text-sm font-medium">
                            Microphone
                          </label>
                          <Switch 
                            id="audio-toggle" 
                            checked={audioEnabled} 
                            onCheckedChange={(checked) => {
                              setAudioEnabled(checked);
                              toast.info(`Microphone ${checked ? 'enabled' : 'disabled'}`);
                            }}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {!battleComplete && (
                <RoundTimer 
                  duration={isDemo ? 30 : 60} 
                  currentRound={currentRound} 
                  totalRounds={totalRounds} 
                  onComplete={handleRoundComplete}
                />
              )}
              
              {/* Video grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <UserVideo 
                  username={user1} 
                  isCurrentUser={true} 
                  videoEnabled={videoEnabled}
                  audioEnabled={audioEnabled}
                />
                <UserVideo 
                  username={user2} 
                />
              </div>
              
              {/* Audience reactions */}
              <div className="flex justify-between items-center">
                <AudienceReactions />
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${showMiniGames ? 'bg-roast-orange/10 text-roast-orange border-roast-orange/20' : ''}`}
                    onClick={toggleMiniGames}
                  >
                    🎮 Mini Games
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${showChat ? 'bg-roast-red/10 text-roast-red border-roast-red/20' : ''}`}
                    onClick={() => {
                      setShowChat(!showChat);
                      if (!showChat) {
                        setShowMiniGames(false);
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {showChat ? 'Hide Chat' : 'Show Chat'}
                  </Button>
                </div>
              </div>
              
              {/* Battle controls */}
              <div className="flex justify-between items-center">
                {battleComplete ? (
                  <span className="text-sm font-medium text-roast-orange">
                    Battle completed! Winner: {battleWinner}
                  </span>
                ) : (
                  <span className="text-sm text-roast-light-gray">
                    {isDemo ? 'Demo mode' : 'Free-form roasting! Just speak when you have something to say.'}
                  </span>
                )}
                
                {!isDemo && !battleComplete && (
                  <div className="flex space-x-3">
                    <Button 
                      className="button-gradient rounded-full text-white"
                    >
                      Ready to Roast
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {showChat && (
              <div className="lg:w-1/4 h-full">
                <ChatPanel isDemo={isDemo} />
              </div>
            )}
            
            {showMiniGames && (
              <div className="lg:w-1/4 h-full">
                <MiniGames isDemo={isDemo} />
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Audience Voting Dialog */}
      <AudienceVoting
        isOpen={showVoting}
        onClose={() => setShowVoting(false)}
        onVoteComplete={handleVoteComplete}
        currentRound={currentRound}
        user1={user1}
        user2={user2}
        isDemo={isDemo}
      />
    </div>
  );
};

export default BattleArena;
