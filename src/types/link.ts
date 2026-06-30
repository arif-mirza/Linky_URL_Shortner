export type LinkStatus = 'Active' | 'Inactive';

export interface LinkItem {
  id: string;
  code: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  status: LinkStatus;
  createdAt: string;
  qrCodeUrl: string;
}

export interface CreateLinkRequest {
  originalUrl: string;
}

export interface UpdateLinkRequest {
  originalUrl?: string;
  status?: LinkStatus;
}
