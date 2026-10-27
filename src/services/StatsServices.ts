import { getApiBaseUrl } from '../../api';
import { throwIfNotOk } from '../lib/apiError';
import type { Stats } from '../types/catalog';

export const StatsServices = {
  fetchStats: async (): Promise<Stats> => {
    const response = await fetch(`${getApiBaseUrl()}/stats`);
    await throwIfNotOk(response, 'Failed to fetch stats');
    return response.json() as Promise<Stats>;
  },
};
