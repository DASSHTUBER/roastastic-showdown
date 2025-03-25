
import { useState, useEffect } from 'react';

interface RoundTimerProps {
  duration: number; // in seconds
  currentRound: number;
  totalRounds: number;
  onComplete?: () => void;
}

const RoundTimer = ({ duration, currentRound, totalRounds, onComplete }: RoundTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  
  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration, currentRound]);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, onComplete]);
  
  // Calculate progress percentage
  const progress = (timeLeft / duration) * 100;
  
  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-between w-full">
        <span className="text-sm font-medium">Round {currentRound} of {totalRounds}</span>
        <span className={`text-sm font-medium ${timeLeft < 10 ? 'text-roast-red animate-pulse-soft' : ''}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="w-full h-2 bg-roast-dark-gray/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-roast-red to-roast-orange transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default RoundTimer;
