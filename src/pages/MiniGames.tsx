
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Dice5, MessageCircleQuestion, Mic, Award, GalleryHorizontalEnd, Candy } from 'lucide-react';
import { toast } from "sonner";
import MiniGameComponent from '@/components/MiniGames';

const MiniGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  const games = [
    {
      id: 'truth-dare',
      title: 'Sweet Truth or Dare',
      description: 'The classic game with a sugary twist. Answer truthfully or accept the sweet dare!',
      icon: <MessageCircleQuestion className="h-12 w-12 text-candy-orange" />,
      color: 'from-candy-orange to-candy-red'
    },
    {
      id: 'wheel',
      title: 'Candy Wheel Challenge',
      description: 'Spin the colorful wheel and get a random challenge to use in your next roast.',
      icon: <GalleryHorizontalEnd className="h-12 w-12 text-candy-red" />,
      color: 'from-candy-red to-candy-bright-pink'
    },
    {
      id: 'voice-changer',
      title: 'Sweet Voice Changer',
      description: 'Transform your voice into funny candy characters for an extra roast dimension.',
      icon: <Mic className="h-12 w-12 text-candy-purple" />,
      color: 'from-candy-purple to-candy-blue'
    },
    {
      id: 'rapid-fire',
      title: 'Sugar Rush',
      description: '30 seconds to come up with as many sweet roasts as you can. Test your quick wit!',
      icon: <Gamepad2 className="h-12 w-12 text-candy-blue" />,
      color: 'from-candy-blue to-candy-green'
    },
    {
      id: 'word-association',
      title: 'Candy Association',
      description: 'Start with a sweet word and create a roast using the next associated word.',
      icon: <Dice5 className="h-12 w-12 text-candy-green" />,
      color: 'from-candy-green to-candy-yellow'
    },
    {
      id: 'comedy-cards',
      title: 'Sweet Comedy Cards',
      description: 'Draw colorful cards with prompts to inspire your next hilarious candy roast.',
      icon: <Award className="h-12 w-12 text-candy-yellow" />,
      color: 'from-candy-yellow to-candy-orange'
    }
  ];

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen w-full">
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
      
      <div className="pt-28 pb-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white candy-shadow">
              Candy <span className="text-candy-green">Mini Games</span>
            </h1>
            <p className="mt-4 text-candy-purple max-w-2xl mx-auto">
              Sweeten up your roast battles with these fun mini games. Practice your wit, improve your comebacks, and have a sugary blast!
            </p>
          </div>
          
          {selectedGame ? (
            <div className="animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-candy-bright-pink candy-shadow">
                  {games.find(g => g.id === selectedGame)?.title}
                </h2>
                <Button
                  variant="outline"
                  onClick={closeGame}
                  className="rounded-full text-candy-bright-pink border-candy-bright-pink hover:bg-candy-bright-pink/10"
                >
                  Back to Games
                </Button>
              </div>
              
              <div className="candy-panel rounded-xl p-6">
                <MiniGameComponent 
                  isDemo={true} 
                  initialGameType={selectedGame} 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {games.map((game) => (
                <Card key={game.id} className={`bg-gradient-to-br ${game.color} hover:shadow-candy-hover transition-all duration-300 hover:-translate-y-1 rounded-xl border-2 border-white/30 group overflow-hidden`}>
                  <CardHeader className="relative">
                    <div className="flex justify-center">
                      <div className="bg-white/20 p-4 rounded-full">{game.icon}</div>
                    </div>
                    <CardTitle className="text-center mt-4 text-white">{game.title}</CardTitle>
                    <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Candy className="w-32 h-32 text-white animate-candy-spin" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-white/80">{game.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      onClick={() => {
                        setSelectedGame(game.id);
                        toast.info(`Loading ${game.title}...`, {
                          icon: game.icon,
                        });
                      }}
                      className="candy-button rounded-full hover:animate-jelly"
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
      <footer className="py-8 px-6 text-candy-purple/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-candy-bright-pink font-bold text-xl candy-shadow">
                RoastBattle<span className="text-candy-blue">!</span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Terms</a>
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Privacy</a>
              <a href="#" className="hover:text-candy-bright-pink transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MiniGames;
