import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import api from '../api/api';
import { eventParticipantService } from '../services/eventParticipant.service';
import { userService } from '../services/user.service';
import { projectService } from '../services/project.service';
import type { Event, EventParticipant, Project, User } from '../types/app.types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const EventManagePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { backendProfile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUserRole, setCurrentUserRole] = useState<'ADMINISTRATOR' | 'PARTICIPANT' | null>(null);

  // Modal states
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAssociateProjectOpen, setIsAssociateProjectOpen] = useState(false);
  
  // Add Participant state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ADMINISTRATOR' | 'PARTICIPANT'>('PARTICIPANT');

  // Associate Project state
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && backendProfile?.id) {
      loadData();
    }
  }, [eventId, backendProfile]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Event Details
      const eventRes = await api.get(`/api/v1/events/${eventId}`);
      setEvent(eventRes.data);

      // 2. Fetch Participants
      const participantsData = await eventParticipantService.getParticipants(eventId!);
      setParticipants(participantsData);

      // Determine current user's role
      const me = participantsData.find(p => p.userId === backendProfile?.id);
      if (me) {
        setCurrentUserRole(me.role);
      } else {
        // Fallback: Check org role
        if (eventRes.data.currentUserRole && eventRes.data.currentUserRole !== 'DEVELOPER') {
            setCurrentUserRole('ADMINISTRATOR'); // Org owners/admins act as event administrators
        } else if (eventRes.data.currentUserRole === 'DEVELOPER') {
            setCurrentUserRole('PARTICIPANT');
        }
      }

      // 3. Fetch associated projects
      const projectsRes = await api.get(`/api/v1/events/${eventId}/projects`);
      setProjects(projectsRes.data);

    } catch (err) {
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProjects = async (orgId: string) => {
    try {
      const allOrgProjects = await projectService.getProjectsByOrganization(orgId);
      // Filter out projects already associated with this event
      const eventProjectIds = new Set(projects.map(p => p.id));
      setAvailableProjects(allOrgProjects.filter(p => !eventProjectIds.has(p.id)));
    } catch (err) {
      console.error('Failed to load available projects', err);
    }
  };

  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    try {
      const results = await userService.searchUsers(query);
      setUserSearchResults(results);
    } catch (err) {
      console.error('User search failed', err);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUserId) return;
    try {
      await eventParticipantService.addParticipant(eventId!, selectedUserId, selectedRole);
      toast.success('Participant added successfully');
      setIsAddParticipantOpen(false);
      loadData();
      // Reset state
      setSelectedUserId(null);
      setUserSearchQuery('');
      setUserSearchResults([]);
    } catch (err) {
      toast.error('Failed to add participant');
    }
  };

  const handleAssociateProject = async () => {
    if (!selectedProjectId) return;
    try {
      await projectService.updateProject(event!.organizationId, selectedProjectId, { eventId });
      toast.success('Project associated successfully');
      setIsAssociateProjectOpen(false);
      loadData();
      setSelectedProjectId(null);
    } catch (err) {
      toast.error('Failed to associate project');
    }
  };

  const isAdministrator = currentUserRole === 'ADMINISTRATOR';

  const handleRemoveParticipant = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this participant?')) return;
    try {
      await eventParticipantService.removeParticipant(eventId!, userId);
      toast.success('Participant removed');
      loadData();
    } catch (err) {
      toast.error('Failed to remove participant');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading event...</div>;
  if (!event) return <div className="p-8 text-center">Event not found.</div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{event.type}</Badge>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Role: {currentUserRole || 'Unknown'}
            </span>
          </div>
          {event.description && <p className="text-muted-foreground mt-4 max-w-3xl">{event.description}</p>}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROJECTS SECTION */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Associated Projects</CardTitle>
              <CardDescription>Projects submitted to this event.</CardDescription>
            </div>
            {isAdministrator && (
              <Dialog open={isAssociateProjectOpen} onOpenChange={(open) => {
                setIsAssociateProjectOpen(open);
                if (open) loadAvailableProjects(event.organizationId);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">Associate Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Associate Project with Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Project</Label>
                      <Select onValueChange={setSelectedProjectId} value={selectedProjectId || undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project from the organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProjects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.slug})</SelectItem>
                          ))}
                          {availableProjects.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground text-center">No unassociated projects found.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAssociateProjectOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssociateProject} disabled={!selectedProjectId}>Confirm Association</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No projects registered yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/p/${p.slug}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* PARTICIPANTS SECTION */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Participants</CardTitle>
              <CardDescription>People with access to this event.</CardDescription>
            </div>
            {/* ONLY Administrators can manage users! */}
            {isAdministrator && (
              <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">Add Participant</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Participant to Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Search User (Username or Email)</Label>
                      <Input 
                        placeholder="Type to search..." 
                        value={userSearchQuery}
                        onChange={(e) => handleUserSearch(e.target.value)}
                      />
                      {userSearchResults.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                          <div className="space-y-1">
                            {userSearchResults.map(u => (
                              <div 
                                key={u.id} 
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${selectedUserId === u.id ? 'bg-primary/10 border border-primary/20' : ''}`}
                                onClick={() => setSelectedUserId(u.id)}
                              >
                                <div className="text-sm">
                                  <p className="font-medium">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-muted-foreground">{u.username || u.email}</p>
                                </div>
                                {selectedUserId === u.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PARTICIPANT">Participant</SelectItem>
                          <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddParticipant} disabled={!selectedUserId}>Add Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  {isAdministrator && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={isAdministrator ? 3 : 2} className="h-24 text-center">No participants found.</TableCell>
                    </TableRow>
                ) : participants.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="flex items-center gap-2">
                      {p.avatarPath || p.githubAvatarUrl ? (
                        <img src={p.avatarPath ? `${api.defaults.baseURL}/api/v1/files/avatars/${p.avatarPath}` : p.githubAvatarUrl} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">U</div>
                      )}
                      {p.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.role === 'ADMINISTRATOR' ? 'default' : 'secondary'}>{p.role}</Badge>
                    </TableCell>
                    {isAdministrator && (
                      <TableCell className="text-right">
                        {p.userId !== backendProfile?.id && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveParticipant(p.userId)}>Remove</Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventManagePage;
