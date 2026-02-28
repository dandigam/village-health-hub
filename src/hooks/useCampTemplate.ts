import { useQuery } from '@tanstack/react-query';
import { fetchWithFallback, API_BASE_URL } from '@/services/api';
import type { CampTemplate } from '@/types';

export function useCampTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['campTemplate', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetchWithFallback<CampTemplate>(`/camp-templates/${id}`, null);
      return res.data;
    },
    enabled: !!id,
  });
}
