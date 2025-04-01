import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  username: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  setUsername: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // When auth state changes, check for username
        if (currentSession?.user) {
          setTimeout(() => fetchUsername(currentSession.user.id), 0);
        } else {
          setUsernameState(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUsername(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsername = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching username:', error);
        return;
      }

      setUsernameState(data?.username || null);
    } catch (error) {
      console.error('Error in fetchUsername:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const currentUrl = window.location.origin;
      console.log('Redirecting to:', currentUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) {
        toast.error(`Failed to sign in: ${error.message}`);
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred`);
      console.error('Unexpected error during Google sign-in:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Failed to sign in: ${error.message}`);
        console.error('Error signing in with email:', error);
        throw error;
      } else {
        toast.success('Signed in successfully');
      }
    } catch (error) {
      console.error('Unexpected error during email sign-in:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) {
        toast.error(`Failed to sign up: ${error.message}`);
        console.error('Error signing up with email:', error);
        throw error;
      }
    } catch (error) {
      console.error('Unexpected error during email sign-up:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        toast.error(`Failed to sign in anonymously: ${error.message}`);
        console.error('Error signing in anonymously:', error);
      } else {
        toast.success('Signed in anonymously');
        
        const randomUsername = `Guest_${Math.floor(Math.random() * 10000)}`;
        if (data.user) {
          await setUsername(randomUsername);
        }
      }
    } catch (error) {
      toast.error(`An unexpected error occurred`);
      console.error('Unexpected error during anonymous sign-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Failed to sign out: ${error.message}`);
        console.error('Error signing out:', error);
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error(`An unexpected error occurred`);
      console.error('Unexpected error during sign-out:', error);
    }
  };

  const setUsername = async (newUsername: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to set a username');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          username: newUsername,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('Username is already taken');
        } else {
          toast.error(`Failed to set username: ${error.message}`);
        }
        console.error('Error setting username:', error);
        return false;
      }

      setUsernameState(newUsername);
      toast.success('Username set successfully');
      return true;
    } catch (error) {
      toast.error(`An unexpected error occurred`);
      console.error('Unexpected error setting username:', error);
      return false;
    }
  };

  const value = {
    session,
    user,
    username,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymously,
    signOut,
    setUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
