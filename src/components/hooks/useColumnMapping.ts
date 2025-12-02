import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getColumnMapping, saveColumnMapping } from '../lib/columnMappingApi';

// Hook لإدارة إعدادات مطابقة الأعمدة لشركة معينة
export function useColumnMapping(companyId: string) {
  const queryClient = useQueryClient();

  // جلب آخر mapping محفوظ
  const {
    data: mapping,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['columnMapping', companyId],
    queryFn: () => getColumnMapping(companyId),
    enabled: !!companyId,
  });

  // حفظ mapping جديد أو تحديثه
  const mutation = useMutation({
    mutationFn: (newMapping: Record<string, string | null>) => saveColumnMapping(companyId, newMapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columnMapping', companyId] });
    },
  });

  return {
    mapping,
    isLoading,
    isError,
    refetch,
    saveMapping: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.isError,
  };
}

// مثال استخدام:
// const { mapping, saveMapping, isLoading } = useColumnMapping(companyId);
// useEffect(() => { if (mapping) setLocalMapping(mapping); }, [mapping]);
// saveMapping(newMappingObj); 