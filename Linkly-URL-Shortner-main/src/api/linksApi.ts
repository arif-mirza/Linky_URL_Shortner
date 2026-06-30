import { API_ENDPOINTS } from '@/constants';
import { apiRequest } from '@/api/client';
import type { CreateLinkRequest, LinkItem, UpdateLinkRequest } from '@/types';

export const linksApi = {
  list: () => apiRequest<{ links: LinkItem[] }>(API_ENDPOINTS.links.list, { method: 'GET' }),
  create: (payload: CreateLinkRequest) =>
    apiRequest<{ link: LinkItem }>(API_ENDPOINTS.links.list, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: UpdateLinkRequest) =>
    apiRequest<{ link: LinkItem }>(API_ENDPOINTS.links.byId(id), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    apiRequest<{ id: string }>(API_ENDPOINTS.links.byId(id), { method: 'DELETE' }),
};
