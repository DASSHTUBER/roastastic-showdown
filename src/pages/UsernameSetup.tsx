
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Mail, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const signinSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const usernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters")
});

const UsernameSetup = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const { isLoading, user, username: existingUsername, signInWithGoogle, setUsername: saveUsername, signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const signinForm = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" }
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" }
  });

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: "" }
  });

  // Auth mode state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    console.log('UsernameSetup check:', { user: user?.id, existingUsername });
    
    // Check if we should redirect after auth
    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    
    if (!isLoading) {
      if (user) {
        if (existingUsername) {
          // User has a username, redirect them
          console.log('User has username, redirecting to:', redirectPath || '/');
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth');
            navigate(redirectPath);
          } else {
            navigate('/');
          }
        } else {
          // User is logged in but needs a username
          console.log('User needs to set username');
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

  const handleEmailSignIn = async (values: z.infer<typeof signinSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('Signing in with:', values.email);
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('Signing up with:', values.email);
      await signUpWithEmail(values.email, values.password);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUsername = async (values: z.infer<typeof usernameSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('Setting username:', values.username);
      const success = await saveUsername(values.username);
      
      if (success) {
        const redirectPath = sessionStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterAuth');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Username submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#8023a5]">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse">
            Roast<span className="text-[#00E1A0]">Battle</span>
          </h1>
          <p className="mt-4 text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

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
              <Form {...signinForm}>
                <form onSubmit={signinForm.handleSubmit(handleEmailSignIn)} className="space-y-4 mb-6">
                  <FormField
                    control={signinForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signinForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Mail className="h-5 w-5" />
                    <span>Sign In with Email</span>
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleEmailSignUp)} className="space-y-4 mb-6">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Mail className="h-5 w-5" />
                    <span>Sign Up with Email</span>
                  </Button>
                </form>
              </Form>
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
        
        <Form {...usernameForm}>
          <form onSubmit={usernameForm.handleSubmit(handleSubmitUsername)}>
            <FormField
              control={usernameForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormControl>
                    <Input
                      placeholder="CoolRoaster123"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full p-4"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-white/60 text-sm mt-2">
                    Username must be 3-20 characters
                  </FormDescription>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="gartic-accent-button w-full py-6 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UsernameSetup;
