import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Github, Building2, FolderKanban, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { backendProfile } = useAuth();

  const handleConfigureGithub = () => {
    navigate('/organizations');
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* GitHub Integration Status Card */}
        <Card className="col-span-full mb-4 bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration Status</CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {backendProfile?.githubUsername ? (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-600 dark:text-green-500">
                  Linked to GitHub as @{backendProfile.githubUsername}
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">GitHub not connected</span>
                </div>
                <Button onClick={handleConfigureGithub} variant="default" className="gap-2">
                  <Building2 className="h-4 w-4" /> Go to Organizations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizations Quick Link */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50 hover:border-border" onClick={() => navigate('/organizations')}>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manage your teams, view memberships, and discover new groups to collaborate with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between mt-2 pt-0" size="sm">
              View Organizations <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Projects Quick Link */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50 hover:border-border" onClick={() => navigate('/projects')}>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Access your repositories, orchestrate deployments, and manage project CI/CD pipelines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between mt-2 pt-0" size="sm">
              View Projects <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
