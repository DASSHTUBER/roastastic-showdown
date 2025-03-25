
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import RoundTimer from './RoundTimer';
import AudienceReactions from './AudienceReactions';
import { Play } from 'lucide-react';

interface BattleArenaProps {
  isDemo?: boolean;
}

const BattleArena = ({ isDemo = false }: BattleArenaProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [started, setStarted] = useState(false);
  
  const handleRoundComplete = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    } else {
      // Battle complete logic here
      console.log('Battle complete!');
      if (isDemo) {
        // Reset the demo
        setTimeout(() => {
          setCurrentRound(1);
          setStarted(false);
        }, 3000);
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
          <div className="flex flex-col space-y-6">
            {/* Battle info */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Live Battle {isDemo && "Demo"}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-roast-red/10 text-roast-red px-2 py-1 rounded-full">Live</span>
                  <span className="text-sm bg-roast-dark-gray/10 px-2 py-1 rounded-full">
                    <span className="text-roast-medium-gray mr-1">👁</span> 238
                  </span>
                </div>
              </div>
              
              <RoundTimer 
                duration={isDemo ? 30 : 60} 
                currentRound={currentRound} 
                totalRounds={totalRounds} 
                onComplete={handleRoundComplete}
              />
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
            <div className="flex justify-center py-2">
              <AudienceReactions />
            </div>
            
            {/* Battle controls */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-roast-light-gray">
                {isDemo ? 'Demo mode' : 'Your turn in: 0:24'}
              </span>
              
              {!isDemo && (
                <div className="flex space-x-3">
                  <Button variant="outline" className="rounded-full">Skip</Button>
                  <Button className="button-gradient rounded-full text-white">Ready to Roast</Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BattleArena;
