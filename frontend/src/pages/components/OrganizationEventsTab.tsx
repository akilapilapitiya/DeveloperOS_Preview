import React, { useState } from 'react';
import { eventService } from '../../services/event.service';
import type { Event, EventType } from '../../types/app.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrganizationEventsTabProps {
  orgId: string;
  events: Event[];
  currentUserRole?: string;
  loadData: () => Promise<void>;
}

export const OrganizationEventsTab: React.FC<OrganizationEventsTabProps> = ({
  orgId,
  events,
  currentUserRole,
  loadData
}) => {
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('EVENT');
  const [maxProjects, setMaxProjects] = useState<number | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    try {
      await eventService.createEvent(orgId, {
        name: newEventName,
        slug: newEventSlug,
        description: newEventDescription,
        type: newEventType,
        maxProjectsPerUser: maxProjects !== '' ? Number(maxProjects) : undefined
      });
      setNewEventName('');
      setNewEventSlug('');
      setNewEventDescription('');
      setNewEventType('EVENT');
      setMaxProjects('');
      setIsCreateOpen(false);
      loadData();
      toast.success('Event created');
    } catch (err) {
      toast.error('Error creating event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
      if (!orgId || !window.confirm('Are you sure you want to delete this event?')) return;
      try {
          await eventService.deleteEvent(eventId);
          toast.success('Event deleted');
          loadData();
      } catch (err) {
          toast.error('Failed to delete event');
      }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Events</h3>
        {currentUserRole !== 'DEVELOPER' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>Schedule a new activity, competition, or general event.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Name</label>
                  <Input placeholder="Enter event name..." value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Slug</label>
                  <Input placeholder="e.g. annual-hackathon-2026" value={newEventSlug} onChange={e => setNewEventSlug(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="What is this event about?" value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium leading-none">Event Type</label>
                  <Select value={newEventType} onValueChange={(val: EventType) => setNewEventType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVITY">Activity</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="COMPETITION">Competition</SelectItem>
                      <SelectItem value="PROJECT_GROUP">Project Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Max Projects Per Participant (Optional)</label>
                  <Input type="number" min="1" placeholder="Leave empty for unlimited" value={maxProjects} onChange={e => setMaxProjects(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="md:col-span-2 pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Event</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Past Events</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No events found.</TableCell>
              </TableRow>
            ) : (
              events.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'CLOSED' ? "outline" : "default"}>
                      {e.status === 'CLOSED' ? 'Closed' : 'Open'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.href = `/events/${e.id}/manage`}>{currentUserRole === 'DEVELOPER' ? 'View' : 'Manage'}</Button>
                    {currentUserRole !== 'DEVELOPER' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              await eventService.updateEvent(e.id, { status: e.status === 'CLOSED' ? 'OPEN' : 'CLOSED' });
                              toast.success('Status updated');
                              loadData();
                            } catch (error) {
                              toast.error('Failed to change status');
                            }
                          }}
                        >
                          {e.status === 'CLOSED' ? 'Reopen' : 'Close'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEvent(e.id)}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
