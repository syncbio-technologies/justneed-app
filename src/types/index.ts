// types.ts - Updated type definitions for the application

export interface UploadedFile {
  name: string;
  uri: string;
  size: number;
  mimeType?: string;
  content?: string;
}

export interface UserProfile {
  // Personal Information
  phone?: string;
  address?: string;
  profileImage?: string | null;
  linkedinUrl?: string;

  // Job Preferences
  jobTitle?: string;
  skills?: string | string[];
  preferredLocation?: string;
  preferredLocations?: string[];
  preferredJobTypes?: string[];
  jobPreferences?: string;
  yearsOfExperience?: number;
  educationLevel?: string;

  // Documents
  resume?: UploadedFile | null;
  resumeUrl?: string;
  coverLetter?: UploadedFile | null;
  coverLetterUrl?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  isRecruiter?: boolean;
  profile: UserProfile;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  notify: boolean;
  createdAt: Date | string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, isRecruiter?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, isRecruiter?: boolean) => Promise<void>;
  logout: (callback?: () => Promise<void>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile> & { firstName?: string; lastName?: string }) => Promise<void>;
}

// Job related types (if you need them)
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: Date | string;
  isBookmarked?: boolean;
  locationType?: string;
  workMode?: 'Remote' | 'On-site' | 'Hybrid';
  tags?: string[];
  experience?: string;
  experienceYears?: number;
  experienceRequired?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  applicants?: number;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected' | 'Applied' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected';
  appliedDate: Date | string;
  resume?: UploadedFile;
  coverLetter?: UploadedFile;
}