import React, { useState } from 'react';
import { githubService } from '../services/github.service';
import { useAuth } from '../context/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2, Github, X, Unlink, Key } from 'lucide-react';

interface Props {
  orgId?: string;
  onClose?: () => void;
}

const GithubConfigComponent: React.FC<Props> = ({ onClose }) => {
  const { backendProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patToken, setPatToken] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken.trim()) {
      toast.warning('Please enter a Personal Access Token');
      return;
    }
    
    setLoading(true);
    try {
      await githubService.connectToken(patToken.trim());
      toast.success('GitHub connection successful!');
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to connect. Ensure your token is valid and has "repo" and "read:user" scopes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Disconnect your GitHub account? This will affect all projects linked to your account.')) return;
    setLoading(true);
    try {
      await githubService.disconnect();
      toast.success('GitHub account disconnected');
      window.location.reload();
    } catch {
      toast.error('Error disconnecting GitHub');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = !!backendProfile?.githubUsername;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span className="text-sm font-semibold">GitHub Integration</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {isConnected ? (
        /* ── Connected state ── */
        <div className="space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Connected</p>
              <p className="text-xs text-muted-foreground">Authorized as @{backendProfile.githubUsername}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}
              className="text-destructive border-destructive/40 hover:bg-destructive/10">
              <Unlink className="h-3.5 w-3.5 mr-1.5" />
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        /* ── Not connected state ── */
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your GitHub account to sync metadata and import repositories into your projects.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Personal Access Token (PAT)</h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Generate a classic Personal Access Token with <code className="bg-muted px-1 rounded">repo</code> and <code className="bg-muted px-1 rounded">read:user</code> scopes.
                <br />
                <a 
                  href="https://github.com/settings/tokens/new?description=DeveloperOS&scopes=repo,read:user" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline mt-1 inline-block"
                >
                  Click here to generate a token instantly
                </a>
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="patToken">GitHub Access Token</Label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="patToken" 
                    type="password" 
                    value={patToken}
                    onChange={e => setPatToken(e.target.value)}
                    placeholder="ghp_..." 
                    className="pl-9"
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" disabled={loading} className="w-full">
                  <Github className="h-4 w-4 mr-2" />
                  {loading ? 'Connecting...' : 'Connect GitHub'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubConfigComponent;
