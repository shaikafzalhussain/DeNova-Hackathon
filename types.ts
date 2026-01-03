
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER'
}

export interface User {
  email: string;
  role: UserRole;
  password?: string;
}

export interface Job {
  id: string;
  title: string;
  role: 'Cloud' | 'DevOps' | 'Support';
  skills: string[];
  description: string;
  postedBy: string;
  createdAt: number;
}

export interface Application {
  id: string;
  jobId: string;
  candidateEmail: string;
  resumeHash: string;
  aiScore: number;
  status: 'Pending' | 'Verified';
  timestamp: number;
  analysis: ResumeAnalysis;
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  risk_flags: string[];
  role_relevance: string;
  experience_level: string;
}

export interface VerificationRecord {
  resume_hash: string;
  ai_score: number;
  wallet_address: string;
  timestamp: number;
  signature: string;
  details: ResumeAnalysis;
}

export enum AppRoute {
  LANDING = 'landing',
  LOGIN = 'login',
  CANDIDATE_DASHBOARD = 'candidate_dashboard',
  RECRUITER_DASHBOARD = 'recruiter_dashboard',
  APPLY = 'apply',
  POST_JOB = 'post_job'
}
