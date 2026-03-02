import React, { useEffect } from 'react';
import { useAuth } from '../context/auth.context';
import { Button } from '@/components/ui/button';
import { ArrowRight, Terminal, Shield, Workflow } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { authenticated, login, register, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-16 flex items-center justify-between border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            OS
          </div>
          <span className="font-bold tracking-tight text-lg">Developer OS</span>
        </div>
        <div className="flex items-center gap-4">
          {authenticated ? (
            <Button asChild className="text-sm font-medium">
              <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={login} className="text-sm font-medium">
                Sign In
              </Button>
              <Button onClick={register} className="text-sm font-medium">
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40">
        <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium mb-8 bg-muted/50 text-muted-foreground backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Developer OS V2 is now live
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Your Command Center for Modern Engineering
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mb-10 leading-relaxed">
          Unify your repositories, manage environments, and automate pipelines from a single, high-performance dashboard designed for elite engineering teams.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {authenticated ? (
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/dashboard">Enter Command Center <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={register} className="h-12 px-8 text-base">
                Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={login} className="h-12 px-8 text-base">
                Sign In to Workspace
              </Button>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl text-left">
          <div className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Unified Infrastructure</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect your GitHub organizations and seamlessly manage projects and namespaces across your entire fleet.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Shadow CI Pipelines</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Automated GitLab CI/CD mirroring triggered invisibly via GitHub webhooks. True cross-platform orchestration.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl border border-border bg-card/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Enterprise RBAC</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Granular multi-tenant access control backed by strict, encrypted role enforcement and Keycloak SSO.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Developer OS. All rights reserved. Built for scale.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
