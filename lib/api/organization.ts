import { apiClient } from './client';

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
}

export interface CreateOrganizationResponse {
  orgUuid: string;
  name: string;
  slug: string;
}

export interface OrgMemberRow {
  userUuid: string;
  email: string;
  role: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  nextCursor: string | null;
}

export interface AddOrgMemberRequest {
  email: string;
  password: string;
  role?: string;
}

export interface AddOrgMemberResponse {
  orgUuid: string;
  userUuid: string;
  role: string;
  status: string;
}

export interface RemoveOrgMemberResponse {
  orgUuid: string;
  userUuid: string;
  status: string;
}

export const organizationApi = {
  create: (data: CreateOrganizationRequest) =>
    apiClient.post<CreateOrganizationResponse>('/api/v1/organizations', data),

  listMembers: (orgUuid: string, limit = 100, offset = 0) =>
    apiClient.get<PageResult<OrgMemberRow>>(
      `/api/v1/organizations/${orgUuid}/members?limit=${limit}&offset=${offset}`,
    ),

  addMember: (orgUuid: string, data: AddOrgMemberRequest) =>
    apiClient.post<AddOrgMemberResponse>(`/api/v1/organizations/${orgUuid}/members`, data),

  removeMember: (orgUuid: string, userUuid: string) =>
    apiClient.delete<RemoveOrgMemberResponse>(
      `/api/v1/organizations/${orgUuid}/members/${userUuid}`,
    ),
};
