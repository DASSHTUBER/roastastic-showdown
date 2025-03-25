
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import UserVideo from './UserVideo';
import { X } from 'lucide-react';

interface UserMatchmakingProps {
  onCancel: () => void;
}

const UserMatchmaking = ({ onCancel }: UserMatchmakingProps) => {
  const [searchTime, setSearchTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format search time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="glass-light rounded-2xl p-6 flex flex-col items-center">
        <div className="w-full max-w-sm mb-8">
          <UserVideo 
            username="You" 
            isCurrentUser={true}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="animate-pulse h-3 w-3 bg-roast-red rounded-full"></span>
            <h3 className="text-xl font-semibold">Finding an opponent</h3>
          </div>
          
          <p className="text-roast-light-gray mb-6">
            Time elapsed: {formatTime(searchTime)}
          </p>
          
          <div className="flex justify-center mb-4">
            <div className="h-8 w-8 border-4 border-roast-red/30 border-t-roast-red rounded-full animate-spin"></div>
          </div>
          
          <p className="text-sm text-roast-light-gray mb-6">
            Searching for someone who's ready to get roasted...
          </p>
          
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="rounded-full px-4"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserMatchmaking;
