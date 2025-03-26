
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Users, Bell, Play } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
            <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse-soft">
              Roast<span className="text-[#00E1A0]">Battle</span>
            </h1>
            <p className="mt-4 text-white/80 animate-pulse-soft">Loading the arena...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          
          {/* Hero Section */}
          <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="mb-10">
                  <img 
                    src="/lovable-uploads/e1f6da6e-5c4d-4bff-8555-fc8a44e7eb8c.png" 
                    alt="RoastBattle Logo" 
                    className="w-full max-w-[400px] mx-auto"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                  {/* Anonymous Play Panel */}
                  <div className="gartic-panel p-6 rounded-xl col-span-1 flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4 text-[#00E1A0] drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      ANONYMOUS
                    </h2>
                    <div className="mb-6 flex-grow flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-[#8023a5] flex items-center justify-center">
                        <span className="text-4xl">🎭</span>
                      </div>
                    </div>
                    <Button 
                      className="gartic-accent-button w-full flex gap-2 items-center justify-center py-6"
                      onClick={() => navigate('/battles')}
                    >
                      <Play className="h-5 w-5" />
                      <span className="font-bold">START</span>
                    </Button>
                  </div>
                  
                  {/* Middle Panel */}
                  <div className="gartic-panel p-6 rounded-xl col-span-1">
                    <h2 className="text-xl font-bold mb-4 text-white text-center">
                      AUTHENTICATED
                    </h2>
                    <div className="mb-6">
                      <h3 className="text-center text-white mb-4">
                        CHOOSE A CHARACTER<br />
                        AND A NICKNAME
                      </h3>
                      <input 
                        type="text" 
                        placeholder="CoolNickname2644" 
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                      />
                    </div>
                    <Button 
                      className="gartic-button w-full flex gap-2 items-center justify-center py-6 mt-auto"
                      onClick={() => navigate('/battles')}
                    >
                      <Play className="h-5 w-5" />
                      <span className="font-bold">START</span>
                    </Button>
                  </div>
                  
                  {/* How To Play Panel */}
                  <div className="gartic-panel p-6 rounded-xl col-span-1">
                    <h2 className="text-xl font-bold mb-4 text-[#00E1A0] text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                      HOW TO PLAY
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-white mb-2">1. JOIN BATTLE</h3>
                        <p className="text-white/80 text-sm">
                          Enter the arena and prepare to face your opponent
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-white mb-2">2. TIME TO ROAST</h3>
                        <p className="text-white/80 text-sm">
                          Each player takes turns delivering clever comebacks
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-white mb-2">3. AUDIENCE VOTES</h3>
                        <p className="text-white/80 text-sm">
                          The audience decides who delivered the best roasts
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
                    className="gartic-accent-button px-8 py-6"
                    onClick={() => navigate('/tournaments')}
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Daily Tournaments
                  </Button>
                  
                  <Button className="gartic-button px-8 py-6">
                    <Users className="h-5 w-5 mr-2" />
                    Live Audience
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="py-8 px-6 text-white/60 absolute bottom-0 w-full">
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
        </>
      )}
    </div>
  );
};

export default Index;
