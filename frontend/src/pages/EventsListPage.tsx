import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { eventParticipantService } from '../services/eventParticipant.service';
import type { EventParticipant } from '../types/app.types';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const EventsListPage: React.FC = () => {
  const { backendProfile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [backendProfile]);

  const loadEvents = async () => {
    if (!backendProfile?.id) return;
    try {
      setLoading(true);
      const data = await eventParticipantService.getUserEvents(backendProfile.id);
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load your events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const administeredEvents = events.filter(e => e.role === 'ADMINISTRATOR');
  const participatingEvents = events.filter(e => e.role === 'PARTICIPANT');

  const renderEventTable = (eventList: EventParticipant[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">Loading events...</TableCell>
          </TableRow>
        ) : eventList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
              No events found in this category.
            </TableCell>
          </TableRow>
        ) : (
          eventList.map(ep => (
            <TableRow key={ep.id}>
              <TableCell className="font-medium truncate max-w-[250px]" title={ep.eventName || ep.eventId}>
                {ep.eventName || ep.eventId}
              </TableCell>
              <TableCell className="text-muted-foreground truncate max-w-[200px]" title={ep.organizationName || 'Personal'}>
                {ep.organizationName || 'Personal'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(ep.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/events/${ep.eventId}/manage`)}>
                  {ep.role === 'PARTICIPANT' ? 'View' : 'Manage'}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground mt-1">Events and activities you are participating in or managing.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Administered Events
            </CardTitle>
            <CardDescription>Events where you hold an Administrator role.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderEventTable(administeredEvents)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Participating Events
            </CardTitle>
            <CardDescription>Events you have joined as a Participant.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderEventTable(participatingEvents)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventsListPage;
