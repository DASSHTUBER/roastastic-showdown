
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MiniGamesProps {
  isDemo?: boolean;
  initialGameType?: 'truth-dare' | 'wheel-challenge';
}

// Truth or Dare questions and dares
const truthQuestions = [
  "What's the most embarrassing thing you've ever done?",
  "What's your biggest pet peeve?",
  "What's the weirdest dream you've ever had?",
  "What's the worst pickup line you've ever used or heard?",
  "If you could be any celebrity for a day, who would it be?",
  "What's your guilty pleasure?",
  "What's the most ridiculous lie you've ever told?",
  "What's your most irrational fear?",
  "What's the worst fashion trend you've ever followed?",
  "If you could have any superpower, what would it be?"
];

const dareActions = [
  "Use an accent for the next round",
  "Take a sip of water while your opponent tries to make you laugh",
  "Do your best impression of a celebrity",
  "Use a pickup line on your opponent",
  "Make up a 30-second rap about your opponent",
  "Tell a joke without laughing",
  "Try to sell a random object in your room like it's on an infomercial",
  "Make a funny face and hold it for 10 seconds",
  "Show the most embarrassing photo on your phone",
  "Do your best dance move"
];

const challenges = [
  "Use a silly accent for your next roast",
  "Include a movie reference in your next roast",
  "Make your next roast rhyme",
  "Do a compliment sandwich (compliment, roast, compliment)",
  "Use only words starting with the letter S in your next roast",
  "Act like you're in a Shakespeare play for your next roast",
  "Make your next roast as a singing performance",
  "Pretend you're a news reporter delivering breaking news about your opponent",
  "Your next roast must include three animal references",
  "Do your next roast while doing jumping jacks"
];

// New word association prompts
const wordAssociations = [
  "Start with: Celebrity",
  "Start with: Fashion",
  "Start with: Music",
  "Start with: Food",
  "Start with: Technology",
  "Start with: Movies",
  "Start with: Sports",
  "Start with: Animals",
  "Start with: Weather",
  "Start with: Travel"
];

// Voice changer options
const voiceChangers = [
  "Robot Voice",
  "Chipmunk",
  "Deep Voice",
  "Elderly Person",
  "Alien",
  "Underwater Effect",
  "Echo Chamber",
  "Radio DJ",
  "Whisper",
  "Megaphone"
];

// Comedy card prompts
const comedyCards = [
  "Roast your opponent like you're their disappointed parent",
  "Pretend your opponent is a bad superhero - what's their power?",
  "Your opponent is the star of a terrible infomercial - what are they selling?",
  "If your opponent was an app, what bugs would it have?",
  "Roast your opponent's fashion choices like a snooty fashion critic",
  "If your opponent was a video game character, what would be their weakness?",
  "Roast your opponent's social media presence",
  "Your opponent is the main character in a cheesy romance novel - describe their love interest",
  "If your opponent was a fast food item, what would they be and why?",
  "Roast your opponent as if they were running for political office"
];

const MiniGames = ({ isDemo = false, initialGameType = 'truth-dare' }: MiniGamesProps) => {
  const [gameType, setGameType] = useState<string>(initialGameType);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [truthOrDare, setTruthOrDare] = useState<'truth' | 'dare'>('truth');
  
  useEffect(() => {
    // Set the game type based on the prop
    if (initialGameType) {
      setGameType(initialGameType);
    }
  }, [initialGameType]);
  
  const spinBottle = () => {
    if (isSpinning) return;
    
    setCurrentResult(null);
    setIsSpinning(true);
    toast.info("Spinning the bottle...");
    
    // Simulate spinning delay
    setTimeout(() => {
      if (truthOrDare === 'truth') {
        const randomTruth = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
        setCurrentResult(randomTruth);
      } else {
        const randomDare = dareActions[Math.floor(Math.random() * dareActions.length)];
        setCurrentResult(randomDare);
      }
      setIsSpinning(false);
      toast.success("The bottle has spoken!");
    }, 1500);
  };
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    setCurrentResult(null);
    setIsSpinning(true);
    toast.info("Spinning the wheel of challenges...");
    
    // Simulate spinning delay
    setTimeout(() => {
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      setCurrentResult(randomChallenge);
      setIsSpinning(false);
      toast.success("Challenge selected!");
    }, 1500);
  };
  
  const getRandomPrompt = (array: string[]) => {
    if (isSpinning) return;
    
    setCurrentResult(null);
    setIsSpinning(true);
    toast.info("Generating prompt...");
    
    setTimeout(() => {
      const randomPrompt = array[Math.floor(Math.random() * array.length)];
      setCurrentResult(randomPrompt);
      setIsSpinning(false);
      toast.success("Prompt ready!");
    }, 1000);
  };
  
  return (
    <div className="h-full flex flex-col bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
      <div className="p-3 border-b border-white/20">
        <h3 className="font-medium">Mini Games</h3>
      </div>
      
      <div className="flex-1 flex flex-col p-4">
        <ToggleGroup type="single" value={gameType} onValueChange={(value) => {
          if (value) setGameType(value);
          setCurrentResult(null);
        }}>
          <ToggleGroupItem value="truth-dare" className="flex-1">
            🎮 Truth or Dare
          </ToggleGroupItem>
          <ToggleGroupItem value="wheel-challenge" className="flex-1">
            🎡 Wheel of Challenge
          </ToggleGroupItem>
          {!initialGameType?.includes('truth-dare') && !initialGameType?.includes('wheel-challenge') && (
            <>
              <ToggleGroupItem value="word-association" className="flex-1 max-sm:mt-2">
                🔤 Word Game
              </ToggleGroupItem>
              <ToggleGroupItem value="comedy-cards" className="flex-1 max-sm:mt-2">
                🃏 Comedy Cards
              </ToggleGroupItem>
            </>
          )}
        </ToggleGroup>
        
        <div className="mt-6 flex-1">
          {gameType === 'truth-dare' && (
            <div className="text-center">
              <div className="my-4">
                <ToggleGroup type="single" value={truthOrDare} onValueChange={(value) => {
                  if (value) setTruthOrDare(value as 'truth' | 'dare');
                }}>
                  <ToggleGroupItem value="truth" className="flex-1">
                    Truth
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dare" className="flex-1">
                    Dare
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="my-6 relative">
                <div className={`w-28 h-28 mx-auto rounded-full border-4 border-roast-orange flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                  <div className="h-1 w-full absolute top-1/2 -translate-y-1/2 bg-roast-dark-gray/30"></div>
                  <div className="w-1 h-full absolute left-1/2 -translate-x-1/2 bg-roast-dark-gray/30"></div>
                </div>
              </div>
              
              <Button 
                onClick={spinBottle}
                disabled={isSpinning}
                className="mt-4 button-gradient"
              >
                Spin the Bottle
              </Button>
            </div>
          )}
          
          {gameType === 'wheel-challenge' && (
            <div className="text-center">
              <div className="my-6 relative">
                <div className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-r from-roast-red via-roast-orange to-yellow-500 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                  <div className="w-32 h-32 bg-white/90 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-roast-red"></div>
              </div>
              
              <Button 
                onClick={spinWheel}
                disabled={isSpinning}
                className="mt-4 button-gradient"
              >
                Spin the Wheel
              </Button>
            </div>
          )}
          
          {gameType === 'word-association' && (
            <div className="text-center">
              <div className="my-6">
                <div className="p-4 bg-white/30 rounded-lg mb-4">
                  <p className="text-sm mb-2">How to play:</p>
                  <ol className="text-sm text-left list-decimal pl-4">
                    <li>Get a starting word</li>
                    <li>Think of a word associated with it</li>
                    <li>Use that new word in your roast</li>
                    <li>Your opponent continues with a new association</li>
                  </ol>
                </div>
                <div className="h-20 w-full bg-white/40 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">{currentResult || "Click the button to start"}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => getRandomPrompt(wordAssociations)}
                disabled={isSpinning}
                className="mt-4 button-gradient"
              >
                Get Starting Word
              </Button>
            </div>
          )}
          
          {gameType === 'comedy-cards' && (
            <div className="text-center">
              <div className="my-6 relative">
                <div className={`w-48 h-64 mx-auto rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center p-4 ${isSpinning ? 'animate-pulse' : ''}`}>
                  {currentResult ? (
                    <p className="text-white text-center font-medium">{currentResult}</p>
                  ) : (
                    <span className="text-4xl">🃏</span>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => getRandomPrompt(comedyCards)}
                disabled={isSpinning}
                className="mt-4 button-gradient"
              >
                Draw a Card
              </Button>
            </div>
          )}
          
          {currentResult && gameType !== 'comedy-cards' && (
            <div className="mt-6 p-4 bg-white/50 rounded-xl text-center">
              <h4 className="font-medium mb-2">
                {gameType === 'truth-dare' 
                  ? (truthOrDare === 'truth' ? 'Question:' : 'Dare:') 
                  : gameType === 'wheel-challenge' 
                    ? 'Challenge:' 
                    : 'Prompt:'}
              </h4>
              <p className="text-lg font-bold">{currentResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniGames;
