import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationService } from '../services/organization.service';
import { projectService } from '../services/project.service';
import { membershipService } from '../services/membership.service';
import { eventService } from '../services/event.service';
import { OrganizationMembersTab } from './components/OrganizationMembersTab';
import { OrganizationEventsTab } from './components/OrganizationEventsTab';
import type { Organization, Project, Membership, Event } from '../types/app.types';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Settings, Users, Calendar, FolderKanban, LogOut, Link2, Info } from 'lucide-react';
import { toast } from 'sonner';

const OrganizationPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Membership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingMemberships, setPendingMemberships] = useState<Membership[]>([]);
  
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  
  const [loading, setLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState<Partial<Organization>>({});

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const orgData = await organizationService.getOrganization(orgId);
      
      const isDeveloper = orgData.currentUserRole === 'DEVELOPER';

      const [projectData, memberData, eventsData, pendingData] = await Promise.all([
        organizationService.getOrganizationProjects(orgId),
        membershipService.getMembers(orgId),
        eventService.getOrganizationEvents(orgId),
        isDeveloper ? Promise.resolve([]) : membershipService.getPendingRequests(orgId)
      ]);

      setOrganization(orgData);
      setProjects(projectData);
      setMembers(memberData.filter(m => m.status === 'ACTIVE'));
      setPendingMemberships(pendingData);
      setEvents(eventsData);
      
      setSettingsForm({
          location: orgData.location || '',
          industry: orgData.industry || '',
          website: orgData.website || '',
          description: orgData.description || '',
          name: orgData.name
        });
    } catch (err) {
      console.error('Failed to load organization data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!orgId || !window.confirm('Delete Organization? This action is irreversible.')) return;
    try {
      await organizationService.deleteOrganization(orgId);
      toast.success('Organization deleted');
      navigate('/organizations');
    } catch (err) {
      toast.error('Error deleting organization');
    }
  };

  const handleUpdateMetadata = async () => {
    if (!orgId) return;
    try {
      await organizationService.updateOrganization(orgId, settingsForm);
      await loadData();
      toast.success('Organization settings updated successfully');
    } catch (err) {
      toast.error('Error updating organization');
    }
  };



  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !orgId) return;
    try {
      const fileName = await organizationService.uploadBanner(e.target.files[0]);
      await organizationService.updateOrganization(orgId, { bannerPath: fileName });
      await loadData();
      toast.success('Banner uploaded successfully');
    } catch (err) {
      toast.error('Error uploading banner');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !orgId) return;
    try {
      const fileName = await organizationService.uploadBanner(e.target.files[0]);
      await organizationService.updateOrganization(orgId, { logoPath: fileName });
      await loadData();
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error('Error uploading logo');
    }
  };

  const handleEditProject = async (id: string, currentName: string) => {
    const newName = window.prompt('Update Project Name:', currentName);
    if (!newName || newName === currentName || !orgId) return;
    try {
      await projectService.updateProject(orgId, id, { name: newName });
      loadData();
      toast.success('Project renamed');
    } catch (err) {
      toast.error('Error updating project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!orgId || !window.confirm('Delete Project?')) return;
    try {
      await projectService.deleteProject(orgId, id);
      loadData();
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Error deleting project');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Organization Workspace...</div>;
  if (!organization) return <div className="p-8 text-center">Organization not found. <Button variant="link" onClick={() => navigate('/organizations')}>Back</Button></div>;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {organization.bannerPath && (
        <div style={{ width: '100%', height: '200px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
          <img 
            src={`/api/v1/files/banners/${organization.bannerPath}`} 
            alt="Organization Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          {organization.logoPath ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
              <img 
                src={`/api/v1/files/banners/${organization.logoPath}`} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border bg-muted flex items-center justify-center shrink-0">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-muted-foreground">@{organization.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {organization.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={organization.website} target="_blank" rel="noreferrer">
                <Link2 className="w-4 h-4 mr-2" />
                Visit Website
              </a>
            </Button>
          )}
          {organization.currentUserRole !== 'DEVELOPER' && (
            <Button variant="destructive" size="sm" onClick={handleDeleteOrg}>
              <LogOut className="w-4 h-4 mr-2" />
              Delete Organization
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 h-10 w-full sm:w-auto overflow-x-auto justify-start inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <Info className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          {organization?.currentUserRole !== 'DEVELOPER' && (
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Overview</CardTitle>
              <CardDescription>Basic information and context about {organization.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{organization.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Industry</h4>
                  <p className="text-sm">{organization.industry || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Location</h4>
                  <p className="text-sm">{organization.location || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Total Members</h4>
                  <p className="text-sm">{members.length}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Total Projects</h4>
                  <p className="text-sm">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Projects</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by Event:</span>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="none">Standalone Projects</SelectItem>
                    {events.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {organization?.currentUserRole !== 'DEVELOPER' && (
                <Button onClick={() => window.location.href = `/import`}>Import Project</Button>
              )}
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects
                  .filter(p => {
                    if (selectedEventId === 'all') return true;
                    if (selectedEventId === 'none') return !p.eventId;
                    return p.eventId === selectedEventId;
                  })
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No projects found.</TableCell>
                  </TableRow>
                ) : (
                  projects
                    .filter(p => {
                      if (selectedEventId === 'all') return true;
                      if (selectedEventId === 'none') return !p.eventId;
                      return p.eventId === selectedEventId;
                    })
                    .map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.eventName || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/p/${p.slug}`)}>View</Button>
                          {organization?.currentUserRole !== 'DEVELOPER' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${p.id}/manage`)}>Manage</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditProject(p.id, p.name)}>Rename</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProject(p.id)}>Delete</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <OrganizationMembersTab 
            orgId={orgId!} 
            members={members} 
            pendingMemberships={pendingMemberships} 
            currentUserRole={organization.currentUserRole}
            loadData={loadData} 
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <OrganizationEventsTab 
            orgId={orgId!} 
            events={events} 
            currentUserRole={organization.currentUserRole}
            loadData={loadData} 
          />
        </TabsContent>

        {organization?.currentUserRole !== 'DEVELOPER' && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>Update your public profile and workspace metadata.</CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organization Name</label>
                      <Input 
                        value={settingsForm.name || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input 
                        value={settingsForm.location || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry</label>
                      <Input 
                        value={settingsForm.industry || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, industry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Brief Description</label>
                      <Textarea 
                        value={settingsForm.description || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website</label>
                      <Input 
                        value={settingsForm.website || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Square Logo</label>
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cover Banner</label>
                      <Input type="file" accept="image/*" onChange={handleBannerUpload} className="cursor-pointer" />
                    </div>
                  </div>
               </CardContent>
               <CardFooter className="flex justify-end gap-3 border-t pt-6 mt-6">
                 <Button variant="outline" onClick={() => loadData()}>Discard Changes</Button>
                 <Button onClick={handleUpdateMetadata}>Save Settings</Button>
               </CardFooter>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
};

export default OrganizationPage;
