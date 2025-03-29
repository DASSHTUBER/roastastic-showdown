
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireUsername?: boolean;
}

const ProtectedRoute = ({ children, requireUsername = true }: ProtectedRouteProps) => {
  const { isLoading, user, username } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute state:', { isLoading, user: !!user, username });
    
    // This ensures we navigate to the correct page after authentication
    if (user && requireUsername && username) {
      console.log('User authenticated and has username, ready to proceed');
    }
  }, [isLoading, user, username, requireUsername, navigate]);

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
    sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
    return <Navigate to="/auth" replace />;
  }

  if (requireUsername && !username) {
    return <Navigate to="/username-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
