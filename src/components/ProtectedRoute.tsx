
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireUsername?: boolean;
  allowAnonymous?: boolean;
}

const ProtectedRoute = ({ children, requireUsername = true, allowAnonymous = true }: ProtectedRouteProps) => {
  const { isLoading, user, username } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute state:', { 
      isLoading, 
      userId: user?.id, 
      isAuthenticated: !!user, 
      username,
      isAnonymous: user?.app_metadata?.provider === 'anonymous',
      requireUsername,
      allowAnonymous
    });
  }, [isLoading, user, username, requireUsername, allowAnonymous]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#8023a5]">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse">
            Roast<span className="text-[#00E1A0]">Battle</span>
          </h1>
          <p className="mt-4 text-white/80">Checking login status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Store current path to redirect back after authentication
    const currentPath = window.location.pathname;
    console.log('User not authenticated, redirecting to /auth. Will return to:', currentPath);
    sessionStorage.setItem('redirectAfterAuth', currentPath);
    return <Navigate to="/auth" replace />;
  }

  const isAnonymous = user.app_metadata?.provider === 'anonymous';
  console.log('Authentication check passed. User is anonymous:', isAnonymous);
  
  // If the user is anonymous and we allow anonymous users, we don't require a username
  if (requireUsername && !username && !(allowAnonymous && isAnonymous)) {
    console.log('Username required but not found, redirecting to username setup');
    return <Navigate to="/username-setup" replace />;
  }

  console.log('All checks passed, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
