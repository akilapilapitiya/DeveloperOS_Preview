import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { projectService } from '../services/project.service';
import { projectMembershipService } from '../services/project-membership.service';
import type { Project, ProjectMembership, GitHubCommit, GitHubInsights } from '../types/app.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  Star, 
  GitFork, 
  ArrowLeft, 
  Settings, 
  Globe, 
  Lock, 
  Users, 
  Code2,
  Calendar,
  Building2,
  ExternalLink,
  History as HistoryIcon,
  BarChart3,
  GitBranch
} from 'lucide-react';

const ProjectHome: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMembership[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [insights, setInsights] = useState<GitHubInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (projectSlug) {
      loadProject();
    }
  }, [projectSlug]);

  const loadProject = async () => {
    if (!projectSlug) return;
    setLoading(true);
    try {
      const data = await projectService.getProjectBySlug(projectSlug);
      setProject(data);
      if (data.id) {
        const memberData = await projectMembershipService.getProjectMembers(data.id);
        setMembers(memberData);
        
        if (data.githubRepoFullName) {
          loadCommits(data.id);
          loadInsights(data.id);
        }
      }
    } catch (err) {
      console.error('Failed to load project', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async (projectId: string) => {
    setLoadingInsights(true);
    try {
      const data = await projectService.getProjectGitHubInsights(projectId);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadCommits = async (projectId: string) => {
    setLoadingCommits(true);
    try {
      const data = await projectService.getProjectCommits(projectId);
      setCommits(data);
    } catch (err) {
      console.error('Failed to load commits', err);
    } finally {
      setLoadingCommits(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!project) return (
    <div className="p-8 text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Project not found</h2>
      <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Link to={`/projects/${project.id}/manage`}>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" /> Manage Project
          </Button>
        </Link>
      </div>
      
      {/* Project Banner / Identity */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shadow-sm">
            {project.avatarPath ? (
              <img 
                src={`/api/v1/files/${project.avatarPath}`} 
                alt={project.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground uppercase">
                {project.name?.[0]}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
            <Badge variant={project.visibility === 'PRIVATE' ? 'destructive' : 'secondary'} className="gap-1">
              {project.visibility === 'PRIVATE' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {project.visibility}
            </Badge>
            {!project.active && <Badge variant="outline">Inactive</Badge>}
          </div>

          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            {project.githubRepoFullName && (
              <>
                <div className="flex items-center gap-1.5 bg-background border rounded-full px-3 py-1 font-medium text-foreground shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {project.stars ?? 0}
                </div>
                <div className="flex items-center gap-1.5 bg-background border rounded-full px-3 py-1 font-medium text-foreground shadow-sm">
                  <GitFork className="w-4 h-4 text-blue-500" />
                  {project.forks ?? 0}
                </div>
              </>
            )}
            {project.language && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                <Code2 className="w-4 h-4" />
                {project.language}
              </div>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="flex gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="font-normal text-xs">#{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Top Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Repository Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Github className="w-5 h-5" /> Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.githubRepoFullName ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">GitHub Project</span>
                  <a 
                    href={`https://github.com/${project.githubRepoFullName}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary font-bold hover:underline break-all truncate text-sm"
                  >
                    {project.githubRepoFullName}
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Branch</span>
                    <span className="font-mono">{project.defaultBranch || 'main'}</span>
                  </div>
                  {project.repositoryUrl && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source URL</span>
                      <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                No repository linked.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repository Insights */}
        {project.githubRepoFullName && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingInsights ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : insights ? (
                <>
                  <div className="space-y-3">
                    <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-muted">
                      {Object.entries(insights.languages).map(([lang, bytes], index) => {
                        const totalBytes = Object.values(insights.languages).reduce((a: number, b: number) => a + b, 0);
                        const percentage = (bytes / totalBytes) * 100;
                        const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-cyan-500'];
                        return (
                          <div 
                            key={lang} 
                            className={`${colors[index % colors.length]} h-full`} 
                            style={{ width: `${percentage}%` }}
                            title={`${lang}: ${percentage.toFixed(1)}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {Object.entries(insights.languages).slice(0, 3).map(([lang, bytes], index) => {
                        const totalBytes = Object.values(insights.languages).reduce((a: number, b: number) => a + b, 0);
                        const percentage = (bytes / totalBytes) * 100;
                        const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-cyan-500'];
                        return (
                          <div key={lang} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <div className={`w-1.5 h-1.5 rounded-full ${colors[index % colors.length]}`} />
                            <span className="font-semibold text-foreground">{lang}</span>
                            <span>{percentage.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {insights.branches.length} Branches
                    </span>
                    <span className="font-mono px-1.5 py-0.5 bg-muted rounded">
                      {insights.defaultBranch}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-xs text-muted-foreground">
                  No insights found.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" /> Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.slice(0, 3).map(member => (
                <div key={member.id} className="flex items-center justify-between border-b border-muted last:border-0 pb-2 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{member.userFullName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{member.role}</p>
                  </div>
                </div>
              ))}
              {members.length > 3 && (
                <p className="text-[10px] text-center text-muted-foreground font-medium pt-1">
                  + {members.length - 3} more members
                </p>
              )}
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-2">No members.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Layout: Content & Sidebar-style Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-2">
        
        {/* Left Aspect: README & Description */}
        <div className="lg:col-span-3 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
               <h3 className="text-xl font-bold text-foreground">Overview</h3>
               <Separator className="flex-1" />
            </div>
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed italic text-sm md:text-base">
                  {project.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          </section>

          {project.readmeContent && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                 <h3 className="text-xl font-bold text-foreground">Project README</h3>
                 <Separator className="flex-1" />
              </div>
              <Card className="shadow-sm border-muted/60">
                <CardContent className="pt-8 prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-pre:bg-muted prose-pre:border prose-a:text-primary prose-headings:border-b prose-headings:pb-2">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      td: ({ node, ...props }) => {
                        const { vAlign, ...rest } = props as any;
                        return <td {...rest} valign={vAlign} />;
                      },
                      th: ({ node, ...props }) => {
                        const { vAlign, ...rest } = props as any;
                        return <th {...rest} valign={vAlign} />;
                      }
                    }}
                  >
                    {project.readmeContent}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Right Aspect: Activity & Meta */}
        <div className="lg:col-span-1 space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> Activity</span>
              {loadingCommits && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>}
            </h3>
            
            <Card className="border-muted/60 shadow-none bg-background/50">
              <CardContent className="p-0">
                {loadingCommits && commits.length === 0 ? (
                  <div className="p-8 flex flex-col items-center gap-3 text-muted-foreground text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-xs">Live Sync...</p>
                  </div>
                ) : commits.length > 0 ? (
                  <div className="divide-y divide-muted/50">
                    {commits.slice(0, 10).map((commit) => (
                      <div key={commit.sha} className="p-3 hover:bg-muted/30 transition-colors group">
                        <div className="flex gap-3 items-start">
                           <div className="flex-shrink-0 mt-0.5">
                             {commit.avatarUrl ? (
                               <img src={commit.avatarUrl} alt={commit.authorName} className="w-6 h-6 rounded-full border shadow-sm" />
                             ) : (
                               <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] uppercase border">
                                 {commit.authorName?.[0]}
                               </div>
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-xs font-semibold leading-snug line-clamp-2 md:line-clamp-none text-foreground group-hover:text-primary transition-colors cursor-default">
                               {commit.message}
                             </p>
                             <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                               <span className="font-bold text-foreground/70">{commit.authorName}</span>
                               <span>•</span>
                               <span>{new Date(commit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                             </div>
                           </div>
                           <a 
                             href={commit.url} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="flex-shrink-0 p-1 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                           >
                             <ExternalLink className="w-3 h-3" />
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border-t">
                    <p className="text-xs italic">No activity found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Meta Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Details</h3>
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {project.organizationId && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Org: <span className="font-mono">{project.organizationId.substring(0, 8)}...</span></span>
                  </div>
                )}
                {project.eventName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event: <span className="font-semibold text-foreground">{project.eventName}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ProjectHome;

