import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export async function apiRequest(method: string, url: string, data?: any) {
  // Mock data based on URL
  if (url.includes('/api/campaigns')) {
    return Promise.resolve({
      campaigns: [],
      total: 0
    });
  }
  if (url.includes('/api/leads')) {
    return Promise.resolve({
      leads: [],
      total: 0
    });
  }
  if (url.includes('/api/stats')) {
    return Promise.resolve({
      leads: { total: 0, new: 0, converted: 0, byStatus: {}, bySource: {} },
      properties: { total: 0, available: 0, byStatus: {}, byType: {}, byLocation: {} },
      tasks: { total: 0, completed: 0 },
      campaigns: { active: 0 },
      appointments: { today: 0 },
      projects: { total: 0 }
    });
  }
  return Promise.resolve({});
}