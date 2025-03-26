
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Dice5, MessageCircleQuestion, Mic, Award, GalleryHorizontalEnd } from 'lucide-react';
import { toast } from "sonner";
import MiniGameComponent from '@/components/MiniGames';

const MiniGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  const games = [
    {
      id: 'truth-dare',
      title: 'Truth or Dare',
      description: 'The classic game with a roast battle twist. Answer truthfully or accept the dare!',
      icon: <MessageCircleQuestion className="h-12 w-12 text-roast-orange" />
    },
    {
      id: 'wheel',
      title: 'Wheel of Challenge',
      description: 'Spin the wheel and get a random challenge to use in your next roast.',
      icon: <GalleryHorizontalEnd className="h-12 w-12 text-roast-red" />
    },
    {
      id: 'voice-changer',
      title: 'Voice Changer',
      description: 'Transform your voice into funny characters for an extra roast dimension.',
      icon: <Mic className="h-12 w-12 text-purple-500" />
    },
    {
      id: 'rapid-fire',
      title: 'Rapid Fire',
      description: '30 seconds to come up with as many roasts as you can. Test your quick wit!',
      icon: <Gamepad2 className="h-12 w-12 text-blue-500" />
    },
    {
      id: 'word-association',
      title: 'Word Association',
      description: 'Start with a word and create a roast using the next associated word.',
      icon: <Dice5 className="h-12 w-12 text-emerald-500" />
    },
    {
      id: 'comedy-cards',
      title: 'Comedy Cards',
      description: 'Draw cards with prompts to inspire your next hilarious roast.',
      icon: <Award className="h-12 w-12 text-amber-500" />
    }
  ];

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#8023a5]">
      <Navbar />
      
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Roast <span className="text-[#00E1A0]">Mini Games</span>
            </h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">
              Spice up your roast battles with these fun mini games. Practice your wit, improve your comebacks, and have a blast!
            </p>
          </div>
          
          {selectedGame ? (
            <div className="animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {games.find(g => g.id === selectedGame)?.title}
                </h2>
                <Button
                  variant="outline"
                  onClick={closeGame}
                  className="rounded-full text-white border-white/30 hover:bg-white/10"
                >
                  Back to Games
                </Button>
              </div>
              
              <div className="gartic-panel rounded-xl p-6">
                <MiniGameComponent 
                  isDemo={true} 
                  initialGameType={selectedGame} 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {games.map((game) => (
                <Card key={game.id} className="gartic-panel hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0">
                  <CardHeader>
                    <div className="flex justify-center">{game.icon}</div>
                    <CardTitle className="text-center mt-4 text-white">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-white/80">{game.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      onClick={() => {
                        setSelectedGame(game.id);
                        toast.info(`Loading ${game.title}...`);
                      }}
                      className="gartic-accent-button rounded-full"
                    >
                      Play Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-6 text-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-white font-bold text-xl">
                RoastBattle<span className="text-[#00E1A0]">!</span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MiniGames;
