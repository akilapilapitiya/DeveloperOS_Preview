import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8">
      {/* Visual Element */}
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
          <Terminal className="h-12 w-12 opacity-20" />
        </div>
        <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-lg animate-bounce">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      {/* Error Message */}
      <div className="space-y-3 max-w-md">
        <h1 className="text-6xl font-black tracking-tighter text-muted-foreground/20">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Endpoint Not Found</h2>
        <p className="text-muted-foreground leading-relaxed">
          The coordinate you're looking for doesn't exist in the Developer OS network. 
          It might have been moved or decommissioned.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="gap-2 h-11 px-6"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
        <Button 
          onClick={() => navigate(authenticated ? '/dashboard' : '/')}
          className="gap-2 h-11 px-8 shadow-lg shadow-primary/20"
        >
          <Home className="h-4 w-4" /> 
          {authenticated ? 'Back to Dashboard' : 'Return Home'}
        </Button>
      </div>

      {/* Subtle Footer */}
      <div className="pt-12">
        <code className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono bg-muted/50 px-3 py-1 rounded-full border">
          Status Code: ER_ROUTE_MISSING
        </code>
      </div>
    </div>
  );
};

export default NotFoundPage;
