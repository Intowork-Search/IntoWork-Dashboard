/**
 * API client for AI Scoring endpoints
 */
import { getApiUrl } from '../getApiUrl';

// Types
export interface AIScoreDetails {
  score: number;
  strengths: string[];
  weaknesses: string[];
  skills_match: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  experience_match: string;
  recommendation: string;
  error?: string;
}

export interface ApplicationWithScore {
  id: number;
  job_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  status: string;
  applied_at: string;
  ai_score?: number;
  ai_score_details?: AIScoreDetails;
  ai_analyzed_at?: string;
  cv_url?: string;
}

export interface ScoreApplicationRequest {
  application_id: number;
}

export interface ScoreApplicationResponse {
  success: boolean;
  application_id: number;
  ai_score: number;
  ai_score_details: AIScoreDetails;
  message: string;
}

export interface BulkScoreRequest {
  job_id: number;
}

export interface BulkScoreResponse {
  success: boolean;
  job_id: number;
  scored_count: number;
  failed_count: number;
  message: string;
}

export interface ScoredApplicationsListResponse {
  applications: ApplicationWithScore[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// API Client
const API_URL = getApiUrl();

export const aiScoringAPI = {
  /**
   * Score une candidature individuelle avec l'IA
   */
  async scoreApplication(
    applicationId: number,
    token: string
  ): Promise<ScoreApplicationResponse> {
    const response = await fetch(`${API_URL}/ai-scoring/score-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ application_id: applicationId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erreur lors du scoring' }));
      throw new Error(error.detail || 'Erreur lors du scoring');
    }

    return response.json();
  },

  /**
   * Score toutes les candidatures d'une offre
   */
  async scoreJobApplications(
    jobId: number,
    token: string
  ): Promise<BulkScoreResponse> {
    const response = await fetch(`${API_URL}/ai-scoring/score-job-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ job_id: jobId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erreur lors du scoring en masse' }));
      throw new Error(error.detail || 'Erreur lors du scoring en masse');
    }

    return response.json();
  },

  /**
   * Récupère les candidatures scorées d'une offre
   */
  async getScoredApplications(
    jobId: number,
    token: string,
    page: number = 1,
    limit: number = 20,
    sortByScore: boolean = true
  ): Promise<ScoredApplicationsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by_score: sortByScore.toString(),
    });

    const response = await fetch(
      `${API_URL}/ai-scoring/scored-applications/${jobId}?${params}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erreur lors de la récupération' }));
      throw new Error(error.detail || 'Erreur lors de la récupération des candidatures');
    }

    return response.json();
  },
};
