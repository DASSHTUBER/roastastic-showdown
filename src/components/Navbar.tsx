import { useState, useEffect } from 'react';
import { Bell, Trophy, Users, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    username,
    signOut
  } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  return <nav className="bg-orange-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-2xl tracking-tight">
            RoastBattle
            <span className="ml-1 text-[#00E1A0]">!</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium text-white hover:text-[#00E1A0] transition-colors">Home</Link>
          <Link to="/battles" className="font-medium text-white hover:text-[#00E1A0] transition-colors">Battles</Link>
          <Link to="/leaderboard" className="font-medium text-white hover:text-[#00E1A0] transition-colors">Leaderboard</Link>
          <Link to="/minigames" className="font-medium text-white hover:text-[#00E1A0] transition-colors">Mini Games</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20" onClick={() => navigate('/tournaments')}>
            <Trophy size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Users size={20} />
          </Button>
          
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gartic-button transition-all duration-300">
                  <User className="mr-2 h-4 w-4" /> {username || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#8023a5] text-white border-white/20">
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button className="gartic-accent-button transition-all duration-300" onClick={() => navigate('/auth')}>
              Sign In
            </Button>}
          
          <Button className="gartic-accent-button transition-all duration-300" onClick={() => navigate('/battles')}>
            Battle Now
          </Button>
        </div>
      </div>
    </nav>;
};
export default Navbar;