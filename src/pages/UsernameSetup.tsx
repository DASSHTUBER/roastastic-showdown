
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from 'lucide-react';

const UsernameSetup = () => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setUsername: saveUsername, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    const success = await saveUsername(username);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#8023a5] p-4">
        <div className="gartic-panel w-full max-w-md p-8 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Sign In to RoastBattle</h1>
          <p className="text-white/80 mb-8">Sign in with your Google account to start battling!</p>
          
          <Button 
            className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
            onClick={signInWithGoogle}
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In with Google</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8023a5] p-4">
      <div className="gartic-panel w-full max-w-md p-8 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Username</h1>
        <p className="text-white/80 mb-8 text-center">Pick a unique username that will be shown to other players.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="CoolRoaster123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full p-4"
              minLength={3}
              maxLength={20}
              required
            />
            <p className="text-white/60 text-sm mt-2">Username must be 3-20 characters</p>
          </div>
          
          <Button 
            type="submit" 
            className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
            disabled={isSubmitting || username.trim().length < 3}
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;
