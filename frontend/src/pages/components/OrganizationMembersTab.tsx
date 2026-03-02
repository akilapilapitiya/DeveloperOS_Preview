import React, { useState } from 'react';
import { membershipService } from '../../services/membership.service';
import type { Membership } from '../../types/app.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OrganizationMembersTabProps {
  orgId: string;
  members: Membership[];
  pendingMemberships: Membership[];
  currentUserRole?: string;
  loadData: () => Promise<void>;
}

export const OrganizationMembersTab: React.FC<OrganizationMembersTabProps> = ({
  orgId,
  members,
  pendingMemberships,
  currentUserRole,
  loadData
}) => {
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'OWNER' | 'ADMIN' | 'DEVELOPER'>('DEVELOPER');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !orgId) return;
    try {
      await membershipService.addMember(orgId, newMemberEmail, newMemberRole);
      setNewMemberEmail('');
      loadData();
      toast.success('Invitation sent');
    } catch (err) {
      toast.error('Error adding member');
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!orgId || !window.confirm('Remove member?')) return;
    try {
      await membershipService.removeMember(orgId, membershipId);
      loadData();
      toast.success('Member removed');
    } catch (err) {
      toast.error('Error removing member');
    }
  };

  const handleUpdateRole = async (membershipId: string, role: string) => {
    if (!orgId) return;
    try {
      await membershipService.updateRole(orgId, membershipId, role);
      toast.success('Role updated');
      loadData();
    } catch (err) {
      toast.error('Error updating role');
    }
  };

  const handleUpdateStatus = async (membershipId: string, status: 'ACTIVE' | 'REJECTED') => {
    if (!orgId) return;
    try {
      await membershipService.updateStatus(orgId, membershipId, status);
      toast.success('Status updated');
      loadData();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {currentUserRole !== 'DEVELOPER' && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
            <CardDescription>Send an invitation to join the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="flex gap-4 items-start">
              <div className="flex-1">
                <Input type="email" placeholder="Email Address" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
              </div>
              <Select value={newMemberRole} onValueChange={(val: any) => setNewMemberRole(val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEVELOPER">Developer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Invite</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Total members: {members.length}
            </CardDescription>
          </div>
          <div>
            <Select value={memberFilter} onValueChange={setMemberFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="OWNER">Owners</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="DEVELOPER">Developers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              {currentUserRole !== 'DEVELOPER' && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members
              .filter((m) => memberFilter === 'ALL' || m.role === memberFilter)
              .map((m: Membership) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{m.userFullName}</p>
                    <p className="text-sm text-muted-foreground">{m.userEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {currentUserRole !== 'DEVELOPER' ? (
                    <Select value={m.role} onValueChange={(val: 'OWNER' | 'ADMIN' | 'DEVELOPER') => handleUpdateRole(m.id, val)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEVELOPER">Developer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm border rounded-md px-3 py-1 bg-muted/50">{m.role}</span>
                  )}
                </TableCell>
                {currentUserRole !== 'DEVELOPER' && (
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(m.id)}>Remove</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {members.filter((m) => memberFilter === 'ALL' || m.role === memberFilter).length === 0 && (
              <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No members found matching the selected filter.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {pendingMemberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Join Requests ({pendingMemberships.length})</CardTitle>
            <CardDescription>Users waiting for approval to join.</CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingMemberships.map((m: Membership) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium">{m.userFullName}</p>
                    <p className="text-sm text-muted-foreground">{m.userEmail}</p>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleUpdateStatus(m.id, 'ACTIVE')} className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(m.id, 'REJECTED')} className="text-destructive hover:bg-destructive/10 hover:text-destructive">Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
