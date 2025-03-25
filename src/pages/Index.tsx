
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BattleArena from '@/components/BattleArena';
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Users, Bell } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
          
          {/* Hero Section */}
          <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in">
                  Where <span className="text-gradient">Wit</span> Meets <span className="text-gradient">Fire</span>
                </h1>
                
                <p className="mt-6 max-w-2xl text-roast-light-gray animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  Join live roasting battles, engage with an audience, and climb the ranks to become the ultimate Roast Master.
                </p>
                
                <div className="mt-10 flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Button className="button-gradient rounded-full text-white px-8 py-6 text-lg font-medium">
                    Start a Battle
                  </Button>
                  <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-medium">
                    Watch Live Battles
                  </Button>
                </div>
                
                <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-roast-orange/10">
                      <Trophy className="h-7 w-7 text-roast-orange" />
                    </div>
                    <p className="mt-3 font-medium">Daily Tournaments</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-roast-red/10">
                      <Users className="h-7 w-7 text-roast-red" />
                    </div>
                    <p className="mt-3 font-medium">Live Audience</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-roast-yellow/10">
                      <Bell className="h-7 w-7 text-roast-yellow" />
                    </div>
                    <p className="mt-3 font-medium">Exclusive Challenges</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Battle Preview Section */}
          <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-background to-secondary">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold">Experience the Thrill</h2>
                <p className="mt-4 text-roast-light-gray max-w-2xl mx-auto">
                  Watch opponents face off in time-limited rounds of witty comebacks and clever jokes.
                </p>
              </div>
              
              <div className="animate-scale-in">
                <BattleArena isDemo={true} />
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-16 md:py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">More Than Just Roasting</h2>
                <p className="mt-4 text-roast-light-gray max-w-2xl mx-auto">
                  Dive into a variety of interactive experiences beyond the battle arena.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Mini Games",
                    description: "Enjoy Truth & Dare, Spin the Bottle, and rapid-fire Q&A between battles.",
                    delay: 0
                  },
                  {
                    title: "Global Leaderboard",
                    description: "Climb the ranks and get recognized as one of the best roasters worldwide.",
                    delay: 0.1
                  },
                  {
                    title: "Virtual Gifts",
                    description: "Support your favorite roasters with stickers, emojis, and premium gifts.",
                    delay: 0.2
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-sm animate-slide-in-bottom"
                    style={{ animationDelay: `${feature.delay}s` }}
                  >
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-roast-light-gray mb-4">{feature.description}</p>
                    <Button variant="ghost" className="text-roast-red hover:text-roast-orange flex items-center gap-1 p-0">
                      Learn more <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-16 md:py-24 px-6 bg-gradient-to-r from-roast-dark to-roast-dark-gray text-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to Show Your Skills?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-white/70">
                  Join the community of roasters and see if you have what it takes to become a Roast Master.
                </p>
                <div className="mt-10">
                  <Button className="bg-white hover:bg-white/90 text-roast-dark rounded-full px-8 py-6 text-lg font-medium">
                    Enter the Arena
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="py-8 px-6 bg-roast-dark text-white/60">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <span className="text-white font-bold text-xl">RoastBattle</span>
                </div>
                
                <div className="flex space-x-6">
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
              </div>
              <div className="mt-8 text-center text-sm">
                &copy; {new Date().getFullYear()} RoastBattle. All rights reserved.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default Index;
