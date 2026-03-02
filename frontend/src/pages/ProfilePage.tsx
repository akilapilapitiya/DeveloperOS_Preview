import React from 'react';
import { useAuth } from '../context/auth.context';
import GithubConfigComponent from '../components/github-config.component';
import { profileService } from '../services/profile.service';
import { organizationService } from '../services/organization.service';
import { skillService } from '../services/skill.service';
import type { Skill, UserSkill, ProficiencyLevel, Organization } from '../types/app.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Github,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Building2,
  User as UserIcon,
  LogOut,
  Mail,
  ShieldAlert,
  Camera,
  Plus,
  X,
  Code2,
  ChevronRight,
  Pencil,
} from 'lucide-react';

// ── Schema ──────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  websiteUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  twitterUsername: z.string().max(50).optional(),
  phoneNumber: z.string().max(20).optional(),
  secondaryEmail: z.string().email('Must be a valid email').or(z.literal('')).optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// ── Constants ────────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:8081';
const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';


const CATEGORY_ORDER = ['LANGUAGE', 'FRAMEWORK', 'DEVOPS', 'DATABASE', 'CLOUD', 'OTHER'];
const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE:  'Languages',
  FRAMEWORK: 'Frameworks',
  DEVOPS:    'DevOps',
  DATABASE:  'Databases',
  CLOUD:     'Cloud',
  OTHER:     'Other',
};

// ── Skill Badge ──────────────────────────────────────────────────────────────
const LEVEL_DOT: Record<ProficiencyLevel, string> = {
  BEGINNER:     'bg-yellow-400',
  INTERMEDIATE: 'bg-blue-400',
  EXPERT:       'bg-emerald-400',
};

const SkillBadge: React.FC<{ skill: UserSkill; onRemove?: (skillId: string) => void }> = ({ skill, onRemove }) => (
  <div className="group relative flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted border border-border/50 hover:border-border text-xs font-medium transition-all cursor-default">
    <img
      src={`${DEVICON_BASE}/${skill.iconSlug}/${skill.iconSlug}-original.svg`}
      alt={skill.name}
      className="w-4 h-4 object-contain shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <span className="text-foreground/90">{skill.name}</span>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[skill.level]}`} title={skill.level.charAt(0) + skill.level.slice(1).toLowerCase()} />
    {onRemove && (
      <button
        onClick={() => onRemove(skill.skillId)}
        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        title="Remove"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { userProfile, backendProfile, authenticated, logout } = useAuth();
  const [showGithubConfig, setShowGithubConfig] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [skillsOpen, setSkillsOpen] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Skills state
  const [userSkills, setUserSkills] = React.useState<UserSkill[]>([]);
  const [catalog, setCatalog] = React.useState<Skill[]>([]);
  const [orgs, setOrgs] = React.useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = React.useState(true);
  const [skillSearch, setSkillSearch] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<ProficiencyLevel>('INTERMEDIATE');
  const [activeCategory, setActiveCategory] = React.useState('ALL');

  React.useEffect(() => {
    skillService.getMySkills().then(setUserSkills).catch(() => {});
    skillService.getCatalog().then(setCatalog).catch(() => {});
    organizationService.getOrganizations()
      .then(setOrgs)
      .catch(() => {})
      .finally(() => setOrgsLoading(false));
  }, []);

  const ownedOrgs = orgs.filter(o => o.currentUserRole === 'OWNER');
  const adminOrgs = orgs.filter(o => o.currentUserRole === 'ADMIN');
  const devOrgs = orgs.filter(o => o.currentUserRole !== 'OWNER' && o.currentUserRole !== 'ADMIN');

  const userSkillIds = new Set(userSkills.map(s => s.skillId));

  const filteredCatalog = catalog.filter(
    s => s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !userSkillIds.has(s.id)
  );

  const skillsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const skills = userSkills.filter(s => s.category === cat);
    if (skills.length) acc[cat] = skills;
    return acc;
  }, {} as Record<string, UserSkill[]>);

  const handleAddSkill = async (skill: Skill) => {
    try {
      const added = await skillService.addSkill(skill.id, selectedLevel);
      setUserSkills(prev => [...prev, added]);
      toast.success(`Added ${skill.name}`);
      setSkillSearch('');
    } catch {
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await skillService.removeSkill(skillId);
      setUserSkills(prev => prev.filter(s => s.skillId !== skillId));
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  // Avatar
  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalAvatarUrl(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    try {
      await profileService.uploadAvatar(file);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
      setLocalAvatarUrl(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  const avatarSrc =
    localAvatarUrl ||
    (backendProfile?.avatarPath ? `${BACKEND_URL}/api/v1/files/avatars/${backendProfile.avatarPath}` : null) ||
    backendProfile?.githubAvatarUrl ||
    null;

  // Profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      company: '',
      location: '',
      websiteUrl: '',
      twitterUsername: '',
      phoneNumber: '',
      secondaryEmail: '',
    },
  });

  // Sync form values whenever backendProfile loads or changes
  React.useEffect(() => {
    if (backendProfile) {
      form.reset({
        bio: backendProfile.bio || '',
        company: backendProfile.company || '',
        location: backendProfile.location || '',
        websiteUrl: backendProfile.websiteUrl || '',
        twitterUsername: backendProfile.twitterUsername || '',
        phoneNumber: backendProfile.phoneNumber || '',
        secondaryEmail: backendProfile.secondaryEmail || '',
      });
    }
  }, [backendProfile]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile(data);
      form.reset({
        bio: updated.bio || '',
        company: updated.company || '',
        location: updated.location || '',
        websiteUrl: updated.websiteUrl || '',
        twitterUsername: updated.twitterUsername || '',
        phoneNumber: updated.phoneNumber || '',
        secondaryEmail: updated.secondaryEmail || '',
      });
      setEditOpen(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!authenticated) return null;

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

        {/* ── Left Column: Public profile view ── */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <div className="flex flex-col items-center md:items-start space-y-4 md:sticky md:top-24">

            {/* Click-to-upload avatar */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-20 h-20 text-muted-foreground" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <span className="text-white text-xs">Uploading…</span>
                ) : (
                  <>
                    <Camera className="text-white w-8 h-8" />
                    <span className="text-white text-xs mt-1">Change photo</span>
                  </>
                )}
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userProfile?.firstName} {userProfile?.lastName}</h1>
              <p className="text-muted-foreground">@{backendProfile?.username || 'developer'}</p>
            </div>



            {backendProfile?.bio && <p className="text-sm leading-relaxed">{backendProfile.bio}</p>}

            <Button variant="outline" className="w-full md:w-auto" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>

            {/* Meta info */}
            <div className="space-y-3 pt-4 w-full text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> <span>{userProfile?.email}</span>
              </div>
              {backendProfile?.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> <span>{backendProfile.company}</span>
                </div>
              )}
              {backendProfile?.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> <span>{backendProfile.location}</span>
                </div>
              )}
              {backendProfile?.websiteUrl && (
                <div className="flex items-center gap-2 text-primary hover:underline cursor-pointer">
                  <LinkIcon className="h-4 w-4" />
                  <a href={backendProfile.websiteUrl} target="_blank" rel="noreferrer">
                    {backendProfile.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {backendProfile?.twitterUsername && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Twitter className="h-4 w-4" /> <span>@{backendProfile.twitterUsername}</span>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* ── Right Column: Edit Settings ── */}
        <div className="md:col-span-8 lg:col-span-9 space-y-8">
          
          <div className="flex justify-end pt-2 mb-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile Info
            </Button>
          </div>

          {/* ── Skills ── */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1 block mt-1">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" /> Skills &amp; Technologies
                </CardTitle>
                <CardDescription>
                  {userSkills.length === 0
                    ? 'No skills added yet'
                    : `${userSkills.length} skill${userSkills.length === 1 ? '' : 's'} added`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setSkillsOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Manage Skills
              </Button>
            </CardHeader>
            <CardContent>
              {Object.keys(skillsByCategory).length > 0 && (
                <div className="space-y-4 pt-2">
                  {CATEGORY_ORDER.filter(cat => skillsByCategory[cat]).map(cat => (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsByCategory[cat].map(skill => (
                          <SkillBadge key={skill.id} skill={skill} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50 mt-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Beginner</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Intermediate</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Expert</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Organizations ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Organizations
                {orgs.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 ml-1">
                    {orgs.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orgsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-12 rounded-lg bg-muted/60 animate-pulse" />
                  ))}
                </div>
              ) : orgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not a member of any organization yet.</p>
              ) : (
                <div className="space-y-6">
                  {ownedOrgs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Owned Organizations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ownedOrgs.map(org => (
                          <a
                            key={org.id}
                            href={`/organizations/${org.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
                              {org.logoPath ? (
                                <img src={`/api/v1/files/banners/${org.logoPath}`} alt={org.name} className="w-full h-full object-cover" />
                              ) : (
                                org.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{org.name}</p>
                              {org.industry && <p className="text-xs text-muted-foreground truncate">{org.industry}</p>}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminOrgs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Administered Organizations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {adminOrgs.map(org => (
                          <a
                            key={org.id}
                            href={`/organizations/${org.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
                              {org.logoPath ? (
                                <img src={`/api/v1/files/banners/${org.logoPath}`} alt={org.name} className="w-full h-full object-cover" />
                              ) : (
                                org.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{org.name}</p>
                              {org.industry && <p className="text-xs text-muted-foreground truncate">{org.industry}</p>}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {devOrgs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Member of Organizations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {devOrgs.map(org => (
                          <a
                            key={org.id}
                            href={`/organizations/${org.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
                              {org.logoPath ? (
                                <img src={`/api/v1/files/banners/${org.logoPath}`} alt={org.name} className="w-full h-full object-cover" />
                              ) : (
                                org.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{org.name}</p>
                              {org.industry && <p className="text-xs text-muted-foreground truncate">{org.industry}</p>}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect external accounts to sync repository data and deployment states.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center">
                    <Github className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">GitHub</p>
                    <p className="text-xs text-muted-foreground">
                      {backendProfile?.githubUsername
                        ? `Linked as @${backendProfile.githubUsername}`
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowGithubConfig(true)}>
                  {backendProfile?.githubUsername ? 'Manage' : 'Connect'}
                </Button>
              </div>

              {showGithubConfig && (
                <div className="mt-6 border-t pt-6">
                  <GithubConfigComponent onClose={() => setShowGithubConfig(false)} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/70">
                Irreversible actions related to your account security and data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4 bg-destructive/10" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Delete Account</p>
                  <p className="text-xs text-muted-foreground italic">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Manage Skills Dialog ── */}
      <Dialog open={skillsOpen} onOpenChange={setSkillsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Skills &amp; Technologies
            </DialogTitle>
            <DialogDescription>
              Add or remove skills from your profile. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Current skills */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your skills</p>
              {userSkills.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg py-6 flex flex-col items-center gap-2 text-muted-foreground">
                  <Code2 className="w-7 h-7 opacity-40" />
                  <p className="text-sm">No skills added yet</p>
                  <p className="text-xs opacity-70">Browse the catalog below to add your first skill</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSkills.map(skill => (
                    <div
                      key={skill.id}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted border border-border/50 hover:border-border text-xs font-medium transition-all"
                    >
                      <img
                        src={`${DEVICON_BASE}/${skill.iconSlug}/${skill.iconSlug}-original.svg`}
                        alt={skill.name}
                        className="w-4 h-4 object-contain shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span>{skill.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${LEVEL_DOT[skill.level]}`} title={skill.level} />
                      <button
                        onClick={() => handleRemoveSkill(skill.skillId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-0.5"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Browse catalog */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Browse catalog</p>

              {/* Search + level toggler */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search… (e.g. Rust, Kafka, ArgoCD)"
                    value={skillSearch}
                    onChange={e => { setSkillSearch(e.target.value); setActiveCategory('ALL'); }}
                    className="pr-8"
                  />
                  {skillSearch && (
                    <button
                      onClick={() => setSkillSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex rounded-md border border-input overflow-hidden text-xs font-medium shrink-0">
                  {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as ProficiencyLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3 py-1.5 transition-colors border-r last:border-r-0 border-input ${
                        selectedLevel === lvl
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {lvl === 'BEGINNER' ? 'Beginner' : lvl === 'INTERMEDIATE' ? 'Mid' : 'Expert'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter tabs */}
              {!skillSearch && (
                <div className="flex gap-1 flex-wrap">
                  {['ALL', ...CATEGORY_ORDER].map(cat => {
                    const count = cat === 'ALL'
                      ? catalog.filter(s => !userSkillIds.has(s.id)).length
                      : catalog.filter(s => s.category === cat && !userSkillIds.has(s.id)).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                          activeCategory === cat
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:bg-muted'
                        }`}
                      >
                        {cat === 'ALL' ? 'All' : CATEGORY_LABELS[cat]}
                        <span className="ml-1.5 opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Catalog list */}
              <div className="border border-border rounded-lg overflow-hidden">
                {(() => {
                  const visible = (skillSearch
                    ? filteredCatalog
                    : catalog.filter(s => !userSkillIds.has(s.id) && (activeCategory === 'ALL' || s.category === activeCategory))
                  ).slice(0, 24);
                  if (visible.length === 0) {
                    return (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        {skillSearch ? `No skills match "${skillSearch}"` : 'All skills in this category are already added!'}
                      </div>
                    );
                  }
                  return (
                    <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
                      {visible.map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => handleAddSkill(skill)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left group"
                        >
                          <img
                            src={`${DEVICON_BASE}/${skill.iconSlug}/${skill.iconSlug}-original.svg`}
                            alt={skill.name}
                            className="w-5 h-5 object-contain shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="flex-1 font-medium">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[skill.category]}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary font-semibold">
                            <Plus className="w-3.5 h-3.5" /> Add
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Level legend */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />Beginner</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />Intermediate</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Expert</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setSkillsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your public profile information. Changes are visible to other developers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Bio" rows={3} {...form.register('bio')} />
              {form.formState.errors.bio && (
                <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
              )}
            </div>

            {/* Company + Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Company" {...form.register('company')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Location" {...form.register('location')} />
              </div>
            </div>

            {/* Website + Twitter */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input id="websiteUrl" placeholder="Website URL" {...form.register('websiteUrl')} />
                {form.formState.errors.websiteUrl && (
                  <p className="text-xs text-destructive">{form.formState.errors.websiteUrl.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUsername">Twitter</Label>
                <Input id="twitterUsername" placeholder="Twitter Username" {...form.register('twitterUsername')} />
              </div>
            </div>

            {/* Phone + Secondary Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" placeholder="Phone Number" {...form.register('phoneNumber')} />
                {form.formState.errors.phoneNumber && (
                  <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryEmail">Secondary Email</Label>
                <Input id="secondaryEmail" type="email" placeholder="Secondary Email" {...form.register('secondaryEmail')} />
                {form.formState.errors.secondaryEmail && (
                  <p className="text-xs text-destructive">{form.formState.errors.secondaryEmail.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
