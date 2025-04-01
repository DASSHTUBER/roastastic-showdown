
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Users, Bell, Play, Gamepad2, Candy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { username } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full">
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-candy-bright-pink animate-pulse-soft candy-shadow">
              Roast<span className="text-candy-blue">Battle</span>
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
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-full opacity-60 animate-spin`}
                  style={{
                    backgroundColor: [
                      '#FF8ABC', '#A066D3', '#48C4E0',
                      '#7ED957', '#FFD53F', '#FF9838'
                    ][i % 6],
                    animationDuration: `${10 + Math.random() * 20}s`
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Hero Section */}
          <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="mb-10 relative">
                  <img 
                    src="/lovable-uploads/1434daba-c739-4933-9b31-90d80c0eca18.png" 
                    alt="RoastBattle Logo" 
                    className="w-full max-w-[400px] mx-auto filter drop-shadow-lg"
                  />
                  <div className="absolute -top-6 -right-6 animate-bounce hidden md:block">
                    <div className="w-16 h-16 candy-panel rounded-full flex items-center justify-center">
                      <Candy className="w-8 h-8 text-white animate-candy-spin" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                  {/* Main Panel */}
                  <div className="candy-panel p-6 rounded-xl col-span-1 md:col-span-3 transform hover:scale-105 transition-transform duration-300">
                    <h2 className="text-xl font-bold mb-4 text-white text-center candy-shadow">
                      {username ? `Welcome, ${username}!` : 'Welcome to RoastBattle!'}
                    </h2>
                    <div className="mb-6 text-center">
                      <h3 className="text-center text-white mb-4">
                        Ready for a sweet battle of words?
                      </h3>
                    </div>
                    <Button 
                      className="candy-button w-full flex gap-2 items-center justify-center py-6 mt-auto"
                      onClick={() => navigate('/battles')}
                    >
                      <Play className="h-5 w-5" />
                      <span className="font-bold">START BATTLE</span>
                    </Button>
                  </div>
                  
                  {/* How To Play Panel */}
                  <div className="candy-panel p-6 rounded-xl col-span-1 md:col-span-3">
                    <h2 className="text-xl font-bold mb-4 text-candy-yellow text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      HOW TO PLAY
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/10 rounded-xl p-4 transform hover:scale-105 transition-transform">
                        <h3 className="font-bold text-white mb-2">1. JOIN BATTLE</h3>
                        <p className="text-white/80 text-sm">
                          Enter the sweet arena and prepare to face your opponent
                        </p>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4 transform hover:scale-105 transition-transform">
                        <h3 className="font-bold text-white mb-2">2. TIME TO ROAST</h3>
                        <p className="text-white/80 text-sm">
                          Each player takes turns delivering sugary comebacks
                        </p>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4 transform hover:scale-105 transition-transform">
                        <h3 className="font-bold text-white mb-2">3. AUDIENCE VOTES</h3>
                        <p className="text-white/80 text-sm">
                          The audience decides who delivered the sweetest roasts
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6 space-x-2">
                      {[1, 2, 3, 4, 5, 6].map((dot) => (
                        <div 
                          key={dot} 
                          className={`w-3 h-3 rounded-full ${
                            dot === 2 ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
                  <Button 
                    className="candy-accent-button px-8 py-6 animate-pulse-soft"
                    onClick={() => navigate('/tournaments')}
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Sweet Tournaments
                  </Button>
                  
                  <Button 
                    className="candy-button px-8 py-6 animate-pulse-soft"
                    onClick={() => navigate('/minigames')}
                  >
                    <Gamepad2 className="h-5 w-5 mr-2" />
                    Candy Games
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
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
        </>
      )}
    </div>
  );
};

export default Index;
