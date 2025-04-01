
import { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Reaction {
  id: number;
  type: 'fire' | 'laugh' | 'heart' | 'star';
  position: {
    x: number;
    y: number;
  };
}

const AudienceReactions = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [counts, setCounts] = useState({
    fire: 0,
    laugh: 0,
    heart: 0,
    star: 0
  });
  
  const addReaction = (type: 'fire' | 'laugh' | 'heart' | 'star') => {
    const newReaction: Reaction = {
      id: Date.now(),
      type,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100
      }
    };
    
    setReactions(prev => [...prev, newReaction]);
    setCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    // Remove the reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };
  
  // Add some automatic reactions for demonstration
  useEffect(() => {
    const types: Array<'fire' | 'laugh' | 'heart' | 'star'> = ['fire', 'laugh', 'heart', 'star'];
    
    const interval = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      addReaction(randomType);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full h-full">
      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute animate-float"
            style={{
              left: `${reaction.position.x}%`,
              bottom: '0',
              animation: 'float 2s ease-out forwards',
              opacity: 0
            }}
          >
            {reaction.type === 'fire' && <span className="text-2xl">🔥</span>}
            {reaction.type === 'laugh' && <span className="text-2xl">😂</span>}
            {reaction.type === 'heart' && <Heart className="text-roast-red h-5 w-5" />}
            {reaction.type === 'star' && <Star className="text-roast-yellow h-5 w-5" />}
          </div>
        ))}
      </div>
      
      {/* Reaction buttons */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full px-3"
          onClick={() => addReaction('fire')}
        >
          <span className="mr-1.5">🔥</span>
          <span className="text-xs font-medium">{counts.fire}</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full px-3"
          onClick={() => addReaction('laugh')}
        >
          <span className="mr-1.5">😂</span>
          <span className="text-xs font-medium">{counts.laugh}</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full px-3"
          onClick={() => addReaction('heart')}
        >
          <Heart className="mr-1.5 h-3.5 w-3.5 text-roast-red" />
          <span className="text-xs font-medium">{counts.heart}</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-full px-3"
          onClick={() => addReaction('star')}
        >
          <Star className="mr-1.5 h-3.5 w-3.5 text-roast-yellow" />
          <span className="text-xs font-medium">{counts.star}</span>
        </Button>
      </div>
    </div>
  );
};

export default AudienceReactions;
