
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Mail, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const UsernameSetup = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const { isLoading, user, username: existingUsername, signInWithGoogle, setUsername: saveUsername, signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
  const navigate = useNavigate();

  // Email auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    console.log('UsernameSetup check:', { user: !!user, existingUsername });
    
    // Check if we should redirect after auth
    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    
    if (!isLoading) {
      if (user) {
        if (existingUsername) {
          // User has a username, redirect them
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth');
            navigate(redirectPath);
          } else {
            navigate('/');
          }
        } else {
          // User is logged in but needs a username
          setShowUsernameForm(true);
        }
      }
      
      setLoading(false);
    }
  }, [isLoading, user, existingUsername, navigate]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleAnonymousSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInAnonymously();
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      toast.error('Failed to sign in anonymously.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      toast.success('Account created! Please check your email for verification.');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to sign up. The email might already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setUsernameError('Please enter a username');
      return;
    }
    
    if (usernameError) {
      return;
    }
    
    setIsSubmitting(true);
    const success = await saveUsername(username);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/', { replace: true });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#8023a5] p-4">
        <div className="gartic-panel w-full max-w-md p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Welcome to <span className="text-[#00E1A0]">RoastBattle</span>
          </h1>
          
          <Tabs defaultValue="signin" className="w-full" onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  <Mail className="h-5 w-5" />
                  <span>Sign In with Email</span>
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  <Mail className="h-5 w-5" />
                  <span>Sign Up with Email</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#8023a5] px-2 text-white">OR</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              className="gartic-button w-full py-6 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In with Google</span>
            </Button>
            
            <Button 
              className="gartic-button w-full py-6 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600"
              onClick={handleAnonymousSignIn}
              disabled={isSubmitting}
            >
              <UserRound className="h-5 w-5" />
              <span>Continue Anonymously</span>
            </Button>
          </div>
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
            {usernameError && <p className="text-red-500 text-sm mt-2">{usernameError}</p>}
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
