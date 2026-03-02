import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { projectService } from '../services/project.service';
import { organizationService } from '../services/organization.service';
import { eventService } from '../services/event.service';
import { githubService } from '../services/github.service';
import { useAuth } from '../context/auth.context';
import type { Project, Organization } from '../types/app.types';

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
import { FolderKanban, ArrowRight, Github, Plus, Globe, Shield, Lock, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const createProjectSchema = z.object({
  name: z.string().min(2, { message: 'Project name is required (min 2 chars).' }),
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric and hyphens.' }),
  targetOrg: z.string().optional(),
  eventId: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INTERNAL']),
}).refine(data => !data.targetOrg || (data.targetOrg && data.eventId), {
  message: "Organization projects must be associated with an event.",
  path: ["eventId"],
});

const importProjectSchema = z.object({
  selectedRepo: z.string().min(1, { message: 'A repository must be selected.' }),
  name: z.string().min(2, { message: 'Project name is required.' }),
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric and hyphens.' }),
  targetOrg: z.string().optional(),
  eventId: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INTERNAL']),
}).refine(data => !data.targetOrg || (data.targetOrg && data.eventId), {
  message: "Organization projects must be associated with an event.",
  path: ["eventId"],
});

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dialog State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [createFormEvents, setCreateFormEvents] = useState<import('../types/app.types').Event[]>([]);
  const [importFormEvents, setImportFormEvents] = useState<import('../types/app.types').Event[]>([]);
  const createForm = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      slug: '',
      targetOrg: '',
      eventId: '',
      visibility: 'PRIVATE',
    },
  });

  // Import from GitHub State & Form
  const { backendProfile } = useAuth();
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');

  const importForm = useForm<z.infer<typeof importProjectSchema>>({
    resolver: zodResolver(importProjectSchema),
    defaultValues: {
      selectedRepo: '',
      name: '',
      slug: '',
      targetOrg: '',
      eventId: '',
      visibility: 'PRIVATE',
    },
  });

  // Event fetching logic for selectors
  const watchCreateOrg = createForm.watch('targetOrg');
  const watchImportOrg = importForm.watch('targetOrg');

  useEffect(() => {
    if (watchCreateOrg) {
      eventService.getOrganizationEvents(watchCreateOrg)
        .then(events => setCreateFormEvents(events.filter(e => e.status === 'OPEN')))
        .catch(console.error);
    } else {
      setCreateFormEvents([]);
      createForm.setValue('eventId', '');
    }
  }, [watchCreateOrg, createForm]);

  useEffect(() => {
    if (watchImportOrg) {
      eventService.getOrganizationEvents(watchImportOrg)
        .then(events => setImportFormEvents(events.filter(e => e.status === 'OPEN')))
        .catch(console.error);
    } else {
      setImportFormEvents([]);
      importForm.setValue('eventId', '');
    }
  }, [watchImportOrg, importForm]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectData, orgData] = await Promise.all([
        projectService.getMyProjects(),
        organizationService.getOrganizations()
      ]);
      setProjects(projectData);
      setMyOrganizations(orgData);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenImport = async () => {
    if (!backendProfile?.githubUsername) {
      toast.warning('Not Connected', {
        description: 'Please connect your GitHub account via the Profile page first.',
      });
      return;
    }
    setImportLoading(true);
    try {
      const repos = await githubService.getGlobalAvailableRepositories();
      setAvailableRepos(repos);
    } catch (err) {
      console.error('Failed to load repositories', err);
      toast.error('GitHub Connection Error', {
        description: 'Could not load GitHub repositories.',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleRepoSelect = (repo: string) => {
    importForm.setValue('selectedRepo', repo);
    const name = repo.split('/')[1];
    importForm.setValue('name', name);
    importForm.setValue('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  };

  const onSubmitImport = async (values: z.infer<typeof importProjectSchema>) => {
    setLoading(true);
    try {
      await projectService.createProject(values.targetOrg || null, {
        name: values.name,
        slug: values.slug,
        githubRepoFullName: values.selectedRepo,
        eventId: values.eventId,
        visibility: values.visibility,
        active: true,
      });
      setShowImportForm(false);
      importForm.reset();
      loadData();
      toast.success('Project Imported Successfully', {
        description: `${values.name} has been imported from GitHub.`,
      });
    } catch (err) {
      console.error('Import failed', err);
      toast.error('Import Failed', {
        description: 'An error occurred while importing the repository.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCreate = async (values: z.infer<typeof createProjectSchema>) => {
    try {
      await projectService.createProject(values.targetOrg || null, {
        name: values.name,
        slug: values.slug,
        eventId: values.eventId,
        visibility: values.visibility,
      });
      createForm.reset();
      setShowCreateForm(false);
      loadData();
      toast.success('Project Created', {
        description: `Successfully created ${values.name}`,
      });
    } catch (err) {
      console.error(err);
      toast.error('Creation Failed', {
        description: 'Error creating the blank project.',
      });
    }
  };

  // --- Tanstack Table Configuration ---
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }) => {
        const p = row.original;
        const Icon = p.visibility === 'PUBLIC' ? Globe : p.visibility === 'INTERNAL' ? Shield : Lock;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {p.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Icon className="h-3 w-3" />
                {p.visibility.toLowerCase()}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Namespace',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-sm">{row.original.slug}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/p/${p.slug}`)}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/projects/${p.id}/manage`)}
            >
              Manage <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your repositories and applications.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Blank Project Dialog */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Blank Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Initialize an empty project workspace.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
                  <FormField
                    control={createForm.control}
                    name="targetOrg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Context (Organization)</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            {...field}
                          >
                            <option value="">Personal Namespace</option>
                            {myOrganizations.map((org) => (
                              <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchCreateOrg && (
                    <FormField
                      control={createForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Association *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              {...field}
                            >
                              <option value="">Select Event...</option>
                              {createFormEvents.map((evt) => (
                                <option key={evt.id} value={evt.id}>{evt.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Analytics Engine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug Identifier</FormLabel>
                        <FormControl>
                          <Input placeholder="analytics-engine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            {...field}
                          >
                            <option value="PRIVATE">Private (Only You/Admins)</option>
                            <option value="INTERNAL">Internal (All Org Members)</option>
                            <option value="PUBLIC">Public (Visible to everyone)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-4">Create Project</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Import GitHub Project Dialog */}
          <Dialog open={showImportForm} onOpenChange={(open) => {
            setShowImportForm(open);
            if (open) handleOpenImport();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Github className="h-4 w-4" /> Import GitHub
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Import Repository</DialogTitle>
                <DialogDescription>
                  Select a repository from your connected GitHub account to sync.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4 mt-4">
                <Form {...importForm}>
                  <form id="import-form" onSubmit={importForm.handleSubmit(onSubmitImport)} className="space-y-6">
                    
                    <FormField
                      control={importForm.control}
                      name="targetOrg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Context</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              {...field}
                            >
                              <option value="">Personal Namespace</option>
                              {myOrganizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchImportOrg && (
                      <FormField
                        control={importForm.control}
                        name="eventId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Association *</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                {...field}
                              >
                                <option value="">Select Event...</option>
                                {importFormEvents.map((evt) => (
                                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-2">
                      <Label>Select Repository</Label>
                      <Input
                        placeholder="Search repositories..."
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                      <div className="border rounded-md h-40 overflow-y-auto bg-muted/20">
                        {importLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading from GitHub...</div>
                        ) : (
                          availableRepos
                            .filter(r => r.toLowerCase().includes(repoSearchQuery.toLowerCase()))
                            .map(repo => {
                              const isSelected = importForm.watch('selectedRepo') === repo;
                              return (
                                <div
                                  key={repo}
                                  onClick={() => handleRepoSelect(repo)}
                                  className={`p-3 text-sm cursor-pointer border-b last:border-0 hover:bg-muted transition-colors ${isSelected ? 'bg-primary/5 font-medium text-primary' : ''}`}
                                >
                                  {repo}
                                </div>
                              );
                            })
                        )}
                      </div>
                      {importForm.formState.errors.selectedRepo && (
                        <p className="text-sm font-medium text-destructive">{importForm.formState.errors.selectedRepo.message}</p>
                      )}
                    </div>

                    {importForm.watch('selectedRepo') && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={importForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={importForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={importForm.control}
                          name="visibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visibility Sync</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                  {...field}
                                >
                                  <option value="PRIVATE">Private Ecosystem</option>
                                  <option value="PUBLIC">Public Ecosystem</option>
                                  <option value="INTERNAL">Internal Organization</option>
                                </select>
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">This maps the GitHub repository visibility to your internal DeveloperOS RBAC.</p>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                  </form>
                </Form>
              </div>
              <div className="border-t pt-4 mt-auto flex justify-end gap-2 bg-background">
                <Button variant="outline" onClick={() => setShowImportForm(false)}>Cancel</Button>
                <Button type="submit" form="import-form" disabled={!importForm.watch('selectedRepo') || loading}>
                  {loading ? 'Syncing...' : 'Complete Import'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>All projects attached to your active context.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading infrastructure...</div>
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
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No deployments found. Start by importing a repository.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ProjectsListPage;
