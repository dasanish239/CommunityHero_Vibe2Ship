export type IssueStatus = 'Reported' | 'Verifying' | 'Scheduled' | 'In Progress' | 'Resolved';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory = 'Roads & Sidewalks' | 'Water & Sanitation' | 'Waste Management' | 'Public Lighting' | 'Parks & Public Spaces';

export interface Comment {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  status: IssueStatus;
  message: string;
  timestamp: string;
  author: string;
  imageUrl?: string;
}

export interface CommunityIssue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  x: number; // grid percentage X coordinate
  y: number; // grid percentage Y coordinate
  reportedBy: string;
  createdAt: string;
  status: IssueStatus;
  upvotes: number;
  verifications: number;
  flags: number;
  comments: Comment[];
  timeline: TimelineEvent[];
  imageUrl?: string;
  aiCategorized?: boolean;
  aiDepartment?: string;
  aiPlan?: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  badgesCount: number;
  rank: number;
  avatarColor: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  icon: string;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  badges: string[];
}
