export const API_BASE_URL = '/api';

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    DETAIL: (id: string) => `/posts/${id}`,
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
  },
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
    UPDATE: (id: string) => `/tags/${id}`,
    DELETE: (id: string) => `/tags/${id}`,
  },
  THEMES: {
    LIST: '/themes',
    ACTIVE: '/themes/active',
    UPDATE: (id: string) => `/themes/${id}`,
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_IMAGE_COUNT = 9;
