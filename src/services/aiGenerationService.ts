// services/aiGenerationService.ts
// This file contains the AI generation logic for Resume and Cover Letter
// You can integrate your AI API here

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  skills: string;
  preferredLocation: string;
  jobPreferences: string;
}

export interface GeneratedResume {
  content: string;
  format: 'pdf' | 'docx';
  url?: string;
}

export interface GeneratedCoverLetter {
  content: string;
  format: 'pdf' | 'docx';
  url?: string;
}