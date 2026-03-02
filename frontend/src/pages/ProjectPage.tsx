import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { projectMembershipService } from '../services/project-membership.service';
import { githubService } from '../services/github.service';
import type { Environment, ProjectMembership, ProjectRole, GitHubConfig } from '../types/app.types';
import { toast } from 'sonner';

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Github, 
  Users, 
  Layers, 
  Settings2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [members, setMembers] = useState<ProjectMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Member Form States
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectRole>('CONTRIBUTOR');
  
  // Form states
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvSlug, setNewEnvSlug] = useState('');

  // Project Settings States
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectVisibility, setProjectVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'INTERNAL'>('PRIVATE');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [projectBranch, setProjectBranch] = useState('main');
  const [projectLanguage, setProjectLanguage] = useState('');
  const [projectTags, setProjectTags] = useState('');
  const [projectReadme, setProjectReadme] = useState('');
  const [projectActive, setProjectActive] = useState(true);
  const [projectOrgId, setProjectOrgId] = useState('');
  const [projectAvatarPath, setProjectAvatarPath] = useState('');

  // Upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // GitHub States
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [githubRepoFullName, setGithubRepoFullName] = useState('');
  const [stars, setStars] = useState<number | undefined>(0);
  const [forks, setForks] = useState<number | undefined>(0);
  const [orgGitHubConfig, setOrgGitHubConfig] = useState<GitHubConfig | null>(null);
  const [, setLoadingConfig] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const project = await projectService.getProjectById(projectId!);
      setProjectName(project.name);
      setProjectDescription(project.description || '');
      setProjectVisibility(project.visibility);
      setProjectRepoUrl(project.repositoryUrl || '');
      setProjectBranch(project.defaultBranch || 'main');
      setProjectLanguage(project.language || '');
      setProjectTags(project.tags ? project.tags.join(', ') : '');
      setProjectReadme(project.readmeContent || '');
      setProjectActive(project.active);
      setProjectOrgId(project.organizationId);
      setProjectAvatarPath(project.avatarPath || '');
      setGithubRepoFullName(project.githubRepoFullName || '');
      setStars(project.stars);
      setForks(project.forks);

      await Promise.all([
        loadEnvironments(),
        loadMembers(),
        loadAvailableRepos(),
        loadOrgGitHubConfig(project.organizationId)
      ]);
    } catch (err) {
      console.error('Failed to load project data', err);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProjectMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !projectOrgId) return;
    try {
      await projectService.updateProject(projectOrgId, projectId, {
        name: projectName,
        description: projectDescription,
        visibility: projectVisibility,
        repositoryUrl: projectRepoUrl,
        defaultBranch: projectBranch,
        language: projectLanguage,
        tags: projectTags ? projectTags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        readmeContent: projectReadme,
        active: projectActive
      });
      toast.success('Project updated successfully!');
      loadData();
    } catch (err) {
      toast.error('Error updating project');
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !projectId) return;
    setUploadingAvatar(true);
    try {
      await projectService.uploadProjectAvatar(projectId, avatarFile);
      toast.success('Avatar uploaded successfully!');
      setAvatarFile(null);
      loadData();
    } catch (err: any) {
      console.error('Avatar upload failed', err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const loadEnvironments = async () => {
    if (!projectId) return;
    try {
      const data = await projectService.getEnvironments(projectId);
      setEnvironments(data);
    } catch (err) {
      console.error('Failed to load environments', err);
    }
  };

  const loadMembers = async () => {
    if (!projectId) return;
    setLoadingMembers(true);
    try {
      const data = await projectMembershipService.getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadAvailableRepos = async () => {
    if (!projectId) return;
    try {
      const repos = await projectService.getAvailableGitHubRepositories(projectId);
      setAvailableRepos(repos);
    } catch (err) {
      console.error('Failed to load available repositories', err);
    }
  };

  const loadOrgGitHubConfig = async (orgId: string) => {
    setLoadingConfig(true);
    try {
      const config = await githubService.getConfig(orgId);
      setOrgGitHubConfig(config);
    } catch (err) {
      console.error('Failed to load organization GitHub config', err);
    } finally {
      setLoadingConfig(false);
    }
  };


  const handleConnectOrgGitHub = () => {
    if (!projectOrgId) return;
    navigate(`/organizations/${projectOrgId}`);
  };

  const handleSyncGitHub = async () => {
    if (!projectId) return;
    setSyncing(true);
    try {
      await projectService.syncGitHubMetadata(projectId);
      toast.success('GitHub metadata synced successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync with GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const handleLinkRepo = async (repoName: string) => {
    if (!projectId || !projectOrgId) return;
    try {
      await projectService.updateProject(projectOrgId, projectId, {
        githubRepoFullName: repoName
      });
      setGithubRepoFullName(repoName);
      toast.success(`Linked to ${repoName}`);
      loadData();
    } catch (err) {
      toast.error('Failed to link repository');
    }
  };

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await projectService.createEnvironment(projectId, {
        name: newEnvName,
        slug: newEnvSlug,
        active: true
      });
      toast.success('Environment created');
      setNewEnvName('');
      setNewEnvSlug('');
      loadEnvironments();
    } catch (err) {
      toast.error('Error creating environment');
    }
  };

  const handleEditEnv = async (id: string, currentName: string) => {
    const newName = window.prompt('Update Environment Name:', currentName);
    if (!newName || newName === currentName || !projectId) return;
    try {
      await projectService.updateEnvironment(projectId, id, { name: newName });
      toast.success('Environment updated');
      loadEnvironments();
    } catch (err) {
      toast.error('Error updating environment');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !memberEmail) return;
    try {
      await projectMembershipService.addProjectMember(projectId, memberEmail, memberRole);
      toast.success('Member added');
      setMemberEmail('');
      loadMembers();
    } catch (err) {
      toast.error('Error adding member. Ensure the user exists.');
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!projectId || !window.confirm('Remove this member?')) return;
    try {
      await projectMembershipService.removeProjectMember(projectId, membershipId);
      toast.success('Member removed');
      loadMembers();
    } catch (err) {
      toast.error('Error removing member.');
    }
  };

  const handleUpdateMemberRole = async (membershipId: string, newRole: ProjectRole) => {
    if (!projectId) return;
    try {
      await projectMembershipService.updateProjectMemberRole(projectId, membershipId, newRole);
      toast.success('Role updated');
      loadMembers();
    } catch (err) {
      toast.error('Error updating role.');
    }
  };

  const handleDeleteEnv = async (id: string) => {
    if (!projectId || !window.confirm('Delete Environment?')) return;
    try {
      await projectService.deleteEnvironment(projectId, id);
      toast.success('Environment deleted');
      loadEnvironments();
    } catch (err) {
      toast.error('Error deleting environment');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{projectId}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2"><Settings2 className="w-4 h-4" /> General</TabsTrigger>
          <TabsTrigger value="environments" className="gap-2"><Layers className="w-4 h-4" /> Environments</TabsTrigger>
          <TabsTrigger value="team" className="gap-2"><Users className="w-4 h-4" /> Team</TabsTrigger>
          <TabsTrigger value="github" className="gap-2"><Github className="w-4 h-4" /> GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your project details and visibility.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="project-form" onSubmit={handleUpdateProjectMetadata} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input id="name" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select value={projectVisibility} onValueChange={(v: any) => setProjectVisibility(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="INTERNAL">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={projectDescription} 
                      onChange={e => setProjectDescription(e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Primary Language</Label>
                      <Input id="language" value={projectLanguage} onChange={e => setProjectLanguage(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input id="tags" value={projectTags} onChange={e => setProjectTags(e.target.value)} placeholder="react, typescript, oss" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readme">README Content (Markdown)</Label>
                    <textarea 
                      id="readme"
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={projectReadme} 
                      onChange={e => setProjectReadme(e.target.value)} 
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={projectActive} onChange={e => setProjectActive(e.target.checked)} id="activeCheck" className="rounded border-gray-300" />
                  <Label htmlFor="activeCheck">Project Active</Label>
                </div>
                <Button type="submit" form="project-form" className="gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Identity</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-2xl bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden">
                    {projectAvatarPath ? (
                      <img src={`/api/v1/files/${projectAvatarPath}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="w-full space-y-2">
                    <Input 
                      type="file" 
                      onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
                      accept="image/*"
                      className="text-xs"
                    />
                    <Button 
                      className="w-full text-xs" 
                      variant="secondary" 
                      onClick={handleAvatarUpload}
                      disabled={!avatarFile || uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Update Avatar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stats Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{stars ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{forks ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Forks</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="environments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deployment Environments</CardTitle>
                <CardDescription>Manage stages for your project deployments.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Environment Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No environments configured.
                      </TableCell>
                    </TableRow>
                  ) : (
                    environments.map((env) => (
                      <TableRow key={env.id}>
                        <TableCell className="font-medium">{env.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-mono">{env.slug}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditEnv(env.id || '', env.name)}>Rename</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEnv(env.id || '')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <Separator />
            <CardFooter className="bg-muted/30 pt-6">
              <form onSubmit={handleCreateEnv} className="flex gap-4 w-full">
                <div className="flex-1">
                  <Input placeholder="Name (e.g. Production)" value={newEnvName} onChange={e => setNewEnvName(e.target.value)} required />
                </div>
                <div className="flex-1">
                  <Input placeholder="Slug (e.g. prod)" value={newEnvSlug} onChange={e => setNewEnvSlug(e.target.value)} required />
                </div>
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Project Team</CardTitle>
              <CardDescription>Members with access to manage this project.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingMembers ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : members.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No members found.</TableCell></TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-semibold">{member.userFullName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{member.userEmail}</TableCell>
                        <TableCell>
                          <Select 
                            value={member.role} 
                            onValueChange={(v: any) => handleUpdateMemberRole(member.id || '', v)}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OWNER">OWNER</SelectItem>
                              <SelectItem value="CONTRIBUTOR">CONTRIBUTOR</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => handleRemoveMember(member.id || '')}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <Separator />
            <CardFooter className="bg-muted/30 pt-6">
              <form onSubmit={handleAddMember} className="flex gap-4 w-full items-end">
                <div className="flex-[2] space-y-2">
                  <Label className="text-xs">Invite Email</Label>
                  <Input placeholder="user@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Role</Label>
                  <Select value={memberRole} onValueChange={(v: any) => setMemberRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">OWNER</SelectItem>
                      <SelectItem value="CONTRIBUTOR">CONTRIBUTOR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" variant="secondary">Add Member</Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 underline underline-offset-4 decoration-primary"><Github className="w-5 h-5" /> GitHub Integration</CardTitle>
                  <CardDescription>Connect sources and sync project metadata.</CardDescription>
                </div>
                {orgGitHubConfig?.githubAccessToken && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 px-3 py-1">
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} /> Linked
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!orgGitHubConfig?.githubAccessToken ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 border-2 border-dashed rounded-xl">
                  <div className="p-4 bg-muted rounded-full">
                    <Github className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">No GitHub Connection</p>
                    <p className="text-sm text-muted-foreground px-8 max-w-sm">Connect your organization the GitHub account to enable repository linking.</p>
                  </div>
                  <Button onClick={handleConnectOrgGitHub}>Go to Organization Settings</Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-2">
                        <Label>Select Repository</Label>
                        <Select 
                          value={githubRepoFullName} 
                          onValueChange={handleLinkRepo}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Select a Repository --" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRepos.map((repo) => (
                              <SelectItem key={repo} value={repo}>{repo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {githubRepoFullName && (
                        <div className="flex items-center gap-4 text-sm">
                          <Button 
                            onClick={handleSyncGitHub} 
                            disabled={syncing}
                            className="gap-2"
                          >
                            <RefreshCw className={syncing ? 'animate-spin w-4 h-4' : 'w-4 h-4'} />
                            {syncing ? 'Syncing...' : 'Sync Now'}
                          </Button>
                          <a 
                            href={`https://github.com/${githubRepoFullName}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            Open on GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-64">
                      <Card className="bg-muted/20">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm">Metadata Status</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs uppercase font-bold text-[10px]">Stars</span>
                            <span className="font-bold">{stars ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs uppercase font-bold text-[10px]">Forks</span>
                            <span className="font-bold">{forks ?? 0}</span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground text-xs uppercase font-bold text-[10px]">Last Sync</span>
                            <span className="text-[10px]">Today</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;

