import { getApiUrl } from '../getApiUrl';

// Use centralized API URL function
const getApiBaseUrl = getApiUrl;

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: string;
  color: string;
}

interface RecentActivity {
  id: number;
  action: string;
  target: string;
  time: string;
  type: string;
}

interface DashboardData {
  stats: DashboardStat[];
  recentActivities: RecentActivity[];
  profileCompletion: number;
}

class DashboardAPI {
  async getDashboardData(token: string): Promise<DashboardData> {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  async getRecentActivities(token: string): Promise<RecentActivity[]> {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }
}

export const dashboardAPI = new DashboardAPI();
export type { DashboardData, DashboardStat, RecentActivity };
