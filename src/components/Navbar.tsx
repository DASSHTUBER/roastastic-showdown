
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
        scrolled ? 'glass-light' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gradient font-bold text-2xl tracking-tight">RoastBattle</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-roast-red transition-colors">Home</Link>
          <Link to="/battles" className="font-medium hover:text-roast-red transition-colors">Battles</Link>
          <Link to="/leaderboard" className="font-medium hover:text-roast-red transition-colors">Leaderboard</Link>
          <Link to="/minigames" className="font-medium hover:text-roast-red transition-colors">Mini Games</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Trophy size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Users size={20} />
          </Button>
          <Button 
            className="button-gradient rounded-full text-white"
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
