 import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, Application } from '../types';
import { API_BASE } from '../config/api';
import { handleApiError, getErrorMessage } from './errorHandler';

async function getToken() {
  return await AsyncStorage.getItem('@justneed_token');
}

// Helper to make API calls with consistent error handling
async function apiCall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      await AsyncStorage.removeItem('@justneed_token');
      await AsyncStorage.removeItem('@justneed_user');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

export const jobService = {
  // Filters: location (city/municipality/region) and skills (comma-separated)
  async getJobs(filters?: { location?: string; skills?: string }): Promise<Job[]> {
    try {
      const token = await getToken();

      if (!token) {
        console.warn('[jobService] No token found, user may not be logged in');
        return [];
      }

      let url = `${API_BASE}/jobs`;

      if (filters) {
        const queryParams = new URLSearchParams();
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.skills) queryParams.append('skills', filters.skills);

        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await apiCall(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const jobs = await response.json();

      return jobs.map((job: any) => {
        const requirements: string[] = [];

        if (job.driving_license_required) requirements.push('Driving license required');
        if (job.access_to_own_car) requirements.push('Access to own car');

        if (job.requirements && Array.isArray(job.requirements)) {
          job.requirements.forEach((req: any) => {
            if (typeof req === 'string') {
              requirements.push(req);
            } else if (req && typeof req === 'object') {
              requirements.push(req.label || req.name || JSON.stringify(req));
            }
          });
        }

        if (requirements.length === 0) {
          requirements.push('See job description for requirements');
        }

        let experienceYears = null;
        if (job.description_text) {
          const yearMatches = job.description_text.match(/(\d+)\+?\s*(år|year|years)\s*(erfarenhet|experience|of experience)/gi);
          if (yearMatches && yearMatches.length > 0) {
            const match = yearMatches[0].match(/(\d+)/);
            if (match) experienceYears = parseInt(match[1]);
          }
        }

        return {
          id: job.id,
          title: job.headline || 'Untitled Position',
          company: job.employer_name || 'Company',
          location: job.municipality || job.region || 'Sweden',
          type: job.employment_type_label || 'Full-time',
          salary: job.salary_description || undefined,
          description: job.description_text || '',
          requirements,
          postedDate: job.publication_date,
          locationType: job.municipality || job.region,
          workMode: 'On-site',
          tags: job.occupation_label ? [job.occupation_label] : [],
          experienceYears,
          experienceRequired: job.experience_required || false,
          matchScore: job.match_score || 0,
          matchReasons: job.match_reasons || [],
        };
      });
    } catch (error) {
      console.error('[jobService] Error getting jobs:', getErrorMessage(error));
      return [];
    }
  },

  async getSwipedJobIds(): Promise<string[]> {
    return [];
  },

  async markJobAsSwiped(jobId: string): Promise<void> {
    try {
      const token = await getToken();
      if (!token) return;

      await apiCall(`${API_BASE}/swipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, direction: 'skip' })
      });
    } catch (error) {
      console.error('[jobService] Error marking job as swiped:', getErrorMessage(error));
    }
  },

  async applyToJob(userId: string, job: Job): Promise<void> {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await apiCall(`${API_BASE}/swipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id, direction: 'like' })
      });
    } catch (error) {
      console.error('[jobService] Error applying to job:', getErrorMessage(error));
      throw error;
    }
  },

  async applyWithSkillCard(jobId: string, jobTitle: string): Promise<{ success: boolean, message?: string }> {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await apiCall(`${API_BASE}/applications/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, jobTitle })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[jobService] Error applying with skill card:', getErrorMessage(error));
      throw error;
    }
  },

  async generateCoverLetter(jobDescription: string): Promise<{ success: boolean, text?: string, error?: string }> {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await apiCall(`${API_BASE}/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobDescription })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[jobService] Error generating cover letter:', getErrorMessage(error));
      throw error;
    }
  },

  async getApplications(userId: string): Promise<Application[]> {
    try {
      const token = await getToken();
      if (!token) return [];

      const response = await apiCall(`${API_BASE}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const apps = await response.json();
      return apps.map((app: any) => ({
        id: app.id,
        jobId: app.job_id,
        job: {
          id: app.job_id,
          title: app.headline,
          company: app.employer_name || 'Company',
          location: app.municipality || app.region || 'Sweden',
          type: app.employment_type_label || 'Full-time',
          description: app.description_text || '',
          requirements: [],
          postedDate: new Date(),
        },
        appliedDate: new Date(app.applied_at),
        status: app.status,
      }));
    } catch (error) {
      console.error('[jobService] Error getting applications:', getErrorMessage(error));
      return [];
    }
  },

  async clearSwipedJobs(): Promise<void> {
    // Not needed with backend
  },

  async addToFavourites(userId: string, job: Job): Promise<void> {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await apiCall(`${API_BASE}/saved`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id })
      });
    } catch (error) {
      console.error('[jobService] Error adding to favourites:', getErrorMessage(error));
      throw error;
    }
  },

  async removeFromFavourites(userId: string, jobId: string): Promise<void> {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await apiCall(`${API_BASE}/saved/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('[jobService] Error removing from favourites:', getErrorMessage(error));
      throw error;
    }
  },

  async getFavourites(userId: string): Promise<Job[]> {
    try {
      const token = await getToken();
      if (!token) return [];

      const response = await apiCall(`${API_BASE}/saved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const saved = await response.json();
      return saved.map((job: any) => {
        const requirements = [];
        if (job.experience_required) requirements.push('Experience required');
        if (job.driving_license_required) requirements.push('Driving license required');
        if (job.access_to_own_car) requirements.push('Access to own car');

        return {
          id: job.id,
          title: job.headline,
          company: job.employer_name || 'Company',
          location: job.municipality || job.region || 'Sweden',
          type: job.employment_type_label || 'Full-time',
          salary: job.salary_description,
          description: job.description_text || '',
          requirements,
          postedDate: new Date(job.publication_date),
        };
      });
    } catch (error) {
      console.error('[jobService] Error getting favourites:', getErrorMessage(error));
      return [];
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@justneed_token');
      await AsyncStorage.removeItem('@justneed_user');
    } catch (error) {
      console.error('[jobService] Error clearing data:', getErrorMessage(error));
    }
  },

  async getFilterOptions() {
    try {
      const token = await getToken();
      if (!token) return { municipalities: [], regions: [], employmentTypes: [], occupations: [] };

      const response = await apiCall(`${API_BASE}/jobs/filters/options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    } catch (error) {
      console.error('[jobService] Error getting filter options:', getErrorMessage(error));
      return { municipalities: [], regions: [], employmentTypes: [], occupations: [] };
    }
  },
};
