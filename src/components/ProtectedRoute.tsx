
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireUsername?: boolean;
}

const ProtectedRoute = ({ children, requireUsername = true }: ProtectedRouteProps) => {
  const { isLoading, user, username } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white animate-pulse-soft">
            Roast<span className="text-[#00E1A0]">Battle</span>
          </h1>
          <p className="mt-4 text-white/80 animate-pulse-soft">Checking login status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireUsername && !username) {
    return <Navigate to="/username-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
