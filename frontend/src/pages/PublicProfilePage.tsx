import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicProfileService } from '../services/publicProfile.service';
import { followService } from '../services/follow.service';
import { useAuth } from '../context/auth.context';
import type { PublicProfile, UserSkill, ProficiencyLevel, FollowUser } from '../types/app.types';
import {
  MapPin, Link as LinkIcon, Twitter, Building2,
  User as UserIcon, Github, ArrowLeft, Code2, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ── Constants ────────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:8081';
const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

const CATEGORY_ORDER = ['LANGUAGE', 'FRAMEWORK', 'DEVOPS', 'DATABASE', 'CLOUD', 'OTHER'];
const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Languages', FRAMEWORK: 'Frameworks',
  DEVOPS: 'DevOps', DATABASE: 'Databases', CLOUD: 'Cloud', OTHER: 'Other',
};

const LEVEL_DOT: Record<ProficiencyLevel, string> = {
  BEGINNER: 'bg-yellow-400',
  INTERMEDIATE: 'bg-blue-400',
  EXPERT: 'bg-emerald-400',
};

// ── Mini skill badge ─────────────────────────────────────────────────────────
const SkillChip: React.FC<{ skill: UserSkill }> = ({ skill }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/50 text-xs font-medium">
    <img
      src={`${DEVICON_BASE}/${skill.iconSlug}/${skill.iconSlug}-original.svg`}
      alt={skill.name}
      className="w-4 h-4 object-contain shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <span>{skill.name}</span>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_DOT[skill.level]}`} title={skill.level} />
  </div>
);

// ── Follower/Following user card ─────────────────────────────────────────────
const FollowUserCard: React.FC<{ user: FollowUser }> = ({ user }) => {
  const avatarSrc =
    (user.avatarPath ? `${BACKEND_URL}/api/v1/files/avatars/${user.avatarPath}` : null) ||
    user.githubAvatarUrl || null;

  return (
    <Link
      to={`/u/${user.githubUsername}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group"
    >
      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
        {avatarSrc ? (
          <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
      </div>
    </Link>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { backendProfile } = useAuth();

  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followPending, setFollowPending] = React.useState(false);

  // Follower/following list dialogs
  const [listDialog, setListDialog] = React.useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = React.useState<FollowUser[]>([]);
  const [listLoading, setListLoading] = React.useState(false);

  // Derived: is this my own profile?
  const isOwnProfile = backendProfile?.username === username;

  React.useEffect(() => {
    if (!username) return;
    setLoading(true);
    publicProfileService.getByUsername(username)
      .then(data => {
        setProfile(data);
        setIsFollowing(data.isFollowedByCurrentUser);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    if (!username || followPending) return;
    setFollowPending(true);
    try {
      if (isFollowing) {
        await followService.unfollow(username);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount - 1 } : prev);
        toast.success(`Unfollowed @${username}`);
      } else {
        await followService.follow(username);
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev);
        toast.success(`Following @${username}`);
      }
    } catch {
      toast.error('Could not update follow status');
    } finally {
      setFollowPending(false);
    }
  };

  const openList = async (type: 'followers' | 'following') => {
    if (!username) return;
    setListDialog(type);
    setListLoading(true);
    try {
      const users = type === 'followers'
        ? await followService.getFollowers(username)
        : await followService.getFollowing(username);
      setListUsers(users);
    } catch {
      toast.error('Could not load list');
    } finally {
      setListLoading(false);
    }
  };

  const avatarSrc =
    (profile?.avatarPath ? `${BACKEND_URL}/api/v1/files/avatars/${profile.avatarPath}` : null) ||
    profile?.githubAvatarUrl || null;

  const skillsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const skills = profile?.skills.filter(s => s.category === cat) || [];
    if (skills.length) acc[cat] = skills;
    return acc;
  }, {} as Record<string, UserSkill[]>);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <UserIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Profile not found</h1>
          <p className="text-sm text-muted-foreground">
            No developer with username <span className="font-mono font-medium">@{username}</span> exists yet.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Left: Avatar + identity ── */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
            {avatarSrc ? (
              <img src={avatarSrc} alt={profile.firstName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          {/* Name + username */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.username && (
              <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
            )}
          </div>

          {/* ── Follower / Following counts ── */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => openList('followers')}
              className="flex items-center gap-1.5 hover:text-primary transition-colors group"
            >
              <span className="font-bold">{profile.followerCount}</span>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                {profile.followerCount === 1 ? 'follower' : 'followers'}
              </span>
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => openList('following')}
              className="flex items-center gap-1.5 hover:text-primary transition-colors group"
            >
              <span className="font-bold">{profile.followingCount}</span>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">following</span>
            </button>
          </div>

          {/* ── Follow button (hidden on own profile) ── */}
          {!isOwnProfile && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              className="w-full"
              onClick={handleFollow}
              disabled={followPending}
            >
              {followPending ? '…' : isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
          )}

          {/* Meta links */}
          <div className="space-y-2 text-sm">
            {profile.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" /> <span>{profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" /> <span>{profile.location}</span>
              </div>
            )}
            {profile.websiteUrl && (
              <div className="flex items-center gap-2 text-primary">
                <LinkIcon className="h-4 w-4 shrink-0" />
                <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">
                  {profile.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {profile.twitterUsername && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Twitter className="h-4 w-4 shrink-0" /> <span>@{profile.twitterUsername}</span>
              </div>
            )}
            {profile.githubUsername && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4 shrink-0" />
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover:underline transition-colors"
                >
                  github.com/{profile.githubUsername}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Skills ── */}
        <div className="md:col-span-2">
          {profile.skills.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Code2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No skills added yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" /> Skills &amp; Technologies
              </h2>

              {CATEGORY_ORDER.filter(cat => skillsByCategory[cat]).map(cat => (
                <div key={cat}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillsByCategory[cat].map(skill => (
                      <SkillChip key={skill.id} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />Beginner</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />Intermediate</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Expert</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Followers / Following list Dialog ── */}
      <Dialog open={!!listDialog} onOpenChange={open => !open && setListDialog(null)}>
        <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 capitalize">
              <Users className="h-4 w-4" />
              {listDialog === 'followers' ? `Followers · ${profile.followerCount}` : `Following · ${profile.followingCount}`}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {listLoading ? (
              <div className="space-y-1 py-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted rounded animate-pulse w-32" />
                      <div className="h-3 bg-muted rounded animate-pulse w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listUsers.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {listDialog === 'followers'
                  ? 'No followers yet.'
                  : 'Not following anyone yet.'}
              </div>
            ) : (
              <div className="divide-y divide-border/50 py-1">
                {listUsers.map(u => <FollowUserCard key={u.id} user={u} />)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicProfilePage;
