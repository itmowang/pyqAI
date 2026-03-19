import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useTheme = () => {
  const { data: theme } = useQuery({
    queryKey: ['active-theme'],
    queryFn: async () => {
      const response: any = await api.get('/themes/active');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 分钟
  });

  useEffect(() => {
    if (theme?.cssVariables) {
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value as string);
      });
    }
  }, [theme]);

  return { theme };
};
