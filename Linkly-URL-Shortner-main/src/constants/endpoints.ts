export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
  links: {
    list: '/api/links',
    byId: (id: string) => `/api/links/${id}`,
    redirect: (code: string) => `/s/${code}`,
  },
} as const;
