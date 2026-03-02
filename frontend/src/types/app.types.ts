export type EventType = 'ACTIVITY' | 'EVENT' | 'COMPETITION' | 'PROJECT_GROUP';
export type EventStatus = 'OPEN' | 'CLOSED';
export type EventRole = 'ADMINISTRATOR' | 'PARTICIPANT';

export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: EventType;
  startDate?: string;
  endDate?: string;
  organizationId: string;
  maxProjectsPerUser?: number;
  status: EventStatus;
  currentUserRole?: EventRole;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  eventName?: string;
  organizationName?: string;
  userId: string;
  username: string;
  avatarPath?: string;
  githubAvatarUrl?: string;
  role: EventRole;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  createdAt?: string;
  location?: string;
  establishedDate?: string;
  industry?: string;
  website?: string;
  bannerPath?: string;
  logoPath?: string;
  currentUserRole?: MembershipRole;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  eventId?: string;
  eventName?: string;
  active: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  repositoryUrl?: string;
  websiteUrl?: string;
  defaultBranch?: string;
  language?: string;
  avatarPath?: string;
  readmeContent?: string;
  tags?: string[];
  githubRepoId?: number;
  githubRepoFullName?: string;
  stars?: number;
  forks?: number;
}

export interface Environment {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  active: boolean;
}
export interface GitHubConfig {
  githubUsername?: string;
  githubAccessToken?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  twitterUsername?: string;
  phoneNumber?: string;
  secondaryEmail?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubAccessToken?: string;
  avatarPath?: string; // Custom uploaded avatar
}

export type MembershipRole = 'OWNER' | 'ADMIN' | 'DEVELOPER';

export interface Membership {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  organizationId: string;
  role: MembershipRole;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

export type ProjectRole = 'OWNER' | 'CONTRIBUTOR';

export interface ProjectMembership {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  projectId: string;
  role: ProjectRole;
  createdAt: string;
}

export type SkillCategory = 'LANGUAGE' | 'FRAMEWORK' | 'DEVOPS' | 'DATABASE' | 'CLOUD' | 'OTHER';
export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  iconSlug: string;
}

export interface UserSkill {
  id: string;
  skillId: string;
  name: string;
  category: string;
  iconSlug: string;
  level: ProficiencyLevel;
}

export interface PublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  githubUsername: string;
  githubAvatarUrl?: string;
  avatarPath?: string;
  bio?: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  twitterUsername?: string;
  phoneNumber?: string;
  secondaryEmail?: string;
  skills: UserSkill[];
  followerCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface FollowUser {
  id: string;
  username: string;
  githubUsername: string;
  firstName: string;
  lastName: string;
  avatarPath?: string;
  githubAvatarUrl?: string;
  bio?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  avatarUrl?: string;
  date: string;
  url: string;
}

export interface GitHubInsights {
  languages: Record<string, number>;
  branches: string[];
  defaultBranch: string;
}
