
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudienceVotingProps {
  isOpen: boolean;
  onClose: () => void;
  onVoteComplete: (winner: string) => void;
  currentRound: number;
  user1: string;
  user2: string;
  isDemo?: boolean;
}

const AudienceVoting = ({
  isOpen,
  onClose,
  onVoteComplete,
  currentRound,
  user1,
  user2,
  isDemo = false
}: AudienceVotingProps) => {
  const [votes, setVotes] = useState({
    [user1]: 0,
    [user2]: 0
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [countdown, setCountdown] = useState(isDemo ? 5 : 10);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasVoted(false);
      setWinner(null);
      setCountdownComplete(false);
      setCountdown(isDemo ? 5 : 10);
      
      // For demo, generate random votes
      if (isDemo) {
        const interval = setInterval(() => {
          setVotes(prev => {
            const randomUser = Math.random() > 0.5 ? user1 : user2;
            return {
              ...prev,
              [randomUser]: prev[randomUser] + 1
            };
          });
        }, 600);
        
        return () => clearInterval(interval);
      }
    }
  }, [isOpen, user1, user2, isDemo]);
  
  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdownComplete) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCountdownComplete(true);
          clearInterval(timer);
          
          // Determine winner based on votes
          const winningUser = votes[user1] > votes[user2] ? user1 : 
                             votes[user2] > votes[user1] ? user2 : 
                             Math.random() > 0.5 ? user1 : user2; // Random if tied
                             
          setWinner(winningUser);
          
          // Wait 2 seconds to show winner before closing
          setTimeout(() => {
            onVoteComplete(winningUser);
            onClose();
          }, 2000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, countdownComplete, votes, user1, user2, onVoteComplete, onClose]);
  
  const handleVote = (user: string) => {
    if (hasVoted) return;
    
    setVotes(prev => ({
      ...prev,
      [user]: prev[user] + 1
    }));
    
    setHasVoted(true);
    toast.success("Vote submitted!");
  };
  
  const totalVotes = votes[user1] + votes[user2];
  const getPercentage = (voteCount: number) => 
    totalVotes === 0 ? 50 : Math.round((voteCount / totalVotes) * 100);
  
  return (
    <AlertDialog open={isOpen} onOpenChange={() => !countdownComplete && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-xl">
            {countdownComplete 
              ? winner 
                ? `Round ${currentRound} Winner: ${winner}!` 
                : "Round Complete!"
              : `Vote for Round ${currentRound} Winner!`
            }
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {!countdownComplete && (
              <span className="block font-semibold text-lg">{countdown}s</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {[user1, user2].map((user) => (
            <div key={user} className="flex flex-col items-center">
              <Button 
                onClick={() => handleVote(user)}
                disabled={hasVoted || countdownComplete}
                className={`w-full py-6 mb-2 ${hasVoted && votes[user] === Math.max(votes[user1], votes[user2]) ? 'ring-2 ring-roast-orange' : ''}`}
                variant={winner === user ? "default" : "outline"}
              >
                {user}
              </Button>
              
              <div className="w-full bg-roast-dark-gray/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-roast-red to-roast-orange transition-all duration-500 ease-out"
                  style={{ width: `${getPercentage(votes[user])}%` }} 
                />
              </div>
              <span className="text-sm mt-1">{votes[user]} votes ({getPercentage(votes[user])}%)</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-2">
          <span className="text-sm text-roast-light-gray">Total votes: {totalVotes}</span>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AudienceVoting;
