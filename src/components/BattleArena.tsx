
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import RoundTimer from './RoundTimer';
import AudienceReactions from './AudienceReactions';
import ChatPanel from './ChatPanel';
import { Play, MessageCircle, X } from 'lucide-react';
import { toast } from "sonner";

interface BattleArenaProps {
  isDemo?: boolean;
}

const BattleArena = ({ isDemo = false }: BattleArenaProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [started, setStarted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'you' | 'opponent'>('opponent');
  const [battleComplete, setBattleComplete] = useState(false);
  
  useEffect(() => {
    if (!isDemo && !started) {
      setStarted(true);
    }
  }, [isDemo, started]);
  
  useEffect(() => {
    if (currentRound > 1) {
      // Toggle turn
      setCurrentTurn(prev => prev === 'you' ? 'opponent' : 'you');
    }
  }, [currentRound]);
  
  const handleRoundComplete = () => {
    if (currentRound < totalRounds) {
      toast.info(`Round ${currentRound} complete!`);
      setCurrentRound(currentRound + 1);
    } else {
      // Battle complete logic here
      toast.success("Battle complete! Audience is voting on the winner...");
      setBattleComplete(true);
      
      if (isDemo) {
        // Reset the demo
        setTimeout(() => {
          setCurrentRound(1);
          setStarted(false);
          setBattleComplete(false);
        }, 5000);
      }
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
            <Play className="mr-2 h-5 w-5" />
            Watch Demo Battle
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            <div className="flex flex-col space-y-6 lg:w-3/4">
              {/* Battle info */}
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Live Battle {isDemo && "Demo"}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-roast-red/10 text-roast-red px-2 py-1 rounded-full">Live</span>
                    <span className="text-sm bg-roast-dark-gray/10 px-2 py-1 rounded-full">
                      <span className="text-roast-medium-gray mr-1">👁</span> {isDemo ? 238 : Math.floor(Math.random() * 300) + 100}
                    </span>
                  </div>
                </div>
                
                {!battleComplete && (
                  <RoundTimer 
                    duration={isDemo ? 30 : 60} 
                    currentRound={currentRound} 
                    totalRounds={totalRounds} 
                    onComplete={handleRoundComplete}
                  />
                )}
              </div>
              
              {/* Video grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <UserVideo 
                  username="JokeSlayer42" 
                  isCurrentUser={true} 
                />
                <UserVideo 
                  username="RoastMaster99" 
                />
              </div>
              
              {/* Audience reactions */}
              <div className="flex justify-between items-center">
                <AudienceReactions />
                
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {showChat ? 'Hide Chat' : 'Show Chat'}
                </Button>
              </div>
              
              {/* Battle controls */}
              <div className="flex justify-between items-center">
                {battleComplete ? (
                  <span className="text-sm font-medium text-roast-orange">Battle completed! Winner will be announced soon.</span>
                ) : (
                  <span className="text-sm text-roast-light-gray">
                    {isDemo ? 'Demo mode' : `${currentTurn === 'you' ? 'Your turn!' : `Opponent's turn. Your turn in: 0:${Math.floor(Math.random() * 30) + 10}`}`}
                  </span>
                )}
                
                {!isDemo && !battleComplete && (
                  <div className="flex space-x-3">
                    <Button variant="outline" className="rounded-full">Skip Turn</Button>
                    <Button 
                      className="button-gradient rounded-full text-white"
                      disabled={currentTurn !== 'you'}
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
          </div>
        </>
      )}
    </div>
  );
};

export default BattleArena;
