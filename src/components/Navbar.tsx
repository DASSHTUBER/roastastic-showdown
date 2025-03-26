
import { useState, useEffect } from 'react';
import { Bell, Trophy, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 ${
        scrolled ? 'bg-[#6A5BE2]/90 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-2xl tracking-tight">
            RoastBattle
            <span className="ml-1 text-[#FF9042]">!</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium text-white hover:text-[#FF9042] transition-colors">Home</Link>
          <Link to="/battles" className="font-medium text-white hover:text-[#FF9042] transition-colors">Battles</Link>
          <Link to="/leaderboard" className="font-medium text-white hover:text-[#FF9042] transition-colors">Leaderboard</Link>
          <Link to="/minigames" className="font-medium text-white hover:text-[#FF9042] transition-colors">Mini Games</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Trophy size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Users size={20} />
          </Button>
          <Button 
            className="bg-[#FF9042] hover:bg-[#FF5757] text-white rounded-full transition-all duration-300"
            onClick={() => navigate('/battles')}
          >
            Battle Now
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
