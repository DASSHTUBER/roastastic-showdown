import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, Clock, ChevronRight, Gamepad } from 'lucide-react';
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  type: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
  prize: string;
  icon: keyof typeof gameIcons;
}

const gameIcons = {
  chess: '♟️',
  ludo: '🎲',
  trivia: '❓',
  wordGame: '📝',
  cardGame: '🃏',
  memory: '🧠',
};

const chessRoasts = [
  "Did you learn that move from watching paint dry?",
  "Your chess strategy is like your jokes - predictable and weak.",
  "Knight to E5? More like 'Goodnight' to your chances of winning.",
  "That move was so bad, even my calculator is laughing.",
  "Call that a sacrifice? The only thing you're sacrificing is your dignity."
];

const ludoRoasts = [
  "Rolling a 6 won't save your game, just like it won't save your fashion sense.",
  "You're moving pieces slower than my grandma, and she's 92.",
  "Need a GPS for that move? Because you seem completely lost.",
  "That's the most strategic move you've made all day, and it's still terrible.",
  "Your Ludo skills are like elevator music - forgettable and annoying."
];

const Tournaments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('live');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTournaments(mockTournaments);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const mockTournaments: Tournament[] = [
    {
      id: 't1',
      name: 'Chess Championship',
      type: 'Chess',
      participants: 14,
      maxParticipants: 16,
      startTime: 'Live Now',
      status: 'live',
      prize: '500 Points + Gold Badge',
      icon: 'chess'
    },
    {
      id: 't2',
      name: 'Ludo Masters',
      type: 'Ludo',
      participants: 24,
      maxParticipants: 32,
      startTime: 'Live Now',
      status: 'live',
      prize: '300 Points + Silver Badge',
      icon: 'ludo'
    },
    {
      id: 't3',
      name: 'Trivia Night',
      type: 'Trivia',
      participants: 45,
      maxParticipants: 50,
      startTime: 'In 2 hours',
      status: 'upcoming',
      prize: '250 Points + Special Emotes',
      icon: 'trivia'
    },
    {
      id: 't4',
      name: 'Word Masters',
      type: 'Word Game',
      participants: 18,
      maxParticipants: 20,
      startTime: 'In 5 hours',
      status: 'upcoming',
      prize: '200 Points + Profile Frame',
      icon: 'wordGame'
    },
    {
      id: 't5',
      name: 'Card Tournament',
      type: 'Card Game',
      participants: 16,
      maxParticipants: 16,
      startTime: 'Yesterday',
      status: 'completed',
      prize: '400 Points + Trophy',
      icon: 'cardGame'
    },
    {
      id: 't6',
      name: 'Memory Challenge',
      type: 'Memory Game',
      participants: 12,
      maxParticipants: 12,
      startTime: '2 days ago',
      status: 'completed',
      prize: '350 Points + Badge',
      icon: 'memory'
    }
  ];
  
  const filteredTournaments = tournaments.filter(t => t.status === activeTab);
  
  const handleJoinTournament = (tournamentId: string, tournamentType?: string) => {
    toast.success("You've joined the tournament! Get ready to compete!");
    
    if (tournamentType === 'Chess') {
      setTimeout(() => {
        toast("AI Roastmaster says:", {
          description: chessRoasts[Math.floor(Math.random() * chessRoasts.length)],
          icon: "♟️",
        });
      }, 1500);
    } else if (tournamentType === 'Ludo') {
      setTimeout(() => {
        toast("AI Roastmaster says:", {
          description: ludoRoasts[Math.floor(Math.random() * ludoRoasts.length)],
          icon: "🎲",
        });
      }, 1500);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-[#8023a5]">
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse-soft">
              Tournament<span className="text-[#00E1A0]">Hub</span>
            </h1>
            <p className="mt-4 text-white/80 animate-pulse-soft">Loading tournaments...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          
          <section className="pt-28 pb-16 px-6 min-h-screen bg-[#8023a5] bg-[url('data:image/svg+xml,%3Csvg width=\\'52\\' height=\\'26\\' viewBox=\\'0 0 52 26\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 animate-scale-in">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Daily <span className="text-[#00E1A0]">Tournaments</span>
                </h1>
                <p className="mt-4 text-white/80 max-w-2xl mx-auto">
                  Compete in various games against other players and win exclusive rewards.
                </p>
              </div>
              
              {/* Tournament tabs */}
              <div className="flex justify-center mb-8">
                <div className="bg-[#4a2264]/80 rounded-full p-1 flex animate-fade-in">
                  {(['live', 'upcoming', 'completed'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTab === tab 
                          ? 'bg-[#00E1A0] text-[#4a2264]' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tournament cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
                {filteredTournaments.map((tournament) => (
                  <div key={tournament.id} className="gartic-panel p-6 rounded-xl hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#8023a5] text-2xl animate-pulse-soft">
                          {gameIcons[tournament.icon]}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                          <p className="text-sm text-white/60">{tournament.type}</p>
                        </div>
                      </div>
                      
                      {tournament.status === 'live' && (
                        <span className="bg-[#FF5757]/20 text-[#FF5757] text-xs px-2 py-1 rounded-full animate-pulse">
                          Live
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-white/80 text-sm">
                        <Users className="w-4 h-4 mr-2 text-[#00E1A0]" />
                        <span>{tournament.participants}/{tournament.maxParticipants} Participants</span>
                      </div>
                      
                      <div className="flex items-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-[#00E1A0]" />
                        <span>{tournament.startTime}</span>
                      </div>
                      
                      <div className="flex items-center text-white/80 text-sm">
                        <Trophy className="w-4 h-4 mr-2 text-[#00E1A0]" />
                        <span>{tournament.prize}</span>
                      </div>
                    </div>
                    
                    {tournament.status === 'live' && (
                      <Button 
                        className="gartic-accent-button w-full animate-pulse-soft"
                        onClick={() => handleJoinTournament(tournament.id, tournament.type)}
                      >
                        Join Tournament
                      </Button>
                    )}
                    
                    {tournament.status === 'upcoming' && (
                      <Button 
                        className="gartic-button w-full"
                        onClick={() => handleJoinTournament(tournament.id)}
                      >
                        Remind Me
                      </Button>
                    )}
                    
                    {tournament.status === 'completed' && (
                      <Button 
                        variant="outline"
                        className="w-full text-white border-white/20 hover:bg-white/10"
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Featured Tournament */}
              {activeTab === 'live' && (
                <div className="mt-12 gartic-panel p-8 rounded-xl animate-fade-in hover:border-[#00E1A0] transition-colors">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00E1A0]/20 text-4xl animate-pulse-soft">
                          ♟️
                        </div>
                        <div className="ml-4">
                          <h2 className="text-2xl font-bold text-white">Weekend Chess Tournament</h2>
                          <div className="flex items-center mt-1">
                            <span className="bg-[#FF5757]/20 text-[#FF5757] text-xs px-2 py-1 rounded-full mr-2">
                              Featured
                            </span>
                            <span className="text-white/60">64 Participants</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white/80 mb-6 max-w-2xl">
                        Join our premium chess tournament with live streaming and commentary. 
                        Compete against skilled players from around the world and win exclusive rewards.
                        <span className="text-[#FF5757] italic block mt-2">
                          "Our AI will roast your every move, but don't take it personally - it roasts everyone equally badly!"
                        </span>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#3d1b53] rounded-lg p-3 hover:bg-[#4d2b63] transition-colors">
                          <p className="text-[#00E1A0] text-sm font-medium">Grand Prize</p>
                          <p className="text-white">1000 Points + Trophy</p>
                        </div>
                        <div className="bg-[#3d1b53] rounded-lg p-3 hover:bg-[#4d2b63] transition-colors">
                          <p className="text-[#00E1A0] text-sm font-medium">Format</p>
                          <p className="text-white">Swiss System</p>
                        </div>
                        <div className="bg-[#3d1b53] rounded-lg p-3 hover:bg-[#4d2b63] transition-colors">
                          <p className="text-[#00E1A0] text-sm font-medium">Duration</p>
                          <p className="text-white">3 Hours</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 md:ml-6 flex flex-col justify-center items-center md:items-end">
                      <Button 
                        className="gartic-accent-button w-full md:w-auto px-8 py-6 text-lg animate-pulse-soft"
                        onClick={() => handleJoinTournament('featured', 'Chess')}
                      >
                        Join Now
                      </Button>
                      <p className="text-white/60 text-sm mt-2">Starts in 10 minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Tournaments;
