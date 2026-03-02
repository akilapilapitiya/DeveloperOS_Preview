import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { organizationService } from '../services/organization.service';
import { membershipService } from '../services/membership.service';
import type { Organization } from '../types/app.types';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Search, ArrowRight, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const createOrgSchema = z.object({
  name: z.string().min(2, { message: 'Organization name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens.' }),
  description: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  establishedDate: z.string().optional(),
});

const OrganizationsListPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [enrollmentSent, setEnrollmentSent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const form = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      location: '',
      industry: '',
      website: '',
      establishedDate: '',
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    handleDiscoveryLoad();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const orgData = await organizationService.getOrganizations();
      setOrganizations(orgData);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoveryLoad = async () => {
    setSearchLoading(true);
    try {
      const results = await organizationService.searchOrganizations('');
      setSearchResults(results);
    } catch (err) {
      console.error('Discovery load failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSubmitCreate = async (values: z.infer<typeof createOrgSchema>) => {
    try {
      await organizationService.createOrganization(values as Partial<Organization>);
      form.reset();
      setCreateModalOpen(false);
      loadData();
      toast.success('Organization created successfully');
    } catch (err: any) {
      toast.error('Failed to create organization', {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const results = await organizationService.searchOrganizations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRequestEnrollment = async (orgId: string) => {
    try {
      await membershipService.enrollInOrganization(orgId);
      setEnrollmentSent((prev) => [...prev, orgId]);
      toast.success('Enrollment request sent!');
    } catch (error: any) {
      toast.error('Failed to send request', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // --- Tanstack Table Configuration (My Organizations) ---
  const myOrgsColumns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      header: 'Organization Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div className="flex justify-end relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="gap-2"
            >
              {org.currentUserRole === 'DEVELOPER' ? 'View' : 'Manage'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: organizations,
    columns: myOrgsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Section: Header & Quick Create */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage your teams and workspaces.</p>
        </div>

        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new organization workspace.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter organization name *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter unique URL slug *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter brief description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter industry category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter physical location or region" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter official website URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="establishedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="date" placeholder="Select established date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Organizations</CardTitle>
          <CardDescription>Organizations where you hold a membership role.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={myOrgsColumns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovery Section (Kept as Cards for browsing visual density) */}
      <div className="space-y-4 pt-8 border-t">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discover</h2>
          <p className="text-muted-foreground">Find and request to join existing organizations.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchResults
            .filter(org => !organizations.some(myOrg => myOrg.id === org.id))
            .map((org) => {
            const isSent = enrollmentSent.includes(org.id);
            return (
              <Card key={org.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {org.logoPath ? (
                    <img
                      src={`/api/v1/files/banners/${org.logoPath}`}
                      alt="Logo"
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription>@{org.slug}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {org.description || 'No description provided.'}
                  </p>
                </CardContent>
                <div className="p-6 pt-0 flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    className="flex-1"
                    variant={isSent ? 'secondary' : 'default'}
                    disabled={isSent}
                    onClick={() => handleRequestEnrollment(org.id)}
                  >
                    {isSent ? 'Requested' : 'Join'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OrganizationsListPage;
